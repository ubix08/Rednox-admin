<template>
  <div>
    <h3>Node Palette</h3>
    <div v-for="cat in categories" :key="cat.name">
      <h4>{{ cat.name }}</h4>
      <div v-for="node in cat.nodes" :key="node.type" draggable="true" @dragstart="onDragStart($event, node)">
        <div class="p-2 bg-gray-200">{{ node.label }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFlowStore } from '../stores/flowStore';

const store = useFlowStore();
const categories = store.categories;

function onDragStart(event: DragEvent, node: any) {
  event.dataTransfer?.setData('application/node', JSON.stringify(node));
}
</script>
