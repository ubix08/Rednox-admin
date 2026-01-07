<template>
  <div>
    <h2>Flows</h2>
    <button @click="createNewFlow" class="bg-blue-500 text-white p-2">New Flow</button>
    <button @click="importFlowModal = true" class="bg-green-500 text-white p-2 ml-2">Import</button>
    <table class="w-full mt-4">
      <thead>
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Enabled</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="flow in flows" :key="flow.id">
          <td>{{ flow.name }}</td>
          <td>{{ flow.description }}</td>
          <td>{{ flow.enabled ? 'Yes' : 'No' }}</td>
          <td>
            <RouterLink :to="`/flow/${flow.id}`">Edit</RouterLink>
            <button @click="toggle(flow.id, !flow.enabled)">{{ flow.enabled ? 'Disable' : 'Enable' }}</button>
            <button @click="deleteF(flow.id)">Delete</button>
            <button @click="exportF(flow.id)">Export</button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Import Modal (using Headless UI Dialog) -->
    <Dialog v-model:open="importFlowModal">
      <div>Import JSON</div>
      <input type="file" @change="handleImport" />
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useFlowStore } from '../stores/flowStore';
import { Dialog } from '@headlessui/vue';
import { createFlow, deleteFlow, toggleFlow, exportFlow, importFlow, listFlows } from '../api';
import { useRouter } from 'vue-router';

const store = useFlowStore();
const router = useRouter();
const importFlowModal = ref(false);
const flows = ref([]);

onMounted(async () => {
  flows.value = (await listFlows()).flows;
});

async function createNewFlow() {
  const newFlow = await createFlow({ name: 'New Flow', nodes: [] });
  router.push(`/flow/${newFlow.flowId}`);
}

async function toggle(id: string, enable: boolean) {
  await toggleFlow(id, enable);
  flows.value = (await listFlows()).flows;
}

async function deleteF(id: string) {
  await deleteFlow(id);
  flows.value = (await listFlows()).flows;
}

async function exportF(id: string) {
  const data = await exportFlow(id);
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${id}.json`;
  a.click();
}

function handleImport(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const data = JSON.parse(ev.target?.result as string);
      await importFlow(data);
      importFlowModal.value = false;
      flows.value = (await listFlows()).flows;
    };
    reader.readAsText(file);
  }
}
</script>
