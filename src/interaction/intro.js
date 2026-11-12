/**
 * The opening shot: one continuous camera move that plays once the loader lifts. It starts high
 * above the street, swings down to the main gate, passes over the gate leaves under the name
 * board and settles in front of the Teachers' Day corner, where the orbit controls take over.
 *
 * While it plays `#app` has the class `is-intro` (set in index.html so the UI never flashes
 * under the loader): the header, buttons, labels and prompts are hidden, the title card and
 * the letterbox bars are shown, and a click, tap, Esc, Enter or Space skips to the end.
 * Nothing else may drive the camera until isIntroPlaying() is false.
 */

import * as THREE from 'three';
import { appEl, introEl } from '../core/dom.js';
import { camera, controls } from '../core/engine.js';
import { BUILDINGS } from '../data/buildings.js';
import { buildingView, updateResponsiveFov } from './cameraRig.js';

// The flight, as timed keys (seconds; camera position; point looked at). The last key, the
// Teachers' Day view, is appended at start because it depends on the window shape.
// Key 3 threads the portal: the opening is 6 m wide, between the top of the closed gate
// leaves (2.8 m) and the underside of the name board's beam (6.1 m).
const PATH = [
  { t: 0, position: [62, 40, 86], look: [4, 3, 2] },
  { t: 3.4, position: [30, 22, 72], look: [0, 3, 14] },
  { t: 6.2, position: [5, 8.5, 51], look: [0, 5.4, 30] },
  { t: 8.1, position: [0, 4.4, 30.6], look: [-3.5, 3.0, 12] },
];
const SETTLE = 2.9; // seconds from the portal to the final pose
const LEAD_IN = 0.45; // held on the first frame while the loader fades
const START_DRIFT = 0.3; // share of cruising speed the move opens with
const TITLE_FROM = 0.5;
const TITLE_UNTIL = 5.4;
const CUT = 0.34; // skipping dips to black for this long, then cuts to the final pose

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let playing = false;
let frozen = false;
let time = 0;
let cutClock = -1; // >= 0 once a skip was asked for
let keys = [];

const position = new THREE.Vector3();
const look = new THREE.Vector3();

export function isIntroPlaying() {
  return playing;
}

/** Keys with their velocities: a finite difference through each key, at rest on the last. */
function buildKeys() {
  const end = buildingView(BUILDINGS.teachersDay);
  const list = PATH.map((key) => ({
    t: key.t,
    position: new THREE.Vector3(...key.position),
    look: new THREE.Vector3(...key.look),
  }));
  list.push({ t: list[list.length - 1].t + SETTLE, position: end.position, look: end.target });
  for (const field of ['position', 'look']) {
    const velocity = `${field}Velocity`;
    list.forEach((key, i) => {
      const before = list[i - 1];
      const after = list[i + 1];
      key[velocity] = new THREE.Vector3();
      if (before && after) {
        key[velocity].subVectors(after[field], before[field]).divideScalar(after.t - before.t);
      } else if (after) {
        key[velocity].subVectors(after[field], key[field]).multiplyScalar(START_DRIFT / (after.t - key.t));
      }
    });
  }
  return list;
}

/** Cubic Hermite through the keys: position and velocity are continuous across every key. */
function sample(field, at, out) {
  let i = 0;
  while (i < keys.length - 2 && at > keys[i + 1].t) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const span = b.t - a.t;
  const s = THREE.MathUtils.clamp((at - a.t) / span, 0, 1);
  const s2 = s * s;
  const s3 = s2 * s;
  const velocity = `${field}Velocity`;
  return out.copy(a[field]).multiplyScalar(2 * s3 - 3 * s2 + 1)
    .addScaledVector(a[velocity], (s3 - 2 * s2 + s) * span)
    .addScaledVector(b[field], 3 * s2 - 2 * s3)
    .addScaledVector(b[velocity], (s3 - s2) * span);
}

function applyCamera(at) {
  sample('position', at, position);
  sample('look', at, look);
  camera.position.copy(position);
  controls.target.copy(look);
  camera.lookAt(look);
}

function duration() {
  return keys[keys.length - 1].t;
}

/** Land on the final pose and give the scene back to the orbit controls and the UI. */
function finish() {
  playing = false;
  frozen = false;
  cutClock = -1;
  updateResponsiveFov();
  applyCamera(duration());
  controls.enabled = true;
  controls.update(0.0001);
  introEl.classList.remove('is-titled', 'is-cutting');
  appEl.classList.remove('is-intro');
}

/**
 * Call once from boot(), when the scene is ready to be shown. `play: false` (or a visitor who
 * asked for reduced motion, or `?intro=off`) goes straight to the final pose. Dev only:
 * `?intro=<seconds>` holds the shot at that moment, to check a frame of the flight.
 */
export function startIntro({ play = true } = {}) {
  const param = new URLSearchParams(window.location.search).get('intro');
  keys = buildKeys();
  if (!play || reducedMotion.matches || param === 'off') {
    finish();
    return;
  }
  playing = true;
  controls.enabled = false;
  time = -LEAD_IN;
  if (import.meta.env.DEV && param !== null && Number.isFinite(Number(param))) {
    time = Number(param);
    frozen = true;
  }
  updateResponsiveFov();
  applyCamera(Math.max(time, 0));
}

/** Skip the rest: a short dip to black hides the cut to the final pose. */
export function skipIntro() {
  if (!playing || cutClock >= 0) return;
  cutClock = 0;
  introEl.classList.add('is-cutting');
}

/** Per frame, from animate(), while isIntroPlaying(). */
export function updateIntro(dt) {
  if (!playing) return;
  if (cutClock >= 0) {
    cutClock += dt;
    if (cutClock >= CUT) {
      finish();
      return;
    }
  }
  if (!frozen) time += dt;
  if (time >= duration()) {
    finish();
    return;
  }
  applyCamera(Math.max(time, 0));
  introEl.classList.toggle('is-titled', cutClock < 0 && time > TITLE_FROM && time < TITLE_UNTIL);
}
