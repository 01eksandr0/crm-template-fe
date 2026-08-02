import type { RouteRecordRaw } from 'vue-router';
import { PERMISSIONS } from '@/config/permissions';

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/features/auth/pages/LoginPage.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/',
    component: () => import('@/layouts/DefaultLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/features/dashboard/pages/DashboardPage.vue'),
        meta: { permission: PERMISSIONS.DASHBOARD_VIEW, titleKey: 'nav.dashboard' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('@/features/profile/pages/ProfilePage.vue'),
        meta: { titleKey: 'profile.title' },
      },
      {
        path: 'products',
        name: 'products',
        component: () => import('@/features/products/pages/ProductsListPage.vue'),
        meta: { permission: PERMISSIONS.PRODUCTS_VIEW, titleKey: 'nav.products' },
      },
      {
        path: 'products/new',
        name: 'products-create',
        component: () => import('@/features/products/pages/ProductFormPage.vue'),
        props: { mode: 'create' },
        meta: { permission: PERMISSIONS.PRODUCTS_ADD, titleKey: 'products.createTitle' },
      },
      {
        path: 'products/:id',
        name: 'products-detail',
        component: () => import('@/features/products/pages/ProductDetailPage.vue'),
        meta: { permission: PERMISSIONS.PRODUCTS_VIEW, titleKey: 'products.detailTitle' },
      },
      {
        path: 'products/:id/edit',
        name: 'products-edit',
        component: () => import('@/features/products/pages/ProductFormPage.vue'),
        props: { mode: 'edit' },
        meta: { permission: PERMISSIONS.PRODUCTS_EDIT, titleKey: 'products.editTitle' },
      },
      {
        path: 'orders',
        name: 'orders',
        component: () => import('@/features/orders/pages/OrdersListPage.vue'),
        meta: { permission: PERMISSIONS.ORDERS_VIEW, titleKey: 'nav.orders' },
      },
      {
        path: 'orders/new',
        name: 'orders-create',
        component: () => import('@/features/orders/pages/OrderFormPage.vue'),
        props: { mode: 'create' },
        meta: { permission: PERMISSIONS.ORDERS_ADD, titleKey: 'orders.createTitle' },
      },
      {
        path: 'orders/:id',
        name: 'orders-detail',
        component: () => import('@/features/orders/pages/OrderDetailPage.vue'),
        meta: { permission: PERMISSIONS.ORDERS_VIEW, titleKey: 'orders.detailTitle' },
      },
      {
        path: 'orders/:id/edit',
        name: 'orders-edit',
        component: () => import('@/features/orders/pages/OrderFormPage.vue'),
        props: { mode: 'edit' },
        meta: { permission: PERMISSIONS.ORDERS_EDIT, titleKey: 'orders.editTitle' },
      },
      {
        path: 'customers',
        name: 'customers',
        component: () => import('@/features/customers/pages/CustomersListPage.vue'),
        meta: { permission: PERMISSIONS.CUSTOMERS_VIEW, titleKey: 'nav.customers' },
      },
      {
        path: 'customers/new',
        name: 'customers-create',
        component: () => import('@/features/customers/pages/CustomerFormPage.vue'),
        props: { mode: 'create' },
        meta: { permission: PERMISSIONS.CUSTOMERS_ADD, titleKey: 'customers.createTitle' },
      },
      {
        path: 'customers/:id',
        name: 'customers-detail',
        component: () => import('@/features/customers/pages/CustomerDetailPage.vue'),
        meta: { permission: PERMISSIONS.CUSTOMERS_VIEW, titleKey: 'customers.detailTitle' },
      },
      {
        path: 'customers/:id/edit',
        name: 'customers-edit',
        component: () => import('@/features/customers/pages/CustomerFormPage.vue'),
        props: { mode: 'edit' },
        meta: { permission: PERMISSIONS.CUSTOMERS_EDIT, titleKey: 'customers.editTitle' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/features/users/pages/UsersListPage.vue'),
        meta: { permission: PERMISSIONS.USERS_VIEW, titleKey: 'nav.users' },
      },
      {
        // static `new` має бути ПЕРЕД `:id`, інакше Vue Router сприйме "new" як id.
        path: 'users/new',
        name: 'users-create',
        component: () => import('@/features/users/pages/UserFormPage.vue'),
        props: { mode: 'create' },
        meta: { permission: PERMISSIONS.USERS_ADD, titleKey: 'users.createTitle' },
      },
      {
        path: 'users/:id',
        name: 'users-detail',
        component: () => import('@/features/users/pages/UserDetailPage.vue'),
        meta: { permission: PERMISSIONS.USERS_VIEW, titleKey: 'users.detailTitle' },
      },
      {
        path: 'users/:id/edit',
        name: 'users-edit',
        component: () => import('@/features/users/pages/UserFormPage.vue'),
        props: { mode: 'edit' },
        meta: { permission: PERMISSIONS.USERS_EDIT, titleKey: 'users.editTitle' },
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('@/shared/ui/pages/PlaceholderPage.vue'),
        meta: { permission: PERMISSIONS.ROLES_VIEW, titleKey: 'nav.roles' },
      },
    ],
  },
  {
    path: '/forbidden',
    name: 'forbidden',
    component: () => import('@/shared/ui/pages/ForbiddenPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/shared/ui/pages/NotFoundPage.vue'),
  },
];
