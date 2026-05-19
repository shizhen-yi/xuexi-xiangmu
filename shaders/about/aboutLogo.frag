precision highp float;

uniform float uTime;
uniform vec3 uTint;      // #e5f1ff
uniform vec3 uChroma;    // #d600ff

varying vec2 vUv;
varying vec3 vNormal;

float sdCircle(vec2 uv, vec2 center, float radius) {
  return length(uv - center) - radius;
}

float sdRing(vec2 uv, vec2 center, float innerRadius, float outerRadius) {
  float d = length(uv - center);
  return max(d - outerRadius, innerRadius - d);
}

float rect(vec2 p, vec2 halfSize) {
  vec2 d = abs(p) - halfSize;
  return step(max(d.x, d.y), 0.0);
}

float line(vec2 p, vec2 a, vec2 b, float width) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return step(length(pa - ba * h), width);
}

void main() {
  vec2 uv = vUv - 0.5;

  float ring = smoothstep(0.36, 0.34, length(uv)) - smoothstep(0.34, 0.32, length(uv));

  float aRect = rect(uv - vec2(-0.08, 0.0), vec2(0.08, 0.22));
  float tRect = rect(uv - vec2(0.10, 0.04), vec2(0.10, 0.16));
  float slash = line(uv, vec2(-0.16, -0.20), vec2(0.00, 0.20), 0.025);
  float at = max(max(aRect, tRect), slash);

  float sdf = max(ring, at);

  float fres = pow(1.0 - abs(vNormal.z), 2.0);
  vec3 col = mix(uTint, uChroma, fres);

  gl_FragColor = vec4(col, sdf * (0.6 + sin(uTime * 2.0) * 0.4));
}
