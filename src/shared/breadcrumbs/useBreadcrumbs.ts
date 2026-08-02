import { onBeforeUnmount, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useBreadcrumbStore, type BreadcrumbItem } from './breadcrumbStore';

/**
 * Стандарт: крошки только на карточках/формах (есть вложенность).
 * В реестрах (список/таблица) не вызываем — хедер без крошек.
 * Иконка дома добавляется в AppBreadcrumbs автоматически.
 *
 * @example
 * useBreadcrumbs(() => [
 *   { label: t('users.title'), to: { name: 'users' } },
 *   { label: name.value || t('users.detailTitle') },
 * ]);
 */
export function useBreadcrumbs(items: MaybeRefOrGetter<BreadcrumbItem[]>) {
  const store = useBreadcrumbStore();

  watch(
    () => toValue(items),
    (next) => store.set(next),
    { immediate: true, deep: true },
  );

  onBeforeUnmount(() => {
    store.clear();
  });
}
