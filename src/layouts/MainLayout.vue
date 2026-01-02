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

        <LeftMenuItemComponent v-for="link in linksList" :key="link.title" v-bind="link" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LeftMenuItemComponent, { type LeftMenuItem } from 'components/LeftMenuItem.vue';

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
const miniState = ref(false)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

</script>
