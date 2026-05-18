attribute vec3 aFromPos;
attribute vec3 aToPos;
attribute float aSeed;
attribute float aLife;

uniform float uTime;
uniform float uProgress;
uniform float uPxRatio;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;

varying float vProgress;
varying vec3 vColor;

vec3 curlNoise(vec3 p) {
  return vec3(
    sin(p.y * 1.7 + p.z * 0.9) - cos(p.z * 2.3),
    sin(p.z * 1.3 + p.x * 1.1) - cos(p.x * 2.1),
    sin(p.x * 0.7 + p.y * 1.9) - cos(p.y * 2.5)
  );
}

void main() {
  float p = smoothstep(0.0, 1.0, uProgress);
  vec3 base = mix(aFromPos, aToPos, p);
  vec3 curl = curlNoise(base * 0.5 + uTime * 0.3 + aSeed * 6.283);
  float disturb = 1.0 - abs(uProgress - 0.5) * 2.0;
  vec3 pos = base + curl * disturb * 0.8;

  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);
  gl_PointSize = (2.0 + sin(aSeed * 6.283) * 1.0) * uPxRatio;

  vProgress = uProgress;
  vColor = aSeed < 0.33 ? uColorA : (aSeed < 0.66 ? uColorB : uColorC);
}
