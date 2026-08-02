import { PERMISSIONS, type Permission } from './permissions';

export interface NavItem {
  /** i18n-ключ подписи, напр. "nav.dashboard". */
  labelKey: string;
  icon: string;
  to: string;
  /** Пункт показывается, если есть хотя бы один из этих доступов. */
  permissions: Permission[];
}

/** Единый источник пунктов бокового меню. Фильтруется по доступам пользователя. */
export const NAV_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', icon: 'pi pi-chart-line', to: '/dashboard', permissions: [PERMISSIONS.DASHBOARD_VIEW] },
  { labelKey: 'nav.products', icon: 'pi pi-box', to: '/products', permissions: [PERMISSIONS.PRODUCTS_VIEW] },
  { labelKey: 'nav.orders', icon: 'pi pi-shopping-cart', to: '/orders', permissions: [PERMISSIONS.ORDERS_VIEW] },
  { labelKey: 'nav.customers', icon: 'pi pi-users', to: '/customers', permissions: [PERMISSIONS.CUSTOMERS_VIEW] },
  { labelKey: 'nav.users', icon: 'pi pi-user', to: '/users', permissions: [PERMISSIONS.USERS_VIEW] },
  // { labelKey: 'nav.roles', icon: 'pi pi-shield', to: '/roles', permissions: [PERMISSIONS.ROLES_VIEW] },
];
