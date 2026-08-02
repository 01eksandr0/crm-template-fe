<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuery } from '@tanstack/vue-query';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';
import { useFormat } from '@/shared/composables/useFormat';
import { productsApi } from '@/features/products/api/productsApi';
import { customersApi } from '../api/customersApi';
import { dictionariesApi } from '../api/dictionariesApi';
import type {
  CreateCustomerPayload,
  Customer,
  Order,
  OrderItem,
  OrderPayload,
} from '../types';

const props = defineProps<{
  mode: 'create' | 'edit';
  initial?: Order | null;
  submitting?: boolean;
  errorMessage?: string;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: OrderPayload];
  cancel: [];
}>();

const { t } = useI18n();
const { formatNumber } = useFormat();

const { data: products } = useQuery({
  queryKey: ['products', 'options'],
  queryFn: () => productsApi.list({ page: 1, limit: 100, sortBy: 'name', sortOrder: 'asc' }),
});
const { data: colors } = useQuery({
  queryKey: ['dict', 'colors'],
  queryFn: () => dictionariesApi.colors(),
});
const { data: materials } = useQuery({
  queryKey: ['dict', 'materials'],
  queryFn: () => dictionariesApi.materials(),
});
const { data: kits } = useQuery({
  queryKey: ['dict', 'kits'],
  queryFn: () => dictionariesApi.kits(),
});
const { data: deliveryMethods } = useQuery({
  queryKey: ['dict', 'delivery'],
  queryFn: () => dictionariesApi.deliveryMethods(),
});
const { data: paymentMethods } = useQuery({
  queryKey: ['dict', 'payment'],
  queryFn: () => dictionariesApi.paymentMethods(),
});

const form = reactive({
  customerId: '' as string,
  customerLabel: '',
  city: '',
  deliveryMethodId: null as string | null,
  deliveryPostOffice: '',
  deliveryAddress: '',
  paymentMethodId: null as string | null,
  comment: '',
  items: [] as OrderItem[],
});

const fieldErrors = reactive({
  customerId: '',
  city: '',
  deliveryExtra: '',
  items: '',
});

const customerSearch = ref('');
const customerResults = ref<Customer[]>([]);
const searchingCustomers = ref(false);
const createCustomerOpen = ref(false);
const creatingCustomer = ref(false);
const customerFormError = ref('');
const customerForm = reactive({
  lastName: '',
  firstName: '',
  middleName: '',
  phone: '',
  city: '',
  deliveryMethodId: null as string | null,
  deliveryPostOffice: '',
  deliveryAddress: '',
});

function emptyItem(): OrderItem {
  return {
    productId: '',
    quantity: 1,
    colorId: '',
    materialId: '',
    kitId: null,
    unitPrice: 0,
    lineTotal: 0,
  };
}

function hydrate(order?: Order | null) {
  form.customerId = order?.customerId ?? '';
  form.customerLabel = order
    ? `${order.customerName}${order.customerPhone ? ` · ${order.customerPhone}` : ''}`
    : '';
  form.city = order?.city ?? '';
  form.deliveryMethodId = order?.deliveryMethodId ?? null;
  form.deliveryPostOffice = order?.deliveryPostOffice ?? '';
  form.deliveryAddress = order?.deliveryAddress ?? '';
  form.paymentMethodId = order?.paymentMethodId ?? null;
  form.comment = order?.comment ?? '';
  form.items =
    order?.items?.map((i) => ({
      ...i,
      kitId: i.kitId ?? null,
    })) ?? [emptyItem()];
  fieldErrors.customerId = '';
  fieldErrors.city = '';
  fieldErrors.deliveryExtra = '';
  fieldErrors.items = '';
}

hydrate(props.initial);
watch(
  () => props.initial,
  (v) => hydrate(v),
);

const selectedDeliveryCode = computed(() => {
  const id = form.deliveryMethodId;
  if (!id) return null;
  return deliveryMethods.value?.find((d) => d.id === id)?.code ?? null;
});

const customerDeliveryCode = computed(() => {
  const id = customerForm.deliveryMethodId;
  if (!id) return null;
  return deliveryMethods.value?.find((d) => d.id === id)?.code ?? null;
});

