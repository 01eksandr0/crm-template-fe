<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';
import { useFormat } from '@/shared/composables/useFormat';
import { usePermissions } from '@/shared/permissions/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import type { UserRecord } from '../types';
import { fullName } from '../lib/helpers';
import UserStatusTags from './UserStatusTags.vue';

defineProps<{
  users: UserRecord[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  open: [id: string];
  edit: [id: string];
  delete: [id: string];
}>();

const { t } = useI18n();
const { formatDate } = useFormat();
const { can } = usePermissions();

const menu = ref<InstanceType<typeof Menu> | null>(null);
const menuItems = ref<MenuItem[]>([]);

function onRowClick(event: { data: UserRecord; originalEvent: Event }) {
  const target = event.originalEvent.target as HTMLElement | null;
  // Клік по меню/кнопці дій не відкриває картку.
  if (target?.closest('[data-row-actions]')) return;
  emit('open', event.data.id);
}

function openMenu(event: Event, user: UserRecord) {
  event.stopPropagation();
  const items: MenuItem[] = [
    {
      label: t('users.openCard'),
      icon: 'pi pi-id-card',
      command: () => emit('open', user.id),
    },
  ];
  if (can(PERMISSIONS.USERS_EDIT)) {
    items.push({
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      command: () => emit('edit', user.id),
    });
  }
  if (can(PERMISSIONS.USERS_DELETE)) {
    items.push({ separator: true });
    items.push({
      label: t('common.delete'),
      icon: 'pi pi-trash',
      class: 'text-red-600',
      command: () => emit('delete', user.id),
    });
  }
  menuItems.value = items;
  menu.value?.toggle(event);
}
</script>

<template>
  <div>
    <Menu ref="menu" :model="menuItems" popup />
    <DataTable
      :value="users"
      :loading="loading"
      data-key="id"
      striped-rows
      row-hover
      class="text-sm cursor-pointer"
      @row-click="onRowClick"
    >
      <Column :header="t('users.fields.fullName')">
        <template #body="{ data }">
          <span class="font-medium text-slate-800">{{ fullName(data) }}</span>
        </template>
      </Column>
      <Column field="email" :header="t('users.fields.email')" />
      <Column field="phone" :header="t('users.fields.phone')">
        <template #body="{ data }">
          {{ data.phone || t('common.empty') }}
        </template>
      </Column>
      <Column :header="t('users.fields.role')">
        <template #body="{ data }">
          {{ data.roleDisplayName }}
        </template>
      </Column>
      <Column :header="t('users.fields.hireDate')">
        <template #body="{ data }">
          {{ formatDate(data.hireDate) }}
        </template>
      </Column>
      <Column :header="t('users.fields.status')">
        <template #body="{ data }">
          <UserStatusTags :is-active="data.isActive" :on-vacation="data.onVacation" />
        </template>
      </Column>
      <Column style="width: 3.5rem">
        <template #body="{ data }">
          <div data-row-actions>
            <Button
              icon="pi pi-ellipsis-v"
              text
              rounded
              severity="secondary"
              :aria-label="t('common.actions')"
              @click="openMenu($event, data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
