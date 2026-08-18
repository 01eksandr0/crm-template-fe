/** Мін. цифр абонента (після +380). Порожнє поле для optional не перевіряємо. */
export const UA_PHONE_MIN_DIGITS = 9;

/** Довжина повного формату +380 (XX) XXX-XX-XX */
export const UA_PHONE_FORMATTED_LENGTH = 19;

/** Повний номер без `_`. Порожнє HTML5 не перевіряє pattern. */
export const UA_PHONE_COMPLETE_PATTERN = String.raw`\+380 \(\d{2}\) \d{3}-\d{2}-\d{2}`;

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

/** 9 цифр абонента після коду 380 (плейсхолдери `_` ігноруються). */
export function subscriberDigits(value: string | null | undefined): string {
  if (!value) return '';
  let d = digitsOnly(value);
  if (d.startsWith('380')) d = d.slice(3);
  else if (d.startsWith('80') && d.length >= 11) d = d.slice(2);
  else if (d.startsWith('0') && d.length >= 10) d = d.slice(1);
  return d.slice(0, 9);
}

export function formatUaMask(digits: string): string {
  const p = digits.replace(/\D/g, '').slice(0, 9).padEnd(9, '_');
  return `+380 (${p.slice(0, 2)}) ${p.slice(2, 5)}-${p.slice(5, 7)}-${p.slice(7, 9)}`;
}

export function isPhoneEmpty(value: string | null | undefined): boolean {
  return subscriberDigits(value).length === 0;
}

/** Є цифри, але не повні 9 — не можна ні відправляти, ні зберігати як null. */
export function isPhonePartial(value: string | null | undefined): boolean {
  const n = subscriberDigits(value).length;
  return n > 0 && n < 9;
}

/** Порожньо або не коротше за мінімум (9 цифр абонента). */
export function optionalPhoneMeetsMinLength(value: string | null | undefined): boolean {
  const n = subscriberDigits(value).length;
  return n === 0 || n >= UA_PHONE_MIN_DIGITS;
}

export function isCompleteUaPhone(value: string | null | undefined): boolean {
  if (!value?.trim() || value.includes('_')) return false;
  return subscriberDigits(value).length >= UA_PHONE_MIN_DIGITS;
}

export function hasPhoneDigits(value: string | null | undefined): boolean {
  return isCompleteUaPhone(value);
}

export function phoneValidationError(
  value: string | null | undefined,
  required = false,
): 'required' | 'phone' | null {
  const n = subscriberDigits(value).length;
  if (n === 0) return required ? 'required' : null;
  if (n < UA_PHONE_MIN_DIGITS) return 'phone';
  return null;
}

export function normalizeOptionalPhone(value: string | null | undefined): string | null {
  if (isPhoneEmpty(value)) return null;
  return value!.trim();
}

export function formatUaPhone(value: string | null | undefined): string {
  if (!value) return '';
  const digits = subscriberDigits(value);
  if (!digits) return '';
  return formatUaMask(digits);
}

export const formatPhoneInput = formatUaPhone;

/** Позиція курсора після N введених цифр у масці +380 (XX) XXX-XX-XX */
export function phoneCaretIndex(digitCount: number): number {
  const map = [6, 7, 8, 11, 12, 13, 15, 16, 18, 19];
  return map[Math.max(0, Math.min(digitCount, 9))];
}
