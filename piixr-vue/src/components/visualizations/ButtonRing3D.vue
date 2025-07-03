<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, shallowRef } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap'; // Import GSAP for smooth animations

// Props for the component
const props = defineProps({
  // List of buttons to display in the ring
  buttons: {
    type: Array,
    required: true,
    // Each button should have: id, label, icon, action
  },
});

// Emit events when buttons are clicked
const emit = defineEmits(['buttonClicked', 'buttonFocused']);

// References for scene setup - use shallowRef for Three.js objects to avoid reactivity issues
const containerRef = ref<HTMLElement | null>(null);
const renderer = shallowRef<THREE.WebGLRenderer | null>(null);
const scene = shallowRef<THREE.Scene | null>(null);
const camera = shallowRef<THREE.PerspectiveCamera | null>(null);
const controls = shallowRef<OrbitControls | null>(null);

// Track which button is currently focused
const focusedButtonIndex = ref(0);
const focusedButton = computed(() => props.buttons[focusedButtonIndex.value]);

// Container dimensions for responsive behavior
const containerWidth = ref(0);
const containerHeight = ref(0);

// Button objects (meshes) for the ring - use shallowRef to avoid reactivity issues
const buttonObjects = shallowRef<THREE.Group[]>([]);

// Configuration for the ring
const ringRadius = 2.5;
const buttonSize = 0.8;
const rotationSpeed = 0.05;

// Setup the Three.js scene
const setupScene = () => {
  if (!containerRef.value) return;

  // Get container dimensions
  const container = containerRef.value;
  containerWidth.value = container.clientWidth;
  containerHeight.value = container.clientHeight;

  // Create scene
  scene.value = new THREE.Scene();
  scene.value.background = new THREE.Color(0x121212);

  // Create camera
  camera.value = new THREE.PerspectiveCamera(
    60,
    containerWidth.value / containerHeight.value,
    0.1,
    1000
  );
  camera.value.position.set(0, 0, 5);

  // Create renderer
  renderer.value = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.value.setSize(containerWidth.value, containerHeight.value);
  renderer.value.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.value.domElement);

  // Add lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.value.add(ambientLight);

  const frontLight = new THREE.DirectionalLight(0xffffff, 1);
  frontLight.position.set(0, 0, 5);
  scene.value.add(frontLight);

  const backLight = new THREE.DirectionalLight(0xbe4df3, 0.5);
  backLight.position.set(0, 0, -5);
  scene.value.add(backLight);

  // Add controls for debug purposes - restrict movement to horizontal rotation only
  controls.value = new OrbitControls(camera.value, renderer.value.domElement);
  controls.value.enableZoom = false;
  controls.value.enablePan = false;
  controls.value.minPolarAngle = Math.PI / 2;
  controls.value.maxPolarAngle = Math.PI / 2;
  controls.value.update();

  // Handle window resize
  window.addEventListener('resize', handleResize);

  // Create button objects
  createButtonRing();

  // Start animation loop
  animate();
};

