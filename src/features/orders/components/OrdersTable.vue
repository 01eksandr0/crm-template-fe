<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import type { DataTableSortEvent } from 'primevue/datatable';
import type { MenuItem } from 'primevue/menuitem';
import { useFormat } from '@/shared/composables/useFormat';
import type { Order } from '../types';
import OrderStatusBadge from './OrderStatusBadge.vue';

const props = defineProps<{
  orders: Order[];
  loading?: boolean;
  sortField?: string;
  sortOrder?: 1 | -1 | 0;
}>();

const emit = defineEmits<{
  open: [id: string];
  sort: [payload: { sortBy: 'createdAt' | 'number' | 'totalAmount'; sortOrder: 'asc' | 'desc' }];
}>();

const { t } = useI18n();
const { formatNumber, formatDate } = useFormat();

const menu = ref<InstanceType<typeof Menu> | null>(null);
const menuItems = ref<MenuItem[]>([]);

function onRowClick(event: { data: Order; originalEvent: Event }) {
  const target = event.originalEvent.target as HTMLElement | null;
  if (target?.closest('[data-row-actions]')) return;
  emit('open', event.data.id);
}

function onSort(event: DataTableSortEvent) {
  const field =
    event.sortField === 'number'
      ? 'number'
      : event.sortField === 'totalAmount'
        ? 'totalAmount'
        : 'createdAt';
  const order = event.sortOrder === 1 ? 'asc' : 'desc';
  emit('sort', { sortBy: field, sortOrder: order });
}

function openMenu(event: Event, order: Order) {
  event.stopPropagation();
  menuItems.value = [
    {
      label: t('orders.openCard'),
      icon: 'pi pi-eye',
      command: () => emit('open', order.id),
    },
  ];
  menu.value?.toggle(event);
}
</script>

<template>
  <div>
    <Menu ref="menu" :model="menuItems" popup />
    <DataTable
      :value="orders"
      :loading="loading"
      data-key="id"
      striped-rows
      row-hover
      lazy
      removable-sort
      :sort-field="props.sortField"
      :sort-order="props.sortOrder"
      class="cursor-pointer text-sm"
      @row-click="onRowClick"
      @sort="onSort"
    >
      <Column field="number" :header="t('orders.fields.number')" sortable>
        <template #body="{ data }">
          <span class="font-medium text-slate-800">{{ data.number }}</span>
        </template>
      </Column>
      <Column field="customerName" :header="t('orders.fields.customer')" />
      <Column field="createdAt" :header="t('orders.fields.date')" sortable>
        <template #body="{ data }">{{ formatDate(data.createdAt) }}</template>
      </Column>
      <Column :header="t('orders.fields.status')">
        <template #body="{ data }">
          <OrderStatusBadge :status="data.status" />
        </template>
      </Column>
      <Column field="totalAmount" :header="t('orders.fields.total')" sortable>
        <template #body="{ data }">{{ formatNumber(data.totalAmount) }}</template>
      </Column>
      <Column field="responsibleName" :header="t('orders.fields.responsible')" />
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
