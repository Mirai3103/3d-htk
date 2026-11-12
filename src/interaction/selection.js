/**
 * Choosing a place: a click on a building's label or its model closes whatever view is open
 * and flies the camera to that building's own view. There is no info panel.
 */

import { BUILDINGS } from '../data/buildings.js';
import { closeAlbum } from './albumView.js';
import { flyToBuilding } from './cameraRig.js';
import { closeDialogue } from './dialogue.js';
import { setHoveredBuilding } from './hover.js';
import { closeVideo } from './videoView.js';

export function selectBuilding(id) {
  const data = BUILDINGS[id];
  if (!data) return;
  closeDialogue();
  closeAlbum({ fly: false });
  closeVideo({ fly: false });
  setHoveredBuilding(null);
  flyToBuilding(data);
}
