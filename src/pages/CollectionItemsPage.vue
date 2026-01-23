<template>
    <q-page class="q-pa-md column">
        <TableElement :columns="columns" :rows="row" :title="schemeData.display_name || ''"
            v-model:pagination="pagination" @delete-rows="handleDeleteRows" v-model:selected="selected"
            @recover-rows="handleRecoverRows" :IsHierarchy="IsHierarchy" :TypeView="TypeView" @type-view="EditView"
            @getChildren="handlerGetChildren" :schemeData="schemeData" @search="handlerSearch" />
    </q-page>
</template>

<script lang="ts" setup>
import TableElement from 'components/TableElements.vue';
import type { Column } from 'components/TableElements.vue';
import { ObjectAPI, SchemeAPI, UserAPI, FileAPI } from '../API';
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, watch, computed } from 'vue';
import type { Scheme, Column as SchemeColumn } from 'src/models/scheme';
import type { ReqData } from 'src/models/query';
import { Dialog, LocalStorage } from 'quasar';
import { useUserStore } from 'src/stores/user-store';
import { useSchemeStore } from 'src/stores/scheme-store';
import { ShortViewPars } from 'src/helpers/ShortViewPars';
import { parseDateTime } from 'src/helpers/DateTimePars';
import { useSettingsStore } from 'src/stores/settings';
const userStore = useUserStore();
const schemeStore = useSchemeStore();
const settingsStore = useSettingsStore();

const route = useRoute();
const router = useRouter();
const collectionName = computed(() => route.params.name as string);
const columns = ref<Column[]>([]);
const row = ref([]);
const pagination = ref({
    descending: true,
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 0,
    sortBy: 'Костыль, не хочет работать ни как',
});
const schemeData = ref<Scheme>({} as Scheme);

let include: string[] = [];

const permission = userStore.permission;

let refCollectionData = {};
const fetchCollectionData = {};
let rowRef: string[] = [];

const IsHierarchy = ref(false);
const refPearent = ref('')

const TypeView = ref<'all' | 'hierarchy'>('all');

const EditView = (type: 'all' | 'hierarchy') => {
    TypeView.value = type;
}

const getViewType = (): boolean => {
    const SchemeTypeView = LocalStorage.getItem('SchemeTypeView');
    if (SchemeTypeView) {
        if (TypeView.value != SchemeTypeView[route.params.name as keyof typeof SchemeTypeView]) {
            TypeView.value = SchemeTypeView[route.params.name as keyof typeof SchemeTypeView];
            return true;
        }
    }
    return false;
};

watch(TypeView, async (newValue, oldValue) => {
    if (newValue !== oldValue) {
        const viewTypeStorage = LocalStorage.getItem('SchemeTypeView') || {};
        // @ts-expect-error ignore
        viewTypeStorage[route.params.name as keyof typeof viewTypeStorage] = newValue;
        LocalStorage.set('SchemeTypeView', viewTypeStorage);
        refCollectionData = {};
        pagination.value.page = 1;
        await getPageData();
    }
});

const getIndexArray = (rowData: any, arrayData: any[]): any => {
    let result: any = {};
    for (let i = 0; i < arrayData.length; i++) {
        if (arrayData[i].id === rowData.id) {
            result = arrayData[i];
            break
        } else {
            if (arrayData[i].children && arrayData[i].children.length > 0) {
                const res = getIndexArray(rowData, arrayData[i].children);
                if (res.id) {
                    result = res
                    break;
                }
            }
        }
    }
    return result;
};

const getSTyle = (): string => {
    const ArraColor = ['orange', 'yellow', 'green', 'blue', 'indigo', 'purple', 'pink', 'brown'];
    const color = ArraColor[Math.floor(Math.random() * ArraColor.length)];
    return 'bg-' + color + '-2';
};

