<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import AppBreadcrumbs from './AppBreadcrumbs.vue';
import UserMenu from './UserMenu.vue';

defineProps<{ collapsed: boolean }>();
defineEmits<{ toggle: [] }>();

const { t } = useI18n();
</script>

<template>
  <header class="flex h-16 items-center gap-3 border-b border-slate-200 bg-white px-4">
    <Button
      text
      rounded
      :icon="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
      :aria-label="t('common.toggleMenu')"
      @click="$emit('toggle')"
    />
    <AppBreadcrumbs />
    <div class="ml-auto shrink-0">
      <UserMenu />
    </div>
  </header>
</template>
