<template>
    <div class="flex flex-center q-mt-xl window-height window-width">
        <div class="text-center">
            <q-img src="src/assets/404.png" width="128px" color="negative" />
            <div class="text-h4 q-mt-md">404 - Страница не найдена</div>
            <div class="text-subtitle2 q-mt-sm">
                - Ты ищешь что-то, чего здесь нет.
            </div>
            <q-btn class="q-mt-lg" color="primary" no-caps label="Назад" @click="$router.push('/')" />
        </div>
    </div>
</template>

<script lang="ts" setup>

</script>