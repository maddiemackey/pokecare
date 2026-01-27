import { useState, useEffect } from "react";
import './app/styles/App.css'

import { supabase } from "./supabase/supabaseClient";
import UserAuthentification from "./app/components/authentification/userAuthentification";
import type { Session, User } from "@supabase/supabase-js";

import type { Pokemon } from "./app/types/Pokemon";

import Background from "./app/components/background";
import PokemonSprite from "./app/components/sprite";
import SettingsMenu from "./app/components/settings/SettingsMenu";
import XPBar from "./app/components/xp/XPBar";
import UserMenu from "./app/components/user/UserMenu";
import Onboarding from "./app/components/onboarding/Onboarding";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userPokemon, setUserPokemon] = useState<Pokemon[]>([]);
  const addPokemonToState = (pokemon: Pokemon) => {
    setUserPokemon(prev => [...prev, pokemon]);
  };
  const activePokemon = userPokemon[0] ?? null;
  const [jiggling, setJiggling] = useState(false);

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listen for auth changes (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
  if (!user) {
    setUserPokemon([]);
    return;
  }

  const fetchPokemon = async () => {
    const { data, error } = await supabase
      .from("user_pokemon")
      .select("id, nickname, species, current_xp")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching Pokémon:", error);
    } else {
      setUserPokemon(data ?? []);
      setLoading(false);
    }
  };

  fetchPokemon();
}, [user]);


  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("pokemon-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_pokemon",
          filter: `user_id=eq.${user.id}`,
        },
        payload => {
          const newPokemon = payload.new as Pokemon;

          setUserPokemon(prev => {
            const exists = prev.find(p => p.id === newPokemon.id);
            if (exists) {
              return prev.map(p => (p.id === newPokemon.id ? newPokemon : p));
            }
            return [...prev, newPokemon];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  if (!user) return (
    <div className="app-container">
      <UserAuthentification onLogin={setUser} />
    </div>
  );

  if (loading) {
    return (
      <div className="app-container">
        <p>Loading...</p>
      </div>
    );
  }

  else if (userPokemon.length === 0) {
    return (
      <div className="app-container">
        <Onboarding user={user} onPokemonAdded={addPokemonToState} />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Fullscreen background */}
      <Background location="hills" className="background" />

        {/* Sprite always centered */}
        <div
          className={`sprite-container ${jiggling ? "jiggle" : ""}`}
          onClick={() => {
            setJiggling(true);
            setTimeout(() => setJiggling(false), 1200);
          }}
        >
          <PokemonSprite
            name={activePokemon?.species}
            style={{ width: 150, height: 150, imageRendering: "pixelated" }}
          />
        </div>

      <div className="content-container">
        {/* Heading container: XP + Settings */}
        <div className="heading-container">
          <div className="user-wrapper">
            <UserMenu user={user}/>
          </div>
          <div className="xp-bar-wrapper">
            <XPBar pokemon={activePokemon} />
            <div className="pokemon-nickname">
              <p>{activePokemon?.nickname}</p>
              </div>
          </div>
          <div className="settings-wrapper">
            <SettingsMenu user={user} onLogout={() => setUser(null)} />
          </div>
        </div>

        {/* Middle content: ToDoList on right */}
        <div className="todo-wrapper">
          {/* <ToDoList /> */}
        </div>

        {/* Bottom stats bar */}
        <div className="stats-container">
          {/* <Stats /> */}
        </div>
      </div>
    </div>
  );
}