/**
 * Fire Fragment Shader
 * 
 * Creates volumetric fire effect using FBM noise with:
 * - Color ramp from white (core) to yellow to orange to red to black
 * - Alpha falloff at edges and top
 * - Animated noise scrolling upward
 */

// Uniforms
uniform float uTime;          // Time in seconds
uniform float uIntensity;     // Overall fire intensity (0-1)
uniform float uNoiseScale;    // Noise frequency multiplier
uniform float uScrollSpeed;   // Upward scroll speed
uniform vec3 uColorCore;      // Core color (white/yellow)
uniform vec3 uColorMid;       // Middle color (orange)
uniform vec3 uColorOuter;     // Outer color (red)

// Varyings from vertex shader
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDisplacement;

#include ./noise.glsl

/**
 * Fire color ramp
 * Maps intensity (0-1) to fire colors:
 * 0.0 = black (edge/cool)
 * 0.3 = dark red
 * 0.5 = red/orange  
 * 0.7 = orange/yellow
 * 0.9 = yellow/white
 * 1.0 = white (core/hot)
 */
vec3 fireColorRamp(float t) {
  // Color stops
  vec3 black = vec3(0.0, 0.0, 0.0);
  vec3 darkRed = vec3(0.3, 0.0, 0.0);
  vec3 red = vec3(0.545, 0.0, 0.0);      // 0x8b0000
  vec3 orange = vec3(1.0, 0.27, 0.0);    // 0xff4500
  vec3 yellow = vec3(1.0, 0.85, 0.0);    // 0xffd900
  vec3 white = vec3(1.0, 0.95, 0.85);    // Warm white
  
  // Multi-stop gradient
  vec3 color;
  if (t < 0.2) {
    color = mix(black, darkRed, t / 0.2);
  } else if (t < 0.4) {
    color = mix(darkRed, red, (t - 0.2) / 0.2);
  } else if (t < 0.6) {
    color = mix(red, orange, (t - 0.4) / 0.2);
  } else if (t < 0.8) {
    color = mix(orange, yellow, (t - 0.6) / 0.2);
  } else {
    color = mix(yellow, white, (t - 0.8) / 0.2);
  }
  
  return color;
}

void main() {
  // Normalized height (0 at bottom, 1 at top)
  // Geometry height is passed as uniform or we use a reasonable estimate
  float height = clamp(vPosition.y / 2.2, 0.0, 1.0);
  
  // Distance from center axis (radial falloff)
  float radialDist = length(vPosition.xz);
  
  // Calculate expected radius at this height (cone shape)
  // Wider at bottom, narrower at top
  float expectedRadius = mix(0.5, 0.1, height);
  float radialFalloff = 1.0 - smoothstep(0.0, expectedRadius, radialDist);
  
  // =========================================================================
  // Noise-based fire pattern
  // =========================================================================
  
  // Scroll noise upward over time
  float scrollOffset = uTime * uScrollSpeed;
  
  // Multi-octave noise for fire turbulence
  vec3 noisePos = vec3(
    vPosition.x * uNoiseScale,
    vPosition.y * uNoiseScale * 0.8 - scrollOffset,
    vPosition.z * uNoiseScale
  );
  
  // Layer multiple noise frequencies
  float noise1 = fbm(noisePos, 4);
  float noise2 = fbm(noisePos * 2.0 + vec3(0.0, scrollOffset * 0.5, 0.0), 3);
  float noise3 = turbulence(noisePos * 4.0, 2);
  
  // Combine noise layers
  float fireNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
  
  // =========================================================================
  // Fire intensity calculation
  // =========================================================================
  
  // Base intensity from radial and height falloff
  float baseIntensity = radialFalloff;
  
  // Reduce intensity at the top (flames dissipating) - more gradual
  float topFalloff = 1.0 - smoothstep(0.4, 0.95, height);
  baseIntensity *= topFalloff;
  
  // Add noise variation - more turbulent
  float intensity = baseIntensity + fireNoise * 0.5;
  
  // Hotter core - stronger effect
  float coreFactor = 1.0 - smoothstep(0.0, 0.35, radialDist);
  intensity += coreFactor * 0.4 * (1.0 - height * 0.5);
  // =========================================================================
  // Color and alpha
  // =========================================================================
  
  // Get color from ramp
  vec3 color = fireColorRamp(intensity);
  
  // Boost brightness for additive blending - more punch
  color *= 1.5;
  
  // Alpha based on intensity with smooth falloff
  float alpha = smoothstep(0.05, 0.25, intensity);
  
  // Additional alpha falloff at edges - softer
  alpha *= pow(radialFalloff, 0.7);
  
  // Fade out at very top - more gradual
  alpha *= 1.0 - smoothstep(0.7, 1.0, height);
  
  // Flicker effect - subtle
  float flicker = 0.92 + 0.08 * sin(uTime * 12.0 + vPosition.y * 4.0);
  flicker *= 0.95 + 0.05 * sin(uTime * 23.0);
  alpha *= flicker;
  
  // Final output
  gl_FragColor = vec4(color, alpha * uIntensity);
}
