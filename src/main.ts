/**
 * Campfire - High-Fidelity WebGL Experience
 * 
 * Entry point for the application.
 * Initializes Three.js scene and starts the render loop.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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
// Scene Setup
// ============================================================================

updateLoadingProgress(10);

// Get container
const container = document.getElementById('app');
if (!container) {
  throw new Error('Could not find #app container');
}

// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0604);

updateLoadingProgress(20);

// Create camera
// FOV 50, positioned to view campfire from slight angle
const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.set(0, 3, 8);
camera.lookAt(0, 1, 0);

updateLoadingProgress(30);

// Create renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance',
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
container.appendChild(renderer.domElement);

updateLoadingProgress(40);

// Create controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI / 2; // Don't go below ground
controls.target.set(0, 1, 0);
controls.update();

updateLoadingProgress(50);

// ============================================================================
// Temporary Scene Content (Placeholder)
// ============================================================================

// Ambient light (very dim, simulating night)
const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.1);
scene.add(ambientLight);

// Fire point light (will be animated later)
const fireLight = new THREE.PointLight(0xff6622, 2.5, 15, 2);
fireLight.position.set(0, 1, 0);
fireLight.castShadow = true;
fireLight.shadow.mapSize.set(1024, 1024);
fireLight.shadow.camera.near = 0.1;
fireLight.shadow.camera.far = 15;
scene.add(fireLight);

updateLoadingProgress(60);

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
scene.add(ground);

updateLoadingProgress(70);

// Placeholder fire (simple glowing sphere - will be replaced with shader)
const fireGeometry = new THREE.ConeGeometry(0.5, 1.5, 16);
const fireMaterial = new THREE.MeshBasicMaterial({
  color: 0xff4500,
  transparent: true,
  opacity: 0.8,
});
const firePlaceholder = new THREE.Mesh(fireGeometry, fireMaterial);
firePlaceholder.position.set(0, 0.75, 0);
scene.add(firePlaceholder);

updateLoadingProgress(80);

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
  scene.add(log);
}

updateLoadingProgress(90);

// ============================================================================
// Animation Loop
// ============================================================================

const clock = new THREE.Clock();

function animate(): void {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();

  // Animate fire light flicker
  const flicker =
    Math.sin(elapsed * 8) * 0.15 +
    Math.sin(elapsed * 13) * 0.1 +
    Math.sin(elapsed * 23) * 0.05;
  fireLight.intensity = 2.5 + flicker;

  // Slight color temperature variation
  const colorFlicker = 0.02 * Math.sin(elapsed * 5);
  fireLight.color.setHSL(0.07 + colorFlicker, 1, 0.5);

  // Rotate placeholder fire slightly for visual interest
  firePlaceholder.rotation.y = elapsed * 0.5;

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);
}

// ============================================================================
// Window Resize Handler
// ============================================================================

function onWindowResize(): void {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// ============================================================================
// Start Application
// ============================================================================

updateLoadingProgress(100);

// Hide loading screen after a brief moment
setTimeout(() => {
  hideLoadingScreen();
  animate();
}, 500);

// Log for development
console.log('🔥 Campfire initialized');
console.log('Three.js version:', THREE.REVISION);
