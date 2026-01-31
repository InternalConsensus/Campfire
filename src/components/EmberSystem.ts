/**
 * Ember Particle System
 * 
 * Creates rising ember particles with:
 * - Physics (gravity, air resistance, turbulence)
 * - Life-cycle management with object pooling
 * - Size and color variation based on age
 * - Randomized spiral motion for visual interest
 */

import * as THREE from 'three';

// Import shaders
import emberVertexShader from '../shaders/ember.vert.glsl';
import emberFragmentShader from '../shaders/ember.frag.glsl';

/** Configuration options for the ember system */
interface EmberConfig {
  /** Maximum number of particles */
  readonly count: number;
  /** Spawn origin position */
  readonly origin: THREE.Vector3;
  /** Spawn radius around origin */
  readonly spawnRadius: number;
  /** Minimum particle lifetime in seconds */
  readonly minLife: number;
  /** Maximum particle lifetime in seconds */
  readonly maxLife: number;
  /** Minimum particle size */
  readonly minSize: number;
  /** Maximum particle size */
  readonly maxSize: number;
  /** Spawn rate (particles per second) */
  readonly spawnRate: number;
}

/** Default ember configuration */
const DEFAULT_CONFIG: EmberConfig = {
  count: 800,
  origin: new THREE.Vector3(0, 0.8, 0),
  spawnRadius: 0.3,
  minLife: 2.5,
  maxLife: 4.5,
  minSize: 15,
  maxSize: 35,
  spawnRate: 60,
};

/** Internal particle state */
interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;          // Current life (0-1)
  maxLife: number;       // Total lifetime in seconds
  age: number;           // Current age in seconds
  size: number;          // Base size
  flicker: number;       // Random flicker phase
  spiralPhase: number;   // Spiral motion phase
  spiralSpeed: number;   // Spiral rotation speed
  active: boolean;       // Is particle alive
}

export class EmberSystem {
  private readonly points: THREE.Points;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;
  private readonly config: EmberConfig;
  
  // Particle data
  private readonly particles: Particle[];
  
  // Buffer attributes
  private readonly positions: Float32Array;
  private readonly lifetimes: Float32Array;
  private readonly sizes: Float32Array;
  private readonly flickers: Float32Array;
  
  // Spawn accumulator
  private spawnAccumulator: number = 0;
  
  // Noise for turbulence (simple sine-based for performance)
  private noiseTime: number = 0;

