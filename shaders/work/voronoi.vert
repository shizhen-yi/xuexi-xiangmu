uniform float uTime;
uniform float uHoverAmount;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

vec3 hash3(vec3 p) {
  p = vec3(dot(p, vec3(127.1, 311.7, 74.7)),
           dot(p, vec3(269.5, 183.3, 246.1)),
           dot(p, vec3(113.5, 271.9, 124.6)));
  return fract(sin(p) * 43758.5453123);
}

float voronoi(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  float res = 1.0;

  for (int k = -1; k <= 1; k++) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        vec3 b = vec3(float(i), float(j), float(k));
        vec3 r = b + hash3(p + b) - f;
        float d = dot(r, r);
        res = min(res, d);
      }
    }
  }

  return clamp(sqrt(res), 0.0, 1.0);
}

void main() {
  float v = voronoi(position * 4.0 + uTime * 0.5);
  vec3 displaced = position + normal * v * 0.25 * uHoverAmount;
  vec4 worldPos = modelMatrix * vec4(displaced, 1.0);

  vNormal = normalize(normalMatrix * normal);
  vViewDir = normalize(cameraPosition - worldPos.xyz);
  vUv = uv;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
