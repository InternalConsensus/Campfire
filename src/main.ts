/**
 * Campfire - High-Fidelity WebGL Experience
 * 
 * Entry point for the application.
 * Initializes core systems and starts the render loop.
 */

import * as THREE from 'three';
import { SceneManager } from '@core/SceneManager';
import { CameraControls } from '@core/CameraControls';
import { AnimationLoop } from '@core/AnimationLoop';

// ============================================================================
// Loading Screen Management
// ============================================================================

const loadingScreen = document.getElementById('loading-screen');
const progressFill = document.getElementById('progress-fill');

function updateLoadingProgress(percent: number): void {
  if (progressFill) {
    progressFill.style.width = `${percent}%`;
  }
}

function hideLoadingScreen(): void {
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
    setTimeout(() => {
      loadingScreen.style.display = 'none';
    }, 500);
  }
}

// ============================================================================
// Application State
// ============================================================================

interface AppState {
  sceneManager: SceneManager;
  cameraControls: CameraControls;
  animationLoop: AnimationLoop;
  fireLight: THREE.PointLight;
  firePlaceholder: THREE.Mesh;
}

let app: AppState | null = null;

// ============================================================================
// Initialization
// ============================================================================

function init(): AppState {
  updateLoadingProgress(10);

  // Get container
  const container = document.getElementById('app');
  if (!container) {
    throw new Error('Could not find #app container');
  }

  // Initialize SceneManager
  const sceneManager = SceneManager.init({ container });
  updateLoadingProgress(20);

  // Initialize CameraControls
  const cameraControls = new CameraControls({
    camera: sceneManager.camera,
    domElement: sceneManager.renderer.domElement,
    target: new THREE.Vector3(0, 1, 0),
    minDistance: 3,
    maxDistance: 15,
    maxPolarAngle: Math.PI / 2,
  });
  updateLoadingProgress(30);

  // Initialize AnimationLoop
  const animationLoop = new AnimationLoop({
    showFPS: true, // Enable for development
    onRender: () => sceneManager.render(),
  });
  updateLoadingProgress(40);

  // ============================================================================
  // Scene Content
  // ============================================================================

  // Ambient light (very dim, simulating night)
  const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.1);
  sceneManager.add(ambientLight);

  // Fire point light (animated in update loop)
  const fireLight = new THREE.PointLight(0xff6622, 2.5, 15, 2);
  fireLight.position.set(0, 1, 0);
  fireLight.castShadow = true;
  fireLight.shadow.mapSize.set(1024, 1024);
  fireLight.shadow.camera.near = 0.1;
  fireLight.shadow.camera.far = 15;
  sceneManager.add(fireLight);
  updateLoadingProgress(50);

  // Ground plane (placeholder - will be procedural)
  const groundGeometry = new THREE.CircleGeometry(10, 64);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1208,
    roughness: 0.9,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  sceneManager.add(ground);
  updateLoadingProgress(60);

  // Placeholder fire (simple cone - will be replaced with shader)
  const fireGeometry = new THREE.ConeGeometry(0.5, 1.5, 16);
  const fireMaterial = new THREE.MeshBasicMaterial({
    color: 0xff4500,
    transparent: true,
    opacity: 0.8,
  });
  const firePlaceholder = new THREE.Mesh(fireGeometry, fireMaterial);
  firePlaceholder.position.set(0, 0.75, 0);
  sceneManager.add(firePlaceholder);
  updateLoadingProgress(70);

  // Placeholder logs (simple cylinders - will be procedural)
  const logGeometry = new THREE.CylinderGeometry(0.08, 0.1, 1.5, 8);
  const logMaterial = new THREE.MeshStandardMaterial({
    color: 0x3d2817,
    roughness: 0.9,
    metalness: 0.0,
  });

  for (let i = 0; i < 5; i++) {
    const log = new THREE.Mesh(logGeometry, logMaterial);
    const angle = (i / 5) * Math.PI * 2;
    log.position.set(Math.cos(angle) * 0.3, 0.4, Math.sin(angle) * 0.3);
    log.rotation.z = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
    log.rotation.y = angle;
    log.castShadow = true;
    sceneManager.add(log);
  }
  updateLoadingProgress(80);

  // ============================================================================
  // Update Callbacks
  // ============================================================================

  // Register update callback for animations
  animationLoop.addUpdateCallback((deltaTime, elapsedTime) => {
    // Animate fire light flicker
    const flicker =
      Math.sin(elapsedTime * 8) * 0.15 +
      Math.sin(elapsedTime * 13) * 0.1 +
      Math.sin(elapsedTime * 23) * 0.05;
    fireLight.intensity = 2.5 + flicker;

    // Slight color temperature variation
    const colorFlicker = 0.02 * Math.sin(elapsedTime * 5);
    fireLight.color.setHSL(0.07 + colorFlicker, 1, 0.5);

    // Rotate placeholder fire slightly for visual interest
    firePlaceholder.rotation.y = elapsedTime * 0.5;

    // Update camera controls
    cameraControls.update();
  });

  updateLoadingProgress(90);

  return {
    sceneManager,
    cameraControls,
    animationLoop,
    fireLight,
    firePlaceholder,
  };
}

// ============================================================================
// Start Application
// ============================================================================

try {
  app = init();
  updateLoadingProgress(100);

  // Hide loading screen after a brief moment
  setTimeout(() => {
    hideLoadingScreen();
    app?.animationLoop.start();
  }, 500);

  // Log for development
  console.log('🔥 Campfire initialized');
  console.log('Three.js version:', THREE.REVISION);

  // Expose app to window for debugging
  if (import.meta.env.DEV) {
    (window as unknown as { app: AppState }).app = app;
  }
} catch (error) {
  console.error('Failed to initialize Campfire:', error);
  if (loadingScreen) {
    const loadingText = loadingScreen.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = 'Failed to load. Please refresh.';
    }
  }
}

// ============================================================================
// Cleanup on page unload
// ============================================================================

window.addEventListener('beforeunload', () => {
  if (app) {
    app.animationLoop.dispose();
    app.cameraControls.dispose();
    app.sceneManager.dispose();
    app = null;
  }
});
