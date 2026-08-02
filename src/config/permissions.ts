/**
 * Константы доступов (зеркало каталога бэкенда: "<module>.<action>").
 * Используйте их вместо строковых литералов — так есть автокомплит
 * и защита от опечаток.
 */
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',
  DASHBOARD_ANALYTICS: 'dashboard.analytics',

  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_ADD: 'products.add',
  PRODUCTS_EDIT: 'products.edit',
  PRODUCTS_DELETE: 'products.delete',

  ORDERS_VIEW: 'orders.view',
  ORDERS_ADD: 'orders.add',
  ORDERS_EDIT: 'orders.edit',
  ORDERS_DELETE: 'orders.delete',

  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_ADD: 'customers.add',
  CUSTOMERS_EDIT: 'customers.edit',
  CUSTOMERS_DELETE: 'customers.delete',

  USERS_VIEW: 'users.view',
  USERS_ADD: 'users.add',
  USERS_EDIT: 'users.edit',
  USERS_DELETE: 'users.delete',

  ROLES_VIEW: 'roles.view',
  ROLES_ADD: 'roles.add',
  ROLES_EDIT: 'roles.edit',
  ROLES_DELETE: 'roles.delete',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
