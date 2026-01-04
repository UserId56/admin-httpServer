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
import { Dialog } from 'quasar';
const schemeStore = useSchemeStore();

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
});

onMounted(async () => {
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

watch(pagination, async () => {
  await onRequest();
});

const onRequest = async () => {
  await schemeStore.getSchemes(pagination.value.rowsPerPage, (pagination.value.page - 1) * pagination.value.rowsPerPage);
};

</script>
