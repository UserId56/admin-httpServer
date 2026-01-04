<template>
    <q-page class="q-pa-md column">
        <TableElement :columns="columns" :rows="row" :title="schemeData.displayName" v-model:pagination="pagination"
            @delete-rows="handleDeleteRows" v-model:selected="selected" @recover-rows="handleRecoverRows" />
    </q-page>
</template>

<script lang="ts" setup>
import TableElement from 'components/TableElements.vue';
import type { Column } from 'components/TableElements.vue';
import { ObjectAPI, SchemeAPI } from '../API';
import { useRoute } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import type { Scheme, Column as SchemeColumn } from 'src/models/scheme';
import type { ReqData } from 'src/models/query';
import { Dialog } from 'quasar';

const route = useRoute();
const collectionName = route.params.name as string;
const columns = ref<Column[]>([]);
const row = ref([]);
const pagination = ref({
    descending: true,
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 0,
    sortBy: 'updated_at',
});
const schemeData = ref<Scheme>({
    displayName: '',
} as Scheme);

const getPageData = async () => {

    // Загружаем данные объектов из этой коллекции
    const reqData: ReqData = {
        take: pagination.value.rowsPerPage,
        skip: (pagination.value.page - 1) * pagination.value.rowsPerPage,
        count: true,
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
            await ObjectAPI.deleteObject(collectionName, id);
        }
        selected.value = [];
        await getPageData();
    } catch (err) {
        console.error('handleDeleteRows error', err);
    }
}

const handleRecoverRows = async () => {
    try {
        const confirmed = await new Promise<boolean>((resolve) => {
            Dialog.create({
                title: 'Подтверждение',
                message: `Вы уверены, что хотите восстановить ${selected.value.length} элементов?`,
                cancel: {
                    label: 'Отмена',
                    push: true
                },
                ok: {
                    label: 'Восстановить',
                    color: 'deep-orange-9',
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
            await ObjectAPI.recoverObject(collectionName, id);
        }
        selected.value = [];
        await getPageData();
    } catch (err) {
        console.error('handleRecoverRows error', err);
    }
}

watch(pagination, async () => {
    await getPageData();
});

</script>