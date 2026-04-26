import type { EvolutionOption } from "../Pokemon/PokemonAPI";

export type Pokemon = {
  id: string;
  nickname: string;
  species: string;
  current_xp: number;
  sprite?: string | null;
  smallSprite?: string | null;
  cry?: string | null;
  height?: number | null;
  evolution?: EvolutionOption[] | null;
};
