export type Pokemon = {
  id: string;
  nickname: string;
  species: string;
  current_xp: number;
  sprite?: string | null;
  smallSprite?: string | null;
  cry?: string | null;
};