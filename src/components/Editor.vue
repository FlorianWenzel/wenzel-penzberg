<template>
    <div class="editor">
        <editor-menu-bar :editor="editor" v-slot="{ commands, isActive }">
            <div class="menubar">

                <button type="button"
                        class="menubar__button btn"
                        :class="{ 'is-active': isActive.bold() }"
                        @click="commands.bold"
                >

                    <i class="fas fa-bold"></i>
                </button>

                <button type="button"
                        class="menubar__button btn"
                        :class="{ 'is-active': isActive.italic() }"
                        @click="commands.italic"
                >

                    <i class="fas fa-italic"></i>
                </button>

                <button type="button"
                        class="menubar__button btn"
                        :class="{ 'is-active': isActive.strike() }"
                        @click="commands.strike"
                >
                    <i class="fas fa-strikethrough"></i>
                </button>

                <button type="button"
                        class="menubar__button btn"
                        :class="{ 'is-active': isActive.underline() }"
                        @click="commands.underline"
                >

                    <i class="fas fa-underline"></i>
                </button>

                <button type="button"
                        class="menubar__button btn"
                        :class="{ 'is-active': isActive.heading({ level: 1 }) }"
                        @click="commands.heading({ level: 1 })"
                >
                    H1
                </button>

                <button type="button"
                        class="menubar__button btn"
                        :class="{ 'is-active': isActive.heading({ level: 2 }) }"
                        @click="commands.heading({ level: 2 })"
                >
                    H2
                </button>

                <button type="button"
                        class="menubar__button btn"
                        :class="{ 'is-active': isActive.heading({ level: 3 }) }"
                        @click="commands.heading({ level: 3 })"
                >
                    H3
                </button>

                <button type="button"
                        class="menubar__button btn"
                        :class="{ 'is-active': isActive.bullet_list() }"
                        @click="commands.bullet_list"
                >

                    <i class="fas fa-list-ul"></i>
                </button>

                <button type="button"
                        class="menubar__button btn"
                        :class="{ 'is-active': isActive.ordered_list() }"
                        @click="commands.ordered_list"
                >
                    <i class="fas fa-list-ol"></i>
                </button>

                <button type="button"
                        class="menubar__button btn"
                        :class="{ 'is-active': isActive.code_block() }"
                        @click="commands.code_block"
                >
                    <i class="fas fa-code"></i>

                </button>

                <button type="button"
                        class="menubar__button btn"
                        @click="commands.undo"
                >
                    <i class="fas fa-undo"></i>
                </button>

                <button type="button"
                        class="menubar__button btn"
                        @click="commands.redo"
                >
                    <i class="fas fa-redo"></i>
                </button>

            </div>
        </editor-menu-bar>

        <editor-content class="editor__content border" style="border-radius: .25rem;" :editor="editor" />
    </div>
</template>

<script>
    import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
    import {
        Blockquote,
        CodeBlock,
        HardBreak,
        Heading,
        HorizontalRule,
        OrderedList,
        BulletList,
        ListItem,
        TodoItem,
        TodoList,
        Bold,
        Code,
        Italic,
        Link,
        Strike,
        Underline,
        History,
        Placeholder,
    } from 'tiptap-extensions'

    export default {
        components: {
            EditorContent,
            EditorMenuBar,
        },
        props: [ 'text' ],
        data() {
            return {
                editor: new Editor({
                    extensions: [
                        new Blockquote(),
                        new BulletList(),
                        new CodeBlock(),
                        new HardBreak(),
                        new Heading({ levels: [1, 2, 3] }),
                        new HorizontalRule(),
                        new ListItem(),
                        new OrderedList(),
                        new TodoItem(),
                        new TodoList(),
                        new Link(),
                        new Bold(),
                        new Code(),
                        new Italic(),
                        new Strike(),
                        new Underline(),
                        new History(),
                        new Placeholder({emptyNodeText: 'Text...'}),
                    ],
                    content: this.text,
                    onUpdate: ({ getHTML }) => {
                        this.$emit('input', getHTML())
                    },
                }),
            }
        },
        beforeDestroy() {
            this.editor.destroy()
        },
        watch: {
            text(val) {
                if (this.editor && val !== this.value) {
                    this.editor.setContent(val, true)
                }
            }
        },
    }
</script>