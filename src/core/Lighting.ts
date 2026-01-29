/**
 * Lighting System
 * 
 * Dynamic lighting for the campfire scene with:
 * - Fire point light with noise-based flickering
 * - Subtle position offset for dynamic shadows
 * - Moonlight for ambient fill
 * - Night atmosphere ambient light
 * - Optimized shadow mapping
 */

import * as THREE from 'three';

/** Configuration for the fire light */
interface FireLightConfig {
  /** Base color of fire light */
  readonly color: THREE.Color;
  /** Base intensity */
  readonly baseIntensity: number;
  /** Intensity variation range (+/-) */
  readonly intensityVariation: number;
  /** Light distance (falloff) */
  readonly distance: number;
  /** Light decay rate */
  readonly decay: number;
  /** Position of fire light */
  readonly position: THREE.Vector3;
  /** Maximum position offset for dynamic shadows */
  readonly positionOffsetMax: number;
  /** Shadow map size */
  readonly shadowMapSize: number;
}

/** Configuration for moonlight */
interface MoonlightConfig {
  /** Moonlight color (blue-white) */
  readonly color: THREE.Color;
  /** Light intensity */
  readonly intensity: number;
  /** Direction the moonlight comes from */
  readonly direction: THREE.Vector3;
}

/** Configuration for ambient light */
interface AmbientConfig {
  /** Ambient color (dark blue for night) */
  readonly color: THREE.Color;
  /** Light intensity */
  readonly intensity: number;
}

/** Full lighting configuration */
interface LightingConfig {
  readonly fireLight: FireLightConfig;
  readonly moonlight: MoonlightConfig;
  readonly ambient: AmbientConfig;
}

