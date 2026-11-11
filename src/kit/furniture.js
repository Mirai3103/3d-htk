/**
 * Benches, students and bicycle racks.
 */

import * as THREE from 'three';
import { Builder } from '../geometry/batching.js';

// The figure below is modelled 1.32 m tall; scaled up it stands about 1.5 m, eye to eye with
// the walker in first-person mode.
const STUDENT_SCALE = 1.14;

export function addBench(b, x, z, yaw) {
  const bb = new Builder(x, z, yaw);
  bb.box('stone', 2.3, 0.18, 0.56, 0, 0.58, 0);
  bb.box('stone', 0.2, 0.46, 0.42, -0.82, 0.28, 0);
  bb.box('stone', 0.2, 0.46, 0.42, 0.82, 0.28, 0);
  bb.box('stone', 2.05, 0.06, 0.08, 0, 0.74, -0.24);
  bb.solidBox(2.3, 0.56, 0, 0);
}

export function addStudent(b, x, z, yaw, seed = 1, seated = false) {
  const bb = new Builder(x, z, yaw);
  bb.solidCircle(0.24, 0, 0);
  bb.base.scale(new THREE.Vector3(STUDENT_SCALE, STUDENT_SCALE, STUDENT_SCALE));
  const skirt = seed % 3 === 0;
  const bodyBottom = seated ? 0.56 : 0.08;
  const legHeight = seated ? 0.38 : 0.58;
  bb.box('uniformBlue', 0.28, legHeight, 0.2, 0, bodyBottom + legHeight / 2, 0);
  if (seated) {
    bb.box('skin', 0.1, 0.1, 0.28, -0.08, 0.46, 0.24);
    bb.box('skin', 0.1, 0.1, 0.28, 0.08, 0.46, 0.24);
  } else {
    bb.box('uniformWhite', 0.33, 0.42, 0.22, 0, 0.88, 0);
    bb.box('uniformBlue', 0.27, 0.22, 0.19, 0, 0.64, 0);
  }
  if (seated) {
    bb.box('uniformWhite', 0.33, 0.44, 0.22, 0, 0.76, 0);
    bb.box('uniformBlue', 0.28, 0.18, 0.2, 0, 0.49, 0);
  }
  bb.sphere('skin', 0.115, 0, 1.18, 0, 1, 1.18, 1);
  bb.sphere('hair', 0.12, 0, 1.255, -0.018, 1.0, 0.7, 1.04);
  if (seated) bb.sphere('hair', 0.12, 0, 1.14, -0.06, 1.02, 0.62, 0.88);
  // Red neckerchief, white cap, and a simple satchel.
  bb.box('scarf', 0.21, 0.055, 0.03, 0, 1.01, 0.115);
  bb.box('uniformWhite', 0.25, 0.05, 0.29, 0, 1.29, 0);
  bb.sphere('uniformWhite', 0.16, 0, 1.27, 0, 1, 0.3, 0.9);
  bb.box('wood', 0.18, 0.3, 0.1, 0.18, 0.86, -0.13);
  if (skirt) bb.box('uniformBlue', 0.4, 0.3, 0.24, 0, 0.68, 0);
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
