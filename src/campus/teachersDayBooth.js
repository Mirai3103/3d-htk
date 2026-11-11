/**
 * Teachers' Day (20 November) check-in corner in front of the great shade tree: a painted
 * backdrop under a balloon garland, marquee "20 ♥ 11" numbers, congratulation flower stands,
 * a wall of wishes, a souvenir table, a photo frame to pose behind, and bunting strung from
 * the trunk. Everything is static and batched except the two bunches of helium balloons and
 * the album on the souvenir table (campus/album.js).
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { scene } from '../core/engine.js';
import { seededRandom, TAU } from '../core/math.js';
import { Builder, UNIT } from '../geometry/batching.js';
import { MATS } from '../materials/registry.js';
import { lampLights, makeLampGlow } from '../scene/lights.js';
import { festiveUV, propRegionUV } from '../textures/festive.js';
import { addStudent } from '../kit/furniture.js';
import { buildAlbum } from './album.js';

// Booth origin (world): the middle of the carpet. Local +Z faces the main gate.
const BX = -12;
const BZ = 6.9;
// Where the bunting is tied to the great tree's trunk (campus/courtyardLife.js), booth-local.
const TRUNK_TIE = [0, 4.95, 0.42 - BZ];

const CARPET = 0.05;
const BACK_Z = -1.5;
const BACK_W = 5.4;
const BACK_H = 3.2;

const bunches = [];

// ---- Palette helpers -----------------------------------------------------------------------
// 'festGloss' / 'festMatte' read their colour from a swatch texture, so a prop is coloured by
// parking all of its UVs on one swatch.

function colorize(geometry, color) {
  const [u, v] = festiveUV(color);
  const count = geometry.getAttribute('position').count;
  const uv = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    uv[i * 2] = u;
    uv[i * 2 + 1] = v;
  }
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return geometry;
}

const tintCache = new Map();

/** A shared copy of a unit geometry in the given palette colour. */
function tint(unit, color) {
  const cacheKey = `${unit.uuid}:${color}`;
  let tinted = tintCache.get(cacheKey);
  if (!tinted) {
    tinted = colorize(unit.clone(), color);
    tintCache.set(cacheKey, tinted);
  }
  return tinted;
}

function matteBox(b, color, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
  b.geometry('festMatte', tint(UNIT.box, color), x, y, z, rx, ry, rz, w, h, d);
}

function matteBall(b, color, r, x, y, z, sx = 1, sy = 1, sz = 1) {
  b.geometry('festMatte', tint(UNIT.blob, color), x, y, z, 0, 0, 0, r * sx, r * sy, r * sz);
}

function matteRod(b, color, radius, height, x, y, z, rx = 0, ry = 0, rz = 0) {
  b.geometry('festMatte', tint(UNIT.cylinder, color), x, y, z, rx, ry, rz, radius, height, radius);
}

function balloon(b, color, r, x, y, z) {
  b.geometry('festGloss', tint(UNIT.sphere, color), x, y, z, 0, 0, 0, r, r * 1.14, r);
}

/** A unit plane showing one region of the props atlas ('signEventProps'). */
function propPlane(region) {
  const [u0, v0, u1, v1] = propRegionUV(region);
  const geometry = UNIT.plane.clone();
  const uv = geometry.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, u0 + uv.getX(i) * (u1 - u0), v0 + uv.getY(i) * (v1 - v0));
  }
  return geometry;
}

/** Builder for a prop standing at booth-local (x, z), turned by yaw. */
function at(x, z, yaw = 0) {
  return new Builder(BX + x, BZ + z, yaw);
}

/** Points of a string hanging between two [x, y, z] ends, `sag` metres low in the middle. */
function hangingLine(from, to, sag, steps) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push([
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t - sag * 4 * t * (1 - t),
      from[2] + (to[2] - from[2]) * t,
    ]);
  }
  return points;
}

function strand(b, key, points, radius) {
  for (let i = 1; i < points.length; i++) {
    b.cylinderBetween(key, ...points[i - 1], ...points[i], radius);
  }
}

// ---- Carpet and backdrop -------------------------------------------------------------------

