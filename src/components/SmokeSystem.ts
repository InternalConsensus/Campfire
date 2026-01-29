/**
 * Smoke Particle System
 * 
 * Creates rising smoke particles above the fire with:
 * - Wispy, organic movement using noise-based turbulence
 * - Size expansion over lifetime
 * - Opacity fade
 * - Per-particle rotation
 * - Object pooling for performance
 */

import * as THREE from 'three';

// Import shaders
import smokeVertexShader from '../shaders/smoke.vert.glsl';
import smokeFragmentShader from '../shaders/smoke.frag.glsl';

/** Configuration for individual smoke particles */
interface SmokeParticle {
  /** Is this particle currently active */
  active: boolean;
  /** Current position */
  position: THREE.Vector3;
  /** Current velocity */
  velocity: THREE.Vector3;
  /** Current life (0 = just spawned, 1 = dead) */
  life: number;
  /** Life increment per second */
  lifeSpeed: number;
  /** Base size multiplier */
  size: number;
  /** Current rotation angle */
  rotation: number;
  /** Rotation speed (radians per second) */
  rotationSpeed: number;
  /** Noise offset for turbulence (unique per particle) */
  noiseOffset: THREE.Vector3;
}

/** Configuration options for the smoke system */
interface SmokeConfig {
  /** Maximum number of particles */
  readonly maxParticles: number;
  /** Particles to spawn per second */
  readonly spawnRate: number;
  /** Base size of particles */
  readonly baseSize: number;
  /** Base smoke color (dark gray with brown tint) */
  readonly color: THREE.Color;
  /** Spawn radius from center */
  readonly spawnRadius: number;
  /** Spawn height above ground */
  readonly spawnHeight: number;
  /** Minimum lifetime in seconds */
  readonly minLifetime: number;
  /** Maximum lifetime in seconds */
  readonly maxLifetime: number;
  /** Turbulence strength */
  readonly turbulenceStrength: number;
  /** Wind direction and strength */
  readonly wind: THREE.Vector3;
}

/** Default smoke configuration */
const DEFAULT_CONFIG: SmokeConfig = {
  maxParticles: 300,
  spawnRate: 15,        // Particles per second
  baseSize: 1.0,
  color: new THREE.Color(0x1a1612), // Dark gray with brown tint
  spawnRadius: 0.3,
  spawnHeight: 1.8,     // Spawn at top of fire
  minLifetime: 4.0,
  maxLifetime: 6.0,
  turbulenceStrength: 0.3,
  wind: new THREE.Vector3(0.1, 0, 0.05), // Slight wind
};

export class SmokeSystem {
  private readonly config: SmokeConfig;
  private readonly particles: SmokeParticle[];
  private readonly points: THREE.Points;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;

  // Typed arrays for GPU data
  private readonly positions: Float32Array;
  private readonly sizes: Float32Array;
  private readonly lives: Float32Array;
  private readonly rotations: Float32Array;

  // Spawn timing
  private spawnAccumulator: number = 0;
  private elapsedTime: number = 0;

  // Simplex noise for turbulence (simplified implementation)
  private readonly noiseScale: number = 0.5;

