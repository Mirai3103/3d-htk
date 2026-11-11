/**
 * Camera framing: responsive FOV, overview framing, eased camera flights and safety
 * constraints.
 */

import * as THREE from 'three';
import { camera, controls } from '../core/engine.js';

let isFlying = false;
let cameraFlight = null;

const overviewDirection = new THREE.Vector3(0.17, 0.70, 0.69).normalize();
export const overviewTarget = new THREE.Vector3(24, 2.0, -2.0);

let lastOverviewDistance = 140;

/** Vertical FOV of the orbit views for the current window shape. */
export function responsiveFov() {
  const aspect = Math.max(0.3, window.innerWidth / Math.max(1, window.innerHeight));
  return aspect < 0.8 ? 55 : aspect < 1.15 ? 48 : 43;
}

export function updateResponsiveFov() {
  const nextFov = responsiveFov();
  if (camera.fov !== nextFov) {
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  }
}

/** Overview framing for the orbit FOV; does not touch the camera. */
export function viewportOverview() {
  const aspect = Math.max(0.3, window.innerWidth / Math.max(1, window.innerHeight));
  const vFov = THREE.MathUtils.degToRad(responsiveFov());
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
  const overviewWidth = aspect < 0.8 ? 168 : 182;
  const distanceForWidth = (overviewWidth * 0.5) / Math.tan(hFov / 2);
  const distanceForHeight = (88 * 0.5) / Math.tan(vFov / 2);
  const distance = Math.max(distanceForWidth, distanceForHeight) * 1.055;
  lastOverviewDistance = distance;
  const target = overviewTarget.clone();
  const position = target.clone().addScaledVector(overviewDirection, distance);
  return { position, target };
}

export function setInitialView() {
  updateResponsiveFov();
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
  if (mobile && data.mobileView) {
    target = new THREE.Vector3(...data.mobileView.target);
    position = new THREE.Vector3(...data.mobileView.position);
  } else if (mobile) {
    const mobileScales = { 'Administration Block': 2.05, 'Back Classroom Block': 2.35, 'Right Classroom Wing': 1.92, 'Inner Left Wing': 2.08, 'Outer Left Wing': 2.2, 'Ceremony Stage': 1.45, 'Main Gate': 1.18 };
    const direction = basePosition.clone().sub(originalTarget);
    target = originalTarget.clone();
    target.y = Math.min(target.y, 1.35);
    position = target.clone().addScaledVector(direction, mobileScales[data.name] || 1.9);
  }
  startCameraFlight(position, target, 1.35);
}

/**
 * Ease the camera to a new position/target. Flights also carry the FOV (orbit FOV unless
 * `fov` says otherwise). By default the orbit controls take over again on arrival; pass
 * `handBack: false` when another mode (walking) drives the camera afterwards, and `onDone`
 * to be told when the flight lands. A newer flight simply replaces a running one.
 */
export function startCameraFlight(toPosition, toTarget, duration = 1.35, options = {}) {
  const { fov = responsiveFov(), handBack = true, onDone = null } = options;
  isFlying = true;
  controls.enabled = false;
  cameraFlight = {
    fromPosition: camera.position.clone(),
    fromTarget: controls.target.clone(),
    toPosition: toPosition.clone(),
    toTarget: toTarget.clone(),
    fromFov: camera.fov,
    toFov: fov,
    handBack,
    onDone,
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
  if (cameraFlight.fromFov !== cameraFlight.toFov) {
    camera.fov = THREE.MathUtils.lerp(cameraFlight.fromFov, cameraFlight.toFov, eased);
    camera.updateProjectionMatrix();
  }
  if (linear >= 1) {
    const { handBack, onDone } = cameraFlight;
    cameraFlight = null;
    isFlying = false;
    if (handBack) {
      controls.enabled = true;
      controls.update(0.001);
    }
    if (onDone) onDone();
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
