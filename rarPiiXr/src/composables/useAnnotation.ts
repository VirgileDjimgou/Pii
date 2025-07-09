import { ref, reactive } from 'vue';

// 3D point interface for world coordinates
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 2D point interface for screen coordinates (backward compatibility)
export interface Point2D {
  x: number;
  y: number;
}

// Enhanced annotation interface supporting both 2D and 3D coordinates
export interface Annotation {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'freehand' | 'text';
  color: string;
  // Legacy 2D points for backward compatibility
  points: Point2D[];
  // New 3D world coordinates
  worldPoints?: Point3D[];
  // Camera pose when annotation was created (for 3D positioning)
  cameraPose?: {
    position: Point3D;
    rotation: Point3D;
    projectionMatrix: number[];
    viewMatrix: number[];
  };
  text?: string;
  timestamp: number;
  // Scale factor for proper 3D sizing
  scale?: number;
  // Whether this annotation uses 3D positioning
  is3D?: boolean;
}

export function useAnnotation() {
  const annotations = reactive<Annotation[]>([]);
  const activeAnnotation = ref<Annotation | null>(null);
  const isDrawing = ref(false);
  const currentTool = ref<Annotation['type']>('arrow');
  const currentColor = ref('#FF3B30'); // Default color (red)
  const enable3D = ref(false); // Toggle for 3D mode
  
  // Available colors for annotations
  const availableColors = [
    '#FF3B30', // Red
    '#007AFF', // Blue
    '#4CD964', // Green
    '#FFCC00', // Yellow
    '#FFFFFF', // White
  ];
  
  // Reference to 3D AR system (will be set by parent component)
  const ar3DSystem = ref<any>(null);
  
  // Set the 3D AR system reference
  const setAR3DSystem = (system: any) => {
    ar3DSystem.value = system;
  };
  
  // Start a new annotation
  const startAnnotation = (x: number, y: number) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    const newAnnotation: Annotation = {
      id,
      type: currentTool.value,
      color: currentColor.value,
      points: [{ x, y }],
      timestamp: Date.now(),
      is3D: enable3D.value,
      scale: 1.0
    };
    
    // If 3D mode is enabled, calculate world coordinates
    if (enable3D.value && ar3DSystem.value) {
      const worldPoint = ar3DSystem.value.screenToWorld(x, y, 2);
      newAnnotation.worldPoints = [worldPoint];
      newAnnotation.cameraPose = ar3DSystem.value.currentCameraPose.value;
    }
    
    activeAnnotation.value = newAnnotation;
    isDrawing.value = true;
  };
  
  // Continue drawing the current annotation
  const updateAnnotation = (x: number, y: number) => {
    if (!isDrawing.value || !activeAnnotation.value) return;
    
    // Add 2D point
    activeAnnotation.value.points.push({ x, y });
    
    // Add 3D point if in 3D mode
    if (enable3D.value && ar3DSystem.value) {
      const worldPoint = ar3DSystem.value.screenToWorld(x, y, 2);
      if (!activeAnnotation.value.worldPoints) {
        activeAnnotation.value.worldPoints = [];
      }
      activeAnnotation.value.worldPoints.push(worldPoint);
    }
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
    const newAnnotation: Annotation = {
      id,
      type: 'text',
      color: currentColor.value,
      points: [{ x, y }],
      text,
      timestamp: Date.now(),
      is3D: enable3D.value,
      scale: 1.0
    };
    
    // If 3D mode is enabled, calculate world coordinates
    if (enable3D.value && ar3DSystem.value) {
      const worldPoint = ar3DSystem.value.screenToWorld(x, y, 2);
      newAnnotation.worldPoints = [worldPoint];
      newAnnotation.cameraPose = ar3DSystem.value.currentCameraPose.value;
    }
    
    annotations.push(newAnnotation);
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
    enable3D,
    startAnnotation,
    updateAnnotation,
    finishAnnotation,
    addTextAnnotation,
    deleteAnnotation,
    clearAnnotations,
    undoLastAnnotation,
    setAR3DSystem
  };
}
