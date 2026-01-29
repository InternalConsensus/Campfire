/**
 * Fire Vertex Shader
 * 
 * Passes position, UV, and normal to fragment shader.
 * Applies slight vertex displacement for organic movement.
 */

// Uniforms
uniform float uTime;        // Time in seconds
uniform float uDisplacement; // Vertex displacement strength

// Varyings (passed to fragment shader)
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisplacement;

#include ./noise.glsl

void main() {
  vUv = uv;
  vNormal = normal;
  
  // Calculate displacement based on noise
  vec3 pos = position;
  
  // Scroll noise upward over time for rising fire effect
  float noiseOffset = uTime * 1.5;
  
  // Sample noise at vertex position
  float noise = snoise(vec3(
    pos.x * 2.0,
    pos.y * 1.5 - noiseOffset,
    pos.z * 2.0
  ));
  
  // Displace vertices outward, more at the top
  float heightFactor = smoothstep(0.0, 1.0, (pos.y + 0.5) / 1.5);
  float displacement = noise * uDisplacement * heightFactor;
  
  // Apply displacement along normal
  pos += normal * displacement;
  
  // Slight horizontal sway
  pos.x += sin(uTime * 2.0 + pos.y * 3.0) * 0.03 * heightFactor;
  pos.z += cos(uTime * 1.7 + pos.y * 2.5) * 0.02 * heightFactor;
  
  vPosition = pos;
  vDisplacement = displacement;
  
  // Standard MVP transform
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
