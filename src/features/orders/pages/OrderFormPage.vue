<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import PageHeader from '@/shared/ui/PageHeader.vue';
import StateSection from '@/shared/ui/StateSection.vue';
import { resolveErrorMessage } from '@/shared/errors/errors';
import { useBreadcrumbs } from '@/shared/breadcrumbs/useBreadcrumbs';
import { useOrder } from '../composables/useOrder';
import { useCreateOrder, useUpdateOrder } from '../composables/useOrderMutations';
import OrderForm from '../components/OrderForm.vue';
import type { OrderPayload } from '../types';

const props = defineProps<{ mode: 'create' | 'edit' }>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();

const id = computed(() => {
  const raw = route.params.id;
  return typeof raw === 'string' ? raw : '';
});
const isEdit = computed(() => props.mode === 'edit');
const { data: order, isLoading, isError } = useOrder(id);
const create = useCreateOrder();
const update = useUpdateOrder();
const errorMessage = ref('');
const submitting = computed(() => create.isPending.value || update.isPending.value);
const title = computed(() =>
  isEdit.value ? t('orders.editTitle') : t('orders.createTitle'),
);

useBreadcrumbs(() => {
  if (!isEdit.value) {
    return [
      { label: t('orders.title'), to: { name: 'orders' } },
      { label: t('orders.createTitle') },
    ];
  }
  return [
    { label: t('orders.title'), to: { name: 'orders' } },
    {
      label: order.value?.number || t('orders.detailTitle'),
      to: { name: 'orders-detail', params: { id: id.value } },
    },
    { label: t('orders.editTitle') },
  ];
});

async function onSubmit(payload: OrderPayload) {
  errorMessage.value = '';
  try {
    if (isEdit.value) {
      const updated = await update.mutateAsync({ id: id.value, payload });
      toast.add({ severity: 'success', summary: t('orders.updated'), life: 2500 });
      router.push({ name: 'orders-detail', params: { id: updated.id } });
      return;
    }
    const created = await create.mutateAsync(payload);
    toast.add({ severity: 'success', summary: t('orders.created'), life: 2500 });
    router.push({ name: 'orders-detail', params: { id: created.id } });
  } catch (e) {
    errorMessage.value = resolveErrorMessage(e);
  }
}

function onCancel() {
  if (isEdit.value) {
    router.push({ name: 'orders-detail', params: { id: id.value } });
    return;
  }
  router.push({ name: 'orders' });
}
</script>

<template>
  <div>
    <PageHeader :title="title" />
    <StateSection
      :loading="isEdit && isLoading"
      :error="isEdit && isError ? t('orders.loadOneError') : null"
    >
      <OrderForm
        v-if="!isEdit || order"
        :mode="mode"
        :initial="order"
        :submitting="submitting"
        :error-message="errorMessage"
        @submit="onSubmit"
        @cancel="onCancel"
      />
    </StateSection>
  </div>
</template>
