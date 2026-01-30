import { useState } from "react";
import type { Pokemon } from "../../types/Pokemon";
import PokemonSprite from "./SpriteImage";
import './Sprite.css';

export default function InteractiveSprite({ pokemon }: { pokemon: Pokemon | null }) {
    const [jiggling, setJiggling] = useState(false);

    return (
    <div
        className={`sprite-container ${jiggling ? "jiggle" : ""}`}
        onClick={() => {
            setJiggling(true);
            setTimeout(() => setJiggling(false), 1200);
        }}
        >
        <PokemonSprite
            name={pokemon?.species}
            style={{ width: 150, height: 150, imageRendering: "pixelated" }}
        />
        </div>
    )
}