function addCarpet(b) {
  b.box('stageRed', 6.8, CARPET, 3.3, 0, CARPET / 2, -0.15);
  const edge = CARPET + 0.012;
  for (const z of [-1.8, 1.5]) b.box('gold', 6.86, edge, 0.07, 0, edge / 2, z);
  for (const x of [-3.4, 3.4]) b.box('gold', 0.07, edge, 3.3, x, edge / 2, -0.15);

  // Runner towards the gate, between rope stanchions.
  b.box('stageRed', 1.9, 0.03, 2.75, 0, 0.015, 2.87);
  for (const x of [-0.95, 0.95]) b.box('gold', 0.06, 0.036, 2.75, x, 0.018, 2.87);
  for (const x of [-1.2, 1.2]) {
    for (const z of [1.95, 4.05]) {
      b.cylinder('brass', 0.17, 0.035, x, 0.018, z);
      b.cylinder('brass', 0.028, 0.92, x, 0.48, z);
      b.sphere('brass', 0.055, x, 0.97, z);
      b.solidCircle(0.12, x, z);
    }
    strand(b, 'red', hangingLine([x, 0.88, 1.95], [x, 0.88, 4.05], 0.2, 8), 0.022);
    b.solidBox(0.08, 2.1, x, 3.0);
  }
}

function addBackdrop(b) {
  const midY = CARPET + BACK_H / 2;
  b.box('trim', BACK_W, BACK_H, 0.1, 0, midY, BACK_Z);
  b.plane('signTeachersDay', BACK_W - 0.16, BACK_H - 0.16, 0, midY, BACK_Z + 0.056);
  b.box('gold', BACK_W + 0.16, 0.08, 0.16, 0, CARPET + BACK_H + 0.04, BACK_Z);
  for (const x of [-1, 1]) {
    b.box('gold', 0.08, BACK_H, 0.16, x * (BACK_W / 2 + 0.04), midY, BACK_Z);
    // Stage-flat bracing behind, weighted at the foot.
    b.cylinderBetween('metalDark', x * 1.9, 2.5, BACK_Z - 0.06, x * 1.9, 0.06, BACK_Z - 1.1, 0.03);
    b.box('stoneBase', 0.5, 0.12, 0.3, x * 1.9, 0.06, BACK_Z - 1.1);
  }
  for (const y of [0.6, 1.7, 2.8]) b.box('wood', BACK_W - 0.1, 0.07, 0.04, 0, CARPET + y, BACK_Z - 0.07);
  b.solidBox(BACK_W + 0.2, 0.3, 0, BACK_Z);
  b.solidBox(4.4, 1.0, 0, BACK_Z - 0.65);
}

/** An organic garland climbing the left edge and running along the top, thinning out. */
function addBalloonGarland(b) {
  const rng = seededRandom(2011);
  const colors = ['red', 'pink', 'blush', 'gold', 'cream', 'red', 'pink', 'cream', 'crimson', 'gold', 'blush'];
  const pick = () => colors[Math.floor(rng() * colors.length)];
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-2.95, 0.34, BACK_Z + 0.18),
    new THREE.Vector3(-3.03, 1.7, BACK_Z + 0.15),
    new THREE.Vector3(-2.93, 3.0, BACK_Z + 0.1),
    new THREE.Vector3(-2.3, 3.62, BACK_Z + 0.04),
    new THREE.Vector3(-0.6, 3.68, BACK_Z),
    new THREE.Vector3(1.1, 3.58, BACK_Z),
    new THREE.Vector3(2.55, 3.5, BACK_Z),
  ]);
  const stations = 38;
  for (let i = 0; i <= stations; i++) {
    const t = i / stations;
    const p = path.getPointAt(t);
    const girth = 1 - 0.5 * Math.pow(t, 1.6);
    const spread = 0.27 * girth;
    for (let k = 0; k < 3; k++) {
      balloon(
        b, pick(), (0.15 + rng() * 0.13) * girth,
        p.x + (rng() - 0.5) * 2 * spread, p.y + (rng() - 0.5) * 2 * spread, p.z + (rng() - 0.5) * 1.5 * spread,
      );
    }
    if (i % 3 === 0) {
      balloon(b, i % 2 ? 'gold' : 'white', 0.085 * girth, p.x + (rng() - 0.5) * spread, p.y + (rng() - 0.5) * spread, p.z + 0.3 * girth);
    }
  }
  // A small answering cluster at the foot of the right edge.
  for (let i = 0; i < 9; i++) {
    balloon(b, pick(), 0.14 + rng() * 0.11, 2.95 + (rng() - 0.5) * 0.5, 0.3 + rng() * 0.85, BACK_Z + 0.2 + (rng() - 0.5) * 0.3);
  }
}