const total = computed(() =>
  form.items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0),
);

function onProductChange(item: OrderItem) {
  const product = products.value?.items.find((p) => p.id === item.productId);
  item.unitPrice = product?.price ?? 0;
  item.lineTotal = item.unitPrice * item.quantity;
}

function onQtyChange(item: OrderItem) {
  item.lineTotal = (item.unitPrice || 0) * (item.quantity || 0);
}

function addItem() {
  form.items.push(emptyItem());
}

function removeItem(index: number) {
  if (form.items.length <= 1) {
    fieldErrors.items = t('errors.lastItemRequired');
    return;
  }
  form.items.splice(index, 1);
  fieldErrors.items = '';
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
function onCustomerQuery() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    const q = customerSearch.value.trim();
    if (!q) {
      customerResults.value = [];
      return;
    }
    searchingCustomers.value = true;
    try {
      customerResults.value = await customersApi.search(q);
    } finally {
      searchingCustomers.value = false;
    }
  }, 250);
}

/** Автозаповнення доставки з клієнта — один раз при виборі. */
function applyCustomerDeliveryDefaults(c: Customer) {
  form.city = c.city ?? '';
  form.deliveryMethodId = c.deliveryMethodId ?? null;
  form.deliveryPostOffice = c.deliveryPostOffice ?? '';
  form.deliveryAddress = c.deliveryAddress ?? '';
  fieldErrors.city = '';
  fieldErrors.deliveryExtra = '';
}

function selectCustomer(c: Customer) {
  form.customerId = c.id;
  form.customerLabel = `${c.displayName} · ${c.phone}`;
  applyCustomerDeliveryDefaults(c);
  customerSearch.value = '';
  customerResults.value = [];
  fieldErrors.customerId = '';
}

function clearCustomer() {
  form.customerId = '';
  form.customerLabel = '';
}

function openCreateCustomer() {
  customerForm.lastName = '';
  customerForm.firstName = '';
  customerForm.middleName = '';
  customerForm.phone = customerSearch.value.replace(/[^\d+\s()-]/g, '') || '';
  customerForm.city = '';
  customerForm.deliveryMethodId = null;
  customerForm.deliveryPostOffice = '';
  customerForm.deliveryAddress = '';
  customerFormError.value = '';
  createCustomerOpen.value = true;
}

function onCustomerDeliveryChange() {
  customerForm.deliveryPostOffice = '';
  customerForm.deliveryAddress = '';
  customerFormError.value = '';
}

function onOrderDeliveryChange() {
  const code = selectedDeliveryCode.value;
  if (code !== 'post') form.deliveryPostOffice = '';
  if (code !== 'courier') form.deliveryAddress = '';
  fieldErrors.deliveryExtra = '';
}

async function saveCustomer() {
  if (!customerForm.lastName.trim() || !customerForm.firstName.trim()) {
    customerFormError.value = t('validation.required');
    return;
  }
  if (!customerForm.phone.trim()) {
    customerFormError.value = t('validation.phone');
    return;
  }
  if (!customerForm.city.trim()) {
    customerFormError.value = t('validation.city');
    return;
  }
  if (customerDeliveryCode.value === 'post' && !customerForm.deliveryPostOffice.trim()) {
    customerFormError.value = t('validation.deliveryPostOffice');
    return;
  }
  if (customerDeliveryCode.value === 'courier' && !customerForm.deliveryAddress.trim()) {
    customerFormError.value = t('validation.deliveryAddress');
    return;
  }

  creatingCustomer.value = true;
  customerFormError.value = '';
  try {
    const payload: CreateCustomerPayload = {
      lastName: customerForm.lastName.trim(),
      firstName: customerForm.firstName.trim(),
      middleName: customerForm.middleName.trim() || null,
      phone: customerForm.phone.trim(),
      city: customerForm.city.trim(),
      deliveryMethodId: customerForm.deliveryMethodId,
      deliveryPostOffice:
        customerDeliveryCode.value === 'post' ? customerForm.deliveryPostOffice.trim() : null,
      deliveryAddress:
        customerDeliveryCode.value === 'courier' ? customerForm.deliveryAddress.trim() : null,
    };
    const created = await customersApi.create(payload);
    selectCustomer(created);
    createCustomerOpen.value = false;
  } finally {
    creatingCustomer.value = false;
  }
}

