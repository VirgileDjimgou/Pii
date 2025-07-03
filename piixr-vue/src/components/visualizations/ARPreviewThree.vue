<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';

// Container ref for the Three.js canvas
const container = ref<HTMLElement | null>(null);
const isLoading = ref(true);
const isUserInteracting = ref(false);

// Component props
defineProps({
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '100%'
  }
});

// Three.js variables
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let clock: THREE.Clock;
let frameId: number;
let interactionTimeout: ReturnType<typeof setTimeout>;

// Objects for our visualization
let phone: THREE.Group;
let floatingElements: THREE.Object3D[] = [];
let dataConnection: THREE.Line;

// Set up the Three.js scene
const initThree = () => {
  if (!container.value) return;

  // Get the container dimensions
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  // Create a scene
  scene = new THREE.Scene();
  
  // Create a camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.z = 5;
  
  // Create a renderer with alpha for transparency
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  
  // Add the renderer to our container
  container.value.appendChild(renderer.domElement);
  
  // Initialize the clock for animations
  clock = new THREE.Clock();
  
  // Create 3D content
  createPhone();
  createFloatingElements();
  createDataConnection();
  
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1, 1);
  scene.add(directionalLight);
};

// Create a phone model
const createPhone = () => {
  phone = new THREE.Group();
  
  // Phone body
  const phoneGeometry = new THREE.BoxGeometry(1.5, 3, 0.1);
  const phoneMaterial = new THREE.MeshPhongMaterial({ 
    color: 0x1a56db,
    shininess: 100,
  });
  const phoneBody = new THREE.Mesh(phoneGeometry, phoneMaterial);
  
  // Phone screen
  const screenGeometry = new THREE.BoxGeometry(1.3, 2.8, 0.11);
  const screenMaterial = new THREE.MeshPhongMaterial({ 
    color: 0xf8fafc,
    shininess: 90,
    emissive: 0x444444,
    emissiveIntensity: 0.2
  });
  const screen = new THREE.Mesh(screenGeometry, screenMaterial);
  screen.position.z = 0.01;
  
  // Add screen and body to phone group
  phone.add(phoneBody);
  phone.add(screen);
  
  // Add phone to scene
  scene.add(phone);
  
  // Tilt the phone slightly
  phone.rotation.x = -0.2;
  phone.rotation.y = 0.3;
};

// Create floating holographic elements
const createFloatingElements = () => {
  // Create different holographic elements
  
  // 1. Floating sphere - represents data point
  const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.8,
    emissive: 0x3b82f6,
    emissiveIntensity: 0.5
  });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.position.set(0, 0.8, 0.5);
  floatingElements.push(sphere);
  scene.add(sphere);
  
  // 2. Floating cube - represents UI element
  const cubeGeometry = new THREE.BoxGeometry(0.25, 0.25, 0.25);
  const cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0xbe4df3,
    transparent: true,
    opacity: 0.8,
    emissive: 0xbe4df3,
    emissiveIntensity: 0.5
  });
  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  cube.position.set(-0.7, 0.3, 0.7);
  floatingElements.push(cube);
  scene.add(cube);
  
  // 3. Floating ring - represents AR tracking
  const ringGeometry = new THREE.TorusGeometry(0.3, 0.03, 16, 32);
  const ringMaterial = new THREE.MeshPhongMaterial({
    color: 0x22c55e,
    transparent: true,
    opacity: 0.9,
    emissive: 0x22c55e,
    emissiveIntensity: 0.5
  });
  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.position.set(0.7, -0.5, 0.6);
  ring.rotation.x = Math.PI / 2;
  floatingElements.push(ring);
  scene.add(ring);

  // 4. Small particles - represent data points
  for (let i = 0; i < 8; i++) {
    const particleGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const particleMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
      emissive: 0xffffff,
      emissiveIntensity: 0.8
    });
    
    const particle = new THREE.Mesh(particleGeometry, particleMaterial);
    // Position randomly around the phone
    particle.position.set(
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 3,
      (Math.random() * 0.5) + 0.5
    );
    
    floatingElements.push(particle);
    scene.add(particle);
  }
};

// Create a data connection line
const createDataConnection = () => {
  // Create a curved line from bottom to top
  const curve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, -1.5, 0),       // Start at bottom of phone
    new THREE.Vector3(1, -1, 0.5),       // Control point 1
    new THREE.Vector3(-1, 1, 0.5),       // Control point 2
    new THREE.Vector3(0, 1.5, 0)         // End at top of phone
  );
  
  // Create geometry from the curve
  const points = curve.getPoints(50);
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  // Create pulsing material
  const material = new THREE.LineBasicMaterial({
    color: 0xbe4df3,
    transparent: true,
    opacity: 0.7,
    linewidth: 1
  });
  
  // Create the line and add to scene
  dataConnection = new THREE.Line(geometry, material);
  scene.add(dataConnection);
};