// Create the button ring
const createButtonRing = () => {
  if (!scene.value) return;

  // Clear any existing button objects
  const buttonObjectsValue = buttonObjects.value || [];
  buttonObjectsValue.forEach(button => {
    scene.value?.remove(button);
  });
  
  // Create new array for button objects
  const newButtonObjects: THREE.Group[] = [];

  // Create each button and position it on the ring
  props.buttons.forEach((button, index) => {
    const buttonGroup = new THREE.Group();
    
    // Create button background - using rounded box for better aesthetics
    const geometry = new THREE.BoxGeometry(buttonSize, buttonSize / 2, 0.1);
    // Create special shader material with holographic effect
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xbe4df3,
      metalness: 0.7,
      roughness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.2,
      transparent: true,
      opacity: 0.9,
    });
    
    const buttonMesh = new THREE.Mesh(geometry, material);
    buttonGroup.add(buttonMesh);
    
    // Add an icon placeholder (in a real implementation we would use sprites or textures)
    const iconGeometry = new THREE.PlaneGeometry(buttonSize * 0.3, buttonSize * 0.3);
    const iconMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);
    iconMesh.position.z = 0.06;
    iconMesh.position.y = 0.05;
    buttonGroup.add(iconMesh);
    
    // Add button label
    const labelGeometry = new THREE.PlaneGeometry(buttonSize * 0.8, buttonSize * 0.2);
    const labelMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });
    const labelMesh = new THREE.Mesh(labelGeometry, labelMaterial);
    labelMesh.position.z = 0.06;
    labelMesh.position.y = -0.1;
    buttonGroup.add(labelMesh);

    // Create a subtle glow effect for the button
    const glowGeometry = new THREE.BoxGeometry(buttonSize * 1.1, buttonSize * 0.6, 0.05);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xbe4df3,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    });
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.z = -0.05;
    buttonGroup.add(glowMesh);

    // Position the button on the ring
    const angle = (index / props.buttons.length) * Math.PI * 2;
    buttonGroup.position.x = Math.sin(angle) * ringRadius;
    buttonGroup.position.z = Math.cos(angle) * ringRadius;
    
    // Rotate to face the center
    buttonGroup.lookAt(0, 0, 0);
    
    // Store reference with metadata in plain JS object (not reactive)
    buttonGroup.userData = {
      buttonIndex: index,
      buttonData: button,
      // Add original properties for animation
      originalPosition: buttonGroup.position.clone(),
      originalRotation: buttonGroup.rotation.clone(),
    };
    
    scene.value.add(buttonGroup);
    newButtonObjects.push(buttonGroup);
  });
  
  // Update button objects without triggering reactivity
  buttonObjects.value = newButtonObjects;

  // Position focused button at the front
  updateButtonPositions();
};

// Update button positions when the focused button changes
const updateButtonPositions = () => {
  if (!scene.value) return;

  // Calculate the angle for the focused button (should be at the front)
  const targetAngle = Math.PI; // PI is at the front (negative Z)
  
  buttonObjects.value.forEach((buttonGroup, index) => {
    // Calculate the current angle for this button
    const angleOffset = ((index - focusedButtonIndex.value) / props.buttons.length) * Math.PI * 2;
    const angle = targetAngle + angleOffset;
    
    // Position on the ring
    const x = Math.sin(angle) * ringRadius;
    const z = Math.cos(angle) * ringRadius;
    
    // Add a slight Y adjustment to create a wave effect around the ring
    // Buttons further from the focused one will be positioned lower
    const distanceFromFocus = Math.abs(index - focusedButtonIndex.value);
    const maxDistance = Math.floor(props.buttons.length / 2);
    const normalizedDistance = distanceFromFocus / maxDistance;
    const yOffset = -normalizedDistance * 0.5; // The further away, the lower
    
    // Set the target position - directly modify THREE.js objects without reactivity
    buttonGroup.position.set(x, yOffset, z);
    
    // Make the button face the center with a slight tilt based on position
    buttonGroup.lookAt(0, 0, 0);
    
    // Add an extra tilt to buttons not in focus
    if (index !== focusedButtonIndex.value) {
      buttonGroup.rotation.x += normalizedDistance * 0.2; // Tilt away from viewer
    }
    
    // Scale and opacity based on whether this is the focused button
    const isFocused = index === focusedButtonIndex.value;
    const scale = isFocused ? 1.2 : 0.8 - (normalizedDistance * 0.2); // Smaller as they get further away
    const opacity = isFocused ? 1.0 : 0.7 - (normalizedDistance * 0.3); // More transparent as they get further away
    
    buttonGroup.scale.set(scale, scale, scale);
    
    // Update materials
    buttonGroup.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        // Set opacity directly
        child.material.opacity = opacity;
        
        // Apply special effects to the focused button
        if (isFocused && child.material instanceof THREE.MeshPhysicalMaterial) {
          child.material.emissive.set(0x552277);
          child.material.emissiveIntensity = 0.5;
        } else if (child.material instanceof THREE.MeshPhysicalMaterial) {
          child.material.emissive.set(0x000000);
          child.material.emissiveIntensity = 0;
        }
      }
    });
  });
};