function validate(): boolean {
  let ok = true;
  if (!form.customerId) {
    fieldErrors.customerId = t('validation.selectCustomer');
    ok = false;
  } else fieldErrors.customerId = '';

  if (!form.city.trim()) {
    fieldErrors.city = t('validation.city');
    ok = false;
  } else fieldErrors.city = '';

  if (selectedDeliveryCode.value === 'post') {
    if (!form.deliveryPostOffice.trim()) {
      fieldErrors.deliveryExtra = t('validation.deliveryPostOffice');
      ok = false;
    } else fieldErrors.deliveryExtra = '';
  } else if (selectedDeliveryCode.value === 'courier') {
    if (!form.deliveryAddress.trim()) {
      fieldErrors.deliveryExtra = t('validation.deliveryAddress');
      ok = false;
    } else fieldErrors.deliveryExtra = '';
  } else {
    fieldErrors.deliveryExtra = '';
  }

  if (!form.items.length) {
    fieldErrors.items = t('errors.orderItemsRequired');
    ok = false;
  } else {
    const bad = form.items.some(
      (i) => !i.productId || !i.colorId || !i.materialId || !i.quantity || i.quantity < 1,
    );
    if (bad) {
      fieldErrors.items = t('validation.itemParams');
      ok = false;
    } else fieldErrors.items = '';
  }
  return ok;
}

