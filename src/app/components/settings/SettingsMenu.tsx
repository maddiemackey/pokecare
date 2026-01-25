import { useState } from "react";
import { Settings } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import LogoutButton from "../userAuthentification/LogoutButton";

export default function SettingsMenu({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [renderMenu, setRenderMenu] = useState(false);
  const [spinning, setSpinning] = useState<"cw" | "ccw" | null>(null);

  const toggleMenu = () => {
    if (open) {
      setSpinning("ccw");
      setOpen(false);
      setTimeout(() => {
        setRenderMenu(false);
        setSpinning(null);
      }, 250);
    } else {
      setSpinning("cw");
      setRenderMenu(true);
      setOpen(true);
      setTimeout(() => setSpinning(null), 250);
    }
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Gear Button */}
      <button
        onClick={toggleMenu}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 6,
        }}
      >
        <Settings
          size={24}
          className={
            spinning === "cw"
              ? "spin-cw"
              : spinning === "ccw"
              ? "spin-ccw"
              : ""
          }
        />
      </button>

      {/* Animated Dropdown */}
      {renderMenu && (
        <div
          className={open ? "menu-slide-down" : "menu-slide-up"}
          style={{
            position: "absolute",
            right: 0,
            background: "white",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            padding: 16,
            minWidth: 200,
            zIndex: 100,
          }}
        >
          <LogoutButton user={user} onLogout={onLogout} />
        </div>
      )}
    </div>
  );
}
