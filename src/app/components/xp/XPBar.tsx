import './XPBar.css';

type Pokemon = {
  id: string;
  nickname: string;
  species: string;
  current_xp: number;
};

export default function XPBar({ pokemon }: { pokemon: Pokemon | null }) {
  if (!pokemon) return <p className="xp-text">Loading XP...</p>;

  const getLevelFromXP = (xp: number) => {
    let level = 1;
    while ((level + 1) ** 3 <= xp) level++;
    return level;
  };

  const xpForLevel = (level: number) => level ** 3;

  const level = getLevelFromXP(pokemon.current_xp);
  const xpCurrentLevel = xpForLevel(level);
  const xpNextLevel = xpForLevel(level + 1);

  const xpIntoLevel = pokemon.current_xp - xpCurrentLevel;
  const xpNeededThisLevel = xpNextLevel - xpCurrentLevel;

  const xpPercent = Math.min((xpIntoLevel / xpNeededThisLevel) * 100, 100);

  return (
    <div className="xp-bar-container">
      <p className="xp-text">
        {xpIntoLevel} / {xpNeededThisLevel} XP
      </p>

      <div className="xp-bar-bg">
        <div
          className="xp-bar-fill"
          style={{ width: `${xpPercent}%` }}
        />
      </div>

      <p className="xp-level">Level {level}</p>
    </div>
  );
}
