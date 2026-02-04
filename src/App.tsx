import { useState, useEffect } from "react";
import './app/styles/App.css'

import { supabase } from "./supabase/supabaseClient";
import UserAuthentification from "./app/components/authentification/userAuthentification";
import type { Session, User } from "@supabase/supabase-js";

import type { Pokemon } from "./app/types/Pokemon";

import Background from "./app/components/background";
import SettingsMenu from "./app/components/settings/SettingsMenu";
import XPBar from "./app/components/xp/XPBar";
import UserMenu from "./app/components/user/UserMenu";
import Onboarding from "./app/components/onboarding/Onboarding";
import InteractiveSprite from "./app/components/sprite/InteractiveSprite";
import { getPokemonData } from "./app/Pokemon/PokemonAPI";
import PartySelect from "./app/components/party/PartySelect";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userPokemon, setUserPokemon] = useState<Pokemon[]>([]);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("volume");
    return saved ? parseFloat(saved) : 0.5;
  });
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem("muted");
    return saved ? JSON.parse(saved) : false;
  });
  const [activePokemonIndex, setActivePokemonIndex] = useState<number | null>(0);
  
  const addPokemonToState = (pokemon: Pokemon) => {
    setUserPokemon(prev => [...prev, pokemon]);
  };

  // Save volume to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("volume", volume.toString());
  }, [volume]);

  // Save muted to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("muted", JSON.stringify(muted));
  }, [muted]);

  // Save activePokemon to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("activePokemonIndex", JSON.stringify(activePokemonIndex));
  }, [activePokemonIndex]);

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
      setUserPokemon(prev => {
        const map = new Map(prev.map(p => [p.id, p]));

        (data ?? []).forEach(dbPoke => {
          const existing = map.get(dbPoke.id);
          map.set(dbPoke.id, { ...dbPoke, ...existing }); // keep sprite/cry if present
        });

        return Array.from(map.values());
      });
      setLoading(false);
    }
  };

  fetchPokemon();
}, [user]);

useEffect(() => {
    if (userPokemon.length === 0) return;

    const loadMedia = async () => {
      const updated = await Promise.all(
        userPokemon.map(async (p) => {
          // Skip if already loaded
          if (p.sprite && p.cry) return p;

          const { sprite, smallSprite, cry } = await getPokemonData(p.species);

          return { ...p, sprite, smallSprite, cry };
        })
      );

      setUserPokemon(updated);
    };

    loadMedia();
  }, [userPokemon.length]);


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
              return prev.map(p =>
                p.id === newPokemon.id
                  ? { ...p, ...newPokemon } // keep sprite/cry
                  : p
              );
            }

            // 🔹 New Pokémon → fetch its media
            getPokemonData(newPokemon.species).then(({ sprite, cry }) => {
              setUserPokemon(current =>
                current.map(p =>
                  p.id === newPokemon.id ? { ...p, sprite, cry } : p
                )
              );
            });

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

      {/* Sprite */}
      <InteractiveSprite pokemon={userPokemon[activePokemonIndex || 0]} volume={volume} muted={muted} />

      <div className="content-container">
        {/* Heading container: XP + Settings */}
        <div className="heading-container">
          <div className="user-wrapper">
            <UserMenu user={user}/>
          </div>
          <div className="xp-bar-wrapper">
            <XPBar pokemon={userPokemon[activePokemonIndex || 0]} />
            <div className="pokemon-nickname">
              <p>{userPokemon[activePokemonIndex || 0]?.nickname}</p>
              </div>
          </div>
          <div className="settings-wrapper">
            <SettingsMenu user={user} onLogout={() => setUser(null)} volume={volume} setVolume={setVolume} muted={muted} setMuted={setMuted} />
          </div>
        </div>

        {/* Middle content: ToDoList on right */}
        <div className="todo-wrapper">
          {/* <ToDoList /> */}
        </div>

        {/* Bottom stats bar */}
        <div className="stats-container">
          <div className="party-select-container">
            <PartySelect userPokemon={userPokemon} activePokemonIndex={activePokemonIndex} setActivePokemonIndex={setActivePokemonIndex} />
          </div>
          {/* <Stats /> */}
        </div>
      </div>
    </div>
  );
}