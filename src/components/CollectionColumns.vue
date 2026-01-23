<template>
    <q-table class="full-width q-mt-md" flat bordered hide-bottom :rows="props.rows" :columns="props.columns"
        :row-key="(row) => row.id ? row.id : row.ID" separator="cell" rows-per-page-label="Элементов на странице"
        :rows-per-page-options="[1000]">
        <template #body-cell="{ col, value, rowIndex, row }">
            <q-td :key="col.name + '-' + rowIndex" :props="{ col, row, value }">
                <!-- @vue-expect-error -->
                <q-input v-model="collectionDataProvided.columns[rowIndex][col.name]" input-class="text-right"
                    type="text" dense borderless v-if="col.name === 'column_name' || col.name === 'display_name'"
                    :readonly="isReadable(row)" />
                <!-- @vue-expect-error -->
                <!-- eslint-disable-next-line -->
                <q-select v-model="collectionDataProvided.columns[rowIndex][col.name]" :options="props.optionDataType"
                    dense borderless emit-value map-options v-else-if="col.name === 'data_type'"
                    :readonly="isReadable(row)" />
                <!-- @vue-expect-error -->
                <!-- eslint-disable-next-line -->
                <q-checkbox v-model="collectionDataProvided.columns[rowIndex][col.name]"
                    v-else-if="col.name === 'is_multiple' || col.name === 'not_null' || col.name === 'is_unique'"
                    :disable="isReadable(row)" />
                <q-btn-group push v-else-if="col.name === 'more'"><q-btn
                        @click="openDialog(row, rowIndex)">Свойства</q-btn><q-btn icon="delete"
                        @click="emit('remove:rows', rowIndex)" :disable="isReadable(row)" /></q-btn-group>
            </q-td>
        </template>
    </q-table>
    <q-dialog v-model="dialog" persistent>
        <q-card>
            <q-card-section>
                <div class="text-h6">Свойства поля</div>
            </q-card-section>

            <q-card-section class="column">
                <!-- @vue-expect-error -->
                <q-input type="number"
                    v-model.number="collectionDataProvided.columns[currentRowIndex as number].field_options.order"
                    label="Сортировка" />
                <!-- @vue-expect-error -->
                <q-checkbox v-model="collectionDataProvided.columns[currentRowIndex as number].field_options.hidden"
                    label="Скрыть"
                    :disable="collectionDataProvided.columns[currentRowIndex as number]?.data_type === 'ref files'" />
                <!-- @vue-expect-error -->
                <q-checkbox v-model="collectionDataProvided.columns[currentRowIndex as number].field_options.filterable"
                    label="В фильтре"
                    :disable="collectionDataProvided.columns[currentRowIndex as number]?.data_type === 'ref files'" />
                <div class="q-mt-md">
                    <!-- @vue-expect-error -->
                    <div
                        v-if="collectionDataProvided.columns[currentRowIndex as number].field_options.pre_values.length > 0">
                        Предустановленные значения:</div>
                    <!-- @vue-expect-error -->
                    <div v-for="(preValue, preValueIndex) in collectionDataProvided.columns[currentRowIndex as number].field_options.pre_values"
                        :key="preValueIndex" class="row items-center q-mb-sm">
                        <!-- @vue-expect-error -->
                        <q-input
                            v-model="collectionDataProvided.columns[currentRowIndex as number].field_options.pre_values[preValueIndex].label"
                            class="col q-px-xs" label="Имя" :rules="[val => val.length >= 3 || 'Не менее 3 символов']"
                            no-error-icon
                            :error="showError && collectionDataProvided.columns[currentRowIndex as number].field_options.pre_values[preValueIndex].label.length < 3" />:
                        <!-- @vue-expect-error -->
                        <q-input
                            v-model="collectionDataProvided.columns[currentRowIndex as number].field_options.pre_values[preValueIndex].value"
                            class="col q-px-xs" label="Значение"
                            :rules="[val => val.length >= 1 || 'Не менее 1 символа']" no-error-icon
                            :error="showError && collectionDataProvided.columns[currentRowIndex as number].field_options.pre_values[preValueIndex].value.length < 1" />
                        <!-- @vue-expect-error -->
                        <q-btn flat icon="delete"
                            @click="collectionDataProvided.columns[currentRowIndex as number].field_options.pre_values.splice(preValueIndex, 1)" />
                    </div>
                    <!-- @vue-expect-error -->
                    <q-btn label="Добавить предустановленное значение" @click="collectionDataProvided.columns[currentRowIndex as number].field_options.pre_values.push({
                        label: '', value: ''
                    })" :disable="collectionDataProvided.columns[currentRowIndex as number]?.data_type !== 'STRING'" />
                </div>
            </q-card-section>

            <q-card-actions>
                <q-btn flat label="Закрыть" color="primary" @click="closeDialog(currentRowIndex as number)" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { QTableColumn as Column } from 'quasar';
import { useRoute } from 'vue-router';
import type { SchemeWithFieldOptions } from 'src/pages/CollectionNewCollectionPage.vue';

const route = useRoute();

const props = defineProps<{
    rows: any[];
    columns: Column[];
    optionDataType: { label: string; value: string }[];
    collectionData: SchemeWithFieldOptions;
}>();

const collectionDataProvided = computed<SchemeWithFieldOptions>({
    get: () => props.collectionData,
    set: (val: SchemeWithFieldOptions) => { emit('update:collectionData', val); }
})

const emit = defineEmits<{
    (e: 'remove:rows', index: number): void;
    (e: 'update:collectionData', value: SchemeWithFieldOptions): void;
}>();

const dialog = ref(false);
const currentRowIndex = ref<number | null>(null);
const currentRow = ref<any>(null);

const openDialog = (row: any, rowIndex: number) => {
    currentRowIndex.value = rowIndex;
    currentRow.value = row;
    if (collectionDataProvided.value.columns[rowIndex]?.data_type === 'ref files') {
        collectionDataProvided.value.columns[rowIndex].field_options.hidden = true;
        collectionDataProvided.value.columns[rowIndex].field_options.filterable = false;
    }
    dialog.value = true;
};
const showError = ref(false);

const closeDialog = (rowIndex: number) => {
    showError.value = false;
    // @ts-expect-error ignore
    if (collectionDataProvided.value.columns[rowIndex].field_options.pre_values) {
        // @ts-expect-error ignore
        for (const preValue of collectionDataProvided.value.columns[rowIndex].field_options.pre_values) {
            if (preValue.label.length < 3 || preValue.value.length < 1) {
                showError.value = true;
                return;
            }

        }
    }
    if (showError.value) {
        return;
    }
    dialog.value = false;
    currentRowIndex.value = null;
    currentRow.value = null;
};

const isReadable = (row: any) => {
    if (route.params.name === 'users' || route.params.name === 'roles') {
        if (row.column_name === 'username' || row.column_name === 'password' || row.column_name === 'role_id' || row.column_name === 'email' || row.column_name === 'avatar' || row.column_name === 'bio' || row.column_name === 'name' || row.column_name === 'permissions') {
            return true;
        }
    }
    return row.column_name === 'id' || row.column_name === 'created_at' || row.column_name === 'updated_at' || row.column_name === 'deleted_at' || row.column_name === 'owner_id';
};

</script>