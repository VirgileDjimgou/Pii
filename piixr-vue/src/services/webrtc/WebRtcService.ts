/**
 * WebRTC Service
 * 
 * This service handles the core WebRTC functionality including peer connections,
 * media streams, and ICE candidate management. It provides a clean interface
 * for establishing real-time audio/video communication between peers.
 */

export interface MediaStreamConstraints {
  video: boolean | MediaTrackConstraints;
  audio: boolean | MediaTrackConstraints;
}

export interface WebRtcConfig {
  iceServers: RTCIceServer[];
  mediaConstraints: MediaStreamConstraints;
}

export interface PeerConnectionState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState;
  iceConnectionState: RTCIceConnectionState;
  isConnected: boolean;
}

export class WebRtcService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private config: WebRtcConfig;
  
  // Event callbacks that can be set by the consuming component
  public onLocalStream?: (stream: MediaStream) => void;
  public onRemoteStream?: (stream: MediaStream) => void;
  public onConnectionStateChange?: (state: RTCPeerConnectionState) => void;
  public onIceCandidate?: (candidate: RTCIceCandidate) => void;
  public onDataChannelMessage?: (message: string) => void;
  
  constructor(config?: Partial<WebRtcConfig>) {
    // Default configuration with Google's public STUN servers
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      mediaConstraints: {
        video: true,
        audio: true
      },
      ...config
    };
  }
  
  /**
   * Initialize the local media stream by accessing user's camera and microphone.
   * This must be called first before establishing any peer connections.
   */
  async initializeLocalMedia(): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia(this.config.mediaConstraints);
      
      // Notify the component that local stream is ready
      if (this.onLocalStream) {
        this.onLocalStream(this.localStream);
      }
      
      console.log('Local media stream initialized successfully');
      return this.localStream;
    } catch (error) {
      console.error('Failed to access local media:', error);
      throw new Error('Could not access camera or microphone. Please check permissions.');
    }
  }
  
  /**
   * Create and configure the RTCPeerConnection with all necessary event handlers.
   * This sets up the foundation for peer-to-peer communication.
   */
  createPeerConnection(): RTCPeerConnection {
    if (this.peerConnection) {
      this.closePeerConnection();
    }
    
    this.peerConnection = new RTCPeerConnection({ iceServers: this.config.iceServers });
    
    // Handle incoming remote media streams
    this.peerConnection.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        
        // Notify the component about the remote stream
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      }
    };
    
    // Handle ICE candidates for NAT traversal
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Generated ICE candidate:', event.candidate.candidate);
        
        // Send the candidate to the remote peer via signaling
        if (this.onIceCandidate) {
          this.onIceCandidate(event.candidate);
        }
      }
    };
    
    // Monitor connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState;
      console.log('Peer connection state changed to:', state);
      
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange(state);
      }
    };
    
    // Handle ICE connection state changes
    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection!.iceConnectionState;
      console.log('ICE connection state changed to:', state);
    };
    
    // Add local stream tracks to the peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });
    }
    
    return this.peerConnection;
  }
  
  /**
   * Create an SDP offer to initiate the connection with a remote peer.
   * This is typically called by the peer who starts the call.
   */
  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized. Call createPeerConnection() first.');
    }
    
    try {
      const offer = await this.peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await this.peerConnection.setLocalDescription(offer);
      console.log('Created and set local offer');
      
      return offer;
    } catch (error) {
      console.error('Failed to create offer:', error);
      throw error;
    }
  }
  
  /**
   * Create an SDP answer in response to a received offer.
   * This is called by the peer who receives the call.
   */
  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized. Call createPeerConnection() first.');
    }
    
    try {
      await this.peerConnection.setRemoteDescription(offer);
      
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      
      console.log('Created and set local answer');
      return answer;
    } catch (error) {
      console.error('Failed to create answer:', error);
      throw error;
    }
  }
  
  /**
   * Set the remote description when receiving an answer from the remote peer.
   */
  async setRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    
    try {
      await this.peerConnection.setRemoteDescription(answer);
      console.log('Set remote answer successfully');
    } catch (error) {
      console.error('Failed to set remote answer:', error);
      throw error;
    }
  }
  
  /**
   * Add an ICE candidate received from the remote peer.
   * This helps with NAT traversal and connection establishment.
   */
  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('Peer connection not initialized');
    }
    
    try {
      await this.peerConnection.addIceCandidate(candidate);
      console.log('Added ICE candidate successfully');
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
      throw error;
    }
  }
  
  /**
   * Toggle the enabled state of the local video track.
   */
  toggleVideo(): boolean {
    if (!this.localStream) return false;
    
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      console.log('Video toggled:', videoTrack.enabled ? 'on' : 'off');
      return videoTrack.enabled;
    }
    return false;
  }
  
  /**
   * Toggle the enabled state of the local audio track.
   */
  toggleAudio(): boolean {
    if (!this.localStream) return false;
    
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      console.log('Audio toggled:', audioTrack.enabled ? 'on' : 'off');
      return audioTrack.enabled;
    }
    return false;
  }
  
  /**
   * Get the current state of the WebRTC connection and streams.
   */
  getState(): PeerConnectionState {
    return {
      localStream: this.localStream,
      remoteStream: this.remoteStream,
      connectionState: this.peerConnection?.connectionState || 'new',
      iceConnectionState: this.peerConnection?.iceConnectionState || 'new',
      isConnected: this.peerConnection?.connectionState === 'connected'
    };
  }
  
  /**
   * Close the peer connection and stop all media tracks.
   * This should be called when ending the call or component unmounting.
   */
  closePeerConnection(): void {
    // Stop all local media tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped ${track.kind} track`);
      });
      this.localStream = null;
    }
    
    // Close the peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      console.log('Peer connection closed');
    }
    
    // Clear remote stream reference
    this.remoteStream = null;
  }
  
  /**
   * Check if the local stream has been initialized.
   */
  hasLocalStream(): boolean {
    return this.localStream !== null;
  }
  
  /**
   * Check if there's an active remote stream.
   */
  hasRemoteStream(): boolean {
    return this.remoteStream !== null;
  }
  
  /**
   * Get the local media stream if available.
   */
  getLocalStream(): MediaStream | null {
    return this.localStream;
  }
  
  /**
   * Get the remote media stream if available.
   */
  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}