// Handle window resize
const handleResize = () => {
  if (!containerRef.value || !camera.value || !renderer.value) return;
  
  containerWidth.value = containerRef.value.clientWidth;
  containerHeight.value = containerRef.value.clientHeight;
  
  camera.value.aspect = containerWidth.value / containerHeight.value;
  camera.value.updateProjectionMatrix();
  
  renderer.value.setSize(containerWidth.value, containerHeight.value);
  
  // Adjust ring radius based on container size to ensure buttons remain visible
  const minDimension = Math.min(containerWidth.value, containerHeight.value);
  const adjustedRingRadius = (minDimension / 150) * 2.5;
  
  // Update button positions with the new radius
  buttonObjects.value.forEach((buttonGroup, index) => {
    const angle = ((index - focusedButtonIndex.value) / props.buttons.length) * Math.PI * 2 + Math.PI;
    const x = Math.sin(angle) * adjustedRingRadius;
    const z = Math.cos(angle) * adjustedRingRadius;
    
    // Update position directly
    buttonGroup.position.set(x, buttonGroup.position.y, z);
  });
};

// Animation loop
const animate = () => {
  if (!scene.value || !camera.value || !renderer.value) return;
  
  requestAnimationFrame(animate);
  
  // Add subtle continuous animation effects
  const time = Date.now() * 0.001; // time in seconds
  
  buttonObjects.value.forEach((button, index) => {
    // Only apply subtle animations to non-focused buttons
    if (index !== focusedButtonIndex.value) {
      // Subtle floating motion - update directly
      button.position.y += Math.sin(time * 2 + index) * 0.0005;
      
      // Subtle rotation - update directly
      button.rotation.z = Math.sin(time + index * 0.3) * 0.02;
    } else {
      // For the focused button, add a pulsing effect - update directly
      const pulseScale = 1.2 + Math.sin(time * 3) * 0.05;
      button.scale.set(pulseScale, pulseScale, pulseScale);
      
      // Add a subtle glow effect
      button.children.forEach(child => {
        if (child instanceof THREE.Mesh && 
            child.material instanceof THREE.MeshBasicMaterial && 
            child.geometry instanceof THREE.BoxGeometry && 
            child.position.z < 0) {
          // This is our glow mesh - update directly
          child.material.opacity = 0.3 + Math.sin(time * 5) * 0.1;
        }
      });
    }
  });
  
  controls.value?.update();
  renderer.value.render(scene.value, camera.value);
};

// Rotate the ring to the left
const rotateLeft = () => {
  // Calculate the next index
  const nextIndex = (focusedButtonIndex.value + 1) % props.buttons.length;
  
  // Create a smooth transition using GSAP
  buttonObjects.value.forEach((buttonGroup, index) => {
    // Calculate the current angle for this button
    const currentAngleOffset = ((index - focusedButtonIndex.value) / props.buttons.length) * Math.PI * 2;
    const nextAngleOffset = ((index - nextIndex) / props.buttons.length) * Math.PI * 2;
    
    const targetAngle = Math.PI; // PI is at the front (negative Z)
    const currentAngle = targetAngle + currentAngleOffset;
    const nextAngle = targetAngle + nextAngleOffset;
    
    // Target position
    const nextX = Math.sin(nextAngle) * ringRadius;
    const nextZ = Math.cos(nextAngle) * ringRadius;
    
    // Use GSAP to animate directly on the Three.js objects, not through Vue refs
    gsap.to(buttonGroup.position, {
      x: nextX,
      z: nextZ,
      duration: 0.5,
      ease: "power2.out"
    });
    
    // Calculate scale and opacity
    const isFocusedNow = index === focusedButtonIndex.value;
    const willBeFocused = index === nextIndex;
    
    // Scale animation - direct on Three.js object
    gsap.to(buttonGroup.scale, {
      x: willBeFocused ? 1.2 : 0.8,
      y: willBeFocused ? 1.2 : 0.8,
      z: willBeFocused ? 1.2 : 0.8,
      duration: 0.5,
      ease: "back.out(1.7)"
    });
    
    // Material opacity animation - direct on material objects
    buttonGroup.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        gsap.to(child.material, {
          opacity: willBeFocused ? 1.0 : 0.7,
          duration: 0.5
        });
        
        // Special effects for the focused button
        if (child.material instanceof THREE.MeshPhysicalMaterial) {
          if (willBeFocused) {
            gsap.to(child.material, {
              emissiveIntensity: 0.5,
              duration: 0.5,
              onStart: () => {
                // Set the emissive color directly
                child.material.emissive.set(0x552277);
              }
            });
          } else if (isFocusedNow) {
            gsap.to(child.material, {
              emissiveIntensity: 0,
              duration: 0.5,
              onStart: () => {
                // Set the emissive color directly
                child.material.emissive.set(0x000000);
              }
            });
          }
        }
      }
    });
  });
  
  // Update the focused index
  focusedButtonIndex.value = nextIndex;
  emit('buttonFocused', props.buttons[focusedButtonIndex.value]);
};

