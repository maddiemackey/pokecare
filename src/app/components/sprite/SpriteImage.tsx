import { useEffect, useState, type CSSProperties } from "react";

export default function PokemonSprite({
  name,
  style,
  width = "120px",
  height = "120px",
}: {
  name: string | undefined;
  style?: CSSProperties;
  width?: string;
  height?: string;
}) {
  const [sprite, setSprite] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!name) return;

    setLoading(true);
    setError(false);

    fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Pokemon not found");
        return res.json();
      })
      .then((data) => {
        const animated =
          data.sprites.versions?.["generation-v"]?.["black-white"]?.animated
            ?.front_default;
        setSprite(animated ?? data.sprites.front_default);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return <p>Loading...</p>;
  if (error || !sprite) return <p>Could not load Pokémon.</p>;

  return (
    <img
      src={sprite}
      alt={name}
      style={{
        width,
        height,
        imageRendering: "pixelated",
        objectFit: "contain",
        display: "block",
        ...style,
      }}
    />
  );
}
