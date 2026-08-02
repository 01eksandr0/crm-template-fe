<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useFormat } from '@/shared/composables/useFormat';
import type { DashboardMetric } from '../types';

const props = defineProps<{ metric: DashboardMetric }>();

const { t } = useI18n();
const { formatNumber } = useFormat();

const icons: Record<string, string> = {
  completedTotal: 'pi-check-circle',
  completedMonth: 'pi-calendar',
  completedQuarter: 'pi-chart-bar',
  revenueMonth: 'pi-wallet',
};
</script>

<template>
  <div
    class="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm text-slate-500">{{ t(`dashboard.metrics.${props.metric.key}`) }}</p>
        <p class="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {{ formatNumber(props.metric.value, props.metric.unit) }}
        </p>
      </div>
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
      >
        <i :class="['pi text-lg', icons[props.metric.key] || 'pi-chart-line']" />
      </span>
    </div>
  </div>
</template>
