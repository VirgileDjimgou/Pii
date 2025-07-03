<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAppStore } from '../stores/app';
import { useLocalization } from '../composables/useLocalization';

const router = useRouter();
const appStore = useAppStore();
const { translate } = useLocalization();

// Navigate back to home
const goBack = () => {
  router.push('/');
};

// Save settings when toggled
const saveSettings = () => {
  appStore.saveSettings();
};
</script>

<template>
  <div class="settings-container">
    <div class="header">
      <button class="back-button" @click="goBack">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="back-icon">
          <path d="M19 12H5"></path>
          <path d="M12 19l-7-7 7-7"></path>
        </svg>
      </button>
      <h1 class="header-title">{{ translate('settings.title') }}</h1>
    </div>

    <div class="settings-content">
      <!-- General Section -->
      <div class="settings-section">
        <h2 class="section-title">{{ translate('settings.general') }}</h2>
        
        <div class="settings-item button-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </div>
          <div class="item-text">{{ translate('buttons.startNow') }}</div>
          <div class="item-action">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="settings-item button-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
            </svg>
          </div>
          <div class="item-text">{{ translate('buttons.rateUs') }}</div>
          <div class="item-action">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="settings-item button-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="item-text">{{ translate('buttons.giveFeedback') }}</div>
          <div class="item-action">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>
      </div>

      <!-- Configuration Section -->
      <div class="settings-section">
        <h2 class="section-title">{{ translate('settings.configuration') }}</h2>
        
        <div class="settings-item toggle-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          </div>
          <div class="item-content">
            <div class="item-text">{{ translate('settings.microphone') }}</div>
            <div class="item-description">{{ translate('settings.microphoneDesc') }}</div>
          </div>
          <div class="item-action">
            <label class="toggle-switch">
              <input type="checkbox" v-model="appStore.settings.microphone" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-item toggle-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="3" y1="15" x2="21" y2="15"></line>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
          </div>
          <div class="item-content">
            <div class="item-text">{{ translate('settings.showARSurfaces') }}</div>
            <div class="item-description">{{ translate('settings.showARSurfacesDesc') }}</div>
          </div>
          <div class="item-action">
            <label class="toggle-switch">
              <input type="checkbox" v-model="appStore.settings.showARSurfaces" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Logs Section -->
      <div class="settings-section">
        <h2 class="section-title">{{ translate('settings.logs') }}</h2>
        
        <div class="settings-item button-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div class="item-text">{{ translate('settings.showEventLog') }}</div>
          <div class="item-action">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="settings-item toggle-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <div class="item-content">
            <div class="item-text">{{ translate('settings.crashReports') }}</div>
            <div class="item-description">{{ translate('settings.crashReportsDesc') }}</div>
          </div>
          <div class="item-action">
            <label class="toggle-switch">
              <input type="checkbox" v-model="appStore.settings.anonymousCrashReports" @change="saveSettings">
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- About Section -->
      <div class="settings-section">
        <h2 class="section-title">{{ translate('settings.about') }}</h2>
        
        <div class="settings-item button-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </div>
          <div class="item-text">{{ translate('settings.licenseAgreement') }}</div>
          <div class="item-action">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="settings-item button-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div class="item-text">{{ translate('settings.privacyPolicy') }}</div>
          <div class="item-action">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="settings-item button-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <div class="item-text">{{ translate('settings.thirdPartyLicenses') }}</div>
          <div class="item-action">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </div>
        </div>

        <div class="settings-item info-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <div class="item-text">{{ translate('settings.version') }}</div>
          <div class="item-value">{{ appStore.appVersion }}</div>
        </div>

        <div class="settings-item info-item">
          <div class="item-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <div class="item-text">{{ translate('settings.id') }}</div>
          <div class="item-value">{{ appStore.appId }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #121212;
  color: white;
}

.header {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.back-button {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 1rem;
}

.back-icon {
  width: 24px;
  height: 24px;
}

.header-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.settings-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 1rem;
}

.settings-section {
  margin: 1.5rem 0;
}

.section-title {
  font-size: 1rem;
  font-weight: bold;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1rem;
}

.settings-item {
  display: flex;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.item-icon {
  width: 24px;
  height: 24px;
  margin-right: 1rem;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.item-text {
  flex-grow: 1;
}

.item-content {
  flex-grow: 1;
}

.item-description {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.25rem;
}

.item-action {
  margin-left: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.item-value {
  color: rgba(255, 255, 255, 0.6);
}

.button-item {
  cursor: pointer;
}

.button-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2196F3;
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}
</style>
