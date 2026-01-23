<template>
    <div class="flex flex-center q-mt-xl window-height window-width">
        <div class="text-center">
            <q-img src="src/assets/500.png" size="128px" color="negative" />
            <div class="text-h4 q-mt-md">500 - Ошибка на сервере</div>
            <div class="text-subtitle2 q-mt-sm">
                Что то пошло не так на сервере. Пожалуйста, попробуйте позже.
            </div>
            <q-btn class="q-mt-lg" color="primary" no-caps label="Домой, Уолтер!" @click="$router.push('/')" />
        </div>
    </div>
</template>

<script lang="ts" setup>

</script>