<template>
  <div class="dashboard-container">
    <!-- Fixed navigation at the top -->
    <DashboardNav @tab-change="handleTabChange" />
    
    <!-- Main content area with page transitions -->
    <main class="dashboard-content">
      <Transition :name="transitionName" mode="out-in">
        <HomePage v-if="activeTab === 'home'" key="home" />
        <HistoryPage v-else-if="activeTab === 'history'" key="history" />
        <SettingsPage v-else-if="activeTab === 'settings'" key="settings" />
      </Transition>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DashboardNav from './DashboardNav.vue'
import HomePage from './HomePage.vue'
import HistoryPage from './HistoryPage.vue'
import SettingsPage from './SettingsPage.vue'

// Track the currently active tab
const activeTab = ref('home')

// Track transition direction for smooth animations
const transitionName = ref('slide-right')

// Handle tab changes from navigation component
const handleTabChange = (newTab: string) => {
  // Determine transition direction based on tab order
  const tabOrder = ['home', 'history', 'settings']
  const currentIndex = tabOrder.indexOf(activeTab.value)
  const newIndex = tabOrder.indexOf(newTab)
  
  // Set transition direction for smooth animation
  transitionName.value = newIndex > currentIndex ? 'slide-left' : 'slide-right'
  
  // Update active tab
  activeTab.value = newTab
}
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

.dashboard-content {
  padding-top: 80px; /* Account for fixed navigation */
  min-height: 100vh;
}

/* Page transition animations */
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Ensure smooth transitions */
.dashboard-content > * {
  width: 100%;
}
</style>
