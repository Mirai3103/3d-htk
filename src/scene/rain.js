/**
 * Rain: a single GPU-animated points cloud.
 */

import * as THREE from 'three';
import { seededRandom } from '../core/math.js';
import { scene } from '../core/engine.js';

// Rain is a single GPU-animated points cloud, clipped to a tall volume.
const rainCount = 3600;
const rainPositions = new Float32Array(rainCount * 3);
const rainSpeeds = new Float32Array(rainCount);
const rainRng = seededRandom(717);
for (let i = 0; i < rainCount; i++) {
  rainPositions[i * 3] = (rainRng() - 0.5) * 154;
  rainPositions[i * 3 + 1] = rainRng() * 44;
  rainPositions[i * 3 + 2] = (rainRng() - 0.5) * 118;
  rainSpeeds[i] = 13 + rainRng() * 12;
}
const rainGeometry = new THREE.BufferGeometry();
rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
rainGeometry.setAttribute('aSpeed', new THREE.BufferAttribute(rainSpeeds, 1));
export const rainUniforms = {
  uTime: { value: 0 },
  uOpacity: { value: 0 },
  uColor: { value: new THREE.Color('#d5e6ef') },
};
const rainMaterial = new THREE.ShaderMaterial({
  uniforms: rainUniforms,
  transparent: true,
  depthWrite: false,
  fog: false,
  vertexShader: `
    attribute float aSpeed;
    uniform float uTime;
    varying float vDepthFade;
    void main() {
      vec3 p = position;
      p.y = mod(position.y - uTime * aSpeed, 44.0);
      p.y += 0.35;
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_PointSize = clamp(680.0 / max(-mv.z, 1.0), 2.0, 15.0);
      gl_Position = projectionMatrix * mv;
      vDepthFade = smoothstep(190.0, 20.0, -mv.z);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uOpacity;
    varying float vDepthFade;
    void main() {
      vec2 p = gl_PointCoord - 0.5;
      float x = smoothstep(0.12, 0.025, abs(p.x));
      float y = smoothstep(0.5, 0.32, abs(p.y));
      float alpha = x * y * uOpacity * (0.35 + vDepthFade * 0.65);
      if (alpha < 0.01) discard;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
});
export const rain = new THREE.Points(rainGeometry, rainMaterial);
rain.visible = false;
rain.frustumCulled = false;
rain.renderOrder = 20;
scene.add(rain);
