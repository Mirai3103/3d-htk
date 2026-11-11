/**
 * buildCampus(): runs every campus builder in order. Add new builders here.
 */

import { HALF_PI } from '../core/math.js';
import { loaderStatus } from '../core/dom.js';
import { ensureBuildMaterials } from '../materials/library.js';
import { buildGroundAndStreet } from './ground.js';
import { buildPerimeter } from './perimeter.js';
import { buildMainGate } from './gate.js';
import { buildAdministration } from './administration.js';
import { buildClassroomBlock } from './classroomBlock.js';
import { buildCeremonyStage } from './ceremonyStage.js';
import { buildMemorialBust } from './memorialBust.js';
import { buildSportsCourtDetails } from './sportsCourt.js';
import { buildSideYard } from './sideYard.js';
import { buildBicycleShed } from './bicycleShed.js';
import { buildCourtyardLife } from './courtyardLife.js';
import { buildCourtyardLamps } from './courtyardLamps.js';
import { buildNeighborhood } from './neighborhood.js';

export function buildCampus() {
  ensureBuildMaterials();
  loaderStatus.textContent = 'Laying the red-brick courtyard…';
  buildGroundAndStreet();
  buildPerimeter();
  buildMainGate();
  loaderStatus.textContent = 'Raising the classroom wings…';
  buildAdministration();
  buildClassroomBlock({
    cx: 17, cz: -24.5, yaw: 0, W: 38, D: 9, seed: 4,
    roofKey: 'roofPale', ridgeKey: 'ridgePale', roofRise: 2.5, banner: true,
  });
  buildClassroomBlock({
    cx: 42, cz: -2, yaw: -HALF_PI, W: 36, D: 9, seed: 7,
    roofKey: 'roofMaroon', ridgeKey: 'ridgeMaroon', roofRise: 2.5,
  });
  buildClassroomBlock({
    cx: -29, cz: -3, yaw: HALF_PI, W: 32, D: 9, seed: 12,
    roofKey: 'roofPale', ridgeKey: 'ridgePale', roofRise: 2.45, porch: true,
  });
  buildClassroomBlock({
    cx: -44, cz: -3, yaw: HALF_PI, W: 40, D: 9, seed: 18,
    roofKey: 'roofGreen', ridgeKey: 'ridge', roofRise: 2.55,
  });
  buildBicycleShed();
  loaderStatus.textContent = 'Stretching the green ceremony awning…';
  buildCeremonyStage();
  buildMemorialBust();
  buildSportsCourtDetails();
  buildSideYard();
  buildCourtyardLife();
  buildCourtyardLamps();
  buildNeighborhood();
  loaderStatus.textContent = 'Setting out the little details…';
}
