import { characterSummary } from "../../api/update";

export const getCharacterMood = (stats) => {
  // stats 매개변수를 통해 외부에서 데이터를 전달받습니다.
  const { energy, pressure, passion } = stats;
  const avg = (energy + pressure + passion) / 3

  if (avg >= 90) return 'burning' && characterSummary == "You are on fire, but close to burnout."
  if (avg >= 70) return 'stress' && characterSummary == "Stress level is rising.";
  if (avg >= 45) return 'neutral' && characterSummary == "Maintaining balance.";
  if (avg >= 0) return 'happy' && characterSummary == "In a good mood today.";
};
