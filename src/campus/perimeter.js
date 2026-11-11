/**
 * Perimeter wall, front hedge and edge trees.
 */

import { siteBuilder } from '../geometry/batching.js';
import { addTree } from '../kit/vegetation.js';

export function addWallPost(x, z, tall = false) {
  const b = siteBuilder;
  const h = tall ? 2.35 : 2.22;
  b.box('stoneBase', 0.44, 0.55, 0.44, x, 0.275, z);
  b.box('cream', 0.36, h, 0.36, x, h / 2, z);
  b.box('trim', 0.48, 0.12, 0.48, x, h + 0.02, z);
  b.box('trim', 0.32, 0.08, 0.32, x, h - 0.06, z);
}

function addWallSectionX(x1, x2, z) {
  if (x2 <= x1) return;
  const b = siteBuilder;
  const length = x2 - x1;
  const cx = (x1 + x2) / 2;
  b.box('stoneBase', length, 0.55, 0.36, cx, 0.275, z);
  b.box('cream', length, 1.3, 0.28, cx, 1.2, z);
  b.box('trim', length, 0.15, 0.38, cx, 1.93, z);
  const posts = Math.max(1, Math.floor(length / 8.5));
  addWallPost(x1, z);
  addWallPost(x2, z);
  for (let i = 1; i < posts; i++) addWallPost(x1 + (i / posts) * length, z);
}

function addWallSectionZ(z1, z2, x) {
  if (z2 <= z1) return;
  const b = siteBuilder;
  const length = z2 - z1;
  const cz = (z1 + z2) / 2;
  b.box('stoneBase', 0.36, 0.55, length, x, 0.275, cz);
  b.box('cream', 0.28, 1.3, length, x, 1.2, cz);
  b.box('trim', 0.38, 0.15, length, x, 1.93, cz);
  const posts = Math.max(1, Math.floor(length / 8.5));
  addWallPost(x, z1);
  addWallPost(x, z2);
  for (let i = 1; i < posts; i++) addWallPost(x, z1 + (i / posts) * length);
}

export function buildPerimeter() {
  addWallSectionX(-50, -10.2, 30);
  addWallSectionX(7.1, 100, 30);
  addWallSectionX(-50, 100, -30);
  addWallSectionZ(-30, 30, -50);
  addWallSectionZ(-30, 9.5, 100);
  addWallSectionZ(18.5, 30, 100);
  const b = siteBuilder;
  // A low hedge inside the front wall softens the long line.
  for (let x = 11; x < 47; x += 3.2) {
    b.blob('shrub', 0.62, x, 0.42, 28.35, 1.4, 0.82, 0.8);
    b.blob('shrubLight', 0.46, x + 0.7, 0.32, 28.3, 1.2, 0.7, 0.8);
    b.solidCircle(0.6, x + 0.2, 28.35);
  }
  for (let x = 53; x < 97; x += 3.2) {
    b.blob('shrub', 0.62, x, 0.42, 28.35, 1.4, 0.82, 0.8);
    b.blob('shrubLight', 0.46, x + 0.7, 0.32, 28.3, 1.2, 0.7, 0.8);
    b.solidCircle(0.6, x + 0.2, 28.35);
  }
  for (let x = -47; x < -14; x += 3.6) {
    b.blob('shrub', 0.56, x, 0.37, 28.4, 1.3, 0.75, 0.8);
    b.solidCircle(0.55, x, 28.4);
  }
  // A pair of mature edge trees outside the wall gives the campus a green frame.
  addTree(siteBuilder, -57, 19, 8.5, 4.2, 822);
  addTree(siteBuilder, 111, 6, 9.0, 4.4, 823);
}
