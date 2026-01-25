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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: open
        ? "rgba(0, 0, 0, 0.65)"
        : "rgba(0, 0, 0, 0.35)",
        color: open ? "#FFD700" : "#ffffff",
        border: "1px solid rgba(255, 255, 255, 0.4)",
        borderRadius: 8,
        padding: "6px 6px",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        transition: "all 0.2s ease-in-out",
    }}
    >
    <Settings
        size={30}
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
