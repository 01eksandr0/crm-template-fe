<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import StateSection from '@/shared/ui/StateSection.vue';
import { useDashboardStats } from '../composables/useDashboardStats';
import DashboardGreeting from '../components/DashboardGreeting.vue';
import StatCardsGrid from '../components/StatCardsGrid.vue';
import RevenueChart from '../components/RevenueChart.vue';

const { t } = useI18n();
const { data, isLoading, isError } = useDashboardStats();
</script>

<template>
  <div>
    <StateSection :loading="isLoading" :error="isError ? t('dashboard.loadError') : null">
      <div v-if="data" class="flex flex-col gap-6">
        <DashboardGreeting
          :first-name="data.greeting.firstName"
          :role-display-name="data.greeting.roleDisplayName"
          :can-view-analytics="data.canViewAnalytics"
          :workspace="data.canViewAnalytics ? null : data.workspace"
        />

        <template v-if="data.canViewAnalytics && data.analytics">
          <div>
            <div class="mb-3 flex items-baseline justify-between gap-3">
              <h2 class="text-lg font-semibold text-slate-900">
                {{ t('dashboard.analyticsTitle') }}
              </h2>
              <span class="text-xs text-slate-500">{{ t('dashboard.weeklyNote') }}</span>
            </div>
            <StatCardsGrid :metrics="data.analytics.metrics" />
          </div>

          <RevenueChart :analytics="data.analytics" />
        </template>
      </div>
    </StateSection>
  </div>
</template>
