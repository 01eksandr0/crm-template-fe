<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import SelectButton from 'primevue/selectbutton';
import { useFormat } from '@/shared/composables/useFormat';
import type { ChartGranularity, DashboardAnalytics, DashboardChartPoint } from '../types';

const props = defineProps<{ analytics: DashboardAnalytics }>();

const { t, locale } = useI18n();
const { formatNumber, formatDate } = useFormat();

const granularity = ref<ChartGranularity>(props.analytics.chart.defaultGranularity ?? 'month');

watch(
  () => props.analytics.chart.defaultGranularity,
  (value) => {
    if (value) granularity.value = value;
  },
);

const periodOptions = computed(() =>
  (['year', 'quarter', 'month', 'week'] as ChartGranularity[]).map((value) => ({
    label: t(`dashboard.periods.${value}`),
    value,
  })),
);

const points = computed(
  () => props.analytics.chart.series[granularity.value]?.points ?? [],
);

const maxValue = computed(() => Math.max(...points.value.map((p) => p.value), 1));

const hovered = ref<DashboardChartPoint | null>(null);

function formatAxisLabel(point: DashboardChartPoint) {
  const label = point.label;
  if (granularity.value === 'year') return label;
  if (granularity.value === 'quarter') {
    const [y, q] = label.split('-Q');
    return q ? `Q${q} ${y}` : label;
  }
  if (granularity.value === 'week') {
    const week = label.split('-W')[1];
    return week ? `W${week}` : label;
  }
  const [y, m] = label.split('-').map(Number);
  if (!y || !m) return label;
  return new Intl.DateTimeFormat(locale.value, { month: 'short' }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

function formatPeriodTitle(point: DashboardChartPoint) {
  if (granularity.value === 'year') {
    return t('dashboard.tooltip.year', { year: point.label });
  }
  if (granularity.value === 'quarter') {
    const [y, q] = point.label.split('-Q');
    return t('dashboard.tooltip.quarter', { year: y, quarter: q });
  }
  if (granularity.value === 'week') {
    return t('dashboard.tooltip.week', {
      week: point.label.split('-W')[1] ?? point.label,
      from: formatDate(point.periodStart),
      to: formatDate(new Date(new Date(point.periodEnd).getTime() - 86400000).toISOString()),
    });
  }
  const date = new Date(point.periodStart);
  const month = new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(
    date,
  );
  return month.charAt(0).toUpperCase() + month.slice(1);
}
</script>

<template>
  <section class="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
    <div
      class="flex flex-col gap-3 overflow-hidden rounded-t-2xl border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-end sm:justify-between"
    >
      <div>
        <h2 class="text-[15px] font-semibold text-slate-900">
          {{ t('dashboard.chartTitle') }}
        </h2>
        <p class="mt-1 text-xs text-slate-500">
          {{ t('dashboard.updatedAt', { date: formatDate(analytics.computedAt) }) }}
        </p>
      </div>

      <SelectButton
        v-model="granularity"
        :options="periodOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="small"
        class="shrink-0"
      />
    </div>

    <div class="px-5 pb-5 pt-6">
      <div class="flex h-72 items-end justify-between gap-2 sm:gap-3">
        <div
          v-for="point in points"
          :key="point.label"
          class="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          @mouseenter="hovered = point"
          @mouseleave="hovered = null"
          @focusin="hovered = point"
          @focusout="hovered = null"
        >
          <div class="flex w-full flex-1 items-end">
            <div
              class="relative w-full"
              :style="{
                height: `${(point.value / maxValue) * 100}%`,
                minHeight: point.value ? '4px' : '0',
              }"
            >
              <div
                v-if="hovered?.label === point.label"
                class="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-max max-w-[220px] -translate-x-1/2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-lg"
              >
                <p class="text-xs font-semibold text-slate-900">
                  {{ formatPeriodTitle(point) }}
                </p>
                <dl class="mt-2 space-y-1 text-xs text-slate-600">
                  <div class="flex items-center justify-between gap-4">
                    <dt>{{ t('dashboard.tooltip.orders') }}</dt>
                    <dd class="font-medium text-slate-900">{{ formatNumber(point.value) }}</dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt>{{ t('dashboard.tooltip.revenue') }}</dt>
                    <dd class="font-medium text-slate-900">
                      {{ formatNumber(point.revenue, '₴') }}
                    </dd>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <dt>{{ t('dashboard.tooltip.avg') }}</dt>
                    <dd class="font-medium text-slate-900">
                      {{ formatNumber(point.avgOrderValue, '₴') }}
                    </dd>
                  </div>
                </dl>
              </div>

              <div
                class="h-full w-full cursor-default rounded-t-lg bg-gradient-to-t from-emerald-700 to-emerald-400 transition-all group-hover:from-emerald-800 group-hover:to-emerald-500"
                tabindex="0"
              />
            </div>
          </div>
          <span class="truncate text-[11px] capitalize text-slate-500 sm:text-xs">
            {{ formatAxisLabel(point) }}
          </span>
        </div>
      </div>
      <p v-if="!points.some((p) => p.value > 0)" class="mt-4 text-center text-sm text-slate-500">
        {{ t('dashboard.chartEmpty') }}
      </p>
    </div>
  </section>
</template>
