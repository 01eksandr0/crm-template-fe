<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import PageHeader from '@/shared/ui/PageHeader.vue';
import { usePermissions } from '@/shared/permissions/usePermissions';

const route = useRoute();
const { t } = useI18n();
const { can } = usePermissions();

const title = computed(() => {
  const key = route.meta.titleKey as string | undefined;
  return key ? t(key) : '';
});

// Пример доступа раздела для демонстрации проверки прав.
const addPerm = computed(() => `${String(route.name ?? '')}.add`);
</script>

<template>
  <div>
    <PageHeader :title="title" :subtitle="t('placeholder.subtitle')">
      <template #actions>
        <Button v-if="can(addPerm)" :label="t('common.add')" icon="pi pi-plus" />
      </template>
    </PageHeader>

    <div
      class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-20 text-center"
    >
      <i class="pi pi-wrench mb-3 text-3xl text-slate-400" />
      <p class="text-slate-500">{{ t('placeholder.comingSoon', { title }) }}</p>
    </div>
  </div>
</template>
