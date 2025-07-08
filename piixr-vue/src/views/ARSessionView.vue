<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
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
  // Stop camera feed before navigating away
  // This ensures the camera is stopped even if the user clicks the end session button
  stopCamera();
  
  // Additional cleanup for any remaining media tracks
  if (videoElement.value && videoElement.value.srcObject) {
    const stream = videoElement.value.srcObject as MediaStream;
    stream.getTracks().forEach(track => {
      track.stop();
    });
    videoElement.value.srcObject = null;
  }
  
  // Navigate back to home
  router.push('/');
};

// Retry camera access
const retryCamera = () => {
  initCamera();
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

// Guard to ensure camera is stopped when leaving the route
// This provides additional safety in case the component unmount doesn't happen properly
onBeforeRouteLeave(() => {
  // Stop camera feed before navigating away
  stopCamera();
  
  // Force stop any remaining media tracks to prevent camera staying active
  if (videoElement.value && videoElement.value.srcObject) {
    const stream = videoElement.value.srcObject as MediaStream;
    stream.getTracks().forEach(track => {
      track.stop();
    });
    videoElement.value.srcObject = null;
  }
  
  // Allow navigation to continue
  return true;
});

// Store cleanup function for event listeners
let cleanupEventListeners: (() => void) | null = null;

onMounted(() => {
  // Initialize camera when component mounts
  initCamera();
  
  // Set a timeout to dismiss the light warning after 5 seconds (for demo)
  setTimeout(() => {
    showLightWarning.value = false;
  }, 5000);
  
  // Add event listener for browser tab close/refresh to stop camera
  // This ensures camera is stopped even if user closes tab or refreshes page
  const handleBeforeUnload = () => {
    stopCamera();
    if (videoElement.value && videoElement.value.srcObject) {
      const stream = videoElement.value.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        track.stop();
      });
    }
  };
  
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Store cleanup function to remove the event listener later
  cleanupEventListeners = () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
});

onUnmounted(() => {
  // Clean up camera feed when component unmounts
  stopCamera();
  
  // Additional cleanup: directly stop any remaining media tracks
  // This ensures that even if the stopCamera function misses something,
  // we forcefully stop all active media tracks to prevent camera staying active
  if (videoElement.value && videoElement.value.srcObject) {
    const stream = videoElement.value.srcObject as MediaStream;
    stream.getTracks().forEach(track => {
      track.stop();
    });
    videoElement.value.srcObject = null;
  }
  
  // Remove event listeners to prevent memory leaks
  if (cleanupEventListeners) {
    cleanupEventListeners();
    cleanupEventListeners = null;
  }
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
        <div class="error-content">
          <div class="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
              <line x1="3" y1="3" x2="21" y2="21"/>
            </svg>
          </div>
          <h3>Camera Access Required</h3>
          <p v-if="errorMessage.includes('Permission denied')">
            Please allow camera access to use AR features. Click "Allow" when prompted by your browser.
          </p>
          <p v-else-if="errorMessage.includes('not supported')">
            Camera access is not supported in this browser. Please try using Chrome, Firefox, or Safari.
          </p>
          <p v-else>
            {{ errorMessage }}
          </p>
          
          <div class="error-actions">
            <button class="retry-button" @click="retryCamera">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M3 21v-5h5"/>
              </svg>
              Try Again
            </button>
            <button class="back-button" @click="endSession">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 12H5"/>
                <path d="M12 19l-7-7 7-7"/>
              </svg>
              Go Back
            </button>
          </div>
          
          <div class="help-text">
            <details>
              <summary>Need help with camera permissions?</summary>
              <div class="help-content">
                <p><strong>Chrome/Edge:</strong> Click the camera icon in the address bar and select "Always allow"</p>
                <p><strong>Firefox:</strong> Click "Allow" when prompted, or check permissions in site settings</p>
                <p><strong>Safari:</strong> Go to Safari > Settings > Websites > Camera and allow access</p>
                <p><strong>Mobile:</strong> Check your browser's camera permissions in device settings</p>
              </div>
            </details>
          </div>
        </div>
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

      <!-- Light Warning with Dynamic Animation -->
      <div v-if="showLightWarning" class="light-warning">
        <div class="light-warning-content">
          <div class="light-warning-icon">
            <!-- Animated spotlight that moves across the scene -->
            <div class="spotlight-beam"></div>
            <!-- Pulsing ambient glow that breathes with the warning -->
            <div class="ambient-glow"></div>
            <!-- Moving light particles that orbit around the phone -->
            <div class="light-particles">
              <div class="particle" v-for="i in 6" :key="`particle-${i}`" 
                :style="{ '--particle-delay': `${i * 0.5}s` }"></div>
            </div>
            <!-- Enhanced phone outline with subtle glow -->
            <div class="phone-outline enhanced"></div>
            <!-- Animated dot grid that pulses with light intensity -->
            <div class="dot-grid animated"></div>
          </div>
          <p class="warning-text">{{ translate('app.lightRequired') }}</p>
        </div>
      </div>

      <!-- Annotation Overlay -->
      <ARAnnotationOverlay 
        :annotations="annotationTools.annotations"
        :activeAnnotation="annotationTools.activeAnnotation.value"
      />

      <!-- Right Side Toolbar -->
      <AROverlayToolbar 
        :currentTool="annotationTools.currentTool.value"
        @set-tool="(tool) => annotationTools.currentTool.value = tool"
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
  background-color: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 1rem;
  text-align: center;
  z-index: 100;
}

.error-content {
  max-width: 500px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.error-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  color: #ef4444;
}

.error-icon svg {
  width: 100%;
  height: 100%;
}

.error-content h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
  color: white;
}

