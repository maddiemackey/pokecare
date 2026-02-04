import type { Pokemon } from "../../types/Pokemon";
import './PartySelect.css';

export default function PartySelect({ userPokemon, activePokemonIndex, setActivePokemonIndex }: { userPokemon: Pokemon[]; activePokemonIndex: number | null; setActivePokemonIndex: (index: number) => void }) {
    return (
        <div className="party-select">
            {userPokemon.map((pokemon) => (
                <div
                    key={pokemon.id}
                    className={`party-pokemon ${activePokemonIndex !== null && userPokemon[activePokemonIndex]?.id === pokemon.id ? "active" : ""}`}
                    onClick={() => setActivePokemonIndex(userPokemon.findIndex(p => p.id === pokemon.id))}
                >
                    <img
                        src={pokemon.smallSprite || undefined}
                        alt={pokemon.nickname}
                        style={{ width: 50, height: 50, imageRendering: "pixelated" }}
                    />
                </div>
            ))}
        </div>
    );
}