<template>
  <div class="webrtc-session">
    <!-- Session header with call status and controls -->
    <div class="session-header">
      <div class="session-info">
        <h2 class="session-title">
          {{ sessionTitle }}
        </h2>
        <div class="session-status">
          <div :class="['status-indicator', sessionStatusClass]" />
          <span class="status-text">{{ sessionStatusText }}</span>
          <span v-if="callDuration" class="call-duration">{{ formattedDuration }}</span>
        </div>
      </div>
      
      <!-- Main call control buttons -->
      <div class="call-controls">
        <button
          v-if="!isInCall && !isIncomingCall"
          @click="startCall"
          :disabled="!canStartCall"
          class="call-btn start-call"
          title="Start video call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7"/>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
          </svg>
          Start Call
        </button>
        
        <button
          v-if="isIncomingCall"
          @click="acceptCall"
          class="call-btn accept-call"
          title="Accept incoming call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
          </svg>
          Accept
        </button>
        
        <button
          v-if="isIncomingCall"
          @click="rejectCall"
          class="call-btn reject-call"
          title="Reject incoming call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            <line x1="18" y1="6" x2="6" y2="18"/>
          </svg>
          Reject
        </button>
        
        <button
          v-if="isInCall"
          @click="() => endCall()"
          class="call-btn end-call"
          title="End call"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            <line x1="18" y1="6" x2="6" y2="18"/>
          </svg>
          End Call
        </button>
      </div>
    </div>
    
    <!-- Video display area with local and remote streams -->
    <div class="video-container">
      <!-- Remote video takes the main display area -->
      <div class="remote-video-section">
        <RemoteVideo
          :remote-stream="remoteStream"
          :remote-peer-id="remotePeerId"
          :connection-state="connectionState"
          :is-waiting-for-peer="isWaitingForRemotePeer"
          @video-ready="onRemoteVideoReady"
          @stream-started="onRemoteStreamStarted"
          @stream-error="onRemoteStreamError"
        />
      </div>
      
      <!-- Local video in a smaller overlay position -->
      <div class="local-video-section">
        <LocalVideo
          :stream="localStream"
          :muted="isLocalAudioMuted"
          :show-controls="true"
          @video-error="onLocalStreamError"
          @stream-ready="onLocalStreamStarted"
        />
      </div>
    </div>
    
    <!-- Session controls and settings panel -->
    <div v-if="isInCall" class="session-controls">
      <div class="control-group">
        <label class="control-label">Audio Settings</label>
        <div class="control-buttons">
          <button
            @click="toggleLocalAudio"
            :class="['control-btn', { active: !isLocalAudioMuted }]"
            title="Toggle microphone"
          >
            <svg v-if="!isLocalAudioMuted" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12l1.19-1.19A3 3 0 0 0 15 12V4a3 3 0 0 0-3-3 3 3 0 0 0-3 3v5"/>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            {{ isLocalAudioMuted ? 'Unmute' : 'Mute' }}
          </button>
        </div>
      </div>
      
      <div class="control-group">
        <label class="control-label">Video Settings</label>
        <div class="control-buttons">
          <button
            @click="toggleLocalVideo"
            :class="['control-btn', { active: isLocalVideoEnabled }]"
            title="Toggle camera"
          >
            <svg v-if="isLocalVideoEnabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 16l-4-4-4 4V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v11z"/>
              <path d="M23 7l-7 5 7 5V7z"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            {{ isLocalVideoEnabled ? 'Turn Off' : 'Turn On' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Connection status and debugging information -->
    <div v-if="showDebugInfo" class="debug-panel">
      <h3>Connection Debug Info</h3>
      <div class="debug-info">
        <div class="debug-item">
          <strong>Signaling State:</strong> {{ signalingState }}
        </div>
        <div class="debug-item">
          <strong>Connection State:</strong> {{ connectionState }}
        </div>
        <div class="debug-item">
          <strong>ICE Connection State:</strong> {{ iceConnectionState }}
        </div>
        <div class="debug-item">
          <strong>ICE Gathering State:</strong> {{ iceGatheringState }}
        </div>
        <div class="debug-item">
          <strong>Local Peer ID:</strong> {{ localPeerId }}
        </div>
        <div class="debug-item">
          <strong>Remote Peer ID:</strong> {{ remotePeerId }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import LocalVideo from './LocalVideo.vue';
import RemoteVideo from './RemoteVideo.vue';
import { WebRtcService } from '../../services/webrtc/WebRtcService';
import { SignalingService, MqttSignalingService, WebSocketSignalingService } from '../../services/webrtc/SignalingService';

// Component props for configuration and external control
interface Props {
  // Identifier for this peer in the session
  localPeerId?: string;
  // Type of signaling service to use ('mqtt' or 'websocket')
  signalingType?: 'mqtt' | 'websocket';
  // Configuration for the signaling service
  signalingConfig?: {
    mqttBroker?: string;
    mqttTopic?: string;
    websocketUrl?: string;
  };
  // Whether to show debugging information
  showDebugInfo?: boolean;
  // STUN/TURN server configuration for NAT traversal
  iceServers?: RTCIceServer[];
}

const props = withDefaults(defineProps<Props>(), {
  localPeerId: () => `peer_${Date.now()}`,
  signalingType: 'mqtt',
  signalingConfig: () => ({}),
  showDebugInfo: false,
  iceServers: () => [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
});

// Events emitted to parent for session lifecycle notifications
interface Emits {
  // Session state change events
  sessionStarted: [localPeerId: string];
  sessionEnded: [reason: string];
  callStarted: [remotePeerId: string];
  callEnded: [reason: string];
  // Error events
  error: [error: Error];
  // Stream events
  localStreamReady: [stream: MediaStream];
  remoteStreamReady: [stream: MediaStream];
}

const emit = defineEmits<Emits>();

// Core service instances for WebRTC and signaling
let webrtcService: WebRtcService | null = null;
let signalingService: SignalingService | null = null;

// Component state management
const localStream = ref<MediaStream | null>(null);
const remoteStream = ref<MediaStream | null>(null);
const remotePeerId = ref<string>('');

// Call state tracking
const isInCall = ref(false);
const isIncomingCall = ref(false);
const isWaitingForRemotePeer = ref(false);
const callStartTime = ref<Date | null>(null);
const callDuration = ref(0);

// Media control state
const isLocalAudioMuted = ref(false);
const isLocalVideoEnabled = ref(true);

// Connection state from WebRTC peer connection
const signalingState = ref<RTCSignalingState>('stable');
const connectionState = ref<RTCPeerConnectionState>('new');
const iceConnectionState = ref<RTCIceConnectionState>('new');
const iceGatheringState = ref<RTCIceGatheringState>('new');

// Computed properties for reactive UI state
const sessionTitle = computed(() => {
  if (isInCall.value) {
    return `Video Call${remotePeerId.value ? ` with ${remotePeerId.value}` : ''}`;
  }
  if (isIncomingCall.value) {
    return `Incoming Call${remotePeerId.value ? ` from ${remotePeerId.value}` : ''}`;
  }
  return 'Video Call Session';
});

const sessionStatusClass = computed(() => {
  if (isInCall.value) return 'status-connected';
  if (isIncomingCall.value) return 'status-incoming';
  return 'status-idle';
});

const sessionStatusText = computed(() => {
  if (isInCall.value) return 'In Call';
  if (isIncomingCall.value) return 'Incoming Call';
  return 'Ready';
});

const canStartCall = computed(() => {
  return localStream.value !== null && !isInCall.value && !isIncomingCall.value;
});

const formattedDuration = computed(() => {
  const minutes = Math.floor(callDuration.value / 60);
  const seconds = callDuration.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Timer for tracking call duration
let callTimer: number | null = null;

const startCallTimer = () => {
  callStartTime.value = new Date();
  callDuration.value = 0;
  
  callTimer = window.setInterval(() => {
    if (callStartTime.value) {
      callDuration.value = Math.floor((Date.now() - callStartTime.value.getTime()) / 1000);
    }
  }, 1000);
};

const stopCallTimer = () => {
  if (callTimer) {
    clearInterval(callTimer);
    callTimer = null;
  }
  callStartTime.value = null;
  callDuration.value = 0;
};

// Initialize the WebRTC and signaling services
const initializeServices = async () => {
  try {
    // Create the appropriate signaling service based on configuration
    if (props.signalingType === 'mqtt') {
      signalingService = new MqttSignalingService(
        'webrtc_session',
        props.localPeerId
      );
    } else {
      signalingService = new WebSocketSignalingService(
        'webrtc_session',
        props.localPeerId,
        props.signalingConfig.websocketUrl || 'ws://localhost:8080/signaling'
      );
    }
    
    // Set up signaling callbacks for handling different message types
    signalingService.setCallbacks({
      onOffer: async (offer: RTCSessionDescriptionInit, senderId: string) => {
        console.log('Received offer from:', senderId);
        remotePeerId.value = senderId;
        isIncomingCall.value = true;
        // Store the offer for when user accepts the call
        (window as any)._pendingOffer = offer;
      },
      
      onAnswer: async (answer: RTCSessionDescriptionInit) => {
        console.log('Received answer');
        if (webrtcService) {
          await webrtcService.setRemoteAnswer(answer);
        }
      },
      
      onIceCandidate: async (candidate: RTCIceCandidateInit) => {
        console.log('Received ICE candidate');
        if (webrtcService) {
          await webrtcService.addIceCandidate(new RTCIceCandidate(candidate));
        }
      },
      
      onCallRequest: (senderId: string) => {
        console.log('Call request from:', senderId);
        remotePeerId.value = senderId;
        isIncomingCall.value = true;
      },
      
      onCallAccept: () => {
        console.log('Call accepted');
        isWaitingForRemotePeer.value = false;
      },
      
      onCallReject: () => {
        console.log('Call rejected');
        endCall('Call rejected by remote peer');
      },
      
      onCallEnd: () => {
        console.log('Call ended by remote peer');
        endCall('Call ended by remote peer');
      },
      
      onError: (error: Error) => {
        console.error('Signaling error:', error);
        emit('error', error);
      }
    });
    
    // Connect to the signaling service
    await signalingService.connect();
    
    // Create WebRTC service with ICE server configuration
    webrtcService = new WebRtcService({
      iceServers: props.iceServers,
      mediaConstraints: {
        video: true,
        audio: true
      }
    });
    
    // Set up WebRTC event handlers for connection management
    webrtcService.onRemoteStream = (stream: MediaStream) => {
      console.log('Received remote stream');
      remoteStream.value = stream;
      emit('remoteStreamReady', stream);
    };
    
    webrtcService.onIceCandidate = (candidate: RTCIceCandidate) => {
      // Send ICE candidates to remote peer via signaling
      if (signalingService && remotePeerId.value) {
        signalingService.sendIceCandidate(candidate, remotePeerId.value);
      }
    };
    
    webrtcService.onConnectionStateChange = (state: RTCPeerConnectionState) => {
      connectionState.value = state;
      console.log('Connection state changed:', state);
      
      // Handle connection state changes for call management
      if (state === 'connected' && !isInCall.value) {
        isInCall.value = true;
        isWaitingForRemotePeer.value = false;
        startCallTimer();
        emit('callStarted', remotePeerId.value);
      } else if (state === 'disconnected' || state === 'failed') {
        if (isInCall.value) {
          endCall('Connection lost');
        }
      }
    };
    
    // Initialize local media stream for video calling
    await initializeLocalMedia();
    
    console.log('WebRTC session initialized successfully');
    emit('sessionStarted', props.localPeerId);
    
  } catch (error) {
    console.error('Failed to initialize WebRTC session:', error);
    emit('error', error as Error);
  }
};

// Set up local camera and microphone access
const initializeLocalMedia = async () => {
  try {
    // Get local media stream and set it up with WebRTC service
    if (webrtcService) {
      localStream.value = await webrtcService.initializeLocalMedia();
      emit('localStreamReady', localStream.value);
    }
    
  } catch (error) {
    console.error('Failed to initialize local media:', error);
    emit('error', error as Error);
  }
};

// Initiate a new outgoing call
const startCall = async () => {
  if (!webrtcService || !signalingService || !canStartCall.value) return;
  
  try {
    isWaitingForRemotePeer.value = true;
    
    // For demo purposes, we'll use a generic remote peer ID
    // In a real app, this would come from user selection or routing
    remotePeerId.value = 'remote_peer';
    
    // Create peer connection and offer
    await webrtcService.createPeerConnection();
    const offer = await webrtcService.createOffer();
    
    // Send the offer via signaling
    await signalingService.sendOffer(offer, remotePeerId.value);
    console.log('Call offer sent');
    
  } catch (error) {
    console.error('Failed to start call:', error);
    isWaitingForRemotePeer.value = false;
    emit('error', error as Error);
  }
};

// Accept an incoming call
const acceptCall = async () => {
  if (!webrtcService || !signalingService || !isIncomingCall.value) return;
  
  try {
    // Get the stored offer from the incoming call
    const offer = (window as any)._pendingOffer;
    if (!offer) {
      throw new Error('No pending offer found');
    }
    
    // Create peer connection, set remote description and create answer
    await webrtcService.createPeerConnection();
    const answer = await webrtcService.createAnswer(offer);
    
    // Send the answer back via signaling
    await signalingService.sendAnswer(answer, remotePeerId.value);
    
    // Clear the incoming call state
    isIncomingCall.value = false;
    isWaitingForRemotePeer.value = true;
    
    console.log('Call accepted and answer sent');
    
  } catch (error) {
    console.error('Failed to accept call:', error);
    isIncomingCall.value = false;
    emit('error', error as Error);
  }
};

// Reject an incoming call
const rejectCall = async () => {
  if (!signalingService || !isIncomingCall.value) return;
  
  try {
    // Send call reject via signaling
    await signalingService.rejectCall(remotePeerId.value);
    
    // Clear incoming call state
    isIncomingCall.value = false;
    remotePeerId.value = '';
    
    console.log('Call rejected');
    
  } catch (error) {
    console.error('Failed to reject call:', error);
    emit('error', error as Error);
  }
};

// End the current call
const endCall = async (reason: string = 'Call ended') => {
  try {
    // Notify remote peer if we have an active connection
    if (signalingService && remotePeerId.value && (isInCall.value || isIncomingCall.value)) {
      await signalingService.endCall(remotePeerId.value);
    }
    
    // Close the WebRTC connection
    if (webrtcService) {
      webrtcService.closePeerConnection();
    }
    
    // Clean up call state
    isInCall.value = false;
    isIncomingCall.value = false;
    isWaitingForRemotePeer.value = false;
    remoteStream.value = null;
    remotePeerId.value = '';
    
    stopCallTimer();
    
    console.log('Call ended:', reason);
    emit('callEnded', reason);
    
  } catch (error) {
    console.error('Error ending call:', error);
    emit('error', error as Error);
  }
};

// Toggle local audio mute/unmute
const toggleLocalAudio = () => {
  if (!localStream.value) return;
  
  const audioTracks = localStream.value.getAudioTracks();
  audioTracks.forEach(track => {
    track.enabled = isLocalAudioMuted.value;
  });
  
  isLocalAudioMuted.value = !isLocalAudioMuted.value;
  console.log('Local audio', isLocalAudioMuted.value ? 'muted' : 'unmuted');
};

// Toggle local video on/off
const toggleLocalVideo = () => {
  if (!localStream.value) return;
  
  const videoTracks = localStream.value.getVideoTracks();
  videoTracks.forEach(track => {
    track.enabled = !isLocalVideoEnabled.value;
  });
  
  isLocalVideoEnabled.value = !isLocalVideoEnabled.value;
  console.log('Local video', isLocalVideoEnabled.value ? 'enabled' : 'disabled');
};

// Event handlers for video component interactions
const onRemoteVideoReady = () => {
  console.log('Remote video element ready');
};

const onLocalStreamStarted = () => {
  console.log('Local video stream started');
};

const onRemoteStreamStarted = () => {
  console.log('Remote video stream started');
};

const onLocalStreamError = (error: Error) => {
  console.error('Local video stream error:', error);
  emit('error', error);
};

const onRemoteStreamError = (error: Error) => {
  console.error('Remote video stream error:', error);
  emit('error', error);
};

// Component lifecycle management
onMounted(async () => {
  await initializeServices();
});

onUnmounted(async () => {
  // Clean up all resources when component is destroyed
  
  // End any active call
  if (isInCall.value || isIncomingCall.value) {
    await endCall('Session ended');
  }
  
  // Stop call timer
  stopCallTimer();
  
  // Close WebRTC connection
  if (webrtcService) {
    webrtcService.closePeerConnection();
  }
  
  // Disconnect signaling service
  if (signalingService) {
    await signalingService.disconnect();
  }
  
  // Stop local media streams
  if (localStream.value) {
    localStream.value.getTracks().forEach(track => {
      track.stop();
    });
  }
  
  console.log('WebRTC session cleaned up');
  emit('sessionEnded', 'Component unmounted');
});
</script>

<style scoped>
.webrtc-session {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.session-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.session-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.session-status {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-idle { background-color: #6b7280; }
.status-connected { background-color: #22c55e; }
.status-incoming { background-color: #f59e0b; animation: pulse 1.5s infinite; }

.status-text {
  font-weight: 500;
}

.call-duration {
  font-family: monospace;
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.call-controls {
  display: flex;
  gap: 12px;
}

.call-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.call-btn svg {
  width: 18px;
  height: 18px;
}

.start-call {
  background: #22c55e;
  color: white;
}

.start-call:hover:not(:disabled) {
  background: #16a34a;
  transform: translateY(-1px);
}

.start-call:disabled {
  background: #6b7280;
  cursor: not-allowed;
}

.accept-call {
  background: #22c55e;
  color: white;
}

.accept-call:hover {
  background: #16a34a;
}

.reject-call, .end-call {
  background: #ef4444;
  color: white;
}

.reject-call:hover, .end-call:hover {
  background: #dc2626;
}

.video-container {
  flex: 1;
  position: relative;
  display: flex;
  min-height: 0;
}

.remote-video-section {
  flex: 1;
  position: relative;
}

.local-video-section {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 240px;
  height: 180px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.session-controls {
  display: flex;
  gap: 24px;
  padding: 20px 24px;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.control-buttons {
  display: flex;
  gap: 8px;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.control-btn.active {
  background: rgba(34, 197, 94, 0.3);
  border-color: #22c55e;
}

.control-btn svg {
  width: 14px;
  height: 14px;
}

.debug-panel {
  padding: 16px 24px;
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.8rem;
}

.debug-panel h3 {
  margin: 0 0 12px 0;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.debug-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.debug-item {
  color: rgba(255, 255, 255, 0.7);
}

.debug-item strong {
  color: white;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .session-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .call-controls {
    justify-content: center;
  }
  
  .local-video-section {
    width: 160px;
    height: 120px;
    bottom: 100px;
    right: 12px;
  }
  
  .session-controls {
    flex-direction: column;
    gap: 16px;
  }
  
  .debug-info {
    grid-template-columns: 1fr;
  }
}
</style>
