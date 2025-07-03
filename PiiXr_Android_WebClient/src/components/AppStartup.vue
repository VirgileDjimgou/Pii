<template>
  <div class="startup-screen">
    <!-- Header with app branding -->
    <div class="startup-header">
      <div class="app-logo">
        <i class="fas fa-mobile-alt"></i>
      </div>
      <h1 class="app-title">Assist AR</h1>
      <div class="settings-button" @click="$emit('openSettings')">
        <i class="fas fa-cog"></i>
      </div>
    </div>

    <!-- Main content area with device mockup -->
    <div class="startup-content">
      <!-- Stylized phone mockup with AR preview -->
      <div class="device-mockup">
        <div class="device-frame">
          <div class="device-screen">
            <!-- AR marker simulation -->
            <div class="ar-preview">
              <div class="ar-dots-grid">
                <div 
                  v-for="dot in arDots" 
                  :key="dot.id"
                  class="ar-dot"
                  :class="{ active: dot.active }"
                  :style="{
                    left: dot.x + '%',
                    top: dot.y + '%',
                    animationDelay: dot.delay + 's'
                  }"
                ></div>
              </div>
              
              <!-- Center device outline -->
              <div class="center-device">
                <div class="device-outline"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Session ID section -->
      <div class="session-section">
        <h2 class="section-title">ID Teilen oder QR Code scannen um Support zu erhalten</h2>
        
        <div class="session-id-card">
          <div class="id-label">Ihre ID</div>
          <div class="session-id">{{ sessionId }}</div>
          <button class="share-button" @click="shareSessionId" :disabled="!sessionId">
            <i class="fas fa-share-alt"></i>
          </button>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-buttons">
        <button class="qr-scan-button" @click="$emit('startQRScan')">
          <i class="fas fa-qrcode"></i>
          QR-Code scannen
        </button>
        
        <button class="tutorial-button" @click="$emit('openTutorial')">
          <i class="fas fa-play-circle"></i>
          Video Tutorial erstellen
        </button>
      </div>
    </div>

    <!-- Bottom status bar -->
    <div class="status-bar">
      <div class="status-indicator" :style="{ color: statusColor }">
        <i class="fas fa-circle status-dot"></i>
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSessionManager } from '../composables/useSessionManager'

// Define emits
defineEmits<{
  startQRScan: []
  openTutorial: []
  openSettings: []
  startSession: []
}>()

// Use session manager
const { 
  sessionId, 
  initializeSession, 
  shareSessionId: shareId,
  statusText,
  statusColor
} = useSessionManager()

// AR dots animation data
const arDots = ref<Array<{
  id: number
  x: number
  y: number
  active: boolean
  delay: number
}>>([])

/**
 * Generate AR dots grid for animation
 */
const generateArDots = () => {
  const dots = []
  const gridSize = 8
  const centerX = 50
  const centerY = 50
  const radius = 25

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x = centerX + (i - gridSize/2) * 6
      const y = centerY + (j - gridSize/2) * 6
      
      // Calculate distance from center
      const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2))
      
      dots.push({
        id: i * gridSize + j,
        x,
        y,
        active: distance <= radius,
        delay: Math.random() * 2
      })
    }
  }
  
  arDots.value = dots
}

/**
 * Share session ID with enhanced UX
 */
const shareSessionId = async () => {
  try {
    const success = await shareId()
    if (success) {
      // Visual feedback could be added here
      console.log('Session ID shared successfully')
    }
  } catch (error) {
    console.error('Failed to share session ID:', error)
  }
}

// Initialize on mount
onMounted(() => {
  initializeSession()
  generateArDots()
})
</script>

<style scoped>
.startup-screen {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a1a 0%, #2d2d2d 100%);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* Header */
.startup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 10px;
  position: relative;
}

.app-logo {
  font-size: 24px;
  color: #4299e1;
}

.app-title {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: 1px;
}

.settings-button {
  font-size: 20px;
  color: #9ca3af;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.settings-button:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.1);
}

/* Main content */
.startup-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  gap: 40px;
}

/* Device mockup */
.device-mockup {
  display: flex;
  justify-content: center;
  align-items: center;
}

.device-frame {
  width: 180px;
  height: 320px;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  border-radius: 25px;
  padding: 8px;
  box-shadow: 0 20px 40px rgba(66, 153, 225, 0.3);
  position: relative;
}

.device-screen {
  width: 100%;
  height: 100%;
  background: #000000;
  border-radius: 17px;
  overflow: hidden;
  position: relative;
}

.ar-preview {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(45deg, #1a1a2e 0%, #16213e 100%);
}

.ar-dots-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.ar-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ffffff;
  border-radius: 50%;
  opacity: 0.3;
  animation: dotPulse 2s infinite ease-in-out;
}

.ar-dot.active {
  opacity: 1;
  background: #4299e1;
  box-shadow: 0 0 8px #4299e1;
}

@keyframes dotPulse {
  0%, 100% { 
    opacity: 0.3;
    transform: scale(1);
  }
  50% { 
    opacity: 1;
    transform: scale(1.2);
  }
}

.center-device {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.device-outline {
  width: 60px;
  height: 120px;
  border: 2px solid #4299e1;
  border-radius: 8px;
  background: rgba(66, 153, 225, 0.1);
}

/* Session section */
.session-section {
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.section-title {
  font-size: 16px;
  color: #9ca3af;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.session-id-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  backdrop-filter: blur(10px);
}

.id-label {
  font-size: 14px;
  color: #9ca3af;
  flex-shrink: 0;
}

.session-id {
  font-size: 24px;
  font-weight: 600;
  font-family: 'Courier New', monospace;
  color: #ffffff;
  flex: 1;
  text-align: center;
  letter-spacing: 2px;
}

.share-button {
  background: #4299e1;
  border: none;
  border-radius: 12px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.share-button:hover:not(:disabled) {
  background: #3182ce;
  transform: translateY(-1px);
}

.share-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Action buttons */
.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 320px;
}

.qr-scan-button {
  background: #4299e1;
  border: none;
  border-radius: 16px;
  padding: 16px 24px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.qr-scan-button:hover {
  background: #3182ce;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(66, 153, 225, 0.4);
}

.tutorial-button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 16px 24px;
  color: #4299e1;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tutorial-button:hover {
  border-color: #4299e1;
  background: rgba(66, 153, 225, 0.1);
}

/* Status bar */
.status-bar {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.status-dot {
  font-size: 8px;
  animation: statusPulse 2s infinite ease-in-out;
}

@keyframes statusPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.status-text {
  font-size: 14px;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .startup-content {
    padding: 16px;
    gap: 30px;
  }
  
  .device-frame {
    width: 150px;
    height: 280px;
  }
  
  .session-id {
    font-size: 20px;
  }
  
  .section-title {
    font-size: 14px;
  }
}
</style>
