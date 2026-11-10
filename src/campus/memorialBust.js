/**
 * Memorial bust and its flower bed.
 */

import { HALF_PI, TAU } from '../core/math.js';
import { siteBuilder, UNIT } from '../geometry/batching.js';
import { addFlowerCluster } from '../kit/vegetation.js';

export function buildMemorialBust() {
  const b = siteBuilder;
  const bx = 10;
  const bz = -13;

  // Circular garden bed, stone edging and flowers.
  b.geometry('mulch', UNIT.circle, bx, 0.055, bz, -HALF_PI, 0, 0, 2.05, 2.05, 1);
  b.geometry('stoneLight', UNIT.ring, bx, 0.1, bz, -HALF_PI, 0, 0, 2.1, 2.1, 1.5);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU;
    const r = 1.38 + (i % 3) * 0.18;
    b.blob(i % 2 ? 'shrub' : 'shrubLight', 0.36 + (i % 3) * 0.07, bx + Math.cos(a) * r, 0.35, bz + Math.sin(a) * r, 1.2, 0.75, 1.1);
    if (i % 2 === 0) addFlowerCluster(b, bx + Math.cos(a) * r, bz + Math.sin(a) * r, 0.34, 31 + i);
  }
  addFlowerCluster(b, bx - 0.9, bz + 1.04, 0.42, 66);
  addFlowerCluster(b, bx + 0.8, bz - 1.1, 0.4, 67);

  // Two-metre stone pedestal.
  b.box('stoneBase', 1.34, 0.22, 1.34, bx, 0.14, bz);
  b.box('stone', 0.92, 1.52, 0.92, bx, 0.94, bz);
  b.box('stoneLight', 1.04, 0.18, 1.04, bx, 1.79, bz);
  b.box('stone', 0.8, 0.18, 0.8, bx, 1.94, bz);
  b.plane('signPlaque', 0.68, 0.43, bx, 1.12, bz + 0.472);
  b.box('gold', 0.74, 0.035, 0.025, bx, 1.36, bz + 0.48);
  b.box('gold', 0.74, 0.035, 0.025, bx, 0.88, bz + 0.48);

  // Low-poly bronze memorial bust.
  b.sphere('bronze', 0.42, bx, 2.22, bz, 1.6, 0.75, 0.86);
  b.cylinder('bronze', 0.125, 0.14, bx, 2.42, bz);
  b.sphere('bronze', 0.245, bx, 2.66, bz - 0.015, 0.92, 1.18, 0.96);
  b.sphere('bronze', 0.06, bx, 2.64, bz + 0.215, 0.8, 0.85, 0.55);
  b.sphere('bronze', 0.1, bx, 2.93, bz - 0.06, 1.4, 0.4, 0.75);
  b.box('bronze', 0.48, 0.18, 0.3, bx, 2.1, bz - 0.16);
}
