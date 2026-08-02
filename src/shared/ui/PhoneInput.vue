<script setup lang="ts">
import InputMask from 'primevue/inputmask';

defineProps<{
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}>();

/** Формат UA: +380 (XX) XXX-XX-XX */
const model = defineModel<string>({ default: '' });
</script>

<template>
  <InputMask
    :id="id"
    v-model="model"
    mask="+380 (99) 999-99-99"
    placeholder="+380 (__) ___-__-__"
    :auto-clear="false"
    slot-char="_"
    :disabled="disabled"
    :invalid="invalid"
    :required="required"
    class="w-full"
  />
</template>
