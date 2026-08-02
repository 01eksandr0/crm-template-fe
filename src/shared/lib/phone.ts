/** Чи є в масці реальний номер (не лише +380 / плейсхолдери). */
export function hasPhoneDigits(value: string | null | undefined): boolean {
  if (!value) return false;
  const digits = value.replace(/\D/g, '');
  // 380 + 9 цифр абонента
  return digits.length >= 12;
}

/** Для optional-полів: порожня/незаповнена маска → null. */
export function normalizeOptionalPhone(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  if (!trimmed || !hasPhoneDigits(trimmed)) return null;
  return trimmed;
}

/** Привести збережений номер до маски +380 (XX) XXX-XX-XX для InputMask. */
export function formatUaPhone(value: string | null | undefined): string {
  if (!value) return '';
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) digits = `38${digits}`;
  if (digits.startsWith('80') && digits.length === 11) digits = `3${digits}`;
  if (!digits.startsWith('380') && digits.length === 9) digits = `380${digits}`;
  if (!digits.startsWith('380') || digits.length < 12) return value.trim();
  const rest = digits.slice(3, 12);
  return `+380 (${rest.slice(0, 2)}) ${rest.slice(2, 5)}-${rest.slice(5, 7)}-${rest.slice(7, 9)}`;
}

export const formatPhoneInput = formatUaPhone;
