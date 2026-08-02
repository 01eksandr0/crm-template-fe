export const WILDCARD = '*';

/** Проверка одного доступа с учётом wildcard (superadmin). */
export function can(granted: string[], required: string): boolean {
  return granted.includes(WILDCARD) || granted.includes(required);
}

/** Проверка «хотя бы один из». */
export function canAny(granted: string[], required: string[]): boolean {
  if (granted.includes(WILDCARD)) return true;
  return required.some((p) => granted.includes(p));
}

/** Проверка «все из». */
export function canAll(granted: string[], required: string[]): boolean {
  if (granted.includes(WILDCARD)) return true;
  return required.every((p) => granted.includes(p));
}
