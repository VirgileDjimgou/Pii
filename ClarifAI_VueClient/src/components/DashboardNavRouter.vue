<template>
  <nav class="dashboard-nav-router">
    <div class="nav-container">
      <router-link 
        v-for="item in navItems" 
        :key="item.id"
        :to="item.route"
        :class="['nav-item']"
        active-class="active"
      >
        <div class="nav-icon">
          <i :class="item.icon"></i>
        </div>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Define the navigation items with their routes and icons
const navItems = [
  { id: 'home', label: 'Home', icon: 'fas fa-home', route: '/' },
  { id: 'history', label: 'History', icon: 'fas fa-clock', route: '/history' },
  { id: 'settings', label: 'Settings', icon: 'fas fa-cog', route: '/settings' }
]
</script>

<style scoped>
.dashboard-nav-router {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  padding: 12px 0;
}

.nav-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 0 20px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 16px;
  transition: all 0.3s ease;
  min-width: 80px;
  font-size: 14px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
}

.nav-icon {
  font-size: 20px;
  margin-bottom: 4px;
}

.nav-label {
  font-weight: 500;
  font-size: 12px;
  letter-spacing: 0.5px;
}

/* Responsive adjustments for smaller screens */
@media (max-width: 480px) {
  .nav-item {
    min-width: 70px;
    padding: 10px 16px;
  }
  
  .nav-icon {
    font-size: 18px;
  }
  
  .nav-label {
    font-size: 11px;
  }
}
</style>
