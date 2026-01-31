/**
 * RockGenerator - Procedural rock geometry using IcosahedronGeometry with noise displacement
 * 
 * Creates natural-looking rocks by deforming icosahedron vertices with multi-octave noise.
 * Used for the ring of rocks around the campfire.
 */

import * as THREE from 'three';
import { fbm3D, seed } from '@utils/noise';

export interface RockOptions {
  /** Base radius of the rock (default: 0.3) */
  readonly radius?: number;
  /** Detail level - number of subdivisions (default: 1) */
  readonly detail?: number;
  /** Noise frequency - higher = more bumpy (default: 2.0) */
  readonly noiseFrequency?: number;
  /** Noise amplitude - displacement strength (default: 0.3) */
  readonly noiseAmplitude?: number;
  /** Number of noise octaves (default: 4) */
  readonly octaves?: number;
  /** Random seed for consistent generation */
  readonly seed?: number;
  /** Scale variation per axis for non-uniform shapes */
  readonly scaleVariation?: THREE.Vector3;
}

export interface RockRingOptions {
  /** Number of rocks in the ring (default: 10) */
  readonly count?: number;
  /** Inner radius of the ring (default: 1.5) */
  readonly innerRadius?: number;
  /** Outer radius of the ring (default: 2.0) */
  readonly outerRadius?: number;
  /** Minimum rock scale (default: 0.3) */
  readonly minScale?: number;
  /** Maximum rock scale (default: 0.6) */
  readonly maxScale?: number;
  /** Random seed */
  readonly seed?: number;
}

const DEFAULT_ROCK_OPTIONS: Required<Omit<RockOptions, 'seed' | 'scaleVariation'>> = {
  radius: 0.3,
  detail: 1,
  noiseFrequency: 2.0,
  noiseAmplitude: 0.3,
  octaves: 4,
};

/**
 * Create rock material with warm gray color
 */
export function createRockMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x4a4540,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true, // Gives rocks a faceted look
  });
}

/**
 * Generate a single procedural rock geometry
 */
export function createRockGeometry(options: RockOptions = {}): THREE.BufferGeometry {
  const opts = { ...DEFAULT_ROCK_OPTIONS, ...options };
  
  // Set seed if provided for reproducible rocks
  if (options.seed !== undefined) {
    seed(options.seed);
  }
  
  // Create base icosahedron
  const geometry = new THREE.IcosahedronGeometry(opts.radius, opts.detail);
  
  // Get position attribute
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  const normal = new THREE.Vector3();
  
  // Apply noise displacement to each vertex
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    
    // Get direction from center (normalized)
    normal.copy(vertex).normalize();
    
    // Calculate noise value at this vertex position
    const noiseValue = fbm3D(
      vertex.x * opts.noiseFrequency,
      vertex.y * opts.noiseFrequency,
      vertex.z * opts.noiseFrequency,
      opts.octaves
    );
    
    // Displace vertex along its normal direction
    const displacement = noiseValue * opts.noiseAmplitude * opts.radius;
    vertex.addScaledVector(normal, displacement);
    
    // Apply scale variation if provided
    if (options.scaleVariation) {
      vertex.multiply(options.scaleVariation);
    }
    
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  
  // Recompute normals after displacement
  geometry.computeVertexNormals();
  
  return geometry;
}

/**
 * Create a single rock mesh
 */
export function createRock(options: RockOptions = {}): THREE.Mesh {
  const geometry = createRockGeometry(options);
  const material = createRockMaterial();
  
  const rock = new THREE.Mesh(geometry, material);
  rock.castShadow = true;
  rock.receiveShadow = true;
  
  return rock;
}

/**
 * Generate a ring of rocks around a center point
 */
export function createRockRing(options: RockRingOptions = {}): THREE.Group {
  const count = options.count ?? 10;
  const innerRadius = options.innerRadius ?? 1.5;
  const outerRadius = options.outerRadius ?? 2.0;
  const minScale = options.minScale ?? 0.3;
  const maxScale = options.maxScale ?? 0.6;
  
  // Set seed for reproducible ring
  if (options.seed !== undefined) {
    seed(options.seed);
  }
  
  const group = new THREE.Group();
  group.name = 'RockRing';
  
  // Seeded random function
  let randomSeed = options.seed ?? Date.now();
  const seededRandom = (): number => {
    randomSeed = (randomSeed * 16807) % 2147483647;
    return (randomSeed - 1) / 2147483646;
  };
  
  for (let i = 0; i < count; i++) {
    // Calculate angle with slight random offset
    const baseAngle = (i / count) * Math.PI * 2;
    const angleOffset = (seededRandom() - 0.5) * (Math.PI * 2 / count) * 0.5;
    const angle = baseAngle + angleOffset;
    
    // Random radius between inner and outer
    const radius = innerRadius + seededRandom() * (outerRadius - innerRadius);
    
    // Random scale
    const scale = minScale + seededRandom() * (maxScale - minScale);
    
    // Create rock with unique seed
    const rock = createRock({
      radius: 0.25,
      detail: 1,
      noiseFrequency: 2.5 + seededRandom() * 1.5,
      noiseAmplitude: 0.25 + seededRandom() * 0.15,
      seed: Math.floor(seededRandom() * 1000000),
      scaleVariation: new THREE.Vector3(
        0.8 + seededRandom() * 0.4,
        0.6 + seededRandom() * 0.4,
        0.8 + seededRandom() * 0.4
      ),
    });
    
    // Position rock
    rock.position.set(
      Math.cos(angle) * radius,
      scale * 0.3, // Partially embedded in ground
      Math.sin(angle) * radius
    );
    
    // Random rotation
    rock.rotation.set(
      seededRandom() * Math.PI * 2,
      seededRandom() * Math.PI * 2,
      seededRandom() * Math.PI * 2
    );
    
    // Apply scale
    rock.scale.setScalar(scale);
    
    group.add(rock);
  }
  
  return group;
}

/**
 * Dispose of rock ring resources
 */
export function disposeRockRing(group: THREE.Group): void {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (child.material instanceof THREE.Material) {
        child.material.dispose();
      }
    }
  });
  group.clear();
}
