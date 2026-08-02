<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import Button from 'primevue/button';
import Message from 'primevue/message';
import Checkbox from 'primevue/checkbox';
import { resolveErrorMessage } from '@/shared/errors/errors';
import { normalizeLogin } from '@/shared/lib/login';
import { useLogin } from '../composables/useLogin';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { t } = useI18n();

const login = useLogin();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const errorMessage = ref('');

async function onSubmit() {
  errorMessage.value = '';
  try {
    await login.mutateAsync({
      email: normalizeLogin(email.value),
      password: password.value,
      rememberMe: rememberMe.value,
    });
    const redirect = (route.query.redirect as string) || '/dashboard';
    toast.add({ severity: 'success', summary: t('auth.loginSuccess'), life: 2000 });
    router.push(redirect);
  } catch (e) {
    errorMessage.value = resolveErrorMessage(e);
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100 p-4">
    <div class="w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-8">
      <div class="mb-8 text-center">
        <div
          class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white"
        >
          <i class="pi pi-bolt text-xl" />
        </div>
        <h1 class="text-2xl font-semibold text-slate-800">{{ t('login.title') }}</h1>
        <p class="text-sm text-slate-500">{{ t('login.subtitle') }}</p>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
        <div class="flex flex-col gap-1.5">
          <label for="email" class="text-sm font-medium text-slate-700">
            {{ t('login.email') }}
          </label>
          <InputText
            id="email"
            v-model="email"
            type="text"
            autocomplete="username"
            maxlength="254"
            :placeholder="t('login.emailPlaceholder')"
            class="w-full"
            @blur="email = email.trim().toLowerCase()"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label for="password" class="text-sm font-medium text-slate-700">
            {{ t('login.password') }}
          </label>
          <Password
            id="password"
            v-model="password"
            :feedback="false"
            toggle-mask
            input-class="w-full"
            class="w-full"
            fluid
            autocomplete="current-password"
          />
        </div>

        <div class="flex items-center gap-2">
          <Checkbox v-model="rememberMe" input-id="rememberMe" :binary="true" />
          <label for="rememberMe" class="text-sm text-slate-600 select-none cursor-pointer">
            {{ t('login.rememberMe') }}
          </label>
        </div>

        <Message v-if="errorMessage" severity="error" :closable="false">
          {{ errorMessage }}
        </Message>

        <Button
          type="submit"
          :label="t('login.submit')"
          icon="pi pi-sign-in"
          :loading="login.isPending.value"
          class="w-full"
        />
      </form>
    </div>
  </div>
</template>
