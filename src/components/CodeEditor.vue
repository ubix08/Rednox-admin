<template>
  <div ref="container" class="h-64"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import * as monaco from 'monaco-editor';

const props = defineProps<{ modelValue: string }>();
const emit = defineEmits(['update:modelValue']);
const container = ref<HTMLDivElement | null>(null);

let editor: monaco.editor.IStandaloneCodeEditor;

onMounted(() => {
  if (container.value) {
    editor = monaco.editor.create(container.value, {
      value: props.modelValue,
      language: 'javascript', // or 'json'
      theme: 'vs-dark',
    });
    editor.onDidChangeModelContent(() => {
      emit('update:modelValue', editor.getValue());
    });
  }
});

watch(() => props.modelValue, (val) => {
  if (editor.getValue() !== val) editor.setValue(val);
});
</script>
