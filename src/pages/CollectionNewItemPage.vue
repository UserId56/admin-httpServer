<template>
    <q-page class="q-pa-md column">
        <div class="text-h5 q-mb-md q-py-md">Создание нового элемента в {{ schemeData.displayName }}</div>
        <q-form>
            <q-card>
                <q-card-section>
                    <!-- Форма для создания нового элемента -->
                    <div v-for="(column, index) in columns" :key="index" class="q-mb-md">
                        <q-input v-if="column.data_type === 'TEXT'" v-model="newItem[column.column_name]"
                            :label="column.display_name" :clearable="route.name !== 'collection-item'"
                            :readonly="route.name === 'collection-item'" />
                        <q-input
                            v-else-if="column.data_type === 'INT' || column.data_type === 'BIGINT' || column.data_type === 'FLOAT' || column.data_type === 'MONEY'"
                            v-model.number="newItem[column.column_name]" :label="column.display_name" type="number"
                            :clearable="route.name !== 'collection-item'"
                            :readonly="route.name === 'collection-item'" />
                        <q-checkbox v-else-if="column.data_type === 'BOOLEAN'" v-model="newItem[column.column_name]"
                            :label="column.display_name" :clearable="route.name !== 'collection-item'"
                            :readonly="route.name === 'collection-item'" />
                        <q-input class="max-width-200" v-else-if="column.data_type === 'TIMESTAMP'"
                            v-model="newItem[column.column_name]" type="datetime-local"
                            :clearable="route.name !== 'collection-item'"
                            :readonly="route.name === 'collection-item'" />
                        <q-input class="max-width-200" v-else-if="column.data_type === 'DATE'"
                            v-model="newItem[column.column_name]" type="date"
                            :clearable="route.name !== 'collection-item'"
                            :readonly="route.name === 'collection-item'" />
                        <q-select v-else-if="column.data_type === 'ref'" v-model="newItem[column.column_name]"
                            :use-input="(newItem[column.column_name]) ? false : true" input-debounce="500" emit-value
                            map-options :label="column.display_name"
                            :hide-dropdown-icon="(route.name !== 'collection-item') && (options[column.referenced_scheme] && options[column.referenced_scheme]?.length || 0 > 0) ? false : true"
                            :clearable="route.name !== 'collection-item'"
                            :options="options[column.referenced_scheme] ?? []" @filter="filterFn"
                            :data-referenced_scheme="column.referenced_scheme">
                            <template v-slot:no-option>
                                <q-item>
                                    <q-item-section class="text-grey">
                                        Не найдено соответствий
                                    </q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                    </div>
                </q-card-section>
                <q-card-actions>
                    <q-btn color="primary" :label="route.name === 'collection-new-item' ? 'Создать' : 'Сохранить'"
                        @click="createNewItem(false)"
                        v-if="route.name === 'collection-new-item' || route.name === 'collection-item-edit'" />
                    <q-btn color="secondary" label="Закрыть"
                        @click="router.push({ name: 'collection', params: { name: collectionName } })"></q-btn>
                    <q-btn v-if="route.name === 'collection-item-edit' && newItem.deleted_at" label="Восстановить"
                        color="deep-orange-9" @click="createNewItem(true)"></q-btn>
                </q-card-actions>
            </q-card>
        </q-form>
    </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { SchemeAPI, ObjectAPI } from '../API';
import { Notify, Loading } from 'quasar';
const route = useRoute();
const router = useRouter();
const collectionName = route.params.name as string;
const schemeData = ref<any>({});
const columns = ref<Array<any>>([]);
const id = ref<number | null>(null);
import type { QSelect } from 'quasar';
const newItem = ref<{ [key: string]: any }>({});
const options = ref<{ [key: string]: Array<{ label: string; value: any }> }>({});

