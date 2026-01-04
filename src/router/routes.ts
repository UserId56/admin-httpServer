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
