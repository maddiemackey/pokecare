import { useState } from "react";
import type { Pokemon } from "../../types/Pokemon";
import PokemonSprite from "./SpriteImage";
import './Sprite.css';

export default function InteractiveSprite({ pokemon }: { pokemon: Pokemon | null }) {
  const [jiggling, setJiggling] = useState(false);

  const playCry = async () => {
    if (!pokemon?.species) return;
    if (pokemon?.cry) {
        const audio = new Audio(pokemon.cry);
        audio.play();
    }
  };

  const handleClick = () => {
    setJiggling(true);
    playCry();

    // Automatically stop jiggle after 1.2s (or match to your animation duration)
    setTimeout(() => setJiggling(false), 1200);
  };

  return (
    <div
      className={`sprite-container ${jiggling ? "jiggle" : ""}`}
      onClick={handleClick}
    >
      <PokemonSprite
        name={pokemon?.species}
        style={{ width: 150, height: 150, imageRendering: "pixelated" }}
      />
    </div>
  );
}