// ---- Marquee numbers -----------------------------------------------------------------------

const DIGIT_H = 1.12;
const DIGIT_W = 0.72;
const STROKE = 0.2;
const DIGIT_DEPTH = 0.24;

function extrude(shapes, depth = DIGIT_DEPTH) {
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.016, bevelSegments: 1, curveSegments: 20,
  });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

/** Outline of a stroke of the given width along a finely sampled centre line. */
function strokeShape(line, width) {
  const half = width / 2;
  const left = [];
  const right = [];
  for (let i = 0; i < line.length; i++) {
    const prev = line[Math.max(i - 1, 0)];
    const next = line[Math.min(i + 1, line.length - 1)];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const length = Math.hypot(dx, dy);
    left.push([line[i][0] - (dy / length) * half, line[i][1] + (dx / length) * half]);
    right.push([line[i][0] + (dy / length) * half, line[i][1] - (dx / length) * half]);
  }
  const outline = [...left, ...right.reverse()];
  const shape = new THREE.Shape();
  shape.moveTo(...outline[0]);
  for (let i = 1; i < outline.length; i++) shape.lineTo(...outline[i]);
  shape.closePath();
  return shape;
}

/** Evenly spaced points along a polyline (where the bulbs go). */
function resample(line, spacing) {
  const points = [line[0]];
  let carried = 0;
  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1];
    const [bx, by] = line[i];
    const length = Math.hypot(bx - ax, by - ay);
    let along = spacing - carried;
    while (along <= length) {
      points.push([ax + ((bx - ax) * along) / length, ay + ((by - ay) * along) / length]);
      along += spacing;
    }
    carried = length - (along - spacing);
  }
  return points;
}

function glyphTwo() {
  const radius = DIGIT_W / 2 - STROKE / 2;
  const cx = DIGIT_W / 2;
  const cy = DIGIT_H - STROKE / 2 - radius;
  const hook = [];
  for (let degrees = 165; degrees >= -42; degrees -= 9) {
    const a = (degrees * Math.PI) / 180;
    hook.push([cx + Math.cos(a) * radius, cy + Math.sin(a) * radius]);
  }
  hook.push([STROKE * 0.62, STROKE * 0.55]);
  const foot = new THREE.Shape();
  foot.moveTo(0, 0);
  foot.lineTo(DIGIT_W, 0);
  foot.lineTo(DIGIT_W, STROKE);
  foot.lineTo(0, STROKE);
  foot.closePath();
  return {
    width: DIGIT_W,
    geometry: extrude([strokeShape(hook, STROKE), foot]),
    bulbs: resample([...hook, [DIGIT_W - 0.1, STROKE / 2]], 0.15),
  };
}

function glyphZero() {
  const cx = DIGIT_W / 2;
  const cy = DIGIT_H / 2;
  const shape = new THREE.Shape().absellipse(cx, cy, DIGIT_W / 2, DIGIT_H / 2, 0, TAU, false, 0);
  shape.holes.push(new THREE.Path().absellipse(cx, cy, DIGIT_W / 2 - STROKE, DIGIT_H / 2 - STROKE, 0, TAU, true, 0));
  const bulbs = [];
  const count = 16;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    bulbs.push([cx + Math.cos(a) * (DIGIT_W / 2 - STROKE / 2), cy + Math.sin(a) * (DIGIT_H / 2 - STROKE / 2)]);
  }
  return { width: DIGIT_W, geometry: extrude(shape), bulbs };
}

