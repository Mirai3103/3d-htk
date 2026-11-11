/**
 * The memory-video screen of the Teachers' Day corner: a flat screen on a stand with a pair of
 * speakers. The stand is batched; the picture is a real, self-lit mesh showing a title card —
 * it is also what gets clicked. The video itself is an HTML <video> laid exactly over this
 * picture once the camera faces it (interaction/videoView.js).
 */

import * as THREE from 'three';
import { scene } from '../core/engine.js';
import { Builder } from '../geometry/batching.js';
import { memoryScreenTex } from '../textures/festive.js';

// The picture is 16:9.
const SCREEN_W = 2.4;
const SCREEN_H = 1.35;
const SCREEN_Y = 1.62; // height of its centre
const BEZEL = 0.06;
const DEPTH = 0.09;

let picture = null;

/** Stand the screen at world (x, z), facing local +Z turned by yaw. */
export function buildMemoryScreen({ x, z, yaw }) {
  const b = new Builder(x, z, yaw);
  const top = SCREEN_Y + SCREEN_H / 2 + BEZEL;
  const bottom = SCREEN_Y - SCREEN_H / 2 - BEZEL;

  // Housing, with a gold cap.
  b.box('metalDark', SCREEN_W + BEZEL * 2, SCREEN_H + BEZEL * 2, DEPTH, 0, SCREEN_Y, 0);
  b.box('gold', SCREEN_W + BEZEL * 2 + 0.06, 0.035, DEPTH + 0.04, 0, top + 0.017, 0);

  // Two legs on long feet, braced from behind.
  for (const side of [-1, 1]) {
    const lx = side * 0.86;
    b.box('metalDark', 0.07, bottom + 0.3, 0.07, lx, (bottom + 0.3) / 2, -DEPTH / 2 - 0.035);
    b.box('metalDark', 0.1, 0.05, 1.0, lx, 0.025, -0.1);
    b.cylinderBetween('metalDark', lx, 1.5, -DEPTH / 2 - 0.05, lx, 0.05, -0.56, 0.02);
  }
  b.box('metalDark', 1.72, 0.05, 0.05, 0, 0.42, -DEPTH / 2 - 0.035);

  // Speakers on the ground, turned a little outwards.
  for (const side of [-1, 1]) {
    const s = new Builder(...b._worldXZ(side * 0.86, 0.2), yaw - side * 0.2);
    s.box('metalDark', 0.36, 0.6, 0.3, 0, 0.3, 0);
    for (const [y, radius] of [[0.2, 0.11], [0.45, 0.06]]) {
      s.cylinder('metalLight', radius, 0.012, 0, y, 0.151, Math.PI / 2);
      s.cylinder('metalDark', radius * 0.55, 0.016, 0, y, 0.151, Math.PI / 2);
    }
  }
  b.solidBox(SCREEN_W + 0.2, 1.0, 0, -0.05);

  picture = new THREE.Mesh(
    new THREE.PlaneGeometry(SCREEN_W, SCREEN_H),
    new THREE.MeshBasicMaterial({ map: memoryScreenTex, toneMapped: false }),
  );
  const [px, pz] = b._worldXZ(0, DEPTH / 2 + 0.004);
  picture.position.set(px, SCREEN_Y, pz);
  picture.rotation.y = yaw;
  picture.userData.prop = 'video';
  scene.add(picture);
}

export function getMemoryScreenPickProxy() {
  return picture;
}

/**
 * Where the picture is, for the camera, the prompt and the video laid over it: `center`
 * (world) and `normal` (unit vector towards the viewer); returns its size in metres.
 */
export function getMemoryScreenFrame(center, normal) {
  if (!picture) return null;
  center.copy(picture.position);
  normal.set(Math.sin(picture.rotation.y), 0, Math.cos(picture.rotation.y));
  return { width: SCREEN_W, height: SCREEN_H };
}
