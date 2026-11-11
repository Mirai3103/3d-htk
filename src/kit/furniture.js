/**
 * Benches, students and bicycle racks.
 */

import * as THREE from 'three';
import { HALF_PI, TAU } from '../core/math.js';
import { Builder } from '../geometry/batching.js';

// The figure is modelled 1.7 m tall (feet at y = 0); scaled down it stands about 1.5 m,
// eye to eye with the walker in first-person mode.
const STUDENT_SCALE = 0.88;

// Parts that are not unit shapes: tapered limbs, the neckerchief, the hair. Shared by every
// student, cloned per instance when the batches are committed.
const GEO = {
  trouser: new THREE.CylinderGeometry(0.072, 0.06, 0.62, 12),
  sleeve: new THREE.CylinderGeometry(0.055, 0.05, 0.18, 12),
  forearm: new THREE.CylinderGeometry(0.04, 0.034, 0.24, 12),
  finger: new THREE.CylinderGeometry(0.01, 0.01, 0.055, 8),
  neck: new THREE.CylinderGeometry(0.05, 0.058, 0.1, 12),
  sideLock: new THREE.CylinderGeometry(0.018, 0.01, 0.16, 8),
  neckRing: new THREE.TorusGeometry(0.095, 0.022, 8, 20),
  hairTie: new THREE.TorusGeometry(0.028, 0.01, 8, 12),
  smile: new THREE.TorusGeometry(0.024, 0.006, 8, 16, Math.PI),
  scarfBack: new THREE.ConeGeometry(0.16, 0.14, 3),
  knot: new THREE.DodecahedronGeometry(0.034, 0),
  bang: new THREE.ConeGeometry(0.042, 0.11, 6),
  topTuft: new THREE.ConeGeometry(0.04, 0.09, 6),
  ponytail: new THREE.ConeGeometry(0.055, 0.24, 10),
  hairCap: new THREE.SphereGeometry(0.184, 24, 24, 0, TAU, 0, Math.PI * 0.58),
  blush: new THREE.CircleGeometry(0.024, 12),
};

export function addBench(b, x, z, yaw) {
  const bb = new Builder(x, z, yaw);
  bb.box('stone', 2.3, 0.18, 0.56, 0, 0.58, 0);
  bb.box('stone', 0.2, 0.46, 0.42, -0.82, 0.28, 0);
  bb.box('stone', 0.2, 0.46, 0.42, 0.82, 0.28, 0);
  bb.box('stone', 2.05, 0.06, 0.08, 0, 0.74, -0.24);
  bb.solidBox(2.3, 0.56, 0, 0);
}

/**
 * A pupil in a white shirt, navy trousers and the red Đội neckerchief; girls wear twin
 * tails, boys short hair (the seed picks), and nobody carries a satchel.
 */