function glyphOne() {
  const shape = new THREE.Shape();
  shape.moveTo(0.22, 0);
  shape.lineTo(0.42, 0);
  shape.lineTo(0.42, DIGIT_H);
  shape.lineTo(0.25, DIGIT_H);
  shape.lineTo(0, DIGIT_H - 0.27);
  shape.lineTo(0, DIGIT_H - 0.5);
  shape.lineTo(0.22, DIGIT_H - 0.262);
  shape.closePath();
  return {
    width: 0.42,
    geometry: extrude(shape),
    bulbs: [...resample([[0.32, 0.1], [0.32, DIGIT_H - 0.09]], 0.155), [0.11, DIGIT_H - 0.3]],
  };
}

function heartShape(size) {
  const s = size;
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.5 * s);
  shape.bezierCurveTo(-0.55 * s, -0.1 * s, -0.6 * s, 0.35 * s, -0.28 * s, 0.45 * s);
  shape.bezierCurveTo(-0.1 * s, 0.5 * s, 0, 0.38 * s, 0, 0.25 * s);
  shape.bezierCurveTo(0, 0.38 * s, 0.1 * s, 0.5 * s, 0.28 * s, 0.45 * s);
  shape.bezierCurveTo(0.6 * s, 0.35 * s, 0.55 * s, -0.1 * s, 0, -0.5 * s);
  return shape;
}

function addMarqueeNumbers(b) {
  const z = 0.45;
  const y0 = CARPET + 0.12;
  b.box('trim', 3.9, 0.12, 0.52, 0, CARPET + 0.06, z);
  b.solidBox(3.9, 0.52, 0, z);

  const heart = { width: 0.6, heart: true };
  const row = [glyphTwo(), glyphZero(), heart, glyphOne(), glyphOne()];
  const gaps = [0.1, 0.16, 0.16, 0.1];
  let x = -(row.reduce((sum, glyph) => sum + glyph.width, 0) + gaps.reduce((sum, gap) => sum + gap, 0)) / 2;
  row.forEach((glyph, i) => {
    if (glyph.heart) {
      const geometry = colorize(extrude(heartShape(0.66), 0.18), 'gold');
      b.geometry('festGloss', geometry, x + glyph.width / 2, y0 + 0.6, z);
    } else {
      b.geometry('festGloss', colorize(glyph.geometry, 'red'), x, y0, z);
      for (const [bx, by] of glyph.bulbs) {
        b.geometry('fairyBulb', UNIT.blobLow, x + bx, y0 + by, z + DIGIT_DEPTH / 2 + 0.03, 0, 0, 0, 0.036, 0.036, 0.036);
      }
    }
    x += glyph.width + (gaps[i] ?? 0);
  });
}

// ---- Poles, bunting, fairy lights ----------------------------------------------------------

function addPole(b, x, z, height) {
  b.cylinder('stoneBase', 0.2, 0.1, x, 0.05, z);
  matteRod(b, 'white', 0.035, height, x, height / 2, z);
  for (let y = 0.5; y < height - 0.2; y += 0.62) matteRod(b, 'red', 0.039, 0.16, x, y, z);
  b.sphere('gold', 0.075, x, height + 0.05, z);
  b.solidCircle(0.14, x, z);
}

function addBunting(b, from, to, sag, seed) {
  const colors = ['red', 'yellow', 'teal', 'pink', 'cream', 'sky', 'orange'];
  const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const points = hangingLine(from, to, sag, Math.round(length / 0.42));
  strand(b, 'trim', points, 0.008);
  // Pennants hang in the vertical plane of the string.
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const flat = Math.hypot(dx, dz);
  const hx = (dx / flat) * 0.15;
  const hz = (dz / flat) * 0.15;
  for (let i = 1; i < points.length; i++) {
    const mx = (points[i - 1][0] + points[i][0]) / 2;
    const my = (points[i - 1][1] + points[i][1]) / 2 - 0.006;
    const mz = (points[i - 1][2] + points[i][2]) / 2;
    const flag = new THREE.BufferGeometry();
    flag.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
      mx - hx, my, mz - hz,
      mx + hx, my, mz + hz,
      mx, my - 0.36, mz,
    ]), 3));
    flag.computeVertexNormals();
    b.geometry('festMatte', colorize(flag, colors[(i + seed) % colors.length]));
  }
}

