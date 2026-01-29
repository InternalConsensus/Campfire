/**
 * Smoke Vertex Shader
 * 
 * Billboard particles that always face the camera.
 * Supports per-particle size, rotation, and opacity.
 */

// Attributes (per particle)
attribute float aSize;      // Particle size
attribute float aLife;      // Normalized lifetime (0-1, 0=just spawned, 1=dead)
attribute float aRotation;  // Rotation angle in radians

// Uniforms
uniform float uTime;        // Time in seconds
uniform float uPixelRatio;  // Device pixel ratio for size scaling

// Varyings (passed to fragment shader)
varying float vLife;
varying float vRotation;
varying vec2 vUv;

void main() {
  vLife = aLife;
  vRotation = aRotation;
  vUv = uv;
  
  // Calculate view-space position for billboarding
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  // Size grows over lifetime (0.2 -> 1.5)
  float sizeProgress = aLife;
  float currentSize = mix(0.2, 1.5, sizeProgress) * aSize;
  
  // Apply size attenuation based on distance
  gl_PointSize = currentSize * (300.0 / -mvPosition.z) * uPixelRatio;
  
  // Clamp point size
  gl_PointSize = clamp(gl_PointSize, 1.0, 128.0);
  
  gl_Position = projectionMatrix * mvPosition;
}
