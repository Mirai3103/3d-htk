/**
 * Pointer picking: invisible box proxies per building, plus the teacher's, the album's and the
 * video screen's own proxies, and the raycast that tells which one a pointer event is over.
 */

import * as THREE from 'three';
import { camera, pointerNdc, raycaster, renderer, scene } from '../core/engine.js';
import { getAlbumPickProxy } from '../campus/album.js';
import { getMemoryScreenPickProxy } from '../campus/memoryScreen.js';
import { getTeacherPickProxy } from '../campus/teacher.js';
import { BUILDING_ORDER, BUILDINGS } from '../data/buildings.js';
import { canPickAlbum } from './albumView.js';
import { canPickVideo } from './videoView.js';

const pickables = [];
const npcPickables = [];
// Buildings whose box has props (the album, the video screen) inside it.
const propHosts = new Set();

/**
 * What is under the pointer: `{ buildingId }`, `{ npc }`, `{ prop }` or null. The nearest
 * proxy wins, so a building's box in front of the teacher hides her. The props stand inside
 * the Teachers' Day corner's own box, so they are reached through that box once the camera
 * is near enough (`canPick`). With `npcOnly` the buildings are ignored (walk mode, where
 * they are not selectable).
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
  let around = null;
  for (const hit of hits) {
    const data = hit.object.userData;
    if (data.prop) {
      if (data.canPick()) return data;
    } else if (around) {
      break;
    } else if (data.buildingId && propHosts.has(data.buildingId)) {
      // Keep looking: a prop may be just behind this box's face.
      around = data;
    } else {
      return data;
    }
  }
  return around;
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
  const props = [[getAlbumPickProxy(), canPickAlbum], [getMemoryScreenPickProxy(), canPickVideo]];
  for (const [proxy, canPick] of props) {
    if (!proxy) continue;
    proxy.userData.canPick = canPick;
    propHosts.add('teachersDay');
    pickables.push(proxy);
    npcPickables.push(proxy);
  }
}
