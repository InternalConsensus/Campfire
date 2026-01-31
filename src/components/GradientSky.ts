/**
 * Gradient Sky Background
 * 
 * Creates a procedural gradient sky from horizon to zenith.
 * Uses a fullscreen quad rendered behind everything.
 */

import * as THREE from 'three';
import skyVertexShader from '../shaders/sky.vert';
import skyFragmentShader from '../shaders/sky.frag';

/** Configuration for the gradient sky */
interface SkyConfig {
  /** Color at the horizon */
  readonly horizonColor: THREE.Color;
  /** Color at the zenith (top) */
  readonly zenithColor: THREE.Color;
  /** Gradient curve power (1.0 = linear, higher = more horizon) */
  readonly gradientPower: number;
}

/** Default sky configuration - dark blue night sky */
const DEFAULT_CONFIG: SkyConfig = {
  horizonColor: new THREE.Color(0x0f1419),
  zenithColor: new THREE.Color(0x050508),
  gradientPower: 0.6,
};

export class GradientSky {
  private readonly config: SkyConfig;
  private readonly mesh: THREE.Mesh;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;

  constructor(config: Partial<SkyConfig> = {}) {
    this.config = {
      horizonColor: config.horizonColor ?? DEFAULT_CONFIG.horizonColor,
      zenithColor: config.zenithColor ?? DEFAULT_CONFIG.zenithColor,
      gradientPower: config.gradientPower ?? DEFAULT_CONFIG.gradientPower,
    };

    // Create large sphere geometry (inside-out for viewing from inside)
    this.geometry = new THREE.SphereGeometry(100, 32, 16);

    // Create shader material
    this.material = new THREE.ShaderMaterial({
      vertexShader: skyVertexShader,
      fragmentShader: skyFragmentShader,
      uniforms: {
        uHorizonColor: { value: this.config.horizonColor },
        uZenithColor: { value: this.config.zenithColor },
        uGradientPower: { value: this.config.gradientPower },
      },
      side: THREE.BackSide, // Render inside of sphere
      depthWrite: false,
    });

    // Create mesh
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'gradient-sky';
    this.mesh.renderOrder = -100; // Render first (behind everything)
  }

  /**
   * Set horizon color
   */
  setHorizonColor(color: THREE.Color): void {
    this.material.uniforms.uHorizonColor.value = color;
  }

  /**
   * Set zenith color
   */
  setZenithColor(color: THREE.Color): void {
    this.material.uniforms.uZenithColor.value = color;
  }

  /**
   * Set gradient power
   */
  setGradientPower(power: number): void {
    this.material.uniforms.uGradientPower.value = power;
  }

  /**
   * Get the Three.js mesh object
   */
  getObject(): THREE.Mesh {
    return this.mesh;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
