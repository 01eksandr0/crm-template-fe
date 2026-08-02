<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Menu from 'primevue/menu';
import Avatar from 'primevue/avatar';
import type { MenuItem } from 'primevue/menuitem';
import { useAuthStore } from '@/features/auth/store/authStore';

const auth = useAuthStore();
const router = useRouter();
const { t } = useI18n();

const menu = ref();
const items = computed<MenuItem[]>(() => [
  {
    label: t('nav.profile'),
    icon: 'pi pi-user',
    command: () => {
      router.push({ name: 'profile' });
    },
  },
  { separator: true },
  {
    label: t('auth.logout'),
    icon: 'pi pi-sign-out',
    command: async () => {
      await auth.logout();
      router.push({ name: 'login' });
    },
  },
]);

const initials = computed(() => {
  const u = auth.user;
  if (!u) return '?';
  const a = (u.firstName?.[0] ?? u.email[0] ?? '').toUpperCase();
  const b = (u.lastName?.[0] ?? '').toUpperCase();
  return a + b || 'U';
});
</script>

<template>
  <div class="flex items-center gap-3">
    <span class="hidden text-sm text-slate-600 sm:block">{{ auth.fullName }}</span>
    <Avatar
      :label="initials"
      shape="circle"
      class="cursor-pointer !bg-indigo-600 !text-white"
      @click="menu.toggle($event)"
    />
    <Menu ref="menu" :model="items" :popup="true" />
  </div>
</template>
