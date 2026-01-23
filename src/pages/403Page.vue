<template>
    <div class="flex flex-center q-mt-xl window-height window-width">
        <div class="text-center">
            <q-img src="src/assets/403.jpg" width="128px" color="negative" />
            <div class="text-h4 q-mt-md">403 - Доступ запрещён</div>
            <div class="text-subtitle2 q-mt-sm">
                - У тебя нет прав для просмотра этой страницы.
            </div>
            <q-btn class="q-mt-lg" color="primary" no-caps label="Сбежать" @click="$router.push('/')" />
        </div>
    </div>
</template>

<script lang="ts" setup>

</script>