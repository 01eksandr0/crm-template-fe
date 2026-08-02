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
import { useUser } from '../composables/useUser';
import { useDeleteUser } from '../composables/useUserMutations';
import { fullName } from '../lib/helpers';
import UserStatusTags from '../components/UserStatusTags.vue';
import UserVacationsPanel from '../components/UserVacationsPanel.vue';
import { useBreadcrumbs } from '@/shared/breadcrumbs/useBreadcrumbs';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const { formatDate } = useFormat();
const { can } = usePermissions();

const id = computed(() => {
  const raw = route.params.id;
  return typeof raw === 'string' ? raw : '';
});
const { data: user, isLoading, isError } = useUser(id);
const remove = useDeleteUser();

const name = computed(() => (user.value ? fullName(user.value) : ''));
const headerMeta = computed(() => {
  if (!user.value) return undefined;
  return `${t('common.createdAt')}: ${formatDate(user.value.createdAt)}`;
});

useBreadcrumbs(() => [
  { label: t('users.title'), to: { name: 'users' } },
  { label: name.value || t('users.detailTitle') },
]);

const fields = computed(() => {
  if (!user.value) return [];
  const u = user.value;
  return [
    { label: t('users.fields.lastName'), value: u.lastName },
    { label: t('users.fields.firstName'), value: u.firstName },
    { label: t('users.fields.middleName'), value: u.middleName },
    { label: t('users.fields.email'), value: u.email },
    { label: t('users.fields.phone'), value: u.phone },
    { label: t('users.fields.birthDate'), value: formatDate(u.birthDate) },
    { label: t('users.fields.hireDate'), value: formatDate(u.hireDate) },
    { label: t('users.fields.role'), value: u.roleDisplayName },
  ];
});

function onDelete() {
  if (!user.value) return;
  confirm.require({
    message: t('users.deleteConfirm', { name: name.value }),
    header: t('common.delete'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('common.delete'), severity: 'danger' },
    accept: async () => {
      try {
        await remove.mutateAsync(user.value!.id);
        toast.add({ severity: 'success', summary: t('users.deleted'), life: 2500 });
        router.push({ name: 'users' });
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
    <PageHeader :title="name || t('users.detailTitle')" :meta="headerMeta">
      <template v-if="user" #status>
        <UserStatusTags :is-active="user.isActive" :on-vacation="user.onVacation" />
      </template>
      <template #actions>
        <Button
          v-if="can(PERMISSIONS.USERS_EDIT) && user"
          :label="t('common.edit')"
          icon="pi pi-pencil"
          @click="router.push({ name: 'users-edit', params: { id: user.id } })"
        />
        <Button
          v-if="can(PERMISSIONS.USERS_DELETE) && user"
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

    <StateSection :loading="isLoading" :error="isError ? t('users.loadOneError') : null">
      <div v-if="user" class="flex w-full flex-col gap-6">
        <DetailCard :title="t('common.basicInfo')">
          <DetailRow
            v-if="user.currentVacation"
            :label="t('users.fields.onVacation')"
            :value="
              t('users.vacation.current', {
                from: formatDate(user.currentVacation.startDate),
                to: formatDate(user.currentVacation.endDate),
              })
            "
          />
          <DetailRow
            v-for="field in fields"
            :key="field.label"
            :label="field.label"
            :value="field.value"
            :empty-text="t('common.empty')"
          />
        </DetailCard>

        <UserVacationsPanel :user-id="user.id" :current-vacation="user.currentVacation" />
      </div>
    </StateSection>
  </div>
</template>
