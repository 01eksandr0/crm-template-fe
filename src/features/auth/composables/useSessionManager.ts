import { onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '../store/authStore';

// Как часто проверяем состояние сессии.
const CHECK_INTERVAL_MS = 15_000;
// За сколько до истечения access-токена продлеваем сессию проактивно.
const REFRESH_MARGIN_MS = 60_000;
// Троттлинг обработчиков активности.
const ACTIVITY_THROTTLE_MS = 5_000;

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

/**
 * Менеджер сессии (вызывается один раз в корне приложения).
 *
 * Пока пользователь активен — проактивно продлевает сессию (sliding):
 * обновляет access-токен до его истечения, что двигает и refresh-токен на бэке.
 * Если пользователь бездействует дольше окна (session.idleTimeoutMs) — разлогинивает.
 */
export function useSessionManager() {
  const auth = useAuthStore();
  const { isAuthenticated } = storeToRefs(auth);
  const router = useRouter();
  const { t } = useI18n();
  const toast = useToast();

  let lastActivityAt = Date.now();
  let lastActivityWrite = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;
  let refreshing = false;

  function onActivity() {
    const now = Date.now();
    // Троттлим: незачем писать переменную на каждый mousemove.
    if (now - lastActivityWrite < ACTIVITY_THROTTLE_MS) return;
    lastActivityWrite = now;
    lastActivityAt = now;
  }

  async function endByIdle() {
    stop();
    await auth.logout();
    toast.add({
      severity: 'info',
      summary: t('auth.sessionEnded'),
      detail: t('auth.idleLogout'),
      life: 5000,
    });
    router.push({ name: 'login' });
  }

  async function tick() {
    const { session } = auth;
    if (!isAuthenticated.value || !session) return;

    const now = Date.now();

    // 1) Бездействие дольше окна — разлогиниваем.
    if (now - lastActivityAt >= session.idleTimeoutMs) {
      await endByIdle();
      return;
    }

    // 2) Пользователь активен и access-токен скоро истечёт — продлеваем сессию.
    const expiresAt = auth.tokenObtainedAt + session.accessTokenTtlMs;
    if (!refreshing && now >= expiresAt - REFRESH_MARGIN_MS) {
      refreshing = true;
      try {
        await auth.refresh();
      } catch {
        // refresh-токен протух/отозван — сессия мертва.
        stop();
        auth.clearSession();
        router.push({ name: 'login' });
      } finally {
        refreshing = false;
      }
    }
  }

  function start() {
    if (intervalId) return;
    lastActivityAt = Date.now();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    intervalId = setInterval(tick, CHECK_INTERVAL_MS);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity));
  }

  // Запускаем/останавливаем вместе с аутентификацией.
  watch(isAuthenticated, (authed) => (authed ? start() : stop()), { immediate: true });

  onBeforeUnmount(stop);
}
