import { createI18n } from 'vue-i18n';
import uk from './locales/uk';
import en from './locales/en';

export const SUPPORTED_LOCALES = ['uk', 'en'] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'uk';
const STORAGE_KEY = 'crm_locale';

function resolveInitialLocale(): AppLocale {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && SUPPORTED_LOCALES.includes(saved as AppLocale)) {
    return saved as AppLocale;
  }
  return DEFAULT_LOCALE;
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: resolveInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: { uk, en },
});

export function setLocale(locale: AppLocale) {
  i18n.global.locale.value = locale;
  localStorage.setItem(STORAGE_KEY, locale);
  document.documentElement.setAttribute('lang', locale);
}

/** Перевод вне компонентов (например, в axios-интерсепторе). */
export function t(key: string, params?: Record<string, unknown>): string {
  return i18n.global.t(key, params ?? {});
}
