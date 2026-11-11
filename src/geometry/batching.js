/**
 * Static geometry batching. Builder calls queue transformed copies of unit geometries per
 * material key; flushBatches() merges each queue into one mesh, keeping draw calls very
 * low.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { scene } from '../core/engine.js';
import { MATS } from '../materials/registry.js';
import { addFloor, addSolidBox, addSolidCircle } from './colliders.js';

const batchMap = new Map();
export const UNIT = {
  box: new THREE.BoxGeometry(1, 1, 1),
  plane: new THREE.PlaneGeometry(1, 1),
  cylinder: new THREE.CylinderGeometry(1, 1, 1, 10),
  cylinderFine: new THREE.CylinderGeometry(1, 1, 1, 14),
  cone: new THREE.ConeGeometry(1, 1, 9),
  blob: new THREE.IcosahedronGeometry(1, 1),
  blobLow: new THREE.IcosahedronGeometry(1, 0),
  sphere: new THREE.SphereGeometry(1, 12, 8),
  torus: new THREE.TorusGeometry(1, 0.08, 6, 24),
  ring: new THREE.TorusGeometry(1, 0.12, 6, 28),
  circle: new THREE.CircleGeometry(1, 20),
};

function ensureBatch(key) {
  let batch = batchMap.get(key);
  if (!batch) {
    const def = MATS.get(key);
    if (!def) throw new Error(`Unknown material batch: ${key}`);
    batch = { key, def, geometries: [] };
    batchMap.set(key, batch);
  }
  return batch;
}

const scratchVector = new THREE.Vector3();
const scratchQuat = new THREE.Quaternion();
const scratchScale = new THREE.Vector3();
const scratchEuler = new THREE.Euler();
const scratchMatrix = new THREE.Matrix4();

export function commitGeometry(key, baseGeometry, worldMatrix) {
  let geometry = baseGeometry.clone();
  geometry.applyMatrix4(worldMatrix);
  if (geometry.index) geometry = geometry.toNonIndexed();
  if (!geometry.getAttribute('normal')) geometry.computeVertexNormals();
  if (!geometry.getAttribute('uv')) {
    const count = geometry.getAttribute('position').count;
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(count * 2), 2));
  }
  // All merged inputs must expose the same attributes.
  for (const name of Object.keys(geometry.attributes)) {
    if (name !== 'position' && name !== 'normal' && name !== 'uv') {
      geometry.deleteAttribute(name);
    }
  }
  ensureBatch(key).geometries.push(geometry);
}

export class Builder {
  constructor(cx = 0, cz = 0, yaw = 0) {
    this.cx = cx;
    this.cz = cz;
    this.yaw = yaw;
    this.base = new THREE.Matrix4()
      .makeTranslation(cx, 0, cz)
      .multiply(new THREE.Matrix4().makeRotationY(yaw));
  }

  _matrix(x, y, z, rx, ry, rz, sx, sy, sz) {
    scratchVector.set(x, y, z);
    scratchEuler.set(rx, ry, rz, 'YXZ');
    scratchQuat.setFromEuler(scratchEuler);
    scratchScale.set(sx, sy, sz);
    scratchMatrix.compose(scratchVector, scratchQuat, scratchScale);
    return new THREE.Matrix4().multiplyMatrices(this.base, scratchMatrix);
  }

  geometry(key, geometry, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    commitGeometry(key, geometry, this._matrix(x, y, z, rx, ry, rz, sx, sy, sz));
    return this;
  }

  box(key, w, h, d, x, y, z, rx = 0, ry = 0, rz = 0) {
    return this.geometry(key, UNIT.box, x, y, z, rx, ry, rz, w, h, d);
  }

  plane(key, w, h, x, y, z, rx = 0, ry = 0, rz = 0) {
    return this.geometry(key, UNIT.plane, x, y, z, rx, ry, rz, w, h, 1);
  }

  cylinder(key, radius, height, x, y, z, rx = 0, ry = 0, rz = 0) {
    return this.geometry(key, UNIT.cylinder, x, y, z, rx, ry, rz, radius, height, radius);
  }

  cylinderFine(key, radius, height, x, y, z, rx = 0, ry = 0, rz = 0) {
    return this.geometry(key, UNIT.cylinderFine, x, y, z, rx, ry, rz, radius, height, radius);
  }

  cone(key, radius, height, x, y, z, rx = 0, ry = 0, rz = 0) {
    return this.geometry(key, UNIT.cone, x, y, z, rx, ry, rz, radius, height, radius);
  }

  blob(key, radius, x, y, z, sx = 1, sy = 1, sz = 1, ry = 0) {
    return this.geometry(key, UNIT.blob, x, y, z, 0, ry, 0, radius * sx, radius * sy, radius * sz);
  }

  sphere(key, radius, x, y, z, sx = 1, sy = 1, sz = 1) {
    return this.geometry(key, UNIT.sphere, x, y, z, 0, 0, 0, radius * sx, radius * sy, radius * sz);
  }

  cylinderBetween(key, x1, y1, z1, x2, y2, z2, radius) {
    const start = new THREE.Vector3(x1, y1, z1);
    const end = new THREE.Vector3(x2, y2, z2);
    const dir = end.clone().sub(start);
    const length = dir.length();
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
    scratchMatrix.compose(mid, q, new THREE.Vector3(radius, length, radius));
    const world = new THREE.Matrix4().multiplyMatrices(this.base, scratchMatrix);
    commitGeometry(key, UNIT.cylinderFine, world);
    return this;
  }

  // Walk-mode collision (see geometry/colliders.js). These add no geometry: they describe
  // the footprint of what was just built, in this builder's local frame.

  _worldXZ(x, z) {
    const cos = Math.cos(this.yaw);
    const sin = Math.sin(this.yaw);
    return [this.cx + x * cos + z * sin, this.cz - x * sin + z * cos];
  }

  /** Blocks walking: a w × d footprint centred on (x, z), optionally rotated by ry. */
  solidBox(w, d, x, z, ry = 0) {
    const [wx, wz] = this._worldXZ(x, z);
    addSolidBox(wx, wz, w, d, this.yaw + ry);
    return this;
  }

  /** Blocks walking: a round footprint (posts, trunks, pots). */
  solidCircle(radius, x, z) {
    const [wx, wz] = this._worldXZ(x, z);
    addSolidCircle(wx, wz, radius);
    return this;
  }

  /** A w × d surface `height` metres up that can be walked on (reached by small steps). */
  floor(w, d, x, z, height) {
    const [wx, wz] = this._worldXZ(x, z);
    addFloor(wx, wz, w, d, height, this.yaw);
    return this;
  }
}

export const siteBuilder = new Builder(0, 0, 0);

export function flushBatches() {
  for (const batch of batchMap.values()) {
    if (!batch.geometries.length) continue;
    const merged = mergeGeometries(batch.geometries, false);
    if (!merged) {
      console.warn('Could not merge batch', batch.key);
      continue;
    }
    const mesh = new THREE.Mesh(merged, batch.def.material);
    mesh.name = `batch-${batch.key}`;
    mesh.castShadow = batch.def.castShadow;
    mesh.receiveShadow = batch.def.receiveShadow;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    scene.add(mesh);
    for (const geometry of batch.geometries) geometry.dispose();
    batch.geometries.length = 0;
  }
  batchMap.clear();
}
