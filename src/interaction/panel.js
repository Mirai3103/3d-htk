/**
 * The building info panel: open on selection, close back to the overview.
 */

import {
  infoPanel,
  panelArea,
  panelDescription,
  panelIndex,
  panelKind,
  panelLevels,
  panelName,
  panelSub,
} from '../core/dom.js';
import { BUILDING_ORDER, BUILDING_TOTAL, BUILDINGS } from '../data/buildings.js';
import { flyToBuilding, flyToOverview } from './cameraRig.js';
import { closeDialogue } from './dialogue.js';
import { refreshOutline, setHoveredBuilding } from './hover.js';

let selectedBuilding = null;

export function selectBuilding(id) {
  const data = BUILDINGS[id];
  if (!data) return;
  closeDialogue();
  setHoveredBuilding(null);
  selectedBuilding = id;
  panelKind.textContent = data.kind;
  panelIndex.textContent = `${String(BUILDING_ORDER.indexOf(id) + 1).padStart(2, '0')} / ${String(BUILDING_TOTAL).padStart(2, '0')}`;
  panelName.textContent = data.name;
  panelSub.textContent = data.sub;
  if (data.area == null) {
    panelArea.textContent = '—';
  } else {
    panelArea.innerHTML = `${data.area} <span class="stat-unit">m²</span>`;
  }
  if (data.storeys == null) {
    panelLevels.textContent = '—';
  } else {
    const unit = data.storeysLabel || (data.storeys === 1 ? 'storey' : 'storeys');
    panelLevels.innerHTML = `${data.storeys} <span class="stat-unit">${unit}</span>`;
  }
  panelDescription.textContent = data.description;
  infoPanel.inert = false;
  infoPanel.setAttribute('aria-hidden', 'false');
  infoPanel.classList.add('is-open');
  refreshOutline();
  flyToBuilding(data);
}

export function closePanel({ fly = true } = {}) {
  if (!selectedBuilding && !infoPanel.classList.contains('is-open')) {
    if (fly) flyToOverview();
    return;
  }
  selectedBuilding = null;
  infoPanel.classList.remove('is-open');
  infoPanel.inert = true;
  infoPanel.setAttribute('aria-hidden', 'true');
  refreshOutline();
  if (fly) flyToOverview();
}
