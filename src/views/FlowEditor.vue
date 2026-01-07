<template>
  <div class="flex h-screen">
    <NodePalette class="w-1/5" />
    <div class="w-3/5">
      <VueFlow v-model="elements" @node-drag-stop="onNodeDragStop" @connect="onConnect">
        <Controls />
        <MiniMap />
      </VueFlow>
      <button @click="saveFlow">Save</button>
      <button @click="execute">Execute</button>
    </div>
    <PropertyPanel v-if="selectedNode" :node="selectedNode" class="w-1/5" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { VueFlow, Controls, MiniMap } from '@vue-flow/core';
import { useRoute } from 'vue-router';
import { useFlowStore } from '../stores/flowStore';
import NodePalette from '../components/NodePalette.vue';
import PropertyPanel from '../components/PropertyPanel.vue';
import { getFlow, updateFlow, executeFlow } from '../api';

const store = useFlowStore();
const route = useRoute();
const elements = ref<any[]>([]); // Nodes + Edges
const selectedNode = ref(null);

onMounted(async () => {
  store.setCurrentFlow(route.params.id as string);
  const flowData = await getFlow(route.params.id as string);
  elements.value = [...flowData.config.nodes, ...flowData.config.edges || []]; // Assume edges in config
  await store.loadNodes();
});

function onNodeDragStop(event: any) {
  // Update position
}

function onConnect(params: any) {
  elements.value.push({ id: crypto.randomUUID(), ...params });
}

async function saveFlow() {
  const nodes = elements.value.filter(e => !e.source); // Simplify
  const edges = elements.value.filter(e => e.source);
  await updateFlow(route.params.id as string, { nodes, edges }); // Adjust to FlowConfig
}

async function execute() {
  const payload = { nodeId: 'start', payload: {} }; // Example
  await executeFlow(route.params.id as string, payload);
}
</script>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
</style>
