/**
 * Courtyard lamp posts.
 */

import { siteBuilder } from '../geometry/batching.js';

export function buildCourtyardLamps() {
  const b = siteBuilder;
  const positions = [
    [-19.0, 23.1],
    [27.6, 20.8],
    [-17.4, -9.6],
    [29.4, -9.8],
  ];
  for (const [x, z] of positions) {
    b.cylinder('stoneBase', 0.26, 0.28, x, 0.14, z);
    b.solidCircle(0.26, x, z);
    b.cylinder('lampMetal', 0.07, 3.62, x, 2.01, z);
    b.box('lampMetal', 1.32, 0.06, 0.06, x, 3.86, z);
    b.box('lampMetal', 0.06, 0.27, 0.06, x, 3.68, z);
    for (const offset of [-0.56, 0.56]) {
      const lx = x + offset;
      b.cylinder('lampMetal', 0.03, 0.22, lx, 3.74, z);
      b.cone('lampMetal', 0.19, 0.24, lx, 3.93, z, Math.PI, 0, 0);
      b.sphere('lampGlass', 0.115, lx, 3.79, z, 1, 1.15, 1);
    }
  }
}
