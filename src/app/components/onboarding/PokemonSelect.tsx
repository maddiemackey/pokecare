import { useEffect, useState, useMemo } from "react";
import PokemonSprite from "../sprite";
import "./PokemonSelect.css";
import { supabase } from "../../../supabase/supabaseClient";
import type { User } from "@supabase/supabase-js";

import type { Pokemon } from "../../types/Pokemon";

type PokemonListItem = {
  name: string;
  url: string;
};

export default function PokemonSelect({
  user,
  onPokemonAdded,
}: {
  user: User;
  onPokemonAdded: (pokemon: Pokemon) => void;
}) {
  const [allPokemon, setAllPokemon] = useState<PokemonListItem[]>([]);
  const [basePokemon, setBasePokemon] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState<string | null>(null);

  // 🔹 Load Pokémon list
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1010")
      .then((res) => res.json())
      .then((data) => setAllPokemon(data.results))
      .finally(() => setLoading(false));
  }, []);

    useEffect(() => {
    if (allPokemon.length === 0) return;

    const fetchBaseForms = async () => {
        const baseSet = new Set<string>();

        await Promise.all(
        allPokemon.map(async (pokemon) => {
            try {
            const speciesRes = await fetch(
                `https://pokeapi.co/api/v2/pokemon-species/${pokemon.name}`
            );
            if (!speciesRes.ok) return;
            const species = await speciesRes.json();

            // ❌ Exclude legendaries & mythicals
            if (species.is_legendary || species.is_mythical) return;

            // ❌ Exclude Paradox Pokémon (name-based, more reliable)
            const paradoxPatterns = [
                "flutter-mane",
                "iron-bundle",
                "iron-hands",
                "iron-jugulis",
                "iron-moth",
                "iron-thorns",
                "iron-valiant",
                "wo-chien",
                "chien-pao",
                "ting-lu",
                "chi-yu",
                "roaring-moon",
                "iron-leaves",
                "walking-wake",
                "iron-treads",
                "baxcalibur",
                "slither-wing",
                "sandy-shocks",
                "cream-elek",
                "sus-b",
                // add any other paradox Pokémon names here
            ];
            if (paradoxPatterns.some((p) => pokemon.name.includes(p))) return;

            // ❌ Only default variety
            const defaultVariety = species.varieties.find((v: any) => v.is_default);
            if (!defaultVariety || defaultVariety.pokemon.name !== pokemon.name) return;

            // ❌ Only first in evolution chain
            const evoRes = await fetch(species.evolution_chain.url);
            if (!evoRes.ok) return;
            const evoData = await evoRes.json();
            const baseName = evoData.chain.species.name;
            if (baseName !== pokemon.name) return;

            // ❌ Name-based form filters
            const bannedPatterns = [
                "-mega",
                "-gmax",
                "-alola",
                "-galar",
                "-hisui",
                "-paldea",
                "-totem",
                "-therian",
                "-origin",
                "-primal",
                "-school",
                "-busted",
                "-disguised",
            ];
            if (bannedPatterns.some((p) => pokemon.name.includes(p))) return;

            baseSet.add(pokemon.name);
            } catch {
            // quietly ignore all errors
            }
        })
        );

        setBasePokemon(baseSet);
    };

    fetchBaseForms();
    }, [allPokemon]);


  // 🔹 Filter + rank matches (ONLY base Pokémon)
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    return allPokemon
      .filter((p) => basePokemon.has(p.name))
      .map((p) => {
        const name = p.name;
        let score = 0;

        if (name === q) score = 3;
        else if (name.startsWith(q)) score = 2;
        else if (name.includes(q)) score = 1;

        return { name, score };
      })
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 12);
  }, [query, allPokemon, basePokemon]);

    const confirmSelection = async () => {
    if (!selectedPokemon || !user) return;

    const nickname =
        selectedPokemon.charAt(0).toUpperCase() + selectedPokemon.slice(1);

    const { data, error } = await supabase
        .from("user_pokemon")
        .insert([
        {
            user_id: user.id,
            species: selectedPokemon,
            nickname,
            current_xp: 0,
        },
        ])
        .select()
        .single();

    if (error) {
        console.error("Error adding Pokémon:", error);
    } else if (data) {
        onPokemonAdded(data);
        setSelectedPokemon(null);
    }
    };

  const cancelSelection = () => {
    setSelectedPokemon(null);
  };

  return (
    <section className="pokemon-search" aria-labelledby="pokemon-search-heading">
      <h2 id="pokemon-search-heading" className="sr-only">
        Search for a Pokémon
      </h2>

      {/* 🔹 Confirmation Modal */}
      {selectedPokemon && (
        <div
          className="confirmation-overlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            // close if clicked outside the modal box
            if ((e.target as HTMLElement).classList.contains("confirmation-overlay")) {
              cancelSelection();
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancelSelection();
          }}
          tabIndex={-1} // makes div focusable for key events
        >
          <div className="confirmation-box" tabIndex={0}>
            <div className="confirmation-pokemon">
              <PokemonSprite name={selectedPokemon} width="8rem" height="8rem" />
            </div>
            <p className="confirmation-text">
              Do you choose{" "}
              <strong>
                {selectedPokemon.charAt(0).toUpperCase() +
                  selectedPokemon.slice(1)}
              </strong>
              ?
            </p>
            <div className="confirmation-buttons">
              <button className="confirm-btn yes" onClick={confirmSelection}>
                Yes
              </button>
              <button className="confirm-btn no" onClick={cancelSelection}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔹 Search Bar */}
      <div className="search-bar-wrapper">
        <label htmlFor="pokemon-search-input" className="search-label">
          Choose Your Pokémon:
        </label>
        <input
          id="pokemon-search-input"
          type="search"
          placeholder="e.g. Pikachu"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="search-input"
        />
        <p style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}>
          (Unevolved Pokémon only)
        </p>
      </div>

      {loading && <p role="status">Loading Pokémon list…</p>}

      {!loading && query && results.length === 0 && (
        <p role="status">No base-form Pokémon found.</p>
      )}

      <ul className="results-grid" role="list">
        {results.map((pokemon) => (
          <li key={pokemon.name} className="result-card">
            <button
              type="button"
              className="pokemon-button"
              aria-label={`Select ${pokemon.name}`}
              onClick={() => setSelectedPokemon(pokemon.name)}
            >
              <PokemonSprite name={pokemon.name} width="8rem" height="8rem" />
              <span className="pokemon-name">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
