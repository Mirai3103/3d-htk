/**
 * Reusable architectural parts: windows, doors, railings, roofs, porches and awnings. All
 * take a Builder as first argument.
 */

import * as THREE from 'three';
import { HALF_PI } from '../core/math.js';

export function addArchedWindow(b, x, yBase, zFace, width, height, lit = true) {
  const radius = width / 2;
  const straight = Math.max(0.2, height - radius);
  const shape = new THREE.Shape();
  shape.moveTo(-radius, 0);
  shape.lineTo(radius, 0);
  shape.lineTo(radius, straight);
  shape.absarc(0, straight, radius, 0, Math.PI, false);
  shape.lineTo(-radius, 0);
  shape.closePath();
  const glassGeo = new THREE.ShapeGeometry(shape, 22);
  b.geometry(lit ? 'windowLit' : 'windowDark', glassGeo, x, yBase, zFace + 0.036);

  const frameZ = zFace + 0.088;
  const archRing = new THREE.RingGeometry(radius + 0.095, radius + 0.27, 30, 1, 0, Math.PI);
  b.geometry('trim', archRing, x, yBase + straight, frameZ);
  b.box('trim', 0.24, straight + 0.16, 0.1, x - radius - 0.13, yBase + straight / 2, frameZ);
  b.box('trim', 0.24, straight + 0.16, 0.1, x + radius + 0.13, yBase + straight / 2, frameZ);
  b.box('trim', width + 0.58, 0.13, 0.16, x, yBase - 0.08, frameZ);
  b.box('trim', width + 0.38, 0.08, 0.1, x, yBase + straight + radius + 0.22, frameZ);
  b.box('trim', 0.055, height - 0.14, 0.055, x, yBase + (height - 0.14) / 2 + 0.04, frameZ + 0.015);
  b.box('trim', width - 0.1, 0.05, 0.055, x, yBase + straight, frameZ + 0.015);
  b.box('brass', 0.22, 0.24, 0.16, x, yBase + straight + radius + 0.34, frameZ - 0.02);
  // A shallow recess darkens the edges of the big opening.
  const recess = new THREE.Shape();
  recess.moveTo(-radius - 0.18, -0.1);
  recess.lineTo(radius + 0.18, -0.1);
  recess.lineTo(radius + 0.18, straight);
  recess.absarc(0, straight, radius + 0.18, 0, Math.PI, false);
  recess.lineTo(-radius - 0.18, -0.1);
  b.geometry('recess', new THREE.ShapeGeometry(recess, 20), x, yBase, zFace + 0.008);
}

export function addWindowZ(b, x, yBottom, zFace, width, height, lit = true) {
  const glassZ = zFace + 0.04;
  b.box('recess', width + 0.18, height + 0.18, 0.045, x, yBottom + height / 2, zFace + 0.011);
  b.plane(lit ? 'windowLit' : 'windowDark', width, height, x, yBottom + height / 2, glassZ);
  const frameZ = zFace + 0.085;
  b.box('trim', 0.085, height + 0.24, 0.1, x - width / 2 - 0.045, yBottom + height / 2, frameZ);
  b.box('trim', 0.085, height + 0.24, 0.1, x + width / 2 + 0.045, yBottom + height / 2, frameZ);
  b.box('trim', width + 0.18, 0.095, 0.1, x, yBottom + height + 0.06, frameZ);
  b.box('trim', width + 0.31, 0.095, 0.23, x, yBottom - 0.07, zFace + 0.11);
  b.box('trim', 0.045, height - 0.03, 0.06, x, yBottom + height / 2, frameZ + 0.018);
  b.box('trim', width - 0.02, 0.04, 0.06, x, yBottom + height * 0.57, frameZ + 0.018);
}

export function addWindowX(b, xFace, yBottom, zCenter, width, height, outward = 1, lit = true) {
  const ry = outward > 0 ? HALF_PI : -HALF_PI;
  b.box('recess', 0.045, height + 0.18, width + 0.18, xFace + outward * 0.011, yBottom + height / 2, zCenter);
  b.plane(lit ? 'windowLit' : 'windowDark', width, height, xFace + outward * 0.04, yBottom + height / 2, zCenter, 0, ry, 0);
  const frameX = xFace + outward * 0.085;
  b.box('trim', 0.1, height + 0.24, 0.085, frameX, yBottom + height / 2, zCenter - width / 2 - 0.045);
  b.box('trim', 0.1, height + 0.24, 0.085, frameX, yBottom + height / 2, zCenter + width / 2 + 0.045);
  b.box('trim', 0.1, 0.095, width + 0.18, frameX, yBottom + height + 0.06, zCenter);
  b.box('trim', 0.23, 0.095, width + 0.31, xFace + outward * 0.11, yBottom - 0.07, zCenter);
  b.box('trim', 0.06, height - 0.03, 0.045, frameX + outward * 0.018, yBottom + height / 2, zCenter);
  b.box('trim', 0.06, 0.04, width - 0.02, frameX + outward * 0.018, yBottom + height * 0.57, zCenter);
}

