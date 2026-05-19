uniform float uTime;

varying vec3 vBary;

attribute vec3 aBary;

void main() {
  vBary = aBary;

  vec3 p = position;
  p.y += sin(uTime + position.x) * 0.05;

  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(p, 1.0);
}
