import { useState } from "react";
import { Settings, Volume2, VolumeOff } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import LogoutButton from "../authentification/LogoutButton";
import './SettingsMenu.css';

export default function SettingsMenu({
  user,
  onLogout,
  volume,
  setVolume,
  muted,
  setMuted,
}: {
  user: User;
  onLogout: () => void;
  volume: number;
  setVolume: (volume: number) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
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
    <div className="settings-menu" style={{ position: "relative", display: "inline-block" }}>
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
          <div className="settings-label"><label>Logged in as {user.user_metadata.display_name}</label></div>
          <LogoutButton user={user} onLogout={onLogout} />
          { /* Volume Slider */ }
          <div className="settings-label"><label className="settings-label" htmlFor="volume-slider">Volume</label></div>
          <div className="volume-container">
            <button className="volume-button" onClick={() => setMuted(!muted)}>{muted || volume == 0 ? <VolumeOff/> : <Volume2/>}</button>
            <input type="range" min="0" max="1" step="0.02" defaultValue="0.5" value={volume} onChange={event => {
              setVolume(event.target.valueAsNumber);
              if (event.target.valueAsNumber > 0 && muted) {
                setMuted(false);
              }
            }}/>
          </div>
        </div>
      )}
    </div>
  );
}
