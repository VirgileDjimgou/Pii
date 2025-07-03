import { ref, onMounted, onUnmounted } from 'vue';

export function useCameraFeed() {
  const videoElement = ref<HTMLVideoElement | null>(null);
  const isStreaming = ref(false);
  const hasPermission = ref(false);
  const isMounted = ref(false);
  const errorMessage = ref<string | null>(null);

  // Camera constraints
  const constraints = {
    video: {
      facingMode: 'environment', // Use the back camera
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    },
    audio: false
  };

  // Initialize the camera feed
  const initCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      errorMessage.value = 'Camera API not supported in this browser';
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoElement.value) {
        videoElement.value.srcObject = stream;
        hasPermission.value = true;
        videoElement.value.onloadedmetadata = () => {
          isStreaming.value = true;
        };
      }
    } catch (err) {
      errorMessage.value = `Camera access error: ${err instanceof Error ? err.message : String(err)}`;
      hasPermission.value = false;
    }
  };

  // Stop the camera feed
  const stopCamera = () => {
    if (videoElement.value && videoElement.value.srcObject) {
      const stream = videoElement.value.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach((track) => {
        track.stop();
      });
      
      videoElement.value.srcObject = null;
      isStreaming.value = false;
    }
  };

  // Take screenshot from the camera feed
  const takeScreenshot = (): string | null => {
    if (!videoElement.value || !isStreaming.value) return null;
    
    // Create a canvas element to capture the screenshot
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return null;
    
    canvas.width = videoElement.value.videoWidth;
    canvas.height = videoElement.value.videoHeight;
    context.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height);
    
    // Return the screenshot as a data URL
    return canvas.toDataURL('image/png');
  };

  onMounted(() => {
    isMounted.value = true;
    // Don't automatically start camera to respect user privacy
  });

  onUnmounted(() => {
    stopCamera();
    isMounted.value = false;
  });

  return {
    videoElement,
    isStreaming,
    hasPermission,
    errorMessage,
    initCamera,
    stopCamera,
    takeScreenshot
  };
}
