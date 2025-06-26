
export const shuffleArray = (array: any[]) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.random() * (i + 1) | 0;
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateUniqueCardId = (baseId: any, playerId: string, index: string | number = 0) => {
  return `${playerId}_${baseId}_${index}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};