export function addDoorZ(b, x, yBase, zFace, width = 1.05, height = 2.25, doorKey = 'doorWood') {
  b.box('recess', width + 0.2, height + 0.2, 0.045, x, yBase + height / 2, zFace + 0.011);
  b.box(doorKey, width, height, 0.075, x, yBase + height / 2, zFace + 0.062);
  b.box('trim', 0.1, height + 0.18, 0.1, x - width / 2 - 0.05, yBase + height / 2, zFace + 0.075);
  b.box('trim', 0.1, height + 0.18, 0.1, x + width / 2 + 0.05, yBase + height / 2, zFace + 0.075);
  b.box('trim', width + 0.2, 0.11, 0.1, x, yBase + height + 0.04, zFace + 0.075);
  b.box('stoneLight', width + 0.27, 0.075, 0.25, x, yBase + 0.035, zFace + 0.105);
  b.box('trimSoft', width * 0.66, height * 0.27, 0.018, x, yBase + height * 0.3, zFace + 0.108);
  b.box('trimSoft', width * 0.66, height * 0.33, 0.018, x, yBase + height * 0.7, zFace + 0.108);
  b.sphere('brass', 0.045, x + width * 0.33, yBase + height * 0.47, zFace + 0.125, 1, 1.4, 0.55);
  b.box('trimSoft', width * 0.47, 0.17, 0.018, x, yBase + height * 0.84, zFace + 0.109);
}

export function addDoorX(b, xFace, yBase, zCenter, width = 1.05, height = 2.25, outward = 1, doorKey = 'doorWood') {
  b.box('recess', 0.045, height + 0.2, width + 0.2, xFace + outward * 0.011, yBase + height / 2, zCenter);
  b.box(doorKey, 0.075, height, width, xFace + outward * 0.062, yBase + height / 2, zCenter);
  b.box('trim', 0.1, height + 0.18, 0.1, xFace + outward * 0.075, yBase + height / 2, zCenter - width / 2 - 0.05);
  b.box('trim', 0.1, height + 0.18, 0.1, xFace + outward * 0.075, yBase + height / 2, zCenter + width / 2 + 0.05);
  b.box('trim', 0.1, 0.11, width + 0.2, xFace + outward * 0.075, yBase + height + 0.04, zCenter);
  b.box('stoneLight', 0.25, 0.075, width + 0.27, xFace + outward * 0.105, yBase + 0.035, zCenter);
  b.sphere('brass', 0.045, xFace + outward * 0.128, yBase + height * 0.47, zCenter - width * 0.3, 0.55, 1.4, 1);
  b.box('trimSoft', 0.018, height * 0.3, width * 0.64, xFace + outward * 0.11, yBase + height * 0.29, zCenter);
}

export function addRailingX(b, x1, x2, yBase, z, gaps = []) {
  if (x2 <= x1) return;
  const ranges = [];
  let cursor = x1;
  const sortedGaps = gaps.slice().sort((a, b) => a[0] - b[0]);
  for (const [ga, gb] of sortedGaps) {
    if (gb <= cursor) continue;
    if (ga > cursor) ranges.push([cursor, Math.min(ga, x2)]);
    cursor = Math.max(cursor, gb);
    if (cursor >= x2) break;
  }
  if (cursor < x2) ranges.push([cursor, x2]);

  for (const [start, end] of ranges) {
    const length = end - start;
    if (length < 0.14) continue;
    // Only ground-level railings stand in a pedestrian's way.
    if (yBase < 1) b.solidBox(length, 0.1, (start + end) / 2, z);
    b.box('trim', length, 0.055, 0.065, (start + end) / 2, yBase + 0.98, z);
    b.box('trim', length, 0.04, 0.05, (start + end) / 2, yBase + 0.12, z);
    b.box('trim', 0.085, 1.04, 0.085, start, yBase + 0.52, z);
    b.box('trim', 0.085, 1.04, 0.085, end, yBase + 0.52, z);
    const spacing = 0.67;
    const count = Math.max(1, Math.round((length - 0.18) / spacing));
    for (let i = 1; i < count; i++) {
      const x = start + (i / count) * length;
      b.box('trim', 0.025, 0.84, 0.025, x, yBase + 0.55, z);
    }
    if (length > 2.8) {
      const posts = Math.floor(length / 2.8);
      for (let i = 1; i <= posts; i++) {
        const x = start + (i / (posts + 1)) * length;
        b.box('trim', 0.055, 1.02, 0.055, x, yBase + 0.51, z);
      }
    }
  }
}

