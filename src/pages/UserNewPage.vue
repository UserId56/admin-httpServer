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
                <q-btn label="Отмена" color="secondary" @click="router.back()" />
            </q-card-actions>
        </q-card-section>
    </q-card>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { UserAPI, RoleAPI } from 'src/API';
import type { Users } from 'src/models/users';
import type { Role } from 'src/models/roles';

const router = useRouter();
const route = useRoute();

let oldUser = {} as Users;

const user = ref<Users>({
    id: 0,
    username: '',
    email: '',
    role: '',
    password: '',
    created_at: '',
    updated_at: '',
    role_id: 23,
});

const roles = ref<Array<Role>>([]);
onMounted(async () => {
    const rolesData = await RoleAPI.getRoles(1000, 0);
    if (rolesData) {
        roles.value = rolesData;
    }
    if (route.name === 'users-item-edit' || route.name === 'users-item') {
        const userId = Number(route.params.id);
        const userData = await UserAPI.getUserById(userId);
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
        await UserAPI.createUser(user.value).then(async () => {
            await router.push({ name: 'users' });
        });
    }
    if (route.name === 'users-item-edit') {
        const payload = {};
        const fields: string[] = ['username', 'email', 'role_id', 'password', 'avatar', 'bio'];
        for (const field of fields) {
            if (checkEditFields(field)) {
                // @ts-expect-error Бесит
                payload[field] = user.value[field as keyof Users];
            }
        }

        await UserAPI.updateUser(user.value.id, payload).then(async () => {
            await router.push({ name: 'users' });
        });
    }
}
</script>
