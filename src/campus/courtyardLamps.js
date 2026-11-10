/**
 * Courtyard lamp posts with night-time point lights.
 */

import * as THREE from 'three';
import { scene } from '../core/engine.js';
import { siteBuilder } from '../geometry/batching.js';
import { lampLights, makeLampGlow } from '../scene/lights.js';

export function buildCourtyardLamps() {
  const b = siteBuilder;
  const positions = [
    [-19.0, 23.1],
    [27.6, 20.8],
    [-17.4, -9.6],
    [29.4, -9.8],
  ];
  for (const [x, z] of positions) {
    b.cylinder('stoneBase', 0.26, 0.28, x, 0.14, z);
    b.cylinder('lampMetal', 0.07, 3.62, x, 2.01, z);
    b.box('lampMetal', 1.32, 0.06, 0.06, x, 3.86, z);
    b.box('lampMetal', 0.06, 0.27, 0.06, x, 3.68, z);
    for (const offset of [-0.56, 0.56]) {
      const lx = x + offset;
      b.cylinder('lampMetal', 0.03, 0.22, lx, 3.74, z);
      b.cone('lampMetal', 0.19, 0.24, lx, 3.93, z, Math.PI, 0, 0);
      b.sphere('lampGlass', 0.115, lx, 3.79, z, 1, 1.15, 1);
      makeLampGlow(new THREE.Vector3(lx, 3.79, z)).scale.set(3.1, 3.1, 1);
    }
    const point = new THREE.PointLight(0xffcf8d, 0, 24, 2);
    point.position.set(x, 3.72, z);
    scene.add(point);
    lampLights.push(point);
  }
  // A pair of lamps beside the guard room entrance.
  const gatePoint = new THREE.PointLight(0xffcf8d, 0, 15, 2);
  gatePoint.position.set(0, 4.3, 30.4);
  scene.add(gatePoint);
  lampLights.push(gatePoint);
}
