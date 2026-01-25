import { useState } from "react";
import { SquareUserRound } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import './UserMenu.css';

export default function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const [renderMenu, setRenderMenu] = useState(false);

  const toggleMenu = () => {
    if (open) {
      // Close menu with animation delay
      setOpen(false);
      setTimeout(() => setRenderMenu(false), 250);
    } else {
      setRenderMenu(true);
      setOpen(true);
    }
  };

  return (
    <div className="user-menu-container">
    {/* User Button */}
    <button
        className={`user-menu-button ${open ? "open" : ""}`}
        onClick={toggleMenu}
        >
        <SquareUserRound size={30} />
    </button>

    {/* Dropdown Menu */}
    {renderMenu && (
    <div className={`user-menu-dropdown ${open ? "slide-down" : "slide-up"}`}>
        <p>{user.user_metadata.display_name}</p>
    </div>
    )}
    </div>
  );
}
