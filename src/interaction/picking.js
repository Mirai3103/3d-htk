/**
 * Pointer picking: invisible box proxies per building, plus the teacher's own proxy, and the
 * raycast that tells which one a pointer event is over.
 */

import * as THREE from 'three';
import { camera, pointerNdc, raycaster, renderer, scene } from '../core/engine.js';
import { getTeacherPickProxy } from '../campus/teacher.js';
import { BUILDING_ORDER, BUILDINGS } from '../data/buildings.js';

const pickables = [];
const npcPickables = [];

/**
 * What is under the pointer: `{ buildingId }`, `{ npc }` or null. The nearest proxy wins, so
 * a building's box in front of the teacher hides her. With `npcOnly` the buildings are
 * ignored (walk mode, where they are not selectable).
 */
export function findPickAtEvent(event, npcOnly = false) {
  const targets = npcOnly ? npcPickables : pickables;
  if (!targets.length) return null;
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNdc.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointerNdc, camera);
  raycaster.far = 900;
  const hits = raycaster.intersectObjects(targets, false);
  return hits.length ? hits[0].object.userData : null;
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
  const teacher = getTeacherPickProxy();
  if (teacher) {
    pickables.push(teacher);
    npcPickables.push(teacher);
  }
}
