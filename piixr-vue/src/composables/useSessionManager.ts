import { ref } from 'vue';

export function useSessionManager() {
  // Session state
  const sessionId = ref<string>(generateSessionId());
  const isConnected = ref<boolean>(false);
  const isSessionActive = ref<boolean>(false);
  const connectionStatus = ref<'idle' | 'connecting' | 'connected' | 'disconnected'>('idle');
  const peerSessionId = ref<string | null>(null);

  // Generate a unique session ID (simulating TeamViewer's ID system)
  function generateSessionId(): string {
    // Generate a random 9-digit ID similar to TeamViewer's format
    const randomNum = Math.floor(100000000 + Math.random() * 900000000);
    return randomNum.toString().replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
  }

  // Start a session (host mode)
  function startSession() {
    isSessionActive.value = true;
    connectionStatus.value = 'connecting';
    
    // Simulate connection establishment
    setTimeout(() => {
      isConnected.value = true;
      connectionStatus.value = 'connected';
    }, 1500);
  }

  // Join a session (client mode)
  function joinSession(targetSessionId: string) {
    peerSessionId.value = targetSessionId;
    connectionStatus.value = 'connecting';
    
    // Simulate connection establishment
    setTimeout(() => {
      isConnected.value = true;
      isSessionActive.value = true;
      connectionStatus.value = 'connected';
    }, 2000);
  }

  // End current session
  function endSession() {
    isConnected.value = false;
    isSessionActive.value = false;
    connectionStatus.value = 'disconnected';
    peerSessionId.value = null;
    
    // Reset after a brief delay
    setTimeout(() => {
      connectionStatus.value = 'idle';
    }, 1000);
  }

  // Copy session ID to clipboard
  async function copySessionId(): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(sessionId.value.replace(/\s/g, ''));
      return true;
    } catch (error) {
      console.error('Failed to copy session ID:', error);
      return false;
    }
  }

  return {
    sessionId,
    isConnected,
    isSessionActive,
    connectionStatus,
    peerSessionId,
    startSession,
    joinSession,
    endSession,
    copySessionId
  };
}
