<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import PhoneInput from '@/shared/ui/PhoneInput.vue';
import { normalizeOptionalPhone, formatUaPhone } from '@/shared/lib/phone';
import type { CreateUserPayload, UpdateUserPayload, UserRecord } from '../types';
import { fromPickerDate, toPickerDate } from '../lib/helpers';

const props = defineProps<{
  mode: 'create' | 'edit';
  initial?: UserRecord | null;
  submitting?: boolean;
  errorMessage?: string;
}>();

const emit = defineEmits<{
  submit: [payload: CreateUserPayload | UpdateUserPayload];
  cancel: [];
}>();

const { t } = useI18n();

const form = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  email: '',
  phone: '',
  password: '',
  birthDate: null as Date | null,
  hireDate: null as Date | null,
  isActive: true,
});

function hydrate(user?: UserRecord | null) {
  form.lastName = user?.lastName ?? '';
  form.firstName = user?.firstName ?? '';
  form.middleName = user?.middleName ?? '';
  form.email = user?.email ?? '';
  form.phone = formatUaPhone(user?.phone);
  form.password = '';
  form.birthDate = toPickerDate(user?.birthDate);
  form.hireDate = toPickerDate(user?.hireDate);
  form.isActive = user?.isActive ?? true;
}

hydrate(props.initial);
watch(
  () => props.initial,
  (value) => hydrate(value),
);

function onSubmit() {
  const base = {
    email: form.email.trim(),
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    middleName: form.middleName.trim() || null,
    phone: normalizeOptionalPhone(form.phone),
    birthDate: fromPickerDate(form.birthDate),
    hireDate: fromPickerDate(form.hireDate),
    isActive: form.isActive,
  };

  if (props.mode === 'create') {
    emit('submit', { ...base, password: form.password } satisfies CreateUserPayload);
    return;
  }

  const payload: UpdateUserPayload = { ...base };
  if (form.password.trim()) payload.password = form.password;
  emit('submit', payload);
}
</script>

<template>
  <form class="divide-y divide-slate-100" @submit.prevent="onSubmit">
    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="lastName">{{ t('users.fields.lastName') }} *</label>
      <InputText id="lastName" v-model="form.lastName" required class="w-full" />
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="firstName">{{ t('users.fields.firstName') }} *</label>
      <InputText id="firstName" v-model="form.firstName" required class="w-full" />
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="middleName">{{ t('users.fields.middleName') }}</label>
      <InputText id="middleName" v-model="form.middleName" class="w-full" />
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="email">{{ t('users.fields.email') }} *</label>
      <InputText id="email" v-model="form.email" type="email" required class="w-full" />
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="phone">{{ t('users.fields.phone') }}</label>
      <PhoneInput id="phone" v-model="form.phone" />
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="password">
        {{ t('users.fields.password') }}
        <span v-if="mode === 'create'">*</span>
      </label>
      <div>
        <Password
          id="password"
          v-model="form.password"
          :feedback="false"
          toggle-mask
          fluid
          input-class="w-full"
          :required="mode === 'create'"
          autocomplete="new-password"
        />
        <p v-if="mode === 'edit'" class="mt-1 text-xs text-slate-500">{{ t('users.passwordHint') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500">{{ t('users.fields.birthDate') }}</label>
      <DatePicker
        v-model="form.birthDate"
        date-format="dd.mm.yy"
        show-icon
        show-button-bar
        fluid
        :max-date="new Date()"
      />
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500">{{ t('users.fields.hireDate') }}</label>
      <DatePicker
        v-model="form.hireDate"
        date-format="dd.mm.yy"
        show-icon
        show-button-bar
        fluid
      />
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="isActive">{{ t('users.fields.isActive') }}</label>
      <ToggleSwitch v-model="form.isActive" input-id="isActive" />
    </div>

    <div class="px-5 py-4">
      <Message v-if="errorMessage" class="mb-3" severity="error" :closable="false">
        {{ errorMessage }}
      </Message>
      <div class="flex items-center gap-3">
        <Button type="submit" :label="t('common.save')" icon="pi pi-check" :loading="submitting" />
        <Button
          type="button"
          :label="t('common.cancel')"
          severity="secondary"
          text
          @click="emit('cancel')"
        />
      </div>
    </div>
  </form>
</template>
