<script setup lang="ts">
import { onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useI18n } from 'vue-i18n';
import Toast from 'primevue/toast';
import { registerErrorHandler } from '@/shared/http/client';
import { extractErrorKey } from '@/shared/errors/errors';
import { useSessionManager } from '@/features/auth/composables/useSessionManager';

const toast = useToast();
const { t } = useI18n();

// Sliding-сессия: продление при активности + разлогин при бездействии.
useSessionManager();

onMounted(() => {
  // Ошибки мутаций (POST/PUT/PATCH/DELETE) приходят с бэка ключом — переводим и показываем.
  registerErrorHandler((error) => {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: t(extractErrorKey(error)),
      life: 4000,
    });
  });
});
</script>

<template>
  <Toast />
  <router-view />
</template>
