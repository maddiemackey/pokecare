import { useState } from "react";
import { supabase } from "../../../supabase/supabaseClient";

export default function Signup({
  onSignupSuccess,
}: {
  onSignupSuccess: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setError("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: username } },
    });

    if (error) setError(error.message);
    else onSignupSuccess(email);
  };

  return (
    <>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={e => setUsername(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <button onClick={handleSignup} style={{ width: "100%" }}>
        Sign Up
      </button>

      {error && <p style={{ color: "red", marginTop: 10 }}>{error}</p>}
    </>
  );
}
