import type { Directive, DirectiveBinding } from 'vue';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * v-can="'products.edit'"            — один доступ
 * v-can="['products.edit', 'x.y']"  — хотя бы один из
 *
 * Если доступа нет — элемент скрывается.
 */
function evaluate(el: HTMLElement, binding: DirectiveBinding) {
  const auth = useAuthStore();
  const value = binding.value;
  const allowed = Array.isArray(value) ? auth.canAny(value) : auth.can(value);
  el.style.display = allowed ? '' : 'none';
}

export const vCan: Directive = {
  mounted: evaluate,
  updated: evaluate,
};
