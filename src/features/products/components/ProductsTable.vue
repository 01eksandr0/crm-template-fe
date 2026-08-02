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
import { usePermissions } from '@/shared/permissions/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import type { Product } from '../types';

const props = defineProps<{
  products: Product[];
  loading?: boolean;
  sortField?: string;
  sortOrder?: 1 | -1 | 0;
}>();

const emit = defineEmits<{
  open: [id: string];
  edit: [id: string];
  delete: [id: string];
  sort: [payload: { sortBy: 'number' | 'name' | 'price'; sortOrder: 'asc' | 'desc' }];
}>();

const { t } = useI18n();
const { formatNumber } = useFormat();
const { can } = usePermissions();

const menu = ref<InstanceType<typeof Menu> | null>(null);
const menuItems = ref<MenuItem[]>([]);

function onRowClick(event: { data: Product; originalEvent: Event }) {
  const target = event.originalEvent.target as HTMLElement | null;
  if (target?.closest('[data-row-actions]')) return;
  emit('open', event.data.id);
}

function onSort(event: DataTableSortEvent) {
  const allowed = ['number', 'name', 'price'] as const;
  const field = allowed.includes(event.sortField as (typeof allowed)[number])
    ? (event.sortField as (typeof allowed)[number])
    : 'name';
  const order = event.sortOrder === -1 ? 'desc' : 'asc';
  emit('sort', { sortBy: field, sortOrder: order });
}

function openMenu(event: Event, product: Product) {
  event.stopPropagation();
  const items: MenuItem[] = [
    {
      label: t('products.openCard'),
      icon: 'pi pi-box',
      command: () => emit('open', product.id),
    },
  ];
  if (can(PERMISSIONS.PRODUCTS_EDIT)) {
    items.push({
      label: t('common.edit'),
      icon: 'pi pi-pencil',
      command: () => emit('edit', product.id),
    });
  }
  if (can(PERMISSIONS.PRODUCTS_DELETE)) {
    items.push({ separator: true });
    items.push({
      label: t('common.delete'),
      icon: 'pi pi-trash',
      class: 'text-red-600',
      command: () => emit('delete', product.id),
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
      :value="products"
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
      <Column field="number" :header="t('products.fields.number')" sortable style="width: 4.5rem">
        <template #body="{ data }">
          <span class="tabular-nums text-slate-600">{{ data.number }}</span>
        </template>
      </Column>
      <Column field="name" :header="t('products.fields.name')" sortable>
        <template #body="{ data }">
          <span class="font-medium text-slate-800">{{ data.name }}</span>
        </template>
      </Column>
      <Column field="price" :header="t('products.fields.price')" sortable>
        <template #body="{ data }">
          {{ formatNumber(data.price) }}
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
