/**
 * Ground - Procedural ground plane with subtle height variation
 * 
 * Creates a circular ground plane around the campfire with noise-based
 * terrain displacement for natural appearance.
 */

import * as THREE from 'three';
import { fbm2D, seed } from '@utils/noise';

export interface GroundOptions {
  /** Radius of the ground plane (default: 10) */
  readonly radius?: number;
  /** Number of radial segments (default: 64) */
  readonly segments?: number;
  /** Height variation amplitude (default: 0.1) */
  readonly heightVariation?: number;
  /** Noise frequency (default: 0.5) */
  readonly noiseFrequency?: number;
  /** Random seed */
  readonly seed?: number;
}

const DEFAULT_GROUND_OPTIONS: Required<Omit<GroundOptions, 'seed'>> = {
  radius: 10,
  segments: 64,
  heightVariation: 0.1,
  noiseFrequency: 0.5,
};

/**
 * Create ground material - dark earth with subtle warmth from firelight
 */
export function createGroundMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x1f1510,
    roughness: 0.98,
    metalness: 0.0,
  });
}

/**
 * Generate procedural ground geometry with height variation
 */
export function createGroundGeometry(options: GroundOptions = {}): THREE.BufferGeometry {
  const opts = { ...DEFAULT_GROUND_OPTIONS, ...options };
  
  // Set seed if provided
  if (options.seed !== undefined) {
    seed(options.seed);
  }
  
  // Create circle geometry
  const geometry = new THREE.CircleGeometry(opts.radius, opts.segments);
  
  // Rotate to horizontal (default is vertical facing +Z)
  geometry.rotateX(-Math.PI / 2);
  
  // Get position attribute
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  
  // Apply height displacement
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    
    // Skip center vertex (keep it flat for fire pit area)
    const distFromCenter = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
    
    if (distFromCenter > 0.5) {
      // Calculate noise-based height
      const noiseValue = fbm2D(
        vertex.x * opts.noiseFrequency,
        vertex.z * opts.noiseFrequency,
        3 // 3 octaves
      );
      
      // Scale displacement by distance from center (flatter near fire)
      const centerFalloff = Math.min(1, (distFromCenter - 0.5) / 2);
      const height = noiseValue * opts.heightVariation * centerFalloff;
      
      vertex.y = height;
    }
    
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  
  // Recompute normals for proper lighting
  geometry.computeVertexNormals();
  
  return geometry;
}

/**
 * Create ground mesh
 */
export function createGround(options: GroundOptions = {}): THREE.Mesh {
  const geometry = createGroundGeometry(options);
  const material = createGroundMaterial();
  
  const ground = new THREE.Mesh(geometry, material);
  ground.receiveShadow = true;
  ground.name = 'Ground';
  
  return ground;
}

/**
 * Create fire pit depression in the center
 * A slight bowl shape where the fire sits
 */
export function createFirePit(): THREE.Mesh {
  const geometry = new THREE.CircleGeometry(0.8, 32);
  geometry.rotateX(-Math.PI / 2);
  
  // Create slight depression
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    
    const dist = Math.sqrt(vertex.x * vertex.x + vertex.z * vertex.z);
    // Parabolic depression, deepest at center
    const depth = -0.05 * (1 - (dist / 0.8) ** 2);
    vertex.y = depth;
    
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  
  geometry.computeVertexNormals();
  
  const material = new THREE.MeshStandardMaterial({
    color: 0x0d0805, // Darker, ash-covered
    roughness: 1.0,
    metalness: 0.0,
  });
  
  const pit = new THREE.Mesh(geometry, material);
  pit.position.y = 0.001; // Slightly above ground to prevent z-fighting
  pit.receiveShadow = true;
  pit.name = 'FirePit';
  
  return pit;
}

/**
 * Dispose of ground resources
 */
export function disposeGround(ground: THREE.Mesh): void {
  ground.geometry.dispose();
  if (ground.material instanceof THREE.Material) {
    ground.material.dispose();
  }
}
