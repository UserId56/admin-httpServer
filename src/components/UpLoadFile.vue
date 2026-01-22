<template>
    <q-uploader url="/api/v1/file/upload" :label="props.label" :multiple="props.multiple" field-name="file"
        :auto-upload="props.autoUpload" :accept="props.accept" ref="loader" @uploading="onFileUploading"
        @start="onStart">
        <template #list="{ files, removeFile }">
            <template v-if="files.length === 0 && typeFile === 'image'">
                <template v-for="value in ValueData" :key="value">
                    <div v-if="value" class="q-pa-sm relative-position	">
                        <router-link :to="'/api/v1/file/get/' + value" target="_blank"
                            class="block ellipsis full-width">
                            <q-img v-if="value && files.length === 0 && typeFile === 'image'"
                                :src="'/api/v1/file/get/' + value" :alt="props.label" width="100%" />
                        </router-link>
                        <q-btn flat icon="close" color="negative" @click="removeFileCurrent"
                            class="absolute-top-right" />
                    </div>
                </template>
            </template>

            <template v-if="files.length === 0 && typeFile === 'file'">
                <template v-for="value in ValueData" :key="value">
                    <div v-if="value" class="q-pa-sm">
                        <q-item>
                            <q-item-section>
                                <router-link :to="'/api/v1/file/get/' + value" target="_blank"
                                    class="block ellipsis full-width">
                                    <q-item-label class="ellipsis">{{ value }}</q-item-label>
                                </router-link>
                            </q-item-section>
                            <q-item-section side>
                                <q-btn flat icon="close" color="negative" @click="removeFileCurrent" />
                            </q-item-section>
                        </q-item>
                    </div>
                </template>
            </template>
            <div v-for="file in files" :key="file.id" class="q-pa-sm">
                <q-item>
                    <q-item-section>
                        <q-item-label class="ellipsis">{{ file.name }}</q-item-label>
                        <q-item-label caption>{{ (file.size / (1024 * 1024)).toFixed(2) }} MB</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                        <q-btn flat icon="close" color="negative" @click="removeFile(file)" />
                    </q-item-section>
                </q-item>
            </div>
        </template>
    </q-uploader>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { QUploader } from 'quasar';


// const onFileUploaded = async (info: any) => {
//     console.log('onFileUploaded', info);
//     const request = info.xhr.response;
//     const data = await JSON.parse(request);
//     if (data) {
//         emit('update:value', data.id);
//     }
//     if (loader.value) {
//         console.log('loader', loader.value.files);
//         loader.value.removeFile(info.files[0]);
//     }
// }

const onFileUploading = (info: any) => {
    info.xhr.onloadend = () => {
        if (loader.value) {
            dataValue.push(info.files[0]);
            if (props.multiple && dataValue.length === loader.value.files.length) {
                const result = []
                for (const file of dataValue) {
                    const request = file.xhr.response;
                    const data = JSON.parse(request);
                    if (data) {
                        result.push(data.id);
                    }
                    loader.value.removeFile(file);
                }
                emit('update:value', result);
            } else {
                const request = dataValue[0].xhr.response;
                const data = JSON.parse(request);
                emit('update:value', data.id);
                loader.value.removeFile(info.files[0]);
            }
        }
    }
}


let dataValue: any = null;

const onStart = () => {
    dataValue = []
}

const loader = ref<QUploader | null>(null);

const ValueData = computed(() => {
    if (Array.isArray(props.value)) {
        return props.value;
    } else if (props.value) {
        return [props.value];
    } else {
        return [];

    }
});

const typeFile = computed(() => {
    return (props.type) ? props.type : 'file';
});

const props = defineProps<{
    label?: string;
    multiple?: boolean;
    autoUpload?: boolean;
    value: string | null | string[];
    type?: 'image' | 'file';
    accept?: string;
}>();

const removeFileCurrent = () => {
    emit('removeFileCurrent');
}

const emit = defineEmits<{
    (e: 'removeFileCurrent'): void;
    (e: 'update:value', value: any): void;
}>();

</script>