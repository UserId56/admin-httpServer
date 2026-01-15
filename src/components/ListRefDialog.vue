<template>
    <q-card>
        <q-card-section>
            <div class="text-h6">Все элементы:</div>
        </q-card-section>
        <q-card-section>
            <q-list>
                <router-link v-for="item in props.value" :key="item.id" target="_blank"
                    :to="`/${item.scheme}/${item.id}`">
                    <q-chip class="non-selectable">
                        {{ item.title }}
                    </q-chip>
                </router-link>
            </q-list>
        </q-card-section>
        <q-card-action>
            <q-btn class="q-mb-md q-mr-md float-right" flat label="Закрыть" color="primary" v-close-popup />
        </q-card-action>
    </q-card>
</template>

<script lang="ts" setup>
interface RefItem {
    id: number | string;
    scheme: string;
    title: string;
}
const props = defineProps<{
    value: RefItem[];
}>();

</script>