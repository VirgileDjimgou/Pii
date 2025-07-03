<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Define the button interface to ensure type safety
interface ActionButton {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

// Component props
const props = defineProps<{
  buttons: ActionButton[];
}>();

// Emit events for button interactions
const emit = defineEmits(['button-click', 'button-hover']);

// Track active/focused button
const activeButtonId = ref('');

// Handle button click
const handleButtonClick = (button: ActionButton) => {
  activeButtonId.value = button.id;
  emit('button-click', button);
};

// Handle button hover/focus
const handleButtonHover = (button: ActionButton) => {
  emit('button-hover', button);
};

// Handle horizontal scroll with keyboard
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    
    // Find the current active button index
    const currentIndex = props.buttons.findIndex(btn => btn.id === activeButtonId.value);
    let newIndex = currentIndex;
    
    if (event.key === 'ArrowRight') {
      newIndex = currentIndex < props.buttons.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : props.buttons.length - 1;
    }
    
    // Set the new active button
    activeButtonId.value = props.buttons[newIndex].id;
    
    // Scroll the button into view
    const buttonElement = document.getElementById(`button-${props.buttons[newIndex].id}`);
    buttonElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    
    // Emit the hover event
    emit('button-hover', props.buttons[newIndex]);
  } else if (event.key === 'Enter' || event.key === ' ') {
    // Find the current active button
    const activeButton = props.buttons.find(btn => btn.id === activeButtonId.value);
    if (activeButton) {
      handleButtonClick(activeButton);
    }
  }
};

// Set the first button as active by default
onMounted(() => {
  if (props.buttons.length > 0) {
    activeButtonId.value = props.buttons[0].id;
  }
  
  // Add keyboard listener
  document.addEventListener('keydown', handleKeydown);
});

// Clean up
const onBeforeUnmount = () => {
  document.removeEventListener('keydown', handleKeydown);
};
</script>

<template>
  <div class="scrollable-button-panel">
    <div class="scrollable-container" tabindex="0">
      <div class="buttons-row">
        <div 
          v-for="button in buttons" 
          :key="button.id"
          :id="`button-${button.id}`"
          class="button-container"
          :class="{ 'active': activeButtonId === button.id }"
          @click="handleButtonClick(button)"
          @mouseenter="handleButtonHover(button)"
          @focus="handleButtonHover(button)"
        >
          <div class="square-button">
            <div class="icon">
              <!-- Use the icon class names provided in the button data -->
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="button.icon">
                <!-- Icon paths will be applied via CSS classes -->
              </svg>
            </div>
            <div class="label">{{ button.label }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Visual cue for scrollability -->
    <div class="scroll-indicator">
      <div class="indicator left">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </div>
      <div class="indicator right">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollable-button-panel {
  width: 100%;
  position: relative;
  margin: 1rem 0;
}

.scrollable-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  -ms-overflow-style: none; /* Hide scrollbar for IE/Edge */
  padding: 0.5rem 0;
}

/* Hide scrollbar for Chrome/Safari */
.scrollable-container::-webkit-scrollbar {
  display: none;
}

.buttons-row {
  display: flex;
  gap: 1rem;
  padding: 0 1rem;
  /* Add extra padding to allow seeing the edge of the next item */
  padding-right: 3rem;
}

/* Import all SVG icon styles from the main application */
.qr-icon, .video-icon, .settings-icon, .history-icon, 
.file-icon, .calendar-icon, .help-icon, .connect-icon, .direct-icon {
  width: 100%;
  height: 100%;
}

.button-container {
  flex: 0 0 auto;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.button-container.active {
  transform: scale(1.05);
}

.square-button {
  width: 90px;
  height: 90px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.square-button:hover {
  background-color: rgba(190, 77, 243, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(190, 77, 243, 0.15);
}

.active .square-button {
  background-color: rgba(190, 77, 243, 0.3);
  box-shadow: 0 6px 16px rgba(190, 77, 243, 0.3);
}

.icon {
  width: 30px;
  height: 30px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.label {
  font-size: 0.8rem;
  text-align: center;
  color: white;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.scroll-indicator {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  display: flex;
  justify-content: space-between;
}

.indicator {
  width: 24px;
  height: 24px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0.5;
  margin: auto 0.5rem;
  color: white;
}

.indicator svg {
  width: 16px;
  height: 16px;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .square-button {
    width: 80px;
    height: 80px;
  }
  
  .icon {
    width: 24px;
    height: 24px;
  }
  
  .label {
    font-size: 0.7rem;
  }
}
</style>