function onSubmit() {
  if (props.readonly) return;
  if (!validate()) return;
  emit('submit', {
    customerId: form.customerId,
    city: form.city.trim(),
    deliveryMethodId: form.deliveryMethodId,
    deliveryPostOffice:
      selectedDeliveryCode.value === 'post' ? form.deliveryPostOffice.trim() : null,
    deliveryAddress:
      selectedDeliveryCode.value === 'courier' ? form.deliveryAddress.trim() : null,
    paymentMethodId: form.paymentMethodId,
    comment: form.comment.trim() || null,
    items: form.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
      colorId: i.colorId,
      materialId: i.materialId,
      kitId: i.kitId || null,
    })),
  });
}
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent="onSubmit">
    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <h2 class="border-b border-slate-100 px-5 py-4 text-[15px] font-semibold text-slate-900">
        {{ t('common.basicInfo') }}
      </h2>
      <div class="divide-y divide-slate-100">
        <div
          class="grid grid-cols-1 items-start gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
        >
          <label class="pt-2 text-sm text-slate-500">{{ t('orders.fields.customer') }} *</label>
          <div class="min-w-0">
            <div v-if="form.customerId" class="mb-2 flex items-center gap-2">
              <span class="text-sm text-slate-900">{{ form.customerLabel }}</span>
              <Button
                v-if="!readonly"
                type="button"
                :label="t('common.edit')"
                text
                size="small"
                @click="clearCustomer"
              />
            </div>
            <template v-else>
              <InputText
                v-model="customerSearch"
                class="w-full"
                :placeholder="t('orders.customerSearchPlaceholder')"
                :disabled="readonly || submitting"
                @input="onCustomerQuery"
              />
              <div
                v-if="customerSearch.trim()"
                class="mt-2 max-h-56 overflow-auto rounded-lg border border-slate-200 bg-white"
              >
                <button
                  v-for="c in customerResults"
                  :key="c.id"
                  type="button"
                  class="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                  @click="selectCustomer(c)"
                >
                  {{ c.displayName }} · {{ c.phone }}
                  <span v-if="c.city" class="text-slate-500"> · {{ c.city }}</span>
                </button>
                <button
                  type="button"
                  class="block w-full border-t border-slate-100 px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                  @click="openCreateCustomer"
                >
                  + {{ t('orders.createCustomer') }}
                </button>
                <p
                  v-if="!searchingCustomers && !customerResults.length"
                  class="px-3 py-2 text-sm text-slate-500"
                >
                  {{ t('orders.noCustomers') }}
                </p>
              </div>
            </template>
            <small v-if="fieldErrors.customerId" class="text-red-600">
              {{ fieldErrors.customerId }}
            </small>
          </div>
        </div>

        <div
          class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
        >
          <label class="text-sm text-slate-500">{{ t('orders.fields.city') }} *</label>
          <div>
            <InputText
              v-model="form.city"
              class="w-full"
              :disabled="readonly || submitting"
              :placeholder="t('orders.fields.city')"
            />
            <small v-if="fieldErrors.city" class="text-red-600">{{ fieldErrors.city }}</small>
          </div>
        </div>

        <div
          class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
        >
          <label class="text-sm text-slate-500">{{ t('orders.fields.delivery') }}</label>
          <Select
            v-model="form.deliveryMethodId"
            :options="deliveryMethods ?? []"
            option-label="name"
            option-value="id"
            show-clear
            class="w-full"
            :disabled="readonly || submitting"
            :placeholder="t('filter.any')"
            @update:model-value="onOrderDeliveryChange"
          />
        </div>

        <div
          v-if="selectedDeliveryCode === 'post'"
          class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
        >
          <label class="text-sm text-slate-500">{{ t('orders.fields.deliveryPostOffice') }} *</label>
          <div>
            <InputText
              v-model="form.deliveryPostOffice"
              class="w-full"
              :disabled="readonly || submitting"
              :placeholder="t('orders.fields.deliveryPostOffice')"
            />
            <small v-if="fieldErrors.deliveryExtra" class="text-red-600">
              {{ fieldErrors.deliveryExtra }}
            </small>
          </div>
        </div>

        <div
          v-if="selectedDeliveryCode === 'courier'"
          class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
        >
          <label class="text-sm text-slate-500">{{ t('orders.fields.deliveryAddress') }} *</label>
          <div>
            <InputText
              v-model="form.deliveryAddress"
              class="w-full"
              :disabled="readonly || submitting"
              :placeholder="t('orders.fields.deliveryAddress')"
            />
            <small v-if="fieldErrors.deliveryExtra" class="text-red-600">
              {{ fieldErrors.deliveryExtra }}
            </small>
          </div>
        </div>

        <div
          class="grid grid-cols-1 items-center gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
        >
          <label class="text-sm text-slate-500">{{ t('orders.fields.payment') }}</label>
          <Select
            v-model="form.paymentMethodId"
            :options="paymentMethods ?? []"
            option-label="name"
            option-value="id"
            show-clear
            class="w-full"
            :disabled="readonly || submitting"
            :placeholder="t('filter.any')"
          />
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h2 class="text-[15px] font-semibold text-slate-900">{{ t('orders.items') }}</h2>
        <Button
          v-if="!readonly"
          type="button"
          :label="t('orders.addItem')"
          icon="pi pi-plus"
          size="small"
          @click="addItem"
        />
      </div>

      <div class="divide-y divide-slate-100">
        <div v-for="(item, index) in form.items" :key="index" class="space-y-3 px-5 py-4">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700">
              {{ t('orders.itemN', { n: index + 1 }) }}
            </span>
            <Button
              v-if="!readonly"
              type="button"
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              :disabled="form.items.length <= 1"
              @click="removeItem(index)"
            />
          </div>
          <div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div class="flex flex-col gap-1">
              <label class="text-xs text-slate-500">{{ t('orders.fields.product') }} *</label>
              <Select
                v-model="item.productId"
                :options="products?.items ?? []"
                option-label="name"
                option-value="id"
                filter
                class="w-full"
                :disabled="readonly || submitting"
                @update:model-value="onProductChange(item)"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-slate-500">{{ t('orders.fields.quantity') }} *</label>
              <InputNumber
                v-model="item.quantity"
                :min="1"
                class="w-full"
                input-class="w-full"
                :disabled="readonly || submitting"
                @update:model-value="onQtyChange(item)"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-slate-500">{{ t('orders.fields.unitPrice') }}</label>
              <InputText :model-value="formatNumber(item.unitPrice)" disabled class="w-full" />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-slate-500">{{ t('orders.fields.color') }} *</label>
              <Select
                v-model="item.colorId"
                :options="colors ?? []"
                option-label="name"
                option-value="id"
                class="w-full"
                :disabled="readonly || submitting"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-slate-500">{{ t('orders.fields.material') }} *</label>
              <Select
                v-model="item.materialId"
                :options="materials ?? []"
                option-label="name"
                option-value="id"
                class="w-full"
                :disabled="readonly || submitting"
              />
            </div>
            <div class="flex flex-col gap-1">
              <label class="text-xs text-slate-500">{{ t('orders.fields.kit') }}</label>
              <Select
                v-model="item.kitId"
                :options="kits ?? []"
                option-label="name"
                option-value="id"
                show-clear
                class="w-full"
                :disabled="readonly || submitting"
              />
            </div>
          </div>
          <p class="text-right text-sm text-slate-700">
            {{ t('orders.fields.lineTotal') }}:
            <span class="font-semibold">{{ formatNumber(item.lineTotal) }}</span>
          </p>
        </div>
      </div>
      <small v-if="fieldErrors.items" class="block px-5 pb-3 text-red-600">
        {{ fieldErrors.items }}
      </small>
    </section>

    <section class="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div
        class="grid grid-cols-1 items-center gap-1 border-b border-slate-100 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
      >
        <span class="text-sm text-slate-500">{{ t('orders.fields.total') }}</span>
        <span class="text-base font-semibold text-slate-900">{{ formatNumber(total) }}</span>
      </div>
      <div
        class="grid grid-cols-1 items-start gap-1 px-5 py-3.5 sm:grid-cols-[minmax(10rem,15rem)_minmax(0,1fr)] sm:gap-6"
      >
        <label class="pt-2 text-sm text-slate-500">{{ t('orders.fields.comment') }}</label>
        <Textarea
          v-model="form.comment"
          rows="3"
          class="w-full"
          :disabled="readonly || submitting"
        />
      </div>
    </section>

    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>

    <div v-if="!readonly" class="flex items-center gap-3">
      <Button
        type="submit"
        :label="t('common.save')"
        icon="pi pi-check"
        :loading="submitting"
        :disabled="submitting"
      />
      <Button
        type="button"
        :label="t('common.cancel')"
        severity="secondary"
        text
        :disabled="submitting"
        @click="emit('cancel')"
      />
    </div>

    <Dialog
      v-model:visible="createCustomerOpen"
      modal
      :header="t('orders.createCustomer')"
      class="w-full max-w-lg"
    >
      <div class="flex flex-col gap-3">
        <InputText v-model="customerForm.lastName" :placeholder="t('orders.customerFields.lastName') + ' *'" />
        <InputText v-model="customerForm.firstName" :placeholder="t('orders.customerFields.firstName') + ' *'" />
        <InputText v-model="customerForm.middleName" :placeholder="t('orders.customerFields.middleName')" />
        <InputText v-model="customerForm.phone" :placeholder="t('orders.customerFields.phone') + ' *'" />
        <InputText v-model="customerForm.city" :placeholder="t('orders.customerFields.city') + ' *'" />
        <Select
          v-model="customerForm.deliveryMethodId"
          :options="deliveryMethods ?? []"
          option-label="name"
          option-value="id"
          show-clear
          class="w-full"
          :placeholder="t('orders.customerFields.delivery')"
          @update:model-value="onCustomerDeliveryChange"
        />
        <InputText
          v-if="customerDeliveryCode === 'post'"
          v-model="customerForm.deliveryPostOffice"
          :placeholder="t('orders.customerFields.deliveryPostOffice') + ' *'"
        />
        <InputText
          v-if="customerDeliveryCode === 'courier'"
          v-model="customerForm.deliveryAddress"
          :placeholder="t('orders.customerFields.deliveryAddress') + ' *'"
        />
        <small v-if="customerFormError" class="text-red-600">{{ customerFormError }}</small>
      </div>
      <template #footer>
        <Button :label="t('common.cancel')" text severity="secondary" @click="createCustomerOpen = false" />
        <Button
          :label="t('common.save')"
          icon="pi pi-check"
          :loading="creatingCustomer"
          @click="saveCustomer"
        />
      </template>
    </Dialog>
  </form>
</template>