.error-content p {
  margin-bottom: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.retry-button,
.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
}

.retry-button {
  background: #be4df3;
  color: white;
}

.retry-button:hover {
  background: #a855f7;
  transform: translateY(-2px);
}

.back-button {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.retry-button svg,
.back-button svg {
  width: 20px;
  height: 20px;
}

.help-text {
  margin-top: 1rem;
  text-align: left;
}

.help-text details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.help-text summary {
  cursor: pointer;
  color: #be4df3;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.help-content {
  padding-top: 1rem;
}

.help-content p {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.help-content strong {
  color: white;
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
  /* Subtle background animation that breathes with the warning */
  animation: backgroundPulse 4s ease-in-out infinite;
}

@keyframes backgroundPulse {
  0%, 100% { background-color: rgba(0, 0, 0, 0.7); }
  50% { background-color: rgba(0, 0, 0, 0.8); }
}

.light-warning-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  /* Content gently floats up and down */
  animation: floatContent 3s ease-in-out infinite;
}

@keyframes floatContent {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
}

.light-warning-icon {
  width: 120px;
  height: 180px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  /* Icon container has subtle rotation to create depth */
  animation: iconSway 6s ease-in-out infinite;
}

@keyframes iconSway {
  0%, 100% { transform: rotate(0deg) scale(1); }
  25% { transform: rotate(1deg) scale(1.02); }
  75% { transform: rotate(-1deg) scale(0.98); }
}

/* Animated spotlight that sweeps across the scene */
.spotlight-beam {
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  background: conic-gradient(
    from 0deg,
    transparent 0deg,
    rgba(255, 255, 255, 0.1) 30deg,
    rgba(255, 255, 255, 0.2) 60deg,
    rgba(255, 255, 255, 0.1) 90deg,
    transparent 120deg,
    transparent 360deg
  );
  border-radius: 50%;
  animation: spotlightRotate 8s linear infinite;
  z-index: 1;
}

@keyframes spotlightRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pulsing ambient glow that creates atmospheric lighting */
.ambient-glow {
  position: absolute;
  top: -30px;
  left: -30px;
  right: -30px;
  bottom: -30px;
  background: radial-gradient(
    circle,
    rgba(255, 255, 255, 0.15) 0%,
    rgba(255, 255, 255, 0.08) 30%,
    rgba(255, 255, 255, 0.03) 60%,
    transparent 100%
  );
  border-radius: 50%;
  animation: ambientPulse 3s ease-in-out infinite;
  z-index: 0;
}

@keyframes ambientPulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.6;
  }
  50% { 
    transform: scale(1.2); 
    opacity: 1;
  }
}

/* Light particles that orbit around the phone */
.light-particles {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  /* Each particle orbits at a different speed and radius */
  animation: orbitParticle 4s linear infinite;
  animation-delay: var(--particle-delay, 0s);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
}

.particle:nth-child(odd) {
  animation-duration: 3s;
  animation-direction: reverse;
}

.particle:nth-child(3n) {
  animation-duration: 5s;
  transform: translate(-50%, -50%) scale(0.7);
}

@keyframes orbitParticle {
  from {
    transform: translate(-50%, -50%) rotate(0deg) translateX(40px) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(360deg) translateX(40px) rotate(-360deg);
  }
}

.phone-outline {
  width: 60px;
  height: 120px;
  border: 2px solid white;
  border-radius: 10px;
  position: relative;
  z-index: 3;
  transition: all 0.3s ease;
}

/* Enhanced phone outline with dynamic glow */
.phone-outline.enhanced {
  border-color: rgba(255, 255, 255, 0.9);
  box-shadow: 
    0 0 10px rgba(255, 255, 255, 0.3),
    inset 0 0 10px rgba(255, 255, 255, 0.1);
  animation: phonePulse 2s ease-in-out infinite;
}

@keyframes phonePulse {
  0%, 100% { 
    box-shadow: 
      0 0 10px rgba(255, 255, 255, 0.3),
      inset 0 0 10px rgba(255, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 
      0 0 20px rgba(255, 255, 255, 0.5),
      inset 0 0 15px rgba(255, 255, 255, 0.2);
  }
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
  z-index: 1;
}

.dot-grid::before {
  content: "";
  width: 140px;
  height: 140px;
  position: absolute;
  background-image: radial-gradient(circle, white 2px, transparent 2px);
  background-size: 15px 15px;
  opacity: 0.8;
  transition: all 0.3s ease;
}

/* Animated dot grid that responds to light changes */
.dot-grid.animated::before {
  animation: dotGridPulse 2.5s ease-in-out infinite;
}

@keyframes dotGridPulse {
  0%, 100% { 
    opacity: 0.6;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.05);
  }
}

/* Enhanced warning text with subtle glow */
.warning-text {
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  animation: textGlow 3s ease-in-out infinite;
}

@keyframes textGlow {
  0%, 100% { 
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
  }
  50% { 
    text-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  }
}
</style>
