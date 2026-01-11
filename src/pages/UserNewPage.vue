<template>
    <q-card class="q-pa-md q-ma-md">
        <q-card-section>
            <q-input v-model="user.username" label="Имя пользователя" clearable maxlength="64" counter
                :readonly="route.name === 'users-item'" />
            <q-input v-model="user.email" label="Email" clearable maxlength="255" counter
                :readonly="route.name === 'users-item'" />
            <q-input v-model="user.password" label="Пароль" type="password" clearable maxlength="255" counter
                :readonly="route.name === 'users-item'" />
            <q-select v-model="user.role_id" emit-value map-options :options="roles" label="Роль" clearable
                option-value="id" option-label="name" :readonly="route.name === 'users-item'" />
            <q-input v-model="user.avatar" label="Аватар" type="file" accept="image/*" clearable maxlength="255" counter
                :readonly="route.name === 'users-item'" />
            <q-input v-model="user.bio" label="Биография" type="text" clearable maxlength="255" counter
                :readonly="route.name === 'users-item'" />
            <q-card-actions>

                <q-btn label="Сохранить" color="primary" @click="onSave"
                    v-if="route.name === 'users-item-new' || route.name === 'users-item-edit'" />
                <q-btn label="Отмена" color="secondary" @click="router.push({ name: 'users' })" />
            </q-card-actions>
        </q-card-section>
    </q-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { UserAPI, RoleAPI } from 'src/API';
import type { Users } from 'src/models/users';
import type { Role } from 'src/models/roles';

const router = useRouter();
const route = useRoute();

const userId = ref<number | null>(null);

let oldUser = {} as Users;

const user = ref<Partial<Users>>({
    id: 0,
    username: '',
    email: '',
    password: '',
    role_id: 23,
});

const roles = ref<Array<Role>>([]);
onMounted(async () => {
    const rolesData = await RoleAPI.getRoles(1000, 0);
    if (rolesData) {
        roles.value = rolesData;
    }
    if (route.name === 'users-item-edit' || route.name === 'users-item') {
        userId.value = Number(route.params.id);
        const userData = await UserAPI.getUserById(userId.value);
        if (userData) {
            user.value = userData;
            oldUser = { ...userData };
        }
    }
});

const checkEditFields = (field: string): boolean => {
    console.log(oldUser[field as keyof Users], user.value[field as keyof Users]);
    if (oldUser[field as keyof Users] !== user.value[field as keyof Users]) {
        return true;
    }
    return false;
}

const onSave = async () => {
    if (route.name === 'users-item-new') {
        await UserAPI.createUser(user.value as Users).then(async (data: any) => {
            userId.value = data.id;
            await router.push({ name: 'users-item', params: { id: userId.value } });
        });
    }
    if (route.name === 'users-item-edit') {
        const payload = {} as Partial<Users>;
        const fields: string[] = ['username', 'email', 'role_id', 'password', 'avatar', 'bio'];
        for (const field of fields) {
            if (checkEditFields(field)) {
                // @ts-expect-error Бесит
                payload[field] = user.value[field as keyof Users];
            }
        }

        await UserAPI.updateUser(user.value.id as number, payload).then(async () => {
            await router.push({ name: 'users-item', params: { id: userId.value } });
        });
    }
}

watch(userId, async (newVal) => {
    const userData = await UserAPI.getUserById(newVal as number);
    if (userData) {
        user.value = userData;
    }
});


</script>
