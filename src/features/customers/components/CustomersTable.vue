<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import type { DataTableSortEvent } from 'primevue/datatable';
import type { MenuItem } from 'primevue/menuitem';
import { usePermissions } from '@/shared/permissions/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import type { Customer } from '../types';

const props = defineProps<{
  customers: Customer[];
  loading?: boolean;
  sortField?: string;
  sortOrder?: 1 | -1 | 0;
}>();

const emit = defineEmits<{
  open: [id: string];
  edit: [id: string];
  delete: [id: string];
  sort: [
    payload: {
      sortBy: 'lastName' | 'phone' | 'city' | 'createdAt';
      sortOrder: 'asc' | 'desc';
    },
  ];
}>();

const { t } = useI18n();
const { can } = usePermissions();

const menu = ref<InstanceType<typeof Menu> | null>(null);
const menuItems = ref<MenuItem[]>([]);

function onRowClick(event: { data: Customer; originalEvent: Event }) {
  const target = event.originalEvent.target as HTMLElement | null;
  if (target?.closest('[data-row-actions]')) return;
  emit('open', event.data.id);
}

function onSort(event: DataTableSortEvent) {
  const allowed = ['lastName', 'phone', 'city', 'createdAt'] as const;
  const field = allowed.includes(event.sortField as (typeof allowed)[number])
    ? (event.sortField as (typeof allowed)[number])
    : 'lastName';
  const order = event.sortOrder === -1 ? 'desc' : 'asc';
  emit('sort', { sortBy: field, sortOrder: order });
}

function openMenu(event: Event, customer: Customer) {
  event.stopPropagation();
  const items: MenuItem[] = [
    {
      label: t('customers.openCard'),
      icon: 'pi pi-id-card',
      command: () => emit('open', customer.id),
    },
  ];
  if (can(PERMISSIONS.CUSTOMERS_EDIT)) {
    items.push({
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      command: () => emit('edit', customer.id),
    });
  }
  if (can(PERMISSIONS.CUSTOMERS_DELETE)) {
    items.push({ separator: true });
    items.push({
      label: t('common.delete'),
      icon: 'pi pi-trash',
      class: 'text-red-600',
      command: () => emit('delete', customer.id),
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
      :value="customers"
      :loading="loading"
      data-key="id"
      striped-rows
      row-hover
      lazy
      removable-sort
      :sort-field="props.sortField"
      :sort-order="props.sortOrder"
      class="text-sm cursor-pointer"
      @row-click="onRowClick"
      @sort="onSort"
    >
      <Column field="lastName" :header="t('customers.fields.displayName')" sortable>
        <template #body="{ data }">
          <span class="font-medium text-slate-800">{{ data.displayName }}</span>
        </template>
      </Column>
      <Column field="phone" :header="t('customers.fields.phone')" sortable />
      <Column field="city" :header="t('customers.fields.city')" sortable />
      <Column field="deliveryMethodName" :header="t('customers.fields.delivery')">
        <template #body="{ data }">
          {{ data.deliveryMethodName || t('common.empty') }}
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
