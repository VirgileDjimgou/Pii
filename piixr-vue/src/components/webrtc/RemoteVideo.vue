<template>
  <div class="remote-video-container">
    <!-- Remote video element for displaying the peer's stream -->
    <video
      ref="videoElement"
      class="remote-video"
      autoplay
      playsinline
      :muted="false"
    />
    
    <!-- Status overlay showing connection and stream information -->
    <div v-if="showStatusOverlay" class="status-overlay">
      <div class="status-content">
        <!-- Connection status indicator -->
        <div class="connection-status">
          <div 
            :class="['status-indicator', connectionStatusClass]"
            :title="connectionStatusText"
          />
          <span class="status-text">{{ connectionStatusText }}</span>
        </div>
        
        <!-- Remote peer information display -->
        <div v-if="remotePeerId" class="peer-info">
          <span class="peer-label">Remote Peer:</span>
          <span class="peer-id">{{ remotePeerId }}</span>
        </div>
        
        <!-- Stream quality and stats information -->
        <div v-if="streamStats" class="stream-stats">
          <div class="stat-item">
            <span class="stat-label">Resolution:</span>
            <span class="stat-value">{{ streamStats.resolution }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Bitrate:</span>
            <span class="stat-value">{{ streamStats.bitrate }}</span>
          </div>
        </div>
      </div>
      
      <!-- Toggle button to hide/show the overlay -->
      <button 
        class="toggle-overlay-btn"
        @click="toggleStatusOverlay"
        title="Toggle status overlay"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </button>
    </div>
    
    <!-- Loading state when waiting for remote stream -->
    <div v-if="!hasRemoteStream && isWaitingForPeer" class="waiting-overlay">
      <div class="waiting-content">
        <div class="loading-spinner">
          <div class="spinner-ring"></div>
        </div>
        <h3>Waiting for remote peer...</h3>
        <p>Connecting to the other participant's video stream</p>
      </div>
    </div>
    
    <!-- No stream placeholder when peer is not connected -->
    <div v-if="!hasRemoteStream && !isWaitingForPeer" class="no-stream-placeholder">
      <div class="placeholder-content">
        <div class="placeholder-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 7l-7 5 7 5V7z"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </div>
        <h3>No remote video</h3>
        <p>The other participant hasn't joined yet</p>
      </div>
    </div>
    
    <!-- Audio-only indicator when video is disabled but audio is available -->
    <div v-if="hasRemoteStream && !hasRemoteVideo && hasRemoteAudio" class="audio-only-overlay">
      <div class="audio-only-content">
        <div class="audio-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="11 5,6 9,2 9,2 15,6 15,11 19,11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
        </div>
        <h3>Audio Only</h3>
        <p>{{ remotePeerId || 'Remote peer' }} has disabled their camera</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';

// Component props for external control and configuration
interface Props {
  // The MediaStream from the remote peer to display
  remoteStream?: MediaStream | null;
  // Identifier for the remote peer (for display purposes)
  remotePeerId?: string;
  // Current connection state for status display
  connectionState?: RTCPeerConnectionState;
  // Whether we're actively waiting for a peer to connect
  isWaitingForPeer?: boolean;
  // Controls visibility of the status overlay
  showStatus?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  remoteStream: null,
  remotePeerId: '',
  connectionState: 'new',
  isWaitingForPeer: false,
  showStatus: true
});

// Events emitted to parent component for interaction
interface Emits {
  // Fired when the video element is ready for stream attachment
  videoReady: [element: HTMLVideoElement];
  // Fired when stream playback starts successfully
  streamStarted: [];
  // Fired when there's an error with stream playback
  streamError: [error: Error];
}

const emit = defineEmits<Emits>();

// Template refs for DOM element access
const videoElement = ref<HTMLVideoElement | null>(null);

// Internal component state
const showStatusOverlay = ref(props.showStatus);
const streamStats = ref<{
  resolution: string;
  bitrate: string;
} | null>(null);

// Computed properties for reactive stream analysis
const hasRemoteStream = computed(() => {
  return props.remoteStream && props.remoteStream.getTracks().length > 0;
});

const hasRemoteVideo = computed(() => {
  return props.remoteStream?.getVideoTracks().some(track => track.enabled) || false;
});

const hasRemoteAudio = computed(() => {
  return props.remoteStream?.getAudioTracks().some(track => track.enabled) || false;
});

// Convert connection state to user-friendly status information
const connectionStatusClass = computed(() => {
  switch (props.connectionState) {
    case 'connected': return 'status-connected';
    case 'connecting': return 'status-connecting';
    case 'disconnected': return 'status-disconnected';
    case 'failed': return 'status-failed';
    default: return 'status-new';
  }
});

