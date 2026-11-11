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
import { isWalking, teleportWalker, updateWalk } from './interaction/walk.js';
import { updateDialogue } from './interaction/dialogue.js';
import { updateFlag } from './campus/ceremonyStage.js';
import { updateTeacher } from './campus/teacher.js';
import { updateTeachersDayBooth } from './campus/teachersDayBooth.js';
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
  if (isWalking()) {
    updateWalk(dt);
  } else {
    if (!isCameraFlying()) controls.update(dt);
    constrainCamera();
  }
  updateFlag(t);
  updateTeacher(t, dt);
  updateTeachersDayBooth(t);
  updateDialogue(dt);

  skyUniforms.uTime.value = t;
  skyGroup.position.copy(camera.position);

  updateOutlinePulse(t);
  if (!isWalking()) updateLabels();
  renderer.render(scene, camera);
}

// Dev only: `?walk=x,z,yawDegrees,pitchDegrees` drops you straight into walk mode at that
// spot, which makes it easy to check a first-person view without walking there.
function applyDevWalkParam() {
  const value = new URLSearchParams(window.location.search).get('walk');
  if (value == null) return;
  const [x = 0, z = 26.8, yawDeg = 0, pitchDeg = 0] = value.split(',').map(Number);
  teleportWalker(x, z, (yawDeg * Math.PI) / 180, (pitchDeg * Math.PI) / 180);
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
  if (import.meta.env.DEV) applyDevWalkParam();
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
