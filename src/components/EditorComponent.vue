<template>
    <component :is="'style'">{{ styleScoped }}</component>
    <q-editor v-model:model-value="value" :readonly="props.readonly" :definitions="definitions" :toolbar="toolbar"
        ref="EditorRef" paragraph-tag="p" @keydown.enter="nextLineParagraph" @keydown="nextElement" :fonts="{
            arial: 'Arial',
            arial_black: 'Arial Black',
            comic_sans: 'Comic Sans MS',
            courier_new: 'Courier New',
            impact: 'Impact',
            lucida_grande: 'Lucida Grande',
            times_new_roman: 'Times New Roman',
            verdana: 'Verdana'
        }" @contextmenu.stop="showContextMenu" @update:model-value="setValue" content-class="my-editor-content">

    </q-editor>
    <ContextMenu :items="contextMenuItems" @refMenu="setMenuRef" />
    <q-dialog v-model:model-value="ShowDialog">
        <q-card style="width: 100%; height: 80%;" class="relative">
            <q-btn flat v-close-popup class="absolute-top-right q-mt-sm q-mr-sm z-top" icon="close"></q-btn>
            <q-card-section>
                <div class="text-h6">Код HTML редактора
                </div>
            </q-card-section>
            <q-separator />
            <q-card-section class="q-pt-lg">
                <q-input v-model="value" type="textarea" autogrow></q-input>
            </q-card-section>
            <q-card-section>
                <q-btn color="primary" v-close-popup label="Ок" class="q-ma-md"></q-btn>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import type { QMenu } from 'quasar';
import { QEditor, Dialog, useQuasar } from 'quasar';
import { FileAPI } from 'src/API';
import ContextMenu from './ContextMenu.vue';
import type { ContextMenuProps } from './ContextMenu.vue';
import { serialize, compile, middleware, stringify } from 'stylis';
import { useSettingsStore } from 'src/stores/settings';

const settingsStore = useSettingsStore();
const styleScoped = ref('');

const scopeCss = (rawCss: string, scope: string) => {
    // compile превращает строку в дерево (AST)
    // Мы оборачиваем входной CSS в наш scope-класс
    const result = serialize(
        compile(`${scope} { ${rawCss} }`),
        middleware([stringify])
    );
    return result;
};

const $q = useQuasar();

// Костыль ----------------------------------------------------------------------

const setValue = (val: string) => {
    value.value = val;
};

const Kostyl = () => {
    // Переписывает и затирает inlaine стили в редакторе. Делаю этот костыль, что бы не затирались значения. Нужно вызывать для всех изменений контента.
    const editor = EditorRef.value;
    if (!editor) return;
    const el = editor.getContentEl();
    value.value = el.innerHTML + '\u0000';
};

const ShowDialog = ref(false);

// Context Menu ------------------------------------------------------------------
const MenuRef = ref<QMenu | null>(null);

const setMenuRef = (menu: QMenu | null) => {
    MenuRef.value = menu;
};

const showContextMenu = (event: MouseEvent) => {
    // @ts-expect-error ignore
    if (event.target.tagName.toLowerCase() === "img") {
        event.preventDefault();
        // @ts-expect-error ignore
        MenuRef.value.show(event);

    }
};

