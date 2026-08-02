<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import PageHeader from '@/shared/ui/PageHeader.vue';
import StateSection from '@/shared/ui/StateSection.vue';
import DetailCard from '@/shared/ui/DetailCard.vue';
import { resolveErrorMessage } from '@/shared/errors/errors';
import { useUser } from '../composables/useUser';
import { useCreateUser, useUpdateUser } from '../composables/useUserMutations';
import UserForm from '../components/UserForm.vue';
import type { CreateUserPayload, UpdateUserPayload } from '../types';
import { fullName } from '../lib/helpers';
import { useBreadcrumbs } from '@/shared/breadcrumbs/useBreadcrumbs';

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

const { data: user, isLoading, isError } = useUser(id);
const create = useCreateUser();
const update = useUpdateUser();

const errorMessage = ref('');
const submitting = computed(() => create.isPending.value || update.isPending.value);

const title = computed(() =>
  isEdit.value ? t('users.editTitle') : t('users.createTitle'),
);

useBreadcrumbs(() => {
  if (!isEdit.value) {
    return [
      { label: t('users.title'), to: { name: 'users' } },
      { label: t('users.createTitle') },
    ];
  }
  const person = user.value ? fullName(user.value) : t('users.detailTitle');
  return [
    { label: t('users.title'), to: { name: 'users' } },
    { label: person, to: { name: 'users-detail', params: { id: id.value } } },
    { label: t('users.editTitle') },
  ];
});

async function onSubmit(payload: CreateUserPayload | UpdateUserPayload) {
  errorMessage.value = '';
  try {
    if (isEdit.value) {
      const updated = await update.mutateAsync({
        id: id.value,
        payload: payload as UpdateUserPayload,
      });
      toast.add({ severity: 'success', summary: t('users.updated'), life: 2500 });
      router.push({ name: 'users-detail', params: { id: updated.id } });
      return;
    }
    const created = await create.mutateAsync(payload as CreateUserPayload);
    toast.add({ severity: 'success', summary: t('users.created'), life: 2500 });
    router.push({ name: 'users-detail', params: { id: created.id } });
  } catch (e) {
    errorMessage.value = resolveErrorMessage(e);
  }
}

function onCancel() {
  if (isEdit.value) {
    router.push({ name: 'users-detail', params: { id: id.value } });
    return;
  }
  router.push({ name: 'users' });
}
</script>

<template>
  <div>
    <PageHeader :title="title" />

    <template v-if="!isEdit">
      <DetailCard :title="t('common.basicInfo')">
        <UserForm
          mode="create"
          :submitting="submitting"
          :error-message="errorMessage"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </DetailCard>
    </template>

    <StateSection
      v-else
      :loading="isLoading"
      :error="isError ? t('users.loadOneError') : null"
    >
      <DetailCard v-if="user" :title="t('common.basicInfo')">
        <UserForm
          mode="edit"
          :initial="user"
          :submitting="submitting"
          :error-message="errorMessage"
          @submit="onSubmit"
          @cancel="onCancel"
        />
      </DetailCard>
    </StateSection>
  </div>
</template>
