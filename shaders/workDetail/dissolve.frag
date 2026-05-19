precision highp float;

varying float vProgress;
varying vec3 vColor;

void main() {
  float d = length(gl_PointCoord - 0.5);

  if (d > 0.5) discard;

  float alpha = smoothstep(0.5, 0.0, d) * 0.9;
  alpha *= 1.0 - smoothstep(0.85, 1.0, vProgress);

  gl_FragColor = vec4(vColor, alpha);
}
