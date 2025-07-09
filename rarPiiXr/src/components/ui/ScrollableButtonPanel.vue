<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

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

// Track active/focused button and scroll container reference
const activeButtonId = ref('');
const scrollContainer = ref<HTMLElement | null>(null);

// Handle button click
const handleButtonClick = (button: ActionButton) => {
  activeButtonId.value = button.id;
  emit('button-click', button);
};

// Handle button hover/focus
const handleButtonHover = (button: ActionButton) => {
  emit('button-hover', button);
};

// Scroll left functionality for the arrow button
const scrollLeft = () => {
  if (scrollContainer.value) {
    const scrollAmount = 200; // Pixels to scroll
    scrollContainer.value.scrollBy({
      left: -scrollAmount,
      behavior: 'smooth'
    });
  }
};

// Scroll right functionality for the arrow button
const scrollRight = () => {
  if (scrollContainer.value) {
    const scrollAmount = 200; // Pixels to scroll
    scrollContainer.value.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }
};

// Handle mouse wheel scrolling on the container
const handleWheelScroll = (event: WheelEvent) => {
  if (scrollContainer.value) {
    event.preventDefault();
    // Convert vertical scroll to horizontal scroll
    const scrollAmount = event.deltaY > 0 ? 100 : -100;
    scrollContainer.value.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  }
};

// Handle horizontal scroll with keyboard navigation
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
    
    // Scroll the button into view smoothly
    const buttonElement = document.getElementById(`button-${props.buttons[newIndex].id}`);
    buttonElement?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    
    // Emit the hover event to update the parent component
    emit('button-hover', props.buttons[newIndex]);
  } else if (event.key === 'Enter' || event.key === ' ') {
    // Handle selection with Enter or Space key
    const activeButton = props.buttons.find(btn => btn.id === activeButtonId.value);
    if (activeButton) {
      handleButtonClick(activeButton);
    }
  }
};

// Set up component when mounted
onMounted(() => {
  // Set the first button as active by default
  if (props.buttons.length > 0) {
    activeButtonId.value = props.buttons[0].id;
  }
  
  // Add event listeners for keyboard navigation
  document.addEventListener('keydown', handleKeydown);
  
  // Add wheel event listener to the scroll container after it's mounted
  setTimeout(() => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('wheel', handleWheelScroll, { passive: false });
    }
  }, 0);
});

// Clean up event listeners when component is unmounted
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeydown);
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('wheel', handleWheelScroll);
  }
});
</script>

<template>
  <div class="scrollable-button-panel">
    <div 
      ref="scrollContainer"
      class="scrollable-container" 
      tabindex="0"
      @wheel="handleWheelScroll"
    >
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
              <!-- QR Code Icon - Simple colored div -->
              <div 
                v-if="button.icon === 'qr-icon'"
                class="simple-icon qr-simple"
              >
                QR
              </div>
              
              <!-- Connect Icon - Simple colored div -->
              <div 
                v-else-if="button.icon === 'connect-icon'"
                class="simple-icon connect-simple"
              >
                🔗
              </div>
              
              <!-- Direct Icon - Simple colored div -->
              <div 
                v-else-if="button.icon === 'direct-icon'"
                class="simple-icon direct-simple"
              >
                →
              </div>
              
              <!-- Settings Icon - Simple colored div -->
              <div 
                v-else-if="button.icon === 'settings-icon'"
                class="simple-icon settings-simple"
              >
                ⚙️
              </div>
              
              <!-- Video Icon - Simple colored div -->
              <div 
                v-else-if="button.icon === 'video-icon'"
                class="simple-icon video-simple"
              >
                ▶️
              </div>
              
              <!-- History Icon - Simple colored div -->
              <div 
                v-else-if="button.icon === 'history-icon'"
                class="simple-icon history-simple"
              >
                🕐
              </div>
              
              <!-- File Icon - Simple colored div -->
              <div 
                v-else-if="button.icon === 'file-icon'"
                class="simple-icon file-simple"
              >
                📄
              </div>
              
              <!-- Calendar Icon - Simple colored div -->
              <div 
                v-else-if="button.icon === 'calendar-icon'"
                class="simple-icon calendar-simple"
              >
                📅
              </div>
              
              <!-- Help Icon - Simple colored div -->
              <div 
                v-else-if="button.icon === 'help-icon'"
                class="simple-icon help-simple"
              >
                ❓
              </div>
              
              <!-- Fallback Icon - Simple colored div -->
              <div 
                v-else
                class="simple-icon fallback-simple"
              >
                ●
              </div>
            </div>
            <div class="label">{{ button.label }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Functional arrow buttons for scrolling -->
    <div class="scroll-controls">
      <button 
        class="scroll-arrow left" 
        @click="scrollLeft"
        aria-label="Scroll left"
        :disabled="false"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button 
        class="scroll-arrow right" 
        @click="scrollRight"
        aria-label="Scroll right"
        :disabled="false"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
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
  scroll-behavior: smooth; /* Smooth scrolling behavior */
}

/* Hide scrollbar for Chrome/Safari */
.scrollable-container::-webkit-scrollbar {
  display: none;
}

.buttons-row {
  display: flex;
  gap: 1rem;
  padding: 0 3rem; /* Extra padding for scroll controls */
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
  /* Force white color for all SVG elements */
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  padding: 4px;
}

.icon svg {
  width: 100%;
  height: 100%;
  /* Force white color */
  color: white !important;
  stroke: white !important;
  fill: white !important;
  /* Add drop shadow for better visibility */
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
}

/* Force all SVG elements to be white */
.icon svg * {
  stroke: white !important;
  fill: white !important;
}

/* Simple icon styles */
.simple-icon {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  background-color: rgba(190, 77, 243, 0.8);
  border-radius: 50%;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.qr-simple {
  font-size: 12px;
  font-weight: bold;
}

.connect-simple {
  font-size: 16px;
}

.direct-simple {
  font-size: 20px;
  font-weight: bold;
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

/* Functional scroll controls positioned at the sides */
.scroll-controls {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  pointer-events: none; /* Allow clicks to pass through the container */
  z-index: 10;
}

.scroll-arrow {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  border: none;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  pointer-events: auto; /* Re-enable clicks for the buttons */
  backdrop-filter: blur(10px);
}

.scroll-arrow:hover {
  background-color: rgba(190, 77, 243, 0.8);
  transform: scale(1.1);
}

.scroll-arrow:active {
  transform: scale(0.95);
}

.scroll-arrow.left {
  margin-left: 0.5rem;
}

.scroll-arrow.right {
  margin-right: 0.5rem;
}

.scroll-arrow svg {
  width: 20px;
  height: 20px;
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
  
  .scroll-arrow {
    width: 36px;
    height: 36px;
  }
  
  .scroll-arrow svg {
    width: 16px;
    height: 16px;
  }
}
</style>
