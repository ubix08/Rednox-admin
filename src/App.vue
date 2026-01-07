<template>
  <header class="bg-gray-800 text-white p-4 flex justify-between">
    <h1 class="text-xl">RedNox Admin</h1>
    <nav>
      <RouterLink to="/" class="mx-2">Flows</RouterLink>
      <RouterLink to="/stats" class="mx-2">Stats</RouterLink>
    </nav>
  </header>
  <main class="p-4">
    <RouterView />
  </main>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>
