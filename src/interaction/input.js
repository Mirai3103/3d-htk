/**
 * DOM event wiring: pointer picking on the canvas, toolbar buttons, keyboard and resize.
 */

import {
  albumClose,
  albumNext,
  albumPhoto,
  albumPhotoClose,
  albumPrev,
  albumPrompt,
  introEl,
  labelsToggle,
  npcBubbleClose,
  npcBubbleNext,
  npcPrompt,
  overviewBtn,
  videoClose,
  videoPrompt,
  walkToggle,
} from '../core/dom.js';
import { camera, controls, renderer, targetPixelRatio } from '../core/engine.js';
import {
  albumPhotoClick,
  albumPointerDown,
  albumPointerMove,
  albumPointerUp,
  closeAlbum,
  closeAlbumPhoto,
  isAlbumActive,
  isAlbumInReach,
  isAlbumPhotoShown,
  openAlbum,
  refreshAlbumView,
  turnAlbumPage,
} from './albumView.js';
import { flyToOverview, overviewTarget, updateResponsiveFov, viewportOverview } from './cameraRig.js';
import { closeDialogue, isTalking, isTeacherInReach, talkToTeacher } from './dialogue.js';
import { findPickAtEvent } from './picking.js';
import { getHoveredBuilding, setHoveredBuilding, setOutlineResolution } from './hover.js';
import { isIntroPlaying, skipIntro } from './intro.js';
import { applyLabelNames, measureLabels, toggleLabels, updateLabels } from './labels.js';
import { selectBuilding } from './selection.js';
import {
  closeVideo,
  initVideoView,
  isVideoActive,
  isVideoInReach,
  openVideo,
  refreshVideoView,
  videoKeyDown,
} from './videoView.js';
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
  talkToTeacher();
}

/** Attach every DOM listener. Call once, after the scene is built. */
export function initInput() {
  // Pointer picking is deliberately separated from OrbitControls: a short,
  // stationary pointer gesture counts as a click, a drag does not.
  renderer.domElement.addEventListener('pointerdown', (event) => {
    // Reading the album: the pointer turns pages and nothing else.
    if (isAlbumActive()) {
      albumPointerDown(event);
      return;
    }
    // Watching the video: the scene behind it is not touched.
    if (isVideoActive()) return;
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
    if (isAlbumActive()) {
      albumPointerMove(event);
      return;
    }
    if (isVideoActive()) return;
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
    if (isAlbumActive()) {
      pointerDown = null;
      albumPointerUp(event);
      return;
    }
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
      // On foot only the teacher, the album and the video screen can be clicked; buildings
      // are named as you walk past.
      const pick = findPickAtEvent(event, isWalking());
      if (pick?.npc) speakWithTeacher();
      else if (pick?.prop === 'album') openAlbum();
      else if (pick?.prop === 'video') openVideo();
      else if (pick?.buildingId) selectBuilding(pick.buildingId);
    }
  });

  renderer.domElement.addEventListener('pointercancel', (event) => {
    activePointers.delete(event.pointerId);
    pointerDown = null;
    albumPointerUp(event, { cancelled: true });
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
    closeAlbum({ fly: false });
    closeVideo({ fly: false });
    toggleWalk();
  });

  albumPrompt.addEventListener('click', openAlbum);
  albumPrev.addEventListener('click', () => turnAlbumPage(-1));
  albumNext.addEventListener('click', () => turnAlbumPage(1));
  albumClose.addEventListener('click', () => closeAlbum());
  albumPhoto.addEventListener('click', albumPhotoClick);

  initVideoView();
  videoPrompt.addEventListener('click', openVideo);
  videoClose.addEventListener('click', () => closeVideo());

  npcPrompt.addEventListener('click', speakWithTeacher);
  npcBubbleNext.addEventListener('click', talkToTeacher);
  npcBubbleClose.addEventListener('click', closeDialogue);

  overviewBtn.addEventListener('click', () => {
    closeDialogue();
    closeAlbum({ fly: false });
    closeVideo({ fly: false });
    if (isWalking()) exitWalk();
    else flyToOverview();
  });

  // The opening shot: its overlay covers the scene, so any click or tap on it skips ahead.
  introEl.addEventListener('click', skipIntro);

  document.addEventListener('keydown', (event) => {
    if (isIntroPlaying()) {
      if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') skipIntro();
      return;
    }
    // Reading the album: arrows turn pages, Esc closes it, everything else waits.
    if (isAlbumActive()) {
      // A photo shown large: Esc puts it away, and focus stays on its close button.
      if (isAlbumPhotoShown()) {
        if (event.key === 'Escape') closeAlbumPhoto();
        else if (event.key === 'Tab') {
          albumPhotoClose.focus();
          event.preventDefault();
        }
        return;
      }
      if (event.key === 'Escape') closeAlbum();
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        // A focused page button already turns on Enter/Space; arrows work from anywhere.
        turnAlbumPage(event.key === 'ArrowRight' ? 1 : -1);
        event.preventDefault();
      }
      return;
    }
    if (isVideoActive()) {
      videoKeyDown(event);
      return;
    }
    if (event.key === 'Escape') {
      if (isTalking()) closeDialogue();
      else if (isWalking()) exitWalk();
      else setHoveredBuilding(null);
      return;
    }
    // Walk keys (arrows / WASD / Shift). Browser shortcuts with a modifier stay untouched.
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    // E speaks to the teacher when she is near (and moves her on to the next line), opens
    // the album when standing at its table, or starts the video in front of its screen.
    if (event.code === 'KeyE' && isWalking()) {
      if (event.repeat) return;
      if (isTalking() || isTeacherInReach()) speakWithTeacher();
      else if (isAlbumInReach()) openAlbum();
      else if (isVideoInReach()) openVideo();
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
    if (isAlbumActive()) refreshAlbumView();
    else if (isVideoActive()) refreshVideoView();
    else if (isWalking()) refreshWalkFov();
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
