/**
 * Smoke Fragment Shader
 * 
 * Creates soft, wispy smoke particles with:
 * - Circular gradient with soft edges
 * - Noise-based detail for organic look
 * - Per-particle rotation
 * - Opacity fade over lifetime
 */

// Uniforms
uniform float uTime;
uniform vec3 uColor;        // Base smoke color
uniform float uOpacity;     // Overall opacity multiplier

// Varyings from vertex shader
varying float vLife;
varying float vRotation;
varying vec2 vUv;

#include ./noise.glsl

/**
 * Rotate UV coordinates around center
 */
vec2 rotateUV(vec2 uv, float angle) {
  vec2 center = vec2(0.5);
  vec2 centered = uv - center;
  float s = sin(angle);
  float c = cos(angle);
  vec2 rotated = vec2(
    centered.x * c - centered.y * s,
    centered.x * s + centered.y * c
  );
  return rotated + center;
}

void main() {
  // Get point coordinates (gl_PointCoord is 0-1 for point sprites)
  vec2 uv = gl_PointCoord;
  
  // Apply rotation
  uv = rotateUV(uv, vRotation);
  
  // Distance from center for circular gradient
  vec2 centered = uv - 0.5;
  float dist = length(centered) * 2.0; // 0 at center, 1 at edge
  
  // Soft circular falloff
  float circle = 1.0 - smoothstep(0.0, 1.0, dist);
  circle = pow(circle, 1.5); // Softer edges
  
  // Add noise-based detail for organic wisps
  vec3 noisePos = vec3(uv * 3.0, uTime * 0.1 + vLife * 5.0);
  float noiseDetail = snoise(noisePos) * 0.3 + 0.7;
  
  // Additional larger-scale noise for puffiness
  vec3 largeNoisePos = vec3(uv * 1.5, uTime * 0.05 + vLife * 2.0);
  float largeNoise = snoise(largeNoisePos) * 0.2 + 0.8;
  
  // Combine circle and noise
  float alpha = circle * noiseDetail * largeNoise;
  
  // Fade in at start, fade out at end
  float fadeIn = smoothstep(0.0, 0.1, vLife);
  float fadeOut = 1.0 - smoothstep(0.7, 1.0, vLife);
  alpha *= fadeIn * fadeOut;
  
  // Base opacity (smoke starts at ~0.4)
  alpha *= 0.4 * uOpacity;
  
  // Discard nearly transparent pixels
  if (alpha < 0.01) discard;
  
  // Dark gray with slight brown tint for campfire smoke
  vec3 color = uColor;
  
  // Slight color variation based on noise
  color *= 0.9 + noiseDetail * 0.1;
  
  gl_FragColor = vec4(color, alpha);
}
