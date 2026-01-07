<template>
  <div>
    <h2>Stats</h2>
    <pre>{{ stats }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getStats } from '../api';

const stats = ref({});

onMounted(async () => {
  stats.value = await getStats();
});
</script>
