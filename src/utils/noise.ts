/**
 * Simplex Noise - 3D noise implementation for procedural geometry
 * 
 * Based on Stefan Gustavson's SimplexNoise implementation.
 * Used for rock displacement, bark texture, and terrain variation.
 */

// Permutation table
const perm = new Uint8Array(512);
const gradP = new Array<{ x: number; y: number; z: number }>(512);

// Gradient vectors for 3D
const grad3 = [
  { x: 1, y: 1, z: 0 }, { x: -1, y: 1, z: 0 }, { x: 1, y: -1, z: 0 }, { x: -1, y: -1, z: 0 },
  { x: 1, y: 0, z: 1 }, { x: -1, y: 0, z: 1 }, { x: 1, y: 0, z: -1 }, { x: -1, y: 0, z: -1 },
  { x: 0, y: 1, z: 1 }, { x: 0, y: -1, z: 1 }, { x: 0, y: 1, z: -1 }, { x: 0, y: -1, z: -1 },
];

// Skewing factors for 3D
const F3 = 1 / 3;
const G3 = 1 / 6;

/**
 * Seed the noise generator
 */
export function seed(seedValue: number): void {
  const p = new Uint8Array(256);
  
  // Use seed to generate permutation
  let s = seedValue;
  for (let i = 0; i < 256; i++) {
    p[i] = i;
  }
  
  // Fisher-Yates shuffle with seeded random
  for (let i = 255; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [p[i], p[j]] = [p[j], p[i]];
  }
  
  // Extend permutation table
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    gradP[i] = grad3[perm[i] % 12];
  }
}

// Initialize with default seed
seed(Date.now());

/**
 * 3D Simplex Noise
 * Returns value in range [-1, 1]
 */
export function noise3D(x: number, y: number, z: number): number {
  // Skew the input space to determine simplex cell
  const s = (x + y + z) * F3;
  const i = Math.floor(x + s);
  const j = Math.floor(y + s);
  const k = Math.floor(z + s);
  
  const t = (i + j + k) * G3;
  const X0 = i - t;
  const Y0 = j - t;
  const Z0 = k - t;
  const x0 = x - X0;
  const y0 = y - Y0;
  const z0 = z - Z0;
  
  // Determine which simplex we're in
  let i1: number, j1: number, k1: number;
  let i2: number, j2: number, k2: number;
  
  if (x0 >= y0) {
    if (y0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    } else if (x0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
    } else {
      i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
    }
  } else {
    if (y0 < z0) {
      i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
    } else if (x0 < z0) {
      i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
    } else {
      i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    }
  }
  
  const x1 = x0 - i1 + G3;
  const y1 = y0 - j1 + G3;
  const z1 = z0 - k1 + G3;
  const x2 = x0 - i2 + 2 * G3;
  const y2 = y0 - j2 + 2 * G3;
  const z2 = z0 - k2 + 2 * G3;
  const x3 = x0 - 1 + 3 * G3;
  const y3 = y0 - 1 + 3 * G3;
  const z3 = z0 - 1 + 3 * G3;
  
  // Hash coordinates
  const ii = i & 255;
  const jj = j & 255;
  const kk = k & 255;
  
  // Calculate contributions from four corners
  let n0 = 0, n1 = 0, n2 = 0, n3 = 0;
  
  let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
  if (t0 >= 0) {
    const g = gradP[ii + perm[jj + perm[kk]]];
    t0 *= t0;
    n0 = t0 * t0 * (g.x * x0 + g.y * y0 + g.z * z0);
  }
  
  let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
  if (t1 >= 0) {
    const g = gradP[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
    t1 *= t1;
    n1 = t1 * t1 * (g.x * x1 + g.y * y1 + g.z * z1);
  }
  
  let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
  if (t2 >= 0) {
    const g = gradP[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
    t2 *= t2;
    n2 = t2 * t2 * (g.x * x2 + g.y * y2 + g.z * z2);
  }
  
  let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
  if (t3 >= 0) {
    const g = gradP[ii + 1 + perm[jj + 1 + perm[kk + 1]]];
    t3 *= t3;
    n3 = t3 * t3 * (g.x * x3 + g.y * y3 + g.z * z3);
  }
  
  // Scale to [-1, 1]
  return 32 * (n0 + n1 + n2 + n3);
}

/**
 * 2D Simplex Noise (simplified from 3D with z=0)
 */
export function noise2D(x: number, y: number): number {
  return noise3D(x, y, 0);
}

/**
 * Fractal Brownian Motion (FBM)
 * Layers multiple octaves of noise for more natural variation
 */
export function fbm3D(
  x: number,
  y: number,
  z: number,
  octaves: number = 4,
  lacunarity: number = 2.0,
  persistence: number = 0.5
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let maxValue = 0;
  
  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise3D(x * frequency, y * frequency, z * frequency);
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }
  
  return value / maxValue;
}

/**
 * FBM for 2D
 */
export function fbm2D(
  x: number,
  y: number,
  octaves: number = 4,
  lacunarity: number = 2.0,
  persistence: number = 0.5
): number {
  return fbm3D(x, y, 0, octaves, lacunarity, persistence);
}

/**
 * Ridged noise - creates ridge-like patterns
 */
export function ridgedNoise3D(
  x: number,
  y: number,
  z: number,
  octaves: number = 4
): number {
  let value = 0;
  let amplitude = 1;
  let frequency = 1;
  let weight = 1;
  
  for (let i = 0; i < octaves; i++) {
    let signal = noise3D(x * frequency, y * frequency, z * frequency);
    signal = 1 - Math.abs(signal);
    signal *= signal * weight;
    weight = Math.min(Math.max(signal * 2, 0), 1);
    value += signal * amplitude;
    amplitude *= 0.5;
    frequency *= 2;
  }
  
  return value;
}
