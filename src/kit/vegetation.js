/**
 * Trees, palms, potted plants and flower clusters.
 */

import * as THREE from 'three';
import { seededRandom, TAU } from '../core/math.js';
import { commitGeometry, UNIT } from '../geometry/batching.js';

const UP = new THREE.Vector3(0, 1, 0);

function addOrientedCone(b, key, bx, by, bz, dx, dy, dz, length, width, depthScale = 0.33) {
  const dir = new THREE.Vector3(dx, dy, dz).normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(UP, dir);
  const center = new THREE.Vector3(bx, by, bz).addScaledVector(dir, length / 2);
  const matrix = new THREE.Matrix4().compose(
    center,
    q,
    new THREE.Vector3(width, length, width * depthScale),
  );
  const world = new THREE.Matrix4().multiplyMatrices(b.base, matrix);
  commitGeometry(key, UNIT.cone, world);
}

export function addPalm(b, x, z, height = 5.0, spread = 2.4, trunkOffset = 0) {
  const rng = seededRandom(127 + Math.round(x * 17 + z * 31));
  const trunkHeight = height * (0.63 + rng() * 0.06);
  const leanX = (rng() - 0.5) * 0.55;
  const leanZ = (rng() - 0.5) * 0.55;
  b.cylinderBetween('trunkLight', x, trunkOffset, z, x + leanX, trunkOffset + trunkHeight, z + leanZ, 0.15);
  b.solidCircle(0.2, x, z);
  const topX = x + leanX;
  const topZ = z + leanZ;
  const topY = trunkOffset + trunkHeight;
  b.blob('leafDeep', 0.38, topX, topY, topZ, 1, 0.7, 1);
  const tiers = [
    { count: 8, tilt: -0.24, length: spread, width: 0.42, phase: 0.25 },
    { count: 7, tilt: -0.04, length: spread * 0.78, width: 0.35, phase: 0.7 },
  ];
  for (const tier of tiers) {
    for (let i = 0; i < tier.count; i++) {
      const angle = (i / tier.count) * TAU + tier.phase;
      const dirX = Math.cos(angle) * 0.86;
      const dirZ = Math.sin(angle) * 0.86;
      addOrientedCone(
        b, 'palmLeaf',
        topX + dirX * 0.12, topY + 0.06, topZ + dirZ * 0.12,
        dirX, tier.tilt, dirZ,
        tier.length * (0.86 + rng() * 0.2), tier.width, 0.18,
      );
    }
  }
}

export function addTree(b, x, z, height, radius, seed, options = {}) {
  const rng = seededRandom(seed);
  const trunkHeight = height * (options.large ? 0.42 : 0.38);
  const trunkRadius = options.large ? 0.62 : Math.max(0.22, radius * 0.075);
  b.cylinderBetween('trunk', x, 0, z, x + (rng() - 0.5) * 0.35, trunkHeight, z + (rng() - 0.5) * 0.35, trunkRadius);
  b.cylinder('trunkLight', trunkRadius * 0.84, trunkHeight * 0.36, x, 0.18, z);
  b.solidCircle(trunkRadius + 0.05, x, z);
  const crownY = height - radius * 0.42;
  const branches = options.large ? 6 : 3;
  for (let i = 0; i < branches; i++) {
    const angle = (i / branches) * TAU + rng() * 0.8;
    const bx = Math.cos(angle) * radius * (0.25 + rng() * 0.2);
    const bz = Math.sin(angle) * radius * (0.25 + rng() * 0.2);
    const by = crownY - radius * 0.2;
    b.cylinderBetween('trunk', x + (rng() - 0.5) * 0.2, trunkHeight * 0.72, z + (rng() - 0.5) * 0.2, x + bx, by, z + bz, trunkRadius * 0.34);
  }
  const palette = options.large
    ? ['leafDeep', 'leaf', 'leafLight']
    : ['leaf', 'leafLight', 'leafWarm'];
  // Cluster radii and offsets are normalised to the canopy radius.
  const blobs = options.large
    ? [
        [0, 0, 0, 0.46, 1.08, 0.88, 1.08],
        [-0.52, 0.08, 0.15, 0.34, 1.05, 0.9, 1.0],
        [0.5, 0.12, -0.12, 0.35, 1.02, 0.86, 1.04],
        [-0.25, 0.16, 0.48, 0.31, 1.05, 0.84, 0.98],
        [0.27, -0.04, -0.46, 0.33, 1.0, 0.8, 1.0],
        [-0.48, -0.12, -0.3, 0.28, 0.95, 0.78, 0.9],
        [0.48, -0.15, 0.27, 0.3, 1.0, 0.78, 0.92],
        [-0.05, 0.22, -0.36, 0.3, 0.98, 0.8, 0.9],
        [0.08, 0.06, 0.36, 0.3, 1.0, 0.82, 0.94],
      ]
    : [
        [0, 0, 0, 0.48, 1.05, 0.88, 1.05],
        [-0.48, 0.03, 0.16, 0.35, 1.0, 0.82, 0.94],
        [0.44, 0.08, -0.2, 0.36, 1.0, 0.82, 0.96],
        [0.12, 0.2, 0.42, 0.32, 0.95, 0.8, 0.9],
        [-0.12, 0.04, -0.42, 0.31, 0.92, 0.78, 0.9],
      ];
  for (let i = 0; i < blobs.length; i++) {
    const [ox, oy, oz, br, bx, by, bz] = blobs[i];
    const key = palette[(i + (seed % 2)) % palette.length];
    b.blob(
      key,
      br * radius,
      x + ox * radius,
      crownY + oy * radius,
      z + oz * radius,
      bx,
      by,
      bz,
      rng() * TAU,
    );
  }
  // A soft patch of low shrub keeps the trunk from looking isolated.
  for (let i = 0; i < 3; i++) {
    const a = rng() * TAU;
    const rr = radius * (0.22 + rng() * 0.2);
    b.blob('shrub', 0.4 + rng() * 0.28, x + Math.cos(a) * rr, 0.22, z + Math.sin(a) * rr, 1, 0.7, 1);
  }
}

