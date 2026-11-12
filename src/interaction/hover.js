/**
 * Hovered-building state and the animated outline box drawn around it.
 */

import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { renderer, scene } from '../core/engine.js';
import { BUILDINGS } from '../data/buildings.js';
import { labelElements } from './labels.js';

let hoveredBuilding = null;

let hoverOutline = null;
let outlineLines = null;

let outlineLineMaterial = null;

export function setHoveredBuilding(id, fromLabel = false) {
  const next = id && BUILDINGS[id] ? id : null;
  if (hoveredBuilding === next) {
    if (!fromLabel && next && labelElements.has(next)) labelElements.get(next).classList.add('is-hovered');
    return;
  }
  if (hoveredBuilding && labelElements.has(hoveredBuilding)) {
    labelElements.get(hoveredBuilding).classList.remove('is-hovered');
  }
  hoveredBuilding = next;
  if (hoveredBuilding && labelElements.has(hoveredBuilding)) {
    labelElements.get(hoveredBuilding).classList.add('is-hovered');
  }
  renderer.domElement.style.cursor = hoveredBuilding ? 'pointer' : 'grab';
  refreshOutline();
}

function refreshOutline() {
  if (!hoverOutline) return;
  const active = hoveredBuilding;
  if (!active) {
    hoverOutline.visible = false;
    return;
  }
  const data = BUILDINGS[active];
  const bounds = data.bounds;
  hoverOutline.visible = true;
  hoverOutline.position.set(bounds.x, bounds.base + bounds.h / 2 + 0.15, bounds.z);
  hoverOutline.scale.set(bounds.w + 0.45, bounds.h + 0.3, bounds.d + 0.45);
  outlineLines.material.color.setHex(0xffd273);
  outlineLines.material.linewidth = 2.25;
}

export function createHoverOutline() {
  const box = new THREE.BoxGeometry(1, 1, 1);
  let edges = new THREE.EdgesGeometry(box);
  if (edges.index) edges = edges.toNonIndexed();
  const points = Array.from(edges.attributes.position.array);
  const lineGeometry = new LineSegmentsGeometry().setPositions(points);
  outlineLineMaterial = new LineMaterial({
    color: 0xffce68,
    linewidth: 2.2,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
    depthTest: true,
    resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
  });
  outlineLines = new LineSegments2(lineGeometry, outlineLineMaterial);
  outlineLines.renderOrder = 40;
  hoverOutline = new THREE.Group();
  hoverOutline.add(outlineLines);
  hoverOutline.visible = false;
  hoverOutline.matrixAutoUpdate = true;
  scene.add(hoverOutline);
}

export function getHoveredBuilding() {
  return hoveredBuilding;
}

/** Called on resize: LineMaterial needs the viewport size for pixel widths. */
export function setOutlineResolution(width, height) {
  if (outlineLineMaterial) outlineLineMaterial.resolution.set(width, height);
}

/** Per-frame: gently pulse the outline opacity while it is visible. */
export function updateOutlinePulse(t) {
  const pulse = 0.5 + Math.sin(t * 3.1) * 0.5;
  if (hoverOutline && hoverOutline.visible) {
    outlineLines.material.opacity = 0.74 + pulse * 0.22;
  }
}
