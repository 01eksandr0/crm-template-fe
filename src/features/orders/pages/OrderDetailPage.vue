<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
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
import { useOrder } from '../composables/useOrder';
import { useChangeOrderStatus } from '../composables/useOrderMutations';
import OrderStatusBadge from '../components/OrderStatusBadge.vue';
import { nextForwardStatus } from '../lib/status';
import type { OrderStatus } from '../types';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const { formatNumber, formatDate } = useFormat();
const { can } = usePermissions();

const id = computed(() => {
  const raw = route.params.id;
  return typeof raw === 'string' ? raw : '';
});
const { data: order, isLoading, isError } = useOrder(id);
const changeStatus = useChangeOrderStatus();

useBreadcrumbs(() => [
  { label: t('orders.title'), to: { name: 'orders' } },
  { label: order.value?.number || t('orders.detailTitle') },
]);

const nextForward = computed(() => nextForwardStatus(order.value?.allowedNextStatuses ?? []));
const canCancel = computed(() => (order.value?.allowedNextStatuses ?? []).includes('cancelled'));
const editable = computed(() => !!order.value?.editable && can(PERMISSIONS.ORDERS_EDIT));

const headerMeta = computed(() => {
  if (!order.value) return undefined;
  return `${t('common.createdAt')}: ${formatDate(order.value.createdAt)}`;
});

async function applyStatus(status: OrderStatus) {
  try {
    await changeStatus.mutateAsync({ id: id.value, status });
    toast.add({
      severity: 'success',
      summary: t('orders.statusChanged'),
      life: 2500,
    });
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: resolveErrorMessage(e),
      life: 4000,
    });
  }
}

function onCancelOrder() {
  confirm.require({
    message: t('orders.cancelConfirm'),
    header: t('orders.cancel'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('orders.cancel'), severity: 'danger' },
    accept: () => applyStatus('cancelled'),
  });
}
</script>

<template>
  <div>
    <ConfirmDialog />
    <PageHeader :title="order?.number || t('orders.detailTitle')" :meta="headerMeta">
      <template v-if="order" #status>
        <OrderStatusBadge :status="order.status" />
      </template>
      <template #actions>
        <Button
          v-if="editable && nextForward"
          :label="t(`orders.status.${nextForward}`)"
          icon="pi pi-arrow-right"
          :loading="changeStatus.isPending.value"
          @click="applyStatus(nextForward)"
        />
        <Button
          v-if="editable && canCancel"
          :label="t('orders.cancel')"
          icon="pi pi-times"
          severity="danger"
          outlined
          class="!bg-white"
          :loading="changeStatus.isPending.value"
          @click="onCancelOrder"
        />
        <Button
          v-if="editable"
          :label="t('common.edit')"
          icon="pi pi-pencil"
          severity="secondary"
          outlined
          class="!bg-white"
          @click="router.push({ name: 'orders-edit', params: { id: order!.id } })"
        />
      </template>
    </PageHeader>

    <StateSection :loading="isLoading" :error="isError ? t('orders.loadOneError') : null">
      <div v-if="order" class="flex flex-col gap-6">
        <DetailCard :title="t('common.basicInfo')">
          <DetailRow :label="t('orders.fields.customer')">
            <RouterLink
              v-if="order.customerId && can(PERMISSIONS.CUSTOMERS_VIEW)"
              :to="{ name: 'customers-detail', params: { id: order.customerId } }"
              class="text-emerald-700 underline-offset-2 hover:underline"
            >
              {{ order.customerName }}
            </RouterLink>
            <template v-else>{{ order.customerName || t('common.empty') }}</template>
          </DetailRow>
          <DetailRow
            :label="t('orders.fields.city')"
            :value="order.city"
            :empty-text="t('common.empty')"
          />
          <DetailRow :label="t('orders.fields.responsible')" :value="order.responsibleName" />
          <DetailRow
            :label="t('orders.fields.delivery')"
            :value="order.deliveryMethodName"
            :empty-text="t('common.empty')"
          />
          <DetailRow
            v-if="order.deliveryMethodCode === 'post' || order.deliveryPostOffice"
            :label="t('orders.fields.deliveryPostOffice')"
            :value="order.deliveryPostOffice"
            :empty-text="t('common.empty')"
          />
          <DetailRow
            v-if="order.deliveryMethodCode === 'courier' || order.deliveryAddress"
            :label="t('orders.fields.deliveryAddress')"
            :value="order.deliveryAddress"
            :empty-text="t('common.empty')"
          />
          <DetailRow
            :label="t('orders.fields.payment')"
            :value="order.paymentMethodName"
            :empty-text="t('common.empty')"
          />
          <DetailRow :label="t('orders.fields.total')" :value="formatNumber(order.totalAmount)" />
          <DetailRow
            :label="t('orders.fields.comment')"
            :value="order.comment"
            :empty-text="t('common.empty')"
          />
        </DetailCard>

        <DetailCard :title="t('orders.items')">
          <div
            v-for="(item, index) in order.items ?? []"
            :key="item.id || index"
            class="border-b border-slate-100 px-5 py-4 last:border-b-0"
          >
            <p class="mb-2 text-sm font-medium text-slate-800">
              {{ item.productName }} × {{ item.quantity }}
            </p>
            <p class="text-sm text-slate-500">
              {{ item.colorName }} · {{ item.materialName }}
              <template v-if="item.kitName"> · {{ item.kitName }}</template>
              · {{ formatNumber(item.unitPrice) }} →
              <span class="font-medium text-slate-800">{{ formatNumber(item.lineTotal) }}</span>
            </p>
          </div>
        </DetailCard>
      </div>
    </StateSection>
  </div>
</template>