const handlerGetChildren = async (rowSearch: any) => {
    const dataRow = getIndexArray(rowSearch, row.value);
    dataRow.open = !dataRow.open;
    if (!dataRow.open) {
        dataRow.children = null;
        return;
    }
    dataRow.style = getSTyle();
    if (!refPearent.value) {
        return;
    }
    const parentId = dataRow['id'];
    const reqData: ReqData = {
        take: pagination.value.rowsPerPage,
        skip: 0,
        count: true,
        include: include,
        where: [{
            field: refPearent.value,
            operator: 'eq',
            value: parentId
        }]
    };
    const objectsData = await ObjectAPI.getObject(collectionName.value, reqData);
    if (objectsData) {
        for (const r of objectsData.data) {
            for (const col of schemeData.value.columns || []) {
                if (col.data_type === 'ref') {
                    if (!rowRef.includes(col.column_name)) {
                        rowRef.push(col.column_name);
                    }
                    if (!r[col.column_name]) {
                        continue;
                    }
                    // @ts-expect-error SUKA
                    if (refCollectionData[col.referenced_scheme]) {
                        if (col.is_multiple) {
                            // @ts-expect-error SUKA
                            refCollectionData[col.referenced_scheme].push(...r[col.column_name]);
                        }
                        // @ts-expect-error SUKA
                        refCollectionData[col.referenced_scheme].push(r[col.column_name]);
                    } else {
                        if (col.is_multiple) {
                            // @ts-expect-error SUKA
                            refCollectionData[col.referenced_scheme] = [...r[col.column_name]];
                        } else {
                            // @ts-expect-error SUKA
                            refCollectionData[col.referenced_scheme] = [r[col.column_name]];
                        }
                    }
                }
            }
        }
        for (const key of Object.keys(refCollectionData)) {
            const value = refCollectionData[key as keyof typeof refCollectionData];
            let data = {};
            if (key === 'users') {
                // @ts-expect-error бесит
                data = await UserAPI.getUsers({
                    where: [{
                        field: 'id',
                        operator: 'in',
                        value: value
                    }],
                })
            } else {
                data = await ObjectAPI.getObject(key, {
                    where: [{
                        field: 'id',
                        operator: 'in',
                        value: value
                    }],
                });
            }
            // @ts-expect-error SUKA
            if (data && data.data) {
                // @ts-expect-error SUKA
                fetchCollectionData[key] = data.data;
            }
        }
        dataRow.children = objectsData.data;
    }
};

let filterParams: Record<string, any> = {};

const handlerSearch = async (filterData: Record<string, any>) => {
    filterParams = filterData;
    await getPageData();
}

const getPageData = async () => {
    if (!pagination.value) return;
    if (getViewType()) {
        return
    }
    // Загружаем данные объектов из этой коллекции
    const reqData: ReqData = {
        take: pagination.value.rowsPerPage,
        skip: (pagination.value.page - 1) * pagination.value.rowsPerPage,
        count: true,
        include: include,
    }
    if (TypeView.value === 'hierarchy' && refPearent.value) {
        reqData.where = [{
            field: refPearent.value,
            operator: 'null',
            value: null
        }];
    }
    if (Object.keys(filterParams).length > 0) {
        reqData.where = reqData.where || [];
        for (const key of Object.keys(filterParams)) {
            if (key === 'fieldOperatorOptions') {
                continue;
            }
            if (key === 'search' && filterParams[key]) {
                reqData.where.push({
                    query: filterParams[key]
                });
                continue;
            }
            if (filterParams[key] !== undefined && filterParams[key] !== '') {
                let operator = 'eq';
                if (Array.isArray(filterParams[key])) {
                    operator = 'in';
                }
                if (typeof filterParams[key] === 'string') {
                    operator = 'iLike';
                }
                if (filterParams['fieldOperatorOptions'] && filterParams['fieldOperatorOptions'][key]) {
                    operator = filterParams['fieldOperatorOptions'][key].value;
                    if (operator === 'notNull' || operator === 'null') {
                        filterParams[key] = null;
                    }
                }
                reqData.where.push({
                    field: key,
                    operator: operator,
                    value: filterParams[key]
                });
            }
        }
    }
    if (pagination.value.sortBy) {
        reqData.order = [{
            field: pagination.value.sortBy,
            direction: pagination.value.descending ? 'desc' : 'asc'
        }]
    }
    const objectsData = await ObjectAPI.getObject(collectionName.value, reqData);
    if (objectsData) {
        if (!objectsData.data) {
            row.value = [];
        }
        for (const r of objectsData.data) {
            for (const col of schemeData.value.columns || []) {
                if (col.data_type === 'ref') {
                    if (!rowRef.includes(col.column_name)) {
                        rowRef.push(col.column_name);
                    }
                    if (!col.is_multiple) {
                        if (route.params.name !== 'users' && route.params.name === col.referenced_scheme) {
                            refPearent.value = col.column_name;
                            IsHierarchy.value = true;
                        }
                    }
                    if (!r[col.column_name]) {
                        continue;
                    }
                    // @ts-expect-error бесит
                    if (refCollectionData[col.referenced_scheme]) {
                        if (col.is_multiple) {
                            // @ts-expect-error бесит
                            refCollectionData[col.referenced_scheme].push(...r[col.column_name]);
                        } else {
                            // @ts-expect-error бесит
                            refCollectionData[col.referenced_scheme].push(r[col.column_name]);
                        }
                    } else {
                        if (col.is_multiple) {
                            // @ts-expect-error бесит
                            refCollectionData[col.referenced_scheme] = [...r[col.column_name]];
                        } else {
                            // @ts-expect-error бесит
                            refCollectionData[col.referenced_scheme] = [r[col.column_name]];
                        }
                    }
                }
            }
        }
        for (const key of Object.keys(refCollectionData)) {
            const value = refCollectionData[key as keyof typeof refCollectionData];
            let data = {
                data: []
            };
            switch (key) {
                case 'files':
                    for (const fileId of value as Array<string>) {
                        const fileData = await FileAPI.getFileMetaById(fileId);
                        if (fileData) {
                            // @ts-expect-error бесит
                            data.data.push(fileData.data);
                        }
                    }
                    break;
                case 'users':
                    // @ts-expect-error бесит
                    data = await UserAPI.getUsers({
                        where: [{
                            field: 'id',
                            operator: 'in',
                            value: [...new Set(value)]
                        }],
                    })
                    break;
                default:
                    data = await ObjectAPI.getObject(key, {
                        where: [{
                            field: 'id',
                            operator: 'in',
                            value: [...new Set(value)]
                        }],
                    });
            }
            if (data && data.data) {
                // @ts-expect-error бесит
                fetchCollectionData[key] = data.data;
            }
        }
        row.value = objectsData.data;
        pagination.value.rowsNumber = objectsData.headers?.['x-total-count'] ? parseInt(objectsData.headers['x-total-count']) : 0;
    }

}

