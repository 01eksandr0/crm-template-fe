<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useQuery } from '@tanstack/vue-query';
import Button from 'primevue/button';
import Paginator from 'primevue/paginator';
import ConfirmDialog from 'primevue/confirmdialog';
import PageHeader from '@/shared/ui/PageHeader.vue';
import StateSection from '@/shared/ui/StateSection.vue';
import FilterBar from '@/shared/ui/filter/FilterBar.vue';
import type { FilterField, FilterValues } from '@/shared/ui/filter/types';
import { usePermissions } from '@/shared/permissions/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { resolveErrorMessage } from '@/shared/errors/errors';
import { useUsersList } from '../composables/useUsersList';
import { useDeleteUser } from '../composables/useUserMutations';
import { usersApi } from '../api/usersApi';
import UsersTable from '../components/UsersTable.vue';
import { fullName } from '../lib/helpers';
import type { UsersListParams } from '../types';

const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const { can } = usePermissions();
const remove = useDeleteUser();

const { data: roles } = useQuery({
  queryKey: ['meta', 'roles'],
  queryFn: () => usersApi.listRoles(),
});

const filterModel = ref<FilterValues>({
  search: '',
  isActive: null,
  roleId: null,
});

const params = ref<UsersListParams>({ page: 1, limit: 25 });

const filterFields = computed<FilterField[]>(() => [
  {
    key: 'roleId',
    type: 'select',
    label: t('users.fields.role'),
    popular: true,
    options: (roles.value ?? []).map((r) => ({ label: r.displayName, value: r.id })),
  },
  {
    key: 'isActive',
    type: 'select',
    label: t('users.fields.status'),
    popular: true,
    options: [
      { label: t('users.status.active'), value: true },
      { label: t('users.status.inactive'), value: false },
    ],
  },
]);

function applyFilters(values: FilterValues) {
  params.value = {
    page: 1,
    limit: params.value.limit,
    search: String(values.search ?? '').trim() || undefined,
    isActive: typeof values.isActive === 'boolean' ? values.isActive : undefined,
    roleId: typeof values.roleId === 'string' ? values.roleId : undefined,
  };
}

const { data, isLoading, isError, isFetching } = useUsersList(params);
const total = computed(() => data.value?.meta.total ?? 0);
const users = computed(() => data.value?.items ?? []);

function onPage(event: { page: number; rows: number }) {
  params.value = { ...params.value, page: event.page + 1, limit: event.rows };
}

function onDelete(id: string) {
  const user = users.value.find((u) => u.id === id);
  const name = user ? fullName(user) : id;
  confirm.require({
    message: t('users.deleteConfirm', { name }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    accept: async () => {
      try {
        await remove.mutateAsync(id);
        toast.add({ severity: 'success', summary: t('users.deleted'), life: 2500 });
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
    <PageHeader :title="t('users.title')" :subtitle="t('users.subtitle')">
      <template #actions>
        <Button
          v-if="can(PERMISSIONS.USERS_ADD)"
          :label="t('users.create')"
          icon="pi pi-plus"
          @click="router.push({ name: 'users-create' })"
        />
      </template>
    </PageHeader>

    <FilterBar
      v-model="filterModel"
      :fields="filterFields"
      :search-placeholder="t('users.searchPlaceholder')"
      @apply="applyFilters"
    />

    <StateSection :loading="isLoading" :error="isError ? t('users.loadError') : null">
      <div class="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <UsersTable
          :users="users"
          :loading="isFetching && !isLoading"
          @open="(id) => router.push({ name: 'users-detail', params: { id } })"
          @edit="(id) => router.push({ name: 'users-edit', params: { id } })"
          @delete="onDelete"
        />

        <div v-if="!isLoading && users.length === 0" class="px-6 py-10 text-center text-slate-500">
          {{
            params.search || params.isActive !== undefined || params.roleId
              ? t('filter.nothingFound')
              : t('users.empty')
          }}
        </div>

        <Paginator
          v-if="total > params.limit"
          :rows="params.limit"
          :total-records="total"
          :first="(params.page - 1) * params.limit"
          @page="onPage"
        />
      </div>
    </StateSection>
  </div>
</template>
