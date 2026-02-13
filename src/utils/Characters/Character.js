export const getCharacterMood = (stats) => {
  // stats 매개변수를 통해 외부에서 데이터를 전달받습니다.
  const { energy, pressure, passion } = stats;

  if (energy < 30 && pressure > 70) return 'stress';
  if (passion > 80 && energy > 50) return 'burning';
  if (energy > 70) return 'happy';
  return 'neutral';
};
