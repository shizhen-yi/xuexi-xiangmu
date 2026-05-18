precision highp float;

uniform sampler2D uEnvMap;
uniform vec3 uTint;
uniform float uHoverAmount;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec2 vUv;

vec2 equirectUv(vec3 d) {
  return vec2(atan(d.z, d.x) / 6.2831853 + 0.5,
              asin(clamp(d.y, -1.0, 1.0)) / 3.1415926 + 0.5);
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vViewDir);
  vec3 R = reflect(-V, N);
  float off = 0.04 * uHoverAmount;

  vec2 uvR = equirectUv(R + vec3(off, 0.0, 0.0));
  vec2 uvG = equirectUv(R);
  vec2 uvB = equirectUv(R - vec3(off, 0.0, 0.0));

  vec3 chroma = vec3(texture2D(uEnvMap, uvR).r,
                     texture2D(uEnvMap, uvG).g,
                     texture2D(uEnvMap, uvB).b);
  float fres = pow(1.0 - max(dot(N, V), 0.0), 2.5);
  vec3 col = mix(chroma, uTint, 0.2) + uTint * fres * 0.4;

  gl_FragColor = vec4(col, 1.0);
}
