<template>
  <div class="history-page">
    <div class="page-header">
      <h2 class="page-title">Detection History</h2>
      <p class="page-subtitle">Your recent AI detections</p>
    </div>

    <!-- Search and filter section -->
    <div class="search-section">
      <div class="search-bar">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Search detections..." 
          v-model="searchQuery"
          class="search-input"
        >
      </div>
      <button class="filter-button" @click="toggleFilter">
        <i class="fas fa-filter"></i>
      </button>
    </div>

    <!-- Filter options -->
    <div class="filter-section" v-if="showFilter">
      <div class="filter-chips">
        <button 
          v-for="filter in filterOptions" 
          :key="filter.id"
          :class="['filter-chip', { active: activeFilter === filter.id }]"
          @click="setFilter(filter.id)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- Detection history list -->
    <div class="history-list">
      <div 
        v-for="detection in filteredDetections" 
        :key="detection.id"
        class="detection-item"
        @click="viewDetectionDetails(detection)"
      >
        <div class="detection-thumbnail">
          <img :src="detection.thumbnail" :alt="detection.object" />
        </div>
        <div class="detection-info">
          <h3 class="detection-title">{{ detection.object }}</h3>
          <p class="detection-confidence">{{ detection.confidence }}% confidence</p>
          <p class="detection-time">{{ formatTime(detection.timestamp) }}</p>
        </div>
        <div class="detection-actions">
          <button class="action-button" @click.stop="shareDetection(detection)">
            <i class="fas fa-share"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty state when no detections -->
    <div class="empty-state" v-if="filteredDetections.length === 0">
      <div class="empty-icon">
        <i class="fas fa-search"></i>
      </div>
      <h3 class="empty-title">No detections found</h3>
      <p class="empty-message">Start detecting objects to see your history here</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Interface for detection data structure
interface Detection {
  id: number
  object: string
  confidence: number
  timestamp: Date
  thumbnail: string
  category: string
}

// Component state
const searchQuery = ref('')
const showFilter = ref(false)
const activeFilter = ref('all')

// Filter options for categorizing detections
const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'objects', label: 'Objects' },
  { id: 'people', label: 'People' },
  { id: 'animals', label: 'Animals' },
  { id: 'vehicles', label: 'Vehicles' }
]

// Mock detection history data - in a real app this would come from a store or API
const detections = ref<Detection[]>([
  {
    id: 1,
    object: 'Car',
    confidence: 95,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzY2N0VFQSIvPgo8cGF0aCBkPSJNMTIgMThIMjhWMjJIMTJWMThaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    category: 'vehicles'
  },
  {
    id: 2,
    object: 'Person',
    confidence: 87,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iIzQ4QkI3OCIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjE2IiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTQgMjhDMTQgMjUuNzkgMTYuNjkgMjQgMjAgMjRTMjYgMjUuNzkgMjYgMjhIMTRaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    category: 'people'
  },
  {
    id: 3,
    object: 'Cat',
    confidence: 92,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiByeD0iOCIgZmlsbD0iI0VEOEkzNiIvPgo8cGF0aCBkPSJNMjAgMTJMMTYgMTZIMjRMMjAgMTJaIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIyIiByPSI2IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K',
    category: 'animals'
  }
])

// Computed property to filter detections based on search and active filter
const filteredDetections = computed(() => {
  let filtered = detections.value

  // Apply category filter
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(detection => detection.category === activeFilter.value)
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(detection => 
      detection.object.toLowerCase().includes(query)
    )
  }

  return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
})

// Toggle filter visibility
const toggleFilter = () => {
  showFilter.value = !showFilter.value
}

// Set active filter
const setFilter = (filterId: string) => {
  activeFilter.value = filterId
}

// Format timestamp for display
const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}

// Handle detection item click
const viewDetectionDetails = (detection: Detection) => {
  // In a real app, this would navigate to a detail view
  console.log('Viewing detection:', detection)
}

// Handle share button click
const shareDetection = (detection: Detection) => {
  // In a real app, this would open a share dialog
  console.log('Sharing detection:', detection)
}
</script>

<style scoped>
.history-page {
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

/* Search and filter section */
.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-bar {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar i {
  position: absolute;
  left: 16px;
  color: #94a3b8;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: none;
  border-radius: 16px;
  background: white;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  box-shadow: 0 4px 15px rgba(66, 153, 225, 0.2);
}

.filter-button {
  background: white;
  border: none;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  color: #64748b;
  transition: all 0.3s ease;
}

.filter-button:hover {
  background: #f1f5f9;
  color: #4299e1;
}

/* Filter chips */
.filter-section {
  margin-bottom: 20px;
}

.filter-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  background: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.filter-chip:hover {
  background: #f1f5f9;
}

.filter-chip.active {
  background: #4299e1;
  color: white;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
}

/* Detection history list */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detection-item {
  display: flex;
  align-items: center;
  background: white;
  padding: 16px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.detection-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.detection-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  overflow: hidden;
  margin-right: 16px;
  flex-shrink: 0;
}

.detection-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detection-info {
  flex: 1;
}

.detection-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
}

.detection-confidence {
  font-size: 14px;
  color: #4299e1;
  font-weight: 500;
  margin: 0 0 2px 0;
}

.detection-time {
  font-size: 12px;
  color: #94a3b8;
  margin: 0;
}

.detection-actions {
  flex-shrink: 0;
}

.action-button {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: #f1f5f9;
  color: #4299e1;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-icon {
  font-size: 48px;
  color: #cbd5e0;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 20px;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 8px 0;
}

.empty-message {
  color: #94a3b8;
  font-size: 16px;
  margin: 0;
}

/* Responsive design */
@media (max-width: 480px) {
  .history-page {
    padding: 15px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .detection-item {
    padding: 12px;
  }
  
  .detection-thumbnail {
    width: 40px;
    height: 40px;
    margin-right: 12px;
  }
  
  .detection-title {
    font-size: 16px;
  }
}
</style>
