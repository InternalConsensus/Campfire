/**
 * Star Field System
 * 
 * Creates a procedural star field in the night sky with:
 * - Random star positions on a sphere
 * - Varying brightness and size
 * - Subtle twinkling animation
 * - HDR bright values for bloom pickup
 */

import * as THREE from 'three';

/** Configuration for the star field */
interface StarFieldConfig {
  /** Number of stars */
  readonly count: number;
  /** Radius of the star sphere */
  readonly radius: number;
  /** Base star size */
  readonly baseSize: number;
  /** Minimum elevation angle (radians, 0 = horizon) */
  readonly minElevation: number;
}

/** Default star field configuration */
const DEFAULT_CONFIG: StarFieldConfig = {
  count: 400,
  radius: 90, // Inside sky sphere (100)
  baseSize: 0.4, // Smaller for more realistic stars
  minElevation: 0.1, // ~5.7 degrees above horizon
};

export class StarField {
  private readonly config: StarFieldConfig;
  private readonly points: THREE.Points;
  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.PointsMaterial;
  
  // Arrays for twinkling
  private readonly baseBrightness: Float32Array;
  private readonly twinkleSpeed: Float32Array;
  private readonly twinklePhase: Float32Array;
  private readonly baseColors: Float32Array; // Store original colors
  
  private elapsedTime: number = 0;

  constructor(config: Partial<StarFieldConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    // Create geometry
    this.geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(this.config.count * 3);
    const colors = new Float32Array(this.config.count * 3);
    this.baseColors = new Float32Array(this.config.count * 3);
    this.baseBrightness = new Float32Array(this.config.count);
    this.twinkleSpeed = new Float32Array(this.config.count);
    this.twinklePhase = new Float32Array(this.config.count);

    for (let i = 0; i < this.config.count; i++) {
      // Random position on upper hemisphere
      const phi = Math.random() * Math.PI * 2; // Full rotation around Y
      const theta = this.config.minElevation + Math.random() * (Math.PI / 2 - this.config.minElevation);
      
      const x = this.config.radius * Math.cos(theta) * Math.cos(phi);
      const y = this.config.radius * Math.sin(theta);
      const z = this.config.radius * Math.cos(theta) * Math.sin(phi);
      
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      // Random brightness - use HDR values (> 1.0) for bloom pickup
      const brightness = 0.8 + Math.random() * 1.5; // 0.8 to 2.3
      this.baseBrightness[i] = brightness;
      
      // Twinkle parameters
      this.twinkleSpeed[i] = 0.3 + Math.random() * 1.5;
      this.twinklePhase[i] = Math.random() * Math.PI * 2;
      
      // Color: white to blue-white to yellow-white with HDR brightness
      const colorType = Math.random();
      let r: number, g: number, b: number;
      
      if (colorType < 0.6) {
        // White stars (60%)
        r = brightness;
        g = brightness;
        b = brightness;
      } else if (colorType < 0.85) {
        // Blue-white stars (25%)
        r = brightness * 0.85;
        g = brightness * 0.92;
        b = brightness * 1.1;
      } else {
        // Yellow-white stars (15%)
        r = brightness * 1.1;
        g = brightness * 1.0;
        b = brightness * 0.8;
      }
      
      // Store base colors for twinkling
      this.baseColors[i * 3] = r;
      this.baseColors[i * 3 + 1] = g;
      this.baseColors[i * 3 + 2] = b;
      
      colors[i * 3] = r;
      colors[i * 3 + 1] = g;
      colors[i * 3 + 2] = b;
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create material
    this.material = new THREE.PointsMaterial({
      size: this.config.baseSize,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create points mesh
    this.points = new THREE.Points(this.geometry, this.material);
    this.points.name = 'star-field';
    this.points.renderOrder = -90; // After sky (-100) but before other objects
    this.points.frustumCulled = false;
  }

  /**
   * Update star twinkling
   */
  update(deltaTime: number): void {
    this.elapsedTime += deltaTime;
    
    const colorAttr = this.geometry.attributes.color as THREE.BufferAttribute;
    
    for (let i = 0; i < this.config.count; i++) {
      // Calculate twinkle factor (0.6 to 1.0)
      const twinkle = 0.6 + 0.4 * Math.sin(
        this.elapsedTime * this.twinkleSpeed[i] + this.twinklePhase[i]
      );
      
      // Apply twinkle to base colors
      const r = this.baseColors[i * 3] * twinkle;
      const g = this.baseColors[i * 3 + 1] * twinkle;
      const b = this.baseColors[i * 3 + 2] * twinkle;
      
      colorAttr.setXYZ(i, r, g, b);
    }
    
    colorAttr.needsUpdate = true;
  }

  /**
   * Get the Three.js points object
   */
  getObject(): THREE.Points {
    return this.points;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
