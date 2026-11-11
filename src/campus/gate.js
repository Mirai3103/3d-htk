/**
 * Main gate (front, z = +30), modelled on the real entrance: a tall portal of two stepped
 * pillars carrying a deep cornice and the school name board, dark-green sliding gate leaves,
 * a guard room with a flat overhanging roof on the left and a pedestrian side gate under a
 * low canopy on the right. Pillar bases are clad in dark tiles; ochre lines trim the slabs.
 *
 * Local frame: origin at (0, 30), x along the wall, +z towards the street. The perimeter wall
 * leaves the opening x ∈ [-10.2, 7.1]; everything here stays inside it.
 */

import * as THREE from 'three';
import { HALF_PI } from '../core/math.js';
import { Builder } from '../geometry/batching.js';
import { makeLampGlow } from '../scene/lights.js';
import { addDoorZ, addWindowZ } from '../kit/architecture.js';

const GATE_Z = 30;

// Portal dimensions (metres).
const OPENING = 6.0; // clear width between the main pillars
const PILLAR_W = 1.3;
const PILLAR_D = 1.3;
const PILLAR_TOP = 7.75; // underside of the cornice
const PILLAR_TILE_H = 1.3;
const BEAM_BOTTOM = 6.1;
const LEAF_H = 2.8;

const INNER = OPENING / 2; // 3.0
const OUTER = INNER + PILLAR_W; // 4.3

/** Dark tile cladding with light grout lines on every face. */
function addTiledBase(g, x, z, w, d, h) {
  g.box('stoneBase', w, h, d, x, h / 2, z);
  const rows = Math.max(2, Math.round(h / 0.3));
  for (let i = 1; i < rows; i++) {
    g.box('stone', w + 0.012, 0.016, d + 0.012, x, (i / rows) * h, z);
  }
  const colsX = Math.max(2, Math.round(w / 0.3));
  for (let i = 1; i < colsX; i++) {
    g.box('stone', 0.016, h, d + 0.012, x - w / 2 + (i / colsX) * w, h / 2, z);
  }
  const colsZ = Math.max(2, Math.round(d / 0.3));
  for (let i = 1; i < colsZ; i++) {
    g.box('stone', w + 0.012, h, 0.016, x, h / 2, z - d / 2 + (i / colsZ) * d);
  }
}

/**
 * A tall portal pillar read as two square shafts side by side separated by a shadow groove;
 * the half nearer the opening is set back slightly. `side` is -1 (left) or +1 (right).
 */
function addMainPillar(g, side) {
  const cx = side * (INNER + PILLAR_W / 2);
  const half = PILLAR_W / 2;
  const outerX = cx + (side * half) / 2;
  const innerX = cx - (side * half) / 2;
  const shaftH = PILLAR_TOP - PILLAR_TILE_H;
  const shaftY = PILLAR_TILE_H + shaftH / 2;

  addTiledBase(g, cx, 0, PILLAR_W + 0.04, PILLAR_D + 0.04, PILLAR_TILE_H);
  g.solidBox(PILLAR_W + 0.04, PILLAR_D + 0.04, cx, 0);
  g.box('creamDim', 0.05, shaftH, PILLAR_D - 0.1, cx, shaftY, 0);
  g.box('gateWall', half - 0.03, shaftH, PILLAR_D, outerX + side * 0.015, shaftY, 0);
  g.box('gateWall', half - 0.03, shaftH, PILLAR_D - 0.2, innerX - side * 0.015, shaftY, 0);

  // Ochre band at the board's lower edge and a pale capital under the cornice.
  g.box('gateOchre', PILLAR_W + 0.02, 0.09, PILLAR_D + 0.02, cx, BEAM_BOTTOM - 0.05, 0);
  g.box('cream', PILLAR_W + 0.16, 0.3, PILLAR_D + 0.16, cx, PILLAR_TOP - 0.15, 0);
  g.box('gateOchre', PILLAR_W + 0.18, 0.05, PILLAR_D + 0.18, cx, PILLAR_TOP - 0.31, 0);
}

/**
 * Shorter stepped pillar used at the end of the side gate and at the guard room corner:
 * tiled foot, twin shafts, a wider block capital with ochre edges and a short neck above it.
 */
function addSmallPillar(g, cx, cz, height, capTop, capH = 0.75, tileH = 0.6) {
  const w = 1.1;
  const d = 1.0;
  const shaftH = height - tileH;
  const shaftY = tileH + shaftH / 2;
  addTiledBase(g, cx, cz, w + 0.04, d + 0.04, tileH);
  g.solidBox(w + 0.04, d + 0.04, cx, cz);
  g.box('gateWall', w * 0.62, shaftH, d, cx - w * 0.19, shaftY, cz);
  g.box('gateWall', w * 0.36, shaftH, d - 0.16, cx + w * 0.31, shaftY, cz);
  g.box('creamDim', 0.04, shaftH, d - 0.2, cx + w * 0.12, shaftY, cz);
  g.box('cream', w + 0.16, capH, d + 0.16, cx, capTop - capH / 2, cz);
  g.box('gateOchre', w + 0.18, 0.05, d + 0.18, cx, capTop, cz);
  g.box('gateOchre', w + 0.18, 0.05, d + 0.18, cx, capTop - capH, cz);
}

