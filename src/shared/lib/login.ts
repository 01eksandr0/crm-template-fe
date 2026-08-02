/** Юзернейм: латиниця, цифри, `.` `-` `_`, 5–18 символів. */
export const USERNAME_PATTERN = /^[a-z0-9._-]{5,18}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeLogin(value: string): string {
  return value.trim().toLowerCase();
}

/** Логін = юзернейм АБО email. */
export function isValidLogin(value: string): boolean {
  const login = normalizeLogin(value);
  if (!login) return false;
  if (login.includes('@')) return EMAIL_PATTERN.test(login) && login.length <= 254;
  return USERNAME_PATTERN.test(login);
}
