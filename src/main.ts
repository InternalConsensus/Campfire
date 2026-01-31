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
import { Lighting, configureShadowRenderer, enableShadowCasting, enableShadowReceiving, enableShadows } from '@core/Lighting';
import { createRockRing, disposeRockRing } from '@components/RockGenerator';
import { createTeepee, disposeTeepee } from '@components/LogGenerator';
import { createGround, createFirePit, disposeGround } from '@components/Ground';
import { Fire } from '@components/Fire';
import { EmberSystem } from '@components/EmberSystem';
import { SmokeSystem } from '@components/SmokeSystem';
import { GradientSky } from '@components/GradientSky';
import { StarField } from '@components/StarField';
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
  lighting: Lighting;
  fire: Fire;
  embers: EmberSystem;
  smoke: SmokeSystem;
  rockRing: THREE.Group;
  teepee: THREE.Group;
  ground: THREE.Mesh;
  firePit: THREE.Mesh;
  gradientSky: GradientSky;
  starField: StarField;
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

  // Initialize SceneManager with post-processing enabled
  const sceneManager = SceneManager.init({ 
    container,
    enablePostProcessing: true,
  });
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
    onRender: (deltaTime) => sceneManager.render(deltaTime),
  });
  updateLoadingProgress(40);

  // ============================================================================
  // Scene Content
  // ============================================================================

  // Configure renderer for shadows
  configureShadowRenderer(sceneManager.renderer);

  // Gradient sky background (rendered first, behind everything)
  const gradientSky = new GradientSky();
  sceneManager.add(gradientSky.getObject());

  // Star field with twinkling
  const starField = new StarField();
  sceneManager.add(starField.getObject());

  // Add subtle atmospheric fog for depth
  sceneManager.scene.fog = new THREE.FogExp2(0x080810, 0.015);

  // Initialize lighting system (fire light, moonlight, ambient)
  const lighting = new Lighting({
    fireLight: {
      color: new THREE.Color(0xff6622),
      baseIntensity: 2.5,
      intensityVariation: 1.0,
      distance: 15,
      decay: 2,
      position: new THREE.Vector3(0, 1.0, 0),
      positionOffsetMax: 0.05,
      shadowMapSize: 1024,
    },
    moonlight: {
      color: new THREE.Color(0xaaccff),
      intensity: 0.12,
      direction: new THREE.Vector3(1, 2, 0.5).normalize(),
    },
    ambient: {
      color: new THREE.Color(0x0a0a1a),
      intensity: 0.08,
    },
  });
  sceneManager.add(lighting.getObject());
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
  enableShadowReceiving(ground); // Ground receives shadows
  sceneManager.add(ground);

  // Fire pit depression
  const firePit = createFirePit();
  enableShadowReceiving(firePit); // Fire pit receives shadows
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
  enableShadows(rockRing); // Rocks cast and receive shadows
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
  enableShadowCasting(teepee); // Logs cast shadows
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

  // Smoke particle system
  const smoke = new SmokeSystem({
    maxParticles: 300,
    spawnRate: 15,
    baseSize: 1.0,
    spawnRadius: 0.3,
    spawnHeight: 1.8,
    minLifetime: 4.0,
    maxLifetime: 6.0,
    turbulenceStrength: 0.3,
    wind: new THREE.Vector3(0.1, 0, 0.05),
  });
  sceneManager.add(smoke.getObject());
  updateLoadingProgress(80);

  // ============================================================================
  // Update Callbacks
  // ============================================================================

  // Register update callback for animations
  animationLoop.addUpdateCallback((deltaTime) => {
    // Update fire animation
    fire.update(deltaTime);

    // Update ember particles
    embers.update(deltaTime);

    // Update smoke particles
    smoke.update(deltaTime);

    // Update lighting (flickering, position offset)
    lighting.update(deltaTime);

    // Update star twinkling
    starField.update(deltaTime);

    // Update camera controls
    cameraControls.update();
  });

  updateLoadingProgress(90);

  return {
    sceneManager,
    cameraControls,
    animationLoop,
    lighting,
    fire,
    embers,
    smoke,
    rockRing,
    teepee,
    ground,
    firePit,
    gradientSky,
    starField,
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
    app.smoke.dispose();
    app.lighting.dispose();
    app.gradientSky.dispose();
    app.starField.dispose();
    
    // Dispose core systems
    app.animationLoop.dispose();
    app.cameraControls.dispose();
    app.sceneManager.dispose();
    app = null;
  }
});
