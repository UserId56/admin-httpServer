<template>
    <q-table class="full-width overflow-hidden-y" :rows="props.rows" :columns="columns"
        :row-key="(row) => row.id ? row.id : row.ID"
        :selection="(route.name === 'collections' || route.name === 'roles') ? 'single' : 'multiple'"
        v-model:selected="selectedLocal" separator="cell" rows-per-page-label="Элементов на странице"
        :pagination-label="setCountTitle" :rows-per-page-options="[25, 50, 100, 200, 500, 1000]"
        v-model:pagination="paginationProxy" @request="updatePag">
        <template #top>
            <div v-if="props.schemeData?.view_data && route.name !== 'roles' && route.name !== 'collections'"
                class="row justify-end items-center no-wrap full-width q-my-md">
                <FilterComponent :schemeData="props.schemeData as Scheme" @update="getFilters" />
                <q-btn icon="search" size="md" flat @click="$emit('search', filters)"></q-btn>
            </div>
            <div class="row items-center justify-between full-width">
                <div class="text-h6 q-pa-sm">{{ props.title }}</div>
                <q-btn-group>
                    <q-btn color="positive" glossy no-caps label="Создать" :disable="disableBtn.create"
                        @click="create" />
                    <q-btn color="secondary" glossy no-caps label="Изменить" :disable="disableBtn.edit" @click="edit" />
                    <q-btn color="negative" glossy no-caps label="Удалить" :disable="disableBtn.delete"
                        @click="deleteElement" />
                    <q-btn color="deep-orange-9" glossy no-caps label="Восстановить" v-show="!disableBtn.recover"
                        @click="recoverElement" />
                </q-btn-group>
                <q-space />
                <q-btn-dropdown color="primary" :icon="TypeViewIcon" v-if="props.IsHierarchy">
                    <q-list>
                        <q-item clickable v-close-popup @click="TypeView = 'all'">
                            <q-item-section>
                                <q-item-label>Списком</q-item-label>
                            </q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="TypeView = 'hierarchy'">
                            <q-item-section>
                                <q-item-label>Иерархией</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-btn-dropdown>
            </div>
        </template>
        <template #body="propsTable">
            {{ console.log("Table render") }}
            <TableRow :propsTable="propsTable" :IsHierarchy="props.IsHierarchy" :TypeView="TypeView"
                :localSelected="selectedLocal" @go="go" @addSelected="addSelected" @getChildren="getChildren" />
        </template>
    </q-table>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TableRow from './TableRow.vue';
import FilterComponent from './FilterComponent.vue';
import type { Scheme } from 'src/models/scheme';
import type { QTableColumn } from 'quasar';
const router = useRouter();
const route = useRoute();


const columns = computed(() => {
    if (!props.schemeData || !props.schemeData.view_data) {
        return props.columns as QTableColumn[];
    }
    const columnsResult: any[] = [];
    for (const col of props.columns) {
        if (props.schemeData.view_data?.field_options[col.field as keyof typeof props.schemeData.view_data.field_options]?.hidden) {
            continue;
        }
        const column: QTableColumn = {
            name: col.name,
            label: col.label,
            field: col.field,
            align: col.align ?? 'center',
            sortable: col.sortable ?? false,
            // @ts-expect-error ignore
            order: props.schemeData.view_data.field_options[col.field].order,
        };
        if (col.format) {
            column.format = col.format;
        }
        columnsResult.push(column);
    }
    return columnsResult.sort((a, b) => a.order - b.order) as QTableColumn[];
});

// Запрос дочернихъ элементов
const getChildren = (row: any) => {
    emit('getChildren', row);
};

// Тип просмотра таблицы
const TypeView = computed<'all' | 'hierarchy'>({
    get: () => props.TypeView ?? 'all',
    set: (val: 'all' | 'hierarchy') => {
        emit('typeView', val);
    }
});

const TypeViewIcon = computed(() => {
    return TypeView.value === 'hierarchy' ? 'menu_open' : 'menu';
});

const filters = ref<Record<string, any>>({});

const getFilters = (filterData: Record<string, any>) => {
    filters.value = filterData;
};
// Тип строки — допускаем произвольные поля
type Row = {
    [key: string]: any;
};

export interface Pagination {
    descending: boolean;
    page: number;
    rowsPerPage: number;
    rowsNumber: null | number;
    sortBy: string | null;
}

// Тип колонки (упрощённый, можно расширить по необходимости)
export interface Column {
    name: string;
    label: string;
    field: string | ((row: any) => any);
    required?: boolean;
    align?: "left" | "right" | "center";
    sortable?: boolean;
    sort?: (a: any, b: any, rowA: any, rowB: any) => number;
    rawSort?: (a: any, b: any, rowA: any, rowB: any) => number;
    sortOrder?: "ad" | "da";
    format?: (val: any, row: any) => any;
    style?: string | ((row: any) => string);
    classes?: string | ((row: any) => string);
    headerStyle?: string;
    headerClasses?: string;
}

// Пропсы с явной типизацией
const props = defineProps<{
    title: string;
    rows: Row[];
    columns: Column[];
    pagination: any;
    selected?: Row[]
    IsHierarchy?: boolean;
    TypeView?: 'all' | 'hierarchy';
    schemeData?: Scheme;
}>();

const disableBtn = ref({
    create: false,
    edit: true,
    delete: true,
    recover: true,
});