// Rotate the ring to the right
const rotateRight = () => {
  // Calculate the next index
  const nextIndex = (focusedButtonIndex.value - 1 + props.buttons.length) % props.buttons.length;
  
  // Create a smooth transition using GSAP
  buttonObjects.value.forEach((buttonGroup, index) => {
    // Calculate the current angle for this button
    const currentAngleOffset = ((index - focusedButtonIndex.value) / props.buttons.length) * Math.PI * 2;
    const nextAngleOffset = ((index - nextIndex) / props.buttons.length) * Math.PI * 2;
    
    const targetAngle = Math.PI; // PI is at the front (negative Z)
    const currentAngle = targetAngle + currentAngleOffset;
    const nextAngle = targetAngle + nextAngleOffset;
    
    // Target position
    const nextX = Math.sin(nextAngle) * ringRadius;
    const nextZ = Math.cos(nextAngle) * ringRadius;
    
    // Animate the transition - directly on Three.js objects
    gsap.to(buttonGroup.position, {
      x: nextX,
      z: nextZ,
      duration: 0.5,
      ease: "power2.out"
    });
    
    // Calculate scale and opacity
    const isFocusedNow = index === focusedButtonIndex.value;
    const willBeFocused = index === nextIndex;
    
    // Scale animation - directly on Three.js objects
    gsap.to(buttonGroup.scale, {
      x: willBeFocused ? 1.2 : 0.8,
      y: willBeFocused ? 1.2 : 0.8,
      z: willBeFocused ? 1.2 : 0.8,
      duration: 0.5,
      ease: "back.out(1.7)"
    });
    
    // Material opacity animation - directly on material objects
    buttonGroup.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.Material) {
        gsap.to(child.material, {
          opacity: willBeFocused ? 1.0 : 0.7,
          duration: 0.5
        });
        
        // Special effects for the focused button
        if (child.material instanceof THREE.MeshPhysicalMaterial) {
          if (willBeFocused) {
            gsap.to(child.material, {
              emissiveIntensity: 0.5,
              duration: 0.5,
              onStart: () => {
                // Set the emissive color directly
                child.material.emissive.set(0x552277);
              }
            });
          } else if (isFocusedNow) {
            gsap.to(child.material, {
              emissiveIntensity: 0,
              duration: 0.5,
              onStart: () => {
                // Set the emissive color directly
                child.material.emissive.set(0x000000);
              }
            });
          }
        }
      }
    });
  });
  
  // Update the focused index
  focusedButtonIndex.value = nextIndex;
  emit('buttonFocused', props.buttons[focusedButtonIndex.value]);
};

