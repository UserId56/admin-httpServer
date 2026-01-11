<template>
  <!-- class="row items-center justify-evenly" -->
  <q-page class="q-pa-md column">
    <TableElement :columns="columns" :rows="row" title="Коллекции" v-model:pagination="pagination"
      v-model:selected="selected" @delete-rows="onDelete" />
  </q-page>
</template>

<script setup lang="ts">
import TableElement from 'components/TableElements.vue';
import type { Column } from 'components/TableElements.vue';
import { useSchemeStore } from 'src/stores/scheme-store';
import { computed, onMounted, ref, watch } from 'vue';
import { Dialog, LocalStorage } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
const schemeStore = useSchemeStore();
const route = useRoute();
const router = useRouter();

const columns: Column[] = [
  { name: 'display_name', label: 'Название', field: 'display_name', sortable: true, align: 'left' },
]
const row = computed(() => schemeStore.getList)

const selected = ref<Array<any>>([]);

const pagination = ref({
  descending: false,
  page: 1,
  rowsPerPage: 25,
  numberOfPages: 0,
  sortBy: 'display_name',
});

onMounted(async () => {
  const loadPagination = LocalStorage.getItem('index-pagination');
  const page = route.query.page;
  if (loadPagination) {
    if (page) {
      (loadPagination as typeof pagination.value).page = parseInt(page as string);
    }
    pagination.value = loadPagination as typeof pagination.value;
  }
  if (schemeStore.ListSchemes.length === 0) {
    await schemeStore.getSchemes();
    pagination.value.numberOfPages = schemeStore.ListSchemes.length
  }
});

const onDelete = async () => {
  if (selected.value.length === 0) {
    return;
  }

  const confirmed = await new Promise<boolean>((resolve) => {
    Dialog.create({
      title: 'Подтверждение',
      message: `Вы уверены, что хотите удалить ${selected.value[0].display_name}? Это действие необратимо.`,
      cancel: {
        label: 'Отмена',
        push: true
      },
      ok: {
        label: 'Удалить',
        color: 'negative',
        push: true
      },
      persistent: true
    })
      .onOk(() => resolve(true))
      .onCancel(() => resolve(false))
      .onDismiss(() => resolve(false));
  });

  if (!confirmed) return;

  await schemeStore.deleteScheme(selected.value[0].name);
  selected.value = [];
};

watch(pagination, async (newValue, oldValue) => {

  if (newValue.page !== oldValue.page) {
    const target = {
      name: route.name as string,
      params: { ...route.params },
      query: { ...route.query, page: newValue.page.toString() }
    };
    try {
      // replace — чтобы не плодить историю, или push если нужно
      await router.push(target);
    } catch (err) {
      console.error('Router navigation error:', err);
    }
  }

  if (oldValue.page !== newValue.page || oldValue.rowsPerPage !== newValue.rowsPerPage || oldValue.sortBy !== newValue.sortBy || oldValue.descending !== newValue.descending) {
    const savePagination = { ...pagination.value };
    savePagination.page = 1;
    LocalStorage.setItem('index-pagination', savePagination);
    await onRequest();
  }
});

const onRequest = async () => {
  await schemeStore.getSchemes(pagination.value.rowsPerPage, (pagination.value.page - 1) * pagination.value.rowsPerPage);
};

</script>
