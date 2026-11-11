/**
 * Reading the souvenir album: the "open" prompt floating over it, and the reading view that
 * borrows the camera — it flies in over the table, the album opens, pages turn by drag, tap,
 * button or arrow key, and closing flies the camera back to where it was (orbit or on foot).
 *
 * While the view is active (isAlbumActive) nothing else may drive the camera: animate() skips
 * the orbit controls and the walker, and input.js routes pointer and keys here.
 */

import * as THREE from 'three';
import {
  albumLive,
  albumNext,
  albumPage,
  albumPrev,
  albumPrompt,
  albumUi,
  appEl,
  labelsLayer,
} from '../core/dom.js';
import { camera, controls, pointerNdc, raycaster, renderer } from '../core/engine.js';
import {
  albumPageUnder,
  albumSpread,
  dragAlbumPage,
  flipAlbum,
  getAlbumFrame,
  grabAlbumPage,
  releaseAlbumPage,
  setAlbumOpen,
} from '../campus/album.js';
import { ALBUM_ITEMS } from '../data/album.js';
import { isCameraFlying, startCameraFlight } from './cameraRig.js';
import { closeDialogue } from './dialogue.js';
import { setHoveredBuilding } from './hover.js';
import { closePanel } from './panel.js';
import { isWalking, isWalkReady, releaseWalkKeys, walkCameraPose } from './walk.js';

const READ_FOV = 40;
// The camera leans over the table like a reader, this far from straight down.
const TILT = 0.5;
const FLY_IN = 1.25;
const FLY_OUT = 1.1;
// The cover starts to open once the camera is on its way.
const OPEN_DELAY = 0.45;
// From how far the album can be opened: on foot, and in the orbit views.
const WALK_REACH = 4.5;
const ORBIT_REACH = 48;
const EDGE_MARGIN = 10;

/** 'closed' → 'opening' (flying in) → 'open' → 'closing' (flying back) → 'closed'. */
let state = 'closed';
let openTimer = 0;
/** Where the camera goes back to: an orbit pose, or `walk: true` for the walker's eyes. */
let returnPose = null;
let shownSpread = '';
let pointer = null;

const center = new THREE.Vector3();
const front = new THREE.Vector3();
const projected = new THREE.Vector3();

/** True from the moment the album is opened until the camera is back: the view owns the camera. */
export function isAlbumActive() {
  return state !== 'closed';
}

/** Camera position and target for reading, fitted to the window. */
function readingPose() {
  const frame = getAlbumFrame(center, front);
  const aspect = window.innerWidth / Math.max(1, window.innerHeight);
  const half = Math.tan(THREE.MathUtils.degToRad(READ_FOV) / 2);
  // Room for the page bar below and the header above on tall, narrow screens.
  const fitHeight = (frame.height * (aspect < 1 ? 0.62 : 0.74)) / half;
  const fitWidth = (frame.width * 0.56) / (half * aspect);
  const distance = Math.max(fitHeight, fitWidth);
  const position = center.clone()
    .addScaledVector(front, Math.sin(TILT) * distance)
    .add(new THREE.Vector3(0, Math.cos(TILT) * distance, 0));
  return { position, target: center.clone() };
}

function describe(pageNum) {
  return pageNum ? ALBUM_ITEMS[pageNum - 1]?.description ?? '' : '';
}

/** Page counter, button states and the captions read out to screen readers. */
function refreshUi() {
  const { left, right, total, canPrev, canNext } = albumSpread();
  const key = `${left}|${right}`;
  if (key === shownSpread) return;
  shownSpread = key;
  const shown = [left, right].filter((pageNum) => pageNum && pageNum <= total);
  if (shown.length === 2) albumPage.textContent = `Pages ${shown[0]}–${shown[1]} of ${total}`;
  else if (shown.length === 1) albumPage.textContent = `Page ${shown[0]} of ${total}`;
  else albumPage.textContent = 'The end';
  albumPrev.disabled = !canPrev;
  albumNext.disabled = !canNext;
  albumLive.textContent = shown.map(describe).filter(Boolean).join(' ');
}

/**
 * Open the album: fly the camera over it, then swing the cover open. Does nothing while
 * another camera flight is under way.
 */
export function openAlbum() {
  if (state !== 'closed' || isCameraFlying()) return;
  if (isWalking() && !isWalkReady()) return;
  closePanel({ fly: false });
  closeDialogue();
  setHoveredBuilding(null);
  releaseWalkKeys();
  returnPose = isWalking()
    ? { walk: true }
    : { walk: false, position: camera.position.clone(), target: controls.target.clone() };

  state = 'opening';
  openTimer = OPEN_DELAY;
  shownSpread = '';
  appEl.classList.add('is-reading');
  albumPrompt.hidden = true;
  albumUi.hidden = false;
  refreshUi();
  renderer.domElement.style.cursor = 'default';
  const pose = readingPose();
  startCameraFlight(pose.position, pose.target, FLY_IN, {
    fov: READ_FOV,
    handBack: false,
    onDone: () => {
      if (state === 'opening') state = 'open';
    },
  });
}

