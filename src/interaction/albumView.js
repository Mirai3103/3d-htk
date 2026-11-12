/**
 * Reading the souvenir album: the "open" prompt floating over it, and the reading view that
 * borrows the camera — it flies in over the table, the album opens, pages turn by drag, tap,
 * button or arrow key, and closing flies the camera back to where it was (orbit or on foot).
 * A tap on a page's photo shows that photo large instead, in the #album-photo overlay.
 *
 * While the view is active (isAlbumActive) nothing else may drive the camera: animate() skips
 * the orbit controls and the walker, and input.js routes pointer and keys here.
 */

import * as THREE from 'three';
import {
  albumLive,
  albumNext,
  albumPage,
  albumPhoto,
  albumPhotoCaption,
  albumPhotoClose,
  albumPhotoImage,
  albumPhotoStatus,
  albumPrev,
  albumPrompt,
  albumUi,
  appEl,
} from '../core/dom.js';
import { camera, controls, pointerNdc, raycaster, renderer } from '../core/engine.js';
import {
  albumPageUnder,
  albumPhotoUnder,
  albumSpread,
  dragAlbumPage,
  flipAlbum,
  getAlbumFrame,
  grabAlbumPage,
  releaseAlbumPage,
  setAlbumOpen,
} from '../campus/album.js';
import { ALBUM_ITEMS } from '../data/album.js';
import { albumPhotoUrl } from '../textures/album.js';
import { isCameraFlying, lookQuaternion, startCameraFlight } from './cameraRig.js';
import { cameraReturnPose, flyCameraBack, isCameraInReach, updatePrompt } from './closeUp.js';
import { closeDialogue } from './dialogue.js';
import { setHoveredBuilding } from './hover.js';
import { isWalking, isWalkReady, releaseWalkKeys } from './walk.js';

const READ_FOV = 40;
// Screen space (px) the open album stays clear of: the header, the page bar, the window edges.
const HEADER_ROOM = 92;
const BAR_ROOM = 112;
const EDGE = 16;
// On a very short window the album keeps this share of the height and slips under them instead.
const MIN_SHARE = 0.6;
const FLY_IN = 1.25;
const FLY_OUT = 1.1;
// The cover starts to open once the camera is on its way.
const OPEN_DELAY = 0.45;
// From how far the album can be opened: on foot, and in the orbit views.
const WALK_REACH = 4.5;
const ORBIT_REACH = 48;
// A press this short (ms) that stays put is a tap: on a photo it shows the photo large (the
// longer limit), anywhere else on a page it turns the sheet.
const TAP_MS = 320;
const PHOTO_TAP_MS = 700;
const TAP_TRAVEL = 7;
// The overlay ignores clicks for this long (ms) after it appears: the tap that opened it.
const PHOTO_GUARD_MS = 350;

/** 'closed' → 'opening' (flying in) → 'open' → 'closing' (flying back) → 'closed'. */
let state = 'closed';
let openTimer = 0;
/** Where the camera goes back to (closeUp.js). */
let returnPose = null;
let shownSpread = '';
let pointer = null;
/** Page number (1-based) of the photo shown large; 0 when none is. */
let shownPhoto = 0;
let photoShownAt = 0;

const center = new THREE.Vector3();
const front = new THREE.Vector3();

/** True from the moment the album is opened until the camera is back: the view owns the camera. */
export function isAlbumActive() {
  return state !== 'closed';
}

/**
 * The reading view, fitted to the window: the camera hangs straight above the open album and
 * looks down square on the pages, so they show as true rectangles, as large as the space
 * between the header and the page bar allows. `up` is the top of the picture: the far edge of
 * the pages, away from the reader.
 */
