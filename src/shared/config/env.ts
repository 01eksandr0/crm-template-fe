/** Прибирає типові помилки з Vercel/UI: пробіли, лапки, зайвий `=` з рядка `.env`. */
function normalizeApiUrl(raw: string | undefined): string {
  const cleaned = (raw ?? '/api').trim().replace(/^[=]+/, '').replace(/^["']|["']$/g, '');
  return cleaned || '/api';
}

/** Единая точка доступа к переменным окружения фронта. */
export const env = {
  // Абсолютний URL бэка (прод/stg) або `/api` (локальний проксі Vite).
  apiUrl: normalizeApiUrl(import.meta.env.VITE_API_URL),
} as const;
