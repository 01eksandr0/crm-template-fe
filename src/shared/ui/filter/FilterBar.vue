<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Button from 'primevue/button';
import Select from 'primevue/select';
import DatePicker from 'primevue/datepicker';
import Chip from 'primevue/chip';
import type { FilterField, FilterValues } from './types';

const props = withDefaults(
  defineProps<{
    fields: FilterField[];
    modelValue: FilterValues;
    searchPlaceholder?: string;
  }>(),
  { searchPlaceholder: '' },
);

const emit = defineEmits<{
  'update:modelValue': [value: FilterValues];
  apply: [value: FilterValues];
}>();

const { t } = useI18n();

const open = ref(false);
const draft = reactive<FilterValues>({ search: '' });
let searchTimer: ReturnType<typeof setTimeout> | null = null;

function syncFromModel() {
  Object.keys(draft).forEach((k) => delete draft[k]);
  Object.assign(draft, {
    search: '',
    ...Object.fromEntries(props.fields.map((f) => [f.key, null])),
    ...props.modelValue,
  });
}

syncFromModel();
watch(() => props.modelValue, syncFromModel, { deep: true });

const popularFields = computed(() => props.fields.filter((f) => f.popular));
/** Усі фільтри без popular — у дропдауні знизу */
const panelFields = computed(() => props.fields.filter((f) => !f.popular));
const hasPanel = computed(() => panelFields.value.length > 0);

function formatDateChip(value: Date | string) {
  if (value instanceof Date) return value.toLocaleDateString();
  return String(value).slice(0, 10);
}

const chips = computed(() => {
  const result: { key: string; label: string }[] = [];
  const search = String(props.modelValue.search ?? '').trim();
  if (search) result.push({ key: 'search', label: search });

  for (const field of props.fields) {
    const raw = props.modelValue[field.key];
    if (raw === null || raw === undefined || raw === '') continue;
    if (field.type === 'select') {
      const opt = field.options?.find((o) => o.value === raw);
      result.push({ key: field.key, label: `${field.label}: ${opt?.label ?? String(raw)}` });
    } else if (field.type === 'dateRange' && Array.isArray(raw) && raw.length) {
      const from = raw[0] ? formatDateChip(raw[0] as Date | string) : '';
      const to = raw[1] ? formatDateChip(raw[1] as Date | string) : from;
      result.push({
        key: field.key,
        label: from && to && from !== to ? `${field.label}: ${from} – ${to}` : `${field.label}: ${from}`,
      });
    } else if (field.type === 'date' && raw instanceof Date) {
      result.push({ key: field.key, label: `${field.label}: ${formatDateChip(raw)}` });
    } else if (field.type === 'date' && typeof raw === 'string') {
      result.push({ key: field.key, label: `${field.label}: ${formatDateChip(raw)}` });
    } else if (field.type === 'number' && typeof raw === 'number') {
      result.push({ key: field.key, label: `${field.label}: ${raw}` });
    }
  }
  return result;
});

function emitApply(next: FilterValues) {
  emit('update:modelValue', next);
  emit('apply', next);
}

function apply() {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  emitApply({ ...draft });
  open.value = false;
}

function scheduleSearchApply() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchTimer = null;
    emitApply({ ...props.modelValue, search: String(draft.search ?? '').trim() });
  }, 300);
}

function onPopularFilterChange() {
  emitApply({ ...draft });
}

function reset() {
  if (searchTimer) {
    clearTimeout(searchTimer);
    searchTimer = null;
  }
  const empty: FilterValues = {
    search: '',
    ...Object.fromEntries(props.fields.map((f) => [f.key, null])),
  };
  Object.keys(draft).forEach((k) => delete draft[k]);
  Object.assign(draft, empty);
  emitApply(empty);
  open.value = false;
}

function removeChip(key: string) {
  const next = { ...props.modelValue, [key]: key === 'search' ? '' : null };
  Object.assign(draft, next);
  emitApply(next);
}

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer);
});
</script>

<template>
  <div class="mb-4">
    <div class="flex flex-col gap-2 lg:flex-row lg:items-stretch">
      <div class="relative min-w-0 flex-1">
        <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <InputText
          v-model="draft.search as string"
          class="w-full !pl-9"
          :placeholder="searchPlaceholder || t('common.search')"
          @input="scheduleSearchApply"
          @keydown.enter="apply"
        />
      </div>

      <div
        v-if="popularFields.length"
        class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <Select
          v-for="field in popularFields"
          :key="field.key"
          v-model="draft[field.key]"
          :options="field.options"
          option-label="label"
          option-value="value"
          :placeholder="field.label"
          show-clear
          class="w-full sm:w-44"
          @update:model-value="onPopularFilterChange"
        />
      </div>

      <div v-if="hasPanel" class="flex gap-2">
        <Button
          :label="t('filter.advanced')"
          icon="pi pi-filter"
          severity="secondary"
          outlined
          class="!bg-white"
          @click="open = !open"
        />
      </div>
    </div>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-show="open && hasPanel"
        class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
      >
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="field in panelFields" :key="field.key" class="flex flex-col gap-1.5">
            <label class="text-sm font-medium text-slate-700">{{ field.label }}</label>
            <Select
              v-if="field.type === 'select'"
              v-model="draft[field.key]"
              :options="field.options"
              option-label="label"
              option-value="value"
              :placeholder="field.placeholder || t('filter.any')"
              show-clear
              class="w-full"
            />
            <DatePicker
              v-else-if="field.type === 'dateRange'"
              v-model="draft[field.key] as Date[] | null"
              selection-mode="range"
              date-format="dd.mm.yy"
              show-icon
              show-button-bar
              fluid
              hide-on-range-selection
              :placeholder="field.placeholder || field.label"
            />
            <DatePicker
              v-else-if="field.type === 'date'"
              v-model="draft[field.key] as Date | null"
              date-format="dd.mm.yy"
              show-icon
              show-button-bar
              fluid
              :placeholder="field.placeholder"
            />
            <InputNumber
              v-else-if="field.type === 'number'"
              v-model="draft[field.key] as number | null"
              class="w-full"
              input-class="w-full"
              :min="field.min"
              :max="field.max"
              :min-fraction-digits="0"
              :max-fraction-digits="field.fractionDigits ?? 2"
              :placeholder="field.placeholder"
            />
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <Button :label="t('filter.clear')" severity="secondary" outlined @click="reset" />
          <Button :label="t('filter.apply')" icon="pi pi-check" @click="apply" />
        </div>
      </div>
    </Transition>

    <div v-if="chips.length" class="mt-3 flex flex-wrap items-center gap-2">
      <Chip
        v-for="chip in chips"
        :key="chip.key"
        :label="chip.label"
        removable
        @remove="removeChip(chip.key)"
      />
      <Button :label="t('filter.clearAll')" text size="small" @click="reset" />
    </div>
  </div>
</template>
