<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Message from 'primevue/message';
import type { Product, ProductPayload } from '../types';

const props = defineProps<{
  mode: 'create' | 'edit';
  initial?: Product | null;
  submitting?: boolean;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  submit: [payload: ProductPayload];
  cancel: [];
}>();

const { t } = useI18n();

const form = reactive({
  name: '',
  price: null as number | null,
});

const fieldErrors = reactive({
  name: '',
  price: '',
});

function hydrate(product?: Product | null) {
  form.name = product?.name ?? '';
  form.price = product?.price ?? null;
  fieldErrors.name = '';
  fieldErrors.price = '';
}

hydrate(props.initial);
watch(
  () => props.initial,
  (value) => hydrate(value),
);

function validate() {
  let ok = true;
  const name = form.name.trim();
  if (!name) {
    fieldErrors.name = t('validation.required');
    ok = false;
  } else if (name.length > 100) {
    fieldErrors.name = t('validation.maxLength');
    ok = false;
  } else {
    fieldErrors.name = '';
  }

  if (form.price === null || form.price === undefined || Number.isNaN(form.price)) {
    fieldErrors.price = t('validation.required');
    ok = false;
  } else if (form.price < 0) {
    fieldErrors.price = t('validation.required');
    ok = false;
  } else {
    fieldErrors.price = '';
  }
  return ok;
}

function onSubmit() {
  if (!validate()) return;
  emit('submit', {
    name: form.name.trim(),
    price: form.price as number,
  });
}
</script>

<template>
  <form class="divide-y divide-slate-100" novalidate @submit.prevent="onSubmit">
    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="productName">
        {{ t('products.fields.name') }} *
      </label>
      <div>
        <InputText
          id="productName"
          v-model="form.name"
          class="w-full"
          :disabled="submitting"
          maxlength="100"
          :invalid="!!fieldErrors.name"
        />
        <small v-if="fieldErrors.name" class="text-red-600">{{ fieldErrors.name }}</small>
      </div>
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="productPrice">
        {{ t('products.fields.price') }} *
      </label>
      <div>
        <InputNumber
          id="productPrice"
          v-model="form.price"
          class="w-full"
          input-class="w-full"
          mode="decimal"
          :min-fraction-digits="0"
          :max-fraction-digits="2"
          :min="0"
          :disabled="submitting"
          :invalid="!!fieldErrors.price"
        />
        <small v-if="fieldErrors.price" class="text-red-600">{{ fieldErrors.price }}</small>
      </div>
    </div>

    <div class="px-5 py-4">
      <Message v-if="errorMessage" class="mb-3" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>
      <div class="flex items-center gap-3">
        <Button
          type="submit"
          :label="t('common.save')"
          icon="pi pi-check"
          :loading="submitting"
          :disabled="submitting"
        />
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          text
          :disabled="submitting"
          @click="emit('cancel')"
        />
      </div>
    </div>
  </form>
</template>
