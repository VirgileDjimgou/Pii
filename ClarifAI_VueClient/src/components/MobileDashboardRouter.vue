<template>
  <div class="dashboard-container-router">
    <!-- Fixed navigation at the top -->
    <DashboardNavRouter />
    
    <!-- Main content area with router transitions -->
    <main class="dashboard-content-router">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import DashboardNavRouter from './DashboardNavRouter.vue'
</script>

<style scoped>
.dashboard-container-router {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

.dashboard-content-router {
  padding-top: 80px; /* Account for fixed navigation */
  min-height: 100vh;
}

/* Page transition animations */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-in-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Ensure smooth transitions */
.dashboard-content-router > * {
  width: 100%;
}
</style>