function addGableTriangle(b, xFace, yBase, zCenter, depth, rise) {
  const positions = [];
  const uvs = [];
  const normalOrder = (flip) => {
    if (!flip) {
      positions.push(xFace, yBase, zCenter - depth / 2, xFace, yBase + rise, zCenter, xFace, yBase, zCenter + depth / 2);
    } else {
      positions.push(xFace, yBase, zCenter - depth / 2, xFace, yBase, zCenter + depth / 2, xFace, yBase + rise, zCenter);
    }
    for (let i = 0; i < 3; i++) uvs.push(0, 0);
  };
  normalOrder(false);
  normalOrder(true);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  b.geometry(b.__gableKey || 'wall', geometry);
}

export function addGableRoofX(b, cx, baseY, cz, width, depth, rise, overhang, roofKey, ridgeKey, gableKey = 'wall') {
  const span = depth + overhang * 2;
  const run = width + overhang * 2;
  const slope = Math.sqrt((span * 0.5) ** 2 + rise * rise);
  const angle = Math.atan2(rise, span * 0.5);
  b.box(roofKey, run, 0.18, slope, cx, baseY + rise / 2 + 0.055, cz + span / 4, angle, 0, 0);
  b.box(roofKey, run, 0.18, slope, cx, baseY + rise / 2 + 0.055, cz - span / 4, -angle, 0, 0);
  b.box('trim', run + 0.08, 0.18, 0.12, cx, baseY + 0.02, cz + span / 2);
  b.box('trim', run + 0.08, 0.18, 0.12, cx, baseY + 0.02, cz - span / 2);
  b.box(ridgeKey, run + 0.22, 0.2, 0.3, cx, baseY + rise + 0.12, cz);
  b.box('trim', 0.18, 0.22, slope + 0.16, cx - width / 2 - 0.015, baseY + rise / 2 + 0.07, cz + span / 4, angle, 0, 0);
  b.box('trim', 0.18, 0.22, slope + 0.16, cx + width / 2 + 0.015, baseY + rise / 2 + 0.07, cz + span / 4, angle, 0, 0);
  b.box('trim', 0.18, 0.22, slope + 0.16, cx - width / 2 - 0.015, baseY + rise / 2 + 0.07, cz - span / 4, -angle, 0, 0);
  b.box('trim', 0.18, 0.22, slope + 0.16, cx + width / 2 + 0.015, baseY + rise / 2 + 0.07, cz - span / 4, -angle, 0, 0);
  const oldWall = b.__gableKey;
  b.__gableKey = gableKey;
  addGableTriangle(b, cx - width / 2 + 0.012, baseY, cz, depth, rise);
  addGableTriangle(b, cx + width / 2 - 0.012, baseY, cz, depth, rise);
  b.__gableKey = oldWall;
}

export function addHipRoof(b, cx, baseY, cz, width, depth, rise, overhang, roofKey, ridgeKey) {
  const hw = width / 2 + overhang;
  const hd = depth / 2 + overhang;
  const ridgeHalf = Math.max(0.18, (width - depth) / 2 + overhang * 0.45);
  const SW = [cx - hw, baseY, cz + hd];
  const SE = [cx + hw, baseY, cz + hd];
  const NE = [cx + hw, baseY, cz - hd];
  const NW = [cx - hw, baseY, cz - hd];
  const RW = [cx - ridgeHalf, baseY + rise, cz];
  const RE = [cx + ridgeHalf, baseY + rise, cz];
  const positions = [];
  const uvs = [];
  const face = (a, bb, c) => {
    positions.push(...a, ...bb, ...c);
    uvs.push(a[0] * 0.21, a[2] * 0.21, bb[0] * 0.21, bb[2] * 0.21, c[0] * 0.21, c[2] * 0.21);
  };
  face(SW, SE, RE);
  face(SW, RE, RW);
  face(NE, NW, RW);
  face(NE, RW, RE);
  face(SE, NE, RE);
  face(NW, SW, RW);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.computeVertexNormals();
  b.geometry(roofKey, geometry);

  b.box('trim', width + overhang * 2 + 0.1, 0.18, 0.12, cx, baseY + 0.015, cz + hd);
  b.box('trim', width + overhang * 2 + 0.1, 0.18, 0.12, cx, baseY + 0.015, cz - hd);
  b.box('trim', 0.12, 0.18, depth + overhang * 2, cx - hw, baseY + 0.015, cz);
  b.box('trim', 0.12, 0.18, depth + overhang * 2, cx + hw, baseY + 0.015, cz);
  b.box(ridgeKey, ridgeHalf * 2 + 0.38, 0.2, 0.3, cx, baseY + rise + 0.11, cz);
}

