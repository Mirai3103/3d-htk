/**
 * Sky dome shader (gradient + procedural clouds), stars and moon. The group follows the
 * camera every frame.
 */

import * as THREE from 'three';
import { seededRandom, TAU } from '../core/math.js';
import { scene } from '../core/engine.js';
import { moonTex } from '../textures/sky.js';

export const skyGroup = new THREE.Group();
skyGroup.name = 'sky-group';
scene.add(skyGroup);

export const skyUniforms = {
  uTop: { value: new THREE.Color('#2e75c9') },
  uHorizon: { value: new THREE.Color('#d7ecf8') },
  uGround: { value: new THREE.Color('#b8c7be') },
  uSunColor: { value: new THREE.Color('#fff4d6') },
  uCloudLight: { value: new THREE.Color('#ffffff') },
  uCloudDark: { value: new THREE.Color('#bccbd3') },
  uSunDir: { value: new THREE.Vector3(0.46, 0.68, 0.57).normalize() },
  uCloud: { value: 0.22 },
  uNight: { value: 0 },
  uTime: { value: 0 },
};

const skyMaterial = new THREE.ShaderMaterial({
  uniforms: skyUniforms,
  side: THREE.BackSide,
  depthWrite: false,
  depthTest: true,
  fog: false,
  toneMapped: false,
  vertexShader: `
    varying vec3 vDir;
    void main() {
      vDir = normalize(position);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uTop;
    uniform vec3 uHorizon;
    uniform vec3 uGround;
    uniform vec3 uSunColor;
    uniform vec3 uCloudLight;
    uniform vec3 uCloudDark;
    uniform vec3 uSunDir;
    uniform float uCloud;
    uniform float uNight;
    uniform float uTime;
    varying vec3 vDir;

    float hash21(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float vnoise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
        mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.54;
      mat2 rot = mat2(0.82, 0.57, -0.57, 0.82);
      for (int i = 0; i < 4; i++) {
        v += a * vnoise(p);
        p = rot * p * 2.06 + 9.1;
        a *= 0.49;
      }
      return v;
    }

    void main() {
      vec3 d = normalize(vDir);
      float y = clamp(d.y, -0.2, 1.0);
      vec3 sky = mix(uHorizon, uTop, pow(clamp(y, 0.0, 1.0), 0.45));
      sky = mix(sky, uGround, smoothstep(0.0, -0.22, d.y));

      float sunDot = max(dot(d, normalize(uSunDir)), 0.0);
      float sunDisc = smoothstep(0.99964, 0.99988, sunDot);
      float sunGlow = pow(sunDot, 14.0);
      float sunLift = (sunDisc * 1.7 + sunGlow * 0.16) * (1.0 - uCloud * 0.88) * (1.0 - uNight * 0.8);
      sky += uSunColor * sunLift;

      vec2 cloudUv = d.xz / (abs(d.y) + 0.28);
      cloudUv = cloudUv * 1.18 + vec2(uTime * 0.0022, uTime * 0.0008);
      float broad = fbm(cloudUv * 1.2 + 2.8);
      float detail = vnoise(cloudUv * 3.6 - 6.2);
      float cloudNoise = broad * 0.75 + detail * 0.25;
      float threshold = mix(0.72, 0.36, uCloud);
      float cloudMask = smoothstep(threshold, threshold + 0.19, cloudNoise);
      float horizonFade = smoothstep(0.015, 0.17, d.y);
      cloudMask *= horizonFade * (0.38 + uCloud * 0.98) * smoothstep(0.015, 0.42, uCloud);
      vec3 cloudColor = mix(uCloudDark, uCloudLight, smoothstep(0.28, 0.78, detail + broad * 0.32 + (1.0 - uCloud) * 0.08));
      sky = mix(sky, cloudColor, clamp(cloudMask, 0.0, 1.0) * 0.8);

      float haze = smoothstep(0.2, 0.0, abs(d.y)) * 0.12;
      sky = mix(sky, uHorizon, haze);

      gl_FragColor = vec4(sky, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }
  `,
});

const skyDome = new THREE.Mesh(new THREE.SphereGeometry(360, 40, 24), skyMaterial);
skyDome.renderOrder = 900;
skyDome.frustumCulled = false;
skyGroup.add(skyDome);

const starRng = seededRandom(402);
const starCount = 680;
const starPositions = new Float32Array(starCount * 3);
for (let i = 0; i < starCount; i++) {
  const azimuth = starRng() * TAU;
  const elevation = Math.asin(0.08 + starRng() * 0.9);
  const r = 338;
  starPositions[i * 3] = Math.cos(azimuth) * Math.cos(elevation) * r;
  starPositions[i * 3 + 1] = Math.sin(elevation) * r;
  starPositions[i * 3 + 2] = Math.sin(azimuth) * Math.cos(elevation) * r;
}
const starGeometry = new THREE.BufferGeometry();
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
export const starMaterial = new THREE.PointsMaterial({
  color: 0xf5ecd9, size: 1.45, sizeAttenuation: false, transparent: true,
  opacity: 0, depthWrite: false, fog: false,
});
export const stars = new THREE.Points(starGeometry, starMaterial);
stars.renderOrder = -900;
stars.frustumCulled = false;
skyGroup.add(stars);

export const moonMaterial = new THREE.SpriteMaterial({
  map: moonTex, color: 0xfff9e7, transparent: true, opacity: 0,
  depthWrite: false, depthTest: true, fog: false,
  blending: THREE.NormalBlending,
});
export const moon = new THREE.Sprite(moonMaterial);
moon.position.set(-142, 45, -282);
moon.scale.set(14, 14, 1);
moon.renderOrder = -850;
skyGroup.add(moon);
