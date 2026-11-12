/**
 * Shared by the close-up views that borrow the camera (the album, the memory video): where to
 * give the camera back to, whether a prop is within reach, and its floating prompt chip.
 */

import * as THREE from 'three';
import { labelsLayer } from '../core/dom.js';
import { camera, controls } from '../core/engine.js';
import { startCameraFlight } from './cameraRig.js';
import { isWalking, isWalkReady, walkCameraPose } from './walk.js';

const EDGE_MARGIN = 10;
const projected = new THREE.Vector3();

/** Where the camera is now, to return to later: an orbit pose, or the walker's eyes. */
export function cameraReturnPose() {
  return isWalking()
    ? { walk: true }
    : { walk: false, position: camera.position.clone(), target: controls.target.clone() };
}

/**
 * Fly the camera back to a pose from cameraReturnPose(). `turn` (see startCameraFlight) is for
 * a view that looked straight down.
 */
export function flyCameraBack(pose, seconds, onDone, { turn = false } = {}) {
  if (pose.walk) {
    const eyes = walkCameraPose();
    startCameraFlight(eyes.position, eyes.target, seconds, { fov: eyes.fov, handBack: false, onDone, turn });
  } else {
    startCameraFlight(pose.position, pose.target, seconds, { onDone, turn });
  }
}

/** Is the camera close enough to `point`? The reach differs on foot and in the orbit views. */
export function isCameraInReach(point, walkReach, orbitReach) {
  return camera.position.distanceTo(point) <= (isWalking() ? walkReach : orbitReach);
}

/**
 * Per frame: show `prompt` just above the world point `anchor` while the camera is in reach
 * and the point is on screen — on foot once the walker has arrived, in the orbit views while
 * the Labels switch is on — and hide it otherwise (or when `allowed` is false).
 */
export function updatePrompt(prompt, anchor, allowed, walkReach, orbitReach) {
  let show = allowed && isCameraInReach(anchor, walkReach, orbitReach)
    && (isWalking() ? isWalkReady() : !labelsLayer.classList.contains('is-hidden'));
  if (show) {
    camera.updateMatrixWorld();
    projected.copy(anchor).project(camera);
    show = projected.z > -1 && projected.z < 1
      && Math.abs(projected.x) < 1.02 && projected.y > -1.05 && projected.y < 1.02;
  }
  if (prompt.hidden === show) prompt.hidden = !show;
  if (!show) return;
  const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;
  const half = prompt.offsetWidth / 2;
  const left = THREE.MathUtils.clamp(x, half + EDGE_MARGIN, Math.max(half + EDGE_MARGIN, window.innerWidth - half - EDGE_MARGIN));
  const top = Math.max(y, prompt.offsetHeight + EDGE_MARGIN);
  prompt.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0) translate(-50%, -100%)`;
}
