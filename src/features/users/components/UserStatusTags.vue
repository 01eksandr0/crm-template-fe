<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Tag from 'primevue/tag';

defineProps<{
  isActive: boolean;
  onVacation: boolean;
}>();

const { t } = useI18n();
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <Tag
      :value="isActive ? t('users.status.active') : t('users.status.inactive')"
      :severity="isActive ? 'success' : 'danger'"
    />
    <Tag v-if="onVacation" :value="t('users.status.vacation')" severity="warn" />
  </div>
</template>
