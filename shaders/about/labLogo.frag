precision highp float;

varying vec3 vBary;

uniform vec3 uColor;

void main() {
  float edge = min(min(vBary.x, vBary.y), vBary.z);
  float line = 1.0 - smoothstep(0.0, 0.04, edge);
  vec3 col = uColor * (line * 2.5 + 0.05);

  gl_FragColor = vec4(col, line);
}