const filterFn = async (
    inputValue: string,
    doneFn: any,
    abortFn: any
) => {
    // пример: если строка слишком короткая — отменяем поиск
    if (inputValue.length < 3) {
        abortFn();
        return;
    }

    // callbackFn будет вызван (по контракту) библиотекой/компонентом
    const callbackFn = () => {
        // console.log('doneFn.callbackFn: вызвано'); 
        // Здесь можно поместить логику обновления опций, если библиотека ожидает, что вы выполните это внутри callback
        // Например: options.value[someScheme] = [...]; но в этой функции — только логирование.
    };

    // afterFn получит ссылку на QSelect (если библиотека её передаёт)
    const afterFn = async (selRef: QSelect | null | undefined) => {
        if (!selRef) {
            return;
        }
        const listOptions: Array<{ label: string; value: any }> = [];
        console.log(selRef);
        console.log(selRef.$attrs['data-referenced_scheme']);
        const result = await ObjectAPI.getObject(selRef.$attrs['data-referenced_scheme'] as string, {
            include: ['id', 'username'],
            where: [
                {
                    query: inputValue
                }
            ]
        });
        if (result) {
            for (const item of result.data) {
                listOptions.push({ label: item.username, value: item.id });
            }
        }
        options.value[selRef.$attrs['data-referenced_scheme'] as string] = listOptions;
    };

    console.log('onFilter: вызываю doneFn с callbackFn и afterFn');
    await doneFn(callbackFn, afterFn);
};

onMounted(async () => {
    console.log('Mounted CollectionNewItemPage.vue');
    schemeData.value = await SchemeAPI.getSchemeByName(collectionName);
    for (const column of schemeData.value.columns) {
        if (column.column_name === 'id' || column.column_name === 'created_at' || column.column_name === 'updated_at' || column.column_name === 'deleted_at') {
            continue;
        }
        columns.value.push(column);
    }
    if ((route.name === 'collection-item-edit' || route.name === 'collection-item') && route.params.id) {
        const existingItem = await ObjectAPI.getObjectById(collectionName, Number(route.params.id));
        const refCollection = [];
        for (const column of schemeData.value.columns) {
            if (column.data_type === 'ref') {
                refCollection.push(column.referenced_scheme);
            }
        }
        for (const ref of refCollection) {
            const listOptions: Array<{ label: string; value: any }> = [];
            const result = await ObjectAPI.getObject(ref, {
                include: ['id', 'username'],
            });
            if (result) {
                for (const item of result.data) {
                    listOptions.push({ label: item.username, value: item.id });
                }
            }
            options.value[ref] = listOptions;
        }
        newItem.value = { ...existingItem };
    }
});

const createNewItem = async (recover: boolean = false) => {
    Loading.show()
    try {
        // Здесь должен быть вызов API для создания нового элемента
        let notValid = false;
        schemeData.value.columns.forEach((column: any) => {
            if (column.column_name === 'id' || column.column_name === 'created_at' || column.column_name === 'updated_at' || column.column_name === 'deleted_at') {
                return;
            }
            if (column.not_null) {
                if (newItem.value[column.column_name] === undefined || newItem.value[column.column_name] === null || newItem.value[column.column_name] === '') {
                    Notify.create({
                        type: 'negative',
                        message: `Поле "${column.display_name}" обязательно для заполнения.`,
                        position: 'top-right',
                        timeout: 3000
                    });
                    notValid = true;
                    return;
                }
            }
        });
        if (notValid) {
            return;
        }
        let result: any;
        if (route.name === 'collection-new-item') {
            result = await ObjectAPI.createObject(collectionName, newItem.value);
        } else if ((route.name === 'collection-item-edit') && route.params.id) {
            if (!recover) {
                delete newItem.value.deleted_at
            } else {
                newItem.value.deleted_at = null
            }
            delete newItem.value.created_at
            delete newItem.value.updated_at
            // for (const key in newItem.value) {
            //     if (newItem.value[key] === null || newItem.value[key] === undefined || newItem.value[key] === '') {
            //         delete newItem.value[key];
            //     }
            // }
            result = await ObjectAPI.updateObject(collectionName, Number(route.params.id), newItem.value);
        }
        if (result.id) {
            id.value = result.id;
            await router.push({ name: 'collection-item', params: { name: collectionName, id: id.value } });
        } else {
            await router.push({ name: 'collection', params: { name: collectionName } });
            newItem.value = {};
        }
        // После успешного создания можно очистить форму или перенаправить пользователя
    } catch (error) {
        console.error('Ошибка при создании элемента:', error);
    } finally {
        Loading.hide()
    }
};

watch(id, async (newId) => {
    if (newId !== null) {
        const item = await ObjectAPI.getObjectById(collectionName, newId);
        newItem.value = { ...item };
    }
});

</script>

<style scoped lang="scss">
.max-width-200 {
    max-width: 200px;
}

:deep(input[type="number"])::-webkit-outer-spin-button,
:deep(input[type="number"])::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

:deep(input[type="number"]) {
    -moz-appearance: textfield;
}
</style>