function addFairyLights(b, from, to, sag) {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const points = hangingLine(from, to, sag, Math.round(length / 0.3));
  strand(b, 'metalDark', points, 0.007);
  for (let i = 1; i < points.length - 1; i++) {
    const [x, y, z] = points[i];
    b.geometry('fairyBulb', UNIT.blobLow, x, y - 0.04, z, 0, 0, 0, 0.045, 0.055, 0.045);
  }
}

function addLantern(b, x, y, z) {
  b.cylinder('metalDark', 0.006, 0.2, x, y + 0.27, z);
  b.geometry('lantern', UNIT.sphere, x, y, z, 0, 0, 0, 0.2, 0.17, 0.2);
  for (const side of [-1, 1]) b.cylinder('gold', 0.08, 0.04, x, y + side * 0.165, z);
  matteRod(b, 'gold', 0.014, 0.22, x, y - 0.3, z);
  matteRod(b, 'red', 0.022, 0.05, x, y - 0.2, z);
  makeLampGlow(new THREE.Vector3(BX + x, y, BZ + z)).scale.set(1.9, 1.9, 1);
}

function addPolesAndStrings(b) {
  const frontHeight = 3.6;
  const sideHeight = 3.4;
  for (const side of [-1, 1]) {
    const front = [side * 4.9, frontHeight, 3.4];
    const outer = [side * 5.6, sideHeight, -1.6];
    addPole(b, front[0], front[2], frontHeight);
    addPole(b, outer[0], outer[2], sideHeight);
    addBunting(b, TRUNK_TIE, front, 0.4, side > 0 ? 3 : 0);
    addBunting(b, TRUNK_TIE, outer, 0.35, side > 0 ? 5 : 2);
    addFairyLights(b, front, [side * (BACK_W / 2 + 0.06), CARPET + BACK_H + 0.1, BACK_Z], 0.32);
    // A silk lantern on a short arm reaching over the carpet.
    b.box('gold', 0.42, 0.03, 0.03, front[0] - side * 0.2, frontHeight - 0.12, front[2]);
    addLantern(b, front[0] - side * 0.38, frontHeight - 0.5, front[2]);
  }
}

// ---- Flower stands, pots -------------------------------------------------------------------

/** A "kệ hoa chúc mừng": two bouquets on a tripod, with a pair of red ribbons. */
function addFlowerStand(x, z, yaw, seed, colors) {
  const s = at(x, z, yaw);
  const rng = seededRandom(seed);
  s.cylinderBetween('wood', -0.34, 0, 0.16, -0.05, 1.72, -0.06, 0.018);
  s.cylinderBetween('wood', 0.34, 0, 0.16, 0.05, 1.72, -0.06, 0.018);
  s.cylinderBetween('wood', 0, 0, -0.5, 0, 1.68, -0.06, 0.018);
  s.solidCircle(0.4, 0, 0);
  for (const [cy, cz, radius, count] of [[1.0, 0.16, 0.44, 30], [1.64, 0.05, 0.3, 17]]) {
    s.blob('leafDeep', radius, 0, cy, cz - 0.06, 1.04, 1.04, 0.36);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU + rng();
      s.blob('leaf', radius * 0.32, Math.cos(a) * radius * 0.98, cy + Math.sin(a) * radius * 0.98, cz - 0.02, 1.2, 1.2, 0.5, a);
    }
    for (let i = 0; i < count; i++) {
      // Sunflower-seed spiral over a shallow dome that faces the visitor.
      const rr = Math.sqrt((i + 0.5) / count) * radius * 0.92;
      const a = i * 2.39996;
      const dome = Math.sqrt(Math.max(0, 1 - (rr / radius) ** 2)) * radius * 0.42;
      matteBall(s, colors[Math.floor(rng() * colors.length)], 0.078 + rng() * 0.04, Math.cos(a) * rr, cy + Math.sin(a) * rr, cz + 0.05 + dome);
    }
  }
  for (const side of [-1, 1]) {
    matteBox(s, 'red', 0.1, 0.7, 0.012, side * 0.15, 0.5, 0.3, 0, 0, side * -0.13);
    matteBox(s, 'gold', 0.1, 0.05, 0.014, side * 0.19, 0.2, 0.3, 0, 0, side * -0.13);
  }
}

