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
import { UserAPI, RoleAPI, SchemeAPI } from 'src/API';
import TableElement from 'components/TableElements.vue';
import type { Column } from 'components/TableElements.vue';
import type { Role } from 'src/models/roles';
import type { ReqData } from 'src/models/query';
import { useUserStore } from 'src/stores/user-store';

const userStore = useUserStore();

const columns = ref<Column[]>([]);
const row = ref<Array<any>>([]);
const selected = ref<Array<any>>([]);
const pagination = ref({
    descending: false,
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 0,
    sortBy: '',
});
const includedColumns: string[] = []
const roles = ref<Array<Role>>([]);
const permission = userStore.permission;
onMounted(async () => {
    const schemeUsers = await SchemeAPI.getSchemeByName('users');
    if (schemeUsers && schemeUsers.columns) {
        for (const col of schemeUsers.columns) {
            if (col.column_name === 'password') {
                continue
            }
            if (permission && permission.includes(`user.${col.column_name}.forbidden`)) {
                continue;
            }
            columns.value.push({
                name: col.column_name,
                label: col.display_name,
                field: col.column_name,
                sortable: true,
                align: 'left',
            });
            includedColumns.push(col.column_name);
        }
    }
    // Сначала загружаем роли, потом пользователей
    // Загружаем все роли (большой лимит)
    const rolesData = await RoleAPI.getRoles(1000, 0);
    if (rolesData) {
        roles.value = rolesData;
    }
    pagination.value.rowsNumber = await onRequest();
});

const onDelete = async () => {
    if (selected.value.length === 0) {
        return;
    }
    const success = await UserAPI.deleteUser(selected.value[0].id);
    if (!success) {
        return;
    }
    pagination.value.rowsNumber = await onRequest();
    selected.value = [];
}

const onRequest = async (): Promise<number> => {
    const reqData: ReqData = {
        take: pagination.value.rowsPerPage,
        skip: (pagination.value.page - 1) * pagination.value.rowsPerPage,
        count: true,
        include: includedColumns,
    }
    if (pagination.value.sortBy) {
        reqData.order = [{
            field: pagination.value.sortBy,
            direction: pagination.value.descending ? 'desc' : 'asc'
        }]
    }
    const data = await UserAPI.getUsers(reqData);
    if (data) {
        for (const user of data.data) {
            for (const role of roles.value) {
                if (role.id !== undefined && role.id === user.role_id) {
                    user.role = role.name;
                    break;
                }
            }
        }
        row.value = data.data;
        for (const r of row.value) {
            for (const role of roles.value) {
                if (role.id !== undefined && role.id === r.role_id) {
                    r.role_id = role.name;
                    break;
                }
            }
        }
        return data.headers?.['x-total-count'] ? parseInt(data.headers['x-total-count']) : 0;
    }
    return 0;
}

watch(pagination, async (oldValue, newValue) => {
    if (oldValue.page !== newValue.page || oldValue.rowsPerPage !== newValue.rowsPerPage || oldValue.sortBy !== newValue.sortBy || oldValue.descending !== newValue.descending) {
        pagination.value.rowsNumber = await onRequest();
    }
});
</script>