<template>
    <q-page class="q-pa-md column">
        <q-card>
            <q-card-section>
                <div class="text-h5">Настройки</div>
            </q-card-section>
            <q-separator></q-separator>
            <q-card-section>
                <q-input v-model="settings.project_name" type="text" label="Название проекта" clearable></q-input>
                <q-select v-model="settings.default_role_id" emit-value map-options :options="optionsRole"
                    label="Роль по умолчанию для новых пользователей" clearable option-value="value"
                    option-label="label" :error="errorShow && !settings.default_role_id" />
                <q-select v-model="settings.lang" multiple emit-value map-options :options="optionsLang" use-chips
                    label="Язык интерфейса" clearable option-value="value" option-label="label"
                    :error="errorShow && !settings.lang.length" />
                <q-input v-model.number="settings.time_zone" type="number" label="Часовой пояс"
                    hint="Указывать только число в качестве часового смещения"
                    :error="errorShow && showErrTimeZone()"></q-input>
                <q-input v-model="settings.style" type="text" label="Стиль интерфейса" clearable
                    hint="Не используйте строчные комментарии, превращаются в одну строку"></q-input>
                <q-card-actions class="q-mt-md">
                    <q-btn label="Сохранить" color="primary" @click="saveSettings" />
                    <q-btn label="Отмена" color="secondary" :to="'/'" />
                </q-card-actions>
            </q-card-section>
        </q-card>
    </q-page>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import type { Settings } from 'src/models/settings';
import { SettingsAPI, RoleAPI } from 'src/API';

const settings = ref<Settings>({} as Settings);

const errorShow = ref(false);

const optionsLang = [
    { label: 'Русский', value: 'ru' },
    { label: 'English', value: 'en' },
];
const optionsRole = ref<Array<{ label: string; value: number }>>([]);

onMounted(async () => {
    const result = await SettingsAPI.getSettings();
    if (result) {
        settings.value = result;
    }
    const rolesResult = await RoleAPI.getRoles(1000, 0);
    if (rolesResult) {
        // @ts-expect-error бесит
        optionsRole.value = rolesResult.map(role => ({ label: role.name, value: role.id }));
    }
    // Применяем стиль

});

const saveSettings = async () => {
    errorShow.value = false;
    if (!settings.value.default_role_id) {
        errorShow.value = true;
        return;
    }
    if (!settings.value.lang || settings.value.lang.length === 0) {
        errorShow.value = true;
        return;
    }
    if (showErrTimeZone()) {
        errorShow.value = true;
        return;
    }
    if (settings.value) {
        await SettingsAPI.updateSettings(settings.value);
    }
}
const showErrTimeZone = () => {
    if (settings.value.time_zone === undefined || settings.value.time_zone === null) {
        return true;
    }
    if (settings.value.time_zone < -12 || settings.value.time_zone > 14) {
        return true;
    }
    return false;
}
</script>