<script setup lang="ts">
import { computed } from 'vue';
import type { Annotation } from '../../composables/useAnnotation';

const props = defineProps<{
  annotations: Annotation[];
  activeAnnotation: Annotation | null;
}>();

// Helper functions that are safe to use in template
const pointsToString = (points: { x: number, y: number }[]): string => {
  if (!points || points.length === 0) return '';
  return points.map(point => `${point.x},${point.y}`).join(' ');
};

const calculateDistance = (point1: { x: number, y: number }, point2: { x: number, y: number }): number => {
  if (!point1 || !point2) return 0;
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const generateArrowPath = (points: { x: number, y: number }[]): string => {
  if (!points || points.length < 2) return '';
  
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
};

// Safe computed properties for template use
const safeAnnotations = computed(() => props.annotations || []);
const safeActiveAnnotation = computed(() => props.activeAnnotation);
</script>

<template>
  <div class="annotation-overlay">
    <!-- Render completed annotations -->
    <svg class="annotation-svg" xmlns="http://www.w3.org/2000/svg">
      <!-- Render each annotation -->
      <template v-for="annotation in safeAnnotations" :key="annotation.id">
        <!-- Arrow annotations -->
        <template v-if="annotation.type === 'arrow' && annotation.points && annotation.points.length >= 2">
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
        <template v-else-if="annotation.type === 'circle' && annotation.points && annotation.points.length >= 2">
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
        <template v-else-if="annotation.type === 'rectangle' && annotation.points && annotation.points.length >= 2">
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
        <template v-else-if="annotation.type === 'freehand' && annotation.points && annotation.points.length >= 2">
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
        <template v-else-if="annotation.type === 'text' && annotation.points && annotation.points.length >= 1">
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
      <template v-if="safeActiveAnnotation && safeActiveAnnotation.points && safeActiveAnnotation.points.length >= 1">
        <!-- Arrow being drawn -->
        <template v-if="safeActiveAnnotation.type === 'arrow' && safeActiveAnnotation.points.length >= 2">
          <path 
            :d="generateArrowPath(safeActiveAnnotation.points)"
            :stroke="safeActiveAnnotation.color"
            fill="none"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="5,5"
          />
        </template>
        
        <!-- Circle being drawn -->
        <template v-else-if="safeActiveAnnotation.type === 'circle' && safeActiveAnnotation.points.length >= 2">
          <circle
            :cx="safeActiveAnnotation.points[0].x"
            :cy="safeActiveAnnotation.points[0].y"
            :r="calculateDistance(safeActiveAnnotation.points[0], safeActiveAnnotation.points[safeActiveAnnotation.points.length - 1])"
            :stroke="safeActiveAnnotation.color"
            fill="none"
            stroke-width="3"
            stroke-dasharray="5,5"
          />
        </template>
        
        <!-- Rectangle being drawn -->
        <template v-else-if="safeActiveAnnotation.type === 'rectangle' && safeActiveAnnotation.points.length >= 2">
          <rect
            :x="Math.min(safeActiveAnnotation.points[0].x, safeActiveAnnotation.points[safeActiveAnnotation.points.length - 1].x)"
            :y="Math.min(safeActiveAnnotation.points[0].y, safeActiveAnnotation.points[safeActiveAnnotation.points.length - 1].y)"
            :width="Math.abs(safeActiveAnnotation.points[safeActiveAnnotation.points.length - 1].x - safeActiveAnnotation.points[0].x)"
            :height="Math.abs(safeActiveAnnotation.points[safeActiveAnnotation.points.length - 1].y - safeActiveAnnotation.points[0].y)"
            :stroke="safeActiveAnnotation.color"
            fill="none"
            stroke-width="3"
            stroke-dasharray="5,5"
          />
        </template>
        
        <!-- Freehand being drawn -->
        <template v-else-if="safeActiveAnnotation.type === 'freehand' && safeActiveAnnotation.points.length >= 2">
          <polyline
            :points="pointsToString(safeActiveAnnotation.points)"
            :stroke="safeActiveAnnotation.color"
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
