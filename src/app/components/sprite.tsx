import { useEffect, useState, type CSSProperties } from "react";

export default function PokemonSprite({
  name,
  style,
}: {
  name: string | undefined;
  style?: CSSProperties;
}) {
  const [sprite, setSprite] = useState(null);
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
        // Try to get animated sprite for Black & White
        const animated =
          data.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_default;

        if (animated) {
          setSprite(animated);
        } else {
          // fallback to default front sprite
          setSprite(data.sprites.front_default);
        }
      })
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return <p>Loading...</p>;
  if (error || !sprite) return <p>Could not load Pokémon.</p>;

  return <img src={sprite} alt={name} style={style} />;
}
