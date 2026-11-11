/**
 * Memorial bust of Huỳnh Thúc Kháng (the school's namesake) and its flower bed: a pale stone
 * bust in khăn đóng, round glasses and áo dài on a granite pedestal with a red plaque.
 */

import * as THREE from 'three';
import { HALF_PI, seededRandom, TAU } from '../core/math.js';
import { Builder, siteBuilder, UNIT } from '../geometry/batching.js';
import { addFlowerCluster } from '../kit/vegetation.js';

const BX = 10;
const BZ = -13;

export function buildMemorialBust() {
  const b = siteBuilder;
  const bx = BX;
  const bz = BZ;

  // Circular garden bed, stone edging and flowers.
  b.geometry('mulch', UNIT.circle, bx, 0.055, bz, -HALF_PI, 0, 0, 2.05, 2.05, 1);
  b.geometry('stoneLight', UNIT.ring, bx, 0.1, bz, -HALF_PI, 0, 0, 2.1, 2.1, 1.5);
  b.solidCircle(2.2, bx, bz);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * TAU;
    const r = 1.38 + (i % 3) * 0.18;
    b.blob(i % 2 ? 'shrub' : 'shrubLight', 0.36 + (i % 3) * 0.07, bx + Math.cos(a) * r, 0.35, bz + Math.sin(a) * r, 1.2, 0.75, 1.1);
    if (i % 2 === 0) addFlowerCluster(b, bx + Math.cos(a) * r, bz + Math.sin(a) * r, 0.34, 31 + i);
  }
  addFlowerCluster(b, bx - 0.9, bz + 1.04, 0.42, 66);
  addFlowerCluster(b, bx + 0.8, bz - 1.1, 0.4, 67);

  // Everything below is in the memorial's own frame: origin at the bed centre, facing +Z.
  const m = new Builder(BX, BZ);
  addBlossomShrub(m, -1.2, 0.1, 71);
  addBlossomShrub(m, 1.2, 0.1, 72);
  const pedestalTop = addPedestal(m);
  addOfferings(m, pedestalTop);
  addBust(m, pedestalTop + 0.27);
}

/** Tall shrub dotted with small white blossoms, one on each side of the pedestal. */
function addBlossomShrub(m, x, z, seed) {
  const rng = seededRandom(seed);
  const side = Math.sign(x);
  const clumps = [
    ['shrub', 0.52, x, 0.5, z, 1, 1, 0.95],
    ['shrubLight', 0.38, x - side * 0.1, 0.88, z + 0.12, 1, 0.95, 1],
    ['shrub', 0.36, x + side * 0.28, 0.74, z - 0.18, 1, 0.9, 1],
  ];
  for (const [key, r, cx, cy, cz, sx, sy, sz] of clumps) {
    m.blob(key, r, cx, cy, cz, sx, sy, sz, rng() * TAU);
    for (let i = 0; i < 16; i++) {
      const a = rng() * TAU;
      const up = 0.1 + rng() * 0.85;
      const flat = Math.sqrt(1 - up * up);
      m.sphere(
        'flowerWhite', 0.016 + rng() * 0.009,
        cx + Math.cos(a) * flat * r * sx * 0.95, cy + up * r * sy * 0.95, cz + Math.sin(a) * flat * r * sz * 0.95,
      );
    }
  }
}

/** Granite pedestal with the plaque on its front. Returns the height of its top face. */
function addPedestal(m) {
  const top = 1.56;
  m.box('stoneBase', 1.3, 0.17, 1.3, 0, 0.115, 0);
  m.box('granite', 0.92, top - 0.2, 0.92, 0, (top + 0.2) / 2, 0);
  m.plane('signPlaque', 0.57, 0.876, 0, 0.945, 0.468);
  // Grey riser and the dark slab the bust is cut from.
  m.box('graniteGrey', 0.4, 0.22, 0.34, 0, top + 0.11, 0);
  m.box('bustDark', 0.66, 0.05, 0.36, 0, top + 0.245, 0);
  return top;
}

/** Flowers laid at the foot of the bust and a small white pot, as on the real pedestal. */
function addOfferings(m, y) {
  const rng = seededRandom(97);
  const fx = -0.27;
  const fz = 0.3;
  m.blob('leafDeep', 0.13, fx, y + 0.04, fz, 1.3, 0.42, 0.95, 0.4);
  const colors = ['flowerRed', 'flowerPink', 'flowerWhite', 'flowerRed', 'flowerPink'];
  for (let i = 0; i < 10; i++) {
    const a = rng() * TAU;
    const r = Math.sqrt(rng()) * 0.11;
    m.sphere(colors[i % colors.length], 0.032 + rng() * 0.016, fx + Math.cos(a) * r * 1.3, y + 0.07 + rng() * 0.05, fz + Math.sin(a) * r, 1, 0.85, 1);
  }
  const px = 0.31;
  const pz = 0.27;
  m.cylinder('trim', 0.058, 0.09, px, y + 0.045, pz);
  m.cylinder('trim', 0.066, 0.016, px, y + 0.09, pz);
  m.blob('leaf', 0.06, px - 0.015, y + 0.15, pz, 0.9, 1.25, 0.9);
  m.blob('leafWarm', 0.045, px + 0.03, y + 0.13, pz + 0.02, 1, 1.1, 1, 0.9);
}

