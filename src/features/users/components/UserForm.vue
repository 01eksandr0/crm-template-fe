<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import ToggleSwitch from 'primevue/toggleswitch';
import DatePicker from 'primevue/datepicker';
import Message from 'primevue/message';
import { normalizeOptionalPhone, formatUaPhone, formatUaMask, phoneValidationError, subscriberDigits } from '@/shared/lib/phone';
import { isValidLogin, normalizeLogin } from '@/shared/lib/login';
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
const phoneRef = ref<HTMLInputElement | null>(null);

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

const fieldErrors = reactive({
  lastName: '',
  firstName: '',
  email: '',
  password: '',
  phone: '',
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
  fieldErrors.lastName = '';
  fieldErrors.firstName = '';
  fieldErrors.email = '';
  fieldErrors.password = '';
  fieldErrors.phone = '';
}

hydrate(props.initial);
watch(
  () => props.initial,
  (value) => hydrate(value),
);

function applyPhoneError(value = form.phone) {
  const err = phoneValidationError(value, false);
  fieldErrors.phone = err ? t(`validation.${err}`) : '';
  return !err;
}

function onPhoneInput() {
  const digits = subscriberDigits(form.phone);
  form.phone = digits ? formatUaMask(digits) : '';
  applyPhoneError(form.phone);
}

function onSubmit() {
  if (phoneRef.value) form.phone = phoneRef.value.value;
  let ok = true;
  if (!applyPhoneError(form.phone)) ok = false;

  if (!form.lastName.trim()) {
    fieldErrors.lastName = t('validation.required');
    ok = false;
  } else fieldErrors.lastName = '';

  if (!form.firstName.trim()) {
    fieldErrors.firstName = t('validation.required');
    ok = false;
  } else fieldErrors.firstName = '';

  const login = normalizeLogin(form.email);
  if (!isValidLogin(login)) {
    fieldErrors.email = t('validation.login');
    ok = false;
  } else fieldErrors.email = '';

  if (props.mode === 'create' && !form.password.trim()) {
    fieldErrors.password = t('validation.required');
    ok = false;
  } else if (form.password.trim() && form.password.trim().length < 8) {
    fieldErrors.password = t('validation.passwordMin');
    ok = false;
  } else fieldErrors.password = '';

  if (!ok) return;

  const base = {
    email: login,
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
  <form class="divide-y divide-slate-100" novalidate @submit.prevent="onSubmit">
    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="lastName">{{ t('users.fields.lastName') }} *</label>
      <div>
        <InputText
          id="lastName"
          v-model="form.lastName"
          class="w-full"
          :invalid="!!fieldErrors.lastName"
        />
        <small v-if="fieldErrors.lastName" class="text-red-600">{{ fieldErrors.lastName }}</small>
      </div>
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="firstName">{{ t('users.fields.firstName') }} *</label>
      <div>
        <InputText
          id="firstName"
          v-model="form.firstName"
          class="w-full"
          :invalid="!!fieldErrors.firstName"
        />
        <small v-if="fieldErrors.firstName" class="text-red-600">{{ fieldErrors.firstName }}</small>
      </div>
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="middleName">{{ t('users.fields.middleName') }}</label>
      <InputText id="middleName" v-model="form.middleName" class="w-full" />
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="email">{{ t('users.fields.email') }} *</label>
      <div>
        <InputText
          id="email"
          v-model="form.email"
          type="text"
          autocomplete="username"
          maxlength="254"
          class="w-full"
          :placeholder="t('users.loginPlaceholder')"
          :invalid="!!fieldErrors.email"
          @blur="form.email = form.email.trim().toLowerCase()"
        />
        <small v-if="fieldErrors.email" class="text-red-600">{{ fieldErrors.email }}</small>
        <p class="mt-1 text-xs text-slate-500">{{ t('users.loginHint') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
      <label class="text-sm text-slate-500" for="phone">{{ t('users.fields.phone') }}</label>
      <div>
        <input
          id="phone"
          ref="phoneRef"
          v-model="form.phone"
          type="text"
          inputmode="numeric"
          autocomplete="tel"
          name="userPhone"
          class="p-inputtext p-component w-full"
          :class="{ 'p-invalid': !!fieldErrors.phone }"
          placeholder="+380 (XX) XXX-XX-XX"
          @input="onPhoneInput"
        />
        <small v-if="fieldErrors.phone" class="text-red-600">{{ fieldErrors.phone }}</small>
      </div>
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
          :invalid="!!fieldErrors.password"
          autocomplete="new-password"
        />
        <small v-if="fieldErrors.password" class="text-red-600">{{ fieldErrors.password }}</small>
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
