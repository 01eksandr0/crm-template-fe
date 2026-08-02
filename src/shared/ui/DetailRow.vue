<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value?: string | number | null;
    emptyText?: string;
  }>(),
  { value: null, emptyText: '—' },
);
</script>

<template>
  <div
    class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
  >
    <div class="text-sm text-slate-500">{{ label }}</div>
    <div class="min-w-0 break-words text-sm text-slate-900">
      <slot>{{ value === null || value === undefined || value === '' ? emptyText : value }}</slot>
    </div>
  </div>
</template>