/**
 * Close the album. By default the camera flies back to where it was; pass `fly: false` when
 * the caller is about to send it somewhere else (overview, a building, walk mode).
 */
export function closeAlbum({ fly = true } = {}) {
  if (state === 'closed') return;
  const hadFocus = albumUi.contains(document.activeElement);
  setAlbumOpen(false);
  pointer = null;
  appEl.classList.remove('is-reading');
  albumUi.hidden = true;
  albumLive.textContent = '';
  if (hadFocus) document.activeElement.blur();
  renderer.domElement.style.cursor = 'grab';
  if (!fly) {
    state = 'closed';
    return;
  }
  state = 'closing';
  const done = () => {
    if (state === 'closing') state = 'closed';
  };
  if (returnPose.walk) {
    const pose = walkCameraPose();
    startCameraFlight(pose.position, pose.target, FLY_OUT, { fov: pose.fov, handBack: false, onDone: done });
  } else {
    startCameraFlight(returnPose.position, returnPose.target, FLY_OUT, { onDone: done });
  }
}

/** Turn to the next (+1) or previous (-1) spread. */
export function turnAlbumPage(direction) {
  if (state === 'open' || state === 'opening') flipAlbum(direction);
}

/** Can the album be opened with the keyboard right now? True while its prompt is showing. */
export function isAlbumInReach() {
  return !albumPrompt.hidden;
}

/** Is the camera close enough for a click on the album to count? (orbit views) */
export function canPickAlbum() {
  if (state !== 'closed' || !getAlbumFrame(center, front)) return false;
  return camera.position.distanceTo(center) <= (isWalking() ? WALK_REACH : ORBIT_REACH);
}

// ---- Pointer: drag or tap a page -----------------------------------------------------------

function rayAt(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointerNdc.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  );
  raycaster.setFromCamera(pointerNdc, camera);
  return raycaster.ray;
}

export function albumPointerDown(event) {
  if (state !== 'open' || pointer) return;
  if (event.pointerType === 'mouse' && event.button !== 0) return;
  if (!grabAlbumPage(rayAt(event))) return;
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: performance.now() };
  renderer.domElement.setPointerCapture(event.pointerId);
  renderer.domElement.style.cursor = 'grabbing';
}

export function albumPointerMove(event) {
  if (state !== 'open') return;
  const ray = rayAt(event);
  if (pointer) {
    if (pointer.id === event.pointerId) dragAlbumPage(ray);
    return;
  }
  renderer.domElement.style.cursor = albumPageUnder(ray) ? 'grab' : 'default';
}

export function albumPointerUp(event) {
  if (!pointer || pointer.id !== event.pointerId) return;
  const moved = Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y);
  const wasTap = moved < 7 && performance.now() - pointer.time < 320;
  pointer = null;
  releaseAlbumPage(wasTap);
  renderer.domElement.style.cursor = 'grab';
}

/** Called on resize: keep the open album framed. */
export function refreshAlbumView() {
  if (state !== 'open') return;
  const pose = readingPose();
  camera.position.copy(pose.position);
  controls.target.copy(pose.target);
  camera.fov = READ_FOV;
  camera.updateProjectionMatrix();
  camera.lookAt(pose.target);
}

/** Put `element` above the projected point, kept inside the window. */
function place(element, x, y) {
  const half = element.offsetWidth / 2;
  const left = THREE.MathUtils.clamp(x, half + EDGE_MARGIN, Math.max(half + EDGE_MARGIN, window.innerWidth - half - EDGE_MARGIN));
  const top = Math.max(y, element.offsetHeight + EDGE_MARGIN);
  element.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0) translate(-50%, -100%)`;
}

/** Per-frame, from animate(), after the camera has been moved. */
export function updateAlbumView(dt) {
  if (state === 'opening' || state === 'open') {
    if (openTimer > 0) {
      openTimer -= dt;
      if (openTimer <= 0) setAlbumOpen(true);
    }
    refreshUi();
    return;
  }
  if (!getAlbumFrame(center, front)) return;

  // The "open" prompt: near the album on foot; in the orbit views once the camera is close
  // (and the Labels switch is on).
  const walking = isWalking();
  const distance = camera.position.distanceTo(center);
  camera.updateMatrixWorld();
  projected.copy(center);
  projected.y += 0.16;
  projected.project(camera);
  const onScreen =
    projected.z > -1 && projected.z < 1 &&
    Math.abs(projected.x) < 1.02 && projected.y > -1.05 && projected.y < 1.02;
  const show = state === 'closed' && onScreen && (walking
    ? isWalkReady() && distance <= WALK_REACH
    : distance <= ORBIT_REACH && !labelsLayer.classList.contains('is-hidden'));
  if (albumPrompt.hidden === show) albumPrompt.hidden = !show;
  if (show) {
    place(
      albumPrompt,
      (projected.x * 0.5 + 0.5) * window.innerWidth,
      (-projected.y * 0.5 + 0.5) * window.innerHeight,
    );
  }
}
