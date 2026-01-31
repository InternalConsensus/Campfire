// Gradient Sky Fragment Shader
// Creates a smooth gradient from horizon to zenith

uniform vec3 uHorizonColor;  // Color at horizon
uniform vec3 uZenithColor;   // Color at top
uniform float uGradientPower; // Exponent for gradient curve

varying vec3 vWorldPosition;

void main() {
  // Use normalized Y for vertical gradient (sphere center at origin)
  vec3 dir = normalize(vWorldPosition);
  float t = clamp(dir.y, 0.0, 1.0);
  
  // Apply power for non-linear falloff (more horizon color at bottom)
  t = pow(t, uGradientPower);
  
  // Mix colors
  vec3 color = mix(uHorizonColor, uZenithColor, t);
  
  gl_FragColor = vec4(color, 1.0);
}