function addMumPot(b, x, z, color, seed) {
  const rng = seededRandom(seed);
  b.cylinder('terracotta', 0.17, 0.24, x, 0.12, z);
  b.cylinder('terracotta', 0.19, 0.04, x, 0.24, z);
  b.blob('leaf', 0.26, x, 0.33, z, 1, 0.62, 1);
  for (let i = 0; i < 13; i++) {
    const rr = Math.sqrt((i + 0.5) / 13) * 0.22;
    const a = i * 2.39996 + rng();
    matteBall(b, color, 0.058 + rng() * 0.016, x + Math.cos(a) * rr, 0.43 + (1 - (rr / 0.22) ** 2) * 0.09, z + Math.sin(a) * rr);
  }
  b.solidCircle(0.2, x, z);
}

// ---- Wish board, souvenir table, photo frame ---------------------------------------------

function addWishBoard(x, z, yaw) {
  const e = at(x, z, yaw);
  e.cylinderBetween('wood', -0.62, 0, 0.14, -0.5, 2.0, -0.1, 0.028);
  e.cylinderBetween('wood', 0.62, 0, 0.14, 0.5, 2.0, -0.1, 0.028);
  e.cylinderBetween('wood', 0, 0, -0.75, 0, 1.9, -0.1, 0.028);
  e.box('wood', 1.2, 0.05, 0.05, 0, 1.93, -0.1);
  e.solidBox(1.75, 0.95, 0, -0.3);

  // The board leans back with the easel.
  const board = at(x, z, yaw);
  board.base
    .multiply(new THREE.Matrix4().makeTranslation(0, 1.3, 0.05))
    .multiply(new THREE.Matrix4().makeRotationX(-0.12));
  board.box('wood', 1.74, 1.14, 0.05, 0, 0, 0);
  board.geometry('signEventProps', propPlane('wishBoard'), 0, 0, 0.03, 0, 0, 0, 1.62, 1.0125, 1);
  board.box('wood', 1.5, 0.04, 0.1, 0, -0.59, 0.05);
  // A ribbon bow pinned to one corner of the frame.
  for (const side of [-1, 1]) {
    matteBall(board, 'red', 0.085, -0.74 + side * 0.085, 0.57, 0.04, 1.15, 0.7, 0.35);
    matteBox(board, 'red', 0.05, 0.2, 0.012, -0.74 + side * 0.045, 0.44, 0.035, 0, 0, side * 0.3);
  }
  matteBall(board, 'gold', 0.04, -0.74, 0.57, 0.055);
}

function addGift(b, color, ribbon, w, h, d, x, y, z, ry = 0) {
  matteBox(b, color, w, h, d, x, y + h / 2, z, 0, ry, 0);
  matteBox(b, ribbon, w * 0.18, h + 0.008, d + 0.008, x, y + h / 2, z, 0, ry, 0);
  matteBox(b, ribbon, w + 0.008, h + 0.008, d * 0.18, x, y + h / 2, z, 0, ry, 0);
  for (const side of [-1, 1]) {
    matteBall(b, ribbon, w * 0.15, x + side * w * 0.13 * Math.cos(ry), y + h + w * 0.05, z - side * w * 0.13 * Math.sin(ry), 1.3, 0.75, 0.8);
  }
}