const connectionStatusText = computed(() => {
  switch (props.connectionState) {
    case 'connected': return 'Connected';
    case 'connecting': return 'Connecting...';
    case 'disconnected': return 'Disconnected';
    case 'failed': return 'Connection Failed';
    case 'closed': return 'Connection Closed';
    default: return 'Waiting';
  }
});

// Attach the remote stream to the video element for playback
const attachStream = async () => {
  if (!videoElement.value || !props.remoteStream) return;

  try {
    // Set the stream as the video source
    videoElement.value.srcObject = props.remoteStream;
    
    // Wait for the video to be ready and start playing
    await videoElement.value.play();
    
    // Notify parent that stream playback has started
    emit('streamStarted');
    
    // Start monitoring stream statistics
    startStatsMonitoring();
    
  } catch (error) {
    console.error('Error attaching remote stream:', error);
    emit('streamError', error as Error);
  }
};

// Remove the stream from the video element
const detachStream = () => {
  if (videoElement.value) {
    videoElement.value.srcObject = null;
    stopStatsMonitoring();
  }
};

// Monitor stream quality and statistics
let statsInterval: number | null = null;

const startStatsMonitoring = () => {
  if (statsInterval) return;
  
  // Update stream stats every 2 seconds
  statsInterval = window.setInterval(() => {
    updateStreamStats();
  }, 2000);
};

const stopStatsMonitoring = () => {
  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
  }
  streamStats.value = null;
};

// Gather and update current stream statistics
const updateStreamStats = () => {
  if (!videoElement.value || !props.remoteStream) return;

  const videoTrack = props.remoteStream.getVideoTracks()[0];
  if (!videoTrack) return;

  // Get video element dimensions for resolution display
  const { videoWidth, videoHeight } = videoElement.value;
  
  // Update the stats display with current information
  streamStats.value = {
    resolution: videoWidth && videoHeight ? `${videoWidth}x${videoHeight}` : 'Unknown',
    bitrate: 'Measuring...' // In a real implementation, you'd get this from WebRTC stats
  };
};

// Toggle the visibility of the status overlay
const toggleStatusOverlay = () => {
  showStatusOverlay.value = !showStatusOverlay.value;
};

// Watch for changes in the remote stream and update display accordingly
watch(
  () => props.remoteStream,
  (newStream, oldStream) => {
    // Clean up the previous stream if it exists
    if (oldStream) {
      detachStream();
    }
    
    // Attach the new stream if provided
    if (newStream) {
      attachStream();
    }
  },
  { immediate: true }
);

// Component lifecycle management
onMounted(() => {
  // Notify parent that the video element is ready for use
  if (videoElement.value) {
    emit('videoReady', videoElement.value);
  }
  
  // Attach stream if it was provided during initial mount
  if (props.remoteStream) {
    attachStream();
  }
});

onUnmounted(() => {
  // Clean up resources when component is destroyed
  detachStream();
  stopStatsMonitoring();
});
</script>

<style scoped>
.remote-video-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.remote-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: #000;
}

.status-overlay {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 12px;
  color: white;
  font-size: 0.9rem;
  z-index: 10;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-connected { background-color: #22c55e; }
.status-connecting { background-color: #f59e0b; animation: pulse 1.5s infinite; }
.status-disconnected { background-color: #ef4444; }
.status-failed { background-color: #dc2626; }
.status-new { background-color: #6b7280; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-weight: 500;
}

.peer-info {
  display: flex;
  gap: 8px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
}

.peer-label {
  font-weight: 500;
}

.peer-id {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.stream-stats {
  display: flex;
  gap: 16px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
}

.stat-item {
  display: flex;
  gap: 4px;
}

.stat-label {
  font-weight: 500;
}

.toggle-overlay-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toggle-overlay-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.toggle-overlay-btn svg {
  width: 16px;
  height: 16px;
}

.waiting-overlay,
.no-stream-placeholder,
.audio-only-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  z-index: 5;
}

.waiting-content,
.placeholder-content,
.audio-only-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
}

.loading-spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top: 3px solid #be4df3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.placeholder-icon,
.audio-icon {
  width: 64px;
  height: 64px;
  color: rgba(255, 255, 255, 0.5);
}

.placeholder-icon svg,
.audio-icon svg {
  width: 100%;
  height: 100%;
}

.waiting-content h3,
.placeholder-content h3,
.audio-only-content h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.waiting-content p,
.placeholder-content p,
.audio-only-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}
</style>
