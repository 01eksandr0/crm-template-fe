import { defineStore } from 'pinia';
import type { RouteLocationRaw } from 'vue-router';

export interface BreadcrumbItem {
  /** Уже переведённый текст (для динамических имён — ПІБ и т.п.). */
  label: string;
  /** Если нет — текущая (некликабельная) крошка. */
  to?: RouteLocationRaw;
}

interface BreadcrumbState {
  items: BreadcrumbItem[];
}

/**
 * Хлебные крошки только для вложенных экранов (карточка / форма).
 * В реестрах (таблицах) не пишем — hasItems=false, в хедере пусто.
 * Первый пункт UI всегда — иконка дома (см. AppBreadcrumbs).
 */
export const useBreadcrumbStore = defineStore('breadcrumb', {
  state: (): BreadcrumbState => ({
    items: [],
  }),
  getters: {
    hasItems: (state) => state.items.length > 0,
  },
  actions: {
    set(items: BreadcrumbItem[]) {
      this.items = items;
    },
    clear() {
      this.items = [];
    },
  },
});