function addSouvenirTable(x, z, yaw) {
  const t = at(x, z, yaw);
  const top = 0.76;
  matteBox(t, 'white', 1.7, top, 0.76, 0, top / 2, 0);
  t.box('gold', 1.72, 0.025, 0.78, 0, top - 0.02, 0);
  t.geometry('signEventProps', propPlane('souvenir'), 0, 0.38, 0.385, 0, 0, 0, 0.92, 0.46, 1);
  t.solidBox(1.7, 0.76, 0, 0);

  // The souvenir album: closed until someone opens it. Its spine lies here; the open book
  // spreads a page width to either side.
  const [albumX, albumZ] = t._worldXZ(-0.42, 0.04);
  buildAlbum({ x: albumX, y: top, z: albumZ, yaw });

  // A greeting card on a little stand, a vase of flowers and a weight for the balloons.
  t.box('wood', 0.42, 0.24, 0.02, 0.2, top + 0.115, -0.2, -0.22);
  t.geometry('signEventProps', propPlane('card'), 0.2, top + 0.117, -0.187, -0.22, 0, 0, 0.39, 0.195, 1);
  t.cylinder('ceramicBlue', 0.07, 0.24, 0.56, top + 0.12, -0.12);
  t.blob('leaf', 0.13, 0.56, top + 0.3, -0.12, 1, 0.8, 1);
  const rng = seededRandom(2026);
  const blooms = ['yellow', 'pink', 'white', 'red', 'orange', 'pink', 'yellow', 'lilac'];
  blooms.forEach((color, i) => {
    const a = (i / blooms.length) * TAU;
    const rr = 0.05 + rng() * 0.08;
    matteBall(t, color, 0.05 + rng() * 0.015, 0.56 + Math.cos(a) * rr, top + 0.36 + rng() * 0.1, -0.12 + Math.sin(a) * rr);
  });
  matteBox(t, 'gold', 0.09, 0.07, 0.09, 0.78, top + 0.035, 0.24);

  // Presents stacked beside the table.
  addGift(t, 'red', 'gold', 0.44, 0.4, 0.44, 1.2, 0, 0.12, 0.2);
  addGift(t, 'teal', 'cream', 0.28, 0.24, 0.28, 1.2, 0.4, 0.12, -0.35);
  addGift(t, 'pink', 'white', 0.32, 0.26, 0.3, 1.26, 0, 0.62, -0.25);
  t.solidCircle(0.42, 1.22, 0.3);
}

/** A stand-behind photo frame: header, open window, caption strip. */
function addPhotoFrame(x, z, yaw) {
  const f = at(x, z, yaw);
  const width = 1.5;
  const height = 2.06;
  const foot = 0.1;
  const thick = 0.05;
  const side = 0.13;
  const header = 0.25;
  const caption = 0.36;
  for (const sx of [-1, 1]) {
    matteBox(f, 'white', side, height, thick, sx * (width / 2 - side / 2), foot + height / 2, 0);
    f.box('wood', 0.07, foot, 0.7, sx * 0.66, foot / 2, -0.1);
    f.cylinderBetween('wood', sx * 0.66, 0.08, -0.42, sx * 0.66, 1.05, -0.03, 0.02);
  }
  matteBox(f, 'white', width, header, thick, 0, foot + height - header / 2, 0);
  matteBox(f, 'white', width, caption, thick, 0, foot + caption / 2, 0);
  f.geometry('signEventProps', propPlane('frameTop'), 0, foot + height - header / 2, thick / 2 + 0.004, 0, 0, 0, 1.46, 0.228, 1);
  f.geometry('signEventProps', propPlane('frameBottom'), 0, foot + caption / 2, thick / 2 + 0.004, 0, 0, 0, 1.46, 0.319, 1);
  // A spray of flowers on one corner of the window.
  const rng = seededRandom(1120);
  const blooms = ['pink', 'yellow', 'white', 'red', 'blush', 'orange', 'pink', 'white', 'yellow'];
  f.blob('leaf', 0.17, -0.64, foot + caption + 0.1, 0.05, 1.1, 1.1, 0.4);
  blooms.forEach((color, i) => {
    matteBall(f, color, 0.055 + rng() * 0.03, -0.72 + rng() * 0.26, foot + caption - 0.04 + rng() * 0.3, 0.07 + rng() * 0.04);
  });
  f.solidBox(width, 0.16, 0, -0.02);
}

// ---- Helium balloons (the only moving part) ------------------------------------------------

