/**
 * LogGenerator - Procedural log geometry using CylinderGeometry with bark noise
 * 
 * Creates realistic logs with tapered ends and bark texture displacement.
 * Generates logs in teepee formation for the campfire.
 */

import * as THREE from 'three';
import { fbm3D, seed } from '@utils/noise';

export interface LogOptions {
  /** Length of the log (default: 1.8) */
  readonly length?: number;
  /** Radius at the base (thicker end) (default: 0.12) */
  readonly radiusBottom?: number;
  /** Radius at the top (thinner end) (default: 0.08) */
  readonly radiusTop?: number;
  /** Number of radial segments (default: 12) */
  readonly radialSegments?: number;
  /** Number of height segments (default: 8) */
  readonly heightSegments?: number;
  /** Bark noise frequency (default: 8.0) */
  readonly barkFrequency?: number;
  /** Bark noise amplitude (default: 0.015) */
  readonly barkAmplitude?: number;
  /** Random seed for consistent generation */
  readonly seed?: number;
}

export interface TeepeeOptions {
  /** Number of logs (default: 5) */
  readonly count?: number;
  /** Log length range [min, max] (default: [1.5, 2.0]) */
  readonly lengthRange?: [number, number];
  /** Log radius range [min, max] (default: [0.08, 0.12]) */
  readonly radiusRange?: [number, number];
  /** Angle from vertical in degrees (default: 55) */
  readonly angle?: number;
  /** Angle variation in degrees (default: 10) */
  readonly angleVariation?: number;
  /** Height where logs meet (default: 0.8) */
  readonly meetingHeight?: number;
  /** Random seed */
  readonly seed?: number;
}

const DEFAULT_LOG_OPTIONS: Required<Omit<LogOptions, 'seed'>> = {
  length: 1.8,
  radiusBottom: 0.12,
  radiusTop: 0.08,
  radialSegments: 12,
  heightSegments: 8,
  barkFrequency: 8.0,
  barkAmplitude: 0.015,
};

/**
 * Create log material with dark brown wood color and subtle fire glow
 */
export function createLogMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x2a1810,
    roughness: 0.92,
    metalness: 0.0,
    emissive: 0x220800,
    emissiveIntensity: 0.15,
  });
}

/**
 * Create charred log material for logs touching fire - glowing embers
 */
export function createCharredLogMaterial(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x0f0805,
    roughness: 0.95,
    metalness: 0.0,
    emissive: 0x441100,
    emissiveIntensity: 0.3,
  });
}

/**
 * Generate a single procedural log geometry with bark texture
 */
export function createLogGeometry(options: LogOptions = {}): THREE.BufferGeometry {
  const opts = { ...DEFAULT_LOG_OPTIONS, ...options };
  
  // Set seed if provided
  if (options.seed !== undefined) {
    seed(options.seed);
  }
  
  // Create tapered cylinder
  const geometry = new THREE.CylinderGeometry(
    opts.radiusTop,
    opts.radiusBottom,
    opts.length,
    opts.radialSegments,
    opts.heightSegments,
    false // open ended = false (closed caps)
  );
  
  // Get position attribute
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  
  // Apply bark displacement
  for (let i = 0; i < positions.count; i++) {
    vertex.fromBufferAttribute(positions, i);
    
    // Only displace vertices on the curved surface (not caps)
    // Caps are at y = ±length/2
    const isOnCap = Math.abs(Math.abs(vertex.y) - opts.length / 2) < 0.001;
    
    if (!isOnCap) {
      // Calculate radial direction (perpendicular to cylinder axis)
      const radialDir = new THREE.Vector2(vertex.x, vertex.z).normalize();
      
      // Use cylindrical coordinates for noise
      const theta = Math.atan2(vertex.z, vertex.x);
      const noiseValue = fbm3D(
        theta * opts.barkFrequency,
        vertex.y * opts.barkFrequency * 0.5,
        (options.seed ?? 0) * 0.001,
        3 // 3 octaves for bark detail
      );
      
      // Displace outward
      const displacement = noiseValue * opts.barkAmplitude;
      vertex.x += radialDir.x * displacement;
      vertex.z += radialDir.y * displacement;
    }
    
    positions.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  
  // Recompute normals
  geometry.computeVertexNormals();
  
  return geometry;
}

/**
 * Create a single log mesh
 */
export function createLog(options: LogOptions = {}): THREE.Mesh {
  const geometry = createLogGeometry(options);
  const material = createLogMaterial();
  
  const log = new THREE.Mesh(geometry, material);
  log.castShadow = true;
  log.receiveShadow = true;
  
  return log;
}

/**
 * Generate logs in teepee formation
 */
export function createTeepee(options: TeepeeOptions = {}): THREE.Group {
  const count = options.count ?? 5;
  const lengthRange = options.lengthRange ?? [1.5, 2.0];
  const radiusRange = options.radiusRange ?? [0.08, 0.12];
  const baseAngle = options.angle ?? 55;
  const angleVariation = options.angleVariation ?? 10;
  const meetingHeight = options.meetingHeight ?? 0.8;
  
  // Set seed for reproducible teepee
  if (options.seed !== undefined) {
    seed(options.seed);
  }
  
  const group = new THREE.Group();
  group.name = 'Teepee';
  
  // Seeded random function
  let randomSeed = options.seed ?? Date.now();
  const seededRandom = (): number => {
    randomSeed = (randomSeed * 16807) % 2147483647;
    return (randomSeed - 1) / 2147483646;
  };
  
  for (let i = 0; i < count; i++) {
    // Calculate base angle around circle
    const azimuth = (i / count) * Math.PI * 2 + (seededRandom() - 0.5) * 0.3;
    
    // Random log properties
    const length = lengthRange[0] + seededRandom() * (lengthRange[1] - lengthRange[0]);
    const radius = radiusRange[0] + seededRandom() * (radiusRange[1] - radiusRange[0]);
    
    // Create log
    const log = createLog({
      length,
      radiusBottom: radius,
      radiusTop: radius * 0.7,
      seed: Math.floor(seededRandom() * 1000000),
    });
    
    // Calculate tilt angle (from vertical)
    const tiltAngle = (baseAngle + (seededRandom() - 0.5) * angleVariation) * Math.PI / 180;
    
    // Position log
    // The log's origin is at its center, so we need to calculate where it should be
    // so that the tips meet at meetingHeight
    
    // Distance from center where log base touches ground
    const baseDistance = Math.sin(tiltAngle) * (length / 2);
    
    // Calculate position
    const groundX = Math.cos(azimuth) * baseDistance;
    const groundZ = Math.sin(azimuth) * baseDistance;
    
    // Set position (log center)
    log.position.set(
      groundX * 0.5,
      meetingHeight * 0.6,
      groundZ * 0.5
    );
    
    // Rotate log: first rotate around X to tilt, then around Y for azimuth
    log.rotation.order = 'YXZ';
    log.rotation.y = azimuth + Math.PI; // Point toward center
    log.rotation.x = Math.PI / 2 - tiltAngle; // Tilt from horizontal
    log.rotation.z = seededRandom() * 0.2 - 0.1; // Slight twist
    
    group.add(log);
  }
  
  return group;
}

/**
 * Dispose of teepee resources
 */
export function disposeTeepee(group: THREE.Group): void {
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
