export const getCharacterMood = (stats) => {
  // stats가 없거나 모든 수치가 0이면 '평온(neutral)' 또는 기본 상태 반환
  if (!stats || (stats.energy === 0 && (stats.burden || stats.pressure) === 0 && stats.passion === 0)) {
    return 'neutral';
  }

  const energy = stats.energy || 0;
  const pressure = stats.burden || stats.pressure || 0; // burden/pressure 혼용 대응
  const passion = stats.passion || 0;

  // 특수 상태 우선 체크
  if (energy < 30 && pressure > 70) return 'stress';
  if (passion > 80 && energy > 50) return 'burning';

  // 평균 및 주요 수치 체크
  const avg = (energy + passion + (100 - pressure)) / 3;

  if (avg > 70 || energy > 80) return 'happy';

  return 'neutral';
};
