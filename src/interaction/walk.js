/**
 * First-person walk mode: you are a pupil on foot inside the school walls.
 *
 * Owns the walker state (position, heading, eye height) and drives the camera while the mode
 * is on. Key and pointer events arrive from interaction/input.js through setWalkKey() and
 * walkLook(); collision comes from geometry/colliders.js.
 */

import * as THREE from 'three';
import { appEl, labelsLayer, walkPlace, walkPlaceKind, walkPlaceName, walkToggle } from '../core/dom.js';
import { camera, controls } from '../core/engine.js';
import { damp } from '../core/math.js';
import { BUILDING_ORDER, BUILDINGS } from '../data/buildings.js';
import { floorHeightAt, resolveSolids } from '../geometry/colliders.js';
import { flyToOverview, startCameraFlight } from './cameraRig.js';
import { setHoveredBuilding } from './hover.js';

// A secondary-school pupil: eyes about 1.45 m up, shoulders about 0.7 m wide.
const EYE_HEIGHT = 1.45;
const BODY_RADIUS = 0.35;
const WALK_SPEED = 3.0; // m/s
const RUN_SPEED = 6.2;
const BACK_FACTOR = 0.6;
const TURN_SPEED = 2.0; // rad/s
const LOOK_SENSITIVITY = 0.0034; // rad per dragged pixel
const MAX_PITCH = 1.15;
const MAX_STEP_UP = 0.36; // tallest riser that can be climbed without a jump
const SUBSTEP = 0.12; // longest move resolved in one go, so thin railings cannot be skipped
const PLACE_RANGE = 6; // metres from a building's footprint at which its name appears

// Walkers stay inside the perimeter wall: the main lot plus the east side yard.
const LOT = { minX: -49.45, maxX: 99.45, minZ: -29.45, maxZ: 29.45 };

// Just inside the main gate, facing the courtyard.
const START = { x: 0, z: 26.8, yaw: 0 };

const ORBIT_NEAR = camera.near;
const WALK_NEAR = 0.2;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** 'off' → orbit views, 'entering' → flying down to the gate, 'on' → walking. */
let mode = 'off';

const pos = { x: START.x, z: START.z };
const scratch = { x: 0, z: 0 };
let yaw = 0; // 0 looks towards -Z (into the campus); positive turns left
let pitch = 0;
let ground = 0;
let eyeY = EYE_HEIGHT;
let speed = 0;
let turnVelocity = 0;
let bobPhase = 0;
let bobStrength = 0;
let shownPlace = null;

const keys = { forward: false, back: false, left: false, right: false, run: false };

const KEY_MAP = {
  ArrowUp: 'forward', KeyW: 'forward',
  ArrowDown: 'back', KeyS: 'back',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
  ShiftLeft: 'run', ShiftRight: 'run',
};

export function isWalking() {
  return mode !== 'off';
}

/** True once the walker is on foot and steering (not still flying down to the gate). */
export function isWalkReady() {
  return mode === 'on';
}

function walkFov() {
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  return aspect < 1 ? 78 : 66;
}

/** Called on resize: keep the first-person FOV matched to the window shape. */
export function refreshWalkFov() {
  if (mode !== 'on') return;
  camera.fov = walkFov();
  camera.updateProjectionMatrix();
}

function releaseKeys() {
  for (const name of Object.keys(keys)) keys[name] = false;
}

/** Leave the orbit view and fly down to the main gate. */
export function enterWalk() {
  if (mode !== 'off') return;
  mode = 'entering';
  setHoveredBuilding(null);
  releaseKeys();
  pos.x = START.x;
  pos.z = START.z;
  yaw = START.yaw;
  pitch = 0;
  speed = 0;
  turnVelocity = 0;
  bobPhase = 0;
  bobStrength = 0;
  ground = floorHeightAt(pos.x, pos.z);
  eyeY = ground + EYE_HEIGHT;

  appEl.classList.add('is-walking');
  labelsLayer.inert = true;
  walkToggle.setAttribute('aria-pressed', 'true');

  const eye = new THREE.Vector3(pos.x, eyeY, pos.z);
  const ahead = new THREE.Vector3(pos.x - Math.sin(yaw) * 10, eyeY, pos.z - Math.cos(yaw) * 10);
  startCameraFlight(eye, ahead, 1.9, {
    fov: walkFov(),
    handBack: false,
    onDone: () => {
      if (mode !== 'entering') return;
      mode = 'on';
      camera.near = WALK_NEAR;
      camera.updateProjectionMatrix();
      applyCamera(0);
    },
  });
}

/** Back to the orbit overview. Safe to call in any mode. */
export function exitWalk() {
  if (mode === 'off') return;
  mode = 'off';
  releaseKeys();
  showPlace(null);
  appEl.classList.remove('is-walking');
  labelsLayer.inert = false;
  walkToggle.setAttribute('aria-pressed', 'false');
  camera.near = ORBIT_NEAR;
  camera.updateProjectionMatrix();
  // Give the orbit rig a target straight ahead so the flight starts from the current gaze.
  camera.getWorldDirection(controls.target).multiplyScalar(12).add(camera.position);
  controls.target.y = Math.max(controls.target.y, 0.1);
  flyToOverview();
}

export function toggleWalk() {
  if (mode === 'off') enterWalk();
  else exitWalk();
}

/** Feed a key press/release (KeyboardEvent.code). Returns true if walk mode used it. */
export function setWalkKey(code, isDown) {
  const name = KEY_MAP[code];
  if (!name || mode === 'off') return false;
  keys[name] = isDown;
  return true;
}

/** Forget held keys, e.g. when the window loses focus mid-stride. */
export function releaseWalkKeys() {
  releaseKeys();
}

