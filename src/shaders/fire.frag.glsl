/**
 * Fire Fragment Shader
 * 
 * Realistic fire effect using:
 * - FBM noise for organic flame shapes with upward-licking tongues
 * - Proper flame color ramp (white core → yellow → orange → red → transparent)
 * - Height-based falloff with noise-driven flame edges
 */

// Uniforms
uniform float uTime;
uniform float uIntensity;
uniform float uNoiseScale;
uniform float uScrollSpeed;

// Varyings
varying vec2 vUv;
varying vec3 vPosition;
varying float vDisplacement;

#include ./noise.glsl

void main() {
  // Use world position for flame calculations
  // vPosition.y is height (0 at base, ~2.2 at tip)
  // vPosition.xz is radial position
  
  // Normalize height (0 to 1)
  float height = clamp(vPosition.y / 2.2, 0.0, 1.0);
  
  // Radial distance from center axis
  float radialDist = length(vPosition.xz);
  
  // =========================================
  // Flame Shape with Noise-Driven Edges
  // =========================================
  
  // Time-scrolling noise coordinates (flames rise upward)
  float scrollTime = uTime * uScrollSpeed;
  
  // Create noise at multiple scales for turbulent flame edges
  // Use angle around the fire for noise X coordinate for seamless wrapping
  float angle = atan(vPosition.z, vPosition.x);
  
  vec3 noiseCoord = vec3(
    angle * uNoiseScale * 0.5,
    height * uNoiseScale * 2.0 - scrollTime,
    radialDist * uNoiseScale
  );
  
  // Multi-octave noise for organic flame turbulence
  float noise1 = snoise(noiseCoord) * 0.5 + 0.5;
  float noise2 = snoise(noiseCoord * 2.1 + 31.7) * 0.5 + 0.5;
  float noise3 = snoise(noiseCoord * 4.3 + 67.2) * 0.5 + 0.5;
  
  // Combine octaves with decreasing weights (FBM-style)
  float turbulence = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
  
  // =========================================
  // Flame Width Profile
  // =========================================
  
  // Flame narrows toward top - classic flame shape
  float baseRadius = 0.55; // Match the cone radius
  float flameRadius = baseRadius * (1.0 - pow(height, 0.5));
  
  // Add noise variation to flame edge for organic look
  flameRadius *= (0.7 + turbulence * 0.5);
  
  // Soft falloff from center to edge
  float flameMask = 1.0 - smoothstep(flameRadius * 0.2, flameRadius, radialDist);
  
  // =========================================
  // Height Fade and Flame Tips
  // =========================================
  
  // Flames fade toward top
  float heightFade = 1.0 - smoothstep(0.2, 0.95, height);
  
  // Noise-driven tips - some areas extend higher than others
  float tipNoise = snoise(vec3(angle * 2.0, scrollTime * 0.3, 0.0)) * 0.5 + 0.5;
  float tipExtend = tipNoise * 0.2;
  float tipMask = 1.0 - smoothstep(0.6 + tipExtend, 1.0, height);
  
  // Combined flame shape
  float flameShape = flameMask * heightFade * tipMask;
  flameShape = pow(flameShape, 0.8); // Adjust falloff curve
  
  // =========================================
  // Core Brightness (hottest at center-bottom)
  // =========================================
  float normalizedRadial = radialDist / baseRadius;
  float coreIntensity = (1.0 - normalizedRadial * 1.5) * (1.0 - height * 0.6);
  coreIntensity = clamp(coreIntensity, 0.0, 1.0);
  coreIntensity = pow(coreIntensity, 1.5);
  
  // =========================================
  // Temperature for Color Ramp
  // =========================================
  float temp = flameShape * 0.5 + coreIntensity * 0.6;
  temp += (turbulence - 0.5) * 0.1; // Subtle noise variation
  temp = clamp(temp * uIntensity, 0.0, 1.0);
  
  // =========================================
  // Fire Color Ramp
  // Physically-based: cooler outer edges → hot core
  // =========================================
  
  // Color stops for realistic fire
  vec3 darkRed = vec3(0.4, 0.02, 0.0);
  vec3 red = vec3(0.85, 0.1, 0.0);
  vec3 orange = vec3(1.0, 0.35, 0.0);
  vec3 yellow = vec3(1.0, 0.7, 0.15);
  vec3 white = vec3(1.0, 0.92, 0.8);
  
  // Smooth gradient transitions
  vec3 color;
  if (temp < 0.2) {
    color = mix(darkRed, red, temp / 0.2);
  } else if (temp < 0.45) {
    color = mix(red, orange, (temp - 0.2) / 0.25);
  } else if (temp < 0.7) {
    color = mix(orange, yellow, (temp - 0.45) / 0.25);
  } else {
    color = mix(yellow, white, (temp - 0.7) / 0.3);
  }
  
  // Brightness boost for bloom pickup (core glows brighter)
  color *= 1.0 + coreIntensity * 0.6;
  
  // =========================================
  // Alpha Calculation
  // =========================================
  float alpha = flameShape;
  
  // Softer edges at low temperatures
  alpha *= smoothstep(0.0, 0.1, temp);
  
  // Fade out at the very bottom to avoid edge artifacts
  float bottomFade = smoothstep(0.0, 0.15, height);
  alpha *= bottomFade;
  
  // Subtle flicker animation
  float flicker = 0.9 + 0.1 * sin(uTime * 12.0 + height * 8.0 + angle * 3.0);
  alpha *= flicker;
  
  // Final alpha with intensity
  alpha = clamp(alpha * uIntensity * 1.1, 0.0, 0.95);
  
  // Discard nearly invisible fragments
  if (alpha < 0.01) discard;
  
  gl_FragColor = vec4(color, alpha);
}
