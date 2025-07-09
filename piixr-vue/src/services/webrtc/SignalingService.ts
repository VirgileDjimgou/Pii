/**
 * Signaling Service
 * 
 * This service handles the signaling layer for WebRTC communication. It abstracts
 * the transport mechanism (MQTT, WebSocket, etc.) and provides a clean interface
 * for exchanging SDP offers/answers and ICE candidates between peers.
 */

export type SignalingMessageType = 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-accept' | 'call-reject' | 'call-end';

export interface SignalingMessage {
  type: SignalingMessageType;
  sessionId: string;
  senderId: string;
  targetId: string;
  data?: any;
  timestamp: number;
}

export interface SignalingCallbacks {
  onOffer?: (offer: RTCSessionDescriptionInit, senderId: string) => void;
  onAnswer?: (answer: RTCSessionDescriptionInit, senderId: string) => void;
  onIceCandidate?: (candidate: RTCIceCandidateInit, senderId: string) => void;
  onCallRequest?: (senderId: string) => void;
  onCallAccept?: (senderId: string) => void;
  onCallReject?: (senderId: string) => void;
  onCallEnd?: (senderId: string) => void;
  onError?: (error: Error) => void;
}

export abstract class SignalingService {
  protected sessionId: string;
  protected userId: string;
  protected callbacks: SignalingCallbacks = {};
  protected isConnected: boolean = false;
  
  constructor(sessionId: string, userId: string) {
    this.sessionId = sessionId;
    this.userId = userId;
  }
  
  /**
   * Set the callback functions for handling different types of signaling messages.
   */
  setCallbacks(callbacks: SignalingCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }
  
  /**
   * Connect to the signaling server/service.
   * Implementation depends on the specific transport (MQTT, WebSocket, etc.)
   */
  abstract connect(): Promise<void>;
  
  /**
   * Disconnect from the signaling server/service.
   */
  abstract disconnect(): Promise<void>;
  
  /**
   * Send an SDP offer to a specific peer.
   */
  async sendOffer(offer: RTCSessionDescriptionInit, targetId: string): Promise<void> {
    const message: SignalingMessage = {
      type: 'offer',
      sessionId: this.sessionId,
      senderId: this.userId,
      targetId,
      data: offer,
      timestamp: Date.now()
    };
    
    await this.sendMessage(message);
    console.log(`Sent offer to peer ${targetId}`);
  }
  
  /**
   * Send an SDP answer to a specific peer.
   */
  async sendAnswer(answer: RTCSessionDescriptionInit, targetId: string): Promise<void> {
    const message: SignalingMessage = {
      type: 'answer',
      sessionId: this.sessionId,
      senderId: this.userId,
      targetId,
      data: answer,
      timestamp: Date.now()
    };
    
    await this.sendMessage(message);
    console.log(`Sent answer to peer ${targetId}`);
  }
  
  /**
   * Send an ICE candidate to a specific peer.
   */
  async sendIceCandidate(candidate: RTCIceCandidate, targetId: string): Promise<void> {
    const message: SignalingMessage = {
      type: 'ice-candidate',
      sessionId: this.sessionId,
      senderId: this.userId,
      targetId,
      data: {
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid
      },
      timestamp: Date.now()
    };
    
    await this.sendMessage(message);
    console.log(`Sent ICE candidate to peer ${targetId}`);
  }
  
  /**
   * Send a call request to initiate a WebRTC session.
   */
  async sendCallRequest(targetId: string): Promise<void> {
    const message: SignalingMessage = {
      type: 'call-request',
      sessionId: this.sessionId,
      senderId: this.userId,
      targetId,
      timestamp: Date.now()
    };
    
    await this.sendMessage(message);
    console.log(`Sent call request to peer ${targetId}`);
  }
  
  /**
   * Accept an incoming call request.
   */
  async acceptCall(targetId: string): Promise<void> {
    const message: SignalingMessage = {
      type: 'call-accept',
      sessionId: this.sessionId,
      senderId: this.userId,
      targetId,
      timestamp: Date.now()
    };
    
    await this.sendMessage(message);
    console.log(`Accepted call from peer ${targetId}`);
  }
  
  /**
   * Reject an incoming call request.
   */
  async rejectCall(targetId: string): Promise<void> {
    const message: SignalingMessage = {
      type: 'call-reject',
      sessionId: this.sessionId,
      senderId: this.userId,
      targetId,
      timestamp: Date.now()
    };
    
    await this.sendMessage(message);
    console.log(`Rejected call from peer ${targetId}`);
  }
  
  /**
   * End an active call.
   */
  async endCall(targetId: string): Promise<void> {
    const message: SignalingMessage = {
      type: 'call-end',
      sessionId: this.sessionId,
      senderId: this.userId,
      targetId,
      timestamp: Date.now()
    };
    
    await this.sendMessage(message);
    console.log(`Ended call with peer ${targetId}`);
  }
  
  /**
   * Abstract method to send a message via the specific transport.
   */
  protected abstract sendMessage(message: SignalingMessage): Promise<void>;
  