export function addPottedPlant(b, x, z, scale = 1, kind = 'bonsai', seed = 3) {
  const rng = seededRandom(seed + Math.round(x * 11 + z * 3));
  const potRadius = (kind === 'palm' ? 0.34 : 0.28) * scale;
  b.cylinder('terracotta', potRadius, 0.5 * scale, x, 0.25 * scale, z);
  b.solidCircle(potRadius * 1.08, x, z);
  b.cylinder('terracotta', potRadius * 1.08, 0.08 * scale, x, 0.49 * scale, z);
  b.cylinder('mulch', potRadius * 0.86, 0.025 * scale, x, 0.54 * scale, z);
  if (kind === 'palm') {
    addPalmAt(b, x, z, 2.05 * scale + 0.35, 1.25 * scale, 0.55 * scale);
    return;
  }
  const lean = (rng() - 0.5) * 0.2;
  b.cylinderBetween('trunk', x, 0.5 * scale, z, x + lean, 1.3 * scale, z + (rng() - 0.5) * 0.18, 0.055 * scale);
  b.cylinderBetween('trunk', x + lean, 1.12 * scale, z, x + lean + 0.3 * scale, 1.48 * scale, z + 0.1 * scale, 0.035 * scale);
  b.blob('leafDeep', 0.42 * scale, x + lean + 0.23 * scale, 1.55 * scale, z + 0.1 * scale, 1.2, 0.72, 1.05);
  b.blob('leaf', 0.32 * scale, x + lean - 0.27 * scale, 1.38 * scale, z - 0.06 * scale, 1.0, 0.68, 0.9);
  b.blob('leafLight', 0.25 * scale, x + lean + 0.05 * scale, 1.75 * scale, z - 0.15 * scale, 0.9, 0.75, 0.85);
  for (let i = 0; i < 6; i++) {
    const a = rng() * TAU;
    const rr = 0.48 * scale;
    const flowerKey = ['flowerPink', 'flowerWhite', 'flowerYellow'][i % 3];
    b.sphere(flowerKey, 0.045 * scale, x + Math.cos(a) * rr, 0.53 * scale, z + Math.sin(a) * rr);
  }
}

export function addPalmAt(b, x, z, height, spread, trunkOffset) {
  // A small wrapper so palms in pots start above the rim.
  const rng = seededRandom(127 + Math.round(x * 17 + z * 31));
  const trunkHeight = height * 0.72;
  b.cylinderBetween('trunkLight', x, trunkOffset, z, x + (rng() - 0.5) * 0.1, trunkOffset + trunkHeight, z + (rng() - 0.5) * 0.1, 0.06);
  const topY = trunkOffset + trunkHeight;
  b.blob('leafDeep', 0.18, x, topY, z, 1, 0.8, 1);
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * TAU;
    addOrientedCone(b, 'palmLeaf', x, topY, z, Math.cos(angle) * 0.9, -0.14, Math.sin(angle) * 0.9, spread, 0.2, 0.17);
  }
}

export function addFlowerCluster(b, x, z, radius, seed = 1) {
  const rng = seededRandom(seed * 89 + Math.round(x * 13));
  const colors = ['flowerPink', 'flowerWhite', 'flowerYellow', 'flowerRed'];
  for (let i = 0; i < 18; i++) {
    const a = rng() * TAU;
    const r = Math.sqrt(rng()) * radius;
    b.sphere(colors[i % colors.length], 0.1 + rng() * 0.06, x + Math.cos(a) * r, 0.14 + rng() * 0.22, z + Math.sin(a) * r, 1, 0.8, 1);
  }
}