const contextMenuItems: ContextMenuProps[] = [
    {
        label: 'Изменить размер',
        children: [
            {
                label: 'Указать в пикселях',
                action: (el: HTMLElement | null) => {
                    const editor = EditorRef.value;
                    if (!editor) return;
                    if (el && el.tagName.toLowerCase() === 'img') {
                        Dialog.create({
                            title: 'Указать размер в пикселях',
                            message: 'Введите размер изображения в пикселях (например, 200 для 200px):',
                            prompt: {
                                model: '',
                                type: 'number'
                            },
                            cancel: true,
                            persistent: true
                        }).onOk((sizePx) => {
                            const px = parseInt(sizePx, 10);
                            if (!isNaN(px) && px > 0) {
                                (el as HTMLImageElement).style.width = px + 'px';
                            }
                            editor.focus();
                            Kostyl();
                        });
                    }
                    editor.focus();
                }
            },
            {
                label: 'Указать в процентах',
                action: (el: HTMLElement | null) => {
                    const editor = EditorRef.value;
                    if (!editor) return;
                    if (el && el.tagName.toLowerCase() === 'img') {
                        Dialog.create({
                            title: 'Указать размер в процентах',
                            message: 'Введите размер изображения в процентах (например, 50 для 50%):',
                            prompt: {
                                model: '',
                                type: 'number'
                            },
                            cancel: true,
                            persistent: true
                        }).onOk((sizePercent) => {
                            const percent = parseInt(sizePercent, 10);
                            if (!isNaN(percent) && percent > 0) {
                                (el as HTMLImageElement).style.width = percent + '%';
                            }
                            editor.focus();
                            Kostyl();
                        });
                    }
                }
            },
            {
                label: '100%',
                action: (el: HTMLElement | null) => {
                    const editor = EditorRef.value;
                    if (!editor) return;
                    (el as HTMLImageElement).style.width = 100 + '%';
                    editor.focus();
                    Kostyl();
                }
            },
            {
                label: '50%',
                action: (el: HTMLElement | null) => {
                    const editor = EditorRef.value;
                    if (!editor) return;
                    (el as HTMLImageElement).style.width = 50 + '%';
                    editor.focus();
                    Kostyl();
                }
            },
            {
                label: '25%',
                action: (el: HTMLElement | null) => {
                    const editor = EditorRef.value;
                    if (!editor) return;
                    (el as HTMLImageElement).style.width = 25 + '%';
                    editor.focus();
                    Kostyl();
                }
            },
        ]
    },
    {
        label: 'Положение в тексте',
        children: [
            {
                label: 'Слева',
                action: (el: HTMLElement | null) => {
                    const editor = EditorRef.value;
                    if (!editor) return;
                    if (el && el.tagName.toLowerCase() === 'img') {
                        (el as HTMLImageElement).style.cssFloat = 'left';
                    }
                    editor.focus();
                    Kostyl();
                }
            },
            {
                label: 'По центру',
                action: (el: HTMLElement | null) => {
                    const editor = EditorRef.value;
                    if (!editor) return;
                    if (el && el.tagName.toLowerCase() === 'img') {
                        (el as HTMLImageElement).style.display = 'block';
                        (el as HTMLImageElement).style.margin = '0 auto 10px auto';
                        (el as HTMLImageElement).style.cssFloat = 'none';
                    }
                    editor.focus();
                    Kostyl();
                }
            },
            {
                label: 'Справа',
                action: (el: HTMLElement | null) => {
                    const editor = EditorRef.value;
                    if (!editor) return;
                    if (el && el.tagName.toLowerCase() === 'img') {
                        (el as HTMLImageElement).style.cssFloat = 'right';
                    }
                    editor.focus();
                    Kostyl();
                }
            },
        ]
    },
    {
        label: 'Сброс стилей',
        action: (el: HTMLElement | null) => {
            const editor = EditorRef.value;
            if (!editor) return;
            (el as HTMLImageElement).style = '';
            editor.focus();
            Kostyl();
        }
    },
    {
        label: 'Удалить изображение',
        action: (el: HTMLElement | null) => {
            const editor = EditorRef.value;
            if (!editor) return;
            if (el && el.tagName.toLowerCase() === 'img') {
                el.remove();
            }
            editor.focus();
        }
    },
    {
        label: 'Скопировать ссылку',
        action: async (el: HTMLElement | null) => {
            if (el && el.tagName.toLowerCase() === 'img') {
                const imageUrl = (el as HTMLImageElement).src;
                try {
                    await navigator.clipboard.writeText(imageUrl);
                } catch (err) {
                    console.error('Ошибка при копировании: ', err);
                }

            }
        }
    }
]

// EMIT -------------------------------------------------------------------------

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

// PROPS ------------------------------------------------------------------------

const props = defineProps<{
    inValue: string;
    readonly?: boolean;
}>();

// Toolbar ----------------------------------------------------------------------

const toolbar = [
    ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript', 'removeFormat'],
    ['link', 'unlink', 'hr'],
    ['unordered', 'ordered', 'outdent', 'indent'],
    [{
        label: '',
        icon: $q.iconSet.editor.align,
        fixedLabel: true,
        list: 'only-icons',
        options: ['left', 'center', 'right', 'justify']
    },],
    [{
        label: $q.lang.editor.formatting,
        icon: $q.iconSet.editor.formatting,
        list: 'no-icons',
        options: [
            'p',
            'code',
            'quote',
            'h6',
            'h5',
            'h4',
            'h3',
            'h2',
            'h1',
        ]
    },
    {
        label: $q.lang.editor.fontSize,
        icon: $q.iconSet.editor.fontSize,
        fixedLabel: true,
        fixedIcon: true,
        list: 'no-icons',
        options: [
            'size-1',
            'size-2',
            'size-3',
            'size-4',
            'size-5',
            'size-6',
            'size-7'
        ]
    },
    {
        label: 'Font',
        icon: 'font_download',
        fixedIcon: true,
        list: 'no-icons',
        options: [
            'default_font',
            'arial',
            'arial_black',
            'comic_sans',
            'courier_new',
            'impact',
            'lucida_grande',
            'times_new_roman',
            'verdana'
        ]
    }],
    ['insertImage'],
    ['undo', 'redo'],
    [{
        label: 'Конструкции',
        icon: 'extension',
        list: 'no-icons',
        options: ['insertCustom', 'getContents', 'testfont']
    }],
    ['showCode']
];


// Shift+Enter для разрыва строки <br> ---------------------------------------

