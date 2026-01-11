<template>
    <q-card class="q-ma-md">
        <q-card-section v-if="route.name === 'roles-item-new'">
            <div class="text-h6">Создание новой роли</div>
        </q-card-section>
        <q-card-section>
            <q-input v-model="roleName" label="Название роли" class="q-pa-sm"></q-input>
        </q-card-section>
        <q-card-section>
            <div class="text-h6 q-pa-sm" v-show="rolePermissions.length > 0">Права роли:</div>
            <q-input class="q-pa-sm" v-for="(_, index) in rolePermissions" :key="index" v-model="rolePermissions[index]"
                :readonly="route.name === 'roles-item'">
                <template v-slot:append>
                    <q-btn flat round dense icon="delete" color="negative" @click="rolePermissions.splice(index, 1)"
                        v-if="route.name === 'roles-item-new' || route.name === 'roles-item-edit'"></q-btn>
                </template>
            </q-input>
            <q-btn label="Добавить право" color="deep-orange-9" @click="rolePermissions.push('newPermission.GET')"
                v-if="route.name === 'roles-item-new' || route.name === 'roles-item-edit'"></q-btn>

        </q-card-section>
        <q-card-section>
            <q-btn label="Сохранить" color="primary"
                v-if="route.name === 'roles-item-new' || route.name === 'roles-item-edit'" class="q-mr-sm"
                @click="onSave"></q-btn>
            <q-btn label="Отмена" color="secondary" @click="router.push({ name: 'roles' })"></q-btn>
        </q-card-section>
    </q-card>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { RoleAPI } from 'src/API';
import type Role from 'src/models/roles';

const router = useRouter();
const route = useRoute();

const roleId = ref<number | null>(null);
const roleName = ref('');
const rolePermissions = ref<Array<string>>([]);

const onSave = async () => {
    const newRole = {
        name: roleName.value,
        permission: rolePermissions.value,
    } as Partial<Role>;
    if (route.name === 'roles-item-new') {
        await RoleAPI.createRole(newRole).then(async (data: any) => {
            roleId.value = data.id as number;
            await router.push({ name: 'roles-item', params: { id: data.id } });
        });
    } else if (route.name === 'roles-item-edit') {
        newRole.id = Number(route.params.id);
        await RoleAPI.updateRole(newRole).then(async () => {
            roleId.value = newRole.id as number;
            await router.push({ name: 'roles-item', params: { id: newRole.id } });
        });
    }
};

onMounted(() => {
    if (route.name === 'roles-item-edit' || route.name === 'roles-item') {
        roleId.value = Number(route.params.id);
    }
});


watch(roleId, async (newVal) => {
    console.log('roleId changed:', newVal);
    const roleData = await RoleAPI.getRoleById(newVal as number);
    if (roleData) {
        roleName.value = roleData.name;
        rolePermissions.value = roleData.permission || [];
    }
});
</script>