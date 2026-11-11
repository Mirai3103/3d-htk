/**
 * Ground planes, courtyard paving, street, curbs and road markings.
 */

import * as THREE from 'three';
import { HALF_PI } from '../core/math.js';
import { scene } from '../core/engine.js';
import { siteBuilder } from '../geometry/batching.js';

export function buildGroundAndStreet() {
  const b = siteBuilder;

  // Distant earth-colored base keeps the horizon quiet beyond the site.
  const farGround = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshStandardMaterial({ color: 0x687f4b, roughness: 1 }),
  );
  farGround.rotation.x = -HALF_PI;
  farGround.position.y = -0.28;
  farGround.receiveShadow = false;
  scene.add(farGround);

  b.plane('grass', 320, 230, 0, -0.055, 0, -HALF_PI);
  b.plane('brick', 61, 45.7, 6.5, 0.015, 6.85, -HALF_PI);
  b.plane('brickLane', 6, 40, -36.5, 0.024, -3, -HALF_PI);
  b.plane('court', 18, 22, 16, 0.042, 3, -HALF_PI);

  // Gate apron and a small concrete transition near the entrance.
  b.plane('concrete', 22, 2.3, 0, 0.033, 28.35, -HALF_PI);
  b.plane('concrete', 26, 3.5, 0, 0.032, 32.05, -HALF_PI);

  // Pavement and road outside the wall.
  b.plane('concrete', 220, 3.5, 0, 0.014, 31.75, -HALF_PI);
  b.plane('asphalt', 220, 7, 0, -0.005, 37.0, -HALF_PI);
  b.plane('asphaltBack', 220, 4.5, 0, -0.005, -36.5, -HALF_PI);

  // Curbs, split open at the central school driveway and the east side lane.
  for (const [xa, xb] of [[-110, -9.5], [9.5, 101.8], [108.8, 110]]) {
    b.box('stoneLight', xb - xa, 0.2, 0.28, (xa + xb) / 2, 0.08, 33.28);
  }
  for (const [xa, xb] of [[-110, -9.5], [9.5, 110]]) {
    b.box('stoneLight', xb - xa, 0.2, 0.28, (xa + xb) / 2, 0.08, 40.72);
  }
  for (let x = -96; x <= 96; x += 9) {
    b.box('roadMark', 3.2, 0.025, 0.12, x, 0.032, 37.0);
  }
  for (const [xa, xb] of [[-110, -9.5], [9.5, 110]]) {
    b.box('stoneLight', xb - xa, 0.16, 0.28, (xa + xb) / 2, 0.055, -33.95);
    b.box('stoneLight', xb - xa, 0.16, 0.28, (xa + xb) / 2, 0.055, -39.05);
  }

  // Forecourt paving pattern, with a central tone change.
  b.plane('concrete', 15.4, 4.2, 0, 0.047, 33.45, -HALF_PI);
  b.box('stoneLight', 26.4, 0.08, 0.16, 0, 0.08, 30.42);

  // Paved edges around the classroom wings.
  b.plane('concrete', 3.0, 37.0, 36.0, 0.036, -2.0, -HALF_PI);
  b.plane('concrete', 2.8, 33.0, -35.7, 0.036, -3.0, -HALF_PI);
  b.plane('concrete', 39, 2.4, 17, 0.026, -18.4, -HALF_PI);
  b.plane('concrete', 19, 2.2, -12.7, 0.026, -17.8, -HALF_PI);

  // Subtle court apron line.
  b.box('trimSoft', 18.7, 0.04, 0.13, 16, 0.062, -8.3);
  b.box('trimSoft', 18.7, 0.04, 0.13, 16, 0.062, 14.3);
  b.box('trimSoft', 0.13, 0.04, 22.5, 6.7, 0.062, 3);
  b.box('trimSoft', 0.13, 0.04, 22.5, 25.3, 0.062, 3);

  // A few small path markers / drainage grates.
  for (let i = 0; i < 5; i++) {
    b.box('metalDark', 0.42, 0.035, 0.28, -22.1, 0.043, 23 - i * 8.4);
    b.box('metalDark', 0.42, 0.035, 0.28, 35.2, 0.043, 21 - i * 8.4);
  }
}
