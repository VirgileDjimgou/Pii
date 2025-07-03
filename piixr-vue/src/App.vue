<script setup lang="ts">
import { onMounted } from 'vue';
import { useAppStore } from './stores/app';

const appStore = useAppStore();

onMounted(() => {
  // Initialize app settings
  appStore.initSettings();
});
</script>

<template>
  <router-view />
</template>

<style>
:root {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  
  color-scheme: dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #121212;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button {
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: all 0.25s;
}

button:hover {
  background-color: #2a2a2a;
}

button:focus,
button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

.dark-theme {
  --bg-color: #121212;
  --text-color: rgba(255, 255, 255, 0.87);
  --surface-color: #1e1e1e;
  --primary-color: #be4df3;
  --secondary-color: #6b7280;
  --error-color: #ef4444;
  --success-color: #22c55e;
}
</style>
