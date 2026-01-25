import { useState, useEffect } from "react";
import './app/styles/App.css'

import { supabase } from "./supabase/supabaseClient";
import UserAuthentification from "./app/components/authentification/userAuthentification";
import type { Session, User } from "@supabase/supabase-js";

import Background from "./app/components/background";
import PokemonSprite from "./app/components/sprite";
import SettingsMenu from "./app/components/settings/SettingsMenu";
import XPBar from "./app/components/xp/XPBar";
import UserMenu from "./app/components/user/UserMenu";

type Pokemon = {
  id: string;
  nickname: string;
  species: string;
  current_xp: number;
};


export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);

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
      setPokemon(null);
      return;
    }

    const fetchPokemon = async () => {
      const { data, error } = await supabase
        .from("user_pokemon")
        .select("id, nickname, species, current_xp")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching Pokémon:", error);
      } else {
        setPokemon(data);
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
          event: "UPDATE",
          schema: "public",
          table: "user_pokemon",
          filter: `user_id=eq.${user.id}`,
        },
        payload => setPokemon(payload.new as Pokemon)
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

  return (
    <div className="app-container">
      {/* Fullscreen background */}
      <Background location="hills" className="background" />

        {/* Sprite always centered */}
        <div className="sprite-container">
          <PokemonSprite name="shinx" style={{ width: 150, height: 150 }} />
        </div>

      <div className="content-container">
        {/* Heading container: XP + Settings */}
        <div className="heading-container">
          <div className="user-wrapper">
            <UserMenu user={user}/>
          </div>
          <div className="xp-bar-wrapper">
            <XPBar pokemon={pokemon} />
            <div className="pokemon-nickname">
              <p>{pokemon?.nickname}</p>
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