// Click the currently focused button
const clickFocusedButton = () => {
  const focusedButton = buttonObjects.value[focusedButtonIndex.value];
  
  if (focusedButton) {
    // Create a button press animation
    const originalScale = focusedButton.scale.x;
    
    // Press down animation - directly on Three.js objects
    gsap.to(focusedButton.scale, {
      x: originalScale * 0.9,
      y: originalScale * 0.9,
      z: originalScale * 0.9,
      duration: 0.1,
      onComplete: () => {
        // Release animation
        gsap.to(focusedButton.scale, {
          x: originalScale,
          y: originalScale,
          z: originalScale,
          duration: 0.2,
          ease: "back.out(1.5)",
          onComplete: () => {
            // Emit the button click event
            emit('buttonClicked', props.buttons[focusedButtonIndex.value]);
          }
        });
      }
    });
    
    // Flash effect on the button
    focusedButton.children.forEach(child => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial) {
        const originalEmissive = child.material.emissive.clone();
        const originalEmissiveIntensity = child.material.emissiveIntensity;
        
        // Flash bright - directly update material properties
        gsap.to(child.material, {
          emissiveIntensity: 1,
          duration: 0.1,
          onStart: () => {
            // Set emissive color directly
            child.material.emissive.set(0xffffff);
          },
          onComplete: () => {
            // Return to original
            gsap.to(child.material, {
              emissiveIntensity: originalEmissiveIntensity,
              duration: 0.3,
              onComplete: () => {
                // Restore original emissive color after animation
                child.material.emissive.copy(originalEmissive);
              }
            });
          }
        });
      }
    });
  } else {
    // If no animation (fallback), just emit the event
    emit('buttonClicked', props.buttons[focusedButtonIndex.value]);
  }
};

// Handle touch/mouse interaction
const handlePointerDown = (event: MouseEvent | TouchEvent) => {
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
  
  if (!containerRef.value) return;
  
  const containerRect = containerRef.value.getBoundingClientRect();
  const containerCenterX = containerRect.left + containerRect.width / 2;
  
  // Determine if clicked on left or right side
  if (clientX < containerCenterX) {
    rotateLeft();
  } else {
    rotateRight();
  }
};

// Click handler
const handleClick = () => {
  clickFocusedButton();
};

// Watch for changes to buttons array
watch(() => props.buttons, () => {
  createButtonRing();
}, { deep: true });

// Lifecycle hooks
onMounted(() => {
  setupScene();
  
  // Add keyboard navigation
  window.addEventListener('keydown', handleKeyNavigation);
});

onBeforeUnmount(() => {
  // Clean up resources
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('keydown', handleKeyNavigation);
  
  if (renderer.value && containerRef.value) {
    containerRef.value.removeChild(renderer.value.domElement);
  }
  
  // Dispose of all Three.js objects
  buttonObjects.value.forEach(button => {
    button.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach(material => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  });
  
  renderer.value?.dispose();
});

// Handle keyboard navigation
const handleKeyNavigation = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'ArrowLeft':
      rotateLeft();
      break;
    case 'ArrowRight':
      rotateRight();
      break;
    case 'Enter':
    case ' ': // Space
      clickFocusedButton();
      break;
  }
};

// Expose methods to parent
defineExpose({
  rotateLeft,
  rotateRight,
  clickFocusedButton,
  focusedButtonIndex,
});
</script>

<template>
  <div class="button-ring-container">
    <div class="button-ring" ref="containerRef" @click="handleClick" @mousedown="handlePointerDown" @touchstart="handlePointerDown"></div>
    
    <div class="button-ring-controls">
      <button class="control-button left" @click.stop="rotateLeft" aria-label="Previous button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <button class="control-button select" @click.stop="clickFocusedButton" aria-label="Select button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </button>
      
      <button class="control-button right" @click.stop="rotateRight" aria-label="Next button">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
    
    <div class="button-info">
      <div class="focused-button-label">{{ focusedButton?.label }}</div>
    </div>
  </div>
</template>

<style scoped>
.button-ring-container {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-ring {
  width: 100%;
  aspect-ratio: 1/1;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  touch-action: manipulation;
}

.button-ring-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.control-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-button:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.control-button svg {
  width: 1.5rem;
  height: 1.5rem;
}

.control-button.select {
  background-color: rgba(190, 77, 243, 0.8);
}

.control-button.select:hover {
  background-color: #be4df3;
}

.button-info {
  margin-top: 1rem;
  text-align: center;
}

.focused-button-label {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}
</style>
