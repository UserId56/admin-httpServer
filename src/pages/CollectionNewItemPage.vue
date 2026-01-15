<template>
    <q-page class="q-pa-md column">
        <div class="text-h5 q-mb-md q-py-md">Создание нового элемента в {{ schemeData.displayName }}</div>
        <q-form>
            <q-card>
                <q-card-section>
                    <!-- Форма для создания нового элемента -->
                    <div v-for="(column, index) in columns" :key="index" class="q-mb-md">
                        <q-input v-if="column.data_type === 'STRING'" v-model="newItem[column.column_name]"
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
                            :use-input="(!newItem[column.column_name] || column.is_multiple) ? true : false"
                            input-debounce="500" emit-value map-options :multiple="column.is_multiple" use-chips
                            @new-value="createValue" new-value-mode="toggle" :label="column.display_name"
                            :hide-dropdown-icon="(route.name !== 'collection-item') && (options[column.referenced_scheme] && options[column.referenced_scheme]?.length || 0 > 0) ? false : true"
                            :clearable="route.name !== 'collection-item'" @add="addSelect(column.referenced_scheme)"
                            :options="options[column.referenced_scheme] ?? []" @filter="filterFn"
                            :data-referenced_scheme="column.referenced_scheme">
                            <template v-slot:selected-item="opt">
                                <q-chip :label="opt.opt.label" :key="opt.opt.value"
                                    :removable="route.name !== 'collection-item'" color="primary" text-color="white"
                                    remove-aria-label="Удалить"
                                    @remove="newItem[column.column_name] = Array.isArray(newItem[column.column_name]) ? newItem[column.column_name].filter((val: any) => val !== opt.opt.value) : null">
                                </q-chip>
                            </template>
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
import { SchemeAPI, ObjectAPI, UserAPI } from '../API';
import { Notify, Loading } from 'quasar';
import { useSchemeStore } from 'src/stores/scheme-store';
import { GetIncludeFields } from 'src/helpers/ShortViewPars';
const schemeStore = useSchemeStore();
const route = useRoute();
const router = useRouter();
const collectionName = route.params.name as string;
const schemeData = ref<any>({});
const columns = ref<Array<any>>([]);
const id = ref<number | null>(null);
import type { QSelect } from 'quasar';
const newItem = ref<{ [key: string]: any }>({});
const options = ref<{ [key: string]: Array<{ label: string; value: any }> }>({});

const addSelect = (scheme: string) => {
    refInput.value[scheme]?.updateInputValue('');
};

const createValue = (val: string, done: any) => {
    done();
};

const refInput = ref<{ [key: string]: QSelect | null }>({});

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
        const result = await getData(selRef.$attrs['data-referenced_scheme'] as string);
        if (result) {
            for (const item of result.data) {
                listOptions.push({ label: item.username, value: item.id });
            }
        }
        options.value[selRef.$attrs['data-referenced_scheme'] as string] = listOptions;
        refInput.value[selRef.$attrs['data-referenced_scheme'] as string] = selRef;
    };
    await doneFn(callbackFn, afterFn);
};

const getData = async (refColection: string, refData?: boolean): Promise<any> => {
    if (schemeStore.getList.length === 0) {
        await schemeStore.getSchemes();
    }
    let data = null;
    const include = ['id']
        .concat(GetIncludeFields(schemeStore.getSchemeByName(refColection)?.view_data.short_view as any));
    const reqData = {
        include: include,
    }
    if (refData) {
        // @ts-expect-error Бесит
        reqData.where = [
            {
                field: 'id',
                operator: 'in',
                value: refDataColumns[refColection as keyof typeof refDataColumns]
            }
        ]
    }
    if (refColection === 'users') {
        data = await UserAPI.getUsers(reqData);
    } else {
        data = await ObjectAPI.getObject(refColection, reqData);
    }
    return data;
}

const refDataColumns = {};

onMounted(async () => {
    console.log('Mounted CollectionNewItemPage.vue');
    schemeData.value = await SchemeAPI.getSchemeByName(collectionName);
    for (const column of schemeData.value.columns) {
        if (column.column_name === 'id' || column.column_name === 'created_at' || column.column_name === 'updated_at' || column.column_name === 'deleted_at' || column.column_name === 'owner_id') {
            continue;
        }
        columns.value.push(column);
    }
    if ((route.name === 'collection-item-edit' || route.name === 'collection-item') && route.params.id) {
        const existingItem = await ObjectAPI.getObjectById(collectionName, Number(route.params.id));
        for (const column of schemeData.value.columns) {
            if (column.data_type === 'ref') {
                if (existingItem[column.column_name] === null || existingItem[column.column_name] === undefined || existingItem[column.column_name].length === 0) {
                    continue;
                }
                // @ts-expect-error Бесит
                if (refDataColumns[column.referenced_scheme as keyof typeof refDataColumns] && refDataColumns[column.referenced_scheme as keyof typeof refDataColumns].length > 0) {
                    if (column.is_multiple) {
                        // @ts-expect-error Бесит
                        refDataColumns[column.referenced_scheme as keyof typeof refDataColumns].push(...existingItem[column.column_name]);
                    } else {
                        // @ts-expect-error Бесит
                        refDataColumns[column.referenced_scheme as keyof typeof refDataColumns].push(existingItem[column.column_name]);
                    }
                } else {
                    if (column.is_multiple) {
                        // @ts-expect-error Бесит
                        refDataColumns[column.referenced_scheme as keyof typeof refDataColumns] = [...existingItem[column.column_name]];
                    } else {
                        // @ts-expect-error Бесит
                        refDataColumns[column.referenced_scheme as keyof typeof refDataColumns] = [existingItem[column.column_name]];
                    }
                }
            }
        }
        const listOptions: Array<{ label: string; value: any }> = [];
        for (const key of Object.keys(refDataColumns)) {
            const result = await getData(key, true);
            if (result) {
                for (const item of result.data) {
                    listOptions.push({ label: item.username, value: item.id });
                }
            }
            options.value[key] = listOptions;
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