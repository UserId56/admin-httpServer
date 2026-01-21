<template>
    <router-link target="_blank" v-for="item in countChips" :key="item.id" :to="`/${item.scheme}/${item.id}`">
        <q-chip class="non-selectable ellipsis" :label="item.title" style="max-width: calc(100%/3.5);">
            <q-tooltip>{{ item.title }}</q-tooltip>
        </q-chip>
    </router-link>
    <q-btn v-if="showBtn" size="md" flat rounded @click.stop="handleClick">Все</q-btn>
    <q-dialog v-model="dialog">
        <ListRefDialog :value="props.value" />
    </q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import ListRefDialog from 'components/ListRefDialog.vue';
interface RefItem {
    id: number | string;
    scheme: string;
    title: string;
}

const props = defineProps<{
    value: RefItem[];
}>();
const showBtn = computed(() => {
    if (!props.value) {
        return false;
    }
    return props.value.length > 3;
});

const countChips = computed(() => {
    if (!props.value) {
        return [];
    }
    if (props.value.length > 3) {
        return props.value.slice(0, 3);
    }
    return props.value;
});
const dialog = ref(false);

const handleClick = () => {
    if (props.value.length <= 3) {
        return;
    }
    dialog.value = true;
};

</script>
<style scoped lang="scss">
.width-chip {
    max-width: 90px;
}
</style>