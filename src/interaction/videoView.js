/**
 * Watching the memory video: the "watch" prompt floating over the screen, and the watching
 * view that borrows the camera — it flies in until the screen faces the viewer squarely, an
 * HTML <video> is laid exactly over the screen's picture and plays (native controls: seek,
 * volume, full screen), and closing flies the camera back to where it was (orbit or on foot).
 *
 * The video is plain HTML rather than a texture so that any address plays, including hosts
 * that do not allow cross-origin use and a build opened straight from disk.
 *
 * While the view is active (isVideoActive) nothing else may drive the camera, as with the
 * album: animate() skips the orbit controls and the walker, and input.js routes keys here.
 */

import * as THREE from 'three';
import {
  appEl,
  memoryVideo,
  videoFrame,
  videoPrompt,
  videoStatus,
  videoUi,
} from '../core/dom.js';
import { camera, controls, renderer } from '../core/engine.js';
import { getMemoryScreenFrame } from '../campus/memoryScreen.js';
import { MEMORY_VIDEO } from '../data/video.js';
import { isCameraFlying, startCameraFlight } from './cameraRig.js';
import { cameraReturnPose, flyCameraBack, isCameraInReach, updatePrompt } from './closeUp.js';
import { closeDialogue } from './dialogue.js';
import { setHoveredBuilding } from './hover.js';
import { isWalking, isWalkReady, releaseWalkKeys } from './walk.js';

const WATCH_FOV = 40;
// Narrow windows widen the lens instead of backing the camera away through the booth.
const MAX_FOV = 80;
const MAX_DISTANCE = 3.2;
const FLY_IN = 1.15;
const FLY_OUT = 1.0;
// From how far the video can be started: on foot, and in the orbit views.
const WALK_REACH = 5;
const ORBIT_REACH = 48;
// Window space kept free around the picture, in pixels: top edge, control bar, sides.
const TOP_ROOM = 16;
const BOTTOM_ROOM = 118;
const SIDE_ROOM = 14;

/** 'closed' → 'opening' (flying in) → 'open' → 'closing' (flying back) → 'closed'. */
let state = 'closed';
/** Where the camera goes back to (closeUp.js). */
let returnPose = null;
let sourceSet = false;

const center = new THREE.Vector3();
const normal = new THREE.Vector3();

/** True from the moment the video is opened until the camera is back: the view owns the camera. */
export function isVideoActive() {
  return state !== 'closed';
}

/**
 * The camera pose that shows the screen squarely, fitted to the free part of the window, and
 * the rectangle (in CSS pixels) its picture then covers.
 */
function watchingPose() {
  const { width, height } = getMemoryScreenFrame(center, normal);
  const roomW = Math.max(160, window.innerWidth - SIDE_ROOM * 2);
  const roomH = Math.max(90, window.innerHeight - TOP_ROOM - BOTTOM_ROOM);
  const pxPerMetre = Math.min(roomW / width, roomH / height);
  // The window is innerHeight / pxPerMetre metres tall at the screen: that sets the distance.
  const tall = window.innerHeight / pxPerMetre;
  let half = Math.tan(THREE.MathUtils.degToRad(WATCH_FOV) / 2);
  if (tall / (2 * half) > MAX_DISTANCE) {
    half = Math.min(tall / (2 * MAX_DISTANCE), Math.tan(THREE.MathUtils.degToRad(MAX_FOV) / 2));
  }
  const distance = tall / (2 * half);
  // Sliding the camera in the screen's own plane keeps the picture a true rectangle; it
  // moves the picture to the middle of the free room above the bar.
  const rectW = width * pxPerMetre;
  const rectH = height * pxPerMetre;
  const middleY = TOP_ROOM + roomH / 2;
  const lift = (middleY - window.innerHeight / 2) / pxPerMetre;
  const target = center.clone();
  target.y += lift;
  return {
    position: target.clone().addScaledVector(normal, distance),
    target,
    fov: THREE.MathUtils.radToDeg(Math.atan(half)) * 2,
    rect: { left: (window.innerWidth - rectW) / 2, top: middleY - rectH / 2, width: rectW, height: rectH },
  };
}

function layoutFrame(rect) {
  // A pixel of overlap hides the title card's edge behind the video.
  videoFrame.style.left = `${Math.floor(rect.left) - 1}px`;
  videoFrame.style.top = `${Math.floor(rect.top) - 1}px`;
  videoFrame.style.width = `${Math.ceil(rect.width) + 2}px`;
  videoFrame.style.height = `${Math.ceil(rect.height) + 2}px`;
}

