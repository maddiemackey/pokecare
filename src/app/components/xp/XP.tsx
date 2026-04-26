export const xpForNextLevel = (level: number) => level ** 3 + 6;

export const getXPIntoLevel = (xp: number) => {
  let level = 1;
  let remainingXP = xp;

  while (remainingXP >= xpForNextLevel(level)) {
    remainingXP -= xpForNextLevel(level);
    level++;
  }

  return { level, xpIntoLevel: remainingXP, xpNeeded: xpForNextLevel(level) };
};
