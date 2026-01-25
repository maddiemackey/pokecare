import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import Login from "./Login";
import Signup from "./SignUp";

export default function AuthContainer({ onLogin }: { onLogin: (user: User) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [prefillEmail, setPrefillEmail] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleSignupSuccess = (email: string) => {
    setPrefillEmail(email);
    setInfoMessage("Check your email to confirm signup!");
    setMode("login");
  };

  return (
    <div style={{ maxWidth: 320, margin: "auto", textAlign: "center" }}>
      <h2>{mode === "login" ? "Login" : "Sign Up"}</h2>

      {mode === "login" ? (
        <Login
          onLogin={onLogin}
          prefillEmail={prefillEmail}
          infoMessage={infoMessage}
        />
      ) : (
        <Signup onSignupSuccess={handleSignupSuccess} />
      )}

      <p style={{ marginTop: 15 }}>
        {mode === "login" ? "No account?" : "Already have an account?"}
        <button
          onClick={() => {
            setInfoMessage("");
            setMode(mode === "login" ? "signup" : "login");
          }}
          style={{
            marginLeft: 6,
            border: "none",
            background: "none",
            color: "#4f46e5",
            cursor: "pointer",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          {mode === "login" ? "Sign up" : "Login"}
        </button>
      </p>
    </div>
  );
}
