<template>
  <!-- class="row items-center justify-evenly" -->
  <q-page class="q-pa-md column">
    <TableElement :columns="columns" :rows="row" title="Коллекции" :pagination="pagination" />
  </q-page>
</template>

<script setup lang="ts">
import TableElement from 'components/TableElements.vue';
import type { Column } from 'components/TableElements.vue';
import { useSchemeStore } from 'src/stores/scheme-store';
import { computed, onMounted, ref } from 'vue';
const schemeStore = useSchemeStore();

const columns: Column[] = [
  { name: 'displayName', label: 'Название', field: 'displayName', sortable: true, align: 'left' },
]
const row = computed(() => schemeStore.getList)

const pagination = ref({
  descending: false,
  page: 1,
  rowsPerPage: 25,
});

onMounted(async () => {
  if (schemeStore.ListSchemes.length === 0) {
    await schemeStore.getSchemes();
  }
});

</script>
