<template>
  <div class="home-page">
    <!-- Main action section with large button inspired by Shazam -->
    <div class="main-action">
      <div class="action-circle">
        <button class="main-button" @click="startDetection">
          <div class="button-icon">
            <i class="fas fa-camera"></i>
          </div>
          <span class="button-text">Start Detection</span>
        </button>
      </div>
      <p class="action-description">
        Tap to start AI-powered object detection
      </p>
    </div>

    <!-- Camera preview section integrated with existing components -->
    <div class="camera-section" v-if="isDetecting">
      <div class="camera-container">
        <CameraPreview />
        <DetectionOverlay />
      </div>
      <button class="stop-button" @click="stopDetection">
        <i class="fas fa-stop"></i>
        Stop Detection
      </button>
    </div>

    <!-- Native camera controls (only shown in native app) -->
    <div class="native-controls" v-if="isNativeApp && !isDetecting">
      <div class="native-buttons">
        <button class="native-button camera-button" @click="takeNativePhoto">
          <i class="fas fa-camera"></i>
          <span>Take Photo</span>
        </button>
        <button class="native-button gallery-button" @click="selectFromGallery">
          <i class="fas fa-images"></i>
          <span>From Gallery</span>
        </button>
      </div>
      <p class="native-description">
        Use native camera or select from gallery for enhanced detection
      </p>
    </div>

    <!-- Quick stats section -->
    <div class="stats-section" v-if="!isDetecting">
      <div class="stat-card">
        <div class="stat-number">{{ totalDetections }}</div>
        <div class="stat-label">Total Detections</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ todayDetections }}</div>
        <div class="stat-label">Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ accuracy }}%</div>
        <div class="stat-label">Accuracy</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CameraPreview from './CameraPreview.vue'
import DetectionOverlay from './DetectionOverlay.vue'
import { CapacitorCameraService } from '../services/CapacitorCameraService'

// Track detection state
const isDetecting = ref(false)
const isNativeApp = ref(false)

// Enhanced camera service that supports both web and native
const cameraService = new CapacitorCameraService()

// Mock statistics data - in a real app this would come from a store or API
const totalDetections = ref(247)
const todayDetections = ref(12)
const accuracy = ref(94)

// Check if we're running in a native environment
isNativeApp.value = cameraService.isNativeEnvironment()

// Start the detection process using existing camera components
const startDetection = () => {
  isDetecting.value = true
  // The CameraPreview component will handle camera initialization
}

// Stop detection and return to main view
const stopDetection = () => {
  isDetecting.value = false
  // Camera cleanup is handled by CameraPreview component's onUnmounted
}

// Native camera photo capture - only available in native app
const takeNativePhoto = async () => {
  try {
    const photoBase64 = await cameraService.takePhoto()
    if (photoBase64) {
      console.log('Photo captured successfully:', photoBase64.substring(0, 50) + '...')
      // In a real app, this would trigger AI detection on the photo
      // and add the result to history
    }
  } catch (error) {
    console.error('Error taking photo:', error)
  }
}

// Select photo from gallery - only available in native app
const selectFromGallery = async () => {
  try {
    const photoBase64 = await cameraService.selectFromGallery()
    if (photoBase64) {
      console.log('Photo selected successfully:', photoBase64.substring(0, 50) + '...')
      // In a real app, this would trigger AI detection on the selected photo
    }
  } catch (error) {
    console.error('Error selecting photo:', error)
  }
}
</script>

<style scoped>
.home-page {
  padding: 20px;
  padding-bottom: 100px; /* Extra space for content */
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

/* Main action button inspired by Shazam's design */
.main-action {
  text-align: center;
  margin: 40px 0 60px 0;
}

.action-circle {
  position: relative;
  display: inline-block;
  margin-bottom: 20px;
}

.main-button {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 50%, #2c5aa0 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 8px 30px rgba(66, 153, 225, 0.4);
  position: relative;
}

.main-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(66, 153, 225, 0.5);
}

.main-button:active {
  transform: translateY(-2px);
}

.button-icon {
  font-size: 48px;
  margin-bottom: 8px;
}

.button-text {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.action-description {
  color: #64748b;
  font-size: 16px;
  margin: 0;
  font-weight: 500;
}

/* Camera section styling */
.camera-section {
  margin: 30px 0;
  text-align: center;
}

.camera-container {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  margin-bottom: 20px;
  background: #000;
}

.stop-button {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(229, 62, 62, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
}

.stop-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
}

/* Statistics section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin: 40px 0;
}

.stat-card {
  background: white;
  padding: 25px 15px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Native camera controls styling */
.native-controls {
  margin: 30px 0;
  text-align: center;
}

.native-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 15px;
}

.native-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: white;
  border: 2px solid #e2e8f0;
  padding: 20px 25px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  color: #4a5568;
  font-size: 14px;
  font-weight: 600;
  min-width: 120px;
}

.native-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  border-color: #4299e1;
  color: #4299e1;
}

.native-button i {
  font-size: 24px;
  margin-bottom: 8px;
}

.camera-button:hover {
  border-color: #48bb78;
  color: #48bb78;
}

.gallery-button:hover {
  border-color: #ed8936;
  color: #ed8936;
}

.native-description {
  color: #64748b;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
}

/* Responsive design for mobile devices */
@media (max-width: 480px) {
  .home-page {
    padding: 15px;
  }
  
  .main-button {
    width: 160px;
    height: 160px;
  }
  
  .button-icon {
    font-size: 40px;
  }
  
  .button-text {
    font-size: 14px;
  }
  
  .stats-section {
    gap: 12px;
  }
  
  .stat-card {
    padding: 20px 10px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .native-buttons {
    flex-direction: column;
    gap: 15px;
  }
  
  .native-button {
    min-width: auto;
    padding: 18px 20px;
  }
}
</style>
