import { useEffect, useState } from "react";
import "./Onboarding.css";
import Dialog from "../dialog/Dialog";
import PokemonSelect from "./PokemonSelect";
import type { User } from "@supabase/supabase-js";
import type { Pokemon } from "../../types/Pokemon";

export default function Onboarding({
  user,
  onPokemonAdded,
}: {
  user: User;
  onPokemonAdded: (pokemon: Pokemon) => void;
}) {
  const dialogLines = [
    "Welcome to the world of PokéCare!",
    "In this world, Pokémon help us grow and care for each other.",
    "First, you need to choose your very first Pokémon!"
  ];

  const [dialogIndex, setDialogIndex] = useState(0);
  const [pokemonSelect, setPokemonSelect] = useState(false);

  const nextDialog = () => {
    if (dialogIndex < dialogLines.length - 1) {
      setDialogIndex((i) => i + 1);
    } else {
      setPokemonSelect(true);
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
    <div className="onboard-container">
      {!pokemonSelect && (
      <div>
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
      )}
      {pokemonSelect && (
        <PokemonSelect user={user} onPokemonAdded={onPokemonAdded} />
      )}
    </div>
  );
}
