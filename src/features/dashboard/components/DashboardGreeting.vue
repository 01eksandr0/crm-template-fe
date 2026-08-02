<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Button from 'primevue/button';
import { useFormat } from '@/shared/composables/useFormat';
import { usePermissions } from '@/shared/permissions/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import type { DashboardWorkspace } from '../types';

const props = defineProps<{
  firstName: string | null;
  roleDisplayName?: string;
  canViewAnalytics: boolean;
  workspace: DashboardWorkspace | null;
}>();

const { t } = useI18n();
const { formatDate } = useFormat();
const { can } = usePermissions();
const router = useRouter();

const greetingKey = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'dashboard.greeting.morning';
  if (hour < 18) return 'dashboard.greeting.day';
  return 'dashboard.greeting.evening';
});

const displayName = computed(() => props.firstName?.trim() || t('dashboard.greeting.colleague'));
const today = computed(() => formatDate(new Date()));
const subtitleKey = computed(() =>
  props.canViewAnalytics ? 'dashboard.greeting.subtitleAdmin' : 'dashboard.greeting.subtitle',
);
</script>

<template>
  <section
    class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-emerald-50/60 p-6 shadow-sm sm:p-8"
  >
    <div
      class="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-emerald-200/30 blur-2xl"
    />
    <div
      class="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-sky-200/25 blur-2xl"
    />

    <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div class="max-w-xl">
        <p class="text-sm font-medium text-emerald-800/80">
          <span>{{ today }}</span>
          <span v-if="roleDisplayName" class="text-slate-400"> · {{ roleDisplayName }}</span>
        </p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          {{ t(greetingKey, { name: displayName }) }}
        </h1>
        <p class="mt-3 text-base text-slate-600">
          {{ t(subtitleKey) }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <Button
          v-if="can(PERMISSIONS.ORDERS_ADD)"
          :label="t('dashboard.actions.newOrder')"
          icon="pi pi-plus"
          @click="router.push({ name: 'orders-create' })"
        />
        <Button
          v-if="can(PERMISSIONS.ORDERS_VIEW)"
          :label="t('dashboard.actions.allOrders')"
          icon="pi pi-shopping-cart"
          severity="secondary"
          outlined
          class="!bg-white/80"
          @click="router.push({ name: 'orders' })"
        />
      </div>
    </div>

    <div
      v-if="workspace"
      class="relative mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <div class="rounded-xl border border-white/80 bg-white/70 px-4 py-3 backdrop-blur">
        <p class="text-xs uppercase tracking-wide text-slate-500">
          {{ t('dashboard.workspace.active') }}
        </p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ workspace.myActiveOrders }}</p>
      </div>
      <div class="rounded-xl border border-white/80 bg-white/70 px-4 py-3 backdrop-blur">
        <p class="text-xs uppercase tracking-wide text-slate-500">
          {{ t('dashboard.workspace.new') }}
        </p>
        <p class="mt-1 text-2xl font-semibold text-slate-900">{{ workspace.myNewOrders }}</p>
      </div>
    </div>
  </section>
</template>
