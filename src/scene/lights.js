/**
 * Scene lights (ambient, hemisphere, sun with shadows, courtyard fill) and sunny environment.
 */

import * as THREE from 'three';
import { ROOT } from '../core/dom.js';
import { scene } from '../core/engine.js';
import { sunnyEnvTex } from '../textures/sky.js';

ROOT.dataset.weather = 'sunny';
scene.environment = sunnyEnvTex;
scene.environmentIntensity = 0.48;
scene.background = new THREE.Color('#c7dfea');

export const ambient = new THREE.AmbientLight('#f7f0da', 0.13);
scene.add(ambient);

export const hemi = new THREE.HemisphereLight('#b9ddff', '#8b7e58', 1.02);
hemi.position.set(0, 60, 0);
scene.add(hemi);

export const sun = new THREE.DirectionalLight('#fff4d5', 3.35);
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

export const courtyardFill = new THREE.DirectionalLight('#fff4d5', 0.06 + 3.35 * 0.045);
courtyardFill.position.set(-30, 24, 40);
courtyardFill.target.position.set(0, 0, 0);
scene.add(courtyardFill);
scene.add(courtyardFill.target);
