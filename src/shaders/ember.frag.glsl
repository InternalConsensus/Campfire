/**
 * Ember Fragment Shader
 * 
 * Renders ember particles as small, bright spark points with:
 * - Sharp circular core with fast falloff
 * - Color gradient from bright yellow/orange to dark red based on life
 * - Subtle glow that doesn't overpower the fire
 */

precision highp float;

// Varyings from vertex shader
varying float vLife;
varying float vFlicker;

// Uniforms
uniform float uTime;

void main() {
  // Early discard for dead particles (life <= 0)
  if (vLife <= 0.0) {
    discard;
  }
  
  // Calculate distance from center of point sprite
  // gl_PointCoord is (0,0) at top-left, (1,1) at bottom-right
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center) * 2.0; // 0 at center, 1 at edge
  
  // Discard pixels outside the circle
  if (dist > 1.0) {
    discard;
  }
  
  // Clamp life to valid range
  float life = clamp(vLife, 0.01, 1.0);
  
  // Sharp spark-like falloff - bright core that drops off quickly
  // This creates a small hot point rather than a soft glow
  float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  alpha = pow(alpha, 2.0); // Sharper falloff for spark-like appearance
  
  // Calculate core intensity for center brightness
  float core = 1.0 - smoothstep(0.0, 0.2, dist);
  core = pow(core, 1.5);
  
  // =========================================
  // Ember color ramp based on life
  // All colors are in the warm spectrum (reds, oranges, yellows)
  // =========================================
  vec3 brightYellow = vec3(1.0, 0.85, 0.3);
  vec3 brightOrange = vec3(1.0, 0.4, 0.1);
  vec3 dimOrange = vec3(0.5, 0.1, 0.0);    // Cooling ember
  vec3 fadingEmber = vec3(0.2, 0.05, 0.0); // Nearly extinguished
  
  // Smooth interpolation between colors
  vec3 color;
  if (life > 0.7) {
    float t = (life - 0.7) / 0.3;
    color = mix(brightOrange, brightYellow, t);
  } else if (life > 0.3) {
    float t = (life - 0.3) / 0.4;
    color = mix(dimOrange, brightOrange, t);
  } else {
    float t = life / 0.3;
    color = mix(fadingEmber, dimOrange, t);
  }
  
  // Add white-hot core for fresh embers
  // 0.6 = core intensity multiplier for white-hot center
  vec3 white = vec3(1.0, 0.95, 0.85);
  color = mix(color, white, core * life * 0.6);
  
  // Apply flicker to alpha
  float flicker = 0.85 + 0.15 * sin(uTime * 12.0 + vFlicker * 6.28);
  alpha *= flicker;
  
  // Fade out as ember dies
  alpha *= smoothstep(0.0, 0.15, life);
  
  // Scale down overall alpha so embers complement rather than overpower the fire
  // 0.7 = 70% brightness to let flame shader show through
  alpha *= 0.7;
  
  // Final alpha clamp
  alpha = clamp(alpha, 0.0, 1.0);
  
  // Discard very low alpha
  if (alpha < 0.01) {
    discard;
  }
  
  gl_FragColor = vec4(color, alpha);
}
