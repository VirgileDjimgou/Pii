<script setup lang="ts">
defineEmits<{
  (e: 'takeScreenshot'): void;
  (e: 'endSession'): void;
}>();
</script>

<template>
  <div class="session-footer">
    <div class="footer-content">
      <button class="capture-button" @click="$emit('takeScreenshot')">
        <div class="capture-button-inner"></div>
      </button>
      
      <button class="end-session-button" @click="$emit('endSession')">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
          <line x1="22" y1="2" x2="2" y2="22"></line>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.session-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.capture-button {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  padding: 0;
}

.capture-button-inner {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background-color: white;
}

.end-session-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #ef4444;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  color: white;
}

.end-session-button svg {
  width: 24px;
  height: 24px;
}
</style>