const nextLineParagraph = (e: KeyboardEvent, val: any) => {
    console.log('nextLineParagraph', e, val);
    if (e.shiftKey) {
        console.log('Shift+Enter detected, skipping paragraph insert');
        return;
    }
    const editor = EditorRef.value;
    if (!editor) return;
    const caret = editor.caret;
    const element = caret.parent as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    console.log('Current element tag:', caret);
    if (tagName !== 'p' && tagName !== 'div' && tagName !== 'span') {
        if (element.textContent.length !== 0) {
            return; // Не пустой элемент, ничего не делаем
        }
    }
    editor.runCmd('insertHTML', '<p><br></p>');
    // Вставка нового параграфа при нажатии Enter
    editor.focus();
    e.stopPropagation();
    e.preventDefault();
};


// Создать элемент справа от текущего ---------------------------------------

const nextElement = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
        const editor = EditorRef.value;
        if (!editor) return;
        const caret = editor.caret;
        const element = caret.parent as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        if (tagName !== 'p') {
            console.log(caret);
            if (element.textContent.length - (caret.range?.endOffset ?? 0) === 0) {
                const editor = EditorRef.value;
                if (!editor) return;
                editor.runCmd('insertHTML', '<p><br></p>');
                editor.focus();
            }
        }
    }
};


// VALUE -----------------------------------------------------------------------------

const value = computed<string>({
    get() {
        return props.inValue || '<p><br></p>';
    },
    set(val: string) {
        emit('update:modelValue', val);
    },
});

const EditorRef = ref<QEditor | null>(null);

// const nextLine = () => {
//     console.log('nextLine');
//     const editor = EditorRef.value;
//     if (!editor) return;
//     console.log(editor.getContentEl());
//     editor.runCmd('insertHTML', '<br>');
//     // Вставка разрыва строки при нажатии Shift+Enter
//     editor.focus();
// };

// Custom Definitions ----------------------------------------------------------------

const definitions = {
    insertCustom: {
        tip: 'Вставить блок',
        icon: 'extension',
        handler: () => {
            const editor = EditorRef.value;
            if (!editor) return;
            const myHtml = '<div class="my-badge">[НОВЫЙ БЛОК]</div><p><br></p>';

            // Самый простой способ вставки в позицию каретки
            editor.runCmd('insertHTML', myHtml);
            editor.focus();
        }
    },
    getContents: {
        tip: 'Получить содержимое',
        icon: 'code',
        handler: () => {
            const editor = EditorRef.value;
            if (!editor) return;
            // Получение HTML-содержимого редактора
            const content = editor.getContentEl();
            console.log('Editor Content:', content.innerHTML);
        }
    },
    testfont: {
        tip: 'Test Font',
        icon: 'font_download',
        handler: () => {
            const selection = window.getSelection();
            // @ts-expect-error ignore
            if (selection.rangeCount > 0) {
                // @ts-expect-error ignore
                const range = selection.getRangeAt(0);

                // Где начало (каретка)
                console.log(range);
                console.log('Узел, в котором каретка:', range.startContainer);
                console.log('Смещение (символ по счету):', range.startOffset);
            }
        }
    },
    insertImage: {
        tip: 'Вставить изображение',
        icon: 'image',
        handler: () => {
            const editor = EditorRef.value;
            if (!editor) return;

            // Создаем скрытый input
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*'; // Только изображения

            input.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (!file) return;

                // Вариант 1: Загрузить на сервер через API
                try {
                    const formData = new FormData();
                    formData.append('file', file);
                    const response = await FileAPI.uploadFile(formData);
                    if (response) {
                        const imageid = response?.data.id as string; // URL загруженного файла
                        editor.runCmd('insertImage', `/api/v1/file/get/${imageid}`);
                        Kostyl();
                        editor.focus();
                        input.remove();
                    }

                } catch (error) {
                    console.error('Upload failed:', error);
                }
                // Вариант 2: Вставить как base64 (локально, без загрузки)
                // const reader = new FileReader();
                // reader.onload = (e) => {
                //     const imageUrl = e.target?.result as string;
                //     editor.runCmd('insertImage', imageUrl);
                //     editor.focus();
                // };
                // reader.readAsDataURL(file);
            };

            // Программно открываем диалог выбора файла
            input.click();
        }
    },
    showCode: {
        tip: 'Показать HTML-код',
        icon: 'code',
        handler: () => {
            ShowDialog.value = true;
        }
    }
}

// Fuctions for Definitions -------------------------------------------------------------

// onMounted ---------------------------------------------------------------------
onMounted(() => {
    const styleData = settingsStore.getStyle;
    if (styleData && styleData.length > 0) {
        styleScoped.value = scopeCss(styleData, '.my-editor-content');
    }
});
</script>

<style>
.my-badge {
    font-weight: bold;
    color: red;
}
</style>