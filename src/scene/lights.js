/**
 * Scene lights (ambient, hemisphere, sun with shadows, courtyard fill) and lamp glow
 * sprites.
 */

import * as THREE from 'three';
import { scene } from '../core/engine.js';
import { glowTex } from '../textures/sky.js';
import { GLOW_MATERIALS } from '../materials/registry.js';

export const ambient = new THREE.AmbientLight(0xffffff, 0.15);
scene.add(ambient);

export const hemi = new THREE.HemisphereLight(0xb9ddff, 0x8b7e58, 1.12);
hemi.position.set(0, 60, 0);
scene.add(hemi);

export const sun = new THREE.DirectionalLight(0xfff2dd, 3.15);
sun.position.set(84, 92, 58);
sun.target.position.set(20, 0, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -90;
sun.shadow.camera.right = 90;
sun.shadow.camera.top = 82;
sun.shadow.camera.bottom = -82;
sun.shadow.camera.near = 10;
sun.shadow.camera.far = 230;
sun.shadow.bias = -0.00022;
sun.shadow.normalBias = 0.035;
sun.shadow.radius = 3.6;
sun.shadow.intensity = 0.8;
sun.shadow.camera.updateProjectionMatrix();
scene.add(sun);
scene.add(sun.target);

export const courtyardFill = new THREE.DirectionalLight(0xffe6c1, 0.18);
courtyardFill.position.set(-30, 24, 40);
courtyardFill.target.position.set(0, 0, 0);
scene.add(courtyardFill);
scene.add(courtyardFill.target);

export const lampLights = [];
export const lampGlows = [];

export function makeLampGlow(position) {
  const material = new THREE.SpriteMaterial({
    map: glowTex, color: 0xffd799, transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending,
    fog: false,
  });
  const sprite = new THREE.Sprite(material);
  sprite.position.copy(position);
  sprite.scale.set(4.4, 4.4, 1);
  sprite.visible = true;
  scene.add(sprite);
  GLOW_MATERIALS.push(material);
  lampGlows.push(material);
  return sprite;
}
