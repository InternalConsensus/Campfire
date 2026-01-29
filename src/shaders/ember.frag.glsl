/**
 * Ember Fragment Shader
 * 
 * Renders ember particles as glowing circular points with:
 * - Circular shape with soft edges
 * - Color gradient from bright yellow/orange to dark red based on life
 * - Additive blending for glow effect
 */

// Varyings from vertex shader
varying float vLife;
varying float vFlicker;

// Uniforms
uniform float uTime;

/**
 * Ember color ramp based on life
 * Life 1.0 (fresh) = bright yellow-orange
 * Life 0.5 = orange
 * Life 0.0 (dying) = dark red
 */
vec3 emberColorRamp(float life) {
  vec3 brightYellow = vec3(1.0, 0.85, 0.3);   // Hot ember
  vec3 brightOrange = vec3(1.0, 0.4, 0.1);    // 0xff6600 equivalent
  vec3 darkRed = vec3(0.24, 0.0, 0.0);        // 0x3d0000
  vec3 dead = vec3(0.1, 0.02, 0.0);           // Nearly extinguished
  
  vec3 color;
  if (life > 0.7) {
    color = mix(brightOrange, brightYellow, (life - 0.7) / 0.3);
  } else if (life > 0.3) {
    color = mix(darkRed, brightOrange, (life - 0.3) / 0.4);
  } else {
    color = mix(dead, darkRed, life / 0.3);
  }
  
  return color;
}

void main() {
  // Calculate distance from center of point sprite
  // gl_PointCoord is (0,0) at top-left, (1,1) at bottom-right
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center) * 2.0; // 0 at center, 1 at edge
  
  // Discard pixels outside the circle
  if (dist > 1.0) {
    discard;
  }
  
  // Soft circular falloff for glow effect
  float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
  alpha = pow(alpha, 0.7); // Sharpen slightly for more defined core
  
  // Hot core effect - brighter in center
  float core = 1.0 - smoothstep(0.0, 0.4, dist);
  
  // Get base color from life
  vec3 color = emberColorRamp(vLife);
  
  // Add white-hot core for fresh embers
  vec3 white = vec3(1.0, 0.95, 0.85);
  color = mix(color, white, core * vLife * 0.5);
  
  // Boost brightness for additive blending
  color *= 1.3;
  
  // Apply flicker to alpha
  float flicker = 0.9 + 0.1 * sin(uTime * 15.0 + vFlicker * 6.28);
  alpha *= flicker;
  
  // Fade out as ember dies
  alpha *= smoothstep(0.0, 0.15, vLife);
  
  gl_FragColor = vec4(color, alpha);
}
