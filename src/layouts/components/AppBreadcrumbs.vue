<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { RouterLink } from 'vue-router';
import { useBreadcrumbStore } from '@/shared/breadcrumbs/breadcrumbStore';

const { t } = useI18n();
const { items, hasItems } = storeToRefs(useBreadcrumbStore());
</script>

<template>
  <!-- Показуємо тільки коли є вкладеність (картка/форма). У реєстрах стор порожній. -->
  <nav v-if="hasItems" aria-label="Breadcrumb" class="min-w-0 flex-1">
    <ol class="flex items-center gap-1.5 overflow-hidden text-sm">
      <li class="flex shrink-0 items-center">
        <RouterLink
          :to="{ name: 'dashboard' }"
          class="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          :aria-label="t('nav.dashboard')"
          :title="t('nav.dashboard')"
        >
          <i class="pi pi-home text-base" />
        </RouterLink>
      </li>

      <li
        v-for="(item, index) in items"
        :key="`${index}-${item.label}`"
        class="flex min-w-0 items-center gap-1.5"
      >
        <i class="pi pi-angle-right shrink-0 text-xs text-slate-300" />
        <RouterLink
          v-if="item.to && index < items.length - 1"
          :to="item.to"
          class="truncate text-slate-500 hover:text-slate-800 transition-colors"
        >
          {{ item.label }}
        </RouterLink>
        <span
          v-else
          class="truncate font-medium text-slate-800"
          :aria-current="index === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
