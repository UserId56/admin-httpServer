<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> {{ projectName }} </q-toolbar-title>

        <q-btn round><q-avatar>
            <q-img :src="`/api/v1/file/get/${user?.avatar}`" v-if="user?.avatar"
              :alt="user?.username || 'User avatar'" />
            <q-icon name="mdi-account-circle" v-else class="text-h4" />
          </q-avatar>
          <q-menu transition-show="scale" transition-hide="scale" style="width: 150px;" anchor="bottom right"
            self="top right">
            <q-list>
              <q-item clickable v-ripple :to="`/users/${user?.id}/edit`" class="overflow-hidden full-width">
                <q-item-section class="ellipsis">{{ user?.username || "Мой профиль"
                }}</q-item-section>
              </q-item>
              <q-item clickable v-ripple @click="logout">
                <q-item-section>Выйти</q-item-section>
              </q-item>
            </q-list>
          </q-menu></q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered mini-to-overlay :mini="miniState" @mouseenter="miniState = false"
      @mouseleave="miniState = true">
      <q-list>

        <LeftMenuItemComponent v-for="link in linksLeftMenu" :key="link.title" v-bind="link"
          @go-link="miniState = true" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import LeftMenuItemComponent, { type LeftMenuItem } from 'components/LeftMenuItem.vue';
import { useSchemeStore } from 'src/stores/scheme-store';
import { useSettingsStore } from 'src/stores/settings';
import { useUserStore } from 'src/stores/user-store';
import { useRouter } from 'vue-router';

const schemeStore = useSchemeStore();
const settingsStore = useSettingsStore();
const userStore = useUserStore();
const router = useRouter();

const logout = async () => {
  userStore.setNotAuth();
  await router.push({ name: 'login' });
}

const projectName = computed(() => settingsStore.getProjectName || 'Admin Panel');
const user = computed(() => userStore.getUser);

const linksLeftMenu = computed<LeftMenuItem[]>(() => {
  const collections = schemeStore.ListSchemes
  const tempList: Array<LeftMenuItem> = []
  for (const collection of collections) {
    if (collection.name === 'users' || collection.name === 'roles' || collection.name === 'files') {
      continue;
    }
    if (collection.view_data && collection.view_data.hide_menu) {
      continue;
    }
    tempList.push({
      title: collection.display_name,
      link: `/collections/${collection.name}`,
      icon: 'mdi-folder-table',
    })
  }
  return [
    ...tempList,
    ...linksList
  ]
})

onMounted(async () => {
  if (schemeStore.ListSchemes.length === 0) {
    await schemeStore.getSchemes();
  }
})


const linksList: Array<LeftMenuItem> = [
  {
    title: 'Коллекции',
    link: '/collections',
    icon: 'mdi-folder',
  },
  {
    title: 'Роли',
    link: '/roles',
    icon: 'mdi-account-card',
  },
  {
    title: 'Пользователи',
    link: '/users',
    icon: 'mdi-account',
  },
  {
    title: 'Настройки',
    link: '/settings',
    icon: 'mdi-cog',
  }
]

const leftDrawerOpen = ref(true);
const miniState = ref(true)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

</script>
