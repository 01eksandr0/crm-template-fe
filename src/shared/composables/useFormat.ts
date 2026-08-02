import { useI18n } from 'vue-i18n';

/** Форматирование чисел/валюты с учётом текущей локали. */
export function useFormat() {
  const { locale } = useI18n();

  function formatNumber(value: number, unit?: string): string {
    const formatted = new Intl.NumberFormat(locale.value).format(value);
    return unit ? `${formatted} ${unit}` : formatted;
  }

  /** ISO-строка/Date -> локализованная дата (без времени). Пустое -> "—". */
  function formatDate(value: string | Date | null | undefined): string {
    if (!value) return '—';
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(date);
  }

  return { formatNumber, formatDate };
}
