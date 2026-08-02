<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import ConfirmDialog from 'primevue/confirmdialog';
import PageHeader from '@/shared/ui/PageHeader.vue';
import StateSection from '@/shared/ui/StateSection.vue';
import FilterBar from '@/shared/ui/filter/FilterBar.vue';
import type { FilterField, FilterValues } from '@/shared/ui/filter/types';
import {
  queryNumber,
  queryString,
  useRegistryQuery,
} from '@/shared/composables/useRegistryQuery';
import { usePermissions } from '@/shared/permissions/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { resolveErrorMessage } from '@/shared/errors/errors';
import { useCustomersList } from '../composables/useCustomersList';
import { useDeleteCustomer } from '../composables/useCustomerMutations';
import CustomersTable from '../components/CustomersTable.vue';
import type { CustomersListParams } from '../types';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const { can } = usePermissions();
const remove = useDeleteCustomer();

const SORT_FIELDS = ['lastName', 'phone', 'city', 'createdAt'] as const;

function readInitial() {
  const query = router.currentRoute.value.query;
  const search = queryString(query, 'search') ?? '';
  const page = queryNumber(query, 'page') ?? 1;
  const limit = queryNumber(query, 'limit') ?? 25;
  const sortByRaw = queryString(query, 'sortBy');
  const sortBy = SORT_FIELDS.includes(sortByRaw as (typeof SORT_FIELDS)[number])
    ? (sortByRaw as (typeof SORT_FIELDS)[number])
    : 'lastName';
  const sortOrder = queryString(query, 'sortOrder') === 'desc' ? 'desc' : 'asc';

  return {
    filterModel: { search } satisfies FilterValues,
    params: {
      page,
      limit,
      sortBy,
      sortOrder,
      search: search || undefined,
    } satisfies CustomersListParams,
  };
}

const initial = readInitial();
const filterModel = ref<FilterValues>({ ...initial.filterModel });
const params = ref<CustomersListParams>({ ...initial.params });

const filterFields = computed<FilterField[]>(() => []);

function applyFilters(values: FilterValues) {
  params.value = {
    ...params.value,
    page: 1,
    search: String(values.search ?? '').trim() || undefined,
  };
}

useRegistryQuery(
  () => ({
    search: params.value.search,
    page: params.value.page !== 1 ? String(params.value.page) : undefined,
    limit: params.value.limit !== 25 ? String(params.value.limit) : undefined,
    sortBy: params.value.sortBy !== 'lastName' ? params.value.sortBy : undefined,
    sortOrder: params.value.sortOrder !== 'asc' ? params.value.sortOrder : undefined,
  }),
  [params],
);

const { data, isLoading, isError, isFetching } = useCustomersList(params);
const total = computed(() => data.value?.meta.total ?? 0);
const customers = computed(() => data.value?.items ?? []);

const tableSortOrder = computed(() => {
  if (params.value.sortOrder === 'desc') return -1 as const;
  return 1 as const;
});

function onPage(event: { page: number; rows: number }) {
  params.value = { ...params.value, page: event.page + 1, limit: event.rows };
}

function onSort(payload: {
  sortBy: 'lastName' | 'phone' | 'city' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}) {
  params.value = { ...params.value, page: 1, ...payload };
}

function onDelete(id: string) {
  const customer = customers.value.find((c) => c.id === id);
  const name = customer?.displayName ?? id;
  confirm.require({
    message: t('customers.deleteConfirm', { name }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    accept: async () => {
      try {
        await remove.mutateAsync(id);
        toast.add({ severity: 'success', summary: t('customers.deleted'), life: 2500 });
      } catch (e) {
        toast.add({
          severity: 'error',
          summary: t('common.error'),
          detail: resolveErrorMessage(e),
          life: 4000,
        });
      }
    },
  });
}
</script>

<template>
  <div>
    <ConfirmDialog />
    <PageHeader :title="t('customers.title')" :subtitle="t('customers.subtitle')">
      <template #actions>
        <Button
          v-if="can(PERMISSIONS.CUSTOMERS_ADD)"
          :label="t('customers.create')"
          icon="pi pi-plus"
          @click="router.push({ name: 'customers-create' })"
        />
      </template>
    </PageHeader>

    <FilterBar
      v-model="filterModel"
      :fields="filterFields"
      :search-placeholder="t('customers.searchPlaceholder')"
      @apply="applyFilters"
    />

    <StateSection :loading="isLoading" :error="isError ? t('customers.loadError') : null">
      <div class="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <CustomersTable
          :customers="customers"
          :loading="isFetching && !isLoading"
          :sort-field="params.sortBy"
          :sort-order="tableSortOrder"
          @open="(id) => router.push({ name: 'customers-detail', params: { id } })"
          @edit="(id) => router.push({ name: 'customers-edit', params: { id } })"
          @delete="onDelete"
          @sort="onSort"
        />
        <div
          v-if="!isLoading && customers.length === 0"
          class="border-t border-slate-100 px-4 py-8 text-center text-sm text-slate-500"
        >
          {{ params.search ? t('filter.nothingFound') : t('customers.empty') }}
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
