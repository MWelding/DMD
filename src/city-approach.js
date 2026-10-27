export const cityApproachSeconds = 6.4;

export function sampleCityApproach(elapsed) {
  const progress = Math.max(0, Math.min(1, elapsed / cityApproachSeconds));
  return progress * progress * (3 - 2 * progress);
}