/**
 * The bust itself, about 1.6× life size. `y0` is the height it stands on; x/z are in the
 * memorial frame, the face looks along +Z.
 */
function addBust(m, y0) {
  const sphere = new THREE.SphereGeometry(1, 20, 14);
  const drum = new THREE.CylinderGeometry(1, 1, 1, 24);
  const collar = new THREE.CylinderGeometry(0.94, 1, 1, 18);
  const rim = new THREE.TorusGeometry(1, 0.11, 6, 20);
  const stripe = new THREE.TorusGeometry(1, 0.02, 5, 32);

  const stone = (geometry, x, y, z, sx, sy, sz, ry = 0) =>
    m.geometry('bustStone', geometry, x, y0 + y, z, 0, ry, 0, sx, sy, sz);

  // Chest: a flat-cut block, wide at the shoulders and narrowing towards the base.
  const outline = new THREE.Shape();
  outline.moveTo(-0.29, 0.02);
  outline.lineTo(0.29, 0.02);
  outline.lineTo(0.365, 0.3);
  outline.lineTo(0.12, 0.335);
  outline.lineTo(-0.12, 0.335);
  outline.lineTo(-0.365, 0.3);
  outline.closePath();
  const chest = new THREE.ExtrudeGeometry(outline, {
    depth: 0.28, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2,
  });
  chest.translate(0, 0, -0.14);
  stone(chest, 0, 0, 0, 1, 1, 1);

  // Áo dài: standing collar, and the flap buttoned from the collar towards his right shoulder.
  const chestFront = 0.166;
  stone(collar, 0, 0.385, -0.005, 0.122, 0.12, 0.112);
  m.box('bustDark', 0.01, 0.1, 0.012, 0, y0 + 0.392, 0.103);
  const flap = [[0, 0.3], [-0.16, 0.255], [-0.3, 0.15]];
  for (let i = 0; i < flap.length - 1; i++) {
    m.cylinderBetween('bustStone', flap[i][0], y0 + flap[i][1], chestFront, flap[i + 1][0], y0 + flap[i + 1][1], chestFront, 0.004);
  }
  for (const [x, y] of [[0, 0.3], [-0.16, 0.255], [-0.28, 0.165]]) {
    stone(sphere, x, y, chestFront + 0.001, 0.014, 0.014, 0.008);
  }

  // Head: skull, jaw, brow, nose, lips, ears.
  stone(UNIT.cylinderFine, 0, 0.47, -0.005, 0.088, 0.1, 0.088);
  stone(sphere, 0, 0.64, 0, 0.15, 0.2, 0.17);
  stone(sphere, 0, 0.532, 0.034, 0.118, 0.092, 0.122);
  stone(sphere, 0, 0.694, 0.128, 0.122, 0.022, 0.05);
  stone(sphere, 0, 0.612, 0.158, 0.021, 0.058, 0.032);
  stone(sphere, 0, 0.574, 0.164, 0.036, 0.02, 0.028);
  stone(sphere, 0, 0.512, 0.146, 0.046, 0.011, 0.016);
  for (const side of [-1, 1]) {
    stone(sphere, side * 0.15, 0.6, 0.005, 0.02, 0.05, 0.032);
    // Eye behind a round spectacle rim, with the temple running back to the ear.
    stone(sphere, side * 0.058, 0.648, 0.15, 0.024, 0.012, 0.012);
    stone(rim, side * 0.058, 0.648, 0.17, 0.04, 0.04, 0.04, side * 0.22);
    m.cylinderBetween('bustStone', side * 0.097, y0 + 0.652, 0.161, side * 0.157, y0 + 0.655, 0.02, 0.0045);
  }
  m.box('bustStone', 0.04, 0.007, 0.007, 0, y0 + 0.655, 0.18);

  // Khăn đóng, worn tipped back: high over the forehead, low at the nape. `u` runs up the
  // turban's own (tilted) axis from the bottom of its band.
  const tilt = -0.3;
  const turban = (key, geometry, u, radius, height, rx = tilt) =>
    m.geometry(
      key, geometry,
      0, y0 + 0.675 + u * Math.cos(tilt), -0.02 + u * Math.sin(tilt),
      rx, 0, 0, radius, height, radius,
    );
  turban('bustDark', drum, 0.045, 0.2, 0.09);
  for (const u of [0.0225, 0.045, 0.0675]) {
    // The torus lies in its XY plane: lay it flat, then tilt it with the band.
    m.geometry(
      'bustStone', stripe,
      0, y0 + 0.675 + u * Math.cos(tilt), -0.02 + u * Math.sin(tilt),
      HALF_PI + tilt, 0, 0, 0.2005, 0.2005, 0.2005,
    );
  }
  turban('bustStone', drum, 0.12, 0.212, 0.06);
  turban('bustStone', sphere, 0.15, 0.212, 0.14);

  for (const geometry of [sphere, drum, collar, rim, stripe, chest]) geometry.dispose();
}