/** Drag-to-look: dragging right pulls the scene right, like the orbit view does. */
export function walkLook(dx, dy) {
  if (mode !== 'on') return;
  yaw += dx * LOOK_SENSITIVITY;
  pitch = THREE.MathUtils.clamp(pitch + dy * LOOK_SENSITIVITY, -MAX_PITCH, MAX_PITCH);
}

function canStandAt(x, z) {
  return floorHeightAt(x, z) - ground <= MAX_STEP_UP;
}

/** Move by (dx, dz), sliding along whatever is in the way. Returns the distance covered. */
function moveBy(dx, dz) {
  const length = Math.hypot(dx, dz);
  if (length < 1e-6) return 0;
  const startX = pos.x;
  const startZ = pos.z;
  const steps = Math.ceil(length / SUBSTEP);
  const sx = dx / steps;
  const sz = dz / steps;
  for (let i = 0; i < steps; i++) {
    // Each axis is tried on its own so a too-tall edge blocks only the motion into it.
    scratch.x = canStandAt(pos.x + sx, pos.z) ? pos.x + sx : pos.x;
    scratch.z = canStandAt(scratch.x, pos.z + sz) ? pos.z + sz : pos.z;
    resolveSolids(scratch, BODY_RADIUS);
    scratch.x = THREE.MathUtils.clamp(scratch.x, LOT.minX, LOT.maxX);
    scratch.z = THREE.MathUtils.clamp(scratch.z, LOT.minZ, LOT.maxZ);
    // Being pushed out of a wall must not lift us onto a ledge we could not climb.
    if (!canStandAt(scratch.x, scratch.z)) break;
    pos.x = scratch.x;
    pos.z = scratch.z;
    ground = floorHeightAt(pos.x, pos.z);
  }
  return Math.hypot(pos.x - startX, pos.z - startZ);
}

function applyCamera(bob) {
  camera.position.set(pos.x, eyeY + bob, pos.z);
  camera.rotation.set(pitch, yaw, 0, 'YXZ');
}

/**
 * Where the first-person camera belongs right now. Lets another view (the album) borrow the
 * camera and fly it back: on arrival updateWalk() takes over from exactly this pose.
 */
export function walkCameraPose() {
  const position = new THREE.Vector3(pos.x, eyeY, pos.z);
  const gaze = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));
  return { position, target: position.clone().addScaledVector(gaze, 10), fov: walkFov() };
}

function showPlace(id) {
  if (id === shownPlace) return;
  shownPlace = id;
  walkPlace.classList.toggle('is-visible', Boolean(id));
  if (!id) return;
  walkPlaceKind.textContent = BUILDINGS[id].kind;
  walkPlaceName.textContent = BUILDINGS[id].name;
}

/**
 * Name the building whose footprint the walker is closest to, if any is near. Pick boxes
 * overlap (the stage sits inside the back block's), so a tie goes to the smaller footprint.
 */
function updatePlace() {
  let nearest = null;
  let nearestDistance = PLACE_RANGE;
  let nearestArea = Infinity;
  for (const id of BUILDING_ORDER) {
    const b = BUILDINGS[id].bounds;
    const distance = Math.hypot(
      Math.max(Math.abs(pos.x - b.x) - b.w / 2, 0),
      Math.max(Math.abs(pos.z - b.z) - b.d / 2, 0),
    );
    const area = b.w * b.d;
    if (distance < nearestDistance || (distance === nearestDistance && area < nearestArea)) {
      nearestDistance = distance;
      nearestArea = area;
      nearest = id;
    }
  }
  showPlace(nearest);
}

/** Per-frame, from animate(): steer, walk, collide and place the camera. */
export function updateWalk(dt) {
  if (mode !== 'on') return;

  const turnInput = (keys.left ? 1 : 0) - (keys.right ? 1 : 0);
  turnVelocity = damp(turnVelocity, turnInput * TURN_SPEED, 14, dt);
  yaw += turnVelocity * dt;

  const moveInput = (keys.forward ? 1 : 0) - (keys.back ? 1 : 0);
  const pace = (keys.run ? RUN_SPEED : WALK_SPEED) * (moveInput < 0 ? BACK_FACTOR : 1);
  speed = damp(speed, moveInput * pace, 9, dt);

  const travelled = Math.abs(speed) > 0.01
    ? moveBy(-Math.sin(yaw) * speed * dt, -Math.cos(yaw) * speed * dt)
    : 0;

  // Head bob follows real ground covered, so it stops when you are pressed against a wall.
  const moving = travelled > 0.2 * dt;
  bobStrength = damp(bobStrength, moving && !reducedMotion.matches ? 1 : 0, 8, dt);
  bobPhase += travelled * 4.2;
  const bob = Math.sin(bobPhase) * 0.032 * bobStrength;

  eyeY = damp(eyeY, ground + EYE_HEIGHT, 11, dt);
  applyCamera(bob);
  updatePlace();
}

/**
 * Development aid: put the walker somewhere at once (no flight), e.g. to check a view.
 * Used by the `?walk=x,z,yawDegrees` URL parameter in dev builds.
 */
export function teleportWalker(x, z, yawRadians = 0, pitchRadians = 0) {
  if (mode === 'off') enterWalk();
  mode = 'on';
  pos.x = x;
  pos.z = z;
  yaw = yawRadians;
  pitch = pitchRadians;
  ground = floorHeightAt(x, z);
  eyeY = ground + EYE_HEIGHT;
  camera.near = WALK_NEAR;
  camera.fov = walkFov();
  camera.updateProjectionMatrix();
  applyCamera(0);
}
