<template>
    <div>
        <q-page class="q-pa-md column">
            <TableElement :columns="columns" :rows="row" title="Пользователи" v-model:pagination="pagination"
                v-model:selected="selected" @delete-rows="onDelete" />
        </q-page>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { UserAPI, RoleAPI } from 'src/API';
import TableElement from 'components/TableElements.vue';
import type { Column } from 'components/TableElements.vue';
import type { Role } from 'src/models/roles';

const columns: Column[] = [
    { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
    { name: 'username', label: 'Имя пользователя', field: 'username', sortable: true, align: 'left' },
    { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
    { name: 'role', label: 'Роль', field: 'role', sortable: true, align: 'left' },
    { name: 'created_at', label: 'Дата создания', field: 'created_at', sortable: true, align: 'left' },
    { name: 'updated_at', label: 'Дата обновления', field: 'updated_at', sortable: true, align: 'left' },
]
const row = ref<Array<any>>([]);
const selected = ref<Array<any>>([]);
const pagination = ref({
    descending: false,
    page: 1,
    rowsPerPage: 25,
    numberOfPages: 0,
});
const roles = ref<Array<Role>>([]);
onMounted(async () => {
    // Сначала загружаем роли, потом пользователей
    // Загружаем все роли (большой лимит)
    const rolesData = await RoleAPI.getRoles(1000, 0);
    if (rolesData) {
        roles.value = rolesData;
    }
    await onRequest();
    pagination.value.numberOfPages = row.value.length;
});

const onDelete = async () => {
    if (selected.value.length === 0) {
        return;
    }
    const success = await UserAPI.deleteUser(selected.value[0].ID);
    if (!success) {
        return;
    }
    await onRequest();
    selected.value = [];
    pagination.value.numberOfPages = row.value.length;
}

const onRequest = async (): Promise<void> => {
    const data = await UserAPI.getUsers(pagination.value.rowsPerPage, (pagination.value.page - 1) * pagination.value.rowsPerPage);
    if (data) {
        for (const user of data) {
            for (const role of roles.value) {
                if (role.ID !== undefined && role.ID === user.role_id) {
                    user.role = role.name;
                    break;
                }
            }
        }
        row.value = data;
    }
}

watch(pagination, async (oldValue, newValue) => {
    if (oldValue.page !== newValue.page || oldValue.rowsPerPage !== newValue.rowsPerPage || oldValue.descending !== newValue.descending) {
        await onRequest();
    }
});
</script>