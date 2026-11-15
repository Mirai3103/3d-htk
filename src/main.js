/**
 * Entry point: boot sequence and the render loop.
 */

import './styles/index.css';
import { loader, loaderStatus } from './core/dom.js';
import { camera, clock, controls, renderer, scene } from './core/engine.js';
import { flushBatches } from './geometry/batching.js';
import { skyGroup, skyUniforms } from './scene/sky.js';
import './scene/lights.js';
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
import { isIntroPlaying, startIntro, updateIntro } from './interaction/intro.js';
import { isWalking, teleportWalker, updateWalk } from './interaction/walk.js';
import { initBgm, updateBgm } from './interaction/bgm.js';
import { preloadTeacherAudio, updateDialogue } from './interaction/dialogue.js';
import { isAlbumActive, updateAlbumView } from './interaction/albumView.js';
import { isVideoActive, updateVideoView } from './interaction/videoView.js';
import { updateFlag } from './campus/ceremonyStage.js';
import { updateBirds } from './campus/birds.js';
import { updateTeacher } from './campus/teacher.js';
import { updateAlbum } from './campus/album.js';
import { updateTeachersDayBooth } from './campus/teachersDayBooth.js';
import { buildCampus } from './campus/index.js';
import { updateWind } from './materials/wind.js';
import { preloadAlbumPhotos } from './textures/album.js';

function hideLoader() {
  window.__campusBooted = true;
  loader.classList.add('is-done');
  window.setTimeout(() => { loader.style.display = 'none'; }, 800);
}

function animate() {
  clock.update();
  const frame = clock.getDelta();
  const dt = Math.min(frame, 0.05);
  const t = clock.getElapsed();

  updateCameraFlight();
  if (isIntroPlaying()) {
    // The opening shot keeps real time, so a slow device does not get it in slow motion.
    updateIntro(Math.min(frame, 0.25));
  } else if (isAlbumActive() || isVideoActive()) {
    // A close-up view (album, video) holds the camera; its flights run in updateCameraFlight.
  } else if (isWalking()) {
    updateWalk(dt);
  } else {
    if (!isCameraFlying()) controls.update(dt);
    constrainCamera();
  }
  updateFlag(t);
  updateWind(t);
  updateBirds(t);
  updateTeacher(t, dt);
  updateTeachersDayBooth(t);
  updateDialogue(dt);
  updateBgm(dt);
  updateAlbum(dt);
  updateAlbumView(dt);
  updateVideoView();

  skyUniforms.uTime.value = t;
  skyGroup.position.copy(camera.position);

  updateOutlinePulse(t);
  if (!isWalking()) updateLabels();
  renderer.render(scene, camera);
}

// Dev only: `?walk=x,z,yawDegrees,pitchDegrees` drops you straight into walk mode at that
// spot, which makes it easy to check a first-person view without walking there.
function devWalkParam() {
  return import.meta.env.DEV ? new URLSearchParams(window.location.search).get('walk') : null;
}

function applyDevWalkParam() {
  const value = devWalkParam();
  if (value == null) return;
  const [x = 0, z = 26.8, yawDeg = 0, pitchDeg = 0] = value.split(',').map(Number);
  teleportWalker(x, z, (yawDeg * Math.PI) / 180, (pitchDeg * Math.PI) / 180);
}

// Build everything, then precompile shaders before the loader disappears.
async function boot() {
  // The album's photos and teacher voice lines download while the campus is built and the intro plays.
  preloadAlbumPhotos();
  preloadTeacherAudio();
  setInitialView();
  loaderStatus.textContent = 'Trồng cây cho sân trường…';
  buildCampus();
  flushBatches();
  createPickProxies();
  createLabels();
  createHoverOutline();
  initInput();
  initBgm();
  loaderStatus.textContent = 'Pha ánh nắng chiều…';
  try {
    await renderer.compileAsync(scene, camera);
  } catch (error) {
    console.warn('Shader precompile skipped:', error);
  }
  renderer.shadowMap.needsUpdate = true;
  // The opening shot holds its first frame while the loader fades (interaction/intro.js).
  startIntro({ play: devWalkParam() == null });
  renderer.setAnimationLoop(animate);
  window.setTimeout(hideLoader, 280);
  applyDevWalkParam();
}

boot().catch((error) => {
  console.error(error);
  loaderStatus.textContent = 'Không thể dựng khu trường.';
  const fallback = document.getElementById('loader-fallback');
  if (fallback) {
    fallback.hidden = false;
    fallback.textContent = 'Trình duyệt này có thể đang chặn WebGL.';
  }
});
