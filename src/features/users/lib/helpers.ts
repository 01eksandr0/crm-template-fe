import type { UserRecord } from '../types';

/** ПІБ у порядку: прізвище ім’я по батькові. */
export function fullName(user: Pick<UserRecord, 'firstName' | 'lastName' | 'middleName'>): string {
  return [user.lastName, user.firstName, user.middleName].filter(Boolean).join(' ');
}

/** ISO / Date -> Date для DatePicker (локальна дата без зсуву TZ). */
export function toPickerDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** DatePicker Date -> ISO midnight UTC для API. */
export function fromPickerDate(value: Date | null | undefined): string | null {
  if (!value || Number.isNaN(value.getTime())) return null;
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}T00:00:00.000Z`;
}
