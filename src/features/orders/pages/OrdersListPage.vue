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
import {
  fromQueryDate,
  queryNumber,
  queryString,
  toQueryDate,
  useRegistryQuery,
} from '@/shared/composables/useRegistryQuery';
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

const STATUSES: OrderStatus[] = ['new', 'inProduction', 'ready', 'completed', 'cancelled'];
const SORT_FIELDS = ['createdAt', 'number', 'totalAmount'] as const;

function readInitial() {
  const query = router.currentRoute.value.query;
  const search = queryString(query, 'search') ?? '';
  const statusRaw = queryString(query, 'status');
  const status = STATUSES.includes(statusRaw as OrderStatus) ? (statusRaw as OrderStatus) : null;
  const responsibleId = queryString(query, 'responsibleId') ?? null;
  const createdFrom = queryString(query, 'createdFrom');
  const createdTo = queryString(query, 'createdTo');
  const fromDate = fromQueryDate(createdFrom);
  const toDate = fromQueryDate(createdTo);
  const amount = queryNumber(query, 'amount') ?? null;
  const page = queryNumber(query, 'page') ?? 1;
  const limit = queryNumber(query, 'limit') ?? 25;
  const sortByRaw = queryString(query, 'sortBy');
  const sortBy = SORT_FIELDS.includes(sortByRaw as (typeof SORT_FIELDS)[number])
    ? (sortByRaw as (typeof SORT_FIELDS)[number])
    : 'createdAt';
  const sortOrder = queryString(query, 'sortOrder') === 'asc' ? 'asc' : 'desc';

  const createdAt =
    fromDate && toDate ? [fromDate, toDate] : fromDate ? [fromDate] : null;

  return {
    filterModel: {
      search,
      status,
      responsibleId,
      createdAt,
      amount,
    } satisfies FilterValues,
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      search: search || undefined,
      status: status ?? undefined,
      responsibleId: responsibleId ?? undefined,
      createdFrom: createdFrom,
      createdTo: createdTo,
      amount: amount ?? undefined,
    } satisfies OrdersListParams,
  };
}

const initial = readInitial();
const filterModel = ref<FilterValues>({ ...initial.filterModel });
const params = ref<OrdersListParams>({ ...initial.params });

const filterFields = computed<FilterField[]>(() => [
  {
    key: 'status',
    type: 'select',
    label: t('orders.fields.status'),
    options: STATUSES.map((s) => ({ label: t(`orders.status.${s}`), value: s })),
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

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
}

function applyFilters(values: FilterValues) {
  const range = Array.isArray(values.createdAt) ? (values.createdAt as unknown[]) : [];
  const from = toQueryDate(range[0]);
  const to = toQueryDate(range[1] ?? range[0]);

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

useRegistryQuery(
  () => ({
    search: params.value.search,
    status: params.value.status,
    responsibleId: params.value.responsibleId,
    createdFrom: params.value.createdFrom,
    createdTo: params.value.createdTo,
    amount: params.value.amount != null ? String(params.value.amount) : undefined,
    page: params.value.page !== 1 ? String(params.value.page) : undefined,
    limit: params.value.limit !== 25 ? String(params.value.limit) : undefined,
    sortBy: params.value.sortBy !== 'createdAt' ? params.value.sortBy : undefined,
    sortOrder: params.value.sortOrder !== 'desc' ? params.value.sortOrder : undefined,
  }),
  [params],
);

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
