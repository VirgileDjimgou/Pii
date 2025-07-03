<script setup lang="ts">
import HelloWorld from "./components/HelloWorld.vue";
import CameraPreview from "./components/CameraPreview.vue";
import DetectionOverlay from "./components/DetectionOverlay.vue";
import MobileDashboard from "./components/MobileDashboard.vue";
import { ref } from 'vue';

// Toggle between original view and dashboard view
const showDashboard = ref(true);

const toggleView = () => {
  showDashboard.value = !showDashboard.value;
};
</script>

<template>
  <!-- New mobile dashboard interface -->
  <MobileDashboard v-if="showDashboard" />
  
  <!-- Original application content (preserved for compatibility) -->
  <!-- this section will not be rendered when the dashboard is show -->

  <div v-else id="app">
    <div class="position-relative">
      <CameraPreview />
      <DetectionOverlay />
    </div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
    <HelloWorld msg="Vite + Vue" />
  </div>
  
  <!-- Development toggle button (can be removed in production) -->
  <button 
    class="view-toggle" 
    @click="toggleView"
    :title="showDashboard ? 'Switch to Original View' : 'Switch to Dashboard'"
  >
    <i :class="showDashboard ? 'fas fa-code' : 'fas fa-mobile-alt'"></i>
  </button>
</template>

<style scoped>
#app {
  text-align: center;
  margin: 0 auto;
  max-width: 640px;
}
.position-relative {
  position: relative;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

/* Development toggle button for switching between views */
.view-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 20px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.view-toggle:active {
  transform: translateY(0);
}

/* Ensure the toggle button is always visible */
.view-toggle i {
  font-size: 18px;
}
</style>
