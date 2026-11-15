/** Axis helpers shared by the chart components. */

/** Rounds a maximum up to a readable 1/2/2.5/5 x 10^n step. */
export function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const exponent = Math.floor(Math.log10(value));
  const magnitude = 10 ** exponent;
  const normalised = value / magnitude;
  const step = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 2.5 ? 2.5 : normalised <= 5 ? 5 : 10;
  return step * magnitude;
}

/** Evenly spaced tick values from 0 to a nice maximum, inclusive. */
export function ticks(max: number, count = 4): number[] {
  const top = niceCeil(max);
  return Array.from({ length: count + 1 }, (_, index) => (top / count) * index);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
