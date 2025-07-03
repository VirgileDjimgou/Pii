<!-- filepath: c:\Users\djimg\source\repos\ClarifAI\ClarifAI_VueClient\src\components\CameraPreview.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { CameraService } from '../services/CameraService';

const videoRef = ref<HTMLVideoElement | null>(null);
const cameraService = new CameraService();

const startCamera = async () => {
  try {
    const stream = await cameraService.startCamera();
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.play();
    }
  } catch (error) {
    console.error('Error starting camera:', error);
  }
};

const stopCamera = () => {
  cameraService.stopCamera();
};

onMounted(() => {
  startCamera();
});

onUnmounted(() => {
  stopCamera();
});
</script>

<template>
  <div class="camera-preview">
    <video ref="videoRef" class="w-100" autoplay playsinline></video>
    <button class="btn btn-primary mt-3" @click="stopCamera">Stop Camera</button>
  </div>
</template>

<style scoped>
.camera-preview {
  position: relative;
  width: 100%;
  height: auto;
  overflow: hidden;
}
video {
  width: 100%;
  height: auto;
}
</style>