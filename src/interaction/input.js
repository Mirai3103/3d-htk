/**
 * DOM event wiring: pointer picking on the canvas, toolbar buttons, keyboard and resize.
 */

import { infoPanel, labelsToggle, overviewBtn, panelBack, panelClose } from '../core/dom.js';
import { camera, controls, renderer, targetPixelRatio } from '../core/engine.js';
import { setWeather } from '../scene/weather.js';
import { overviewTarget, updateResponsiveFov, viewportOverview } from './cameraRig.js';
import { findBuildingAtEvent } from './picking.js';
import { getHoveredBuilding, setHoveredBuilding, setOutlineResolution } from './hover.js';
import { applyLabelNames, measureLabels, toggleLabels, updateLabels } from './labels.js';
import { closePanel, selectBuilding } from './panel.js';

let pointerDown = null;
const activePointers = new Set();

/** Attach every DOM listener. Call once, after the scene is built. */
export function initInput() {
  // Pointer picking is deliberately separated from OrbitControls: a short,
  // stationary pointer gesture counts as a click, a drag does not.
  renderer.domElement.addEventListener('pointerdown', (event) => {
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

  overviewBtn.addEventListener('click', () => {
    closePanel({ fly: true });
  });

  panelClose.addEventListener('click', () => closePanel({ fly: true }));
  panelBack.addEventListener('click', () => closePanel({ fly: true }));

  document.querySelectorAll('.weather-btn').forEach((button) => {
    button.addEventListener('click', () => setWeather(button.dataset.weather));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (infoPanel.classList.contains('is-open')) closePanel({ fly: true });
      else setHoveredBuilding(null);
    }
  });

  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(targetPixelRatio());
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(1, height);
    updateResponsiveFov();
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
    setHoveredBuilding(null);
  });
}
