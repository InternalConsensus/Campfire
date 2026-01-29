/**
 * Ember Vertex Shader
 * 
 * Renders ember particles with:
 * - Size attenuation based on distance from camera
 * - Life-based size scaling (shrink as ember dies)
 * - Animated flickering
 */

// Attributes (per-particle data from BufferGeometry)
attribute float aLife;      // Current life (0-1, 1 = just spawned)
attribute float aSize;      // Base size of the ember
attribute float aFlicker;   // Random flicker offset per particle

// Uniforms
uniform float uTime;        // Time in seconds
uniform float uPixelRatio;  // Device pixel ratio for size consistency

// Varyings (passed to fragment shader)
varying float vLife;
varying float vFlicker;

void main() {
  vLife = aLife;
  vFlicker = aFlicker;
  
  // Calculate view-space position
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  
  // Base size with life-based scaling (smaller as ember dies)
  float lifeScale = mix(0.3, 1.0, vLife);
  
  // Flicker effect - pulsing brightness/size
  float flicker = 0.85 + 0.15 * sin(uTime * 10.0 + aFlicker * 6.28);
  
  // Size attenuation - smaller when further from camera
  float sizeAttenuation = 300.0 / -mvPosition.z;
  sizeAttenuation = clamp(sizeAttenuation, 0.5, 3.0);
  
  // Final point size
  float size = aSize * lifeScale * flicker * sizeAttenuation * uPixelRatio;
  
  gl_PointSize = size;
  gl_Position = projectionMatrix * mvPosition;
}
