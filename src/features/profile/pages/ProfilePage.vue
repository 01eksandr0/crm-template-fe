<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Message from 'primevue/message';
import PageHeader from '@/shared/ui/PageHeader.vue';
import StateSection from '@/shared/ui/StateSection.vue';
import DetailCard from '@/shared/ui/DetailCard.vue';
import DetailRow from '@/shared/ui/DetailRow.vue';
import PhoneInput from '@/shared/ui/PhoneInput.vue';
import { hasPhoneDigits, normalizeOptionalPhone, formatUaPhone } from '@/shared/lib/phone';
import { useBreadcrumbs } from '@/shared/breadcrumbs/useBreadcrumbs';
import { useAuthStore } from '@/features/auth/store/authStore';
import { resolveErrorMessage } from '@/shared/errors/errors';
import { useProfile, useUpdateProfile } from '../composables/useProfile';

const { t } = useI18n();
const toast = useToast();
const auth = useAuthStore();

useBreadcrumbs(() => [{ label: t('profile.title') }]);

const { data: profile, isLoading, isError } = useProfile();
const update = useUpdateProfile();

const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
});

const fieldErrors = reactive({
  firstName: '',
  lastName: '',
  phone: '',
});

const formError = ref('');

function hydrate() {
  form.firstName = profile.value?.firstName ?? '';
  form.lastName = profile.value?.lastName ?? '';
  form.phone = formatUaPhone(profile.value?.phone);
  fieldErrors.firstName = '';
  fieldErrors.lastName = '';
  fieldErrors.phone = '';
  formError.value = '';
}

watch(profile, () => hydrate(), { immediate: true });

const dirty = computed(() => {
  if (!profile.value) return false;
  return (
    form.firstName.trim() !== (profile.value.firstName ?? '') ||
    form.lastName.trim() !== (profile.value.lastName ?? '') ||
    form.phone.trim() !== (profile.value.phone ?? '')
  );
});

function validateField(field: 'firstName' | 'lastName' | 'phone') {
  if (field === 'firstName' || field === 'lastName') {
    const value = form[field].trim();
    if (!value) {
      fieldErrors[field] = t('validation.required');
      return false;
    }
    if (value.length > 30) {
      fieldErrors[field] = t('validation.maxLength');
      return false;
    }
    fieldErrors[field] = '';
    return true;
  }

  const phone = form.phone.trim();
  if (!phone || !hasPhoneDigits(phone)) {
    // optional: порожнє ок, частково заповнене — помилка
    if (phone && !hasPhoneDigits(phone)) {
      fieldErrors.phone = t('validation.phone');
      return false;
    }
    fieldErrors.phone = '';
    return true;
  }
  if (phone.length > 32 || !/^[0-9\s()+-]+$/.test(phone)) {
    fieldErrors.phone = t('validation.phone');
    return false;
  }
  fieldErrors.phone = '';
  return true;
}

function validateAll() {
  const a = validateField('firstName');
  const b = validateField('lastName');
  const c = validateField('phone');
  return a && b && c;
}

async function onSave() {
  formError.value = '';
  if (!validateAll()) return;

  try {
    const updated = await update.mutateAsync({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: normalizeOptionalPhone(form.phone),
    });
    if (auth.user) {
      auth.user = {
        ...auth.user,
        firstName: updated.firstName,
        lastName: updated.lastName,
      };
    }
    toast.add({ severity: 'success', summary: t('profile.saved'), life: 2500 });
  } catch (e) {
    formError.value = resolveErrorMessage(e);
  }
}

function onCancel() {
  hydrate();
}
</script>

<template>
  <div>
    <PageHeader :title="t('profile.title')" :subtitle="t('profile.subtitle')" />

    <StateSection :loading="isLoading" :error="isError ? t('profile.loadError') : null">
      <div v-if="profile" class="flex w-full flex-col gap-6">
        <DetailCard :title="t('common.basicInfo')">
          <DetailRow :label="t('profile.fields.email')" :value="profile.email" />
          <DetailRow :label="t('profile.fields.role')" :value="profile.roleDisplayName" />
        </DetailCard>

        <DetailCard :title="t('profile.personal')">
          <form class="divide-y divide-slate-100" @submit.prevent="onSave">
            <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
              <label class="text-sm text-slate-500" for="firstName">
                {{ t('profile.fields.firstName') }} *
              </label>
              <div>
                <InputText
                  id="firstName"
                  v-model="form.firstName"
                  class="w-full"
                  :disabled="update.isPending.value"
                  @blur="validateField('firstName')"
                />
                <small v-if="fieldErrors.firstName" class="text-red-600">
                  {{ fieldErrors.firstName }}
                </small>
              </div>
            </div>

            <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
              <label class="text-sm text-slate-500" for="lastName">
                {{ t('profile.fields.lastName') }} *
              </label>
              <div>
                <InputText
                  id="lastName"
                  v-model="form.lastName"
                  class="w-full"
                  :disabled="update.isPending.value"
                  @blur="validateField('lastName')"
                />
                <small v-if="fieldErrors.lastName" class="text-red-600">
                  {{ fieldErrors.lastName }}
                </small>
              </div>
            </div>

            <div class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6">
              <label class="text-sm text-slate-500" for="phone">
                {{ t('profile.fields.phone') }}
              </label>
              <div>
                <PhoneInput
                  id="phone"
                  v-model="form.phone"
                  :disabled="update.isPending.value"
                  :invalid="!!fieldErrors.phone"
                  @blur="validateField('phone')"
                />
                <small v-if="fieldErrors.phone" class="text-red-600">{{ fieldErrors.phone }}</small>
              </div>
            </div>

            <div class="px-5 py-4">
              <Message v-if="formError" class="mb-3" severity="error" :closable="false">
                {{ formError }}
              </Message>
              <div class="flex items-center gap-3">
                <Button
                  type="submit"
                  :label="t('common.save')"
                  icon="pi pi-check"
                  :loading="update.isPending.value"
                  :disabled="!dirty || update.isPending.value"
                />
                <Button
                  type="button"
                  :label="t('common.cancel')"
                  severity="secondary"
                  text
                  :disabled="!dirty || update.isPending.value"
                  @click="onCancel"
                />
              </div>
            </div>
          </form>
        </DetailCard>
      </div>
    </StateSection>
  </div>
</template>
