<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionManager } from '../composables/useSessionManager';
import { useAppStore } from '../stores/app';
import { useLocalization } from '../composables/useLocalization';

const router = useRouter();
const { sessionId, copySessionId } = useSessionManager();
const appStore = useAppStore();
const { translate } = useLocalization();

const showCopiedMessage = ref(false);

// Handle copy session ID
const handleCopyId = async () => {
  const success = await copySessionId();
  if (success) {
    showCopiedMessage.value = true;
    setTimeout(() => {
      showCopiedMessage.value = false;
    }, 2000);
  }
};

// Start a new AR session
const startARSession = () => {
  router.push('/ar-session');
};

// Open settings
const openSettings = () => {
  router.push('/settings');
};

// Handle QR scan (simulated)
const handleScanQR = () => {
  // In a real app, this would trigger the QR scanner
  console.log('Scanning QR code...');
  // For demo, we'll just navigate to AR session after a delay
  setTimeout(() => {
    startARSession();
  }, 1500);
};

// Create tutorial (simulated)
const createTutorial = () => {
  console.log('Creating tutorial...');
};

onMounted(() => {
  // Initialize app settings
  appStore.initSettings();
});
</script>

<template>
  <div class="home-container">
    <div class="header">
      <div class="logo-container">
        <span class="app-title">{{ translate('app.title') }}</span>
      </div>
      <button class="settings-button" @click="openSettings">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-icon">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      </button>
    </div>

    <div class="main-content">
      <div class="ar-preview-container">
        <div class="ar-preview">
          <div class="phone-mockup">
            <!-- AR Preview Visualization -->
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 200" class="ar-preview-svg">
              <rect x="20" y="40" width="60" height="120" rx="10" fill="#1a56db" />
              <rect x="25" y="45" width="50" height="110" rx="5" fill="#f8fafc" />
              <circle cx="50" cy="100" r="15" fill="#3b82f6" stroke="#fff" stroke-width="2" />
              <path d="M50 125 L50 150" stroke="#3b82f6" stroke-width="5" />
              <path d="M40 140 L50 150 L60 140" fill="none" stroke="#3b82f6" stroke-width="5" />
            </svg>
          </div>
        </div>
      </div>

      <div class="session-info">
        <div class="id-container">
          <p class="id-label">{{ translate('settings.id') }}</p>
          <div class="id-display">
            <span class="id-value">{{ sessionId }}</span>
            <button class="copy-button" @click="handleCopyId">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span v-if="showCopiedMessage" class="copied-message">Copied!</span>
            </button>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="primary-button qr-scan-button" @click="handleScanQR">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="qr-icon">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M7 12h10"></path>
          </svg>
          {{ translate('buttons.scanQR') }}
        </button>

        <button class="secondary-button tutorial-button" @click="createTutorial">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="video-icon">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          {{ translate('buttons.createTutorial') }}
        </button>
      </div>
    </div>

    <div class="footer">
      <div class="connection-status">
        <span class="status-indicator online"></span>
        <span class="status-text">{{ translate('app.ready') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #121212;
  color: white;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
}

.app-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-left: 0.5rem;
}

.settings-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
}

.settings-icon {
  width: 24px;
  height: 24px;
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 1rem;
}

.ar-preview-container {
  width: 100%;
  max-width: 300px;
  aspect-ratio: 1/1;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.ar-preview {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.phone-mockup {
  width: 80%;
  height: 80%;
}

.ar-preview-svg {
  width: 100%;
  height: 100%;
}

.session-info {
  width: 100%;
  max-width: 400px;
  margin-bottom: 2rem;
}

.id-container {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.id-label {
  margin: 0 0 0.5rem 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.id-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.id-value {
  font-size: 1.5rem;
  font-weight: bold;
}

.copy-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  position: relative;
}

.copy-icon {
  width: 20px;
  height: 20px;
}

.copied-message {
  position: absolute;
  top: -30px;
  right: 0;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.actions {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.primary-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  background-color: #2563eb;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
}

.secondary-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  background-color: transparent;
  color: #3b82f6;
  padding: 1rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
}

.qr-icon, .video-icon {
  width: 20px;
  height: 20px;
}

.footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  width: 100%;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.online {
  background-color: #22c55e;
}

.status-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}
</style>
