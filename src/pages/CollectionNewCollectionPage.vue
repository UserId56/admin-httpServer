<template>
    <q-card class="q-pa-md q-ma-md">
        <q-card-section>
            <span class="text-h4">Создание коллекции</span>
        </q-card-section>
        <q-card-section>
            <q-form @submit="create">
                <q-input v-model="collection.name" label="Название коллекции" clearable maxlength="64" counter
                    :readonly="isReadOnly" hint="Использовать только латинские буквы, цифры и символы подчеркивания" />
                <q-input v-model="collection.display_name" label="Отображаемое имя" clearable maxlength="255" counter />
                <q-input v-model="collection.view_data.short_view" label="Краткое представление" clearable
                    hint="Используйте {field_name} для отображения значений полей" maxlength="65" counter />
                <q-checkbox v-model="collection.view_data.hide_menu" label="Скрыть в меню"></q-checkbox>
                <CollectionColumns :columns="columns" :rows="collection.columns"
                    v-if="collection.columns && collection.columns.length" :optionDataType="TypeOptions"
                    @remove:rows="removeColumn" :collectionData="collection"
                    @update:collection-data="updataCollection" />
                <q-btn label="Добавить поле" color="deep-orange-9" @click="addColumn" class="q-mt-md"></q-btn>
                <div class="q-mt-md">
                    <q-btn :label="(route.name === 'collection-edit-collection' ? 'Сохранить' : 'Создать')"
                        type="submit" color="primary" />
                    <q-btn label="Отмена" @click="router.push({ name: 'collections' })" color="primary" flat
                        class="q-ml-sm" />
                </div>
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { SchemeAPI } from '../API';
import { Loading } from 'quasar';
import type { Scheme, Column, FieldOptions } from 'src/models/scheme';
import { useSchemeStore } from 'src/stores/scheme-store';
import type { QTableColumn } from 'quasar';
import CollectionColumns from 'src/components/CollectionColumns.vue';
const router = useRouter();
const route = useRoute();
const schemeStore = useSchemeStore();

export type SchemeColumn = Column & {
    field_options: FieldOptions;
}

export type SchemeWithFieldOptions = Scheme & {
    columns: SchemeColumn[];
}

const TypeOptions = ref([
    {
        label: 'Текст',
        value: 'TEXT',
    },
    {
        label: 'Строка',
        value: 'STRING',
    },
    {
        label: 'Число',
        value: 'INT',
    },
    {
        label: 'Большое число',
        value: 'BIGINT',
    },
    {
        label: 'Число с плавающей точкой',
        value: 'FLOAT',
    },
    {
        label: 'Деньги',
        value: 'MONEY',
    },
    {
        label: 'Булево',
        value: 'BOOLEAN',
    },
    {
        label: 'Дата',
        value: 'DATE',
    },
    {
        label: 'Метка времени',
        value: 'TIMESTAMPTZ',
    },
    {
        label: 'JSON',
        value: 'JSON',
    },
]);

const listSchemes = computed(() => schemeStore.getList);

const collection = ref<SchemeWithFieldOptions>({
    id: 0,
    CreatedAt: '',
    UpdatedAt: '',
    name: '',
    display_name: '',
    view_data: {
        short_view: '{id}',
        hide_menu: false,
        field_options: {
            id: {
                hidden: false,
                filterable: true,
                order: 1,
                pre_values: []
            },
            created_at: {
                hidden: false,
                filterable: true,
                order: 2,
                pre_values: []
            },
            updated_at: {
                hidden: false,
                filterable: true,
                order: 3,
                pre_values: []
            },
            deleted_at: {
                hidden: true,
                filterable: false,
                order: 4,
                pre_values: []
            },
        },
    },
    columns: [],
} as SchemeWithFieldOptions);

const columns: QTableColumn[] = [
    {
        name: 'column_name',
        label: 'Имя поля',
        field: 'column_name',
        align: 'center',
    },
    {
        name: 'display_name',
        label: 'Название',
        field: 'display_name',
        align: 'center',
    },
    {
        name: 'data_type',
        label: 'Тип данных',
        field: 'data_type',
        align: 'center',
    },
    {
        name: 'is_multiple',
        label: 'Множественное',
        field: 'is_multiple',
        align: 'center',
    },
    {
        name: 'not_null',
        label: 'Обязательное',
        field: 'not_null',
        align: 'center',
    },
    {
        name: 'is_unique',
        label: 'Уникальное',
        field: 'is_unique',
        align: 'center',
    },
    {
        name: 'more',
        label: 'Свойства',
        field: 'more',
        align: 'center',
    }
]

const updataCollection = (value: SchemeWithFieldOptions) => {
    collection.value = value;
};

