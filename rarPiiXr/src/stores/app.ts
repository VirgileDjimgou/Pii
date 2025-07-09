import { defineStore } from 'pinia';

interface AppState {
  darkMode: boolean;
  settings: {
    microphone: boolean;
    showARSurfaces: boolean;
    anonymousCrashReports: boolean;
  };
  appVersion: string;
  appId: string;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    darkMode: true, // Default to dark mode based on screenshots
    settings: {
      microphone: true, // Default to enabled
      showARSurfaces: false, // Default to disabled
      anonymousCrashReports: true, // Default to enabled
    },
    appVersion: '1.0.0',
    appId: '1 747 028 938', // Simulating TeamViewer ID from screenshots
  }),
  
  actions: {
    toggleDarkMode() {
      this.darkMode = !this.darkMode;
      this.updateTheme();
    },
    
    setDarkMode(value: boolean) {
      this.darkMode = value;
      this.updateTheme();
    },
    
    updateTheme() {
      // Apply theme to document
      document.documentElement.classList.toggle('dark-theme', this.darkMode);
    },
    
    toggleMicrophone() {
      this.settings.microphone = !this.settings.microphone;
    },
    
    toggleARSurfaces() {
      this.settings.showARSurfaces = !this.settings.showARSurfaces;
    },
    
    toggleCrashReports() {
      this.settings.anonymousCrashReports = !this.settings.anonymousCrashReports;
    },
    
    // Initialize app settings from local storage if available
    initSettings() {
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          this.settings = { ...this.settings, ...parsedSettings };
        } catch (e) {
          console.error('Failed to parse saved settings', e);
        }
      }
      
      // Apply current theme
      this.updateTheme();
    },
    
    // Save settings to local storage
    saveSettings() {
      localStorage.setItem('app-settings', JSON.stringify(this.settings));
    }
  }
});
