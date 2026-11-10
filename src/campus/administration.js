/**
 * Administration block (back of campus, the landmark building).
 */

import { Builder } from '../geometry/batching.js';
import {
  addArchedWindow,
  addDoorZ,
  addHipRoof,
  addRailingX,
  addRailingZ,
  addWindowX,
  addWindowZ,
} from '../kit/architecture.js';

export function buildAdministration() {
  const b = new Builder(-12, -23, 0);
  const W = 20;
  const D = 12;
  const H = 10.8;
  const zf = D / 2;

  b.box('wall', W, H, D, 0, H / 2, 0);
  b.box('stoneBase', W + 0.24, 0.38, D + 0.24, 0, 0.19, 0);
  b.box('trim', W + 0.28, 0.15, D + 0.28, 0, 3.58, 0);
  b.box('trim', W + 0.28, 0.15, D + 0.28, 0, 7.18, 0);
  b.box('trim', W + 0.62, 0.3, D + 0.55, 0, 10.64, 0);
  b.box('trimSoft', W + 0.4, 0.18, D + 0.36, 0, 10.33, 0);

  // Pilasters and the central bay that holds the big arched window.
  for (const x of [-W / 2 + 0.19, W / 2 - 0.19]) {
    b.box('trim', 0.34, H - 0.25, 0.2, x, H / 2, zf + 0.06);
    b.box('trim', 0.34, H - 0.25, 0.2, x, H / 2, -zf - 0.06);
  }
  for (const x of [-3.18, 3.18]) {
    b.box('trimSoft', 0.25, H - 0.4, 0.16, x, H / 2 - 0.05, zf + 0.055);
  }

  // Regular windows, ground through third floor.
  const groundWindows = [-8.35, -5.35, 5.35, 8.35];
  for (const x of groundWindows) {
    addWindowZ(b, x, 1.16, zf, 1.38, 1.8, (x + 10) % 3 !== 0);
    addWindowZ(b, x, 4.72, zf, 1.38, 1.7, (x + 13) % 4 !== 0);
    addWindowZ(b, x, 8.15, zf, 1.38, 1.55, (x + 16) % 5 !== 0);
  }

  // Matching windows on the courtyard-side end wall.
  for (const floorY of [1.16, 4.72, 8.15]) {
    addWindowX(b, W / 2, floorY, -2.5, 1.25, 1.6, 1, floorY > 2);
    addWindowX(b, W / 2, floorY, 0.55, 1.25, 1.6, 1, true);
    addWindowX(b, -W / 2, floorY, -1.6, 1.25, 1.6, -1, floorY > 2);
  }

  // Tall arched central window spanning the upper two floors.
  addArchedWindow(b, 0, 4.12, zf, 3.65, 5.2, false);
  b.box('trim', 4.2, 0.12, 0.18, 0, 4.04, zf + 0.1);

  // School lettering near the roofline.
  b.plane('signAdmin', 8.2, 1.0, 0, 10.12, zf + 0.055);
  b.box('gold', 8.42, 0.045, 0.06, 0, 10.66, zf + 0.09);
  b.box('gold', 8.42, 0.045, 0.06, 0, 9.58, zf + 0.09);

  // Ground-floor entrance and projecting porch with balcony.
  addDoorZ(b, -0.57, 0.16, zf, 1.03, 2.35, 'doorWood');
  addDoorZ(b, 0.57, 0.16, zf, 1.03, 2.35, 'doorWood');
  b.box('trim', 0.12, 2.5, 0.16, 0, 1.42, zf + 0.11);
  b.box('trim', 2.7, 0.12, 0.16, 0, 2.63, zf + 0.11);
  addWindowZ(b, -2.25, 1.23, zf, 0.82, 1.62, false);
  addWindowZ(b, 2.25, 1.23, zf, 0.82, 1.62, false);

  b.box('stoneLight', 6.15, 0.22, 3.2, 0, 0.11, 7.59);
  b.box('stoneLight', 5.5, 0.12, 0.55, 0, 0.06, 9.45);
  b.box('stoneLight', 5.9, 0.13, 0.5, 0, 0.16, 9.2);
  for (const x of [-2.35, 2.35]) {
    b.cylinder('trim', 0.17, 3.36, x, 1.84, 8.96);
    b.cylinder('creamDim', 0.28, 0.14, x, 0.22, 8.96);
    b.cylinder('trim', 0.26, 0.12, x, 3.56, 8.96);
  }
  b.box('trim', 6.25, 0.28, 3.38, 0, 3.67, 7.67);
  b.box('trimSoft', 6.42, 0.16, 3.54, 0, 3.86, 7.67);
  b.box('creamDim', 5.9, 0.09, 0.17, 0, 3.53, 9.38);
  addRailingX(b, -2.78, 2.78, 3.91, 9.28);
  addRailingZ(b, 6.18, 9.28, 3.91, -2.78);
  addRailingZ(b, 6.18, 9.28, 3.91, 2.78);
  b.box('trim', 0.24, 0.03, 0.24, -2.78, 3.93, 6.2);
  b.box('trim', 0.24, 0.03, 0.24, 2.78, 3.93, 6.2);
  // Small topiary pots frame the balcony.
  for (const x of [-2.25, 2.25]) {
    b.cylinder('terracotta', 0.22, 0.38, x, 4.12, 8.73);
    b.blob('shrubLight', 0.34, x, 4.5, 8.73, 1.0, 0.8, 1.0);
    b.sphere('flowerPink', 0.045, x + 0.12, 4.53, 8.78);
  }

  // Small brackets under the slab.
  for (const x of [-2.85, 2.85]) {
    b.box('trim', 0.22, 0.45, 0.9, x, 3.45, 8.7);
  }

  // Side downpipes and a discreet rear service door.
  for (const x of [-W / 2 + 0.25, W / 2 - 0.25]) {
    b.cylinder('metalLight', 0.065, H - 0.4, x, (H - 0.4) / 2, zf - 0.35);
    b.box('metalLight', 0.14, 0.1, 0.2, x, 0.14, zf - 0.25);
  }
  addDoorZ(b, 5.3, 0.16, -zf, 1.0, 2.2, 'doorTeal');

  // Hip roof and a simple roof drainage scupper.
  addHipRoof(b, 0, H, 0, W, D, 3.0, 0.95, 'roofGreen', 'ridge');
  for (const x of [-7.8, 7.8]) {
    b.box('metalLight', 0.24, 0.24, 0.8, x, H + 0.15, zf + 0.55);
  }

  // Warm facade wall lights, small but legible at night.
  for (const x of [-1.7, 1.7]) {
    b.box('metalDark', 0.13, 0.18, 0.13, x, 3.0, zf + 0.13);
    b.sphere('lampGlass', 0.08, x, 2.93, zf + 0.16, 1, 1.2, 1);
  }

  // Low flower bed across the facade edges.
  for (const [x, key] of [[-9.2, 'shrub'], [-7.4, 'shrubLight'], [7.4, 'shrub'], [9.2, 'shrubLight']]) {
    b.blob(key, 0.55, x, 0.38, zf + 0.65, 1.3, 0.8, 0.9);
  }
}