onMounted(async () => {
    Loading.show();
    if (route.name === 'collection-edit-collection' && route.params.name) {
        const existingScheme = await SchemeAPI.getSchemeByName(route.params.name as string);
        for (const column of existingScheme?.columns || []) {
            if (column.data_type === 'ref' && column.referenced_scheme) {
                column.data_type = 'ref ' + column.referenced_scheme;
            }
        }
        collection.value = { ...existingScheme as SchemeWithFieldOptions };
        for (const col of collection.value.columns) {
            // @ts-expect-error -- ignore
            col.field_options = collection.value.view_data.field_options[col.column_name];
        }
    }
    if (listSchemes.value === null || listSchemes.value.length === 0) {
        await schemeStore.getSchemes();
    }
    if (listSchemes.value) {
        const refArray: any[] = [];
        for (const scheme of listSchemes.value) {
            refArray.push({
                label: 'Ссылка: ' + scheme.display_name,
                value: 'ref ' + scheme.name,
            });
        }
        if (route.name === 'collection-new-collection') {
            refArray.push({
                label: 'Ссылка на себя',
                value: 'ref _$self',
            });
        }
        TypeOptions.value = TypeOptions.value.concat(refArray);
    }
    Loading.hide();
});

const addColumn = () => {
    if (!collection.value.columns) {
        collection.value.columns = [];
    }
    const newColumn: SchemeColumn = {
        id: 0,
        CreatedAt: null,
        UpdatedAt: null,
        DeletedAt: null,
        dynamic_table_id: collection.value.id as number,
        column_name: 'new_column_' + (collection.value.columns.length + 1),
        display_name: 'New Column ' + (collection.value.columns.length + 1),
        data_type: 'TEXT',
        referenced_scheme: null,
        is_multiple: false,
        is_unique: false,
        not_null: false,
        default_value: null,
        validation_rules: null,
        field_options: {
            hidden: false,
            filterable: false,
            order: collection.value.columns.length + 5,
            pre_values: []
        },
    }
    collection.value.columns.push(newColumn);
};

const create = async () => {
    Loading.show();
    for (const column of collection.value.columns || []) {
        if (column.data_type.includes('ref')) {
            const parts = column.data_type.split(' ');
            column.data_type = parts[0] as string;
            if (parts[1] === '_$self') {
                column.referenced_scheme = collection.value.name;
            } else {
                column.referenced_scheme = parts[1] as string;
            }
        }
    }
    const viewData: Record<string, FieldOptions> = {};
    for (const col of collection.value.columns || []) {
        if (col.data_type === 'ref' && col.referenced_scheme === 'files') {
            col.field_options.hidden = true;
            col.field_options.filterable = false;
        }
        viewData[col.column_name] = col.field_options;
    }
    collection.value.view_data.field_options = viewData;
    try {
        if (route.name === 'collection-edit-collection') {
            const result = await SchemeAPI.updateScheme(collection.value);
            if (result) {
                await schemeStore.getSchemes();
                await router.push({ name: 'collections' });
            }
        } else {
            delete collection.value.id;
            delete collection.value.CreatedAt;
            delete collection.value.UpdatedAt;
            delete collection.value.DeletedAt;
            for (const column of collection.value.columns || []) {
                delete column.id;
                delete column.CreatedAt;
                delete column.UpdatedAt;
                delete column.DeletedAt;
                delete column.dynamic_table_id;
            }
            collection.value.view_data.field_options['id'] = {
                hidden: false,
                filterable: true,
                order: 1,
                pre_values: []
            };
            collection.value.view_data.field_options['created_at'] = {
                hidden: false,
                filterable: true,
                order: 2,
                pre_values: []
            };
            collection.value.view_data.field_options['updated_at'] = {
                hidden: false,
                filterable: true,
                order: 3,
                pre_values: []
            };
            collection.value.view_data.field_options['deleted_at'] = {
                hidden: true,
                filterable: false,
                order: 4,
                pre_values: []
            };
            collection.value.view_data.field_options['owner_id'] = {
                hidden: true,
                filterable: false,
                order: collection.value.columns.length + 5,
                pre_values: []
            };
            const result = await SchemeAPI.createScheme(collection.value);
            console.log('create collection result', result);
            // @ts-expect-error -- ignore
            if (result !== null && result.errror === undefined) {
                await router.push({ name: 'collections' });
                await schemeStore.getSchemes();
            }
        }
    } catch (error) {
        console.error('Error creating/updating collection:', error);
    }
    Loading.hide();
};

const removeColumn = (index: number) => {
    const col = collection.value.columns[index];
    collection.value.columns?.splice(index, 1);
    // @ts-expect-error -- ignore
    delete collection.value.view_data.field_options[col.column_name];
};

const isReadOnly = computed(() => {
    return route.name === 'collection-edit-collection' && (collection.value.name === 'users' || collection.value.name === 'roles');
});
</script>

<style scoped lang="scss">
.w-100 {
    width: 125px;
}

.z-index-99 {
    z-index: 99;
}

.no-pointer {
    cursor: no-drop;
    opacity: 0.6;
}
</style>