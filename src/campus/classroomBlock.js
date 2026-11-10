/**
 * Parametric two-storey classroom block used for the back block and the three wings.
 */

import { seededRandom } from '../core/math.js';
import { Builder } from '../geometry/batching.js';
import {
  addDoorZ,
  addGableRoofX,
  addRailingX,
  addSimplePorch,
  addWindowX,
  addWindowZ,
} from '../kit/architecture.js';

export function buildClassroomBlock(options) {
  const {
    cx, cz, yaw, W, D, wallH = 7.2, roofRise = 2.5,
    roofKey = 'roofPale', ridgeKey = 'ridgePale',
    seed = 1, banner = false, porch = false, floors = 2,
  } = options;
  const b = new Builder(cx, cz, yaw);
  const corridor = 2.0;
  const coreD = D - corridor;
  const coreZ = -D / 2 + coreD / 2;
  const frontCore = coreZ + coreD / 2;
  const frontZ = D / 2;
  const floorHeight = wallH / floors;

  // Main teaching block with the open veranda along its front.
  b.box('wall', W, wallH, coreD, 0, wallH / 2, coreZ);
  b.box('stoneBase', W + 0.18, 0.34, coreD + 0.18, 0, 0.17, coreZ);
  b.box('trim', W + 0.22, 0.14, 0.18, 0, 3.58, frontCore + 0.06);
  b.box('trim', W + 0.22, 0.14, 0.18, 0, 7.08, frontCore + 0.06);
  b.box('trimSoft', W + 0.36, 0.2, 0.22, 0, wallH - 0.18, frontCore + 0.06);
  b.box('trim', 0.3, wallH - 0.25, 0.2, -W / 2 + 0.14, wallH / 2, frontCore + 0.06);
  b.box('trim', 0.3, wallH - 0.25, 0.2, W / 2 - 0.14, wallH / 2, frontCore + 0.06);

  // Floor slab, fascia, ceiling soffit, and a pale strip of corridor floor.
  b.box('stoneLight', W, 0.055, corridor + 0.1, 0, 0.035, frontZ - corridor / 2);
  b.box('trimSoft', W + 0.22, 0.22, corridor + 0.35, 0, 3.65, frontZ - corridor / 2 + 0.04);
  b.box('trim', W + 0.34, 0.2, 0.14, 0, 3.66, frontZ + 0.12);
  b.box('trimSoft', W + 0.18, 0.12, corridor + 0.12, 0, wallH - 0.17, frontZ - corridor / 2 + 0.01);
  b.box('plinth', W + 0.1, 0.18, corridor, 0, 0.09, frontZ - corridor / 2);

  // Slender columns give the veranda its rhythm and support the slab/roof.
  const columnCount = Math.max(4, Math.round(W / 4.5));
  const columnXs = [];
  for (let i = 0; i < columnCount; i++) {
    const x = -W / 2 + 0.45 + (i / (columnCount - 1)) * (W - 0.9);
    columnXs.push(x);
    b.box('trim', 0.3, wallH - 0.16, 0.3, x, (wallH - 0.16) / 2, frontZ - 0.18);
    b.box('creamDim', 0.42, 0.2, 0.42, x, 0.12, frontZ - 0.18);
    b.box('trim', 0.38, 0.12, 0.38, x, 3.65, frontZ - 0.18);
    b.box('trim', 0.4, 0.14, 0.4, x, wallH - 0.25, frontZ - 0.18);
  }

  // Railings on both levels; a central opening lets pupils reach the ground corridor.
  const gapHalf = Math.min(1.5, W * 0.045);
  addRailingX(b, -W / 2 + 0.28, W / 2 - 0.28, 0.09, frontZ - 0.025, [[-gapHalf, gapHalf]]);
  addRailingX(b, -W / 2 + 0.28, W / 2 - 0.28, 3.76, frontZ - 0.025);

  if (banner) {
    b.box('trim', 16.75, 1.1, 0.06, 0, 4.27, frontZ + 0.015);
    b.plane('signBanner', 16.5, 1.0, 0, 4.27, frontZ + 0.055);
  }

  // A shallow pair of entrance steps and a little landing.
  b.box('stoneLight', 3.1, 0.07, 0.6, 0, 0.035, frontZ + 0.28);
  b.box('stoneLight', 2.65, 0.06, 0.52, 0, 0.095, frontZ + 0.64);

  // Rows of doors and windows behind the veranda.
  const margin = Math.min(1.65, W * 0.075);
  const span = W - margin * 2;
  const bays = W >= 36 ? 9 : W >= 32 ? 7 : 8;
  const bayWidth = span / bays;
  const windowWidth = Math.min(1.78, bayWidth * 0.46);
  const doorWidth = Math.min(1.02, bayWidth * 0.27);
  for (let bay = 0; bay < bays; bay++) {
    const bx = -W / 2 + margin + (bay + 0.5) * bayWidth;
    const doorX = bx - bayWidth * 0.235;
    const winX = bx + bayWidth * 0.17;
    for (let floor = 0; floor < floors; floor++) {
      const baseY = floor * floorHeight + (floor === 0 ? 0.14 : 0.14);
      const doorKey = (bay + seed) % 4 === 0 ? 'doorTeal' : (bay + seed) % 4 === 1 ? 'doorBlue' : 'doorWood';
      addDoorZ(b, doorX, baseY, frontCore, doorWidth, 2.18, doorKey);
      const lit = ((bay * 3 + floor * 5 + seed * 7) % 10) > 2;
      addWindowZ(b, winX, baseY + 0.82, frontCore, windowWidth, 1.38, lit);
      // A transom above each door reads as a classroom entrance.
      b.box('recess', doorWidth * 0.84, 0.26, 0.035, doorX, baseY + 2.32, frontCore + 0.02);
      b.plane(lit ? 'windowLit' : 'windowDark', doorWidth * 0.8, 0.22, doorX, baseY + 2.32, frontCore + 0.043);
      if (floor === 0) {
        b.box('trim', 0.74, 0.18, 0.045, doorX, baseY + 2.68, frontCore + 0.09);
        b.box('doorBlue', 0.63, 0.11, 0.02, doorX, baseY + 2.68, frontCore + 0.115);
      }
    }
  }

  // Floor-level bands and small circulation details at each column.
  for (const x of columnXs) {
    b.box('trimSoft', 0.18, 0.05, 0.5, x, 3.88, frontCore + 0.25);
  }

  // End-wall windows, mostly visible on the perimeter wings.
  for (const side of [-1, 1]) {
    const xFace = side * W / 2;
    for (let floor = 0; floor < floors; floor++) {
      const y = floor * floorHeight + 1.22;
      addWindowX(b, xFace, y, coreZ - 1.55, 1.22, 1.55, side, (floor + seed) % 3 !== 0);
      addWindowX(b, xFace, y, coreZ + 1.55, 1.22, 1.55, side, (floor + seed) % 2 !== 0);
    }
  }

  // Rainwater downpipes at the corners.
  for (const x of [-W / 2 + 0.22, W / 2 - 0.22]) {
    b.cylinder('metalLight', 0.058, wallH - 0.2, x, (wallH - 0.2) / 2, frontZ - 0.1);
    b.cylinder('metalLight', 0.058, wallH - 0.2, x, (wallH - 0.2) / 2, -D / 2 + 0.12);
  }

  // Rear base and a few weed-level planting tufts for life between buildings.
  b.box('stoneBase', W + 0.08, 0.28, 0.22, 0, 0.14, -D / 2 - 0.05);
  const rng = seededRandom(seed * 61 + 12);
  for (let i = 0; i < 6; i++) {
    const x = -W / 2 + rng() * W;
    b.blob(i % 2 ? 'shrub' : 'shrubLight', 0.45 + rng() * 0.25, x, 0.28, -D / 2 - 0.35, 1.2, 0.8, 0.8);
  }

  // Long roof, ridge along the building's local X axis.
  addGableRoofX(b, 0, wallH, 0, W, D, roofRise, 0.9, roofKey, ridgeKey, 'wall');

  // Open-air porch requested for the inner left wing.
  if (porch) {
    addSimplePorch(b, frontZ + 1.7, 4.35, 3.3, 3.1, 'roofTile', 'ridgeTile');
    b.box('stoneLight', 2.8, 0.1, 0.45, 0, 0.06, frontZ + 3.58);
    b.box('stoneLight', 2.35, 0.1, 0.45, 0, 0.15, frontZ + 3.9);
  }

  return {
    W, D, height: wallH + roofRise, bays,
  };
}
