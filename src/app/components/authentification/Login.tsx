import { useState, useEffect } from "react";
import { supabase } from "../../../supabase/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function Login({
  onLogin,
  prefillEmail,
  infoMessage,
}: {
  onLogin: (user: User) => void;
  prefillEmail?: string;
  infoMessage?: string;
}) {
  const [email, setEmail] = useState(prefillEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Update email if container changes it
  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  const handleLogin = async () => {
    setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    else if (data.user) onLogin(data.user);
  };

  return (
    <>
      {infoMessage && (
        <p style={{ color: "green", marginBottom: 10 }}>{infoMessage}</p>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button onClick={handleLogin} style={{ width: "100%" }}>
        Login
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </>
  );
}
