/** Единая точка доступа к переменным окружения фронта. */
export const env = {
  // Относительный путь: запросы идут на свой origin (/api), а прокси
  // (Vite в dev / реверс-прокси в prod) незаметно форвардит их на бэкенд.
  apiUrl: import.meta.env.VITE_API_URL ?? '/api',
} as const;