/** Default lighting configuration */
const DEFAULT_CONFIG: LightingConfig = {
  fireLight: {
    color: new THREE.Color(0xff6622),
    baseIntensity: 2.5,
    intensityVariation: 1.0, // Range: 1.5 to 3.5
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
};

export class Lighting {
  private readonly config: LightingConfig;
  private readonly group: THREE.Group;

  // Lights
  private readonly fireLight: THREE.PointLight;
  private readonly moonlight: THREE.DirectionalLight;
  private readonly ambientLight: THREE.AmbientLight;

  // Original fire light position for offset calculations
  private readonly fireLightBasePosition: THREE.Vector3;

  // Noise time accumulator
  private noiseTime: number = 0;

  constructor(config: Partial<LightingConfig> = {}) {
    // Deep merge config
    this.config = {
      fireLight: { ...DEFAULT_CONFIG.fireLight, ...config.fireLight },
      moonlight: { ...DEFAULT_CONFIG.moonlight, ...config.moonlight },
      ambient: { ...DEFAULT_CONFIG.ambient, ...config.ambient },
    };

    this.group = new THREE.Group();
    this.group.name = 'lighting';

    // =========================================================================
    // Fire Point Light
    // =========================================================================
    this.fireLight = new THREE.PointLight(
      this.config.fireLight.color,
      this.config.fireLight.baseIntensity,
      this.config.fireLight.distance,
      this.config.fireLight.decay
    );
    this.fireLight.position.copy(this.config.fireLight.position);
    this.fireLightBasePosition = this.config.fireLight.position.clone();

    // Shadow configuration
    this.fireLight.castShadow = true;
    this.fireLight.shadow.mapSize.set(
      this.config.fireLight.shadowMapSize,
      this.config.fireLight.shadowMapSize
    );
    this.fireLight.shadow.camera.near = 0.5;
    this.fireLight.shadow.camera.far = 15;
    this.fireLight.shadow.bias = -0.001;
    this.fireLight.shadow.radius = 4; // Soft shadow edges

    this.group.add(this.fireLight);

    // =========================================================================
    // Moonlight (Directional)
    // =========================================================================
    this.moonlight = new THREE.DirectionalLight(
      this.config.moonlight.color,
      this.config.moonlight.intensity
    );
    
    // Position moonlight based on direction
    const moonPos = this.config.moonlight.direction.clone().multiplyScalar(20);
    this.moonlight.position.copy(moonPos);
    this.moonlight.target.position.set(0, 0, 0);
    
    // Moonlight shadows (softer, less defined)
    this.moonlight.castShadow = true;
    this.moonlight.shadow.mapSize.set(512, 512);
    this.moonlight.shadow.camera.near = 0.5;
    this.moonlight.shadow.camera.far = 50;
    this.moonlight.shadow.camera.left = -10;
    this.moonlight.shadow.camera.right = 10;
    this.moonlight.shadow.camera.top = 10;
    this.moonlight.shadow.camera.bottom = -10;
    this.moonlight.shadow.bias = -0.0005;
    this.moonlight.shadow.radius = 8;

    this.group.add(this.moonlight);
    this.group.add(this.moonlight.target);

    // =========================================================================
    // Ambient Light (Night atmosphere)
    // =========================================================================
    this.ambientLight = new THREE.AmbientLight(
      this.config.ambient.color,
      this.config.ambient.intensity
    );
    this.group.add(this.ambientLight);
  }

  /**
   * Simple noise function for light flickering
   * Uses multiple sine waves to simulate Perlin noise
   */
  private noise(t: number): number {
    return (
      Math.sin(t * 8.0) * 0.3 +
      Math.sin(t * 13.0) * 0.25 +
      Math.sin(t * 21.0) * 0.2 +
      Math.sin(t * 34.0) * 0.15 +
      Math.sin(t * 55.0) * 0.1
    );
  }

  /**
   * Update lighting effects
   * @param deltaTime - Time since last frame in seconds
   */
  update(deltaTime: number): void {
    this.noiseTime += deltaTime;

    // =========================================================================
    // Fire light intensity flickering
    // =========================================================================
    const intensityNoise = this.noise(this.noiseTime);
    const intensity =
      this.config.fireLight.baseIntensity +
      intensityNoise * this.config.fireLight.intensityVariation;
    
    this.fireLight.intensity = Math.max(0.5, intensity);

    // =========================================================================
    // Fire light color temperature variation
    // =========================================================================
    // Shift between orange and yellow based on intensity
    const hue = 0.06 + intensityNoise * 0.02; // Range: ~0.04 to ~0.08
    const saturation = 0.95 + intensityNoise * 0.05;
    const lightness = 0.5 + intensityNoise * 0.05;
    this.fireLight.color.setHSL(hue, saturation, lightness);

    // =========================================================================
    // Fire light position offset for dynamic shadows
    // =========================================================================
    const offsetX = this.noise(this.noiseTime * 1.3) * this.config.fireLight.positionOffsetMax;
    const offsetZ = this.noise(this.noiseTime * 1.7 + 100) * this.config.fireLight.positionOffsetMax;
    const offsetY = this.noise(this.noiseTime * 0.9 + 200) * this.config.fireLight.positionOffsetMax * 0.5;

    this.fireLight.position.set(
      this.fireLightBasePosition.x + offsetX,
      this.fireLightBasePosition.y + offsetY,
      this.fireLightBasePosition.z + offsetZ
    );
  }

  /**
   * Get the fire point light for external access
   */
  getFireLight(): THREE.PointLight {
    return this.fireLight;
  }

  /**
   * Get the moonlight for external access
   */
  getMoonlight(): THREE.DirectionalLight {
    return this.moonlight;
  }

  /**
   * Get the ambient light for external access
   */
  getAmbientLight(): THREE.AmbientLight {
    return this.ambientLight;
  }

  /**
   * Get the Three.js group containing all lights
   */
  getObject(): THREE.Group {
    return this.group;
  }

  /**
   * Set fire intensity multiplier
   */
  setFireIntensity(multiplier: number): void {
    const clamped = Math.max(0, Math.min(2, multiplier));
    this.config.fireLight.baseIntensity;
    // Store original and apply multiplier
    this.fireLight.intensity = this.config.fireLight.baseIntensity * clamped;
  }

  /**
   * Dispose of lighting resources
   */
  dispose(): void {
    this.fireLight.dispose();
    this.moonlight.dispose();
    this.ambientLight.dispose();
    this.group.clear();
  }
}

/**
 * Configure shadow settings on the renderer
 */
export function configureShadowRenderer(renderer: THREE.WebGLRenderer): void {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

/**
 * Configure an object to cast shadows
 */
export function enableShadowCasting(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
    }
  });
}

/**
 * Configure an object to receive shadows
 */
export function enableShadowReceiving(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.receiveShadow = true;
    }
  });
}

/**
 * Configure an object to both cast and receive shadows
 */
export function enableShadows(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}
