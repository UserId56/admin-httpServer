<template>
    <q-page class="q-pa-md column">
        <TableElement :columns="columns" :rows="row" title="Коллекции" />
    </q-page>
</template>

<script lang="ts" setup>
import TableElement from 'components/TableElements.vue';
import type { Column } from 'components/TableElements.vue';

</script>