import { ref, onUnmounted } from 'vue';
import * as THREE from 'three';
import type { Point3D } from './useAnnotation';

// Extend the device event types for iOS permission handling
declare global {
  interface DeviceMotionEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  }
  interface DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  }
}

export interface CameraPose {
  position: Point3D;
  rotation: Point3D;
  projectionMatrix: number[];
  viewMatrix: number[];
}

export interface ARHitTestResult {
  worldPosition: Point3D;
  normal: Point3D;
  confidence: number;
}

export function useAR3D() {
  const isARSupported = ref(false);
  const isTracking = ref(false);
  const currentCameraPose = ref<CameraPose | null>(null);
  
  // Three.js scene setup
  const scene = ref<THREE.Scene | null>(null);
  const camera = ref<THREE.PerspectiveCamera | null>(null);
  const renderer = ref<THREE.WebGLRenderer | null>(null);
  
  // Device motion tracking for basic pose estimation
  const deviceOrientation = ref({ alpha: 0, beta: 0, gamma: 0 });
  const deviceMotion = ref({ x: 0, y: 0, z: 0 });
  
  // Initialize AR tracking
  const initializeAR = async (canvas: HTMLCanvasElement) => {
    try {
      // Initialize Three.js scene
      scene.value = new THREE.Scene();
      
      // Setup camera with realistic AR parameters
      camera.value = new THREE.PerspectiveCamera(
        75, // FOV - typical mobile camera
        canvas.width / canvas.height, // aspect ratio
        0.1, // near plane
        1000 // far plane
      );
      
      // Setup renderer
      renderer.value = new THREE.WebGLRenderer({ 
        canvas, 
        alpha: true,
        antialias: true
      });
      renderer.value.setSize(canvas.width, canvas.height);
      renderer.value.setClearColor(0x000000, 0); // Transparent background
      
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.value.add(ambientLight);
      
      // Add directional light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(1, 1, 1);
      scene.value.add(directionalLight);
      
      // Check for device motion support (iOS Safari)
      if (typeof DeviceMotionEvent !== 'undefined' && (DeviceMotionEvent as any).requestPermission) {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        if (permission === 'granted') {
          setupDeviceMotionTracking();
        }
      } else if (typeof DeviceMotionEvent !== 'undefined') {
        setupDeviceMotionTracking();
      }
      
      // Check for device orientation support (iOS Safari)
      if (typeof DeviceOrientationEvent !== 'undefined' && (DeviceOrientationEvent as any).requestPermission) {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          setupDeviceOrientationTracking();
        }
      } else if (typeof DeviceOrientationEvent !== 'undefined') {
        setupDeviceOrientationTracking();
      }
      
      isARSupported.value = true;
      isTracking.value = true;
      
      return true;
    } catch (error) {
      console.error('Failed to initialize AR:', error);
      return false;
    }
  };
  
  // Setup device motion tracking
  const setupDeviceMotionTracking = () => {
    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      if (event.acceleration) {
        deviceMotion.value = {
          x: event.acceleration.x || 0,
          y: event.acceleration.y || 0,
          z: event.acceleration.z || 0
        };
      }
      updateCameraPose();
    };
    
    window.addEventListener('devicemotion', handleDeviceMotion);
    
    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
    };
  };
  
  // Setup device orientation tracking
  const setupDeviceOrientationTracking = () => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      deviceOrientation.value = {
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0
      };
      updateCameraPose();
    };
    
    window.addEventListener('deviceorientationabsolute', handleDeviceOrientation);
    window.addEventListener('deviceorientation', handleDeviceOrientation);
    
    return () => {
      window.removeEventListener('deviceorientationabsolute', handleDeviceOrientation);
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  };
  
  // Update camera pose based on device sensors
  const updateCameraPose = () => {
    if (!camera.value) return;
    
    // Convert device orientation to Three.js rotation
    const alpha = THREE.MathUtils.degToRad(deviceOrientation.value.alpha);
    const beta = THREE.MathUtils.degToRad(deviceOrientation.value.beta);
    const gamma = THREE.MathUtils.degToRad(deviceOrientation.value.gamma);
    
    // Apply rotation to camera
    camera.value.rotation.set(beta, alpha, gamma);
    
    // Update camera pose
    currentCameraPose.value = {
      position: {
        x: camera.value.position.x,
        y: camera.value.position.y,
        z: camera.value.position.z
      },
      rotation: {
        x: camera.value.rotation.x,
        y: camera.value.rotation.y,
        z: camera.value.rotation.z
      },
      projectionMatrix: camera.value.projectionMatrix.toArray(),
      viewMatrix: camera.value.matrixWorldInverse.toArray()
    };
  };
  
  // Convert 2D screen coordinates to 3D world coordinates
  const screenToWorld = (screenX: number, screenY: number, depth: number = 2): Point3D => {
    if (!camera.value || !renderer.value) {
      return { x: 0, y: 0, z: 0 };
    }
    
    // Convert screen coordinates to normalized device coordinates
    const canvas = renderer.value.domElement;
    const rect = canvas.getBoundingClientRect();
    const x = ((screenX - rect.left) / rect.width) * 2 - 1;
    const y = -((screenY - rect.top) / rect.height) * 2 + 1;
    
    // Create a vector at the specified depth
    const vector = new THREE.Vector3(x, y, 0.5);
    vector.unproject(camera.value);
    
    // Calculate direction from camera to the point
    const direction = vector.sub(camera.value.position).normalize();
    
    // Project to specified depth
    const worldPosition = camera.value.position.clone().add(direction.multiplyScalar(depth));
    
    return {
      x: worldPosition.x,
      y: worldPosition.y,
      z: worldPosition.z
    };
  };
  
  // Convert 3D world coordinates to 2D screen coordinates
  const worldToScreen = (worldPoint: Point3D): { x: number; y: number } => {
    if (!camera.value || !renderer.value) {
      return { x: 0, y: 0 };
    }
    
    const vector = new THREE.Vector3(worldPoint.x, worldPoint.y, worldPoint.z);
    vector.project(camera.value);
    
    const canvas = renderer.value.domElement;
    const rect = canvas.getBoundingClientRect();
    
    return {
      x: (vector.x * 0.5 + 0.5) * rect.width + rect.left,
      y: (vector.y * -0.5 + 0.5) * rect.height + rect.top
    };
  };
  
  // Perform hit testing to find world surface
  const hitTest = (screenX: number, screenY: number): ARHitTestResult | null => {
    if (!camera.value || !scene.value) return null;
    
    // Create raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    const canvas = renderer.value?.domElement;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((screenX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((screenY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera.value);
    
    // For now, assume a virtual ground plane at z = 0
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const intersectPoint = new THREE.Vector3();
    
    if (raycaster.ray.intersectPlane(groundPlane, intersectPoint)) {
      return {
        worldPosition: {
          x: intersectPoint.x,
          y: intersectPoint.y,
          z: intersectPoint.z
        },
        normal: { x: 0, y: 0, z: 1 },
        confidence: 0.8
      };
    }
    
    return null;
  };
  
  // Render the AR scene
  const render = () => {
    if (!scene.value || !camera.value || !renderer.value) return;
    
    renderer.value.render(scene.value, camera.value);
  };
  
  // Add a 3D object to the scene
  const addToScene = (object: THREE.Object3D) => {
    if (scene.value) {
      scene.value.add(object);
    }
  };
  
  // Remove a 3D object from the scene
  const removeFromScene = (object: THREE.Object3D) => {
    if (scene.value) {
      scene.value.remove(object);
    }
  };
  
  // Cleanup
  const cleanup = () => {
    isTracking.value = false;
    
    if (renderer.value) {
      renderer.value.dispose();
      renderer.value = null;
    }
    
    if (scene.value) {
      scene.value.clear();
      scene.value = null;
    }
    
    camera.value = null;
  };
  
  onUnmounted(() => {
    cleanup();
  });
  
  return {
    isARSupported,
    isTracking,
    currentCameraPose,
    scene,
    camera,
    renderer,
    initializeAR,
    screenToWorld,
    worldToScreen,
    hitTest,
    render,
    addToScene,
    removeFromScene,
    cleanup
  };
}
