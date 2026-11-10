/**
 * Bicycle shed beside the right wing.
 */

import { HALF_PI } from '../core/math.js';
import { siteBuilder } from '../geometry/batching.js';
import { addBicycleRack } from '../kit/furniture.js';

export function buildBicycleShed() {
  const b = siteBuilder;
  b.plane('concrete', 3.05, 30.5, 48.48, 0.035, -2, -HALF_PI);
  for (let z = -16; z <= 12; z += 3.5) {
    b.cylinder('metalDark', 0.052, 2.48, 47.15, 1.24, z);
    b.box('metalDark', 0.12, 0.08, 0.12, 47.15, 0.06, z);
    b.box('metalDark', 0.1, 0.1, 0.1, 47.15, 2.48, z);
  }
  b.box('metalDark', 0.1, 0.1, 30.2, 47.15, 2.48, -2);
  b.box('metalDark', 0.1, 0.1, 30.2, 49.9, 2.83, -2);
  b.box('roofShed', 3.5, 0.12, 30.6, 48.5, 2.64, -2, 0, 0, -0.14);
  b.box('trimSoft', 0.12, 0.2, 30.6, 46.85, 2.85, -2);
  b.box('trimSoft', 0.12, 0.18, 30.6, 50.14, 2.34, -2);
  for (let z = -14; z <= 10; z += 4.2) {
    addBicycleRack(b, 48.15, z, HALF_PI, 2);
  }
  // A few low concrete blocks / bins under the shed.
  b.box('stoneLight', 0.6, 0.55, 0.6, 49.2, 0.275, -13.8);
  b.box('stoneLight', 0.6, 0.55, 0.6, 49.2, 0.275, -13.1);
}
