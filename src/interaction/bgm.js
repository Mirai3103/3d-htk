/**
 * Ambient background music: loops continuously at 20% volume, starts on load or the first
 * user gesture (respecting browser autoplay rules), ducks gently while the teacher speaks
 * and pauses while the memory video or background tab is active.
 */

import { damp } from '../core/math.js';

const BASE_VOLUME = 0.2;
const DUCK_VOLUME = 0.06;

const bgm = new Audio('audio/bgm.m4a');
bgm.loop = true;
bgm.preload = 'auto';
bgm.volume = BASE_VOLUME;

let initialized = false;
let unlocked = false;
let videoPaused = false;
let targetVolume = BASE_VOLUME;

function tryStartBgm() {
  if (videoPaused || document.hidden) return;
  if (!bgm.paused) {
    unlocked = true;
    return;
  }
  const playPromise = bgm.play();
  if (!playPromise) return;
  playPromise.then(() => {
    unlocked = true;
    if (videoPaused || document.hidden) bgm.pause();
  }).catch(() => {});
}

/** Initialize background music listeners and attempt initial playback. */
export function initBgm() {
  if (initialized) return;
  initialized = true;
  tryStartBgm();

  const onGesture = () => {
    if (!unlocked || (bgm.paused && !videoPaused && !document.hidden)) {
      tryStartBgm();
    }
  };
  window.addEventListener('pointerdown', onGesture, { capture: true, passive: true });
  window.addEventListener('keydown', onGesture, { capture: true, passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      bgm.pause();
    } else if (unlocked && !videoPaused) {
      tryStartBgm();
    }
  });
}

/** Pause background music while watching the memory video, and resume afterwards. */
export function setBgmVideoPaused(paused) {
  videoPaused = paused;
  if (paused) {
    bgm.pause();
  } else if (unlocked && !document.hidden) {
    tryStartBgm();
  }
}

/** Lower background music volume while the teacher's voice lines are open. */
export function setBgmDucked(ducked) {
  targetVolume = ducked ? DUCK_VOLUME : BASE_VOLUME;
}

/** Per-frame: smoothly ramp volume towards `targetVolume`. */
export function updateBgm(dt) {
  if (Math.abs(bgm.volume - targetVolume) < 0.001) {
    if (bgm.volume !== targetVolume) bgm.volume = targetVolume;
    return;
  }
  bgm.volume = damp(bgm.volume, targetVolume, 6, dt);
}
