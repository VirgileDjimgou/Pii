<template>
  <div class="settings-page">
    <div class="page-header">
      <h2 class="page-title">Settings</h2>
      <p class="page-subtitle">Customize your detection experience</p>
    </div>

    <!-- Settings sections -->
    <div class="settings-sections">
      
      <!-- Detection Settings -->
      <div class="settings-section">
        <h3 class="section-title">
          <i class="fas fa-cog"></i>
          Detection Settings
        </h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <h4 class="setting-title">Confidence Threshold</h4>
            <p class="setting-description">Minimum confidence level for detections</p>
          </div>
          <div class="setting-control">
            <input 
              type="range" 
              min="0" 
              max="100" 
              :value="confidenceThreshold" 
              @input="updateConfidence($event)"
              class="range-slider"
            >
            <span class="range-value">{{ confidenceThreshold }}%</span>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4 class="setting-title">Auto-Save Detections</h4>
            <p class="setting-description">Automatically save successful detections</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input type="checkbox" v-model="autoSaveDetections">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4 class="setting-title">Sound Notifications</h4>
            <p class="setting-description">Play sound when objects are detected</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input type="checkbox" v-model="soundNotifications">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Camera Settings -->
      <div class="settings-section">
        <h3 class="section-title">
          <i class="fas fa-camera"></i>
          Camera Settings
        </h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <h4 class="setting-title">Camera Quality</h4>
            <p class="setting-description">Higher quality improves accuracy but uses more battery</p>
          </div>
          <div class="setting-control">
            <select v-model="cameraQuality" class="select-dropdown">
              <option value="low">Low (480p)</option>
              <option value="medium">Medium (720p)</option>
              <option value="high">High (1080p)</option>
            </select>
          </div>
        </div>

        <div class="setting-item">
          <div class="setting-info">
            <h4 class="setting-title">Front Camera</h4>
            <p class="setting-description">Use front-facing camera by default</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input type="checkbox" v-model="useFrontCamera">
              <span class="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div class="settings-section">
        <h3 class="section-title">
          <i class="fas fa-shield-alt"></i>
          Privacy & Data
        </h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <h4 class="setting-title">Analytics</h4>
            <p class="setting-description">Help improve the app by sharing usage data</p>
          </div>
          <div class="setting-control">
            <label class="toggle-switch">
              <input type="checkbox" v-model="analytics">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="setting-item action-item" @click="clearHistory">
          <div class="setting-info">
            <h4 class="setting-title text-danger">Clear Detection History</h4>
            <p class="setting-description">Permanently delete all saved detections</p>
          </div>
          <div class="setting-control">
            <i class="fas fa-trash-alt text-danger"></i>
          </div>
        </div>
      </div>

      <!-- App Info -->
      <div class="settings-section">
        <h3 class="section-title">
          <i class="fas fa-info-circle"></i>
          About
        </h3>
        
        <div class="setting-item">
          <div class="setting-info">
            <h4 class="setting-title">App Version</h4>
            <p class="setting-description">{{ appVersion }}</p>
          </div>
        </div>

        <div class="setting-item action-item" @click="openHelp">
          <div class="setting-info">
            <h4 class="setting-title">Help & Support</h4>
            <p class="setting-description">Get help and contact support</p>
          </div>
          <div class="setting-control">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>

        <div class="setting-item action-item" @click="openPrivacyPolicy">
          <div class="setting-info">
            <h4 class="setting-title">Privacy Policy</h4>
            <p class="setting-description">Learn how we protect your data</p>
          </div>
          <div class="setting-control">
            <i class="fas fa-chevron-right"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// Settings state - in a real app these would be stored in Pinia or localStorage
const confidenceThreshold = ref(85)
const autoSaveDetections = ref(true)
const soundNotifications = ref(false)
const cameraQuality = ref('medium')
const useFrontCamera = ref(false)
const analytics = ref(true)

// App info
const appVersion = ref('1.0.0')

// Update confidence threshold with proper type handling
const updateConfidence = (event: Event) => {
  const target = event.target as HTMLInputElement
  confidenceThreshold.value = parseInt(target.value)
}

// Clear detection history with confirmation
const clearHistory = () => {
  if (confirm('Are you sure you want to clear all detection history? This action cannot be undone.')) {
    // In a real app, this would clear data from store/database
    console.log('Clearing detection history...')
    // Show success message or toast notification
  }
}

// Open help page or modal
const openHelp = () => {
  // In a real app, this would navigate to help page or open support chat
  console.log('Opening help...')
}

// Open privacy policy
const openPrivacyPolicy = () => {
  // In a real app, this would open privacy policy page or external link
  console.log('Opening privacy policy...')
}
</script>

<style scoped>
.settings-page {
  padding: 20px;
  padding-bottom: 100px;
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #64748b;
  font-size: 16px;
  margin: 0;
}

/* Settings sections */
.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.section-title i {
  color: #4299e1;
}

/* Individual setting items */
.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item.action-item {
  cursor: pointer;
}

.setting-item.action-item:hover {
  background: #f8fafc;
  margin: 0 -20px;
  padding: 16px 20px;
  border-radius: 12px;
}

.setting-info {
  flex: 1;
}

.setting-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.setting-title.text-danger {
  color: #e53e3e;
}

.setting-description {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
}

.setting-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Toggle switch styling */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e0;
  transition: 0.3s;
  border-radius: 28px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input:checked + .slider {
  background-color: #4299e1;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

/* Range slider styling */
.range-slider {
  width: 120px;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  appearance: none;
}

.range-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4299e1;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(66, 153, 225, 0.3);
}

.range-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4299e1;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(66, 153, 225, 0.3);
}

.range-value {
  font-size: 14px;
  font-weight: 600;
  color: #4299e1;
  min-width: 40px;
  text-align: center;
}

/* Select dropdown styling */
.select-dropdown {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  color: #2d3748;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.select-dropdown:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

/* Danger text styling */
.text-danger {
  color: #e53e3e !important;
}

/* Responsive design */
@media (max-width: 480px) {
  .settings-page {
    padding: 15px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .settings-section {
    padding: 16px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .setting-control {
    align-self: stretch;
    justify-content: flex-end;
  }
  
  .range-slider {
    width: 100px;
  }
}
</style>