const selected = ref<Array<any>>([]);

const schemeList = computed(() => schemeStore.getList || []);

const initCollection = async () => {
    // сброс состояния
    columns.value = [];
    row.value = [];
    pagination.value.page = 1;
    refCollectionData = {};
    include = []
    rowRef = [];
    if (schemeList.value.length === 0) {
        await schemeStore.getSchemes();
    }
    const data = await SchemeAPI.getSchemeByName(collectionName.value);
    if (data) {
        schemeData.value = data;
        // Формируем колонки таблицы на основе полей схемы
        if (data.columns) {
            data.columns.forEach((field: SchemeColumn) => {
                if (permission && permission.includes(`${collectionName.value}.${field.column_name}.forbidden`)) {
                    return;
                }
                include.push(field.column_name);
                let name = field.column_name;
                if (field.data_type === 'ref') {
                    name = 'ref' + field.referenced_scheme;
                    if (route.params.name !== 'users' && route.params.name === field.referenced_scheme) {
                        refPearent.value = field.column_name;
                        IsHierarchy.value = true;
                    }
                }
                if (field.data_type === 'BOOLEAN') {
                    name = 'BOOLEAN' + field.column_name;
                }
                columns.value.push({
                    name: name,
                    label: field.display_name,
                    field: field.column_name,
                    sortable: true,
                    align: 'left',
                    format: (val: any, row: any) => {
                        if (field.data_type === 'TIMESTAMPTZ' || field.data_type === 'DATE') {
                            return parseDateTime(val, field.data_type, settingsStore.getTimeZone);
                        }
                        if (rowRef.includes(field.column_name)) {
                            let shortView = '';
                            for (const scheme of schemeList.value) {
                                if (scheme.name === field.referenced_scheme) {
                                    shortView = scheme.view_data.short_view || '{id}';
                                    break;
                                }
                            }
                            if (field.referenced_scheme === 'files') {
                                shortView = '{name}';
                            }
                            const result = ShortViewPars(shortView, field.column_name, row, field.is_multiple, fetchCollectionData[field.referenced_scheme as keyof typeof fetchCollectionData], field.referenced_scheme as string);
                            return result;

                        }
                        return val;
                    }
                });
            });
        }
        const loadPagination = LocalStorage.getItem(`${collectionName.value}-pagination`);
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
}

onMounted(async () => {
    await initCollection();
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
            await ObjectAPI.deleteObject(collectionName.value, id);
        }
        selected.value = [];
        await getPageData();
    } catch (err) {
        console.error('handleDeleteRows error', err);
    }
}

const handleRecoverRows = async () => {
    try {
        for (const r of selected.value) {
            const id = r.id ?? r.ID ?? r._id;
            if (!id) {
                console.warn('Нет идентификатора у строки, пропускаю', r);
                continue;
            }
            console.log('recover request for id', id);
            if (route.params.name === 'users') {
                await UserAPI.recoverUser(id);
            } else {
                await ObjectAPI.recoverObject(collectionName.value, id);
            }
        }
        selected.value = [];
        await getPageData();
    } catch (err) {
        console.error('handleRecoverRows error', err);
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
        refCollectionData = {};
        const savePagination = { ...pagination.value };
        savePagination.page = 1;
        LocalStorage.setItem(`${collectionName.value}-pagination`, savePagination);
        await getPageData();
    }
});

watch(collectionName, async (newName, oldName) => {
    if (newName !== oldName) {
        await initCollection();
    }
});

</script>