/** Flat roof slab with a cream fascia and an ochre line along its top edges. */
function addFlatSlab(g, x1, x2, z1, z2, y, thickness, ochreSides) {
  const w = x2 - x1;
  const d = z2 - z1;
  const cx = (x1 + x2) / 2;
  const cz = (z1 + z2) / 2;
  g.box('trim', w, thickness, d, cx, y + thickness / 2, cz);
  const top = y + thickness;
  if (ochreSides.includes('front')) g.box('gateOchre', w + 0.02, 0.06, 0.05, cx, top - 0.02, z2 + 0.01);
  if (ochreSides.includes('back')) g.box('gateOchre', w + 0.02, 0.06, 0.05, cx, top - 0.02, z1 - 0.01);
  if (ochreSides.includes('left')) g.box('gateOchre', 0.05, 0.06, d + 0.02, x1 - 0.01, top - 0.02, cz);
  if (ochreSides.includes('right')) g.box('gateOchre', 0.05, 0.06, d + 0.02, x2 + 0.01, top - 0.02, cz);
}

/**
 * One dark-green steel leaf: solid lower panel, close vertical bars above, framed rails.
 * Spans x1..x2 on the wall line.
 */
function addGateLeaf(g, x1, x2, height = LEAF_H) {
  const w = x2 - x1;
  const cx = (x1 + x2) / 2;
  const z = 0;
  const bottom = 0.07;
  const panelTop = 1.0;
  g.solidBox(w, 0.12, cx, z);
  // Stiles.
  g.box('ironGreenDark', 0.09, height - bottom, 0.1, x1 + 0.045, bottom + (height - bottom) / 2, z);
  g.box('ironGreenDark', 0.09, height - bottom, 0.1, x2 - 0.045, bottom + (height - bottom) / 2, z);
  // Solid lower panel with a bottom rail.
  g.box('ironGreen', w - 0.1, panelTop - bottom, 0.05, cx, bottom + (panelTop - bottom) / 2, z);
  g.box('ironGreenDark', w - 0.04, 0.1, 0.1, cx, bottom + 0.05, z);
  // Rails.
  g.box('ironGreenDark', w - 0.04, 0.08, 0.09, cx, panelTop + 0.04, z);
  g.box('ironGreenDark', w - 0.04, 0.05, 0.07, cx, height - 0.24, z);
  g.box('ironGreenDark', w - 0.04, 0.08, 0.09, cx, height - 0.04, z);
  // Bars.
  const count = Math.max(3, Math.round(w / 0.125));
  const barH = height - panelTop - 0.12;
  for (let i = 1; i < count; i++) {
    g.box('ironGreen', 0.026, barH, 0.026, x1 + (i / count) * w, panelTop + 0.06 + barH / 2, z);
  }
}

function buildPortal(g) {
  addMainPillar(g, -1);
  addMainPillar(g, 1);

  // Name-board beam spanning between the pillars, front set back from the pillar faces.
  const beamH = PILLAR_TOP - BEAM_BOTTOM;
  g.box('gateWall', OPENING + 0.02, beamH, 0.9, 0, BEAM_BOTTOM + beamH / 2, 0);
  g.box('cream', OPENING + 0.02, 0.12, 0.96, 0, BEAM_BOTTOM + 0.06, 0);
  const signH = 1.25;
  const signY = BEAM_BOTTOM + 0.12 + signH / 2;
  g.plane('signGate', OPENING - 0.06, signH, 0, signY, 0.452);
  g.plane('signGate', OPENING - 0.06, signH, 0, signY, -0.452, 0, Math.PI, 0);

  // Deep cornice: fascia box under a wider, thin slab.
  const fasciaH = 0.45;
  g.box('cream', (OUTER + 0.7) * 2, fasciaH, 2.5, 0, PILLAR_TOP + fasciaH / 2, 0);
  g.box('gateOchre', (OUTER + 0.7) * 2 + 0.02, 0.05, 2.52, 0, PILLAR_TOP + 0.03, 0);
  addFlatSlab(g, -(OUTER + 1.0), OUTER + 1.0, -1.45, 1.45, PILLAR_TOP + fasciaH, 0.2,
    ['front', 'back', 'left', 'right']);

  // Two downlights under the cornice for the night scene.
  for (const x of [-2.2, 2.2]) {
    g.box('metalDark', 0.26, 0.05, 0.26, x, PILLAR_TOP - 0.02, 0.95);
    g.sphere('lampGlass', 0.11, x, PILLAR_TOP - 0.08, 0.95, 1.3, 0.55, 1.3);
    makeLampGlow(new THREE.Vector3(x, PILLAR_TOP - 0.15, GATE_Z + 0.95)).scale.set(2.4, 2.4, 1);
  }

  // Main gate: two leaves meeting at the centre, with hinges, latch and track wheels.
  addGateLeaf(g, -INNER + 0.03, -0.015);
  addGateLeaf(g, 0.015, INNER - 0.03);
  for (const x of [-INNER + 0.05, INNER - 0.05]) {
    for (const y of [0.45, 1.4, 2.4]) g.box('metalDark', 0.1, 0.14, 0.14, x, y, 0);
  }
  g.box('metalDark', 0.08, 0.22, 0.14, 0, 1.15, 0.02);
  for (const x of [-0.35, 0.35]) {
    g.cylinder('metalDark', 0.065, 0.05, x, 0.065, 0, 0, 0, HALF_PI);
  }
  g.box('stoneLight', OPENING, 0.04, 0.42, 0, 0.02, 0);
}

