export type Pokemon = {
  sprite: string | null;
  smallSprite: string | null;
  cry: string | null;
};

export async function getPokemonData(speciesName: string): Promise<Pokemon> {
  if (!speciesName) {
    return { sprite: null, smallSprite: null,cry: null };
  }

  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${speciesName.toLowerCase()}`
    );

    if (!res.ok) {
      throw new Error("Pokémon not found");
    }

    const data = await res.json();

    // 🎞 Prefer animated Gen 5 sprite (your existing logic)
    const animatedSprite =
      data.sprites?.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default;

    const defaultSprite = data.sprites?.front_default;

    // Pokemon Thumbnail 
    const smallSprite = data.sprites?.versions?.["generation-vii"]?.["icons"]?.front_default;

    // 🔊 Cry URLs from PokeAPI cries repo
    const cryLatest: string | undefined = data.cries?.latest;
    const cryLegacy: string | undefined = data.cries?.legacy;

    return {
      sprite: animatedSprite ?? defaultSprite ?? null,
      smallSprite: smallSprite ?? null,
      cry: cryLatest ?? cryLegacy ?? null,
    };
  } catch (err) {
    console.debug("Failed to fetch Pokémon media:", speciesName, err);
    return { sprite: null, smallSprite: null, cry: null };
  }
}
