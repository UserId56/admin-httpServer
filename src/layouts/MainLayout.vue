<template>
  <q-layout view="hHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> Quasar App </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
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

const schemeStore = useSchemeStore();

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
