/**
 * Sports court hoops, lines and benches.
 */

import { HALF_PI, TAU } from '../core/math.js';
import { Builder, siteBuilder, UNIT } from '../geometry/batching.js';
import { addBench } from '../kit/furniture.js';

/**
 * A hoop on a 3.5 m pole, backboard and rim facing local +Z. Rotate with `yaw` and flip
 * with `direction` (-1) for the opposite end of a court.
 */
export function addBasketballHoop(b, x, z, yaw = 0, direction = 1) {
  const h = new Builder(x, z, yaw);
  const backZ = direction * 0.78;
  const rimZ = direction * 1.05;
  h.cylinder('metalDark', 0.08, 3.52, 0, 1.76, 0);
  h.solidCircle(0.1, 0, 0);
  h.box('metalDark', 0.12, 0.12, 1.0, 0, 3.26, direction * 0.43);
  h.box('trim', 1.3, 0.82, 0.06, 0, 3.28, backZ);
  h.box('orange', 0.38, 0.27, 0.025, 0, 3.33, backZ + direction * 0.042);
  h.box('metalDark', 0.08, 0.55, 0.08, 0, 2.98, backZ - direction * 0.18);
  h.geometry('orange', UNIT.torus, 0, 2.93, rimZ, -HALF_PI, 0, 0, 0.31, 0.31, 0.31);
  const netTopY = 2.9;
  const netBottomY = 2.55;
  const netBottomRadius = 0.15;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * TAU;
    h.cylinderBetween(
      'trimSoft',
      Math.cos(a) * 0.29, netTopY, rimZ + Math.sin(a) * 0.29,
      Math.cos(a) * netBottomRadius, netBottomY, rimZ + Math.sin(a) * netBottomRadius,
      0.009,
    );
    const a2 = ((i + 1) / 8) * TAU;
    h.cylinderBetween(
      'trimSoft',
      Math.cos(a) * netBottomRadius, netBottomY, rimZ + Math.sin(a) * netBottomRadius,
      Math.cos(a2) * 0.15, 2.6, rimZ + Math.sin(a2) * 0.15,
      0.008,
    );
  }
}

export function buildSportsCourtDetails() {
  const b = siteBuilder;
  // Perimeter path is covered with a subtle white line.
  b.geometry('courtLine', UNIT.torus, 16, 0.055, 3, -HALF_PI, 0, 0, 1.8, 1.8, 1.0);
  b.box('courtLine', 18.0, 0.012, 0.055, 16, 0.058, -7.9);
  b.box('courtLine', 18.0, 0.012, 0.055, 16, 0.058, 13.9);
  b.box('courtLine', 0.055, 0.012, 21.8, 7.0, 0.058, 3);
  b.box('courtLine', 0.055, 0.012, 21.8, 25.0, 0.058, 3);

  addBasketballHoop(b, 16, -9.35, 0, 1);
  addBasketballHoop(b, 16, 15.35, 0, -1);

  // Small team benches along the courtyard side.
  addBench(b, 4.8, 12.5, HALF_PI);
  addBench(b, 4.8, 2.5, HALF_PI);
}
