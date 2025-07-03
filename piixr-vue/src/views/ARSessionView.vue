<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCameraFeed } from '../composables/useCameraFeed';
import { useAnnotation } from '../composables/useAnnotation';
import { useAppStore } from '../stores/app';
import { useLocalization } from '../composables/useLocalization';
import AROverlayToolbar from '../components/ar/AROverlayToolbar.vue';
import ARAnnotationOverlay from '../components/ar/ARAnnotationOverlay.vue';
import SessionFooter from '../components/ar/SessionFooter.vue';

const router = useRouter();
const { videoElement, initCamera, stopCamera, isStreaming, hasPermission, errorMessage } = useCameraFeed();
const { translate } = useLocalization();
const appStore = useAppStore();
const annotationTools = useAnnotation();

const showLightWarning = ref(true); // Show light warning for demo purposes

// End session and return to home
const endSession = () => {
  router.push('/');
};

// Toggle light warning (simulated)
const dismissLightWarning = () => {
  showLightWarning.value = false;
};

// Camera container click handler
const handleContainerClick = (e: MouseEvent) => {
  if (annotationTools.isDrawing.value) {
    // If we're drawing, update the annotation
    annotationTools.updateAnnotation(e.offsetX, e.offsetY);
  } else if (annotationTools.currentTool.value !== 'text') {
    // If we're not drawing and not in text mode, start a new annotation
    annotationTools.startAnnotation(e.offsetX, e.offsetY);
  }
};

// Handle mouse up to finish drawing
const handleContainerMouseUp = () => {
  if (annotationTools.isDrawing.value) {
    annotationTools.finishAnnotation();
  }
};

// Handle mouse move for continuous drawing
const handleContainerMouseMove = (e: MouseEvent) => {
  if (annotationTools.isDrawing.value) {
    annotationTools.updateAnnotation(e.offsetX, e.offsetY);
  }
};

// Computed property to determine if AR surfaces should be shown
const showARSurfaces = computed(() => {
  return appStore.settings.showARSurfaces;
});

onMounted(() => {
  // Initialize camera
  initCamera();
  
  // Set a timeout to dismiss the light warning after 5 seconds (for demo)
  setTimeout(() => {
    showLightWarning.value = false;
  }, 5000);
});

onUnmounted(() => {
  // Clean up camera feed
  stopCamera();
});
</script>

<template>
  <div class="ar-session-container">
    <!-- Camera Background -->
    <div class="camera-container"
      @click="handleContainerClick"
      @mouseup="handleContainerMouseUp"
      @mousemove="handleContainerMouseMove">
      <video ref="videoElement" autoplay muted playsinline class="camera-feed"></video>
      
      <!-- Camera Permission Error -->
      <div v-if="errorMessage" class="camera-error">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- AR Surfaces Visualization (when enabled) -->
      <div v-if="showARSurfaces && isStreaming" class="ar-surfaces">
        <div class="surface-point" v-for="i in 20" :key="i" 
          :style="{ 
            left: `${Math.random() * 100}%`, 
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.3
          }">
        </div>
      </div>

      <!-- Light Warning -->
      <div v-if="showLightWarning" class="light-warning">
        <div class="light-warning-content">
          <div class="light-warning-icon">
            <div class="phone-outline"></div>
            <div class="dot-grid"></div>
          </div>
          <p>{{ translate('app.lightRequired') }}</p>
        </div>
      </div>

      <!-- Annotation Overlay -->
      <ARAnnotationOverlay 
        :annotations="annotationTools.annotations"
        :activeAnnotation="annotationTools.activeAnnotation"
      />

      <!-- Right Side Toolbar -->
      <AROverlayToolbar 
        :currentTool="annotationTools.currentTool"
        @set-tool="(tool) => annotationTools.currentTool = tool"
        @undo="annotationTools.undoLastAnnotation"
        @clear="annotationTools.clearAnnotations"
      />
    </div>

    <!-- Session Footer -->
    <SessionFooter @take-screenshot="console.log('Screenshot taken')" @end-session="endSession" />
  </div>
</template>

<style scoped>
.ar-session-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  position: relative;
  background-color: #000;
  overflow: hidden;
}

.camera-container {
  flex-grow: 1;
  position: relative;
  overflow: hidden;
}

.camera-feed {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1rem;
  text-align: center;
}

.ar-surfaces {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.surface-point {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 0 4px rgba(255, 255, 255, 0.5);
}

.light-warning {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  pointer-events: none;
}

.light-warning-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.light-warning-icon {
  width: 120px;
  height: 180px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-outline {
  width: 60px;
  height: 120px;
  border: 2px solid white;
  border-radius: 10px;
}

.dot-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dot-grid::before {
  content: "";
  width: 140px;
  height: 140px;
  position: absolute;
  background-image: radial-gradient(circle, white 2px, transparent 2px);
  background-size: 15px 15px;
  opacity: 0.8;
}
</style>
