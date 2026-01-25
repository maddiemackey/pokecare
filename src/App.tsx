import { useState, useEffect } from "react";
import './app/styles/App.css'

import { supabase } from "./supabase/supabaseClient";
import UserAuthentification from "./app/components/userAuthentification/userAuthentification";
import type { Session, User } from "@supabase/supabase-js";

import Background from "./app/components/background";
import PokemonSprite from "./app/components/sprite";
import SettingsMenu from "./app/components/settings/SettingsMenu";

export default function App() {
  const [user, setUser] = useState<User | null>(null);

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

  if (!user) return (
    <div className="app-container">
      <UserAuthentification onLogin={setUser} />
    </div>
  );

  return (
    <div className="app-container">
      <div className="app-container">
        <Background location="hills"/>
       <div className="content-container">
        <PokemonSprite name="bulbasaur" style={{ width: "150px", height: "150px" }} />
        </div>
        <div style={{ position: "absolute", top: 20, right: 20 }}>
        <SettingsMenu user={user} onLogout={() => setUser(null)} />
      </div>
      </div>
      
    </div>
  );
}