/**
 * DOM event wiring: pointer picking on the canvas, toolbar buttons, keyboard and resize.
 */

import { infoPanel, labelsToggle, overviewBtn, panelBack, panelClose, walkToggle } from '../core/dom.js';
import { camera, controls, renderer, targetPixelRatio } from '../core/engine.js';
import { setWeather } from '../scene/weather.js';
import { overviewTarget, updateResponsiveFov, viewportOverview } from './cameraRig.js';
import { findBuildingAtEvent } from './picking.js';
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

/** Attach every DOM listener. Call once, after the scene is built. */
export function initInput() {
  // Pointer picking is deliberately separated from OrbitControls: a short,
  // stationary pointer gesture counts as a click, a drag does not.
  renderer.domElement.addEventListener('pointerdown', (event) => {
    if (isWalking()) {
      // Walking: a drag looks around; keep receiving it even if it leaves the canvas.
      renderer.domElement.setPointerCapture(event.pointerId);
      return;
    }
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
      return;
    }
    if (event.pointerType !== 'mouse') return;
    if (pointerDown && pointerDown.pointerId === event.pointerId) return;
    if (event.buttons !== 0) {
      if (getHoveredBuilding()) setHoveredBuilding(null);
      return;
    }
    const id = findBuildingAtEvent(event);
    setHoveredBuilding(id);
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
      const id = findBuildingAtEvent(event);
      if (id) selectBuilding(id);
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

  walkToggle.addEventListener('click', toggleWalk);

  overviewBtn.addEventListener('click', () => {
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
      if (isWalking()) exitWalk();
      else if (infoPanel.classList.contains('is-open')) closePanel({ fly: true });
      else setHoveredBuilding(null);
      return;
    }
    // Walk keys (arrows / WASD / Shift). Browser shortcuts with a modifier stay untouched.
    if (event.ctrlKey || event.metaKey || event.altKey) return;
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