function buildGuardRoom(g) {
  const x1 = -10.2;
  const x2 = -OUTER - 0.02;
  const zBack = -3.6;
  const zFront = 0.4;
  const wallH = 4.4;
  const w = x2 - x1;
  const cx = (x1 + x2) / 2;
  const d = zFront - zBack;
  const cz = (zFront + zBack) / 2;

  g.box('stone', w + 0.04, 0.16, d + 0.04, cx, 0.08, cz);
  g.box('gateWall', w, wallH, d, cx, wallH / 2, cz);
  g.solidBox(w + 0.04, d + 0.04, cx, cz);
  addFlatSlab(g, -10.75, x2, zBack - 0.35, zFront + 0.4, wallH, 0.22, ['front', 'left', 'back']);

  // Stepped corner pilaster where the boundary wall meets the guard room.
  addSmallPillar(g, -10.0, 0.15, wallH, 3.95, 1.0, 0.55);

  // Large street-facing window: silver frame, three panes and a security grille.
  const winX = (-9.45 + x2) / 2;
  const winW = 2.5;
  const winH = 2.3;
  const sill = 1.5;
  const fz = zFront;
  g.box('recess', winW + 0.14, winH + 0.14, 0.04, winX, sill + winH / 2, fz + 0.01);
  g.plane('windowLit', winW, winH, winX, sill + winH / 2, fz + 0.035);
  const frameZ = fz + 0.06;
  g.box('metalLight', winW + 0.12, 0.07, 0.06, winX, sill - 0.02, frameZ);
  g.box('metalLight', winW + 0.12, 0.07, 0.06, winX, sill + winH + 0.02, frameZ);
  g.box('metalLight', 0.07, winH + 0.1, 0.06, winX - winW / 2 - 0.02, sill + winH / 2, frameZ);
  g.box('metalLight', 0.07, winH + 0.1, 0.06, winX + winW / 2 + 0.02, sill + winH / 2, frameZ);
  for (const k of [-1, 1]) {
    g.box('metalLight', 0.05, winH, 0.05, winX + (k * winW) / 6, sill + winH / 2, frameZ);
  }
  // Grille: two horizontal bars and one centre bar per pane.
  for (const f of [0.36, 0.68]) {
    g.box('metalLight', winW, 0.025, 0.025, winX, sill + f * winH, frameZ + 0.03);
  }
  for (const k of [-1, 0, 1]) {
    g.box('metalLight', 0.025, winH, 0.025, winX + (k * winW) / 3, sill + winH / 2, frameZ + 0.03);
  }
  g.box('cream', winW + 0.3, 0.08, 0.2, winX, sill - 0.09, fz + 0.1);

  // Door and a small window on the courtyard side.
  const back = new Builder(0, GATE_Z, Math.PI);
  addDoorZ(back, -cx + 1.2, 0.1, -zBack, 1.0, 2.2, 'doorTeal');
  addWindowZ(back, -cx - 1.1, 1.3, -zBack, 1.4, 1.2, true);
  g.box('stoneLight', 1.4, 0.1, 0.7, cx - 1.2, 0.05, zBack - 0.35);
}

function buildSideGate(g) {
  const pillarX = 6.8;
  const canopyY = 4.1;
  addSmallPillar(g, pillarX, 0, canopyY, 3.9, 0.7, 0.6);

  // Low canopy from the main pillar past the small pillar.
  g.box('cream', 7.6 - OUTER, 0.32, 2.1, (OUTER + 7.6) / 2, canopyY + 0.16, 0);
  addFlatSlab(g, OUTER, 7.75, -1.2, 1.2, canopyY + 0.32, 0.18, ['front', 'back', 'right']);

  addGateLeaf(g, OUTER + 0.03, pillarX - 0.58);
  g.box('stoneLight', pillarX - 0.55 - OUTER, 0.04, 0.42, (OUTER + pillarX - 0.55) / 2, 0.02, 0);
}

export function buildMainGate() {
  const g = new Builder(0, GATE_Z, 0);
  buildPortal(g);
  buildGuardRoom(g);
  buildSideGate(g);
}
