<template>
    <q-table :rows="props.rows" :columns="props.columns" row-key="id" selection="multiple"
        v-model:selected="selectedLocal" separator="cell" rows-per-page-label="Элементов на странице"
        :pagination-label="setCountTitle" :rows-per-page-options="[25, 50, 100, 200, 500, 1000]" @row-click="go"
        v-model:pagination="paginationProxy" @request="updatePag">
        <template #top>
            <div>
                <div class="text-h6 q-pa-sm">{{ props.title }}</div>
                <q-btn-group>
                    <q-btn color="positive" glossy no-caps label="Создать" :disable="disableBtn.create"
                        @click="() => router.push({ name: 'collection-new-item', params: { name: route.params.name } })" />
                    <q-btn color="secondary" glossy no-caps label="Изменить" :disable="disableBtn.edit" />
                    <q-btn color="negative" glossy no-caps label="Удалить" :disable="disableBtn.delete"
                        @click="deleteElement" />
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
});

// Сигнатура эмита (типы для TypeScript)
const emit = defineEmits<{
    (e: 'selection-change', count: number): void;
    (e: 'update:pagination', pagination: any): void;
    (e: 'update:selected', selected: Row[]): void;
    (e: 'delete-rows'): void;
}>();

// Локальное состояние выделенных строк
const selectedLocal = computed({
    get: () => props.selected ?? [],
    set: (val: any) => emit('update:selected', val)
});

// ПАГИНАЦИЯ



const paginationProxy = computed({
    get: () => props.pagination ?? { page: 1, rowsPerPage: 25, rowsNumber: 0, descending: false },
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
    emit('selection-change', Array.isArray(val) ? val.length : 0);
});

// УДАЛЕНИЕ ЭЛЕМЕНТОВ

const deleteElement = () => {
    if (selectedLocal.value.length > 0) {
        emit('delete-rows');
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
};
</script>

<style lang="scss">
.max-size {
    flex: 1 1 auto;
}
</style>