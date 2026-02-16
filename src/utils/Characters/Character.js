export const getCharacterMood = (stats) => {
  // 안전 장치: stats가 없을 경우 기본 객체 사용
  const safeStats = stats || { energy: 0, burden: 0, passion: 0 };

  // 데이터 키 이름이 energy, burden, passion인지 pressure인지 확인 필요
  const { energy, burden, pressure, passion } = safeStats;

  // burden이 없으면 pressure 사용
  const actualBurden = burden || pressure || 0;

  const avg = (energy + actualBurden + passion) / 3;

  if (avg >= 90) return 'burning';
  if (avg >= 70) return 'stress';
  if (avg >= 45) return 'neutral';

  // 기본값
  return 'happy';
};