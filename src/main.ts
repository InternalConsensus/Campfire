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
import { createRockRing, disposeRockRing } from '@components/RockGenerator';
import { createTeepee, disposeTeepee } from '@components/LogGenerator';
import { createGround, createFirePit, disposeGround } from '@components/Ground';
import { Fire } from '@components/Fire';
import { EmberSystem } from '@components/EmberSystem';
import { seed } from '@utils/noise';

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
  fire: Fire;
  embers: EmberSystem;
  rockRing: THREE.Group;
  teepee: THREE.Group;
  ground: THREE.Mesh;
  firePit: THREE.Mesh;
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

  // Set consistent seed for reproducible procedural generation
  seed(12345);

  // Procedural ground with height variation
  const ground = createGround({
    radius: 10,
    segments: 64,
    heightVariation: 0.08,
    noiseFrequency: 0.4,
    seed: 11111,
  });
  sceneManager.add(ground);

  // Fire pit depression
  const firePit = createFirePit();
  sceneManager.add(firePit);
  updateLoadingProgress(60);

  // Procedural rock ring around campfire
  const rockRing = createRockRing({
    count: 10,
    innerRadius: 1.4,
    outerRadius: 1.8,
    minScale: 0.4,
    maxScale: 0.7,
    seed: 22222,
  });
  sceneManager.add(rockRing);
  updateLoadingProgress(70);

  // Procedural log teepee
  const teepee = createTeepee({
    count: 5,
    lengthRange: [1.5, 2.0],
    radiusRange: [0.08, 0.12],
    angle: 55,
    angleVariation: 8,
    meetingHeight: 0.9,
    seed: 33333,
  });
  sceneManager.add(teepee);

  // Procedural fire with custom shaders
  const fire = new Fire({
    height: 2.2,
    radius: 0.55,
    intensity: 1.0,
    noiseScale: 2.5,
    scrollSpeed: 2.0,
    displacement: 0.2,
  });
  sceneManager.add(fire.getObject());

  // Ember particle system
  const embers = new EmberSystem({
    count: 800,
    origin: new THREE.Vector3(0, 0.8, 0),
    spawnRadius: 0.35,
    minLife: 2.5,
    maxLife: 4.5,
    minSize: 15,
    maxSize: 35,
    spawnRate: 60,
  });
  sceneManager.add(embers.getObject());
  updateLoadingProgress(80);

  // ============================================================================
  // Update Callbacks
  // ============================================================================

  // Register update callback for animations
  animationLoop.addUpdateCallback((deltaTime, elapsedTime) => {
    // Update fire animation
    fire.update(deltaTime);

    // Update ember particles
    embers.update(deltaTime);

    // Animate fire light flicker
    const flicker =
      Math.sin(elapsedTime * 8) * 0.15 +
      Math.sin(elapsedTime * 13) * 0.1 +
      Math.sin(elapsedTime * 23) * 0.05;
    fireLight.intensity = 2.5 + flicker;

    // Slight color temperature variation
    const colorFlicker = 0.02 * Math.sin(elapsedTime * 5);
    fireLight.color.setHSL(0.07 + colorFlicker, 1, 0.5);

    // Update camera controls
    cameraControls.update();
  });

  updateLoadingProgress(90);

  return {
    sceneManager,
    cameraControls,
    animationLoop,
    fireLight,
    fire,
    embers,
    rockRing,
    teepee,
    ground,
    firePit,
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
    // Dispose procedural components
    disposeRockRing(app.rockRing);
    disposeTeepee(app.teepee);
    disposeGround(app.ground);
    disposeGround(app.firePit);
    app.fire.dispose();
    app.embers.dispose();
    
    // Dispose core systems
    app.animationLoop.dispose();
    app.cameraControls.dispose();
    app.sceneManager.dispose();
    app = null;
  }
});
