<script setup lang="ts">
import StatCard from './StatCard.vue';
import type { DashboardMetric } from '../types';

defineProps<{ metrics: DashboardMetric[] }>();
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
    <StatCard v-for="metric in metrics" :key="metric.key" :metric="metric" />
  </div>
</template>