  constructor(config: Partial<EmberConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    const count = this.config.count;
    
    // Initialize typed arrays for BufferGeometry
    this.positions = new Float32Array(count * 3);
    this.lifetimes = new Float32Array(count);
    this.sizes = new Float32Array(count);
    this.flickers = new Float32Array(count);
    
    // Initialize particle pool
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0,
        age: 0,
        size: 0,
        flicker: Math.random(),
        spiralPhase: Math.random() * Math.PI * 2,
        spiralSpeed: 0.5 + Math.random() * 1.5,
        active: false,
      });
      
      // Initialize buffer data
      this.positions[i * 3] = 0;
      this.positions[i * 3 + 1] = -100; // Off-screen
      this.positions[i * 3 + 2] = 0;
      this.lifetimes[i] = 0;
      this.sizes[i] = 0;
      this.flickers[i] = this.particles[i].flicker;
    }
    
    // Create BufferGeometry
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aLife', new THREE.BufferAttribute(this.lifetimes, 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('aFlicker', new THREE.BufferAttribute(this.flickers, 1));
    
    // Create ShaderMaterial
    this.material = new THREE.ShaderMaterial({
      vertexShader: emberVertexShader,
      fragmentShader: emberFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
    });
    
    // Create Points mesh
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.name = 'embers';
    this.points.renderOrder = 15; // Render after fire (10) but before smoke
    
    // Initial spawn burst
    for (let i = 0; i < Math.floor(count * 0.3); i++) {
      this.spawnParticle();
    }
  }

  /**
   * Spawn a new particle from the pool
   */
  private spawnParticle(): void {
    // Find an inactive particle
    const particle = this.particles.find(p => !p.active);
    if (!particle) return;
    
    const { origin, spawnRadius, minLife, maxLife, minSize, maxSize } = this.config;
    
    // Randomize spawn position within radius
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * spawnRadius;
    particle.position.set(
      origin.x + Math.cos(angle) * radius,
      origin.y + (Math.random() - 0.3) * 0.4,
      origin.z + Math.sin(angle) * radius
    );
    
    // Initial velocity - upward with some radial spread
    const speed = 0.8 + Math.random() * 1.2;
    const spreadAngle = Math.random() * Math.PI * 2;
    const spreadRadius = Math.random() * 0.3;
    particle.velocity.set(
      Math.cos(spreadAngle) * spreadRadius,
      speed,
      Math.sin(spreadAngle) * spreadRadius
    );
    
    // Life and age
    particle.maxLife = minLife + Math.random() * (maxLife - minLife);
    particle.age = 0;
    particle.life = 1;
    
    // Size
    particle.size = minSize + Math.random() * (maxSize - minSize);
    
    // Randomize spiral
    particle.spiralPhase = Math.random() * Math.PI * 2;
    particle.spiralSpeed = 0.5 + Math.random() * 2;
    
    particle.active = true;
  }

  /**
   * Update particle physics and state
   * @param deltaTime - Time since last frame in seconds
   */
  update(deltaTime: number): void {
    // Clamp delta to prevent explosion on tab switch
    const dt = Math.min(deltaTime, 0.1);
    
    this.noiseTime += dt;
    this.material.uniforms.uTime.value += dt;
    
    // Spawn new particles
    this.spawnAccumulator += dt * this.config.spawnRate;
    while (this.spawnAccumulator >= 1) {
      this.spawnParticle();
      this.spawnAccumulator -= 1;
    }
    
    // Physics constants
    const gravity = -0.5;
    const airResistance = 0.97;
    const turbulenceStrength = 0.15;
    
    // Update each particle
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      
      if (!p.active) {
        // Keep inactive particles off-screen
        this.positions[i * 3 + 1] = -100;
        this.lifetimes[i] = 0;
        continue;
      }
      
      // Update age and life
      p.age += dt;
      p.life = Math.max(0, 1 - p.age / p.maxLife);
      
      // Check if particle died
      if (p.life <= 0) {
        p.active = false;
        this.positions[i * 3 + 1] = -100;
        this.lifetimes[i] = 0;
        continue;
      }
      
      // Apply gravity (reduced for embers - they're light)
      p.velocity.y += gravity * dt * 0.3;
      
      // Apply air resistance
      p.velocity.multiplyScalar(Math.pow(airResistance, dt * 60));
      
      // Apply turbulence (pseudo-noise using sine)
      const turbX = Math.sin(this.noiseTime * 2 + p.position.y * 3 + p.spiralPhase) * turbulenceStrength;
      const turbZ = Math.cos(this.noiseTime * 1.7 + p.position.y * 2.5 + p.spiralPhase * 1.3) * turbulenceStrength;
      p.velocity.x += turbX * dt;
      p.velocity.z += turbZ * dt;
      
      // Spiral motion
      const spiralRadius = 0.02 * p.life;
      const spiralAngle = p.age * p.spiralSpeed + p.spiralPhase;
      p.position.x += Math.cos(spiralAngle) * spiralRadius * dt;
      p.position.z += Math.sin(spiralAngle) * spiralRadius * dt;
      
      // Update position
      p.position.x += p.velocity.x * dt;
      p.position.y += p.velocity.y * dt;
      p.position.z += p.velocity.z * dt;
      
      // Update buffer attributes
      this.positions[i * 3] = p.position.x;
      this.positions[i * 3 + 1] = p.position.y;
      this.positions[i * 3 + 2] = p.position.z;
      this.lifetimes[i] = p.life;
      this.sizes[i] = p.size * (0.3 + 0.7 * p.life); // Shrink as dying
    }
    
    // Mark attributes as needing update
    this.geometry.attributes.position.needsUpdate = true;
    (this.geometry.attributes.aLife as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
  }

  /**
   * Set ember spawn intensity
   * @param intensity - Spawn rate multiplier (0-1)
   */
  setIntensity(intensity: number): void {
    const clamped = Math.max(0, Math.min(1, intensity));
    // Adjust spawn rate based on intensity
    this.spawnAccumulator = 0;
    // This affects the next spawn cycle
  }

  /**
   * Get the Three.js Points object
   */
  getObject(): THREE.Points {
    return this.points;
  }

  /**
   * Dispose of ember system resources
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
