<template>
    <q-table :rows="props.rows" :columns="props.columns" :row-key="(row) => row.id ? row.id : row.ID"
        :selection="(route.name === 'collections' || route.name === 'roles') ? 'single' : 'multiple'"
        v-model:selected="selectedLocal" separator="cell" rows-per-page-label="Элементов на странице"
        :pagination-label="setCountTitle" :rows-per-page-options="[25, 50, 100, 200, 500, 1000]" @row-click="go"
        v-model:pagination="paginationProxy" @request="updatePag">
        <template #top>
            <div>
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
            </div>
        </template></q-table>
</template>

<script lang="ts" setup>
import { ref, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
const router = useRouter();
const route = useRoute();

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
}>();

// Локальное состояние выделенных строк
const selectedLocal = computed({
    get: () => props.selected ?? [],
    set: (val: any) => emit('update:selected', val)
});

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
        emit('recover-rows');
    }
};

// Переход на элемент по клику

const go = async (evt: Event, row: Row, _: number) => {
    if (route.name === 'collections') {
        if (row && row?.name) {
            await router.push(`/collections/${row?.name}`);
            return;
        }
    }
    // Здесь добавить логику если у юзера есть право редактировать, то открывать редактор, если нет, то просто просмотр
    if (route.name === 'collection') {
        if (row && row?.id) {
            await router.push(`/collections/${route.params.name as string}/${row?.id}`);
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
            await router.push(`/users/${row?.id}`);
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