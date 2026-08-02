import type { App } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import ToastService from 'primevue/toastservice';
import ConfirmationService from 'primevue/confirmationservice';
import Tooltip from 'primevue/tooltip';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { i18n } from '@/i18n';
import { queryClient } from '@/shared/http/queryClient';

import 'primeicons/primeicons.css';
import '@/style.css';

/** Регистрация всех плагинов приложения. */
export function registerPlugins(app: App) {
  app.use(createPinia());
  app.use(i18n);
  app.use(PrimeVue, {
    theme: {
      preset: Aura,
      options: {
        darkModeSelector: '.dark',
        cssLayer: {
          name: 'primevue',
          order: 'theme, base, primevue, components, utilities',
        },
      },
    },
  });
  app.directive('tooltip', Tooltip);
  app.use(ToastService);
  app.use(ConfirmationService);
  app.use(VueQueryPlugin, { queryClient });
}
