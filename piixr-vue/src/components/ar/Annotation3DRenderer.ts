import * as THREE from 'three';
import type { Annotation } from '../../composables/useAnnotation';

export class Annotation3DRenderer {
  private scene: THREE.Scene;
  private annotationObjects: Map<string, THREE.Object3D[]> = new Map();
  private materials: Map<string, THREE.Material> = new Map();
  
  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }
  
  // Create a 3D annotation object from annotation data
  createAnnotation(annotation: Annotation): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    // Remove existing objects for this annotation
    this.removeAnnotation(annotation.id);
    
    // Get or create material for this color
    const material = this.getMaterial(annotation.color);
    
    switch (annotation.type) {
      case 'arrow':
        objects.push(...this.createArrow(annotation, material));
        break;
      case 'circle':
        objects.push(...this.createCircle(annotation, material));
        break;
      case 'rectangle':
        objects.push(...this.createRectangle(annotation, material));
        break;
      case 'freehand':
        objects.push(...this.createFreehand(annotation, material));
        break;
      case 'text':
        objects.push(...this.createText(annotation, material));
        break;
    }
    
    // Add objects to scene
    objects.forEach(obj => this.scene.add(obj));
    
    // Store reference to objects
    this.annotationObjects.set(annotation.id, objects);
    
    return objects;
  }
  
  // Remove an annotation from the scene
  removeAnnotation(annotationId: string) {
    const objects = this.annotationObjects.get(annotationId);
    if (objects) {
      objects.forEach(obj => {
        this.scene.remove(obj);
        // Dispose of geometry and materials
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach(mat => mat.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      this.annotationObjects.delete(annotationId);
    }
  }
  
  // Get or create material for a color
  private getMaterial(color: string): THREE.MeshBasicMaterial {
    if (!this.materials.has(color)) {
      const material = new THREE.MeshBasicMaterial({ 
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.8
      });
      this.materials.set(color, material);
    }
    return this.materials.get(color)! as THREE.MeshBasicMaterial;
  }
  
  // Create arrow annotation
  private createArrow(annotation: Annotation, material: THREE.MeshBasicMaterial): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    if (!annotation.worldPoints || annotation.worldPoints.length < 2) {
      return objects;
    }
    
    const start = annotation.worldPoints[0];
    const end = annotation.worldPoints[annotation.worldPoints.length - 1];
    
    // Create arrow shaft
    const direction = new THREE.Vector3(end.x - start.x, end.y - start.y, end.z - start.z);
    const length = direction.length();
    const cylinderGeometry = new THREE.CylinderGeometry(0.02, 0.02, length, 8);
    const shaft = new THREE.Mesh(cylinderGeometry, material);
    
    // Position and orient shaft
    shaft.position.set(
      (start.x + end.x) / 2,
      (start.y + end.y) / 2,
      (start.z + end.z) / 2
    );
    shaft.lookAt(new THREE.Vector3(end.x, end.y, end.z));
    shaft.rotateX(Math.PI / 2);
    
    objects.push(shaft);
    
    // Create arrow head
    const coneGeometry = new THREE.ConeGeometry(0.05, 0.15, 8);
    const head = new THREE.Mesh(coneGeometry, material);
    head.position.set(end.x, end.y, end.z);
    head.lookAt(new THREE.Vector3(start.x, start.y, start.z));
    head.rotateX(-Math.PI / 2);
    
    objects.push(head);
    
    return objects;
  }
  
  // Create circle annotation
  private createCircle(annotation: Annotation, material: THREE.MeshBasicMaterial): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    if (!annotation.worldPoints || annotation.worldPoints.length < 2) {
      return objects;
    }
    
    const center = annotation.worldPoints[0];
    const edge = annotation.worldPoints[annotation.worldPoints.length - 1];
    
    // Calculate radius
    const radius = Math.sqrt(
      Math.pow(edge.x - center.x, 2) + 
      Math.pow(edge.y - center.y, 2) + 
      Math.pow(edge.z - center.z, 2)
    );
    
    // Create circle geometry (torus for better visibility)
    const torusGeometry = new THREE.TorusGeometry(radius, 0.02, 8, 32);
    const circle = new THREE.Mesh(torusGeometry, material);
    circle.position.set(center.x, center.y, center.z);
    
    objects.push(circle);
    
    return objects;
  }
  
  // Create rectangle annotation
  private createRectangle(annotation: Annotation, material: THREE.MeshBasicMaterial): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    if (!annotation.worldPoints || annotation.worldPoints.length < 2) {
      return objects;
    }
    
    const corner1 = annotation.worldPoints[0];
    const corner2 = annotation.worldPoints[annotation.worldPoints.length - 1];
    
    // Calculate dimensions
    const width = Math.abs(corner2.x - corner1.x);
    const height = Math.abs(corner2.y - corner1.y);
    const depth = 0.04; // Thin rectangle
    
    // Create box geometry
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const lineMaterial = new THREE.LineBasicMaterial({ color: material.color });
    const edges = new THREE.EdgesGeometry(boxGeometry);
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    
    // Position rectangle
    wireframe.position.set(
      (corner1.x + corner2.x) / 2,
      (corner1.y + corner2.y) / 2,
      (corner1.z + corner2.z) / 2
    );
    
    objects.push(wireframe);
    
    return objects;
  }
  
  // Create freehand annotation
  private createFreehand(annotation: Annotation, material: THREE.MeshBasicMaterial): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    if (!annotation.worldPoints || annotation.worldPoints.length < 2) {
      return objects;
    }
    
    // Create line geometry from points
    const points = annotation.worldPoints.map(p => new THREE.Vector3(p.x, p.y, p.z));
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const lineMaterial = new THREE.LineBasicMaterial({ 
      color: material.color,
      linewidth: 3
    });
    
    const line = new THREE.Line(lineGeometry, lineMaterial);
    objects.push(line);
    
    return objects;
  }
  
  // Create text annotation
  private createText(annotation: Annotation, _material: THREE.MeshBasicMaterial): THREE.Object3D[] {
    const objects: THREE.Object3D[] = [];
    
    if (!annotation.worldPoints || annotation.worldPoints.length < 1 || !annotation.text) {
      return objects;
    }
    
    const position = annotation.worldPoints[0];
    
    // Create text using canvas texture
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    
    // Set font and style
    context.font = '24px Arial';
    context.fillStyle = annotation.color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // Draw text
    context.fillText(annotation.text, canvas.width / 2, canvas.height / 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    const textMaterial = new THREE.MeshBasicMaterial({ 
      map: texture,
      transparent: true,
      alphaTest: 0.1
    });
    
    // Create plane for text
    const planeGeometry = new THREE.PlaneGeometry(1, 0.25);
    const textMesh = new THREE.Mesh(planeGeometry, textMaterial);
    textMesh.position.set(position.x, position.y, position.z);
    
    // Make text face camera
    textMesh.lookAt(0, 0, 0);
    
    objects.push(textMesh);
    
    return objects;
  }
  
  // Update annotation (recreate with new data)
  updateAnnotation(annotation: Annotation) {
    this.createAnnotation(annotation);
  }
  
  // Clear all annotations
  clearAll() {
    this.annotationObjects.forEach((_, id) => {
      this.removeAnnotation(id);
    });
    this.annotationObjects.clear();
  }
  
  // Dispose of all materials
  dispose() {
    this.clearAll();
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
  }
}
