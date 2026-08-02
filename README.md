# CRM Template — Frontend

Vue 3 + TypeScript + PrimeVue + Tailwind CSS v4 + Pinia + Vue Router.

## Запуск

```bash
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:4000/api
npm run dev            # http://localhost:5173
```

Бэкенд должен быть запущен на `http://localhost:4000` (см. `../crm-template-be`).

## Что уже есть

- **Логин** (`/login`) — форма входа, обработка ошибок, тост.
- **Дашборд** (`/`) — карточки со статикой, простой график выручки, таблица заказов.
- **Layout** — сворачиваемый сайдбар (пункты фильтруются по доступам), топбар с меню пользователя и выходом.
- Заглушки разделов: `/products`, `/orders`, `/customers`, `/users`, `/roles`.
- Страницы `403` и `404`.

## Аутентификация

- Access-токен хранится только в памяти (Pinia + модульная переменная в `src/lib/api.ts`).
- Refresh — в httpOnly cookie, ставит бэкенд. При загрузке приложения делается тихий `POST /auth/refresh` (`auth.bootstrap()`).
- Axios-интерсептор на `401` автоматически обновляет токен и повторяет запрос (с очередью параллельных запросов).

## Локализация (i18n)

`vue-i18n`, украинская локаль (`uk`) за замовчуванням, структура готова під інші мови.

- Налаштування: `src/i18n/index.ts`, локалі — `src/i18n/locales/{uk,en}.ts`.
- Вибір мови зберігається в `localStorage` (`crm_locale`), перемикання — `setLocale('en')`.
- У компонентах: `const { t } = useI18n()` → `t('nav.dashboard')`.
- Поза компонентами (напр. axios): `import { t } from '@/i18n'`.
- Увесь текст винесено в ключі; пункти меню, заголовки розділів, статуси — теж ключі.

## Обробка помилок

Бекенд надсилає **ключ** помилки (`error.key`), фронт перекладає його через i18n.

- Резолвер: `resolveErrorMessage(error)` / `extractErrorKey(error)` у `src/lib/errors.ts`.
- Форма входу показує помилку інлайном.
- Помилки мутацій (POST/PUT/PATCH/DELETE) глобально показуються тостом — обробник зареєстровано в `App.vue` через `registerErrorHandler` (`src/lib/api.ts`).
- Немає зв’язку із сервером → ключ `errors.network`.

## Доступы (permissions)

Приходят с бэка в `user.permissions` как массив строк, напр. `['products.view', 'products.edit']`.
`superadmin` получает `['*']` (проходит любую проверку).

Проверять доступ можно тремя способами:

1. **Роут-гард** — в `router/index.ts` через `meta.permission`.
2. **Директива** — `v-can="'products.add'"` или `v-can="['a', 'b']"` (скрывает элемент).
3. **В коде** — `auth.can('products.edit')` / `auth.canAny([...])`.

Меню строится из `NAV_ITEMS` в `src/lib/permissions.ts` и фильтруется по доступам.

## Структура

```
src/
  lib/          api (axios+refresh), permissions (helpers + меню)
  stores/       auth (Pinia)
  directives/   v-can
  router/       маршруты + гарды
  layouts/      DefaultLayout (сайдбар + топбар)
  views/        Login, Dashboard, Placeholder, Forbidden, NotFound
  types.ts      общие типы (User, DashboardStats, ...)
  main.ts       PrimeVue (Aura) + Pinia + Router + директивы
```
