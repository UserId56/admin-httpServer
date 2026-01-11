<template>
    <q-page class="q-pa-md column">
        <TableElement :columns="columns" :rows="row" :title="schemeData.display_name" v-model:pagination="pagination"
            @delete-rows="handleDeleteRows" v-model:selected="selected" />
    </q-page>
</template>

<script lang="ts" setup>
import TableElement from 'components/TableElements.vue';
import type { Column } from 'components/TableElements.vue';
import { ObjectAPI, SchemeAPI } from '../API';
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import type { Scheme, Column as SchemeColumn } from 'src/models/scheme';
import type { ReqData } from 'src/models/query';
import { Dialog, LocalStorage } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
const userStore = useUserStore();

const route = useRoute();
const router = useRouter();
const collectionName = route.params.name as string;
const columns = ref<Column[]>([]);
const row = ref([]);
const pagination = ref({
    descending: true,
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 0,
    sortBy: 'Костыль, не хочет работать ни как',
});
const schemeData = ref<Scheme>({
    display_name: '',
} as Scheme);

const include: string[] = [];

const permission = userStore.permission;

const getPageData = async () => {
    if (!pagination.value) return;
    // Загружаем данные объектов из этой коллекции
    const reqData: ReqData = {
        take: pagination.value.rowsPerPage,
        skip: (pagination.value.page - 1) * pagination.value.rowsPerPage,
        count: true,
        include: include,
    }
    if (pagination.value.sortBy) {
        reqData.order = [{
            field: pagination.value.sortBy,
            direction: pagination.value.descending ? 'desc' : 'asc'
        }]
    }
    const objectsData = await ObjectAPI.getObject(collectionName, reqData);
    if (objectsData) {
        row.value = objectsData.data;
        if (!row.value) {
            row.value = [];
        }
        pagination.value.rowsNumber = objectsData.headers?.['x-total-count'] ? parseInt(objectsData.headers['x-total-count']) : 0;
    }

}

const selected = ref<Array<any>>([]);

onMounted(async () => {
    const data = await SchemeAPI.getSchemeByName(collectionName);
    if (data) {
        schemeData.value = data;
        // Формируем колонки таблицы на основе полей схемы
        if (data.columns) {
            data.columns.forEach((field: SchemeColumn) => {
                if (permission && permission.includes(`${collectionName}.${field.column_name}.forbidden`)) {
                    return;
                }
                include.push(field.column_name);
                columns.value.push({
                    name: field.column_name,
                    label: field.display_name,
                    field: field.column_name,
                    sortable: true,
                    align: 'left',
                    format: (val: any) => {
                        if (field.data_type === 'TIMESTAMP') {
                            if (!val) return val;
                            const date = new Date(val);
                            return date.toLocaleString();
                        }
                        return val;
                    }
                });
            });
        }
        const loadPagination = LocalStorage.getItem(`${collectionName}-pagination`);
        const page = route.query.page;
        if (loadPagination) {
            if (page) {
                (loadPagination as typeof pagination.value).page = parseInt(page as string);
            }
            pagination.value = loadPagination as typeof pagination.value;
            return;
        } else {
            pagination.value.sortBy = ''
        }
        await getPageData();
    }
});

const handleDeleteRows = async () => {
    try {
        const confirmed = await new Promise<boolean>((resolve) => {
            Dialog.create({
                title: 'Подтверждение',
                message: `Вы уверены, что хотите удалить ${selected.value.length} элементов?`,
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

        for (const r of selected.value) {
            const id = r.id ?? r.ID ?? r._id;
            if (!id) {
                console.warn('Нет идентификатора у строки, пропускаю', r);
                continue;
            }
            console.log('delete request for id', id);
            await ObjectAPI.deleteObject(collectionName, id);
        }
        selected.value = [];
        await getPageData();
    } catch (err) {
        console.error('handleDeleteRows error', err);
    }
}

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

    if (newValue.page !== oldValue.page || newValue.rowsPerPage !== oldValue.rowsPerPage ||
        newValue.sortBy !== oldValue.sortBy || newValue.descending !== oldValue.descending) {
        const savePagination = { ...pagination.value };
        savePagination.page = 1;
        LocalStorage.setItem(`${collectionName}-pagination`, savePagination);
        await getPageData();
    }
});

</script>