import './XPBar.css';

type Pokemon = {
  id: string;
  nickname: string;
  species: string;
  current_xp: number;
};

export default function XPBar({ pokemon }: { pokemon: Pokemon | null }) {
  if (!pokemon) return <p className="xp-text">Loading XP...</p>;

  const xpForNextLevel = (level: number) => level ** 3 + 6; 

  const getXPIntoLevel = (xp: number) => {
    let level = 1;
    while (xp >= xpForNextLevel(level)) {
      xp -= xpForNextLevel(level);
      level++;
    }
    return { level, xpIntoLevel: xp, xpNeeded: xpForNextLevel(level) };
  };

  const { level, xpIntoLevel, xpNeeded } = getXPIntoLevel(pokemon.current_xp);

  const xpPercent = (xpIntoLevel / xpNeeded) * 100;

  return (
    <div className="xp-bar-container">
      <p className="xp-text">
        {xpIntoLevel} / {xpNeeded} XP
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