// Animation loop
const animate = () => {
  frameId = requestAnimationFrame(animate);
  
  const elapsedTime = clock.getElapsedTime();
  
  // Animate phone - gentle floating motion
  if (phone) {
    // Only apply default animation if not being controlled by user interaction
    if (!isUserInteracting) {
      phone.position.y = Math.sin(elapsedTime * 0.5) * 0.1;
      phone.rotation.y = 0.3 + Math.sin(elapsedTime * 0.3) * 0.05;
      phone.rotation.x = -0.2 + Math.sin(elapsedTime * 0.4) * 0.03;
    }
  }
  
  // Animate floating elements - each with different motion
  floatingElements.forEach((element, index) => {
    // Different animation based on element type
    const speed = 0.5 + (index * 0.1);
    
    // Position animation
    element.position.y += Math.sin(elapsedTime * speed) * 0.003;
    element.position.x += Math.cos(elapsedTime * speed * 0.7) * 0.002;
    
    // Rotation animation
    element.rotation.x += 0.003 * speed;
    element.rotation.y += 0.004 * speed;
    
    // Scale pulse for some elements
    if (index % 3 === 0) {
      const pulseScale = 1 + Math.sin(elapsedTime * 2) * 0.05;
      element.scale.set(pulseScale, pulseScale, pulseScale);
    }
  });
  
  // Animate data connection - pulse effect
  if (dataConnection && dataConnection.material) {
    (dataConnection.material as THREE.LineBasicMaterial).opacity = 
      0.5 + Math.sin(elapsedTime * 3) * 0.3;
  }
  
  // Render scene
  renderer.render(scene, camera);
};

// Handle window resize
const handleResize = () => {
  if (!container.value || !camera || !renderer) return;
  
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  
  renderer.setSize(width, height);
};

// Clean up Three.js resources
const cleanupThree = () => {
  if (frameId) {
    cancelAnimationFrame(frameId);
  }
  
  if (renderer && renderer.domElement && container.value) {
    container.value.removeChild(renderer.domElement);
  }
  
  // Dispose of geometries and materials
  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (object.geometry) object.geometry.dispose();
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    }
  });
};

// Handle mouse movement for interactive rotation
const handleMouseMove = (event: MouseEvent) => {
  if (!container.value || !phone) return;
  
  isUserInteracting.value = true;
  
  // Get mouse position relative to container
  const rect = container.value.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  
  // Apply subtle rotation based on mouse position
  phone.rotation.y = 0.3 + mouseX * 0.2;
  phone.rotation.x = -0.2 + mouseY * 0.1;
  
  // Reset interaction after some time without movement
  clearTimeout(interactionTimeout);
  interactionTimeout = setTimeout(() => {
    isUserInteracting.value = false;
  }, 1000);
};

// Handle touch movement for mobile devices
const handleTouchMove = (event: TouchEvent) => {
  if (!container.value || !phone || event.touches.length === 0) return;
  
  isUserInteracting.value = true;
  
  // Get touch position relative to container
  const rect = container.value.getBoundingClientRect();
  const touch = event.touches[0];
  const touchX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
  const touchY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
  
  // Apply subtle rotation based on touch position
  phone.rotation.y = 0.3 + touchX * 0.2;
  phone.rotation.x = -0.2 + touchY * 0.1;
  
  // Reset interaction after some time without movement
  clearTimeout(interactionTimeout);
  interactionTimeout = setTimeout(() => {
    isUserInteracting.value = false;
  }, 1000);
};

// Initialize Three.js on component mount
onMounted(() => {
  initThree();
  animate();
  
  // Set loading to false after a brief delay
  setTimeout(() => {
    isLoading.value = false;
  }, 300);
  
  // Add event listeners
  window.addEventListener('resize', handleResize);
  
  if (container.value) {
    container.value.addEventListener('mousemove', handleMouseMove);
    container.value.addEventListener('touchmove', handleTouchMove);
  }
});

// Clean up on component unmount
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  
  if (container.value) {
    container.value.removeEventListener('mousemove', handleMouseMove);
    container.value.removeEventListener('touchmove', handleTouchMove);
  }
  
  cleanupThree();
});

// Watch for container resize
watch(() => [container.value?.clientWidth, container.value?.clientHeight], () => {
  handleResize();
}, { flush: 'post' });
</script>

<template>
  <div ref="container" class="ar-preview-three" :style="{ width: width, height: height }">
    <!-- Three.js canvas will be appended here -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
    </div>
  </div>
</template>

<style scoped>
.ar-preview-three {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #be4df3;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
