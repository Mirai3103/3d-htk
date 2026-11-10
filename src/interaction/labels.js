/**
 * HTML building labels projected from 3D anchors, with overlap resolution on narrow
 * screens.
 */

import * as THREE from 'three';
import { labelsLayer, labelsToggle } from '../core/dom.js';
import { camera } from '../core/engine.js';
import { BUILDING_ORDER, BUILDINGS } from '../data/buildings.js';
import { getHoveredBuilding, setHoveredBuilding } from './hover.js';
import { selectBuilding } from './panel.js';

let labelsVisible = true;

export const labelElements = new Map();
const labelSizes = new Map();

let labelNameMode = null;

export function measureLabels() {
  for (const [id, button] of labelElements) {
    const rect = button.getBoundingClientRect();
    if (rect.width > 0) {
      labelSizes.set(id, { w: rect.width, h: rect.height || 24 });
    }
  }
}

export function applyLabelNames() {
  const compact = window.innerWidth < 720;
  const mode = compact ? 'compact' : 'full';
  if (mode === labelNameMode) return;
  labelNameMode = mode;
  for (const [id, button] of labelElements) {
    button.textContent = compact ? BUILDINGS[id].short : BUILDINGS[id].name;
  }
  requestAnimationFrame(measureLabels);
}

export function createLabels() {
  for (const id of BUILDING_ORDER) {
    const data = BUILDINGS[id];
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'building-label';
    button.dataset.building = id;
    button.textContent = data.name;
    button.setAttribute('aria-label', `View ${data.name}`);
    button.addEventListener('click', () => selectBuilding(id));
    button.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') setHoveredBuilding(id, true);
    });
    button.addEventListener('pointerleave', (event) => {
      if (event.pointerType === 'mouse' && getHoveredBuilding() === id) setHoveredBuilding(null, true);
    });
    labelsLayer.appendChild(button);
    labelElements.set(id, button);
  }
  labelNameMode = 'full';
  applyLabelNames();
  measureLabels();
}

export function updateLabels() {
  if (!labelElements.size) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const perspectivePoint = new THREE.Vector3();
  const items = [];
  for (const id of BUILDING_ORDER) {
    const button = labelElements.get(id);
    if (!button) continue;
    perspectivePoint.copy(BUILDINGS[id].label).project(camera);
    const isVisible =
      labelsVisible &&
      perspectivePoint.z > -1 &&
      perspectivePoint.z < 1 &&
      perspectivePoint.x > -1.02 &&
      perspectivePoint.x < 1.02 &&
      perspectivePoint.y > -1.06 &&
      perspectivePoint.y < 1.02;
    button.classList.toggle('is-floating-away', !isVisible);
    if (!isVisible) continue;
    const x = (perspectivePoint.x * 0.5 + 0.5) * w;
    const y = (-perspectivePoint.y * 0.5 + 0.5) * h;
    const size = labelSizes.get(id) || { w: 140, h: 24 };
    items.push({ id, button, x, y, w: size.w, h: size.h });
  }

  // On portrait screens the labels can share the same small band of sky.
  // Resolve overlaps by stacking them downward while keeping the pins near
  // their buildings.
  if (w < 900) {
    items.sort((a, b) => a.y - b.y);
    const placed = [];
    for (const item of items) {
      let finalY = item.y;
      for (let attempt = 0; attempt < 10; attempt++) {
        let conflict = null;
        for (const other of placed) {
          const horizontal = Math.abs(other.x - item.x) < (other.w + item.w) * 0.5 + 5;
          const vertical = !(finalY <= other.y - other.h - 3 || finalY - item.h >= other.y + 3);
          if (horizontal && vertical) { conflict = other; break; }
        }
        if (!conflict) break;
        finalY = conflict.y + 4 + item.h;
      }
      if (finalY > h - 12) finalY = item.y;
      item.finalY = finalY;
      placed.push({ x: item.x, y: finalY, w: item.w, h: item.h });
    }
  }

  for (const item of items) {
    const y = item.finalY ?? item.y;
    item.button.style.transform = `translate3d(${item.x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -100%)`;
  }
}

export function toggleLabels() {
  labelsVisible = !labelsVisible;
  labelsToggle.setAttribute('aria-pressed', String(labelsVisible));
  labelsLayer.classList.toggle('is-hidden', !labelsVisible);
  for (const button of labelElements.values()) button.tabIndex = labelsVisible ? 0 : -1;
  if (labelsVisible) requestAnimationFrame(measureLabels);
  if (!labelsVisible) setHoveredBuilding(null);
}
