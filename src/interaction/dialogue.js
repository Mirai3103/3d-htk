/**
 * Talking to the courtyard teacher: the "talk" prompt floating over her head while she is
 * silent, and the speech bubble that shows her lines one short passage at a time (typed out,
 * a click or tap moves on). Both are HTML, projected from her 3D anchor every frame.
 */

import * as THREE from 'three';
import {
  labelsLayer,
  npcBubble,
  npcBubbleLive,
  npcBubbleMore,
  npcBubbleName,
  npcBubbleNext,
  npcBubbleRest,
  npcBubbleStep,
  npcBubbleTyped,
  npcPrompt,
} from '../core/dom.js';
import { camera } from '../core/engine.js';
import { getTeacherAnchor, setTeacherTalking } from '../campus/teacher.js';
import { TEACHER } from '../data/teacher.js';
import { isCameraFlying, startCameraFlight } from './cameraRig.js';
import { isWalking } from './walk.js';

const CHARS_PER_SECOND = 46;
// On foot she can be addressed from this far; walking further away ends the conversation.
const WALK_REACH = 12;
const WALK_LEAVE = 15;
// Orbit views: zooming out this far ends it.
const ORBIT_LEAVE = 45;
const EDGE_MARGIN = 10;

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const lines = TEACHER.lines.map((line) => line.normalize('NFC'));

/** Index of the line being spoken, or -1 while she is silent. */
let lineIndex = -1;
let typed = 0;
let shownChars = -1;

const anchor = new THREE.Vector3();
const projected = new THREE.Vector3();

export function isTalking() {
  return lineIndex >= 0;
}

function renderTyped() {
  const line = lines[lineIndex];
  const count = Math.min(line.length, Math.floor(typed));
  if (count === shownChars) return;
  shownChars = count;
  npcBubbleTyped.textContent = line.slice(0, count);
  // The untyped remainder stays in the layout (invisible) so the bubble never changes size.
  npcBubbleRest.textContent = line.slice(count);
  npcBubble.classList.toggle('is-typing', count < line.length);
}

function showLine() {
  const line = lines[lineIndex];
  const last = lineIndex === lines.length - 1;
  npcBubbleStep.textContent = `${lineIndex + 1} / ${lines.length}`;
  npcBubbleMore.textContent = last ? 'Xong' : 'Tiếp';
  npcBubbleNext.setAttribute('aria-label', last ? 'Kết thúc trò chuyện' : 'Tiếp tục');
  npcBubbleLive.textContent = line;
  typed = reducedMotion.matches ? line.length : 0;
  shownChars = -1;
  renderTyped();
}

/** Camera position for a face-to-face view in the orbit modes. */
function flyToTeacher() {
  const portrait = window.innerWidth < window.innerHeight;
  const distance = portrait ? 8.6 : 7.3;
  const front = new THREE.Vector3(Math.sin(TEACHER.yaw), 0, Math.cos(TEACHER.yaw));
  const target = new THREE.Vector3(TEACHER.x, 1.75, TEACHER.z);
  const position = target.clone().addScaledVector(front, distance);
  position.x += front.z * 1.1;
  position.z -= front.x * 1.1;
  position.y = 2.7;
  startCameraFlight(position, target, 1.3);
}

/**
 * Speak to her. The first call opens the conversation (and, outside walk mode, flies in for
 * a closer look); later calls finish the line being typed, then move to the next one, and
 * close the bubble after the last.
 */
export function talkToTeacher() {
  if (lineIndex < 0) {
    lineIndex = 0;
    npcBubbleName.textContent = TEACHER.name;
    setTeacherTalking(true);
    showLine();
    if (!isWalking()) flyToTeacher();
    return;
  }
  if (typed < lines[lineIndex].length) {
    typed = lines[lineIndex].length;
    renderTyped();
    return;
  }
  if (lineIndex < lines.length - 1) {
    lineIndex += 1;
    showLine();
    return;
  }
  closeDialogue();
}

export function closeDialogue() {
  if (lineIndex < 0) return;
  // Keep keyboard focus somewhere sensible if it was on the bubble that is about to vanish.
  const hadFocus = npcBubble.contains(document.activeElement);
  lineIndex = -1;
  npcBubble.hidden = true;
  npcBubbleLive.textContent = '';
  setTeacherTalking(false);
  if (hadFocus) document.activeElement.blur();
}

/** Can she be addressed with the keyboard right now? True while her prompt is showing. */
export function isTeacherInReach() {
  return !npcPrompt.hidden;
}

/** Put `element` above the projected anchor, kept inside the window; the tail follows her. */
function place(element, x, y) {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const half = width / 2;
  const left = THREE.MathUtils.clamp(x, half + EDGE_MARGIN, Math.max(half + EDGE_MARGIN, window.innerWidth - half - EDGE_MARGIN));
  const top = Math.max(y, height + EDGE_MARGIN);
  element.style.transform = `translate3d(${left.toFixed(1)}px, ${top.toFixed(1)}px, 0) translate(-50%, -100%)`;
  element.style.setProperty('--tail-x', `${THREE.MathUtils.clamp(half + x - left, 18, width - 18).toFixed(1)}px`);
}

/** Per-frame, from animate(), after the camera has been moved. */
export function updateDialogue(dt) {
  getTeacherAnchor(anchor);
  const walking = isWalking();
  const distance = camera.position.distanceTo(anchor);

  if (lineIndex >= 0 && !isCameraFlying() && distance > (walking ? WALK_LEAVE : ORBIT_LEAVE)) {
    closeDialogue();
  }

  camera.updateMatrixWorld();
  projected.copy(anchor).project(camera);
  const onScreen =
    projected.z > -1 && projected.z < 1 &&
    Math.abs(projected.x) < 1.04 && projected.y > -1.1 && projected.y < 1.04;
  const x = (projected.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-projected.y * 0.5 + 0.5) * window.innerHeight;

  const talking = lineIndex >= 0;
  const showBubble = talking && onScreen;
  // The prompt follows the Labels switch in the orbit views; on foot it shows when near.
  const showPrompt = !talking && onScreen && (walking
    ? distance <= WALK_REACH
    : !labelsLayer.classList.contains('is-hidden'));

  if (npcBubble.hidden === showBubble) npcBubble.hidden = !showBubble;
  if (npcPrompt.hidden === showPrompt) npcPrompt.hidden = !showPrompt;

  if (showBubble) {
    if (typed < lines[lineIndex].length) {
      typed += dt * CHARS_PER_SECOND;
      renderTyped();
    }
    place(npcBubble, x, y);
  } else if (showPrompt) {
    place(npcPrompt, x, y);
  }
}
