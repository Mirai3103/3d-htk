/**
 * Camera framing: responsive FOV, overview framing, eased camera flights and safety
 * constraints.
 */

import * as THREE from 'three';
import { camera, controls } from '../core/engine.js';

let isFlying = false;
let cameraFlight = null;

const overviewDirection = new THREE.Vector3(0.17, 0.70, 0.69).normalize();
export const overviewTarget = new THREE.Vector3(0, 2.0, -2.0);

let lastOverviewDistance = 122;

export function updateResponsiveFov() {
  const aspect = Math.max(0.3, window.innerWidth / Math.max(1, window.innerHeight));
  const nextFov = aspect < 0.8 ? 55 : aspect < 1.15 ? 48 : 43;
  if (camera.fov !== nextFov) {
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  }
}

export function viewportOverview() {
  updateResponsiveFov();
  const aspect = Math.max(0.3, window.innerWidth / Math.max(1, window.innerHeight));
  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const overviewWidth = aspect < 0.8 ? 112 : 122;
  const distanceForWidth = (overviewWidth * 0.5) / Math.tan(hFov / 2);
  const distanceForHeight = (80 * 0.5) / Math.tan(vFov / 2);
  const distance = Math.max(distanceForWidth, distanceForHeight) * 1.055;
  lastOverviewDistance = distance;
  const target = overviewTarget.clone();
  const position = target.clone().addScaledVector(overviewDirection, distance);
  return { position, target };
}

export function setInitialView() {
  const view = viewportOverview();
  camera.position.copy(view.position);
  controls.target.copy(view.target);
  controls.maxDistance = Math.max(390, lastOverviewDistance * 1.35);
  camera.lookAt(controls.target);
  controls.update(0.0001);
}

export function flyToOverview() {
  const view = viewportOverview();
  startCameraFlight(view.position, view.target, 1.45);
}

export function flyToBuilding(data) {
  const mobile = window.innerWidth < 760;
  const originalTarget = new THREE.Vector3(...data.view.target);
  const basePosition = new THREE.Vector3(...data.view.position);
  let target = originalTarget;
  let position = basePosition;
  if (mobile) {
    const mobileScales = { 'Administration Block': 2.05, 'Back Classroom Block': 2.35, 'Right Classroom Wing': 1.92, 'Inner Left Wing': 2.08, 'Outer Left Wing': 2.2, 'Ceremony Stage': 1.45, 'Main Gate': 1.18 };
    const direction = basePosition.clone().sub(originalTarget);
    target = originalTarget.clone();
    target.y = Math.min(target.y, 1.35);
    position = target.clone().addScaledVector(direction, mobileScales[data.name] || 1.9);
  }
  startCameraFlight(position, target, 1.35);
}

function startCameraFlight(toPosition, toTarget, duration = 1.35) {
  isFlying = true;
  controls.enabled = false;
  cameraFlight = {
    fromPosition: camera.position.clone(),
    fromTarget: controls.target.clone(),
    toPosition: toPosition.clone(),
    toTarget: toTarget.clone(),
    started: performance.now(),
    duration: duration * 1000,
  };
}

export function updateCameraFlight() {
  if (!cameraFlight) return;
  const now = performance.now();
  const linear = THREE.MathUtils.clamp((now - cameraFlight.started) / cameraFlight.duration, 0, 1);
  const eased = linear < 0.5
    ? 4 * linear * linear * linear
    : 1 - Math.pow(-2 * linear + 2, 3) / 2;
  camera.position.lerpVectors(cameraFlight.fromPosition, cameraFlight.toPosition, eased);
  controls.target.lerpVectors(cameraFlight.fromTarget, cameraFlight.toTarget, eased);
  camera.lookAt(controls.target);
  if (linear >= 1) {
    cameraFlight = null;
    isFlying = false;
    controls.enabled = true;
    controls.update(0.001);
  }
}

export function constrainCamera() {
  if (camera.position.y < 1.4) camera.position.y = 1.4;
  if (controls.target.y < 0.1) controls.target.y = 0.1;
  if (!Number.isFinite(camera.position.x) || !Number.isFinite(camera.position.z)) {
    setInitialView();
  }
}

export function isCameraFlying() {
  return isFlying;
}
