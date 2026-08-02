<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import PageHeader from '@/shared/ui/PageHeader.vue';
import StateSection from '@/shared/ui/StateSection.vue';
import DetailCard from '@/shared/ui/DetailCard.vue';
import { resolveErrorMessage } from '@/shared/errors/errors';
import { useBreadcrumbs } from '@/shared/breadcrumbs/useBreadcrumbs';
import { useCustomer } from '../composables/useCustomer';
import { useCreateCustomer, useUpdateCustomer } from '../composables/useCustomerMutations';
import CustomerForm from '../components/CustomerForm.vue';
import type { CustomerPayload } from '../types';

const props = defineProps<{
  mode: 'create' | 'edit';
}>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const id = computed(() => {
  const raw = route.params.id;
  return typeof raw === 'string' ? raw : '';
});
const isEdit = computed(() => props.mode === 'edit');

const { data: customer, isLoading, isError } = useCustomer(id);
const create = useCreateCustomer();
const update = useUpdateCustomer();

const errorMessage = ref('');
const submitting = computed(() => create.isPending.value || update.isPending.value);

const title = computed(() =>
  isEdit.value ? t('customers.editTitle') : t('customers.createTitle'),
);

useBreadcrumbs(() => {
  if (!isEdit.value) {
    return [
      { label: t('customers.title'), to: { name: 'customers' } },
      { label: t('customers.createTitle') },
    ];
  }
  const name = customer.value?.displayName || t('customers.detailTitle');
  return [
    { label: t('customers.title'), to: { name: 'customers' } },
    { label: name, to: { name: 'customers-detail', params: { id: id.value } } },
    { label: t('customers.editTitle') },
  ];
});

async function onSubmit(payload: CustomerPayload) {
  errorMessage.value = '';
  try {
    if (isEdit.value) {
      const updated = await update.mutateAsync({ id: id.value, payload });
      toast.add({ severity: 'success', summary: t('customers.updated'), life: 2500 });
      router.push({ name: 'customers-detail', params: { id: updated.id } });
      return;
    }
    const created = await create.mutateAsync(payload);
    toast.add({ severity: 'success', summary: t('customers.created'), life: 2500 });
    router.push({ name: 'customers-detail', params: { id: created.id } });
  } catch (e) {
    errorMessage.value = resolveErrorMessage(e);
  }
}

function onCancel() {
  if (isEdit.value) {
    router.push({ name: 'customers-detail', params: { id: id.value } });
    return;
  }
  router.push({ name: 'customers' });
}
</script>

<template>
  <div>
    <PageHeader :title="title" />

    <StateSection
      :loading="isEdit && isLoading"
      :error="isEdit && isError ? t('customers.loadOneError') : null"
    >
      <DetailCard v-if="!isEdit || customer" :title="t('common.basicInfo')">
        <CustomerForm
          :mode="mode"
          :initial="customer"
          :submitting="submitting"
          :error-message="errorMessage"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </DetailCard>
    </StateSection>
  </div>
</template>
