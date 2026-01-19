<template>
    <div class="row items-center justify-end no-wrap">
        <q-input v-model="filterData.search" label="Поиск" class="q-mr-md" dense></q-input>
        <template v-for="col in colData" :key="col.column_name">
            <q-checkbox v-model="filterData[col.column_name]" v-if="col.data_type === 'BOOLEAN'"
                :label="col.display_name" class="q-mr-md" dense></q-checkbox>
            <q-input v-model.trim="filterData[col.column_name]" type="text"
                v-else-if="col.data_type === 'STRING' && col.data_type !== 'ref' || col.data_type === 'TEXT'"
                :label="col.display_name" class="q-mr-md" dense>
                <q-btn-dropdown dense color="primary" no-caps auto-close
                    :label="(filterData.fieldOperatorOptions[col.column_name]) ? filterData.fieldOperatorOptions[col.column_name].label : '='">
                    <q-list>
                        <!-- @vue-expect-error -->
                        <q-item clickable v-close-popup @click="selectOperator(value, col.column_name)"
                            v-for="value in getOperators(col.data_type)" :key="value.label">
                            <q-item-section>
                                <q-item-label>{{ value.label }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-btn-dropdown>
            </q-input>
            <q-input v-model.number="filterData[col.column_name]" type="number"
                v-else-if="col.data_type === 'INT' || col.data_type === 'FLOAT' || col.data_type === 'BIGINT' || col.data_type === 'MONEY'"
                :label="col.display_name" class="q-mr-md" dense>
                <template #append>
                    <q-btn-dropdown dense color="primary" no-caps auto-close
                        :label="(filterData.fieldOperatorOptions[col.column_name]) ? filterData.fieldOperatorOptions[col.column_name].label : '='">
                        <q-list>
                            <!-- @vue-expect-error -->
                            <q-item clickable v-close-popup @click="selectOperator(value, col.column_name)"
                                v-for="value in Operators" :key="value.label">
                                <q-item-section>
                                    <q-item-label>{{ value.label }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>

                </template></q-input>
            <q-select v-model="filterData[col.column_name]" v-else-if="col.data_type === 'ref'"
                :label="col.display_name" emit-value map-options :options="options[col.referenced_scheme] ?? []"
                new-value-mode="toggle" @new-value="createValue" :multiple="isMultiple(col.column_name)" use-input
                input-debounce="500" use-chips clearable @filter="filterFn"
                :data-referenced_scheme="col.referenced_scheme" @add="addSelect(col.referenced_scheme)"
                :hide-dropdown-icon="(options[col.referenced_scheme]) ? false : true" class="q-mr-md" dense>
                <template v-slot:selected-item="opt">
                    <q-chip :label="opt.opt.label" :key="opt.opt.value" removable color="primary" text-color="white"
                        remove-aria-label="Удалить"
                        @remove="filterData[col.column_name] = Array.isArray(filterData[col.column_name]) ? filterData[col.column_name].filter((val: any) => val !== opt.opt.value) : null">
                    </q-chip>
                </template>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            Не найдено соответствий
                        </q-item-section>
                    </q-item>
                </template>
                <template #append>
                    <q-checkbox :val="false" v-model="refIsMultiple[col.column_name]" dense
                        @click="updateValueRef(col.column_name)">
                        <q-tooltip>
                            Входит в множество
                        </q-tooltip></q-checkbox>
                    <q-btn-dropdown dense color="primary" no-caps auto-close
                        :label="(filterData.fieldOperatorOptions[col.column_name]) ? filterData.fieldOperatorOptions[col.column_name].label : '--'">
                        <q-list>
                            <!-- @vue-expect-error -->
                            <q-item clickable v-close-popup @click="selectOperator(value, col.column_name)"
                                v-for="value in getOperators(col.data_type)" :key="value.label">
                                <q-item-section>
                                    <q-item-label>{{ value.label }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </q-btn-dropdown>
                </template>
            </q-select>

        </template>

    </div>
</template>

<script lang="ts" setup>
import type { Scheme } from 'src/models/scheme';
import { ref } from 'vue';
import { getDataRefField } from 'src/API/http';
import { GetNameAsShortView } from 'src/helpers/ShortViewPars';
import { useSchemeStore } from 'src/stores/scheme-store';
import { QSelect } from 'quasar';
import { watch } from 'vue';
const schemeStore = useSchemeStore();

const props = defineProps<{
    schemeData: Scheme
}>();

const selectOperator = (operator: { label: string; value: string }, colName: string) => {
    filterData.value.fieldOperatorOptions[colName] = operator;
    if (operator.value === 'notNull' || operator.value === 'null') {
        filterData.value[colName] = null;
        return;
    }
    if (filterData.value[colName] === null || filterData.value[colName] === '') {
        delete filterData.value[colName];
    }
};

const Operators = [
    {
        label: '=',
        value: 'eq'
    },
    {
        label: '<>',
        value: 'ne'
    },
    {
        label: '>',
        value: 'gt'
    },
    {
        label: '<',
        value: 'lt'
    },
    {
        label: '>=',
        value: 'gte'
    },
    {
        label: '<=',
        value: 'lte'
    },
    {
        label: 'не пуст',
        value: 'notNull'
    },
    {
        label: 'пуст',
        value: null
    }

]

const getOperators = (type: string): Array<{ label: string; value: string | null }> => {
    let result: Array<{ label: string; value: string | null }> = []
    if (type === 'STRING' || type === 'TEXT') {
        result = Operators.filter(item => item.label === '=' || item.label === '<>' || item.label === 'не пуст' || item.label === 'пуст');
        result.push(
            {
                label: 'содержит',
                value: 'iLike'
            },
            {
                label: '--',
                value: null
            }
        );
    };
    if (type === 'INT' || type === 'FLOAT' || type === 'BIGINT' || type === 'MONEY') {
        result = Operators;
    };
    if (type === 'ref') {
        result = Operators.filter(item => item.label === 'не пуст' || item.label === 'пуст');
        result.push({
            label: '--',
            value: null
        })
    };
    return result;
}

const filterData = ref<Record<string, any>>({
    fieldOperatorOptions: {},
    search: ''
});

watch(() => filterData.value, (newVal) => {
    emit('update', newVal);
}, { deep: true });

interface Option {
    label: string;
    value: string
}

const emit = defineEmits<{
    (e: 'update', v: Record<string, any>): void;
}>();

const options = ref<Record<string, Option[]>>({});

const refIsMultiple = ref<Record<string, boolean>>({});

const isMultiple = (colName: string): boolean => {
    return refIsMultiple.value[colName] ?? false;
};

const colData = ref<any[]>([]);

// const GetDataType = (dataType: string): any => {
//     switch (dataType) {
//         case 'BOOLEAN':
//             return false;
//         case "ref":
//             return null;
//         default:
//             return '';
//     }
// };

const createValue = (val: string, done: any) => {
    done();
};

const updateValueRef = (colName: string) => {
    if (refIsMultiple.value[colName]) {
        if (!Array.isArray(filterData.value[colName])) {
            filterData.value[colName] = (filterData.value[colName] !== null && filterData.value[colName] !== undefined)
                ? [filterData.value[colName]]
                : [];
        }
    } else {
        if (Array.isArray(filterData.value[colName])) {
            filterData.value[colName] = filterData.value[colName][0] || null;
        }
    }
}

const addSelect = (scheme: string) => {
    refInput.value[scheme]?.updateInputValue('');
};

const refInput = ref<Record<string, QSelect | null | undefined>>({});

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
        const result = await getDataRefField(selRef.$attrs['data-referenced_scheme'] as string, false, inputValue, filterData.value);
        if (result) {
            for (const item of result.data) {
                listOptions.push({ label: GetNameAsShortView(schemeStore.getSchemeByName(selRef.$attrs['data-referenced_scheme'] as string)?.view_data.short_view as string, item), value: item.id });
            }
        }
        options.value[selRef.$attrs['data-referenced_scheme'] as string] = listOptions;
        refInput.value[selRef.$attrs['data-referenced_scheme'] as string] = selRef;
    };
    await doneFn(callbackFn, afterFn);
};


// onMounted(() => {
//     for (const col of props.schemeData.view_data.field_options) {
//         if (col.filterable) {
//             for (const schemeCol of props.schemeData.columns) {
//                 if (schemeCol.column_name === col.name) {
//                     colData.value.push(schemeCol);
//                     if (schemeCol.data_type === 'ref') {
//                         refIsMultiple.value[schemeCol.column_name] = false;
//                     }
//                     // filterData.value[schemeCol.column_name] = GetDataType(schemeCol.data_type);
//                 }
//             }
//         }
//     }
// });
watch(() => props.schemeData, (shemaData) => {
    if (!shemaData) return;
    colData.value = [];
    for (const col of Object.keys(shemaData.view_data?.field_options) ?? []) {
        if (!col) continue;
        // @ts-expect-error ignore
        if (shemaData.view_data?.field_options[col].filterable) {
            const schemeCol = shemaData.columns?.find((c: any) => c.column_name === col);
            if (schemeCol) {
                colData.value.push(schemeCol);
                if (schemeCol.data_type === 'ref') {
                    refIsMultiple.value[schemeCol.column_name] = false;
                }
            }
        }
    }
}, { immediate: true });

</script>