// Сигнатура эмита (типы для TypeScript)
const emit = defineEmits<{
    (e: 'selection-change', count: number): void;
    (e: 'update:pagination', pagination: any): void;
    (e: 'update:selected', selected: Row[]): void;
    (e: 'delete-rows'): void;
    (e: 'recover-rows'): void;
    (e: 'typeView', type: 'all' | 'hierarchy'): void;
    (e: 'getChildren', rowIndex: number): void;
    (e: 'search', filterData: Record<string, any>): void;
}>();

// Локальное состояние выделенных строк
const selectedLocal = computed({
    get: () => props.selected ?? [],
    set: (val: any) => emit('update:selected', val)
});

const addSelected = (row: Row) => {
    if (!selectedLocal.value.includes(row)) {
        if (route.name === 'collections' || route.name === 'roles') {
            selectedLocal.value = [row];
            return;
        }
        selectedLocal.value = [...selectedLocal.value, row];
    }
    else {
        if (route.name === 'collections' || route.name === 'roles') {
            selectedLocal.value = [];
            return;
        }
        const index = selectedLocal.value.indexOf(row);
        if (index > -1) {
            const newSelected = [...selectedLocal.value];
            newSelected.splice(index, 1);
            selectedLocal.value = newSelected;
        }
    }


};

// ПАГИНАЦИЯ

const paginationProxy = computed({
    get: () => props.pagination ?? { page: 1, rowsPerPage: 25, rowsNumber: null, descending: true, sortBy: null },
    set: (val: any) => emit('update:pagination', val)
});

const setCountTitle = (from: number, to: number, total: number) => {
    return `с ${from} по ${to} из ${total}`;
};


const updatePag = (pag: any) => {
    console.log('next page', pag);
    paginationProxy.value = pag.pagination;
};




// Следим за изменением выделения и шлём количество выделенных элементов



watch(selectedLocal, (val) => {
    switch (val.length) {
        case 0:
            disableBtn.value.edit = true;
            disableBtn.value.delete = true;
            disableBtn.value.create = false;
            disableBtn.value.recover = true;
            break;
        case 1:
            disableBtn.value.edit = false;
            disableBtn.value.delete = false;
            disableBtn.value.create = true;
            break;
        default:
            disableBtn.value.edit = true;
            disableBtn.value.delete = false;
            disableBtn.value.create = true;
            break;
    }
    for (const item of val) {
        if (item.deleted_at === null || item.deleted_at === undefined || item.deleted_at === '') {
            disableBtn.value.recover = true;
            return;
        } else {
            disableBtn.value.recover = false;
        }
    }
    emit('selection-change', Array.isArray(val) ? val.length : 0);
});

// УДАЛЕНИЕ ЭЛЕМЕНТОВ

const deleteElement = () => {
    if (selectedLocal.value.length > 0) {
        emit('delete-rows');
    }
};

// ВОССТАНОВЛЕНИЕ ЭЛЕМЕНТОВ
const recoverElement = () => {
    if (selectedLocal.value.length > 0) {
        console.log('EMIT RECOVER');
        emit('recover-rows');
    }
};

// Переход на элемент по клику

const go = async (row: Row) => {
    if (route.name === 'collections') {
        if (row && row?.name) {
            await router.push(`/collections/${row?.name}`);
            // window.open(`/collections/${row?.name}`, '_blank');
            return;
        }
    }
    // Здесь добавить логику если у юзера есть право редактировать, то открывать редактор, если нет, то просто просмотр
    if (route.name === 'collection') {
        if (row && row?.id) {
            // await router.push(`/collections/${route.params.name as string}/${row?.id}`);
            window.open(`/collections/${route.params.name as string}/${row?.id}`, '_blank');
            return;
        }
    }
    if (route.name === 'roles') {
        if (row && row?.id) {
            await router.push(`/roles/${row?.id}`);
            return;
        }
    }
    if (route.name === 'users') {
        if (row && row?.id) {
            // await router.push(`/users/${row?.id}`);
            window.open(`/users/${row?.id}`, '_blank');
            return;
        }
    }
};

const create = async () => {
    if (route.name === 'collections') {
        await router.push({ name: 'collection-new-collection' });
        return;
    }
    if (route.name === 'collection') {
        await router.push({ name: 'collection-new-item', params: { name: route.params.name } });
    }
    if (route.name === 'roles') {
        await router.push({ name: 'roles-item-new' });
    }
    if (route.name === 'users') {
        await router.push({ name: 'users-item-new' });
    }
};

const edit = async () => {
    if (route.name === 'collections') {
        if (selectedLocal.value.length === 1) {
            // @ts-expect-error Бесит
            await router.push({ name: 'collection-edit-collection', params: { name: selectedLocal.value[0].name } });
        }
        return;
    }
    if (route.name === 'collection') {
        if (selectedLocal.value.length === 1) {
            await router.push({
                name: 'collection-item-edit',
                // @ts-expect-error Бесит
                params: { name: route.params.name, id: selectedLocal.value[0].id }
            });
        }
    }
    if (route.name === 'roles') {
        if (selectedLocal.value.length === 1) {
            // @ts-expect-error Бесит
            await router.push({ name: 'roles-item-edit', params: { id: selectedLocal.value[0].id } });
        }
    }
    if (route.name === 'users') {
        if (selectedLocal.value.length === 1) {
            // @ts-expect-error Бесит
            await router.push({ name: 'users-item-edit', params: { id: selectedLocal.value[0].id } });
        }
    }
};
</script>

<style lang="scss">
.max-size {
    flex: 1 1 auto;
}
</style>