<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSessionManager } from '../composables/useSessionManager';
import { useAppStore } from '../stores/app';
import { useLocalization } from '../composables/useLocalization';
import ARPreviewThree from '../components/visualizations/ARPreviewThree.vue';
import ScrollableButtonPanel from '../components/ui/ScrollableButtonPanel.vue';

// Define button interface for all types of buttons
interface Button {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

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

// Join session directly (simulated)
const joinSession = () => {
  console.log('Joining session...');
  // Could prompt for session ID or use a direct connection method
  setTimeout(() => {
    startARSession();
  }, 1000);
};

// View recent sessions (simulated)
const viewRecentSessions = () => {
  console.log('Viewing recent sessions...');
};

// File transfer functionality (simulated)
const openFileTransfer = () => {
  console.log('Opening file transfer interface...');
};

// Schedule a meeting (simulated)
const scheduleMeeting = () => {
  console.log('Opening meeting scheduler...');
};

// Contact support (simulated)
const contactSupport = () => {
  console.log('Opening support contact options...');
};

// Direct connect using ID (simulated)
const directConnect = () => {
  console.log('Opening direct connection interface...');
  // In a real app, this would prompt for a session ID to connect to
};

// Define all button data for the quick access panel
const quickAccessButtons = ref<Button[]>([
  {
    id: 'scan-qr',
    label: 'Scan QR',
    icon: 'qr-icon',
    action: handleScanQR
  },
  {
    id: 'join-session',
    label: 'Join Session',
    icon: 'connect-icon',
    action: joinSession
  },
  {
    id: 'direct-connect',
    label: 'Direct Connect',
    icon: 'direct-icon',
    action: directConnect
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'settings-icon',
    action: openSettings
  },
  {
    id: 'create-tutorial',
    label: 'Create Tutorial',
    icon: 'video-icon',
    action: createTutorial
  },
  {
    id: 'recent-sessions',
    label: 'Recent Sessions',
    icon: 'history-icon',
    action: viewRecentSessions
  },
  {
    id: 'file-transfer',
    label: 'Transfer Files',
    icon: 'file-icon',
    action: openFileTransfer
  },
  {
    id: 'schedule-meeting',
    label: 'Schedule Meeting',
    icon: 'calendar-icon',
    action: scheduleMeeting
  },
  {
    id: 'contact-support',
    label: 'Contact Support',
    icon: 'help-icon',
    action: contactSupport
  }
]);

// Track currently hovered button in the quick access panel
const currentHoveredButton = ref<Button | null>(null);

// Handle quick access button click
const handleQuickAccessButtonClick = (button: Button) => {
  if (button && button.action) {
    button.action();
  }
};

// Handle quick access button hover
const handleQuickAccessButtonHover = (button: Button) => {
  currentHoveredButton.value = button;
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
    </div>

    <div class="main-content">
      <div class="ar-preview-container">
        <div class="ar-preview">
          <div class="phone-mockup">
            <!-- Interactive 3D AR Preview Visualization -->
            <ARPreviewThree />
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
        <!-- Quick Access Scrollable Panel -->
        <div class="quick-access-panel">
          <h3 class="section-title">Quick Access</h3>
          <ScrollableButtonPanel 
            :buttons="quickAccessButtons" 
            @button-click="handleQuickAccessButtonClick" 
            @button-hover="handleQuickAccessButtonHover"
          />
          <div v-if="currentHoveredButton" class="hovered-button-info">
            {{ translate(`buttons.${currentHoveredButton.id.replace(/-/g, '')}`) }}
          </div>
        </div>
        
        <!-- Primary Actions Section -->
        <div class="primary-actions">
          <button class="primary-button qr-scan-button" @click="handleScanQR">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="qr-icon">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <path d="M7 7h.01M17 7h.01M7 17h.01M17 17h.01M7 12h10"></path>
            </svg>
            {{ translate('buttons.scanQR') }}
          </button>
          <button class="primary-button" @click="joinSession">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="connect-icon">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
            {{ translate('buttons.joinSession') }}
          </button>
          <button class="primary-button" @click="directConnect">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="direct-icon">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
            {{ translate('buttons.directConnect') }}
          </button>
        </div>

        <!-- Secondary Actions Section -->
        <div class="section-divider">
          <span class="divider-text">More options</span>
        </div>
        <div class="secondary-actions">
          <button class="secondary-button" @click="openSettings">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="settings-icon">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            {{ translate('buttons.settings') }}
          </button>
          <button class="secondary-button" @click="createTutorial">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="video-icon">
              <polygon points="23 7 16 12 23 17 23 7"></polygon>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
            </svg>
            {{ translate('buttons.createTutorial') }}
          </button>
          <button class="secondary-button" @click="viewRecentSessions">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="history-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ translate('buttons.recentSessions') }}
          </button>
        </div>

        <!-- Utility Actions Section -->
        <div class="section-divider">
          <span class="divider-text">Utilities</span>
        </div>
        <div class="utility-actions">
          <button class="utility-button" @click="openFileTransfer">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="file-icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            {{ translate('buttons.fileTransfer') }}
          </button>
          <button class="utility-button" @click="scheduleMeeting">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="calendar-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            {{ translate('buttons.scheduleMeeting') }}
          </button>
          <button class="utility-button" @click="contactSupport">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="help-icon">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            {{ translate('buttons.contactSupport') }}
          </button>
        </div>
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
  perspective: 1000px; /* Adds depth to the 3D visualization */
}

.ar-preview {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
}

.phone-mockup {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
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

.quick-access-panel {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
}

.hovered-button-info {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  text-align: center;
  font-weight: 500;
  color: #be4df3;
  transition: all 0.2s ease;
}

.primary-actions, .secondary-actions, .utility-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-divider {
  margin: 0.5rem 0;
  text-align: center;
  position: relative;
}

.section-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.divider-text {
  position: relative;
  z-index: 2;
  background-color: #121212;
  padding: 0 0.75rem;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.primary-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  background-color: #be4df3;
  color: white;
  padding: 1rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.primary-button:hover {
  background-color: #c968f4;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(190, 77, 243, 0.3);
}

.secondary-button {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  border: none;
  font-weight: bold;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.utility-button {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.75rem;
  background-color: transparent;
  color: rgba(255, 255, 255, 0.8);
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  font-weight: normal;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
}

.utility-button:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.qr-icon, .video-icon, .settings-icon, .history-icon, .file-icon, .calendar-icon, .help-icon, .connect-icon, .direct-icon {
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
