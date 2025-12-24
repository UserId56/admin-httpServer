<template>
    <q-card class="absolute-center login-w ">
        <q-card-section>
            <div class="text-h6">Авторизация</div>
            <q-separator color="black" class="q-mt-md" />
            <q-form class="q-gutter-md q-mt-md">
                <q-input filled label="Имя пользователя/email" v-model.trim="login" name="login" />
                <q-input filled label="Пароль" type="password" v-model.trim="password" name="password" />
                <q-btn label="Войти" color="primary" @click="onLogin" :loading="loading" :disable="!validation" />
            </q-form>
        </q-card-section>
    </q-card>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import type { LoginParams } from 'src/API/models/Auth';
import { useUserStore } from 'src/stores/user-store';
import { useRouter } from 'vue-router';

const router = useRouter();
const userStore = useUserStore();
const login = ref('');
const password = ref('');
const loading = ref(false);
const validation = computed(() => {
    return login.value.length >= 4 && password.value.length >= 8;
});

onMounted(() => {
    document.body.style.backgroundColor = '#4666af';
});

const onLogin = async () => {
    loading.value = true;
    const data: LoginParams = {
        username: '',
        email: '',
        password: password.value,
    }
    if (login.value.includes('@')) {
        data.email = login.value;
    } else {
        data.username = login.value;
    };
    await userStore.login(data);
    if (userStore.isAuth) {
        document.body.style.backgroundColor = '';
        await router.push('/');
    }
    loading.value = false;
};

</script>

<style lang="scss">
.login-w {
    width: 400px;
}

.glass {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10.6px);
    -webkit-backdrop-filter: blur(10.6px);
    border: 1px solid rgba(255, 255, 255, 0.37);
}
</style>