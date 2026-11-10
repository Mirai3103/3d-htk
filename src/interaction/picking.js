/**
 * Invisible box proxies per building and raycast picking from pointer events.
 */

import * as THREE from 'three';
import { camera, pointerNdc, raycaster, renderer, scene } from '../core/engine.js';
import { BUILDING_ORDER, BUILDINGS } from '../data/buildings.js';

const pickables = [];

export function findBuildingAtEvent(event) {
  if (!pickables.length) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNdc.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointerNdc, camera);
  raycaster.far = 900;
  const hits = raycaster.intersectObjects(pickables, false);
  return hits.length ? hits[0].object.userData.buildingId : null;
}

export function createPickProxies() {
  const material = new THREE.MeshBasicMaterial({ visible: false });
  for (const id of BUILDING_ORDER) {
    const data = BUILDINGS[id];
    const b = data.bounds;
    const proxy = new THREE.Mesh(new THREE.BoxGeometry(b.w, b.h, b.d), material);
    proxy.position.set(b.x, b.base + b.h / 2, b.z);
    proxy.userData.buildingId = id;
    proxy.frustumCulled = false;
    scene.add(proxy);
    pickables.push(proxy);
  }
}
