<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  currentTool: 'arrow' | 'circle' | 'rectangle' | 'freehand' | 'text';
}>();

defineEmits<{
  (e: 'setTool', tool: 'arrow' | 'circle' | 'rectangle' | 'freehand' | 'text'): void;
  (e: 'undo'): void;
  (e: 'clear'): void;
}>();

// Track active tool for UI highlight
const activeToolIcon = ref<string>('arrow');

// Set active tool for visual highlighting in UI
const setActiveTool = (tool: string) => {
  activeToolIcon.value = tool;
};
</script>

<template>
  <div class="ar-overlay-toolbar">
    <button 
      class="toolbar-button" 
      :class="{ active: activeToolIcon === 'arrow' }"
      @click="() => { $emit('setTool', 'arrow'); setActiveTool('arrow'); }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14"></path>
        <path d="M12 5l7 7-7 7"></path>
      </svg>
    </button>
    
    <button 
      class="toolbar-button" 
      :class="{ active: activeToolIcon === 'back' }"
      @click="() => { $emit('undo'); setActiveTool('back'); }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 14 4 9 9 4"></polyline>
        <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
      </svg>
    </button>
    
    <button 
      class="toolbar-button" 
      :class="{ active: activeToolIcon === 'pencil' }"
      @click="() => { $emit('setTool', 'freehand'); setActiveTool('pencil'); }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
        <path d="M2 2l7.586 7.586"></path>
        <circle cx="11" cy="11" r="2"></circle>
      </svg>
    </button>
    
    <button 
      class="toolbar-button" 
      :class="{ active: activeToolIcon === 'undo' }"
      @click="() => { $emit('undo'); setActiveTool('undo'); }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 7v6h6"></path>
        <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
      </svg>
    </button>
    
    <button 
      class="toolbar-button" 
      :class="{ active: activeToolIcon === 'trash' }"
      @click="() => { $emit('clear'); setActiveTool('trash'); }">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    </button>
  </div>
</template>

<style scoped>
.ar-overlay-toolbar {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 15px 10px;
  border-radius: 15px;
  z-index: 20;
}

.toolbar-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-button svg {
  width: 20px;
  height: 20px;
}

.toolbar-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.toolbar-button.active {
  background-color: #3b82f6;
  color: white;
}
</style>
