<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Tag from 'primevue/tag';
import { useFormat } from '@/shared/composables/useFormat';
import { usePermissions } from '@/shared/permissions/usePermissions';
import { PERMISSIONS } from '@/config/permissions';
import { resolveErrorMessage } from '@/shared/errors/errors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { usersApi } from '../api/usersApi';
import { usersKeys } from '../api/queryKeys';
import { fromPickerDate } from '../lib/helpers';
import type { Vacation } from '../types';

const props = defineProps<{
  userId: string;
  currentVacation?: Vacation | null;
}>();

const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const { formatDate } = useFormat();
const { can } = usePermissions();
const qc = useQueryClient();

const dialogOpen = ref(false);
const form = reactive({
  range: null as Date[] | null,
  note: '',
});

const { data: vacations, isLoading } = useQuery({
  queryKey: computed(() => [...usersKeys.detail(props.userId), 'vacations']),
  queryFn: () => usersApi.listVacations(props.userId),
});

watch(
  () => props.userId,
  () => {
    form.range = null;
    form.note = '';
  },
);

const createMut = useMutation({
  mutationFn: () => {
    const start = form.range?.[0] ?? null;
    const end = form.range?.[1] ?? form.range?.[0] ?? null;
    return usersApi.createVacation(props.userId, {
      startDate: fromPickerDate(start)!,
      endDate: fromPickerDate(end)!,
      note: form.note.trim() || null,
    });
  },
  onSuccess: async () => {
    dialogOpen.value = false;
    form.range = null;
    form.note = '';
    toast.add({ severity: 'success', summary: t('users.vacation.created'), life: 2500 });
    await qc.invalidateQueries({ queryKey: usersKeys.detail(props.userId) });
    await qc.invalidateQueries({ queryKey: usersKeys.lists() });
  },
});

const cancelMut = useMutation({
  mutationFn: (vacationId: string) => usersApi.cancelVacation(props.userId, vacationId),
  onSuccess: async () => {
    toast.add({ severity: 'success', summary: t('users.vacation.cancelled'), life: 2500 });
    await qc.invalidateQueries({ queryKey: usersKeys.detail(props.userId) });
    await qc.invalidateQueries({ queryKey: usersKeys.lists() });
  },
});

function statusSeverity(status: Vacation['status']) {
  if (status === 'active') return 'warn';
  if (status === 'scheduled') return 'info';
  if (status === 'cancelled') return 'secondary';
  return 'contrast';
}

function onCancel(v: Vacation) {
  confirm.require({
    message: t('users.vacation.cancelConfirm'),
    header: t('users.vacation.cancel'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: t('common.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('users.vacation.cancel'), severity: 'danger' },
    accept: async () => {
      try {
        await cancelMut.mutateAsync(v.id);
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

async function onCreate() {
  if (!form.range?.[0]) return;
  try {
    await createMut.mutateAsync();
  } catch (e) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: resolveErrorMessage(e),
      life: 4000,
    });
  }
}
</script>

<template>
  <section class="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div
      class="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4"
    >
      <div>
        <h2 class="text-[15px] font-semibold text-slate-900">{{ t('users.vacation.title') }}</h2>
        <p class="mt-0.5 text-sm text-slate-500">{{ t('users.vacation.subtitle') }}</p>
      </div>
      <Button
        v-if="can(PERMISSIONS.USERS_EDIT)"
        :label="t('users.vacation.schedule')"
        icon="pi pi-calendar-plus"
        @click="dialogOpen = true"
      />
    </div>

    <div
      v-if="currentVacation"
      class="border-b border-slate-100 bg-amber-50 px-5 py-3 text-sm text-amber-900"
    >
      {{
        t('users.vacation.current', {
          from: formatDate(currentVacation.startDate),
          to: formatDate(currentVacation.endDate),
        })
      }}
    </div>

    <div v-if="isLoading" class="px-5 py-6 text-center text-sm text-slate-500">
      {{ t('common.loading') }}
    </div>
    <div v-else-if="!vacations?.length" class="px-5 py-6 text-center text-sm text-slate-500">
      {{ t('users.vacation.empty') }}
    </div>
    <ul v-else class="divide-y divide-slate-100">
      <li
        v-for="v in vacations"
        :key="v.id"
        class="grid grid-cols-1 items-center gap-2 px-5 py-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm text-slate-900">
              {{ formatDate(v.startDate) }} — {{ formatDate(v.endDate) }}
            </span>
            <Tag
              :value="t(`users.vacation.status.${v.status}`)"
              :severity="statusSeverity(v.status)"
            />
          </div>
          <p v-if="v.note" class="mt-1 text-sm text-slate-500">{{ v.note }}</p>
        </div>
        <div class="sm:justify-self-end">
          <Button
            v-if="can(PERMISSIONS.USERS_EDIT) && (v.status === 'active' || v.status === 'scheduled')"
            :label="t('users.vacation.cancel')"
            icon="pi pi-times"
            severity="danger"
            text
            size="small"
            :loading="cancelMut.isPending.value"
            @click="onCancel(v)"
          />
        </div>
      </li>
    </ul>

    <Dialog
      v-model:visible="dialogOpen"
      modal
      :header="t('users.vacation.schedule')"
      class="w-full max-w-md"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">{{ t('users.vacation.period') }}</label>
          <DatePicker
            v-model="form.range"
            selection-mode="range"
            date-format="dd.mm.yy"
            show-icon
            show-button-bar
            fluid
            :manual-input="false"
          />
          <p class="text-xs text-slate-500">{{ t('users.vacation.periodHint') }}</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-sm font-medium text-slate-700">{{ t('users.vacation.note') }}</label>
          <InputText v-model="form.note" class="w-full" />
        </div>
      </div>
      <template #footer>
        <Button :label="t('common.cancel')" text severity="secondary" @click="dialogOpen = false" />
        <Button
          :label="t('common.save')"
          icon="pi pi-check"
          :loading="createMut.isPending.value"
          :disabled="!form.range?.[0]"
          @click="onCreate"
        />
      </template>
    </Dialog>
  </section>
</template>
