/**
 * DOM event wiring: pointer picking on the canvas, toolbar buttons, keyboard and resize.
 */

import {
  infoPanel,
  labelsToggle,
  npcBubbleClose,
  npcBubbleNext,
  npcPrompt,
  overviewBtn,
  panelBack,
  panelClose,
  walkToggle,
} from '../core/dom.js';
import { camera, controls, renderer, targetPixelRatio } from '../core/engine.js';
import { setWeather } from '../scene/weather.js';
import { overviewTarget, updateResponsiveFov, viewportOverview } from './cameraRig.js';
import { closeDialogue, isTalking, isTeacherInReach, talkToTeacher } from './dialogue.js';
import { findPickAtEvent } from './picking.js';
import { getHoveredBuilding, setHoveredBuilding, setOutlineResolution } from './hover.js';
import { applyLabelNames, measureLabels, toggleLabels, updateLabels } from './labels.js';
import { closePanel, selectBuilding } from './panel.js';
import {
  exitWalk,
  isWalking,
  refreshWalkFov,
  releaseWalkKeys,
  setWalkKey,
  toggleWalk,
  walkLook,
} from './walk.js';

let pointerDown = null;
const activePointers = new Set();

/** Start, or carry on, the conversation with the teacher. */
function speakWithTeacher() {
  closePanel({ fly: false });
  talkToTeacher();
}

/** Attach every DOM listener. Call once, after the scene is built. */
export function initInput() {
  // Pointer picking is deliberately separated from OrbitControls: a short,
  // stationary pointer gesture counts as a click, a drag does not.
  renderer.domElement.addEventListener('pointerdown', (event) => {
    // Walking: a drag looks around; keep receiving it even if it leaves the canvas.
    if (isWalking()) renderer.domElement.setPointerCapture(event.pointerId);
    activePointers.add(event.pointerId);
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (activePointers.size > 1) {
      pointerDown = null;
      return;
    }
    pointerDown = {
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      pointerId: event.pointerId,
    };
  });

  renderer.domElement.addEventListener('pointermove', (event) => {
    if (isWalking()) {
      if (event.buttons !== 0) walkLook(event.movementX, event.movementY);
      else renderer.domElement.style.cursor = findPickAtEvent(event, true) ? 'pointer' : 'grab';
      return;
    }
    if (event.pointerType !== 'mouse') return;
    if (pointerDown && pointerDown.pointerId === event.pointerId) return;
    if (event.buttons !== 0) {
      if (getHoveredBuilding()) setHoveredBuilding(null);
      return;
    }
    const pick = findPickAtEvent(event);
    setHoveredBuilding(pick?.buildingId ?? null);
    renderer.domElement.style.cursor = pick ? 'pointer' : 'grab';
  });

  renderer.domElement.addEventListener('pointerup', (event) => {
    activePointers.delete(event.pointerId);
    if (!pointerDown || pointerDown.pointerId !== event.pointerId) {
      pointerDown = null;
      return;
    }
    const dx = event.clientX - pointerDown.x;
    const dy = event.clientY - pointerDown.y;
    const distance = Math.hypot(dx, dy);
    const elapsed = performance.now() - pointerDown.time;
    const wasPrimary = event.pointerType !== 'mouse' || event.button === 0;
    pointerDown = null;
    if (wasPrimary && distance < 7 && elapsed < 900 && activePointers.size === 0) {
      // On foot only the teacher can be clicked; buildings are named as you walk past.
      const pick = findPickAtEvent(event, isWalking());
      if (pick?.npc) speakWithTeacher();
      else if (pick?.buildingId) selectBuilding(pick.buildingId);
    }
  });

  renderer.domElement.addEventListener('pointercancel', (event) => {
    activePointers.delete(event.pointerId);
    pointerDown = null;
  });

  renderer.domElement.addEventListener('pointerleave', () => {
    activePointers.clear();
    pointerDown = null;
    if (getHoveredBuilding()) setHoveredBuilding(null);
  });

  renderer.domElement.addEventListener('contextmenu', (event) => event.preventDefault());

  labelsToggle.addEventListener('click', toggleLabels);

  walkToggle.addEventListener('click', () => {
    closeDialogue();
    toggleWalk();
  });

  npcPrompt.addEventListener('click', speakWithTeacher);
  npcBubbleNext.addEventListener('click', talkToTeacher);
  npcBubbleClose.addEventListener('click', closeDialogue);

  overviewBtn.addEventListener('click', () => {
    closeDialogue();
    if (isWalking()) exitWalk();
    else closePanel({ fly: true });
  });

  panelClose.addEventListener('click', () => closePanel({ fly: true }));
  panelBack.addEventListener('click', () => closePanel({ fly: true }));

  document.querySelectorAll('.weather-btn').forEach((button) => {
    button.addEventListener('click', () => setWeather(button.dataset.weather));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (isTalking()) closeDialogue();
      else if (isWalking()) exitWalk();
      else if (infoPanel.classList.contains('is-open')) closePanel({ fly: true });
      else setHoveredBuilding(null);
      return;
    }
    // Walk keys (arrows / WASD / Shift). Browser shortcuts with a modifier stay untouched.
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    // E speaks to the teacher when she is near (and moves her on to the next line).
    if (event.code === 'KeyE' && isWalking()) {
      if (!event.repeat && (isTalking() || isTeacherInReach())) speakWithTeacher();
      return;
    }
    if (setWalkKey(event.code, true) && !event.code.startsWith('Shift')) event.preventDefault();
  });

  document.addEventListener('keyup', (event) => {
    setWalkKey(event.code, false);
  });

  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(targetPixelRatio());
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(1, height);
    if (isWalking()) refreshWalkFov();
    else updateResponsiveFov();
    camera.updateProjectionMatrix();
    controls.maxDistance = Math.max(390, viewportOverview().position.distanceTo(overviewTarget) * 1.35);
    setOutlineResolution(width, height);
    applyLabelNames();
    measureLabels();
    updateLabels();
  });

  window.addEventListener('blur', () => {
    activePointers.clear();
    pointerDown = null;
    releaseWalkKeys();
    setHoveredBuilding(null);
  });
}
