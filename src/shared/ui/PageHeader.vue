<script setup lang="ts">
defineProps<{
  title: string;
  /** Рядок під заголовком, напр. «Дата створення: 04.05.2026» */
  meta?: string;
  /** Застарілий підзаголовок — краще використовувати meta */
  subtitle?: string;
}>();
</script>

<template>
  <div class="mb-6 flex items-start justify-between gap-4">
    <div class="min-w-0 flex flex-col gap-2">
      <h1 class="text-2xl font-semibold text-slate-800">{{ title }}</h1>
      <p v-if="meta || subtitle" class="text-sm text-slate-500">
        {{ meta || subtitle }}
      </p>
      <div v-if="$slots.status" class="pt-0.5">
        <slot name="status" />
      </div>
    </div>
    <div v-if="$slots.actions" class="flex shrink-0 flex-wrap items-center justify-end gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