/** A bunch of balloons tied at booth-local (x, y, z); it sways in updateTeachersDayBooth(). */
function addBalloonBunch(x, y, z, seed, colors) {
  const rng = seededRandom(seed);
  const parts = [];
  const up = new THREE.Vector3(0, 1, 0);
  colors.forEach((color, i) => {
    const a = (i / colors.length) * TAU + rng();
    const spread = 0.2 + rng() * 0.16;
    const r = 0.17 + rng() * 0.04;
    const centre = new THREE.Vector3(Math.cos(a) * spread, 1.15 + i * 0.16 + rng() * 0.1, Math.sin(a) * spread);
    parts.push(tint(UNIT.sphere, color).clone().applyMatrix4(
      new THREE.Matrix4().makeScale(r, r * 1.16, r).setPosition(centre),
    ));
    const end = centre.clone().addScaledVector(up, -r * 1.16);
    const length = end.length();
    parts.push(tint(UNIT.cylinder, 'white').clone().applyMatrix4(new THREE.Matrix4().compose(
      end.clone().multiplyScalar(0.5),
      new THREE.Quaternion().setFromUnitVectors(up, end.clone().normalize()),
      new THREE.Vector3(0.006, length, 0.006),
    )));
  });
  const mesh = new THREE.Mesh(mergeGeometries(parts, false), MATS.get('festGloss').material);
  mesh.position.set(BX + x, y, BZ + z);
  mesh.castShadow = true;
  scene.add(mesh);
  bunches.push({ mesh, phase: seed * 1.7 });
}

// ---- Assembly ------------------------------------------------------------------------------

export function buildTeachersDayBooth() {
  const b = at(0, 0);
  addCarpet(b);
  addBackdrop(b);
  addBalloonGarland(b);
  addMarqueeNumbers(b);
  addPolesAndStrings(b);

  addFlowerStand(-3.05, -0.75, 0.22, 41, ['pink', 'blush', 'white', 'red', 'lilac', 'pink']);
  addFlowerStand(3.05, -0.75, -0.22, 42, ['yellow', 'orange', 'white', 'red', 'yellow', 'gold']);
  [-2.95, -2.3, -1.65, 1.65, 2.3, 2.95].forEach((x, i) => {
    addMumPot(b, x, 1.74, i % 3 === 1 ? 'pink' : 'yellow', 60 + i);
  });

  addWishBoard(-4.35, 0.45, 0.5);
  addSouvenirTable(4.3, 0.3, -0.3);
  addPhotoFrame(-2.75, 3.15, 0.32);
  addBalloonBunch(5.14, 0.8, 0.3, 7, ['red', 'gold', 'pink', 'cream', 'sky']);
  addBalloonBunch(-3.43, 2.14, 3.38, 9, ['pink', 'yellow', 'red', 'teal']);

  // Pupils: two posing by the numbers, one taking their picture, one behind the photo frame,
  // one reading the wishes and one at the souvenir table (clear of whoever reads the album).
  const pupil = (x, z, yaw, seed) => addStudent(b, BX + x, BZ + z, yaw, seed);
  pupil(2.4, 0.2, 0.05, 21);
  pupil(2.95, 0.05, -0.2, 22);
  pupil(2.3, 3.6, 3.04, 23);
  pupil(-2.86, 2.81, 0.32, 24);
  pupil(-3.94, 1.2, 0.5 + Math.PI, 15);
  pupil(4.54, 1.21, Math.PI - 0.3, 16);

  // Warm light over the carpet after dark, switched with the courtyard lamps.
  const light = new THREE.PointLight(0xffd6a0, 0, 16, 2);
  light.position.set(BX, 3.1, BZ + 1.9);
  scene.add(light);
  lampLights.push(light);
}

/** Per-frame: the helium balloons sway on their strings. */
export function updateTeachersDayBooth(t) {
  for (const { mesh, phase } of bunches) {
    mesh.rotation.z = Math.sin(t * 0.9 + phase) * 0.06;
    mesh.rotation.x = Math.sin(t * 0.67 + phase * 1.7) * 0.05;
  }
}
