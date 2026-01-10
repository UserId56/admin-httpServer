import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        name: 'collections',
        path: 'collections',
        component: () => import('pages/IndexPage.vue'),
      },
      {
        name: 'collection',
        path: 'collections/:name',
        component: () => import('pages/CollectionItemsPage.vue'),
      },
      {
        name: 'collection-new-item',
        path: 'collections/:name/new',
        component: () => import('pages/CollectionNewItemPage.vue'),
      },
      {
        name: 'collection-item',
        path: 'collections/:name/:id',
        component: () => import('pages/CollectionNewItemPage.vue'),
      },
      {
        name: 'collection-item-edit',
        path: 'collections/:name/:id/edit',
        component: () => import('pages/CollectionNewItemPage.vue'),
      },
      {
        name: 'collection-new-collection',
        path: 'collections/new',
        component: () => import('pages/CollectionNewCollectionPage.vue'),
      },
      {
        name: 'collection-edit-collection',
        path: 'collections/:name/edit',
        component: () => import('pages/CollectionNewCollectionPage.vue'),
      },
      {
        name: 'users',
        path: '/users',
        component: () => import('pages/UsersPage.vue'),
      },
      {
        name: 'users-item-new',
        path: '/users/new',
        component: () => import('pages/UserNewPage.vue'),
      },
      {
        name: 'users-item-edit',
        path: '/users/:id/edit',
        component: () => import('pages/UserNewPage.vue'),
      },
      {
        name: 'users-item',
        path: '/users/:id',
        component: () => import('pages/UserNewPage.vue'),
      },
      {
        name: 'roles',
        path: '/roles',
        component: () => import('pages/RolesPage.vue'),
      },
      {
        name: 'roles-item-new',
        path: '/roles/new',
        component: () => import('pages/RoleNewPage.vue'),
      },
      {
        name: 'roles-item-edit',
        path: '/roles/:id/edit',
        component: () => import('pages/RoleNewPage.vue'),
      },
      {
        name: 'roles-item',
        path: '/roles/:id',
        component: () => import('pages/RoleNewPage.vue'),
      },
    ],
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    meta: { title: 'Login' },
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
