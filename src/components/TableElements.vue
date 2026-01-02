<template>
    <q-table :rows="props.rows" :columns="props.columns" row-key="ID" selection="multiple" v-model:selected="selected"
        separator="cell" rows-per-page-label="Элементов на странице" :pagination-label="setCountTitle"
        :rows-per-page-options="[25, 50, 100, 200, 500, 1000]" @row-click="go" v-model:pagination="pagination"
        @request="test">
        <template #top>
            <div>
                <div class="text-h6 q-pa-sm">{{ props.title }}</div>
                <q-btn-group>
                    <q-btn color="positive" glossy no-caps label="Создать" />
                    <q-btn color="secondary" glossy no-caps label="Изменить" />
                    <q-btn color="negative" glossy no-caps label="Удалить" />
                </q-btn-group>
            </div>
        </template></q-table>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

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
}>();

// Сигнатура эмита (типы для TypeScript)
const emit = defineEmits<{
    (e: 'selection-change', count: number): void;
    (e: 'pagination', pagination: any): void;
}>();

// Локальное состояние выделенных строк
const selected = ref<Row[]>([]);

const setCountTitle = (from: number, to: number, total: number) => {
    return `с ${from} по ${to} из ${total}`;
};

const go = async (evt: Event, row: Row, _: number) => {
    if (row && row?.name) {
        await router.push(`/collections/${row?.name}`);
    }
};

const pagination = ref({
    descending: false,
    page: 1,
    rowsPerPage: 25,
    rowsNumber: 20
}
);
const test = (pag: any) => {
    console.log('next page', pag);
    pagination.value = pag.pagination;
};

// Следим за изменением выделения и шлём количество выделенных элементов
watch(selected, (val) => {
    emit('selection-change', Array.isArray(val) ? val.length : 0);
});
</script>

<style lang="scss">
.max-size {
    flex: 1 1 auto;
}
</style>