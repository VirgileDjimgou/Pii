import { ref, computed } from 'vue'

/**
 * Session status enum for TeamViewer-like states
 */
export enum SessionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting', 
  CONNECTED = 'connected',
  READY = 'ready',
  ERROR = 'error'
}

/**
 * Composable for managing AR session state and connections
 * Mimics TeamViewer Assist AR session management
 */
export function useSessionManager() {
  const sessionId = ref<string>('')
  const status = ref<SessionStatus>(SessionStatus.DISCONNECTED)
  const partnerConnected = ref(false)
  const sessionStartTime = ref<Date | null>(null)
  const errorMessage = ref('')

  /**
   * Generate a unique session ID (TeamViewer style)
   */
  const generateSessionId = (): string => {
    const segments = []
    for (let i = 0; i < 3; i++) {
      const segment = Math.floor(Math.random() * 900 + 100) // 3-digit numbers
      segments.push(segment.toString())
    }
    return segments.join(' ')
  }

  /**
   * Initialize session with generated ID
   */
  const initializeSession = () => {
    sessionId.value = generateSessionId()
    status.value = SessionStatus.READY
    console.log('Session initialized with ID:', sessionId.value)
  }

  /**
   * Start a new AR session
   */
  const startSession = async (remoteId?: string) => {
    try {
      status.value = SessionStatus.CONNECTING
      errorMessage.value = ''
      
      // Simulate connection process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      status.value = SessionStatus.CONNECTED
      sessionStartTime.value = new Date()
      
      if (remoteId) {
        partnerConnected.value = true
        console.log('Connected to remote session:', remoteId)
      }
      
    } catch (error) {
      status.value = SessionStatus.ERROR
      errorMessage.value = error instanceof Error ? error.message : 'Connection failed'
      console.error('Session start failed:', error)
    }
  }

  /**
   * End current session
   */
  const endSession = () => {
    status.value = SessionStatus.DISCONNECTED
    partnerConnected.value = false
    sessionStartTime.value = null
    errorMessage.value = ''
    console.log('Session ended')
  }

  /**
   * Join session using scanned QR code or entered ID
   */
  const joinSession = async (scannedId: string) => {
    if (!scannedId.trim()) {
      errorMessage.value = 'Invalid session ID'
      return false
    }
    
    try {
      await startSession(scannedId)
      return true
    } catch (error) {
      return false
    }
  }

  /**
   * Copy session ID to clipboard
   */
  const copySessionId = async () => {
    try {
      await navigator.clipboard.writeText(sessionId.value)
      console.log('Session ID copied to clipboard')
      return true
    } catch (error) {
      console.error('Failed to copy session ID:', error)
      return false
    }
  }

  /**
   * Share session ID using Web Share API or fallback
   */
  const shareSessionId = async () => {
    const shareData = {
      title: 'TeamViewer Assist AR Session',
      text: `Join my AR session with ID: ${sessionId.value}`,
      url: `https://assist.teamviewer.com/join/${sessionId.value}`
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return true
      } else {
        // Fallback to clipboard
        return await copySessionId()
      }
    } catch (error) {
      console.error('Failed to share session ID:', error)
      return false
    }
  }

  // Computed properties
  const isConnected = computed(() => status.value === SessionStatus.CONNECTED)
  const isConnecting = computed(() => status.value === SessionStatus.CONNECTING)
  const isReady = computed(() => status.value === SessionStatus.READY)
  const hasError = computed(() => status.value === SessionStatus.ERROR)

  const sessionDuration = computed(() => {
    if (!sessionStartTime.value) return 0
    return Math.floor((Date.now() - sessionStartTime.value.getTime()) / 1000)
  })

  const statusText = computed(() => {
    switch (status.value) {
      case SessionStatus.READY:
        return 'Ready to connect (secure connection)'
      case SessionStatus.CONNECTING:
        return 'Connecting...'
      case SessionStatus.CONNECTED:
        return partnerConnected.value ? 'Partner connected' : 'Connected'
      case SessionStatus.ERROR:
        return errorMessage.value || 'Connection error'
      default:
        return 'Disconnected'
    }
  })

  const statusColor = computed(() => {
    switch (status.value) {
      case SessionStatus.READY:
        return '#10b981' // green
      case SessionStatus.CONNECTING:
        return '#f59e0b' // yellow
      case SessionStatus.CONNECTED:
        return '#3b82f6' // blue
      case SessionStatus.ERROR:
        return '#ef4444' // red
      default:
        return '#6b7280' // gray
    }
  })

  return {
    // State
    sessionId,
    status,
    partnerConnected,
    sessionStartTime,
    errorMessage,
    
    // Computed
    isConnected,
    isConnecting,
    isReady,
    hasError,
    sessionDuration,
    statusText,
    statusColor,
    
    // Methods
    initializeSession,
    startSession,
    endSession,
    joinSession,
    copySessionId,
    shareSessionId
  }
}
