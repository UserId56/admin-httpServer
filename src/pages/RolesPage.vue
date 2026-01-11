<template>
    <q-page class="q-pa-md column">
        <TableElement :columns="columns" :rows="row" title="Коллекции" v-model:pagination="pagination"
            v-model:selected="selected" @delete-rows="onDelete" />
    </q-page>
</template>

<script lang="ts" setup>
import TableElement from 'components/TableElements.vue';
import type { Column } from 'components/TableElements.vue';
import { onMounted, ref, watch } from 'vue';
import { Dialog } from 'quasar';
import { RoleAPI } from 'src/API';
import { LocalStorage } from 'quasar';

const columns: Column[] = [
    { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
    { name: 'name', label: 'Название', field: 'name', sortable: true, align: 'left' },
]
const row = ref<Array<any>>([]);
const selected = ref<Array<any>>([]);
const pagination = ref({
    descending: false,
    page: 1,
    rowsPerPage: 25,
    numberOfPages: 0,
    sortBy: 'Костыль, не хочет работать ни как',
});
onMounted(async () => {
    const loadPagination = LocalStorage.getItem('roles-pagination');
    if (loadPagination) {
        pagination.value = loadPagination as typeof pagination.value;
        return;
    } else {
        pagination.value.sortBy = ''
    }
    await onRequest();
    pagination.value.numberOfPages = row.value.length;
});

const onDelete = async () => {
    if (selected.value.length === 0) {
        return;
    }

    const confirmed = await new Promise<boolean>((resolve) => {
        Dialog.create({
            title: 'Подтверждение',
            message: `Вы уверены, что хотите удалить роль ${selected.value[0].name}? Это действие необратимо.`,
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

    if (!confirmed) {
        return;
    }

    // Удаление выбранной роли
    const roleId = selected.value[0].ID;
    const success = await RoleAPI.deleteRole(roleId);
    if (success) {
        await onRequest();
        selected.value = [];
        pagination.value.numberOfPages = row.value.length;
    }
};

watch(pagination, async (oldValue, newValue) => {
    if (oldValue.page !== newValue.page || oldValue.rowsPerPage !== newValue.rowsPerPage || oldValue.sortBy !== newValue.sortBy || oldValue.descending !== newValue.descending) {
        LocalStorage.set('roles-pagination', pagination.value);
        await onRequest();
    }
});

const onRequest = async () => {
    await RoleAPI.getRoles(pagination.value.rowsPerPage, (pagination.value.page - 1) * pagination.value.rowsPerPage).then((data) => {
        if (data) {
            row.value = data;
        }
    });
};

</script>
