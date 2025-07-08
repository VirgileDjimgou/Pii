<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  currentTool: 'arrow' | 'circle' | 'rectangle' | 'freehand' | 'text';
}>();

defineEmits<{
  (e: 'setTool', tool: 'arrow' | 'circle' | 'rectangle' | 'freehand' | 'text'): void;
  (e: 'undo'): void;
  (e: 'clear'): void;
}>();

// Track active tool for UI highlight - sync with props
const activeToolIcon = ref<string>(props.currentTool);

// Watch for changes in currentTool prop to keep UI in sync
watch(() => props.currentTool, (newTool) => {
  activeToolIcon.value = newTool;
}, { immediate: true });

// Set active tool for visual highlighting in UI
const setActiveTool = (tool: string) => {
  activeToolIcon.value = tool;
};
</script>

<template>
  <div class="ar-overlay-toolbar">
    <!-- Arrow Tool -->
    <button 
      class="toolbar-button" 
      :class="{ active: activeToolIcon === 'arrow' }"
      @click="() => { $emit('setTool', 'arrow'); setActiveTool('arrow'); }"
      title="Arrow">
      <div class="simple-icon">→</div>
    </button>
    
    <!-- Circle Tool -->
    <button 
      class="toolbar-button" 
      :class="{ active: activeToolIcon === 'circle' }"
      @click="() => { $emit('setTool', 'circle'); setActiveTool('circle'); }"
      title="Circle">
      <div class="simple-icon">○</div>
    </button>
    
    <!-- Rectangle Tool -->
    <button 
      class="toolbar-button" 
      :class="{ active: activeToolIcon === 'rectangle' }"
      @click="() => { $emit('setTool', 'rectangle'); setActiveTool('rectangle'); }"
      title="Rectangle">
      <div class="simple-icon">▢</div>
    </button>
    
    <!-- Freehand Drawing Tool -->
    <button 
      class="toolbar-button" 
      :class="{ active: activeToolIcon === 'freehand' }"
      @click="() => { $emit('setTool', 'freehand'); setActiveTool('freehand'); }"
      title="Freehand">
      <div class="simple-icon">✏️</div>
    </button>
    
    <!-- Text Tool -->
    <button 
      class="toolbar-button" 
      :class="{ active: activeToolIcon === 'text' }"
      @click="() => { $emit('setTool', 'text'); setActiveTool('text'); }"
      title="Text">
      <div class="simple-icon">T</div>
    </button>
    
    <!-- Divider -->
    <div class="toolbar-divider"></div>
    
    <!-- Undo Action -->
    <button 
      class="toolbar-button action-button" 
      @click="() => { $emit('undo'); }"
      title="Undo">
      <div class="simple-icon">↶</div>
    </button>
    
    <!-- Clear All Action -->
    <button 
      class="toolbar-button action-button" 
      @click="() => { $emit('clear'); }"
      title="Clear All">
      <div class="simple-icon">🗑️</div>
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
  gap: 12px;
  /* Enhanced glassmorphism background for better visibility */
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 16px 12px;
  border-radius: 16px;
  z-index: 20;
  /* Enhanced shadow for depth and separation from background */
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  /* Subtle animation for initial appearance */
  animation: toolbarFadeIn 0.3s ease-out;
}

@keyframes toolbarFadeIn {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}

.toolbar-button {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  border: none;
  /* Enhanced high contrast background with guaranteed dark base */
  background: 
    linear-gradient(135deg, 
      rgba(0, 0, 0, 0.8) 0%,
      rgba(255, 255, 255, 0.15) 100%
    ),
    rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  cursor: pointer;
  position: relative;
  /* Smooth transitions for all interactions */
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  /* Enhanced shadow for button depth */
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 -1px 0 rgba(0, 0, 0, 0.2);
  /* Ensure button always has dark background for icon contrast */
  min-height: 44px;
  min-width: 44px;
}

.toolbar-button svg {
  width: 22px;
  height: 22px;
  /* Ensure maximum visibility with simple shadow */
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
  transition: all 0.2s ease;
  /* Ensure crisp rendering */
  shape-rendering: crispEdges;
}

/* Simple icon styles for guaranteed visibility */
.simple-icon {
  width: 22px;
  height: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 
    0 1px 2px rgba(0, 0, 0, 0.9),
    0 0 4px rgba(0, 0, 0, 0.7);
  transition: all 0.2s ease;
}

/* Hover state with enhanced visibility */
.toolbar-button:hover {
  background: 
    linear-gradient(135deg, 
      rgba(0, 0, 0, 0.9) 0%,
      rgba(255, 255, 255, 0.25) 100%
    ),
    rgba(0, 0, 0, 0.8);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px) scale(1.05);
  box-shadow: 
    0 6px 16px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -1px 0 rgba(0, 0, 0, 0.3);
}

.toolbar-button:hover svg {
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.9));
}

.toolbar-button:hover .simple-icon {
  transform: scale(1.1);
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.9),
    0 0 6px rgba(255, 255, 255, 0.3);
}

/* Active state with high visibility primary color */
.toolbar-button.active {
  background: linear-gradient(135deg, #be4df3, #a855f7);
  border-color: #be4df3;
  color: white;
  box-shadow: 
    0 4px 16px rgba(190, 77, 243, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

.toolbar-button.active svg {
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.9));
}

.toolbar-button.active .simple-icon {
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.9),
    0 0 4px rgba(255, 255, 255, 0.4);
}

/* Action buttons have a slightly different style but maintain dark background */
.toolbar-button.action-button {
  background: 
    linear-gradient(135deg, 
      rgba(0, 0, 0, 0.7) 0%,
      rgba(255, 255, 255, 0.1) 100%
    ),
    rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.15);
}

.toolbar-button.action-button:hover {
  background: 
    linear-gradient(135deg, 
      rgba(0, 0, 0, 0.8) 0%,
      rgba(255, 255, 255, 0.2) 100%
    ),
    rgba(0, 0, 0, 0.7);
  border-color: rgba(255, 255, 255, 0.3);
}

/* Visual divider between tool and action buttons */
.toolbar-divider {
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  margin: 4px 8px;
  position: relative;
}

.toolbar-divider::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 0, 0, 0.2),
    transparent
  );
}

/* Focus states for accessibility */
.toolbar-button:focus {
  outline: none;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 0 0 2px rgba(190, 77, 243, 0.5);
}

/* Pressed state for tactile feedback */
.toolbar-button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Responsive adjustments for smaller screens */
@media (max-width: 768px) {
  .ar-overlay-toolbar {
    right: 12px;
    padding: 12px 8px;
    gap: 10px;
  }
  
  .toolbar-button {
    width: 40px;
    height: 40px;
  }
  
  .toolbar-button svg {
    width: 20px;
    height: 20px;
  }
  
  .simple-icon {
    width: 20px;
    height: 20px;
    font-size: 16px;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .ar-overlay-toolbar {
    background: rgba(0, 0, 0, 0.95);
    border-color: white;
  }
  
  .toolbar-button {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
  }
  
  .toolbar-button:hover {
    background: rgba(255, 255, 255, 0.4);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .toolbar-button,
  .toolbar-button svg {
    transition: none;
  }
  
  .ar-overlay-toolbar {
    animation: none;
  }
  
  .toolbar-button:hover {
    transform: none;
  }
}
</style>