  constructor(config: Partial<SmokeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Initialize particle pool
    this.particles = [];
    for (let i = 0; i < this.config.maxParticles; i++) {
      this.particles.push({
        active: false,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        life: 0,
        lifeSpeed: 0,
        size: 1,
        rotation: 0,
        rotationSpeed: 0,
        noiseOffset: new THREE.Vector3(
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100
        ),
      });
    }

    // Create typed arrays
    this.positions = new Float32Array(this.config.maxParticles * 3);
    this.sizes = new Float32Array(this.config.maxParticles);
    this.lives = new Float32Array(this.config.maxParticles);
    this.rotations = new Float32Array(this.config.maxParticles);

    // Initialize all particles as invisible (life = 1 means dead)
    this.lives.fill(1);

    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.positions, 3)
    );
    this.geometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(this.sizes, 1)
    );
    this.geometry.setAttribute(
      'aLife',
      new THREE.BufferAttribute(this.lives, 1)
    );
    this.geometry.setAttribute(
      'aRotation',
      new THREE.BufferAttribute(this.rotations, 1)
    );

    // Create shader material
    this.material = new THREE.ShaderMaterial({
      vertexShader: smokeVertexShader,
      fragmentShader: smokeFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColor: { value: this.config.color },
        uOpacity: { value: 1.0 },
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
      depthTest: true,
    });

    // Create points mesh
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5; // Render after fire, before UI
    this.points.name = 'smoke-system';
  }

  /**
   * Spawn a new smoke particle
   */
  private spawnParticle(): void {
    // Find an inactive particle
    const particle = this.particles.find((p) => !p.active);
    if (!particle) return;

    // Activate and initialize
    particle.active = true;
    particle.life = 0;

    // Random lifetime
    const lifetime =
      this.config.minLifetime +
      Math.random() * (this.config.maxLifetime - this.config.minLifetime);
    particle.lifeSpeed = 1 / lifetime;

    // Spawn position (circular distribution at fire top)
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * this.config.spawnRadius;
    particle.position.set(
      Math.cos(angle) * radius,
      this.config.spawnHeight,
      Math.sin(angle) * radius
    );

    // Initial velocity (upward with slight randomness)
    const speed = 0.3 + Math.random() * 0.3;
    particle.velocity.set(
      (Math.random() - 0.5) * 0.1,
      speed,
      (Math.random() - 0.5) * 0.1
    );

    // Size variation
    particle.size = this.config.baseSize * (0.8 + Math.random() * 0.4);

    // Random initial rotation and speed
    particle.rotation = Math.random() * Math.PI * 2;
    particle.rotationSpeed = (0.01 + Math.random() * 0.02) * (Math.random() > 0.5 ? 1 : -1);

    // Unique noise offset for this particle
    particle.noiseOffset.set(
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100
    );
  }

  /**
   * Simple 3D noise approximation for turbulence
   */
  private noise3D(x: number, y: number, z: number): number {
    // Simple pseudo-noise using sine waves
    return (
      Math.sin(x * 1.2 + y * 0.7) * 0.3 +
      Math.sin(y * 1.5 + z * 0.9) * 0.3 +
      Math.sin(z * 0.8 + x * 1.1) * 0.4
    );
  }

  /**
   * Update all particles
   */
  update(deltaTime: number): void {
    this.elapsedTime += deltaTime;
    this.material.uniforms.uTime.value = this.elapsedTime;

    // Spawn new particles
    this.spawnAccumulator += deltaTime * this.config.spawnRate;
    while (this.spawnAccumulator >= 1) {
      this.spawnParticle();
      this.spawnAccumulator -= 1;
    }

    // Update each particle
    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      if (!particle.active) {
        // Keep dead particles invisible
        this.lives[i] = 1;
        continue;
      }

      // Update life
      particle.life += particle.lifeSpeed * deltaTime;

      // Check if dead
      if (particle.life >= 1) {
        particle.active = false;
        this.lives[i] = 1;
        continue;
      }

      // Apply turbulence using noise
      const noiseX = this.noise3D(
        particle.position.x * this.noiseScale + particle.noiseOffset.x,
        particle.position.y * this.noiseScale + this.elapsedTime * 0.3,
        particle.position.z * this.noiseScale
      );
      const noiseZ = this.noise3D(
        particle.position.z * this.noiseScale + particle.noiseOffset.z,
        particle.position.y * this.noiseScale + this.elapsedTime * 0.3,
        particle.position.x * this.noiseScale
      );

      // Apply turbulence to velocity
      particle.velocity.x += noiseX * this.config.turbulenceStrength * deltaTime;
      particle.velocity.z += noiseZ * this.config.turbulenceStrength * deltaTime;

      // Apply wind
      particle.velocity.add(
        this.config.wind.clone().multiplyScalar(deltaTime * 0.5)
      );

      // Slow down upward velocity over time (smoke disperses)
      particle.velocity.y *= 0.995;

      // Apply velocity to position
      particle.position.addScaledVector(particle.velocity, deltaTime);

      // Update rotation
      particle.rotation += particle.rotationSpeed;

      // Update GPU arrays
      const i3 = i * 3;
      this.positions[i3] = particle.position.x;
      this.positions[i3 + 1] = particle.position.y;
      this.positions[i3 + 2] = particle.position.z;

      this.sizes[i] = particle.size;
      this.lives[i] = particle.life;
      this.rotations[i] = particle.rotation;
    }

    // Mark attributes as needing update
    this.geometry.attributes.position.needsUpdate = true;
    (this.geometry.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aLife as THREE.BufferAttribute).needsUpdate = true;
    (this.geometry.attributes.aRotation as THREE.BufferAttribute).needsUpdate = true;
  }

  /**
   * Set overall opacity of smoke system
   */
  setOpacity(opacity: number): void {
    this.material.uniforms.uOpacity.value = Math.max(0, Math.min(1, opacity));
  }

  /**
   * Get the Three.js points object
   */
  getObject(): THREE.Points {
    return this.points;
  }

  /**
   * Get current particle count for debugging
   */
  getActiveCount(): number {
    return this.particles.filter((p) => p.active).length;
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
