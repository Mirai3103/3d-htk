/**
 * Ceremony stage with green awning, flag pole and the animated flag.
 */

import * as THREE from 'three';
import { scene } from '../core/engine.js';
import { flagTex } from '../textures/signs.js';
import { siteBuilder } from '../geometry/batching.js';
import { makeLampGlow } from '../scene/lights.js';
import { currentWeather } from '../scene/weather.js';
import { addHipRoof, makeSaggingAwningGeometry } from '../kit/architecture.js';
import { addPottedPlant } from '../kit/vegetation.js';

let flagMesh = null;
let flagBasePositions = null;

export function buildCeremonyStage() {
  const b = siteBuilder;

  // Raised timber platform with three broad ceremonial steps.
  b.box('stoneBase', 9.2, 0.6, 5.15, 3, 0.3, -12.5);
  b.floor(9.2, 5.15, 3, -12.5, 0.67);
  b.box('timber', 9.02, 0.07, 4.98, 3, 0.635, -12.5);
  b.box('trim', 9.22, 0.1, 0.12, 3, 0.56, -10.02);
  b.box('redDark', 1.85, 0.025, 4.45, 3, 0.68, -12.35);
  // Lowest tread furthest out, so the flight really climbs towards the platform.
  const stepData = [
    [4.7, 0.45, 0.82, -9.92],
    [4.3, 0.31, 0.7, -9.55],
    [3.8, 0.17, 0.62, -9.2],
  ];
  for (const [w, h, d, z] of stepData) {
    b.box('stoneLight', w, h, d, 3, h / 2, z);
    b.box('trimSoft', w + 0.05, 0.035, d + 0.03, 3, h + 0.015, z);
    b.floor(w, d, 3, z, h + 0.03);
  }
  for (const x of [0.0, 6.0]) {
    b.box('stoneLight', 0.7, 0.28, 1.6, x, 0.14, -9.42);
    b.floor(0.7, 1.6, x, -9.42, 0.28);
  }

  // Pavilion base and sloped terracotta roof.
  b.box('stoneLight', 8, 0.6, 5, 3, 0.3, -17.5);
  b.floor(8, 5, 3, -17.5, 0.66);
  b.box('timber', 7.9, 0.055, 4.9, 3, 0.63, -17.5);
  for (const x of [3 - 3.35, 3 + 3.35]) {
    for (const z of [-17.5 - 1.9, -17.5 + 1.9]) {
      b.cylinder('trim', 0.11, 2.76, x, 2.0, z);
      b.cylinder('creamDim', 0.18, 0.12, x, 0.67, z);
      b.solidCircle(0.18, x, z);
      b.box('trim', 0.3, 0.12, 0.3, x, 3.34, z);
    }
  }
  const roofBase = 3.4;
  addHipRoof(b, 3, roofBase, -17.5, 8, 5, 1.1, 0.68, 'roofTile', 'ridgeTile');

  // Deep red backdrop with a gold-framed event panel.
  b.box('stageRed', 6.9, 2.72, 0.18, 3, 1.96, -19.28);
  b.solidBox(7.1, 0.3, 3, -19.24);
  b.box('gold', 7.1, 0.08, 0.24, 3, 3.38, -19.28);
  b.box('gold', 7.1, 0.08, 0.24, 3, 0.65, -19.28);
  b.box('redDark', 5.5, 2.3, 0.08, 3, 2.02, -19.18);
  b.plane('signStageBackdrop', 5.25, 2.1, 3, 2.03, -19.135);
  b.box('redDark', 0.55, 2.3, 0.05, 0.0, 2.02, -19.18);
  b.box('redDark', 0.55, 2.3, 0.05, 6.0, 2.02, -19.18);
  b.box('gold', 0.38, 0.06, 0.08, 0.0, 2.98, -19.14);
  b.box('gold', 0.38, 0.06, 0.08, 6.0, 2.98, -19.14);

  // Flowering plants at the pavilion lip.
  addPottedPlant(b, -0.3, -15.8, 0.92, 'bonsai', 111);
  addPottedPlant(b, 6.3, -15.8, 0.92, 'bonsai', 112);

  // Podium and simple stage furniture.
  b.box('wood', 0.85, 0.86, 0.55, 3, 1.11, -18.28);
  b.box('wood', 1.05, 0.08, 0.7, 3, 1.57, -18.28);
  b.solidBox(1.05, 0.7, 3, -18.28);
  b.box('metalDark', 0.035, 0.4, 0.035, 3.32, 1.82, -18.32);
  b.sphere('metalDark', 0.055, 3.32, 2.03, -18.32);
  b.box('gold', 0.36, 0.5, 0.025, 3, 1.15, -17.99);

  // Dark green canvas awning over the platform, on four slim poles.
  const awningY = 4.18;
  for (const x of [-1.55, 7.55]) {
    for (const z of [-15.35, -9.65]) {
      b.cylinder('metalDark', 0.055, awningY, x, awningY / 2, z);
      b.cylinder('stoneBase', 0.18, 0.12, x, 0.06, z);
      b.solidCircle(0.1, x, z);
      b.sphere('metalDark', 0.075, x, awningY + 0.05, z);
    }
  }
  b.box('metalDark', 9.1, 0.06, 0.06, 3, awningY, -15.35);
  b.box('metalDark', 9.1, 0.06, 0.06, 3, awningY, -9.65);
  b.cylinderBetween('metalDark', -1.55, 4.55, -15.35, 3, 4.2, -15.35, 0.018);
  b.cylinderBetween('metalDark', 7.55, 4.55, -15.35, 3, 4.2, -15.35, 0.018);
  b.cylinderBetween('metalDark', -1.55, 4.55, -9.65, 3, 4.2, -9.65, 0.018);
  b.cylinderBetween('metalDark', 7.55, 4.55, -9.65, 3, 4.2, -9.65, 0.018);
  b.geometry('fabricAwning', makeSaggingAwningGeometry(9.4, 6.15, 0.3, 14, 8), 3, awningY + 0.02, -12.5);
  b.box('fabricAwning', 9.4, 0.38, 0.05, 3, awningY - 0.19, -9.44);
  b.box('fabricAwning', 9.4, 0.32, 0.05, 3, awningY - 0.16, -15.56);
  b.box('gold', 9.42, 0.025, 0.06, 3, awningY - 0.37, -9.42);

  // Warm stage lanterns hung from the awning frame.
  for (const x of [-1.25, 7.25]) {
    b.box('metalDark', 0.15, 0.18, 0.15, x, 3.82, -12.5);
    b.sphere('lampGlass', 0.085, x, 3.78, -12.5, 1, 1.3, 1);
    const glow = makeLampGlow(new THREE.Vector3(x, 3.82, -12.5));
    glow.scale.set(2.0, 2.0, 1);
  }

  // The flagpole and a lightweight flag mesh that ripples in the breeze.
  b.cylinder('stoneLight', 0.5, 0.28, 3, 0.14, -8);
  b.solidCircle(0.5, 3, -8);
  b.cylinder('trim', 0.34, 0.2, 3, 0.1, -8);
  b.cylinder('metalLight', 0.075, 9.8, 3, 5.05, -8);
  b.sphere('gold', 0.13, 3, 10.05, -8);
  b.box('gold', 0.035, 0.9, 0.035, 3, 8.75, -8.06);
  const flagGeometry = new THREE.PlaneGeometry(2.75, 1.8, 22, 12);
  flagGeometry.translate(1.375, 0, 0);
  flagBasePositions = flagGeometry.attributes.position.array.slice();
  const flagMaterial = new THREE.MeshBasicMaterial({
    map: flagTex,
    side: THREE.DoubleSide,
    toneMapped: true,
  });
  flagMesh = new THREE.Mesh(flagGeometry, flagMaterial);
  flagMesh.position.set(3, 8.82, -8);
  flagMesh.userData.width = 2.75;
  flagMesh.frustumCulled = false;
  scene.add(flagMesh);

  // Two more flags flank the pavilion, bringing the courtyard to life.
  for (const [fx, fz] of [[-0.6, -16.3], [6.6, -16.3]]) {
    b.cylinder('metalLight', 0.035, 3.4, fx, 1.7 + 0.6, fz);
    b.solidCircle(0.06, fx, fz);
    const smallFlagGeo = new THREE.PlaneGeometry(1.35, 0.82, 8, 5);
    const smallFlagMat = new THREE.MeshStandardMaterial({
      map: flagTex, side: THREE.DoubleSide, roughness: 0.9, metalness: 0,
    });
    const smallFlag = new THREE.Mesh(smallFlagGeo, smallFlagMat);
    smallFlag.position.set(fx + 0.02, 3.62, fz);
    smallFlag.rotation.y = -0.12;
    scene.add(smallFlag);
  }
}

/** Per-frame: gentle wind through the ceremonial flag, dimmed at night / in rain. */
export function updateFlag(t) {
  if (!flagMesh) return;
  const flagLight = 0.26 + 0.74 * (1 - currentWeather.night) * (1 - currentWeather.rain * 0.18);
  flagMesh.material.color.setScalar(flagLight);
  const positions = flagMesh.geometry.getAttribute('position');
  for (let i = 0; i < flagBasePositions.length; i += 3) {
    const vertex = i / 3;
    const x = flagBasePositions[i];
    const y = flagBasePositions[i + 1];
    const flagWidth = flagMesh.userData.width || 2.75;
    const span = THREE.MathUtils.clamp(x / flagWidth, 0, 1);
    const wave = Math.sin(t * 2.3 + x * 1.7 + y * 0.55);
    const wave2 = Math.sin(t * 3.6 + x * 2.9) * 0.32;
    positions.setZ(vertex, (wave + wave2) * 0.085 * span);
    positions.setY(vertex, y + Math.cos(t * 2.1 + x * 1.9) * 0.018 * span);
  }
  positions.needsUpdate = true;
}
