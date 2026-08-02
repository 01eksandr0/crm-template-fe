<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuery } from '@tanstack/vue-query';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { dictionariesApi } from '@/features/orders/api/dictionariesApi';
import type { Customer, CustomerPayload } from '../types';

const props = defineProps<{
  mode: 'create' | 'edit';
  initial?: Customer | null;
  submitting?: boolean;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  submit: [payload: CustomerPayload];
  cancel: [];
}>();

const { t } = useI18n();

const { data: deliveryMethods } = useQuery({
  queryKey: ['dict', 'delivery'],
  queryFn: () => dictionariesApi.deliveryMethods(),
});

const form = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  phone: '',
  city: '',
  deliveryMethodId: null as string | null,
  deliveryPostOffice: '',
  deliveryAddress: '',
});

const fieldErrors = reactive({
  lastName: '',
  firstName: '',
  phone: '',
  city: '',
  deliveryExtra: '',
});

function hydrate(customer?: Customer | null) {
  form.lastName = customer?.lastName ?? '';
  form.firstName = customer?.firstName ?? '';
  form.middleName = customer?.middleName ?? '';
  form.phone = customer?.phone ?? '';
  form.city = customer?.city ?? '';
  form.deliveryMethodId = customer?.deliveryMethodId ?? null;
  form.deliveryPostOffice = customer?.deliveryPostOffice ?? '';
  form.deliveryAddress = customer?.deliveryAddress ?? '';
  fieldErrors.lastName = '';
  fieldErrors.firstName = '';
  fieldErrors.phone = '';
  fieldErrors.city = '';
  fieldErrors.deliveryExtra = '';
}

hydrate(props.initial);
watch(
  () => props.initial,
  (value) => hydrate(value),
);

const selectedDeliveryCode = computed(() => {
  const id = form.deliveryMethodId;
  if (!id) return null;
  return deliveryMethods.value?.find((d) => d.id === id)?.code ?? null;
});

function onDeliveryChange() {
  const code = selectedDeliveryCode.value;
  if (code !== 'post') form.deliveryPostOffice = '';
  if (code !== 'courier') form.deliveryAddress = '';
  fieldErrors.deliveryExtra = '';
}

function requireText(value: string, key: keyof typeof fieldErrors) {
  if (!value.trim()) {
    fieldErrors[key] = t('validation.required');
    return false;
  }
  fieldErrors[key] = '';
  return true;
}

function validate() {
  let ok = true;
  if (!requireText(form.lastName, 'lastName')) ok = false;
  if (!requireText(form.firstName, 'firstName')) ok = false;
  if (!form.phone.trim()) {
    fieldErrors.phone = t('validation.phone');
    ok = false;
  } else {
    fieldErrors.phone = '';
  }
  if (!requireText(form.city, 'city')) ok = false;

  if (selectedDeliveryCode.value === 'post') {
    if (!form.deliveryPostOffice.trim()) {
      fieldErrors.deliveryExtra = t('validation.deliveryPostOffice');
      ok = false;
    } else fieldErrors.deliveryExtra = '';
  } else if (selectedDeliveryCode.value === 'courier') {
    if (!form.deliveryAddress.trim()) {
      fieldErrors.deliveryExtra = t('validation.deliveryAddress');
      ok = false;
    } else fieldErrors.deliveryExtra = '';
  } else {
    fieldErrors.deliveryExtra = '';
  }
  return ok;
}

function onSubmit() {
  if (!validate()) return;
  emit('submit', {
    lastName: form.lastName.trim(),
    firstName: form.firstName.trim(),
    middleName: form.middleName.trim() || null,
    phone: form.phone.trim(),
    city: form.city.trim(),
    deliveryMethodId: form.deliveryMethodId,
    deliveryPostOffice:
      selectedDeliveryCode.value === 'post' ? form.deliveryPostOffice.trim() : null,
    deliveryAddress:
      selectedDeliveryCode.value === 'courier' ? form.deliveryAddress.trim() : null,
  });
}
</script>

<template>
  <form class="divide-y divide-slate-100" @submit.prevent="onSubmit">
    <div
      class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
    >
      <label class="text-sm text-slate-500">{{ t('customers.fields.lastName') }} *</label>
      <div>
        <InputText v-model="form.lastName" class="w-full" :disabled="submitting" maxlength="50" />
        <small v-if="fieldErrors.lastName" class="text-red-600">{{ fieldErrors.lastName }}</small>
      </div>
    </div>

    <div
      class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
    >
      <label class="text-sm text-slate-500">{{ t('customers.fields.firstName') }} *</label>
      <div>
        <InputText v-model="form.firstName" class="w-full" :disabled="submitting" maxlength="50" />
        <small v-if="fieldErrors.firstName" class="text-red-600">{{ fieldErrors.firstName }}</small>
      </div>
    </div>

    <div
      class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
    >
      <label class="text-sm text-slate-500">{{ t('customers.fields.middleName') }}</label>
      <InputText v-model="form.middleName" class="w-full" :disabled="submitting" maxlength="50" />
    </div>

    <div
      class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
    >
      <label class="text-sm text-slate-500">{{ t('customers.fields.phone') }} *</label>
      <div>
        <InputText v-model="form.phone" class="w-full" :disabled="submitting" maxlength="20" />
        <small v-if="fieldErrors.phone" class="text-red-600">{{ fieldErrors.phone }}</small>
      </div>
    </div>

    <div
      class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
    >
      <label class="text-sm text-slate-500">{{ t('customers.fields.city') }} *</label>
      <div>
        <InputText v-model="form.city" class="w-full" :disabled="submitting" maxlength="100" />
        <small v-if="fieldErrors.city" class="text-red-600">{{ fieldErrors.city }}</small>
      </div>
    </div>

    <div
      class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
    >
      <label class="text-sm text-slate-500">{{ t('customers.fields.delivery') }}</label>
      <Select
        v-model="form.deliveryMethodId"
        :options="deliveryMethods ?? []"
        option-label="name"
        option-value="id"
        show-clear
        class="w-full"
        :disabled="submitting"
        :placeholder="t('filter.any')"
        @update:model-value="onDeliveryChange"
      />
    </div>

    <div
      v-if="selectedDeliveryCode === 'post'"
      class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
    >
      <label class="text-sm text-slate-500">{{ t('customers.fields.deliveryPostOffice') }} *</label>
      <div>
        <InputText
          v-model="form.deliveryPostOffice"
          class="w-full"
          :disabled="submitting"
        />
        <small v-if="fieldErrors.deliveryExtra" class="text-red-600">
          {{ fieldErrors.deliveryExtra }}
        </small>
      </div>
    </div>

    <div
      v-if="selectedDeliveryCode === 'courier'"
      class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
    >
      <label class="text-sm text-slate-500">{{ t('customers.fields.deliveryAddress') }} *</label>
      <div>
        <InputText v-model="form.deliveryAddress" class="w-full" :disabled="submitting" />
        <small v-if="fieldErrors.deliveryExtra" class="text-red-600">
          {{ fieldErrors.deliveryExtra }}
        </small>
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