  /**
   * Handle incoming signaling messages and route them to appropriate callbacks.
   */
  protected handleMessage(message: SignalingMessage): void {
    // Only process messages for our session and not from ourselves
    if (message.sessionId !== this.sessionId || message.senderId === this.userId) {
      return;
    }
    
    console.log(`Received ${message.type} from peer ${message.senderId}`);
    
    try {
      switch (message.type) {
        case 'offer':
          if (this.callbacks.onOffer) {
            this.callbacks.onOffer(message.data, message.senderId);
          }
          break;
          
        case 'answer':
          if (this.callbacks.onAnswer) {
            this.callbacks.onAnswer(message.data, message.senderId);
          }
          break;
          
        case 'ice-candidate':
          if (this.callbacks.onIceCandidate) {
            this.callbacks.onIceCandidate(message.data, message.senderId);
          }
          break;
          
        case 'call-request':
          if (this.callbacks.onCallRequest) {
            this.callbacks.onCallRequest(message.senderId);
          }
          break;
          
        case 'call-accept':
          if (this.callbacks.onCallAccept) {
            this.callbacks.onCallAccept(message.senderId);
          }
          break;
          
        case 'call-reject':
          if (this.callbacks.onCallReject) {
            this.callbacks.onCallReject(message.senderId);
          }
          break;
          
        case 'call-end':
          if (this.callbacks.onCallEnd) {
            this.callbacks.onCallEnd(message.senderId);
          }
          break;
          
        default:
          console.warn(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling signaling message:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error as Error);
      }
    }
  }
  
  /**
   * Check if the signaling service is connected.
   */
  isServiceConnected(): boolean {
    return this.isConnected;
  }
  
  /**
   * Get the current session ID.
   */
  getSessionId(): string {
    return this.sessionId;
  }
  
  /**
   * Get the current user ID.
   */
  getUserId(): string {
    return this.userId;
  }
}

/**
 * MQTT-based signaling service implementation.
 * This uses the existing MQTT infrastructure for WebRTC signaling.
 */
export class MqttSignalingService extends SignalingService {
  private mqttClient: any = null; // Will be typed properly when MQTT service is available
  private readonly topic: string;
  
  constructor(sessionId: string, userId: string) {
    super(sessionId, userId);
    this.topic = `webrtc/signaling/${sessionId}`;
  }
  
  /**
   * Connect to MQTT broker for signaling.
   * This will integrate with the existing MQTT service when available.
   */
  async connect(): Promise<void> {
    try {
      // For now, this is a placeholder. In a real implementation,
      // this would connect to the MQTT broker using the existing MQTT service
      console.log(`Connecting to MQTT signaling on topic: ${this.topic}`);
      
      // Simulate connection success
      this.isConnected = true;
      
      // Subscribe to the signaling topic
      // await this.mqttClient.subscribe(this.topic);
      
      console.log('MQTT signaling service connected');
    } catch (error) {
      console.error('Failed to connect MQTT signaling:', error);
      throw error;
    }
  }
  
  /**
   * Disconnect from MQTT broker.
   */
  async disconnect(): Promise<void> {
    try {
      if (this.mqttClient) {
        // await this.mqttClient.unsubscribe(this.topic);
        // await this.mqttClient.disconnect();
      }
      
      this.isConnected = false;
      console.log('MQTT signaling service disconnected');
    } catch (error) {
      console.error('Error disconnecting MQTT signaling:', error);
    }
  }
  
  /**
   * Send a signaling message via MQTT.
   */
  protected async sendMessage(message: SignalingMessage): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MQTT signaling service not connected');
    }
    
    try {
      const payload = JSON.stringify(message);
      
      // In a real implementation, this would use the MQTT client
      // await this.mqttClient.publish(this.topic, payload);
      
      console.log('Sent MQTT signaling message:', message.type, payload.length, 'bytes');
    } catch (error) {
      console.error('Failed to send MQTT signaling message:', error);
      throw error;
    }
  }
}

/**
 * WebSocket-based signaling service implementation.
 * This provides an alternative to MQTT for WebRTC signaling.
 */
export class WebSocketSignalingService extends SignalingService {
  private websocket: WebSocket | null = null;
  private readonly url: string;
  
  constructor(sessionId: string, userId: string, url: string) {
    super(sessionId, userId);
    this.url = url;
  }
  
  /**
   * Connect to WebSocket server for signaling.
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.websocket = new WebSocket(this.url);
        
        this.websocket.onopen = () => {
          this.isConnected = true;
          console.log('WebSocket signaling service connected');
          
          // Join the session room
          this.sendMessage({
            type: 'call-request', // Using as join message
            sessionId: this.sessionId,
            senderId: this.userId,
            targetId: 'server',
            timestamp: Date.now()
          });
          
          resolve();
        };
        
        this.websocket.onmessage = (event) => {
          try {
            const message: SignalingMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        this.websocket.onclose = () => {
          this.isConnected = false;
          console.log('WebSocket signaling service disconnected');
        };
        
        this.websocket.onerror = (error) => {
          console.error('WebSocket signaling error:', error);
          if (this.callbacks.onError) {
            this.callbacks.onError(new Error('WebSocket connection failed'));
          }
          reject(error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Disconnect from WebSocket server.
   */
  async disconnect(): Promise<void> {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
    this.isConnected = false;
  }
  
  /**
   * Send a signaling message via WebSocket.
   */
  protected async sendMessage(message: SignalingMessage): Promise<void> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket signaling service not connected');
    }
    
    try {
      const payload = JSON.stringify(message);
      this.websocket.send(payload);
    } catch (error) {
      console.error('Failed to send WebSocket signaling message:', error);
      throw error;
    }
  }
}
