/**
 * East side yard: basketball court, parking rows, secondary gate and the service lane
 * outside it. The yard fills x ∈ [50, 100] beside the main lot.
 */

import { HALF_PI } from '../core/math.js';
import { Builder, siteBuilder } from '../geometry/batching.js';
import { addBench, addBicycleRack, addStudent } from '../kit/furniture.js';
import { addTree } from '../kit/vegetation.js';
import { addBasketballHoop } from './sportsCourt.js';

const EAST_X = 100;
const GATE_Z = 14;
const GATE_OPENING = 7.0;
const GATE_PILLAR = 1.0;
const COURT_X = 75;
const COURT_Z = 0;

/** Lean-to bicycle shelter along the yard's west edge. */
function addParkingShed(b) {
  const length = 40.4;
  b.box('roofShed', 4.6, 0.12, length, 53.1, 2.62, 0, 0, 0, -0.12);
  b.box('metalDark', 0.1, 0.1, length, 51.0, 2.86, 0);
  b.box('metalDark', 0.1, 0.1, length, 55.2, 2.39, 0);
  for (let z = -19; z <= 19; z += 4.75) {
    b.cylinder('metalDark', 0.06, 2.86, 51.0, 1.43, z);
    b.solidCircle(0.08, 51.0, z);
    b.cylinder('metalDark', 0.06, 2.39, 55.2, 1.195, z);
    b.solidCircle(0.08, 55.2, z);
  }
  for (let z = -16; z <= 16; z += 8) addBicycleRack(b, 53.2, z, HALF_PI, 3);
}

/** Open bicycle bays along the north wall (four rows of racks between painted lines). */
function addNorthParking(b) {
  b.plane('asphalt', 42, 6.0, 76.8, 0.024, -26.4, -HALF_PI);
  for (let x = 58; x <= 96; x += 2.9) {
    b.box('courtLine', 0.08, 0.012, 5.4, x, 0.034, -26.4);
  }
  b.box('courtLine', 42, 0.012, 0.08, 76.8, 0.034, -29.35);
  b.box('courtLine', 42, 0.012, 0.08, 76.8, 0.034, -23.45);
  for (const x of [63, 73, 83, 93]) addBicycleRack(b, x, -26.4, 0, 4);
}

/** Lean-to roof over the north bicycle bays, sloping towards the court. */
function addNorthShelter(b) {
  const length = 42.4;
  b.box('roofShed', length, 0.12, 4.8, 76.8, 2.62, -26.4, 0.12, 0, 0);
  b.box('trimSoft', length, 0.2, 0.08, 76.8, 2.35, -24.04);
  b.box('trimSoft', length, 0.18, 0.08, 76.8, 2.9, -28.76);
  b.box('metalDark', length, 0.1, 0.1, 76.8, 2.9, -28.55);
  b.box('metalDark', length, 0.1, 0.1, 76.8, 2.34, -24.25);
  for (let x = 57.5; x <= 96; x += 4.8) {
    b.cylinder('metalDark', 0.06, 2.9, x, 1.45, -28.55);
    b.solidCircle(0.08, x, -28.55);
    b.cylinder('metalDark', 0.06, 2.34, x, 1.17, -24.25);
    b.solidCircle(0.08, x, -24.25);
  }
}

function addGatePillar(b, z) {
  b.box('stoneBase', 1.24, 0.72, 1.24, EAST_X, 0.36, z);
  b.box('gateWall', 0.9, 3.1, 0.9, EAST_X, 2.27, z);
  b.box('redDark', 0.94, 0.1, 0.94, EAST_X, 2.08, z);
  b.box('redDark', 0.94, 0.14, 0.94, EAST_X, 3.66, z);
  b.box('trim', 1.14, 0.18, 1.14, EAST_X, 3.91, z);
}

/** Lower side arm from each main pier to a small wall pier, as on the real gate. */
function addGateArm(b, dir) {
  const mainOuter = GATE_Z + dir * (GATE_OPENING / 2 + GATE_PILLAR);
  const smallZ = GATE_Z + dir * 6.0;
  const armZ = (mainOuter + smallZ) / 2;
  const armLen = Math.abs(mainOuter - smallZ) + 0.35;
  b.box('gateWall', 0.5, 0.32, armLen, EAST_X, 2.45, armZ);
  b.box('redDark', 0.54, 0.06, armLen, EAST_X, 2.26, armZ);
  b.box('trim', 0.56, 0.08, armLen, EAST_X, 2.65, armZ);
  b.box('stoneBase', 0.7, 0.5, 0.7, EAST_X, 0.25, smallZ);
  b.box('gateWall', 0.55, 1.95, 0.55, EAST_X, 1.475, smallZ);
  b.box('redDark', 0.59, 0.08, 0.59, EAST_X, 2.25, smallZ);
  b.box('trim', 0.7, 0.12, 0.7, EAST_X, 2.55, smallZ);
}

