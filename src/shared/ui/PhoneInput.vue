<script setup lang="ts">
import { formatUaMask, subscriberDigits } from '@/shared/lib/phone';

defineProps<{
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
}>();

const emit = defineEmits<{
  blur: [event: FocusEvent];
}>();

const model = defineModel<string>({ default: '' });

function onInput() {
  const digits = subscriberDigits(model.value);
  model.value = digits ? formatUaMask(digits) : '';
}
</script>

<template>
  <input
    :id="id"
    v-model="model"
    type="text"
    inputmode="numeric"
    autocomplete="tel"
    class="p-inputtext p-component w-full"
    :class="{ 'p-invalid': invalid }"
    placeholder="+380 (XX) XXX-XX-XX"
    :disabled="disabled"
    @input="onInput"
    @blur="emit('blur', $event)"
  />
</template>
