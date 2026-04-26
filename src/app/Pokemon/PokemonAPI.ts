export type Pokemon = {
  sprite: string | null;
  smallSprite: string | null;
  cry: string | null;
  height: number | null;
  evolution: EvolutionOption[] | null;
};

export type EvolutionDetail = {
  trigger: string | null;
  minLevel: number | null;
  item: string | null;
  heldItem: string | null;
  knownMove: string | null;
  location: string | null;
  timeOfDay: string | null;
  gender: number | null;
  minHappiness: number | null;
  minBeauty: number | null;
  minAffection: number | null;
  needsOverworldRain: boolean | null;
  relativePhysicalStats: number | null;
  partySpecies: string | null;
  partyType: string | null;
  tradeSpecies: string | null;
  turnUpsideDown: boolean | null;
};

export type EvolutionOption = {
  speciesName: string;
  details: EvolutionDetail[];
};

export async function getPokemonData(speciesName: string): Promise<Pokemon> {
  if (!speciesName) {
    return { sprite: null, smallSprite: null, cry: null, height: null, evolution: null };
  }

  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${speciesName.toLowerCase()}`
    );

    if (!res.ok) {
      throw new Error("Pokémon not found");
    }

    const data = await res.json();

    const animatedSprite =
      data.sprites?.versions?.["generation-v"]?.["black-white"]?.animated
        ?.front_default;

    const defaultSprite = data.sprites?.front_default;

    const smallSprite = data.sprites?.versions?.["generation-vii"]?.["icons"]?.front_default;

    const cryLatest: string | undefined = data.cries?.latest;
    const cryLegacy: string | undefined = data.cries?.legacy;

    const height = Math.round(data.height * 10);

    const evolution = await getEvolutionInfo(speciesName);

    return {
      sprite: animatedSprite ?? defaultSprite ?? null,
      smallSprite: smallSprite ?? defaultSprite ?? null,
      cry: cryLatest ?? cryLegacy ?? null,
      height: height ?? null,
      evolution,
    };
  } catch (err) {
    console.debug("Failed to fetch Pokémon media:", speciesName, err);
    return { sprite: null, smallSprite: null, cry: null, height: null, evolution: null };
  }
}

function mapEvolutionDetail(detail: any): EvolutionDetail {
  return {
    trigger: detail.trigger?.name ?? null,
    minLevel: detail.min_level ?? null,
    item: detail.item?.name ?? null,
    heldItem: detail.held_item?.name ?? null,
    knownMove: detail.known_move?.name ?? null,
    location: detail.location?.name ?? null,
    timeOfDay: detail.time_of_day || null,
    gender: detail.gender ?? null,
    minHappiness: detail.min_happiness ?? null,
    minBeauty: detail.min_beauty ?? null,
    minAffection: detail.min_affection ?? null,
    needsOverworldRain: detail.needs_overworld_rain ?? null,
    relativePhysicalStats: detail.relative_physical_stats ?? null,
    partySpecies: detail.party_species?.name ?? null,
    partyType: detail.party_type?.name ?? null,
    tradeSpecies: detail.trade_species?.name ?? null,
    turnUpsideDown: detail.turn_upside_down ?? null,
  };
}

async function getEvolutionInfo(speciesName: string): Promise<EvolutionOption[] | null> {
  const speciesRes = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${speciesName.toLowerCase()}`
  );

  if (!speciesRes.ok) return null;

  const species = await speciesRes.json();
  const chainRes = await fetch(species.evolution_chain.url);

  if (!chainRes.ok) return null;

  const { chain } = await chainRes.json();

  function findNode(node: any, target: string): any {
    if (node.species.name === target) return node;
    for (const next of node.evolves_to) {
      const found = findNode(next, target);
      if (found) return found;
    }
    return null;
  }

  const node = findNode(chain, speciesName.toLowerCase());
  if (!node || !node.evolves_to?.length) return null;

  return node.evolves_to.map((evo: any) => ({
    speciesName: evo.species.name,
    details: (evo.evolution_details ?? []).map(mapEvolutionDetail),
  }));
}