function addGateLeaf(g, x1, x2) {
  const w = x2 - x1;
  const cx = (x1 + x2) / 2;
  const bottom = 0.08;
  const top = 2.3;
  const panelTop = 1.05;
  g.box('redDark', 0.1, top - bottom, 0.12, x1 + 0.05, (top + bottom) / 2, 0);
  g.box('redDark', 0.1, top - bottom, 0.12, x2 - 0.05, (top + bottom) / 2, 0);
  g.box('redDark', w - 0.12, 0.09, 0.13, cx, panelTop + 0.045, 0);
  g.box('redDark', w - 0.12, 0.09, 0.13, cx, top - 0.045, 0);
  g.box('redDark', w - 0.12, 0.09, 0.13, cx, bottom + 0.045, 0);
  g.box('red', w - 0.14, panelTop - bottom, 0.06, cx, (panelTop + bottom) / 2, 0);
  const count = Math.max(4, Math.round(w / 0.14));
  const barH = top - panelTop - 0.14;
  for (let i = 1; i < count; i++) {
    g.box('redDark', 0.028, barH, 0.028, x1 + (i / count) * w, panelTop + 0.07 + barH / 2, 0);
  }
}

/** Maroon band along both faces of the east boundary wall. */
function addWallBand(b, z1, z2) {
  const length = z2 - z1;
  if (length <= 0) return;
  const cz = (z1 + z2) / 2;
  for (const x of [EAST_X - 0.155, EAST_X + 0.155]) {
    b.box('redDark', 0.03, 0.12, length, x, 1.7, cz);
  }
}

/** Secondary gate: wide sign beam, maroon steel leaves and the red welcome banner. */
function addSecondaryGate(b) {
  const pillarOffset = GATE_OPENING / 2 + GATE_PILLAR / 2;
  addGatePillar(b, GATE_Z - pillarOffset);
  addGatePillar(b, GATE_Z + pillarOffset);
  addGateArm(b, -1);
  addGateArm(b, 1);

  const beamLen = GATE_OPENING + 2 * GATE_PILLAR;
  b.box('gateWall', 0.55, 0.95, beamLen, EAST_X, 4.475, GATE_Z);
  b.box('redDark', 0.6, 0.09, beamLen, EAST_X, 4.03, GATE_Z);
  b.box('redDark', 0.6, 0.1, beamLen, EAST_X, 4.9, GATE_Z);
  b.box('trim', 0.66, 0.1, beamLen + 0.12, EAST_X, 4.99, GATE_Z);
  for (const [faceX, ry] of [[EAST_X + 0.281, HALF_PI], [EAST_X - 0.281, -HALF_PI]]) {
    b.plane('signSideGate', 8.2, 0.78, faceX, 4.47, GATE_Z, 0, ry, 0);
  }

  const gate = new Builder(EAST_X, GATE_Z, HALF_PI);
  addGateLeaf(gate, -GATE_OPENING / 2 + 0.03, -0.015);
  addGateLeaf(gate, 0.015, GATE_OPENING / 2 - 0.03);
  for (const x of [-GATE_OPENING / 2 + 0.08, GATE_OPENING / 2 - 0.08]) {
    for (const y of [0.45, 1.4, 2.2]) gate.box('metalDark', 0.1, 0.14, 0.14, x, y, 0);
  }
  gate.box('metalDark', 0.08, 0.2, 0.14, 0, 1.15, 0);

  b.box('stoneLight', 1.0, 0.06, GATE_OPENING, EAST_X, 0.03, GATE_Z);
  // Small blue notice on the closed leaves, as in the photo.
  b.box('trim', 0.09, 0.55, 0.7, EAST_X, 1.45, GATE_Z);
  b.box('doorBlue', 0.11, 0.45, 0.6, EAST_X, 1.45, GATE_Z);

  addWallBand(b, -30, GATE_Z - pillarOffset - GATE_PILLAR / 2);
  addWallBand(b, GATE_Z + pillarOffset + GATE_PILLAR / 2, 30);
}

/** Sidewalk and service lane outside the east wall. */
function addEastLane(b) {
  b.plane('concrete', 1.9, 74, 101.05, 0.016, 2, -HALF_PI);
  b.plane('asphalt', 6.6, 74, 105.3, 0.004, -3, -HALF_PI);
  b.box('stoneLight', 0.28, 0.16, 73, 108.75, 0.055, -3);
}

export function buildSideYard() {
  const b = siteBuilder;

  // Yard paving, plus two short links into the main campus around the right wing.
  b.plane('concrete', 50, 59.6, 75, 0.02, 0, -HALF_PI);
  b.plane('concrete', 13, 5.6, 43.5, 0.03, 21.5, -HALF_PI);
  b.plane('concrete', 13, 5.6, 43.5, 0.03, -22.5, -HALF_PI);

  addParkingShed(b);
  addNorthParking(b);
  addNorthShelter(b);

  // Full-size court with a metre of runoff on every side.
  b.plane('basketball', 30, 17, COURT_X, 0.04, COURT_Z, -HALF_PI);
  addBasketballHoop(b, 59.55, COURT_Z, HALF_PI, 1);
  addBasketballHoop(b, 90.45, COURT_Z, -HALF_PI, 1);
  addBench(b, 69.5, 10.3, 0);
  addBench(b, 80.5, 10.3, 0);
  addStudent(b, 71.4, 9.4, -0.4, 31);
  addStudent(b, 78.8, 9.6, 0.35, 32);

  addSecondaryGate(b);
  addEastLane(b);

  addTree(b, 61.5, 25.8, 7.0, 2.9, 921);
  addTree(b, 96.8, 24.5, 7.8, 3.3, 922);
  addTree(b, 96.5, -20.0, 7.4, 3.2, 923);
}
