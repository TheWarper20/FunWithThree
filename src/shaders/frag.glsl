// License: CC0 (http://creativecommons.org/publicdomain/zero/1.0/)
#extension GL_OES_standard_derivatives : enable

varying vec3 vertex;

void main() {
  // Pick a coordinate to visualize in a grid
  float coord = length(vertex.xz);

  // Compute anti-aliased world-space grid lines
  float line = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);

  // Just visualize the grid lines directly
  gl_FragColor = vec4(vec3(1.0 - min(line, 1.0)), 1.0);
}