export function addStudent(b, x, z, yaw, seed = 1) {
  const bb = new Builder(x, z, yaw);
  bb.solidCircle(0.24, 0, 0);
  const female = seed % 2 === 0;
  const scale = STUDENT_SCALE * (female ? 0.95 : 1);
  bb.base.scale(new THREE.Vector3(scale, scale, scale));
  const shirtWidth = female ? 0.31 : 0.34;

  // Hips, belt, trousers and shoes.
  bb.box('uniformBlue', 0.32, 0.14, 0.2, 0, 0.72, 0);
  bb.box('hair', 0.33, 0.035, 0.21, 0, 0.78, 0);
  bb.box('brass', 0.05, 0.04, 0.02, 0, 0.78, 0.105);
  for (const dir of [-1, 1]) {
    bb.geometry('uniformBlue', GEO.trouser, dir * 0.085, 0.36, 0);
    bb.box('uniformBlue', 0.11, 0.06, 0.22, dir * 0.085, 0.06, 0.03);
    bb.box('uniformWhite', 0.115, 0.025, 0.23, dir * 0.085, 0.025, 0.03);
  }

  // Shirt with its button placket and breast pocket.
  bb.box('uniformWhite', shirtWidth, 0.44, 0.2, 0, 1.01, 0);
  bb.box('uniformWhite', 0.03, 0.42, 0.01, 0, 1.01, 0.102);
  bb.box('uniformWhite', 0.075, 0.085, 0.01, 0.085, 1.06, 0.102);

  // Red neckerchief: ring, back triangle, knot, two tails and the collar tips over it.
  bb.geometry('scarf', GEO.neckRing, 0, 1.24, 0.01, HALF_PI + 0.12, 0, 0, 1.15, 1, 1);
  bb.geometry('scarf', GEO.scarfBack, 0, 1.19, -0.108, Math.PI + 0.12, Math.PI, 0, 1.1, 1, 0.12);
  bb.geometry('scarf', GEO.knot, 0, 1.175, 0.118);
  for (const dir of [-1, 1]) {
    bb.box('scarf', 0.042, 0.27, 0.008, dir * 0.024, 1.05, 0.118, 0, -dir * 0.12, -dir * 0.09);
    bb.box('uniformWhite', 0.09, 0.025, 0.12, dir * 0.06, 1.245, 0.03, 0.25, -dir * 0.35, dir * 0.25);
  }

  // Short sleeves, forearms, hands.
  for (const dir of [-1, 1]) {
    const armX = dir * (shirtWidth / 2 + 0.045);
    bb.geometry('uniformWhite', GEO.sleeve, armX, 1.11, 0);
    if (dir > 0) bb.box('uniformBlue', 0.01, 0.05, 0.04, armX + 0.052, 1.12, 0);
    bb.geometry('skin', GEO.forearm, armX, 0.92, 0);
    bb.sphere('skin', 0.042, armX, 0.79, 0);
    bb.geometry('skin', GEO.finger, armX - 0.014, 0.75, 0.01, 0, 0, -0.22);
    bb.geometry('skin', GEO.finger, armX + 0.014, 0.75, 0.01, 0, 0, 0.22);
  }

  // Head, ears, eyes with highlights, brows, blush and a smile.
  bb.geometry('skin', GEO.neck, 0, 1.28, 0);
  bb.sphere('skin', 0.175, 0, 1.45, 0, 1, 1.06, 0.96);
  for (const dir of [-1, 1]) {
    bb.sphere('skin', 0.036, dir * 0.17, 1.44, -0.01, 0.5, 1, 0.7);
    bb.sphere('hair', 0.02, dir * 0.062, 1.455, 0.155, 1, 1.2, 0.5);
    bb.sphere('uniformWhite', 0.006, dir * 0.066, 1.462, 0.165);
    bb.box('hair', 0.042, 0.01, 0.01, dir * 0.062, 1.495, 0.156, 0, 0, dir * -0.08);
    bb.geometry('flowerPink', GEO.blush, dir * 0.095, 1.415, 0.155, 0, dir * 0.35, 0);
  }
  bb.geometry('scarf', GEO.smile, 0, 1.405, 0.163, Math.PI, 0, 0);
  bb.geometry('hair', GEO.hairCap, 0, 1.455, 0, -0.12, 0, 0, 1.02, 1.06, 1.02);
  for (let i = -2; i <= 2; i++) {
    bb.geometry('hair', GEO.bang, i * 0.042, 1.55, 0.145 - Math.abs(i) * 0.012, Math.PI - 0.35, 0, i * -0.12);
  }

  if (female) {
    // Side locks, red hair ties and twin tails.
    for (const dir of [-1, 1]) {
      bb.geometry('hair', GEO.sideLock, dir * 0.155, 1.41, 0.09, 0, 0, dir * 0.1);
      bb.geometry('scarf', GEO.hairTie, dir * 0.16, 1.47, -0.09, 0, dir * 0.6, 0);
      bb.geometry('hair', GEO.ponytail, dir * 0.2, 1.37, -0.12, 0.25, 0, dir * -0.35);
    }
  } else {
    // Short hair: sideburns and a tuft on top.
    for (const dir of [-1, 1]) bb.box('hair', 0.025, 0.09, 0.08, dir * 0.168, 1.48, 0.04);
    bb.geometry('hair', GEO.topTuft, 0.02, 1.66, 0.02, 0, 0, -0.3);
  }
}

export function addBicycleRack(b, x, z, yaw, count = 3) {
  const bb = new Builder(x, z, yaw);
  bb.solidBox((count - 1) * 1.25 + 0.6, 0.16, 0, 0);
  for (let i = 0; i < count; i++) {
    const off = (i - (count - 1) / 2) * 1.25;
    bb.cylinder('bicycleRack', 0.035, 0.72, off - 0.23, 0.36, 0);
    bb.cylinder('bicycleRack', 0.035, 0.72, off + 0.23, 0.36, 0);
    bb.box('bicycleRack', 0.52, 0.045, 0.045, off, 0.7, 0);
  }
}
