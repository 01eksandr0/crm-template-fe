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
import { useProduct } from '../composables/useProduct';
import { useDeleteProduct } from '../composables/useProductMutations';

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
const { data: product, isLoading, isError } = useProduct(id);
const remove = useDeleteProduct();

const title = computed(() => product.value?.name || t('products.detailTitle'));
const headerMeta = computed(() => {
  if (!product.value) return undefined;
  return `${t('common.createdAt')}: ${formatDate(product.value.createdAt)}`;
});

useBreadcrumbs(() => [
  { label: t('products.title'), to: { name: 'products' } },
  { label: title.value },
]);

function onDelete() {
  if (!product.value) return;
  confirm.require({
    message: t('products.deleteConfirm', { name: product.value.name }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    accept: async () => {
      try {
        await remove.mutateAsync(product.value!.id);
        toast.add({ severity: 'success', summary: t('products.deleted'), life: 2500 });
        router.push({ name: 'products' });
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
          v-if="can(PERMISSIONS.PRODUCTS_EDIT) && product"
          :label="t('common.edit')"
          icon="pi pi-pencil"
          @click="router.push({ name: 'products-edit', params: { id: product.id } })"
        />
        <Button
          v-if="can(PERMISSIONS.PRODUCTS_DELETE) && product"
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

    <StateSection :loading="isLoading" :error="isError ? t('products.loadOneError') : null">
      <DetailCard v-if="product" :title="t('common.basicInfo')">
        <DetailRow :label="t('products.fields.number')" :value="String(product.number)" />
        <DetailRow :label="t('products.fields.name')" :value="product.name" />
        <DetailRow :label="t('products.fields.price')" :value="formatNumber(product.price)" />
      </DetailCard>
    </StateSection>
  </div>
</template>
