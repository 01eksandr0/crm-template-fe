<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';
import ConfirmDialog from 'primevue/confirmdialog';
import PageHeader from '@/shared/ui/PageHeader.vue';
import StateSection from '@/shared/ui/StateSection.vue';
import DetailCard from '@/shared/ui/DetailCard.vue';
import DetailRow from '@/shared/ui/DetailRow.vue';
import { useFormat } from '@/shared/composables/useFormat';
import { usePermissions } from '@/shared/permissions/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { resolveErrorMessage } from '@/shared/errors/errors';
import { useBreadcrumbs } from '@/shared/breadcrumbs/useBreadcrumbs';
import { useCustomer } from '../composables/useCustomer';
import { useDeleteCustomer } from '../composables/useCustomerMutations';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const { can } = usePermissions();
const { formatDate } = useFormat();

const id = computed(() => {
  const raw = route.params.id;
  return typeof raw === 'string' ? raw : '';
});
const { data: customer, isLoading, isError } = useCustomer(id);
const remove = useDeleteCustomer();

const title = computed(() => customer.value?.displayName || t('customers.detailTitle'));
const headerMeta = computed(() => {
  if (!customer.value) return undefined;
  return `${t('common.createdAt')}: ${formatDate(customer.value.createdAt)}`;
});

useBreadcrumbs(() => [
  { label: t('customers.title'), to: { name: 'customers' } },
  { label: title.value },
]);

function onDelete() {
  if (!customer.value) return;
  confirm.require({
    message: t('customers.deleteConfirm', { name: customer.value.displayName }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    accept: async () => {
      try {
        await remove.mutateAsync(customer.value!.id);
        toast.add({ severity: 'success', summary: t('customers.deleted'), life: 2500 });
        router.push({ name: 'customers' });
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
    <PageHeader :title="title" :meta="headerMeta">
      <template #actions>
        <Button
          v-if="can(PERMISSIONS.CUSTOMERS_EDIT) && customer"
          :label="t('common.edit')"
          icon="pi pi-pencil"
          @click="router.push({ name: 'customers-edit', params: { id: customer.id } })"
        />
        <Button
          v-if="can(PERMISSIONS.CUSTOMERS_DELETE) && customer"
          :label="t('common.delete')"
          icon="pi pi-trash"
          severity="danger"
          outlined
          class="!bg-white"
          :loading="remove.isPending.value"
          @click="onDelete"
        />
      </template>
    </PageHeader>

    <StateSection :loading="isLoading" :error="isError ? t('customers.loadOneError') : null">
      <DetailCard v-if="customer" :title="t('common.basicInfo')">
        <DetailRow :label="t('customers.fields.lastName')" :value="customer.lastName" />
        <DetailRow :label="t('customers.fields.firstName')" :value="customer.firstName" />
        <DetailRow
          :label="t('customers.fields.middleName')"
          :value="customer.middleName"
          :empty-text="t('common.empty')"
        />
        <DetailRow :label="t('customers.fields.phone')" :value="customer.phone" />
        <DetailRow :label="t('customers.fields.city')" :value="customer.city" />
        <DetailRow
          :label="t('customers.fields.delivery')"
          :value="customer.deliveryMethodName"
          :empty-text="t('common.empty')"
        />
        <DetailRow
          v-if="customer.deliveryMethodCode === 'post' || customer.deliveryPostOffice"
          :label="t('customers.fields.deliveryPostOffice')"
          :value="customer.deliveryPostOffice"
          :empty-text="t('common.empty')"
        />
        <DetailRow
          v-if="customer.deliveryMethodCode === 'courier' || customer.deliveryAddress"
          :label="t('customers.fields.deliveryAddress')"
          :value="customer.deliveryAddress"
          :empty-text="t('common.empty')"
        />
      </DetailCard>
    </StateSection>
  </div>
</template>
