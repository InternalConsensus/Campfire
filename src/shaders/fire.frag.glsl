/**
 * Fire Fragment Shader
 * 
 * Realistic fire effect using:
 * - FBM noise for organic flame shapes
 * - Proper flame color ramp (white core → yellow → orange → red → black)
 * - Height and radial falloff
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
  // Normalized height (0 at base, 1 at tip)
  float height = clamp(vPosition.y / 2.2, 0.0, 1.0);
  
  // Radial distance from center
  float radialDist = length(vPosition.xz);
  
  // Create flame shape - wider at bottom, narrower at top
  float flameWidth = mix(0.5, 0.08, pow(height, 0.7));
  float radialFalloff = 1.0 - smoothstep(0.0, flameWidth, radialDist);
  
  // Scrolling noise coordinates for upward flame movement
  vec3 noisePos = vec3(
    vPosition.x * uNoiseScale,
    vPosition.y * uNoiseScale * 0.8 - uTime * uScrollSpeed,
    vPosition.z * uNoiseScale
  );
  
  // Multi-octave noise for turbulent flames
  float n1 = snoise(noisePos) * 0.5 + 0.5;
  float n2 = snoise(noisePos * 2.0 + 100.0) * 0.5 + 0.5;
  float n3 = snoise(noisePos * 4.0 + 200.0) * 0.5 + 0.5;
  float turbulence = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
  
  // Flame mask combines radial falloff with noise
  float flameMask = radialFalloff * (0.5 + turbulence * 0.8);
  
  // Height fade - flames disappear toward tip
  float heightFade = 1.0 - pow(height, 1.5);
  
  // Core brightness - hottest at center bottom
  float core = (1.0 - radialDist / 0.3) * (1.0 - height * 0.8);
  core = clamp(core, 0.0, 1.0);
  core = pow(core, 1.5);
  
  // Final intensity
  float intensity = flameMask * heightFade;
  intensity = clamp(intensity * uIntensity, 0.0, 1.0);
  
  // Temperature for color ramp (0 = cold/edge, 1 = hot/core)
  float temp = intensity * 0.7 + core * 0.5;
  temp = clamp(temp + turbulence * 0.2 - 0.1, 0.0, 1.0);
  
  // =========================================
  // Fire Color Ramp (physically-inspired)
  // =========================================
  vec3 color;
  
  // Smoother color transitions using mix
  vec3 black = vec3(0.0, 0.0, 0.0);
  vec3 darkRed = vec3(0.3, 0.0, 0.0);
  vec3 red = vec3(0.7, 0.1, 0.0);
  vec3 orange = vec3(1.0, 0.45, 0.0);
  vec3 yellow = vec3(1.0, 0.8, 0.2);
  vec3 white = vec3(1.0, 0.95, 0.8);
  
  if (temp < 0.2) {
    color = mix(black, darkRed, temp / 0.2);
  } else if (temp < 0.4) {
    color = mix(darkRed, red, (temp - 0.2) / 0.2);
  } else if (temp < 0.6) {
    color = mix(red, orange, (temp - 0.4) / 0.2);
  } else if (temp < 0.8) {
    color = mix(orange, yellow, (temp - 0.6) / 0.2);
  } else {
    color = mix(yellow, white, (temp - 0.8) / 0.2);
  }
  
  // Boost brightness for HDR/bloom pickup
  color *= 1.0 + core * 0.5;
  
  // =========================================
  // Alpha - soft edges, height fade
  // =========================================
  float alpha = radialFalloff * heightFade;
  alpha *= 0.6 + turbulence * 0.5;
  
  // Subtle flicker
  float flicker = 0.95 + 0.05 * sin(uTime * 12.0 + vPosition.y * 8.0);
  alpha *= flicker;
  
  alpha = clamp(alpha * uIntensity, 0.0, 0.95);
  
  // Discard nearly invisible fragments
  if (alpha < 0.01) discard;
  
  gl_FragColor = vec4(color, alpha);
}
