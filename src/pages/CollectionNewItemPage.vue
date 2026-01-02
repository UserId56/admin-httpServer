<template>
    <q-page class="q-pa-md column">
        <div class="text-h5 q-mb-md">Создание нового элемента в {{ schemeData.displayName }}</div>
        <q-form>
            <q-card>
                <q-card-section>
                    <!-- Форма для создания нового элемента -->
                    <div v-for="(column, index) in columns" :key="index" class="q-mb-md">
                        <q-input v-if="column.type === 'string'" v-model="newItem[column.name]"
                            :label="column.displayName" />
                        <q-input v-else-if="column.type === 'number'" v-model.number="newItem[column.name]"
                            :label="column.displayName" type="number" />
                        <q-checkbox v-else-if="column.type === 'boolean'" v-model="newItem[column.name]"
                            :label="column.displayName" />
                        <!-- Добавьте другие типы полей по необходимости -->
                    </div>
                </q-card-section>
                <q-card-actions>
                    <q-btn color="primary" label="Создать" @click="createNewItem" />
                </q-card-actions>
            </q-card>
        </q-form>
    </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { SchemeAPI } from '../API';
const route = useRoute();
const collectionName = route.params.name as string;
const schemeData = ref<any>({});
const columns = ref<Array<any>>([]);
onMounted(async () => {
    schemeData.value = await SchemeAPI.getSchemeByName(collectionName);
    for (const column of schemeData.value.columns) {
        if (column.column_name === 'id' || column.column_name === 'created_at' || column.column_name === 'updated_at' || column.column_name === 'deleted_at') {
            continue;
        }
        columns.value.push(column);
    }
});

const newItem = ref<{ [key: string]: any }>({});
const createNewItem = () => {
    try {
        // Здесь должен быть вызов API для создания нового элемента
        console.log('Создание нового элемента:', newItem.value);
        // После успешного создания можно очистить форму или перенаправить пользователя
        newItem.value = {};
    } catch (error) {
        console.error('Ошибка при создании элемента:', error);
    }
};


</script>