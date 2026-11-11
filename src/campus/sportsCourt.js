/**
 * Sports court hoops, lines and benches.
 */

import { HALF_PI, TAU } from '../core/math.js';
import { siteBuilder, UNIT } from '../geometry/batching.js';
import { addBench } from '../kit/furniture.js';

export function buildSportsCourtDetails() {
  const b = siteBuilder;
  // Perimeter path is covered with a subtle white line.
  b.geometry('courtLine', UNIT.torus, 16, 0.055, 3, -HALF_PI, 0, 0, 1.8, 1.8, 1.0);
  b.box('courtLine', 18.0, 0.012, 0.055, 16, 0.058, -7.9);
  b.box('courtLine', 18.0, 0.012, 0.055, 16, 0.058, 13.9);
  b.box('courtLine', 0.055, 0.012, 21.8, 7.0, 0.058, 3);
  b.box('courtLine', 0.055, 0.012, 21.8, 25.0, 0.058, 3);

  function addHoop(zPole, direction) {
    const backZ = zPole + direction * 0.78;
    const rimZ = zPole + direction * 1.05;
    b.cylinder('metalDark', 0.08, 3.52, 16, 1.76, zPole);
    b.solidCircle(0.1, 16, zPole);
    b.box('metalDark', 0.12, 0.12, 1.0, 16, 3.26, zPole + direction * 0.43);
    b.box('trim', 1.3, 0.82, 0.06, 16, 3.28, backZ);
    b.box('orange', 0.38, 0.27, 0.025, 16, 3.33, backZ + direction * 0.042);
    b.box('metalDark', 0.08, 0.55, 0.08, 16, 2.98, backZ - direction * 0.18);
    b.geometry('orange', UNIT.torus, 16, 2.93, rimZ, -HALF_PI, 0, 0, 0.31, 0.31, 0.31);
    const netTopY = 2.9;
    const netBottomY = 2.55;
    const netBottomRadius = 0.15;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      b.cylinderBetween(
        'trimSoft',
        16 + Math.cos(a) * 0.29, netTopY, rimZ + Math.sin(a) * 0.29,
        16 + Math.cos(a) * netBottomRadius, netBottomY, rimZ + Math.sin(a) * netBottomRadius,
        0.009,
      );
      const a2 = ((i + 1) / 8) * TAU;
      b.cylinderBetween(
        'trimSoft',
        16 + Math.cos(a) * netBottomRadius, netBottomY, rimZ + Math.sin(a) * netBottomRadius,
        16 + Math.cos(a2) * 0.15, 2.6, rimZ + Math.sin(a2) * 0.15,
        0.008,
      );
    }
  }
  addHoop(-9.35, 1);
  addHoop(15.35, -1);

  // Small team benches along the courtyard side.
  addBench(b, 4.8, 12.5, HALF_PI);
  addBench(b, 4.8, 2.5, HALF_PI);
}
