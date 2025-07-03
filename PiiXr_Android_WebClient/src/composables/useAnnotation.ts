import { ref } from 'vue'

/**
 * Annotation types for AR markers
 */
export enum AnnotationType {
  POINT = 'point',
  CIRCLE = 'circle',
  ARROW = 'arrow',
  LINE = 'line',
  TEXT = 'text'
}

/**
 * Annotation data interface
 */
export interface Annotation {
  id: string
  type: AnnotationType
  x: number
  y: number
  width?: number
  height?: number
  color: string
  text?: string
  timestamp: Date
}

/**
 * Composable for managing AR annotations and markers
 * Handles drawing, editing, and deleting annotations over camera feed
 */
export function useAnnotation() {
  const annotations = ref<Annotation[]>([])
  const selectedAnnotation = ref<Annotation | null>(null)
  const isDrawing = ref(false)
  const currentTool = ref<AnnotationType>(AnnotationType.POINT)
  const currentColor = ref('#ff0000')
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  
  // Undo/Redo stacks
  const undoStack = ref<Annotation[][]>([])
  const redoStack = ref<Annotation[][]>([])

  /**
   * Generate unique annotation ID
   */
  const generateId = (): string => {
    return `annotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Add annotation to the list
   */
  const addAnnotation = (annotation: Omit<Annotation, 'id' | 'timestamp'>) => {
    // Save current state for undo
    saveStateForUndo()
    
    const newAnnotation: Annotation = {
      ...annotation,
      id: generateId(),
      timestamp: new Date()
    }
    
    annotations.value.push(newAnnotation)
    console.log('Annotation added:', newAnnotation)
    
    // Clear redo stack when new action is performed
    redoStack.value = []
  }

  /**
   * Remove annotation by ID
   */
  const removeAnnotation = (id: string) => {
    saveStateForUndo()
    
    const index = annotations.value.findIndex(a => a.id === id)
    if (index !== -1) {
      annotations.value.splice(index, 1)
      console.log('Annotation removed:', id)
    }
    
    if (selectedAnnotation.value?.id === id) {
      selectedAnnotation.value = null
    }
    
    redoStack.value = []
  }

  /**
   * Clear all annotations
   */
  const clearAllAnnotations = () => {
    if (annotations.value.length > 0) {
      saveStateForUndo()
      annotations.value = []
      selectedAnnotation.value = null
      redoStack.value = []
      console.log('All annotations cleared')
    }
  }

  /**
   * Select annotation for editing
   */
  const selectAnnotation = (annotation: Annotation) => {
    selectedAnnotation.value = annotation
  }

  /**
   * Deselect current annotation
   */
  const deselectAnnotation = () => {
    selectedAnnotation.value = null
  }

  /**
   * Save current state for undo functionality
   */
  const saveStateForUndo = () => {
    undoStack.value.push([...annotations.value])
    
    // Limit undo stack size
    if (undoStack.value.length > 20) {
      undoStack.value.shift()
    }
  }

  /**
   * Undo last action
   */
  const undo = () => {
    if (undoStack.value.length > 0) {
      // Save current state for redo
      redoStack.value.push([...annotations.value])
      
      // Restore previous state
      const previousState = undoStack.value.pop()
      if (previousState) {
        annotations.value = previousState
        selectedAnnotation.value = null
      }
      
      console.log('Undo performed')
    }
  }

  /**
   * Redo last undone action
   */
  const redo = () => {
    if (redoStack.value.length > 0) {
      // Save current state for undo
      saveStateForUndo()
      
      // Restore next state
      const nextState = redoStack.value.pop()
      if (nextState) {
        annotations.value = nextState
        selectedAnnotation.value = null
      }
      
      console.log('Redo performed')
    }
  }

  /**
   * Handle touch/mouse start for drawing
   */
  const startDrawing = (x: number, y: number) => {
    isDrawing.value = true
    
    // Create annotation based on current tool
    const annotation: Omit<Annotation, 'id' | 'timestamp'> = {
      type: currentTool.value,
      x,
      y,
      color: currentColor.value
    }
    
    if (currentTool.value === AnnotationType.CIRCLE) {
      annotation.width = 20
      annotation.height = 20
    }
    
    addAnnotation(annotation)
  }

  /**
   * Handle touch/mouse end for drawing
   */
  const stopDrawing = () => {
    isDrawing.value = false
  }

  /**
   * Set current drawing tool
   */
  const setTool = (tool: AnnotationType) => {
    currentTool.value = tool
    deselectAnnotation()
  }

  /**
   * Set current drawing color
   */
  const setColor = (color: string) => {
    currentColor.value = color
  }

  /**
   * Render all annotations on canvas
   */
  const renderAnnotations = () => {
    if (!canvasRef.value) return
    
    const ctx = canvasRef.value.getContext('2d')
    if (!ctx) return
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
    
    // Draw each annotation
    annotations.value.forEach(annotation => {
      ctx.strokeStyle = annotation.color
      ctx.fillStyle = annotation.color
      ctx.lineWidth = 2
      
      switch (annotation.type) {
        case AnnotationType.POINT:
          ctx.beginPath()
          ctx.arc(annotation.x, annotation.y, 5, 0, 2 * Math.PI)
          ctx.fill()
          break
          
        case AnnotationType.CIRCLE:
          ctx.beginPath()
          ctx.arc(annotation.x, annotation.y, annotation.width || 20, 0, 2 * Math.PI)
          ctx.stroke()
          break
          
        case AnnotationType.ARROW:
          // Draw arrow shape
          ctx.beginPath()
          ctx.moveTo(annotation.x, annotation.y)
          ctx.lineTo(annotation.x + 30, annotation.y - 10)
          ctx.lineTo(annotation.x + 25, annotation.y)
          ctx.lineTo(annotation.x + 30, annotation.y + 10)
          ctx.closePath()
          ctx.stroke()
          break
          
        default:
          // Default to point
          ctx.beginPath()
          ctx.arc(annotation.x, annotation.y, 5, 0, 2 * Math.PI)
          ctx.fill()
      }
      
      // Highlight selected annotation
      if (selectedAnnotation.value?.id === annotation.id) {
        ctx.strokeStyle = '#00ffff'
        ctx.lineWidth = 3
        ctx.strokeRect(annotation.x - 10, annotation.y - 10, 20, 20)
      }
    })
  }

  /**
   * Get annotation at specific coordinates
   */
  const getAnnotationAtPoint = (x: number, y: number): Annotation | null => {
    // Check in reverse order (top to bottom)
    for (let i = annotations.value.length - 1; i >= 0; i--) {
      const annotation = annotations.value[i]
      const distance = Math.sqrt(
        Math.pow(x - annotation.x, 2) + Math.pow(y - annotation.y, 2)
      )
      
      if (distance <= 15) { // 15px tolerance
        return annotation
      }
    }
    return null
  }

  // Computed properties
  const canUndo = ref(false)
  const canRedo = ref(false)
  
  // Watch for changes to update undo/redo availability
  const updateUndoRedo = () => {
    canUndo.value = undoStack.value.length > 0
    canRedo.value = redoStack.value.length > 0
  }

  return {
    // State
    annotations,
    selectedAnnotation,
    isDrawing,
    currentTool,
    currentColor,
    canvasRef,
    canUndo,
    canRedo,
    
    // Methods
    addAnnotation,
    removeAnnotation,
    clearAllAnnotations,
    selectAnnotation,
    deselectAnnotation,
    undo,
    redo,
    startDrawing,
    stopDrawing,
    setTool,
    setColor,
    renderAnnotations,
    getAnnotationAtPoint,
    updateUndoRedo,
    
    // Enums
    AnnotationType
  }
}
