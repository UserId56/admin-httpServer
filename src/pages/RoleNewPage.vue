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
            <div v-for="(item, index) in rolePermissions" :key="index" class="row items-center permission">
                <q-input class="q-pa-sm col-8" v-model="item.name" :readonly="route.name === 'roles-item'">
                </q-input>
                <q-checkbox v-model="item.permission" :disable="route.name === 'roles-item'">
                    <q-tooltip>
                        Разрешить или запретить
                    </q-tooltip>
                </q-checkbox>
                <q-icon size="sm" name="delete" color="negative" @click="rolePermissions.splice(index, 1)"
                    v-if="route.name === 'roles-item-new' || route.name === 'roles-item-edit'"
                    class="cursor-pointer"></q-icon>

            </div>
            <q-btn label="Добавить право" color="deep-orange-9"
                @click="rolePermissions.push({ name: 'newPermission.GET', permission: false })"
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

interface RolePermission {
    name: string;
    permission: boolean;
}

const roleId = ref<number | null>(null);
const roleName = ref('');
const rolePermissions = ref<Array<RolePermission>>([]);

const onSave = async () => {
    const newRole = {
        name: roleName.value,
        permission: {},
    } as Partial<Role>;
    rolePermissions.value.forEach((perm) => {
        newRole.permission![perm.name] = perm.permission;
    });
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
        for (const [permName, permValue] of Object.entries(roleData.permission || {})) {
            rolePermissions.value.push({ name: permName, permission: permValue });
        }
    }
});
</script>
<style scoped lang="scss">
.permission {
    width: 400px;
}
</style>