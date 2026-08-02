<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';

const router = useRouter();
const { t } = useI18n();
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 p-4 text-center">
    <i class="pi pi-lock text-5xl text-slate-400" />
    <h1 class="text-3xl font-semibold text-slate-800">{{ t('errorPages.forbiddenTitle') }}</h1>
    <p class="text-slate-500">{{ t('errorPages.forbidden') }}</p>
    <Button :label="t('common.goHome')" icon="pi pi-home" @click="router.push({ name: 'dashboard' })" />
  </div>
</template>
