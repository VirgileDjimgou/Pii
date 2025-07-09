<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { useAR3D } from '../../composables/useAR3D';
import { Annotation3DRenderer } from './Annotation3DRenderer';
import type { Annotation } from '../../composables/useAnnotation';

const props = defineProps<{
  annotations: Annotation[];
  activeAnnotation: Annotation | null;
  enable3D: boolean;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const ar3D = useAR3D();
const renderer3D = ref<Annotation3DRenderer | null>(null);
const isInitialized = ref(false);

// Development mode check
const isDev = computed(() => import.meta.env.DEV);

// Initialize 3D AR system
const initialize = async () => {
  if (!canvasRef.value || !props.enable3D) return;
  
  try {
    const success = await ar3D.initializeAR(canvasRef.value);
    if (success && ar3D.scene.value) {
      renderer3D.value = new Annotation3DRenderer(ar3D.scene.value);
      isInitialized.value = true;
      
      // Start render loop
      startRenderLoop();
    }
  } catch (error) {
    console.error('Failed to initialize 3D AR:', error);
  }
};

// Render loop
let renderLoopId: number | null = null;
const startRenderLoop = () => {
  const render = () => {
    if (ar3D.isTracking.value && ar3D.renderer.value) {
      ar3D.render();
    }
    renderLoopId = requestAnimationFrame(render);
  };
  render();
};

const stopRenderLoop = () => {
  if (renderLoopId) {
    cancelAnimationFrame(renderLoopId);
    renderLoopId = null;
  }
};

// Watch for changes in annotations
watch(() => props.annotations, (newAnnotations) => {
  if (!renderer3D.value || !props.enable3D) return;
  
  // Clear and recreate all annotations
  renderer3D.value.clearAll();
  
  newAnnotations.forEach(annotation => {
    if (annotation.is3D && annotation.worldPoints) {
      renderer3D.value?.createAnnotation(annotation);
    }
  });
}, { deep: true });

// Watch for changes in active annotation
watch(() => props.activeAnnotation, (newActiveAnnotation) => {
  if (!renderer3D.value || !props.enable3D) return;
  
  if (newActiveAnnotation && newActiveAnnotation.is3D && newActiveAnnotation.worldPoints) {
    renderer3D.value.createAnnotation(newActiveAnnotation);
  }
}, { deep: true });

// Watch for 3D mode toggle
watch(() => props.enable3D, (enable3D) => {
  if (enable3D) {
    nextTick(() => initialize());
  } else {
    cleanup();
  }
});

// Cleanup
const cleanup = () => {
  stopRenderLoop();
  if (renderer3D.value) {
    renderer3D.value.dispose();
    renderer3D.value = null;
  }
  ar3D.cleanup();
  isInitialized.value = false;
};

// Resize handler
const handleResize = () => {
  if (!canvasRef.value || !ar3D.renderer.value || !ar3D.camera.value) return;
  
  const canvas = canvasRef.value;
  const rect = canvas.getBoundingClientRect();
  
  canvas.width = rect.width;
  canvas.height = rect.height;
  
  ar3D.renderer.value.setSize(rect.width, rect.height);
  ar3D.camera.value.aspect = rect.width / rect.height;
  ar3D.camera.value.updateProjectionMatrix();
};

onMounted(() => {
  if (props.enable3D) {
    initialize();
  }
  
  // Add resize listener
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  cleanup();
  window.removeEventListener('resize', handleResize);
});

// Expose methods for parent component
defineExpose({
  screenToWorld: ar3D.screenToWorld,
  worldToScreen: ar3D.worldToScreen,
  hitTest: ar3D.hitTest,
  isTracking: ar3D.isTracking,
  currentCameraPose: ar3D.currentCameraPose
});
</script>

<template>
  <div class="ar-3d-overlay" v-if="enable3D">
    <canvas
      ref="canvasRef"
      class="ar-3d-canvas"
      :style="{ display: isInitialized ? 'block' : 'none' }"
    />
    
    <!-- Loading indicator -->
    <div v-if="!isInitialized" class="ar-3d-loading">
      <div class="loading-spinner"></div>
      <p>Initializing 3D AR...</p>
    </div>
    
    <!-- Debug info (only in development) -->
    <div v-if="isInitialized && isDev" class="ar-3d-debug">
      <p>AR Tracking: {{ ar3D.isTracking.value ? 'Active' : 'Inactive' }}</p>
      <p>3D Annotations: {{ annotations.filter(a => a.is3D).length }}</p>
      <p v-if="ar3D.currentCameraPose.value">
        Camera: {{ Math.round(ar3D.currentCameraPose.value.position.x * 100) / 100 }}, 
        {{ Math.round(ar3D.currentCameraPose.value.position.y * 100) / 100 }}, 
        {{ Math.round(ar3D.currentCameraPose.value.position.z * 100) / 100 }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.ar-3d-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 15;
}

.ar-3d-canvas {
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.ar-3d-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
  background: rgba(0, 0, 0, 0.7);
  padding: 20px;
  border-radius: 10px;
  z-index: 20;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ar-3d-debug {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  font-family: monospace;
  z-index: 25;
}

.ar-3d-debug p {
  margin: 0 0 5px 0;
}
</style>
