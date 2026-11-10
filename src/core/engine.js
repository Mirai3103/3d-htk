/**
 * Three.js core objects: renderer, scene, camera, orbit controls, raycaster and clock.
 * Created once at import time.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { stageEl } from './dom.js';

export const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: 'high-performance',
  preserveDrawingBuffer: false,
});
export function targetPixelRatio() {
  const cap = window.innerWidth < 760 ? 1.35 : 1.5;
  return Math.min(window.devicePixelRatio || 1, cap);
}
renderer.setPixelRatio(targetPixelRatio());
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false;
stageEl.appendChild(renderer.domElement);

export const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xc8dfe8, 130, 430);
export const camera = new THREE.PerspectiveCamera(43, window.innerWidth / window.innerHeight, 0.35, 900);
export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.screenSpacePanning = false;
controls.minDistance = 7;
controls.maxDistance = 390;
controls.minPolarAngle = 0.12;
controls.maxPolarAngle = Math.PI / 2 - 0.035;
controls.rotateSpeed = 0.68;
controls.zoomSpeed = 0.9;
controls.panSpeed = 0.8;
controls.zoomToCursor = true;

export const raycaster = new THREE.Raycaster();
export const pointerNdc = new THREE.Vector2();
export const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
export const clock = new THREE.Timer();
clock.connect(document);
