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
import { useProduct } from '../composables/useProduct';
import { useCreateProduct, useUpdateProduct } from '../composables/useProductMutations';
import ProductForm from '../components/ProductForm.vue';
import type { ProductPayload } from '../types';

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

const { data: product, isLoading, isError } = useProduct(id);
const create = useCreateProduct();
const update = useUpdateProduct();

const errorMessage = ref('');
const submitting = computed(() => create.isPending.value || update.isPending.value);

const title = computed(() =>
  isEdit.value ? t('products.editTitle') : t('products.createTitle'),
);

useBreadcrumbs(() => {
  if (!isEdit.value) {
    return [
      { label: t('products.title'), to: { name: 'products' } },
      { label: t('products.createTitle') },
    ];
  }
  const name = product.value?.name || t('products.detailTitle');
  return [
    { label: t('products.title'), to: { name: 'products' } },
    { label: name, to: { name: 'products-detail', params: { id: id.value } } },
    { label: t('products.editTitle') },
  ];
});

async function onSubmit(payload: ProductPayload) {
  errorMessage.value = '';
  try {
    if (isEdit.value) {
      const updated = await update.mutateAsync({ id: id.value, payload });
      toast.add({ severity: 'success', summary: t('products.updated'), life: 2500 });
      router.push({ name: 'products-detail', params: { id: updated.id } });
      return;
    }
    const created = await create.mutateAsync(payload);
    toast.add({ severity: 'success', summary: t('products.created'), life: 2500 });
    router.push({ name: 'products-detail', params: { id: created.id } });
  } catch (e) {
    errorMessage.value = resolveErrorMessage(e);
  }
}

function onCancel() {
  if (isEdit.value) {
    router.push({ name: 'products-detail', params: { id: id.value } });
    return;
  }
  router.push({ name: 'products' });
}
</script>

<template>
  <div>
    <PageHeader :title="title" />

    <StateSection
      :loading="isEdit && isLoading"
      :error="isEdit && isError ? t('products.loadOneError') : null"
    >
      <DetailCard v-if="!isEdit || product" :title="t('common.basicInfo')">
        <ProductForm
          :mode="mode"
          :initial="product"
          :submitting="submitting"
          :error-message="errorMessage"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </DetailCard>
    </StateSection>
  </div>
</template>
