import { ref, watch } from 'vue';

const STORAGE_KEY = 'crm_sidebar_collapsed';

// Общее (на всё приложение) состояние сворачивания сайдбара с персистом.
const collapsed = ref(localStorage.getItem(STORAGE_KEY) === '1');

watch(collapsed, (value) => {
  localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
});

export function useSidebar() {
  function toggle() {
    collapsed.value = !collapsed.value;
  }
  return { collapsed, toggle };
}
