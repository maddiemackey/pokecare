import { supabase } from "../../../supabase/supabaseClient";
import type { User } from "@supabase/supabase-js";

export default function LogoutButton({
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  return (
    <div style={{ textAlign: "center" }}>
      <button
        onClick={handleLogout}
        style={{
          padding: "2px 16px 4px 16px",
          borderRadius: 6,
          border: "none",
          background: "#ef4444",
          color: "white",
          cursor: "pointer",
        }}
      >
        Log Out
      </button>
    </div>
  );
}
