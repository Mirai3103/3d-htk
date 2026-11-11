/**
 * Courtyard trees, planters, benches and students.
 */

import * as THREE from 'three';
import { HALF_PI } from '../core/math.js';
import { Builder, siteBuilder } from '../geometry/batching.js';
import {
  addFlowerCluster,
  addPalm,
  addPalmAt,
  addPottedPlant,
  addTree,
} from '../kit/vegetation.js';
import { addBench, addStudent } from '../kit/furniture.js';

export function buildCourtyardLife() {
  const b = siteBuilder;

  // The great shade tree, the courtyard's anchor and a nod to the real campus.
  addTree(b, -12, 0, 12.0, 8.0, 211, { large: true });
  const treeRing = new THREE.RingGeometry(1.2, 1.9, 32);
  b.geometry('stoneLight', treeRing, -12, 0.048, 0, -HALF_PI, 0, 0);
  b.box('stoneLight', 0.6, 0.3, 0.6, -14.3, 0.15, 0.8);
  b.box('stoneLight', 0.6, 0.3, 0.6, -9.7, 0.15, -0.8);
  b.floor(0.6, 0.6, -14.3, 0.8, 0.3);
  b.floor(0.6, 0.6, -9.7, -0.8, 0.3);

  // Medium shade trees along the right and front-right edge.
  const trees = [
    [33.2, -9.0, 8.6, 3.7, 301],
    [34.0, 1.2, 8.1, 3.5, 302],
    [32.4, 11.0, 7.8, 3.25, 303],
    [30.6, 20.4, 7.3, 3.05, 304],
    [24.2, 24.6, 7.0, 2.9, 305],
    [14.8, 24.3, 7.1, 3.0, 306],
    [35.4, 26.0, 7.7, 3.3, 307],
  ];
  for (const [x, z, h, r, s] of trees) addTree(b, x, z, h, r, s);

  // A palm cluster at the front-right corner, softened by low shrubs.
  addPalm(b, 31.0, 27.0, 6.2, 2.5);
  addPalm(b, 33.7, 26.2, 5.1, 2.1);
  for (let i = 0; i < 5; i++) {
    b.blob(i % 2 ? 'shrub' : 'shrubLight', 0.6 + (i % 2) * 0.2, 29.5 + i * 1.4, 0.38, 26.7, 1.3, 0.8, 1);
  }
  b.solidBox(7.4, 1.2, 32.3, 26.7);

  // Planters with palms in front of the back classroom block.
  const planterXs = [12.5, 20.4, 28.4, 34.4];
  for (let i = 0; i < planterXs.length; i++) {
    const x = planterXs[i];
    b.box('stoneLight', 2.55, 0.38, 1.08, x, 0.19, -18.35);
    b.solidBox(2.55, 1.08, x, -18.35);
    b.box('mulch', 2.28, 0.035, 0.82, x, 0.39, -18.35);
    addPalmAt(b, x - 0.55, -18.35, 2.2 + (i % 2) * 0.35, 1.05, 0.42);
    b.blob('shrub', 0.34, x + 0.55, 0.6, -18.35, 1.15, 0.75, 1);
    addFlowerCluster(b, x + 0.6, -18.3, 0.26, 90 + i);
  }

  // Twelve potted ornaments scattered through the front half.
  const potData = [
    [-21.6, 25.2, 0.95, 'bonsai', 1.0],
    [-18.2, 20.2, 0.85, 'bonsai', 0.95],
    [-21.1, 13.6, 1.05, 'palm', 0.94],
    [-18.9, 6.0, 0.9, 'bonsai', 0.98],
    [28.1, 25.0, 1.0, 'palm', 0.96],
    [32.7, 17.2, 0.86, 'bonsai', 0.94],
    [29.8, 8.0, 0.92, 'bonsai', 0.95],
    [27.0, 0.7, 0.86, 'palm', 0.91],
    [8.0, 25.4, 1.05, 'bonsai', 0.97],
    [-4.0, 24.5, 0.86, 'bonsai', 0.93],
    [25.0, 23.3, 0.91, 'bonsai', 0.95],
    [-2.0, 20.3, 1.02, 'palm', 0.95],
  ];
  for (const [x, z, scale, kind, seed] of potData) addPottedPlant(b, x, z, scale, kind, Math.round(seed * 100));

  // A few more flowering pots near the gate.
  addPottedPlant(b, -10.7, 27.1, 1.15, 'bonsai', 173);
  addPottedPlant(b, 10.7, 27.0, 1.15, 'bonsai', 174);

  // Stone benches for a quiet moment in the shade.
  addBench(b, -7.5, 7.4, 0.28);
  addBench(b, -16.0, 12.7, HALF_PI);
  addBench(b, 27.5, 21.2, -0.45);

  // A low hedge / flower border along the inner face of the front wall.
  for (let x = -20; x < 21; x += 3.1) {
    if (Math.abs(x) < 7.5) continue;
    b.blob('shrub', 0.57, x, 0.4, 28.9, 1.3, 0.8, 0.7);
    b.solidCircle(0.55, x, 28.9);
    if (Math.round(x) % 2 === 0) addFlowerCluster(b, x, 28.95, 0.32, 45 + Math.round(x));
  }

  // Students: tiny low-poly figures for scale and a sense of a school day.
  // The first four stand before the flagpole, facing the flag and the stage (-Z).
  addStudent(b, 0.2, -5.9, Math.PI + 0.1, 11);
  addStudent(b, 1.35, -6.5, Math.PI - 0.25, 12);
  addStudent(b, 2.7, -5.75, Math.PI + 0.2, 13);
  addStudent(b, 4.0, -6.1, Math.PI - 0.1, 14);
  addStudent(b, -13.6, 2.2, 1.3, 15);
  addStudent(b, -15.0, 3.3, 2.3, 16);
  addStudent(b, 12.2, 9.4, -1.0, 17);
  addStudent(b, 18.4, 12.0, 1.3, 18);

  // Two notice boards near the entrance path.
  for (const [x, z, yaw] of [[-12.6, 24.7, 0.08], [12.3, 23.9, -0.12]]) {
    const nb = new Builder(x, z, yaw);
    nb.cylinder('metalDark', 0.045, 1.5, -0.8, 0.75, 0);
    nb.cylinder('metalDark', 0.045, 1.5, 0.8, 0.75, 0);
    nb.box('cream', 2.1, 1.22, 0.08, 0, 1.42, 0);
    nb.solidBox(2.1, 0.12, 0, 0);
    nb.box('doorTeal', 1.92, 1.04, 0.025, 0, 1.42, 0.052);
    nb.box('trim', 2.24, 0.08, 0.16, 0, 2.06, 0);
  }
}
