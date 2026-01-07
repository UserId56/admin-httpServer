import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import { useUserStore } from 'src/stores/user-store';
import { loadStoredToken } from 'src/API/http';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach(async (to, from, next) => {
    console.log('Router beforeEach');
    const userStore = useUserStore();

    if (!userStore.isAuth) {
      const ok = loadStoredToken();
      if (ok) {
        try {
          await userStore.getProfile();
        } catch (error: any) {
          console.error('Error in getProfile during router guard:', error);
          if (error.response?.status === 401) {
            userStore.setNotAuth();
            next('/login');
            return;
          }
        }
        userStore.setAuth();
      }
    }

    if (!userStore.isAuth && to.path !== '/login') {
      next('/login');
      return;
    }
    if (to.path === '/') {
      next({
        name: 'collections',
      });
      return;
    }
    if (userStore.isAuth && to.path === '/login') {
      next({
        name: 'collections',
      });
      return;
    }
    if (to.fullPath === '/collections/users') {
      next(to.fullPath.replace('/collections', ''));
      return;
    }
    if (to.fullPath === '/collections/roles') {
      next({ name: 'roles' });
      return;
    }
    next();
  });

  Router.afterEach((to) => {
    document.title = to.meta.title ? (to.meta.title as string) : 'Admin Panel';
  });

  return Router;
});