export function makeSaggingAwningGeometry(width, depth, sag = 0.32, segmentsX = 12, segmentsZ = 7) {
  const positions = [];
  const uvs = [];
  const indices = [];
  for (let iz = 0; iz <= segmentsZ; iz++) {
    for (let ix = 0; ix <= segmentsX; ix++) {
      const u = ix / segmentsX;
      const v = iz / segmentsZ;
      const x = (u - 0.5) * width;
      const z = (v - 0.5) * depth;
      const edgeLift = 0.06 * (Math.cos(u * Math.PI) + Math.cos(v * Math.PI));
      const y = -sag * Math.sin(u * Math.PI) * Math.sin(v * Math.PI) + edgeLift;
      positions.push(x, y, z);
      uvs.push(u * 3, v * 2);
    }
  }
  for (let iz = 0; iz < segmentsZ; iz++) {
    for (let ix = 0; ix < segmentsX; ix++) {
      const a = iz * (segmentsX + 1) + ix;
      const b = a + 1;
      const c = a + segmentsX + 1;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function addRailingZ(b, z1, z2, yBase, x, gaps = []) {
  if (z2 <= z1) return;
  const ranges = [];
  let cursor = z1;
  for (const [ga, gb] of gaps.slice().sort((a, b) => a[0] - b[0])) {
    if (gb <= cursor) continue;
    if (ga > cursor) ranges.push([cursor, Math.min(ga, z2)]);
    cursor = Math.max(cursor, gb);
    if (cursor >= z2) break;
  }
  if (cursor < z2) ranges.push([cursor, z2]);
  for (const [start, end] of ranges) {
    const length = end - start;
    if (length < 0.14) continue;
    b.box('trim', 0.065, 0.055, length, x, yBase + 0.98, (start + end) / 2);
    b.box('trim', 0.05, 0.04, length, x, yBase + 0.12, (start + end) / 2);
    b.box('trim', 0.085, 1.04, 0.085, x, yBase + 0.52, start);
    b.box('trim', 0.085, 1.04, 0.085, x, yBase + 0.52, end);
    const count = Math.max(1, Math.round((length - 0.18) / 0.67));
    for (let i = 1; i < count; i++) {
      const z = start + (i / count) * length;
      b.box('trim', 0.025, 0.84, 0.025, x, yBase + 0.55, z);
    }
    if (length > 2.8) {
      const posts = Math.floor(length / 2.8);
      for (let i = 1; i <= posts; i++) {
        const z = start + (i / (posts + 1)) * length;
        b.box('trim', 0.055, 1.02, 0.055, x, yBase + 0.51, z);
      }
    }
  }
}

export function addSimplePorch(b, centerZ, width, depth, height, roofKey, ridgeKey) {
  const frontZ = centerZ + depth / 2;
  b.box('stoneLight', width + 0.25, 0.2, depth + 0.25, 0, 0.1, centerZ);
  b.floor(width + 0.25, depth + 0.25, 0, centerZ, 0.2);
  b.box('stoneLight', width + 0.7, 0.12, 0.55, 0, 0.06, frontZ + 0.45);
  b.box('stoneLight', width + 0.45, 0.12, 0.5, 0, 0.16, frontZ + 0.2);
  const columns = [-width / 2 + 0.35, width / 2 - 0.35];
  for (const x of columns) {
    b.cylinder('trim', 0.14, height - 0.2, x, height / 2, frontZ - 0.27);
    b.cylinder('creamDim', 0.22, 0.18, x, 0.13, frontZ - 0.27);
    b.solidCircle(0.22, x, frontZ - 0.27);
    b.box('trim', 0.38, 0.13, 0.38, x, height - 0.03, frontZ - 0.27);
  }
  b.box('trim', width + 0.45, 0.24, depth + 0.35, 0, height + 0.05, centerZ + 0.03);
  addHipRoof(b, 0, height + 0.17, centerZ + 0.03, width + 0.32, depth + 0.1, 0.88, 0.48, roofKey, ridgeKey);
}
