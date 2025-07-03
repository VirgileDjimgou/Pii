import { ref, onUnmounted } from 'vue'
import { CapacitorCameraService } from '../services/CapacitorCameraService'

/**
 * Composable for managing camera feed in AR sessions
 * Handles both web and native camera functionality
 */
export function useCameraFeed() {
  const videoRef = ref<HTMLVideoElement | null>(null)
  const isStreamActive = ref(false)
  const hasError = ref(false)
  const errorMessage = ref('')
  const needsMoreLight = ref(false)
  
  const cameraService = new CapacitorCameraService()
  let stream: MediaStream | null = null

  /**
   * Initialize camera stream and bind to video element
   */
  const startCameraFeed = async () => {
    try {
      hasError.value = false
      errorMessage.value = ''
      
      stream = await cameraService.startCamera()
      
      if (videoRef.value && stream) {
        videoRef.value.srcObject = stream
        await videoRef.value.play()
        isStreamActive.value = true
        
        // Monitor light conditions (mock implementation)
        monitorLightLevels()
      }
    } catch (error) {
      console.error('Failed to start camera feed:', error)
      hasError.value = true
      errorMessage.value = error instanceof Error ? error.message : 'Camera access failed'
    }
  }

  /**
   * Stop camera stream and cleanup
   */
  const stopCameraFeed = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      stream = null
    }
    
    if (videoRef.value) {
      videoRef.value.srcObject = null
    }
    
    isStreamActive.value = false
    needsMoreLight.value = false
  }

  /**
   * Mock light level monitoring
   * In a real implementation, this would analyze video frames
   */
  const monitorLightLevels = () => {
    // Simulate light detection after 3 seconds
    setTimeout(() => {
      needsMoreLight.value = Math.random() > 0.7 // 30% chance of low light
    }, 3000)
  }

  /**
   * Capture photo using native camera (if available)
   */
  const capturePhoto = async (): Promise<string | null> => {
    try {
      return await cameraService.takePhoto()
    } catch (error) {
      console.error('Failed to capture photo:', error)
      return null
    }
  }

  /**
   * Check if running in native environment
   */
  const isNativeEnvironment = () => {
    return cameraService.isNativeEnvironment()
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopCameraFeed()
  })

  return {
    // Refs
    videoRef,
    isStreamActive,
    hasError,
    errorMessage,
    needsMoreLight,
    
    // Methods
    startCameraFeed,
    stopCameraFeed,
    capturePhoto,
    isNativeEnvironment
  }
}