function setStatus(text) {
  videoStatus.textContent = text;
  videoStatus.hidden = !text;
}

function play() {
  // Refused autoplay or a failed load is not an error here: the controls and the status
  // line take it from there.
  memoryVideo.play()?.catch(() => {});
}

/**
 * Watch the video: fly the camera in front of the screen, then lay the video over it and
 * play. Does nothing while another camera flight is under way.
 */
export function openVideo() {
  if (state !== 'closed' || isCameraFlying()) return;
  if (isWalking() && !isWalkReady()) return;
  closeDialogue();
  setHoveredBuilding(null);
  releaseWalkKeys();
  returnPose = cameraReturnPose();

  state = 'opening';
  appEl.classList.add('is-watching');
  videoPrompt.hidden = true;
  videoUi.hidden = false;
  renderer.domElement.style.cursor = 'default';

  // The file is only asked for now, on the first visit to the screen.
  if (!sourceSet) {
    sourceSet = true;
    memoryVideo.src = MEMORY_VIDEO.src;
  }
  if (memoryVideo.error) memoryVideo.load();
  setStatus(memoryVideo.readyState >= 2 ? '' : 'Đang tải video…');
  // Browsers only let a video with sound start from a click or a key press, so it is started
  // right here and held until the camera has arrived.
  memoryVideo.play()?.then(() => {
    if (state !== 'open') memoryVideo.pause();
  }).catch(() => {});

  const pose = watchingPose();
  startCameraFlight(pose.position, pose.target, FLY_IN, {
    fov: pose.fov,
    handBack: false,
    onDone: () => {
      if (state !== 'opening') return;
      state = 'open';
      layoutFrame(pose.rect);
      videoFrame.hidden = false;
      play();
    },
  });
}

/**
 * Stop watching. By default the camera flies back to where it was; pass `fly: false` when
 * the caller is about to send it somewhere else (overview, a building, walk mode).
 */
export function closeVideo({ fly = true } = {}) {
  if (state === 'closed') return;
  const hadFocus = videoUi.contains(document.activeElement) || videoFrame.contains(document.activeElement);
  memoryVideo.pause();
  videoFrame.hidden = true;
  videoUi.hidden = true;
  appEl.classList.remove('is-watching');
  if (hadFocus) document.activeElement.blur();
  renderer.domElement.style.cursor = 'grab';
  if (!fly) {
    state = 'closed';
    return;
  }
  state = 'closing';
  flyCameraBack(returnPose, FLY_OUT, () => {
    if (state === 'closing') state = 'closed';
  });
}

/**
 * Keys while watching: Esc closes, Space plays or pauses. Keys aimed at the video itself or
 * at a button are left to them.
 */
export function videoKeyDown(event) {
  if (event.key === 'Escape') {
    closeVideo();
  } else if (event.code === 'Space' && state === 'open') {
    if (event.target === memoryVideo || event.target instanceof HTMLButtonElement) return;
    if (memoryVideo.paused) play();
    else memoryVideo.pause();
    event.preventDefault();
  }
}

/** Can the video be started with the keyboard right now? True while its prompt is showing. */
export function isVideoInReach() {
  return !videoPrompt.hidden;
}

/** Is the camera close enough for a click on the screen to count? */
export function canPickVideo() {
  if (state !== 'closed' || !getMemoryScreenFrame(center, normal)) return false;
  return isCameraInReach(center, WALK_REACH, ORBIT_REACH);
}

/** Called on resize: keep the screen framed and the video on it. */
export function refreshVideoView() {
  if (state !== 'open') return;
  const pose = watchingPose();
  camera.position.copy(pose.position);
  controls.target.copy(pose.target);
  camera.fov = pose.fov;
  camera.updateProjectionMatrix();
  camera.lookAt(pose.target);
  layoutFrame(pose.rect);
}

/** Attach the video element's own listeners. Call once. */
export function initVideoView() {
  memoryVideo.addEventListener('waiting', () => setStatus('Đang tải video…'));
  for (const type of ['playing', 'canplay', 'seeked']) {
    memoryVideo.addEventListener(type, () => setStatus(''));
  }
  memoryVideo.addEventListener('error', () => setStatus('Không tải được video.'));
}

/** Per-frame, from animate(), after the camera has been moved. */
export function updateVideoView() {
  if (state === 'opening' || state === 'open') return;
  if (!getMemoryScreenFrame(center, normal)) return;
  // The "watch" prompt floats over the top edge of the screen.
  center.y += 0.8;
  updatePrompt(videoPrompt, center, state === 'closed', WALK_REACH, ORBIT_REACH);
}
