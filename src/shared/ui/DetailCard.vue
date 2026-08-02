<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string;
  }>(),
  { title: '' },
);
</script>

<template>
  <section class="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
    <h2
      v-if="title"
      class="border-b border-slate-100 px-5 py-4 text-[15px] font-semibold text-slate-900"
    >
      {{ title }}
    </h2>
    <div class="divide-y divide-slate-100">
      <slot />
    </div>
  </section>
</template>
