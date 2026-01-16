<template>
  <q-item clickable :to="link" @click="handlerClickLink">
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">

export interface LeftMenuItem {
  title: string;
  link?: string;
  icon?: string;
}

withDefaults(defineProps<LeftMenuItem>(), {
  link: '#',
  icon: '',
});

const emit = defineEmits<{
  (e: 'goLink'): void;
}>();

const handlerClickLink = () => {
  emit('goLink');
};
</script>
