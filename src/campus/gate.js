/**
 * Main gate, guard room and pedestrian side gate (front, z = +30).
 */

import * as THREE from 'three';
import { Builder } from '../geometry/batching.js';
import { makeLampGlow } from '../scene/lights.js';
import { addDoorX, addWindowZ } from '../kit/architecture.js';
import { addWallPost } from './perimeter.js';

export function buildMainGate() {
  const g = new Builder(0, 30, 0);
  const pillarXs = [-3.6, 3.6];

  for (const px of pillarXs) {
    g.box('stoneBase', 1.48, 0.7, 1.48, px, 0.35, 0);
    g.box('cream', 1.2, 5.72, 1.2, px, 3.46, 0);
    g.box('trim', 1.38, 0.22, 1.38, px, 6.25, 0);
    g.box('trim', 1.54, 0.25, 1.54, px, 6.5, 0);
    g.box('gold', 1.24, 0.08, 1.24, px, 3.95, 0);
    g.box('gold', 1.24, 0.06, 1.24, px, 4.06, 0);
    for (let k = -1; k <= 1; k++) {
      g.box('creamDim', 0.07, 4.45, 0.08, px + k * 0.28, 4.15, 0.605);
    }
  }

  // Broad flat canopy with the characteristic orange safety edge.
  g.box('cream', 10, 0.5, 2.6, 0, 6.75, 0);
  g.box('trim', 10.3, 0.18, 2.9, 0, 7.04, 0);
  g.box('orange', 10.08, 0.055, 0.055, 0, 7.0, 1.32);
  g.box('orange', 10.08, 0.055, 0.055, 0, 7.0, -1.32);
  g.box('creamDim', 8.4, 0.12, 0.2, 0, 6.48, 0.8);

  // Recessed sign box; readable from both the street and the courtyard.
  g.box('creamDim', 6.36, 1.92, 0.3, 0, 5.14, 0);
  g.plane('signGate', 6.18, 1.74, 0, 5.14, 0.154);
  g.plane('signGate', 6.18, 1.74, 0, 5.14, -0.154, 0, Math.PI, 0);
  g.box('gold', 6.35, 0.04, 0.33, 0, 6.13, 0);
  g.box('gold', 6.35, 0.04, 0.33, 0, 4.16, 0);

  // Shallow downlights under the canopy.
  for (const x of [-2.8, 2.8]) {
    g.sphere('lampGlass', 0.12, x, 6.42, -0.45, 1.4, 0.5, 1.4);
  }

  // Two leaves of a dark green steel gate.
  for (const side of [-1, 1]) {
    const center = side * 1.52;
    const width = 2.94;
    g.box('ironGreenDark', width, 0.12, 0.09, center, 0.13, -0.02);
    g.box('ironGreenDark', width, 0.94, 0.07, center, 0.68, -0.02);
    g.box('ironGreen', width, 0.1, 0.11, center, 1.17, -0.02);
    g.box('ironGreen', width, 0.1, 0.11, center, 2.15, -0.02);
    g.box('ironGreen', 0.1, 2.08, 0.11, center - width / 2, 1.12, -0.02);
    g.box('ironGreen', 0.1, 2.08, 0.11, center + width / 2, 1.12, -0.02);
    for (let i = 1; i <= 8; i++) {
      const bx = center - width / 2 + (i / 9) * width;
      g.box('ironGreen', 0.035, 1.13, 0.035, bx, 1.72, -0.02);
    }
    g.box('ironGreenDark', 0.34, 0.32, 0.07, center - side * 0.82, 1.35, -0.07);
    g.sphere('gold', 0.055, center + side * 0.54, 1.38, -0.09, 1, 1.2, 0.65);
    g.box('ironGreen', 0.035, 0.14, 0.035, center + side * 0.54, 1.48, -0.02);
    g.sphere('gold', 0.075, center + side * 0.54, 1.56, -0.02, 1, 1.1, 0.8);
    g.box('ironGreenDark', width, 0.18, 0.15, center, 0.17, -0.02);
  }

  // Hinges and a center latch.
  for (const x of [-3.0, 3.0]) {
    g.box('metalDark', 0.15, 0.16, 0.16, x, 0.63, 0.01);
    g.box('metalDark', 0.15, 0.16, 0.16, x, 1.03, 0.01);
    g.box('metalDark', 0.15, 0.16, 0.16, x, 1.9, 0.01);
  }
  g.box('metalDark', 0.1, 0.22, 0.13, 0, 1.05, 0.03);
  g.box('stoneLight', 6.3, 0.04, 0.32, 0, 0.03, 0);

  // Guard room, tucked against the left pillar and facing the street.
  g.box('stoneBase', 6.18, 0.42, 4.18, -7.2, 0.21, -1.2);
  g.box('cream', 6.0, 2.9, 4.0, -7.2, 1.87, -1.2);
  g.box('wallWarm', 5.84, 0.55, 3.84, -7.2, 3.1, -1.2);
  g.box('trim', 6.35, 0.22, 4.35, -7.2, 3.55, -1.2);
  g.box('creamDim', 6.15, 0.18, 4.15, -7.2, 3.38, -1.2);
  addWindowZ(g, -7.5, 1.2, 0.81, 2.55, 1.25, false);
  addDoorX(g, -4.2, 0.08, -1.2, 1.0, 2.2, 1, 'doorTeal');
  g.box('trim', 0.24, 0.08, 1.3, -4.1, 2.36, -1.2);
  g.box('creamDim', 1.0, 0.25, 0.05, -7.2, 3.46, 0.82);
  g.sphere('lampGlass', 0.13, -6.3, 2.8, 0.89, 1, 1, 0.7);
  // A small blue room-number plate.
  g.box('doorBlue', 0.5, 0.17, 0.035, -8.7, 1.95, 0.84);

  // Side pedestrian gate with a lower canopy.
  g.box('trim', 2.9, 0.28, 2.1, 5.72, 3.42, 0);
  g.box('cream', 0.32, 3.35, 0.32, 5.72, 1.675, -1.05);
  g.box('trim', 0.44, 0.1, 0.44, 5.72, 3.38, -1.05);
  g.box('cream', 0.32, 3.35, 0.32, 7.12, 1.675, -1.05);
  g.box('trim', 0.44, 0.1, 0.44, 7.12, 3.38, -1.05);
  g.box('creamDim', 2.7, 0.18, 0.18, 5.72, 3.25, -0.88);
  for (let i = 0; i < 7; i++) {
    g.box('ironGreen', 0.035, 1.2, 0.035, 4.5 + i * 0.37, 1.05, 0);
  }
  g.box('ironGreen', 2.55, 0.08, 0.08, 5.78, 1.67, 0);
  g.box('ironGreen', 2.55, 0.08, 0.08, 5.78, 0.44, 0);
  g.box('ironGreenDark', 2.55, 0.55, 0.07, 5.78, 0.28, 0);
  addWallPost(7.1, 30);
  addWallPost(4.28, 30);
  // A small sign identifies the pedestrian entrance.
  g.box('creamDim', 1.35, 0.45, 0.14, 5.72, 3.88, 0.1);
  g.plane('signGateSmall', 1.18, 0.36, 5.72, 3.88, 0.18);

  // Warm little gate lanterns.
  for (const x of [-3.6, 3.6]) {
    g.box('metalDark', 0.2, 0.26, 0.2, x, 4.98, 0.68);
    g.sphere('lampGlass', 0.09, x, 4.94, 0.68, 1, 1.3, 1);
    const glow = makeLampGlow(new THREE.Vector3(x, 5.0, 30.75));
    glow.scale.set(2.5, 2.5, 1);
  }
}
