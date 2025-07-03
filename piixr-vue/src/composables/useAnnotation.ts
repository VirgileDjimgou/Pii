import { ref, reactive } from 'vue';

export interface Annotation {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'freehand' | 'text';
  color: string;
  points: { x: number, y: number }[];
  text?: string;
  timestamp: number;
}

export function useAnnotation() {
  const annotations = reactive<Annotation[]>([]);
  const activeAnnotation = ref<Annotation | null>(null);
  const isDrawing = ref(false);
  const currentTool = ref<Annotation['type']>('arrow');
  const currentColor = ref('#FF3B30'); // Default color (red)

  // Available colors for annotations
  const availableColors = [
    '#FF3B30', // Red
    '#007AFF', // Blue
    '#4CD964', // Green
    '#FFCC00', // Yellow
    '#FFFFFF', // White
  ];

  // Start a new annotation
  const startAnnotation = (x: number, y: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    const newAnnotation: Annotation = {
      id,
      type: currentTool.value,
      color: currentColor.value,
      points: [{ x, y }],
      timestamp: Date.now()
    };
    
    activeAnnotation.value = newAnnotation;
    isDrawing.value = true;
  };

  // Continue drawing the current annotation
  const updateAnnotation = (x: number, y: number) => {
    if (!isDrawing.value || !activeAnnotation.value) return;
    
    activeAnnotation.value.points.push({ x, y });
  };

  // Finish and save the current annotation
  const finishAnnotation = () => {
    if (!activeAnnotation.value) return;
    
    annotations.push({ ...activeAnnotation.value });
    activeAnnotation.value = null;
    isDrawing.value = false;
  };

  // Add a text annotation
  const addTextAnnotation = (x: number, y: number, text: string) => {
    if (!text.trim()) return;
    
    const id = Math.random().toString(36).substring(2, 9);
    annotations.push({
      id,
      type: 'text',
      color: currentColor.value,
      points: [{ x, y }],
      text,
      timestamp: Date.now()
    });
  };

  // Delete an annotation by ID
  const deleteAnnotation = (id: string) => {
    const index = annotations.findIndex(a => a.id === id);
    if (index !== -1) {
      annotations.splice(index, 1);
    }
  };

  // Delete all annotations
  const clearAnnotations = () => {
    annotations.splice(0, annotations.length);
  };

  // Undo last annotation
  const undoLastAnnotation = () => {
    if (annotations.length > 0) {
      annotations.pop();
    }
  };

  return {
    annotations,
    activeAnnotation,
    isDrawing,
    currentTool,
    currentColor,
    availableColors,
    startAnnotation,
    updateAnnotation,
    finishAnnotation,
    addTextAnnotation,
    deleteAnnotation,
    clearAnnotations,
    undoLastAnnotation
  };
}
