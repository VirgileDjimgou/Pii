<script setup lang="ts">
import { computed } from 'vue';
import type { Annotation } from '../../composables/useAnnotation';

defineProps<{
  annotations: Annotation[];
  activeAnnotation: Annotation | null;
}>();
</script>

<template>
  <div class="annotation-overlay">
    <!-- Render completed annotations -->
    <svg class="annotation-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Render each annotation -->
      <template v-for="annotation in annotations" :key="annotation.id">
        <!-- Arrow annotations -->
        <template v-if="annotation.type === 'arrow' && annotation.points.length >= 2">
          <path 
            :d="generateArrowPath(annotation.points)"
            :stroke="annotation.color"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </template>
        
        <!-- Circle annotations -->
        <template v-else-if="annotation.type === 'circle' && annotation.points.length >= 2">
          <circle
            :cx="annotation.points[0].x"
            :cy="annotation.points[0].y"
            :r="calculateDistance(annotation.points[0], annotation.points[annotation.points.length - 1])"
            :stroke="annotation.color"
            fill="none"
            stroke-width="3"
          />
        </template>
        
        <!-- Rectangle annotations -->
        <template v-else-if="annotation.type === 'rectangle' && annotation.points.length >= 2">
          <rect
            :x="Math.min(annotation.points[0].x, annotation.points[annotation.points.length - 1].x)"
            :y="Math.min(annotation.points[0].y, annotation.points[annotation.points.length - 1].y)"
            :width="Math.abs(annotation.points[annotation.points.length - 1].x - annotation.points[0].x)"
            :height="Math.abs(annotation.points[annotation.points.length - 1].y - annotation.points[0].y)"
            :stroke="annotation.color"
            fill="none"
            stroke-width="3"
          />
        </template>
        
        <!-- Freehand annotations -->
        <template v-else-if="annotation.type === 'freehand' && annotation.points.length >= 2">
          <polyline
            :points="pointsToString(annotation.points)"
            :stroke="annotation.color"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </template>
        
        <!-- Text annotations -->
        <template v-else-if="annotation.type === 'text' && annotation.points.length >= 1">
          <text
            :x="annotation.points[0].x"
            :y="annotation.points[0].y"
            :fill="annotation.color"
            font-size="16"
          >
            {{ annotation.text }}
          </text>
        </template>
      </template>
      
      <!-- Render active annotation being drawn -->
      <template v-if="activeAnnotation && activeAnnotation.points.length >= 1">
        <!-- Arrow being drawn -->
        <template v-if="activeAnnotation.type === 'arrow' && activeAnnotation.points.length >= 2">
          <path 
            :d="generateArrowPath(activeAnnotation.points)"
            :stroke="activeAnnotation.color"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="5,5"
          />
        </template>
        
        <!-- Circle being drawn -->
        <template v-else-if="activeAnnotation.type === 'circle' && activeAnnotation.points.length >= 2">
          <circle
            :cx="activeAnnotation.points[0].x"
            :cy="activeAnnotation.points[0].y"
            :r="calculateDistance(activeAnnotation.points[0], activeAnnotation.points[activeAnnotation.points.length - 1])"
            :stroke="activeAnnotation.color"
            fill="none"
            stroke-width="3"
            stroke-dasharray="5,5"
          />
        </template>
        
        <!-- Rectangle being drawn -->
        <template v-else-if="activeAnnotation.type === 'rectangle' && activeAnnotation.points.length >= 2">
          <rect
            :x="Math.min(activeAnnotation.points[0].x, activeAnnotation.points[activeAnnotation.points.length - 1].x)"
            :y="Math.min(activeAnnotation.points[0].y, activeAnnotation.points[activeAnnotation.points.length - 1].y)"
            :width="Math.abs(activeAnnotation.points[activeAnnotation.points.length - 1].x - activeAnnotation.points[0].x)"
            :height="Math.abs(activeAnnotation.points[activeAnnotation.points.length - 1].y - activeAnnotation.points[0].y)"
            :stroke="activeAnnotation.color"
            fill="none"
            stroke-width="3"
            stroke-dasharray="5,5"
          />
        </template>
        
        <!-- Freehand being drawn -->
        <template v-else-if="activeAnnotation.type === 'freehand' && activeAnnotation.points.length >= 2">
          <polyline
            :points="pointsToString(activeAnnotation.points)"
            :stroke="activeAnnotation.color"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </template>
      </template>
    </svg>
  </div>
</template>

<script lang="ts">
function pointsToString(points: { x: number, y: number }[]): string {
  return points.map(point => `${point.x},${point.y}`).join(' ');
}

function calculateDistance(point1: { x: number, y: number }, point2: { x: number, y: number }): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function generateArrowPath(points: { x: number, y: number }[]): string {
  if (points.length < 2) return '';
  
  const start = points[0];
  const end = points[points.length - 1];
  
  // Calculate arrow head
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const headLength = 15;
  
  const head1x = end.x - headLength * Math.cos(angle - Math.PI / 6);
  const head1y = end.y - headLength * Math.sin(angle - Math.PI / 6);
  const head2x = end.x - headLength * Math.cos(angle + Math.PI / 6);
  const head2y = end.y - headLength * Math.sin(angle + Math.PI / 6);
  
  return `M ${start.x} ${start.y} L ${end.x} ${end.y} M ${head1x} ${head1y} L ${end.x} ${end.y} L ${head2x} ${head2y}`;
}

export default {
  methods: {
    pointsToString,
    calculateDistance,
    generateArrowPath
  }
};
</script>

<style scoped>
.annotation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.annotation-svg {
  width: 100%;
  height: 100%;
}
</style>