function readingPose() {
  const frame = getAlbumFrame(center, front);
  const width = window.innerWidth;
  const height = Math.max(1, window.innerHeight);
  const clear = Math.max(height - HEADER_ROOM - BAR_ROOM - EDGE * 2, height * MIN_SHARE);
  // Screen pixels per metre of album.
  const scale = Math.min((width - EDGE * 2) / frame.width, clear / frame.height);
  const distance = height / (2 * Math.tan(THREE.MathUtils.degToRad(READ_FOV) / 2) * scale);
  const up = front.clone().negate();
  // Slide along the page so the album sits midway between the header and the page bar.
  const target = center.clone().addScaledVector(up, (HEADER_ROOM - BAR_ROOM) / 2 / scale);
  const position = target.clone();
  position.y += distance;
  return { position, target, up };
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
  if (shown.length === 2) albumPage.textContent = `Trang ${shown[0]}–${shown[1]} / ${total}`;
  else if (shown.length === 1) albumPage.textContent = `Trang ${shown[0]} / ${total}`;
  else albumPage.textContent = 'Hết album';
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
  closeDialogue();
  setHoveredBuilding(null);
  releaseWalkKeys();
  returnPose = cameraReturnPose();

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
    turn: true,
    up: pose.up,
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
  closeAlbumPhoto();
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
  flyCameraBack(returnPose, FLY_OUT, () => {
    if (state === 'closing') state = 'closed';
  }, { turn: true });
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
  return isCameraInReach(center, WALK_REACH, ORBIT_REACH);
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
  const ray = rayAt(event);
  const photo = albumPhotoUnder(ray);
  if (!grabAlbumPage(ray)) return;
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, time: event.timeStamp, photo };
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
  renderer.domElement.style.cursor = albumPhotoUnder(ray) ? 'zoom-in' : albumPageUnder(ray) ? 'grab' : 'default';
}

/** The pointer let go, or (`cancelled`) the browser took it away: then nothing was tapped. */
export function albumPointerUp(event, { cancelled = false } = {}) {
  if (!pointer || pointer.id !== event.pointerId) return;
  const still = !cancelled && Math.hypot(event.clientX - pointer.x, event.clientY - pointer.y) < TAP_TRAVEL;
  // When the pointer moved, not when the frame got round to it: a slow frame is not a long press.
  const held = event.timeStamp - pointer.time;
  const { photo } = pointer;
  pointer = null;
  renderer.domElement.style.cursor = 'grab';
  // A tap on a photo shows it large and leaves the page where it lies.
  if (still && held < PHOTO_TAP_MS && photo && showAlbumPhoto(photo)) {
    releaseAlbumPage(false);
    return;
  }
  releaseAlbumPage(still && held < TAP_MS);
}

// ---- A photo shown large -------------------------------------------------------------------

/** True while a photo is shown large over the album: it then takes the keys and the pointer. */
export function isAlbumPhotoShown() {
  return shownPhoto > 0;
}

/**
 * Show the photo of page `pageNum` large, with its caption. Returns false when that page has
 * no picture to show (none, still loading, or it failed).
 */
function showAlbumPhoto(pageNum) {
  const item = ALBUM_ITEMS[pageNum - 1];
  const url = albumPhotoUrl(item);
  if (!url) return false;
  shownPhoto = pageNum;
  photoShownAt = performance.now();
  albumPhoto.classList.remove('is-loaded', 'is-failed');
  albumPhotoStatus.textContent = 'Đang tải ảnh…';
  albumPhotoCaption.textContent = item.description ? `“${item.description}”` : '';
  albumPhotoImage.alt = item.description || `Ảnh kỷ niệm trang ${pageNum}`;
  albumPhotoImage.src = url;
  albumPhoto.hidden = false;
  albumPhotoClose.focus({ preventScroll: true });
  // The page only holds a small copy; the full picture comes back from the browser's cache.
  albumPhotoImage.decode().then(
    () => {
      if (shownPhoto !== pageNum) return;
      albumPhotoStatus.textContent = '';
      albumPhoto.classList.add('is-loaded');
    },
    () => {
      if (shownPhoto !== pageNum) return;
      albumPhotoStatus.textContent = 'Không tải được ảnh này.';
      albumPhoto.classList.add('is-failed');
    },
  );
  return true;
}

/** Put the large photo away and go back to the pages. */
export function closeAlbumPhoto() {
  if (!shownPhoto) return;
  shownPhoto = 0;
  if (albumPhoto.contains(document.activeElement)) document.activeElement.blur();
  albumPhoto.hidden = true;
  albumPhotoImage.removeAttribute('src');
  albumPhotoStatus.textContent = '';
}

/** A click on the overlay: anywhere but on the picture itself puts it away. */
export function albumPhotoClick(event) {
  if (event.target === albumPhotoImage) return;
  if (performance.now() - photoShownAt < PHOTO_GUARD_MS) return;
  closeAlbumPhoto();
}

/** Called on resize: keep the open album framed. */
export function refreshAlbumView() {
  if (state !== 'open') return;
  const pose = readingPose();
  camera.position.copy(pose.position);
  controls.target.copy(pose.target);
  camera.fov = READ_FOV;
  camera.updateProjectionMatrix();
  camera.quaternion.copy(lookQuaternion(pose.position, pose.target, pose.up));
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
  // The "open" prompt floats just above the closed album.
  center.y += 0.16;
  updatePrompt(albumPrompt, center, state === 'closed', WALK_REACH, ORBIT_REACH);
}
