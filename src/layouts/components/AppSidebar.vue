<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/features/auth/store/authStore';
import { usePermissions } from '@/shared/permissions/usePermissions';
import { NAV_ITEMS } from '@/config/navigation';

defineProps<{ collapsed: boolean }>();

const { t } = useI18n();
const auth = useAuthStore();
const { canAny } = usePermissions();

const visibleNav = computed(() => NAV_ITEMS.filter((item) => canAny(item.permissions)));
</script>

<template>
  <aside
    class="flex flex-col bg-slate-900 text-slate-200 transition-all duration-200"
    :class="collapsed ? 'w-16' : 'w-64'"
  >
    <div class="flex h-16 items-center gap-3 px-4 border-b border-slate-800">
      <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600">
        <i class="pi pi-bolt" />
      </div>
      <span v-if="!collapsed" class="text-lg font-semibold tracking-wide">
        {{ t('common.appName') }}
      </span>
    </div>

    <nav class="flex-1 overflow-y-auto py-3">
      <router-link
        v-for="item in visibleNav"
        :key="item.to"
        :to="item.to"
        class="mx-2 mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        active-class="!bg-indigo-600 !text-white"
        exact-active-class="!bg-indigo-600 !text-white"
      >
        <i :class="item.icon" class="text-base" />
        <span v-if="!collapsed">{{ t(item.labelKey) }}</span>
      </router-link>
    </nav>

    <div v-if="!collapsed" class="border-t border-slate-800 p-4 text-xs text-slate-500">
      {{ t('auth.role') }}: {{ auth.user?.roleDisplayName }}
    </div>
  </aside>
</template>
