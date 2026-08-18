/** Inclusive numeric range. Empty side = unbounded. */

export function toOptionalFiniteNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** If both bounds exist and min > max, swap them. */
export function normalizeNumberRange(
  min: unknown,
  max: unknown,
): { min?: number; max?: number } {
  let from = toOptionalFiniteNumber(min);
  let to = toOptionalFiniteNumber(max);
  if (from !== undefined && to !== undefined && from > to) {
    [from, to] = [to, from];
  }
  return { min: from, max: to };
}

export function toNumberRangeTuple(value: unknown): [number | null, number | null] | null {
  const raw = Array.isArray(value) ? value : [];
  const { min, max } = normalizeNumberRange(raw[0], raw[1]);
  if (min === undefined && max === undefined) return null;
  return [min ?? null, max ?? null];
}
