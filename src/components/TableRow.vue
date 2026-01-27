<template>
    <q-tr :props="propsTable" :class="styleClass" @click="goChildren(propsTable.row)">
        <q-td>
            <q-checkbox :model-value="checkSelected(propsTable.row)"
                @update:model-value="emit('addSelected', propsTable.row)" @click.stop />
        </q-td>
        <q-td class="cursor-pointer" v-for="(col, index) in propsTable.cols" :key="col.name" :props="propsTable"
            style="max-width: 500px;">
            <!-- Выше надо убрать этот стайл и наверное делать настройки в коллекции -->
            <template v-if="!col.name.includes('ref') && !col.name.includes('BOOLEAN')">
                <div class="row items-center">
                    <span class="ellipsis overflow-hidden">{{ col.format ? col.format(propsTable.row[col.field as
                        keyof typeof
                        propsTable.row],
                        propsTable.row) :
                        propsTable.row[col.field as keyof typeof propsTable.row] }}
                        <q-tooltip>{{ col.format ? col.format(propsTable.row[col.field as
                            keyof typeof
                            propsTable.row],
                            propsTable.row) :
                            propsTable.row[col.field as keyof typeof propsTable.row] }}</q-tooltip></span>
                    <q-btn v-if="props.IsHierarchy && index === 0 && props.TypeView === 'hierarchy'"
                        :icon="propsTable.row.open ? 'arrow_drop_down' : 'arrow_right'" flat class="q-ml-sm"
                        @click.stop="emit('getChildren', propsTable.row)" />
                </div>
            </template>
            <RefChipComponent v-else-if="col.name.includes('ref')"
                :value="col.format(propsTable.row[col.field as keyof typeof propsTable.row], propsTable.row)" />
            <template v-else-if="col.name.includes('BOOLEAN')">
                <!-- eslint-disable vue/no-mutating-props -->
                <div class="row items-center justify-center">
                    <q-checkbox v-model="propsTable.row[col.field as keyof typeof propsTable.row]" disable />
                </div>
            </template>
        </q-td>
    </q-tr>
    <q-tr class="rounded-borders" v-if="propsTable.row.children && propsTable.row.children.length === 0">
        <q-td colspan="100%">Нет данных</q-td>
    </q-tr>
    <TableRow :styleClass="propsTable.row.style" v-for="(row, index) in propsTable.row.children" :key="row.id"
        :propsTable="{ ...propsTable, row, rowIndex: index }" :IsHierarchy="props.IsHierarchy"
        :TypeView="props.TypeView" :localSelected="props.localSelected" @go="goChildren"
        @addSelected="addSelectedChildren" @getChildren="getChildrenChildren" />
</template>

<script lang="ts" setup>
import RefChipComponent from './RefChipComponent.vue';

const props = defineProps<{
    propsTable: any;
    IsHierarchy: boolean;
    TypeView: 'all' | 'hierarchy';
    localSelected: any[];
    styleClass?: string;
}>();



const emit = defineEmits<{
    (e: 'go', rowData: any): void;
    (e: 'addSelected', rowData: any): void;
    (e: 'getChildren', rowData: any): void;
}>();

const checkSelected = (row: any) => {
    for (const item of props.localSelected) {
        if (item.id === row.id) {
            return true;
        }
    }
    return false;
};

const goChildren = (rowData: any) => {
    emit('go', rowData);
};

const addSelectedChildren = (row: any) => {
    emit('addSelected', row);
};

const getChildrenChildren = (rowData: any) => {
    emit('getChildren', rowData);
};

</script>