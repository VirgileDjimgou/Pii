import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import HistoryPage from '../components/HistoryPage.vue'
import SettingsPage from '../components/SettingsPage.vue'

// Define routes for the dashboard
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage
  },
  {
    path: '/history',
    name: 'History',
    component: HistoryPage
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsPage
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
