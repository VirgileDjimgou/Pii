<!-- filepath: c:\Users\djimg\source\repos\ClarifAI\ClarifAI_VueClient\src\components\DetectionOverlay.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

const drawOverlay = () => {
  const canvas = canvasRef.value;
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Example: Draw a rectangle and label
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(50, 50, 200, 100);
      ctx.fillStyle = 'red';
      ctx.font = '16px Arial';
      ctx.fillText('Object Label', 60, 45);
    }
  }
};

onMounted(() => {
  drawOverlay();
});
</script>

<template>
  <div class="detection-overlay">
    <canvas ref="canvasRef" width="640" height="480"></canvas>
  </div>
</template>

<style scoped>
.detection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
canvas {
  width: 100%;
  height: auto;
}
</style>