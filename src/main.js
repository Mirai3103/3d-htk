/**
 * Entry point: boot sequence and the render loop.
 */

import './styles/index.css';
import { loader, loaderStatus } from './core/dom.js';
import { camera, clock, controls, renderer, scene } from './core/engine.js';
import { flushBatches } from './geometry/batching.js';
import { skyGroup, skyUniforms } from './scene/sky.js';
import { rain } from './scene/rain.js';
import { updateWeather } from './scene/weather.js';
import { createPuddles } from './scene/puddles.js';
import {
  constrainCamera,
  isCameraFlying,
  setInitialView,
  updateCameraFlight,
} from './interaction/cameraRig.js';
import { createPickProxies } from './interaction/picking.js';
import { createHoverOutline, updateOutlinePulse } from './interaction/hover.js';
import { createLabels, updateLabels } from './interaction/labels.js';
import { initInput } from './interaction/input.js';
import { updateFlag } from './campus/ceremonyStage.js';
import { buildCampus } from './campus/index.js';

function hideLoader() {
  window.__campusBooted = true;
  loader.classList.add('is-done');
  window.setTimeout(() => { loader.style.display = 'none'; }, 800);
}

function animate() {
  clock.update();
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.getElapsed();

  updateCameraFlight();
  updateWeather(dt);
  if (!isCameraFlying()) controls.update(dt);
  constrainCamera();
  updateFlag(t);

  skyUniforms.uTime.value = t;
  skyGroup.position.copy(camera.position);

  updateOutlinePulse(t);
  updateLabels();
  renderer.render(scene, camera);
}

// Build everything, then render once through all weather types' shader
// programs before the loader disappears; this avoids a stutter on the first
// weather switch.
async function boot() {
  setInitialView();
  loaderStatus.textContent = 'Planting the courtyard trees…';
  buildCampus();
  flushBatches();
  createPickProxies();
  createLabels();
  createHoverOutline();
  createPuddles();
  initInput();
  loaderStatus.textContent = 'Softening the afternoon light…';
  const rainWasVisible = rain.visible;
  rain.visible = true;
  try {
    await renderer.compileAsync(scene, camera);
  } catch (error) {
    console.warn('Shader precompile skipped:', error);
  }
  rain.visible = rainWasVisible;
  renderer.shadowMap.needsUpdate = true;
  renderer.setAnimationLoop(animate);
  window.setTimeout(hideLoader, 280);
}

boot().catch((error) => {
  console.error(error);
  loaderStatus.textContent = 'The campus could not be built.';
  const fallback = document.getElementById('loader-fallback');
  if (fallback) {
    fallback.hidden = false;
    fallback.textContent = 'This browser may be blocking WebGL.';
  }
});
