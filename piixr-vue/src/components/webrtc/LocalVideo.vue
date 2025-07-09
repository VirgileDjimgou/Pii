<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';

const props = defineProps<{
  stream: MediaStream | null;
  muted?: boolean;
  mirrored?: boolean;
  showControls?: boolean;
}>();

const emit = defineEmits<{
  (e: 'video-error', error: Error): void;
  (e: 'stream-ready'): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isVideoEnabled = ref(true);
const isAudioEnabled = ref(true);

// Watch for stream changes and update the video element
watch(() => props.stream, (newStream) => {
  if (videoRef.value && newStream) {
    try {
      videoRef.value.srcObject = newStream;
      
      // Check if tracks are available
      const videoTracks = newStream.getVideoTracks();
      const audioTracks = newStream.getAudioTracks();
      
      isVideoEnabled.value = videoTracks.length > 0 && videoTracks[0].enabled;
      isAudioEnabled.value = audioTracks.length > 0 && audioTracks[0].enabled;
      
      emit('stream-ready');
    } catch (error) {
      console.error('Error setting video stream:', error);
      emit('video-error', error as Error);
    }
  } else if (videoRef.value) {
    // Clear the video element if no stream
    videoRef.value.srcObject = null;
  }
}, { immediate: true });

// Toggle video track on/off
const toggleVideo = () => {
  if (props.stream) {
    const videoTracks = props.stream.getVideoTracks();
    if (videoTracks.length > 0) {
      const track = videoTracks[0];
      track.enabled = !track.enabled;
      isVideoEnabled.value = track.enabled;
    }
  }
};

// Toggle audio track on/off
const toggleAudio = () => {
  if (props.stream) {
    const audioTracks = props.stream.getAudioTracks();
    if (audioTracks.length > 0) {
      const track = audioTracks[0];
      track.enabled = !track.enabled;
      isAudioEnabled.value = track.enabled;
    }
  }
};

// Handle video element errors
const handleVideoError = (event: Event) => {
  const error = new Error('Video playback error');
  console.error('Local video error:', error);
  emit('video-error', error);
};

onMounted(() => {
  // Set initial stream if available
  if (videoRef.value && props.stream) {
    videoRef.value.srcObject = props.stream;
  }
});

onUnmounted(() => {
  // Clean up video element
  if (videoRef.value) {
    videoRef.value.srcObject = null;
  }
});
</script>

<template>
  <div class="local-video-container">
    <div class="video-wrapper" :class="{ mirrored: mirrored }">
      <video
        ref="videoRef"
        :muted="muted !== false"
        autoplay
        playsinline
        class="local-video"
        @error="handleVideoError"
      />
      
      <!-- Video overlay indicators -->
      <div v-if="!isVideoEnabled" class="video-disabled-overlay">
        <div class="disabled-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 16v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/>
            <path d="M23 16.5V7a2 2 0 0 0-2-2H9"/>
            <path d="M2 2l20 20"/>
          </svg>
        </div>
        <p>Camera Off</p>
      </div>
      
      <!-- Audio indicator -->
      <div v-if="!isAudioEnabled" class="audio-disabled-indicator">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 5a3 3 0 0 1 6 0v3a3 3 0 0 1-6 0z"/>
          <path d="M19 10v2a7 7 0 0 1-7 7m-1-2v2"/>
          <path d="M2 2l20 20"/>
        </svg>
      </div>
    </div>
    
    <!-- Control buttons (optional) -->
    <div v-if="showControls" class="video-controls">
      <button 
        class="control-btn"
        :class="{ disabled: !isVideoEnabled }"
        @click="toggleVideo"
        title="Toggle Camera"
      >
        <svg v-if="isVideoEnabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 7l-7 5 7 5V7z"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M16 16v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2"/>
          <path d="M23 16.5V7a2 2 0 0 0-2-2H9"/>
          <path d="M2 2l20 20"/>
        </svg>
      </button>
      
      <button 
        class="control-btn"
        :class="{ disabled: !isAudioEnabled }"
        @click="toggleAudio"
        title="Toggle Microphone"
      >
        <svg v-if="isAudioEnabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 5a3 3 0 0 1 6 0v3a3 3 0 0 1-6 0z"/>
          <path d="M19 10v2a7 7 0 0 1-7 7m-1-2v2"/>
          <path d="M2 2l20 20"/>
        </svg>
      </button>
    </div>
    
    <!-- Status indicator -->
    <div class="status-indicator">
      <span class="status-dot" :class="{ active: stream }"></span>
      <span class="status-text">{{ stream ? 'Live' : 'No Stream' }}</span>
    </div>
  </div>
</template>

<style scoped>
.local-video-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-wrapper.mirrored .local-video {
  transform: scaleX(-1);
}

.local-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #1a1a1a;
}

.video-disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  z-index: 2;
}

.disabled-icon {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
  opacity: 0.7;
}

.disabled-icon svg {
  width: 100%;
  height: 100%;
}

.video-disabled-overlay p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

.audio-disabled-indicator {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 24px;
  height: 24px;
  background: rgba(239, 68, 68, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 3;
}

.audio-disabled-indicator svg {
  width: 14px;
  height: 14px;
}

.video-controls {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 4;
}

.control-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}

.control-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

.control-btn.disabled {
  background: rgba(239, 68, 68, 0.8);
}

.control-btn.disabled:hover {
  background: rgba(239, 68, 68, 0.9);
}

.control-btn svg {
  width: 18px;
  height: 18px;
}

.status-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(0, 0, 0, 0.7);
  padding: 4px 8px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
  z-index: 3;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
  transition: background-color 0.2s;
}

.status-dot.active {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .video-controls {
    bottom: 8px;
  }
  
  .control-btn {
    width: 36px;
    height: 36px;
  }
  
  .control-btn svg {
    width: 16px;
    height: 16px;
  }
  
  .status-indicator {
    top: 8px;
    right: 8px;
    padding: 3px 6px;
  }
  
  .status-text {
    font-size: 11px;
  }
}
</style>
