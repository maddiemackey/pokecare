import { useEffect, useState } from "react";
import "./Onboarding.css";
import Dialog from "../dialog/Dialog";

export default function Onboarding({ }: { }) {
  const dialogLines = [
    "Welcome to the world of PokéCare!",
    "My name is Professor Oak.",
    "In this world, Pokémon help us grow and care for each other.",
    "First, you need to choose your very first Pokémon!"
  ];

  const [dialogIndex, setDialogIndex] = useState(0);

  const nextDialog = () => {
    if (dialogIndex < dialogLines.length - 1) {
      setDialogIndex((i) => i + 1);
    } else {
      console.log("Onboarding finished!");
      // 👉 Later: mark onboarding complete in DB
    }
  };

  // Listen for Enter key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        nextDialog();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dialogIndex]);

  return (
    <div style={{ textAlign: "center" }}>
      <img
        className="character-image fade-in"
        src="/assets/characters/Professor_Oak.png"
        alt="Professor Oak"
      />

      <Dialog
        message={dialogLines[dialogIndex]}
        onComplete={() => nextDialog()}
      />
    </div>
  );
}
