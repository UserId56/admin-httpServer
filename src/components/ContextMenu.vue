<template>
    <q-menu contextMenu ref="MenuRef" @show="checkTarget">
        <q-list>
            <q-item @click="actionRun(item)" v-close-popup="!item.children" v-for="item in props.items"
                :key="item.label" clickable>
                <q-item-section>{{ item.label }}</q-item-section>
                <q-item-section side v-if="item.children"><q-icon name="mdi-chevron-right" /></q-item-section>
                <q-menu v-if="item.children" anchor="top end" self="top start">
                    <q-list dense style="min-width: 100px">
                        <q-item clickable v-close-popup v-for="child in item.children" :key="child.label"
                            @click="actionRun(child)">
                            <q-item-section>{{ child.label }}</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-item>
        </q-list>
    </q-menu>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';

const MenuRef = ref(null);

const targetElement = ref<HTMLElement | null>(null);

const checkTarget = (event: Event) => {
    targetElement.value = (event as CustomEvent).target as HTMLElement;
}

const emit = defineEmits<{
    // Может тут потом добавить что в action может передаваться значения и как то юзать эмитить.
    // (e: 'action', action: () => void): void;
    (e: 'refMenu', menu: typeof MenuRef.value): void;
}>();

export interface ContextMenuProps {
    label: string;
    action?: (el: HTMLElement | null) => void;
    children?: ContextMenuProps[];
}

const props = defineProps<{
    items: ContextMenuProps[];
    event?: MouseEvent | null;
}>();

const actionRun = (item: ContextMenuProps): void => {
    if (item.action) {
        item.action(targetElement.value);
    }
    if (item.children) {
        // @ts-expect-error ignore
        MenuRef.value?.show();
    }
};

onMounted(() => {
    emit('refMenu', MenuRef.value);
});

watch(MenuRef, (newVal) => {
    emit('refMenu', newVal);
});

</script>