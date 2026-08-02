import { createApp } from 'vue';
import App from '@/app/App.vue';
import { registerPlugins } from '@/app/plugins';
import { router } from '@/router';
import { vCan } from '@/shared/directives/can';
import { useAuthStore } from '@/features/auth/store/authStore';
import { i18n } from '@/i18n';

const app = createApp(App);

registerPlugins(app);
app.directive('can', vCan);
document.documentElement.setAttribute('lang', i18n.global.locale.value);

// Регистрируем обработчики refresh до старта роутера (pinia уже установлена).
useAuthStore().registerInterceptors();

app.use(router);
app.mount('#app');
