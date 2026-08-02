<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Tag from 'primevue/tag';
import type { OrderStatus } from '../types';
import { statusSeverity } from '../lib/status';

const props = defineProps<{ status: OrderStatus }>();
const { t } = useI18n();

const label = computed(() => t(`orders.status.${props.status}`));
const hint = computed(() => t(`orders.statusHint.${props.status}`));
const isNew = computed(() => props.status === 'new');
</script>

<template>
  <span
    class="inline-flex cursor-default"
    v-tooltip.top="{
      value: hint,
      showDelay: 200,
      hideDelay: 0,
    }"
    @click.stop
  >
    <!-- «Нове»: власний нейтральний стиль з кращим контрастом на білому фоні -->
    <Tag
      :value="label"
      :severity="isNew ? undefined : statusSeverity(status)"
      :class="isNew ? 'order-status-new' : undefined"
    />
  </span>
</template>

<style scoped>
:deep(.order-status-new) {
  background: #e2e8f0;
  color: #1e293b;
  border: 1px solid #cbd5e1;
}
</style>
