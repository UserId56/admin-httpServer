<template>
    <q-card class="q-pa-md q-ma-md">
        <q-card-section>
            <span class="text-h4">Создание коллекции</span>
        </q-card-section>
        <q-card-section>
            <q-form @submit="create">
                <q-input v-model="collection.name" label="Название коллекции" clearable maxlength="64" counter />
                <q-input v-model="collection.display_name" label="Отображаемое имя" clearable maxlength="255" counter />
                <div v-for="(field, index) in collection.columns" :key="index" class="q-mt-md" :class="{
                    'no-pointer-events no-pointer': (field.column_name === 'id' || field.column_name === 'created_at' || field.column_name === 'updated_at' || field.column_name === 'deleted_at')
                }">
                    <q-card class="q-pa-sm q-mb-sm fix-width">
                        <q-btn icon="close" flat @click="removeColumn(index)"
                            class="absolute-top-right z-index-99"></q-btn>
                        <q-card-section class="row justify-between">
                            <q-input v-model="field.column_name" label="Имя поля" clearable maxlength="64" counter
                                class="col-2" />
                            <q-input v-model="field.display_name" label="Отображаемое имя" clearable maxlength="255"
                                counter class="col-2" />
                            <q-select v-model="field.data_type"
                                :options="['TEXT', 'INT', 'BIGINT', 'FLOAT', 'MONEY', 'BOOLEAN', 'DATE', 'TIMESTAMP', 'JSON']"
                                label="Тип данных" class="col-2" />
                            <q-checkbox v-model="field.not_null" label="Обязательное поле" />
                            <q-input v-model="field.default_value" label="Значение по умолчанию" clearable
                                class="col-2" />
                        </q-card-section>
                    </q-card>
                </div>
                <q-btn label="Добавить поле" color="deep-orange-9" @click="addColumn" class="q-mt-md"></q-btn>
                <div class="q-mt-md">
                    <q-btn :label="(route.name === 'collection-edit-collection' ? 'Сохранить' : 'Создать')"
                        type="submit" color="primary" />
                    <q-btn label="Отмена" @click="router.back()" color="primary" flat class="q-ml-sm" />
                </div>
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { SchemeAPI } from '../API';
import { Loading } from 'quasar';
import type { Scheme, Column } from 'src/models/scheme';
import { useSchemeStore } from 'src/stores/scheme-store';
const router = useRouter();
const route = useRoute();
const schemeStore = useSchemeStore();

const collection = ref<Partial<Scheme>>({
    ID: 0,
    CreatedAt: '',
    UpdatedAt: '',
    name: '',
    display_name: '',
    columns: null,
} as Scheme);
onMounted(async () => {
    Loading.show();
    if (route.name === 'collection-edit-collection' && route.params.name) {
        const existingScheme = await SchemeAPI.getSchemeByName(route.params.name as string);
        collection.value = { ...existingScheme };
    }
    Loading.hide();
});

const addColumn = () => {
    if (!collection.value.columns) {
        collection.value.columns = [];
    }
    collection.value.columns.push({
        ID: 0,
        CreatedAt: null,
        UpdatedAt: null,
        DeletedAt: null,
        dynamic_table_id: collection.value.ID,
        column_name: 'new_column_' + (collection.value.columns.length + 1),
        display_name: 'New Column ' + (collection.value.columns.length + 1),
        data_type: 'TEXT',
        not_null: false,
        default_value: null,
        validation_rules: null,
    } as Column);
};

const create = async () => {
    Loading.show();
    try {
        if (route.name === 'collection-edit-collection') {
            await SchemeAPI.updateScheme(collection.value);
            await router.push({ name: 'collections' });
        } else {
            delete collection.value.ID;
            delete collection.value.CreatedAt;
            delete collection.value.UpdatedAt;
            delete collection.value.DeletedAt;
            for (const column of collection.value.columns || []) {
                delete column.ID;
                delete column.CreatedAt;
                delete column.UpdatedAt;
                delete column.DeletedAt;
                delete column.dynamic_table_id;
            }
            const result = await SchemeAPI.createScheme(collection.value);
            if (result !== null) {
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
    collection.value.columns?.splice(index, 1);
};
</script>

<style scoped lang="scss">
.z-index-99 {
    z-index: 99;
}

.no-pointer {
    cursor: no-drop;
    opacity: 0.6;
}
</style>