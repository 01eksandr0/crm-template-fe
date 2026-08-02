<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';

defineProps<{
  loading?: boolean;
  error?: string | null;
}>();
</script>

<template>
  <div v-if="loading" class="flex justify-center py-20">
    <slot name="loading">
      <ProgressSpinner />
    </slot>
  </div>

  <div v-else-if="error" class="rounded-lg bg-red-50 p-4 text-red-700">
    <slot name="error">{{ error }}</slot>
  </div>

  <slot v-else />
</template>
