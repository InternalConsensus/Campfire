/**
 * Fire Component
 * 
 * Procedural volumetric fire using custom GLSL shaders
 * - FBM noise for flame turbulence
 * - Color ramp from white core to black edges
 * - Additive blending for glow effect
 */

import * as THREE from 'three';

// Import shaders
import fireVertexShader from '../shaders/fire.vert.glsl';
import fireFragmentShader from '../shaders/fire.frag.glsl';

/** Configuration options for the fire effect */
interface FireConfig {
  /** Height of the fire cone */
  readonly height: number;
  /** Base radius of the fire cone */
  readonly radius: number;
  /** Number of radial segments */
  readonly radialSegments: number;
  /** Number of height segments */
  readonly heightSegments: number;
  /** Overall fire intensity (0-1) */
  readonly intensity: number;
  /** Noise frequency multiplier */
  readonly noiseScale: number;
  /** Upward scroll speed */
  readonly scrollSpeed: number;
  /** Vertex displacement amount */
  readonly displacement: number;
}

/** Default fire configuration */
const DEFAULT_CONFIG: FireConfig = {
  height: 2.2,
  radius: 0.55,
  radialSegments: 32,
  heightSegments: 32,
  intensity: 1.0,
  noiseScale: 2.5,
  scrollSpeed: 2.0,
  displacement: 0.2,
};

export class Fire {
  private readonly group: THREE.Group;
  private readonly primaryFire: THREE.Mesh;
  private readonly secondaryFire: THREE.Mesh;
  private readonly primaryMaterial: THREE.ShaderMaterial;
  private readonly secondaryMaterial: THREE.ShaderMaterial;
  private readonly config: FireConfig;

  constructor(config: Partial<FireConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.group = new THREE.Group();
    this.group.name = 'fire';

    // Create primary fire layer
    const { mesh: primary, material: primaryMat } = this.createFireMesh(1.0, 0);
    this.primaryFire = primary;
    this.primaryMaterial = primaryMat;

    // Create secondary fire layer (slightly smaller, offset timing)
    const { mesh: secondary, material: secondaryMat } = this.createFireMesh(0.75, Math.PI);
    this.secondaryFire = secondary;
    this.secondaryMaterial = secondaryMat;

    // Secondary is slightly smaller and inside primary
    this.secondaryFire.scale.setScalar(0.85);
    this.secondaryFire.position.y = 0.05;

    // Add to group - only primary for now to debug artifact
    this.group.add(this.primaryFire);
    // this.group.add(this.secondaryFire); // DISABLED - debugging artifact

    // Position fire above ground level
    this.group.position.y = 0.1;
  }

  /**
   * Create a fire mesh with shader material
   */
  private createFireMesh(
    intensityMultiplier: number,
    timeOffset: number
  ): { mesh: THREE.Mesh; material: THREE.ShaderMaterial } {
    // Create cone geometry (inverted so normals face inward for better lighting)
    const geometry = new THREE.ConeGeometry(
      this.config.radius,
      this.config.height,
      this.config.radialSegments,
      this.config.heightSegments,
      true // Open ended
    );

    // Rotate so base is at bottom
    geometry.translate(0, this.config.height / 2, 0);

    // Create shader material
    const material = new THREE.ShaderMaterial({
      vertexShader: fireVertexShader,
      fragmentShader: fireFragmentShader,
      uniforms: {
        uTime: { value: timeOffset },
        uIntensity: { value: this.config.intensity * intensityMultiplier },
        uNoiseScale: { value: this.config.noiseScale },
        uScrollSpeed: { value: this.config.scrollSpeed },
        uDisplacement: { value: this.config.displacement },
        uColorCore: { value: new THREE.Color(0xffffee) },
        uColorMid: { value: new THREE.Color(0xff6600) },
        uColorOuter: { value: new THREE.Color(0x8b0000) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      side: THREE.DoubleSide, // Render both sides
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false; // Fire should always render
    mesh.renderOrder = 10; // Render after opaque objects

    return { mesh, material };
  }

  /**
   * Update fire animation
   * @param deltaTime - Time since last frame in seconds
   */
  update(deltaTime: number): void {
    // Update time uniforms
    this.primaryMaterial.uniforms.uTime.value += deltaTime;
    this.secondaryMaterial.uniforms.uTime.value += deltaTime;
  }

  /**
   * Set fire intensity
   * @param intensity - Fire intensity (0-1)
   */
  setIntensity(intensity: number): void {
    const clamped = Math.max(0, Math.min(1, intensity));
    this.primaryMaterial.uniforms.uIntensity.value = clamped;
    this.secondaryMaterial.uniforms.uIntensity.value = clamped * 0.75;
  }

  /**
   * Get the Three.js group containing the fire
   */
  getObject(): THREE.Group {
    return this.group;
  }

  /**
   * Dispose of fire resources
   */
  dispose(): void {
    this.primaryFire.geometry.dispose();
    this.primaryMaterial.dispose();
    this.secondaryFire.geometry.dispose();
    this.secondaryMaterial.dispose();
    this.group.clear();
  }
}
