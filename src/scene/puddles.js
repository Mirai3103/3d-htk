/**
 * Rain puddles, shown only when the ground is wet.
 */

import * as THREE from 'three';
import { HALF_PI } from '../core/math.js';
import { scene } from '../core/engine.js';
import { M } from '../materials/registry.js';

export const puddleMeshes = [];

export function createPuddles() {
  const puddles = [
    [-16.5, 21.5, 3.8, 1.3, 0.35],
    [-3.5, 18.5, 2.2, 0.9, -0.2],
    [8.5, 22.0, 3.2, 1.1, 0.8],
    [27.8, 18.5, 2.6, 1.3, -0.6],
    [31.8, 6.5, 1.8, 2.4, 0.25],
    [-17.3, -7.5, 2.4, 1.0, -0.9],
    [15.0, 8.5, 2.8, 1.05, 0.1],
  ];
  for (const [x, z, sx, sz, rotation] of puddles) {
    const mesh = new THREE.Mesh(new THREE.CircleGeometry(1, 22), M.puddle);
    mesh.rotation.x = -HALF_PI;
    mesh.rotation.z = rotation;
    mesh.scale.set(sx, sz, 1);
    mesh.position.set(x, 0.057, z);
    mesh.visible = false;
    mesh.renderOrder = 4;
    scene.add(mesh);
    puddleMeshes.push(mesh);
  }
}
