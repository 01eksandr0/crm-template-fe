<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuery } from '@tanstack/vue-query';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import PageHeader from '@/shared/ui/PageHeader.vue';
import StateSection from '@/shared/ui/StateSection.vue';
import FilterBar from '@/shared/ui/filter/FilterBar.vue';
import type { FilterField, FilterValues } from '@/shared/ui/filter/types';
import { usePermissions } from '@/shared/permissions/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { useOrdersList } from '../composables/useOrdersList';
import { dictionariesApi } from '../api/dictionariesApi';
import OrdersTable from '../components/OrdersTable.vue';
import type { OrderStatus, OrdersListParams } from '../types';

const router = useRouter();
const { t } = useI18n();
const { can } = usePermissions();

const { data: users } = useQuery({
  queryKey: ['dict', 'users'],
  queryFn: () => dictionariesApi.users(),
});

const filterModel = ref<FilterValues>({
  search: '',
  status: null,
  responsibleId: null,
  createdAt: null,
  amount: null,
});

const params = ref<OrdersListParams>({
  page: 1,
  limit: 25,
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

const filterFields = computed<FilterField[]>(() => [
  {
    key: 'status',
    type: 'select',
    label: t('orders.fields.status'),
    options: (
      ['new', 'inProduction', 'ready', 'completed', 'cancelled'] as OrderStatus[]
    ).map((s) => ({ label: t(`orders.status.${s}`), value: s })),
  },
  {
    key: 'responsibleId',
    type: 'select',
    label: t('orders.fields.responsible'),
    options: (users.value ?? []).map((u) => ({ label: u.name, value: u.id })),
  },
  {
    key: 'createdAt',
    type: 'dateRange',
    label: t('orders.filters.date'),
  },
  {
    key: 'amount',
    type: 'number',
    label: t('orders.filters.amount'),
    min: 0,
    placeholder: '0',
  },
]);

function toDateParam(value: unknown): string | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'string' && value.trim()) return value.slice(0, 10);
  return undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
}

function applyFilters(values: FilterValues) {
  const range = Array.isArray(values.createdAt) ? (values.createdAt as unknown[]) : [];
  const from = toDateParam(range[0]);
  const to = toDateParam(range[1] ?? range[0]);

  params.value = {
    ...params.value,
    page: 1,
    search: String(values.search ?? '').trim() || undefined,
    status: typeof values.status === 'string' ? (values.status as OrderStatus) : undefined,
    responsibleId:
      typeof values.responsibleId === 'string' ? values.responsibleId : undefined,
    createdFrom: from,
    createdTo: to,
    amount: toOptionalNumber(values.amount),
  };
}

const { data, isLoading, isError, isFetching } = useOrdersList(params);
const total = computed(() => data.value?.meta.total ?? 0);
const orders = computed(() => data.value?.items ?? []);
const tableSortOrder = computed(() => (params.value.sortOrder === 'asc' ? 1 : -1) as 1 | -1);
const hasActiveQuery = computed(
  () =>
    Boolean(params.value.search) ||
    Boolean(params.value.status) ||
    Boolean(params.value.responsibleId) ||
    Boolean(params.value.createdFrom) ||
    Boolean(params.value.createdTo) ||
    params.value.amount !== undefined,
);

function onPage(event: { page: number; rows: number }) {
  params.value = { ...params.value, page: event.page + 1, limit: event.rows };
}

function onSort(payload: {
  sortBy: 'createdAt' | 'number' | 'totalAmount';
  sortOrder: 'asc' | 'desc';
}) {
  params.value = { ...params.value, page: 1, ...payload };
}
</script>

<template>
  <div>
    <PageHeader :title="t('orders.title')" :subtitle="t('orders.subtitle')">
      <template #actions>
        <Button
          v-if="can(PERMISSIONS.ORDERS_ADD)"
          :label="t('orders.create')"
          icon="pi pi-plus"
          @click="router.push({ name: 'orders-create' })"
        />
      </template>
    </PageHeader>

    <FilterBar
      v-model="filterModel"
      :fields="filterFields"
      :search-placeholder="t('orders.searchPlaceholder')"
      @apply="applyFilters"
    />

    <StateSection :loading="isLoading" :error="isError ? t('orders.loadError') : null">
      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <OrdersTable
          :orders="orders"
          :loading="isFetching && !isLoading"
          :sort-field="params.sortBy"
          :sort-order="tableSortOrder"
          @open="(id) => router.push({ name: 'orders-detail', params: { id } })"
          @sort="onSort"
        />
        <div
          v-if="!isLoading && orders.length === 0"
          class="border-t border-slate-100 px-4 py-10 text-center"
        >
          <p class="mb-4 text-sm text-slate-500">
            {{ hasActiveQuery ? t('filter.nothingFound') : t('orders.empty') }}
          </p>
          <Button
            v-if="!hasActiveQuery && can(PERMISSIONS.ORDERS_ADD)"
            :label="t('orders.create')"
            icon="pi pi-plus"
            @click="router.push({ name: 'orders-create' })"
          />
        </div>
        <Paginator
          v-if="total > 0"
          :rows="params.limit ?? 25"
          :total-records="total"
          :first="((params.page ?? 1) - 1) * (params.limit ?? 25)"
          :rows-per-page-options="[25, 50, 100]"
          @page="onPage"
        />
      </div>
    </StateSection>
  </div>
</template>
