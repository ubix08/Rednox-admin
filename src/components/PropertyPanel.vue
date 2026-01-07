<template>
  <div>
    <h3>Properties: {{ node.type }}</h3>
    <form @submit.prevent="save">
      <div v-for="(input, key) in inputs" :key="key">
        <label>{{ key }}</label>
        <input v-if="input.type === 'text'" v-model="node.data[key]" />
        <CodeEditor v-else-if="input.type === 'code'" v-model="node.data[key]" />
        <!-- Add more field types: select, checkbox, etc. -->
      </div>
      <button type="submit">Save</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CodeEditor from './CodeEditor.vue';
import { getNodeType } from '../api';

const props = defineProps<{ node: any }>();
const inputs = ref({});

onMounted(async () => {
  const def = await getNodeType(props.node.type);
  inputs.value = def.inputs; // Assume structure
});

function save() {
  // Update store or emit
}
</script>
