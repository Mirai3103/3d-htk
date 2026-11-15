/**
 * All named materials of the campus. Add new materials here with std(key, params,
 * options).
 */

import * as THREE from 'three';
import {
  asphaltTex,
  backRoadTex,
  basketballTex,
  brickTex,
  concreteTex,
  corrugationTex,
  courtTex,
  graniteTex,
  grassTex,
  laneBrickTex,
  stuccoTex,
  tileRoofTex,
} from '../textures/surfaces.js';
import {
  adminSignTex,
  bannerTex,
  bustPlaqueTex,
  gateSignSmallTex,
  gateSignTex,
  sideGateSignTex,
  sloganTex,
  stageBackdropTex,
} from '../textures/signs.js';
import { eventPropsTex, festiveTex, teachersDayBackdropTex } from '../textures/festive.js';
import { addSignMaterial, M, MATS, std } from './registry.js';

std('wall', {
  color: 0xedc24f, map: stuccoTex, roughness: 0.84, metalness: 0.0,
});
std('wallWarm', {
  color: 0xf2c95d, map: stuccoTex, roughness: 0.86,
});
std('wallPale', {
  color: 0xf1d98a, map: stuccoTex, roughness: 0.87,
});
std('cream', {
  color: 0xf1e3c0, map: stuccoTex, roughness: 0.82,
});
std('creamDim', {
  color: 0xd8c393, map: stuccoTex, roughness: 0.88,
});
std('trim', {
  color: 0xfbf5e6, map: stuccoTex, roughness: 0.67,
});
std('trimSoft', {
  color: 0xe8e0ca, map: stuccoTex, roughness: 0.8,
});
std('stoneBase', {
  color: 0x4e514a, roughness: 0.95,
});
std('stone', {
  color: 0xb5af9e, roughness: 0.9,
});
std('stoneLight', {
  color: 0xd5cebc, roughness: 0.88,
});
std('concrete', {
  color: 0xffffff, map: concreteTex, roughness: 0.9,
});
std('court', {
  color: 0xffffff, map: courtTex, roughness: 0.88, metalness: 0.02,
}, { castShadow: false });
std('basketball', {
  color: 0xffffff, map: basketballTex, roughness: 0.9, metalness: 0.02,
}, { castShadow: false });
std('brick', {
  color: 0xffffff, map: brickTex, roughness: 0.88,
}, { castShadow: false });
std('brickLane', {
  color: 0xf0ddcf, map: laneBrickTex, roughness: 0.9,
}, { castShadow: false });
std('grass', {
  color: 0xffffff, map: grassTex, roughness: 1.0,
}, { castShadow: false });
std('asphalt', {
  color: 0xffffff, map: asphaltTex, roughness: 0.92,
}, { castShadow: false });
std('asphaltBack', {
  color: 0xffffff, map: backRoadTex, roughness: 0.94,
}, { castShadow: false });
std('roadMark', {
  color: 0xe9e4cf, roughness: 0.7,
}, { castShadow: false });
std('plinth', {
  color: 0xb9b09c, roughness: 0.9,
});
std('recess', {
  color: 0x222c2e, roughness: 0.9,
});
std('roofGreen', {
  color: 0x54765d, map: corrugationTex, roughness: 0.6, metalness: 0.16, side: THREE.DoubleSide,
});
std('roofGreenDark', {
  color: 0x3b5b4b, map: corrugationTex, roughness: 0.55, metalness: 0.15, side: THREE.DoubleSide,
});
std('roofPale', {
  color: 0xd7c785, map: corrugationTex, roughness: 0.72, metalness: 0.05, side: THREE.DoubleSide,
});
std('roofMaroon', {
  color: 0x692d2a, map: corrugationTex, roughness: 0.66, metalness: 0.08, side: THREE.DoubleSide,
});
std('roofGrey', {
  color: 0x858b87, map: corrugationTex, roughness: 0.74, metalness: 0.08, side: THREE.DoubleSide,
});
std('roofTile', {
  color: 0xffffff, map: tileRoofTex, roughness: 0.76, metalness: 0.02, side: THREE.DoubleSide,
});
std('roofBlue', {
  color: 0x44637a, map: corrugationTex, roughness: 0.66, metalness: 0.08, side: THREE.DoubleSide,
});
std('roofRed', {
  color: 0x913d31, map: corrugationTex, roughness: 0.72, side: THREE.DoubleSide,
});
std('roofTeal', {
  color: 0x3d6e67, map: corrugationTex, roughness: 0.7, side: THREE.DoubleSide,
});
std('ridge', {
  color: 0x3f5748, roughness: 0.6, metalness: 0.1,
});
std('ridgePale', {
  color: 0xb2a367, roughness: 0.72,
});
std('ridgeMaroon', {
  color: 0x4f2522, roughness: 0.68,
});
std('ridgeTile', {
  color: 0x883726, roughness: 0.75,
});
std('ironGreen', {
  color: 0x244d39, roughness: 0.5, metalness: 0.3,
});
std('ironGreenDark', {
  color: 0x183a2b, roughness: 0.48, metalness: 0.35,
});
std('metalDark', {
  color: 0x29302d, roughness: 0.45, metalness: 0.45,
});
std('metalLight', {
  color: 0xc9c5b6, roughness: 0.32, metalness: 0.62,
});
std('brass', {
  color: 0xc49c4f, roughness: 0.3, metalness: 0.8,
});
std('gold', {
  color: 0xd9b15d, roughness: 0.52, metalness: 0.32,
});
std('orange', {
  color: 0xd98a39, roughness: 0.5, metalness: 0.1,
});
std('red', {
  color: 0xa82820, roughness: 0.75,
});
std('redDark', {
  color: 0x7a1d18, roughness: 0.8,
});
std('stageRed', {
  color: 0xa62b22, roughness: 0.8,
});
std('doorWood', {
  color: 0x7a4c2d, roughness: 0.62,
});
std('doorTeal', {
  color: 0x355f5e, roughness: 0.58,
});
std('doorBlue', {
  color: 0x385a7b, roughness: 0.6,
});
std('wood', {
  color: 0x6f4e32, roughness: 0.8,
});
std('trunk', {
  color: 0x5b4631, roughness: 0.96,
});
std('trunkLight', {
  color: 0x796149, roughness: 0.95,
});
std('leafDeep', {
  color: 0x2f572f, roughness: 0.95, flatShading: true,
});
std('leaf', {
  color: 0x47763a, roughness: 0.95, flatShading: true,
});
std('leafLight', {
  color: 0x648b40, roughness: 0.95, flatShading: true,
});
std('leafWarm', {
  color: 0x789546, roughness: 0.95, flatShading: true,
});
std('palmLeaf', {
  color: 0x40723f, roughness: 0.9, side: THREE.DoubleSide, flatShading: true,
});
std('mulch', {
  color: 0x5a4835, roughness: 1,
});
std('flowerPink', {
  color: 0xd97c91, roughness: 0.8, flatShading: true,
});
std('flowerYellow', {
  color: 0xe1bc57, roughness: 0.8, flatShading: true,
});
std('flowerRed', {
  color: 0xc44b43, roughness: 0.8, flatShading: true,
});
std('flowerWhite', {
  color: 0xeee7d7, roughness: 0.8, flatShading: true,
});
std('shrub', {
  color: 0x4e743d, roughness: 0.96, flatShading: true,
});
std('shrubLight', {
  color: 0x6a8b4b, roughness: 0.96, flatShading: true,
});
std('terracotta', {
  color: 0xa85e43, roughness: 0.86,
});
std('ceramicBlue', {
  color: 0x567d8a, roughness: 0.7,
});
std('lampMetal', {
  color: 0x26342a, roughness: 0.4, metalness: 0.5,
});
std('lampGlass', {
  color: 0xffe3ae, roughness: 0.42, emissive: 0xffb64f, emissiveIntensity: 0.16,
}, { castShadow: false });
std('windowDark', {
  color: 0x27444f, roughness: 0.18, metalness: 0.28,
  emissive: 0x000000, envMapIntensity: 1.3,
}, { castShadow: false, receiveShadow: false });
std('windowLit', {
  color: 0x2b4650, roughness: 0.2, metalness: 0.24,
  emissive: 0xffbb68, emissiveIntensity: 0, envMapIntensity: 1.2,
}, { castShadow: false, receiveShadow: false });
std('skin', {
  color: 0xb67c58, roughness: 0.82,
});
std('hair', {
  color: 0x231c17, roughness: 0.95,
});
std('uniformWhite', {
  color: 0xece8dc, roughness: 0.84,
});
std('uniformBlue', {
  color: 0x273f62, roughness: 0.82,
});
std('scarf', {
  color: 0xb72923, roughness: 0.8,
});
std('strawHat', {
  color: 0xe2d4ae, roughness: 0.92, side: THREE.DoubleSide,
});
std('courtLine', {
  color: 0xf4edda, roughness: 0.7, transparent: true, opacity: 0.68,
}, { castShadow: false });
// Memorial bust (campus/memorialBust.js): polished granite pedestal, pale carved stone bust.
std('granite', {
  color: 0xe2bfb6, map: graniteTex, roughness: 0.4, metalness: 0.04,
});
std('graniteGrey', {
  color: 0x9c9fa0, map: graniteTex, roughness: 0.36, metalness: 0.06,
});
std('bustStone', {
  color: 0xe6dcc5, roughness: 0.9,
});
std('bustDark', {
  color: 0x33302d, roughness: 0.82,
});
std('bicycleRack', {
  color: 0x666f6c, roughness: 0.45, metalness: 0.5,
});
// Main gate (campus/gate.js): pale-yellow render and the ochre accent lines.
std('gateWall', {
  color: 0xf3da94, map: stuccoTex, roughness: 0.85,
});
std('gateOchre', {
  color: 0xd99a3e, map: stuccoTex, roughness: 0.78,
});
// Teachers' Day check-in corner (campus/teachersDayBooth.js). The two palette materials take
// their colour from a swatch texture: glossy for balloons, matte and two-sided for paper,
// cloth and pennants. Fairy bulbs and lanterns light up with the courtyard lamps.
std('festGloss', {
  color: 0xffffff, map: festiveTex, roughness: 0.26, metalness: 0.04,
}, { envMapIntensity: 0.9 });
std('festMatte', {
  color: 0xffffff, map: festiveTex, roughness: 0.84, side: THREE.DoubleSide,
});
std('fairyBulb', {
  color: 0xfff1cf, roughness: 0.4, emissive: 0xffc267, emissiveIntensity: 0.5,
}, { castShadow: false, receiveShadow: false });
std('lantern', {
  color: 0xd5352c, roughness: 0.55, emissive: 0xff5a26, emissiveIntensity: 0.06,
}, { receiveShadow: false });

addSignMaterial('signGate', gateSignTex);
addSignMaterial('signGateSmall', gateSignSmallTex);
addSignMaterial('signSideGate', sideGateSignTex);
addSignMaterial('signAdmin', adminSignTex);
addSignMaterial('signBanner', bannerTex);
addSignMaterial('signSlogan', sloganTex);
addSignMaterial('signStageBackdrop', stageBackdropTex);
addSignMaterial('signPlaque', bustPlaqueTex);
addSignMaterial('signTeachersDay', teachersDayBackdropTex);
addSignMaterial('signEventProps', eventPropsTex);

M.wall = MATS.get('wall').material;
M.windowLit = MATS.get('windowLit').material;
M.windowDark = MATS.get('windowDark').material;
M.lampGlass = MATS.get('lampGlass').material;
M.fairyBulb = MATS.get('fairyBulb').material;
M.lantern = MATS.get('lantern').material;
M.brick = MATS.get('brick').material;
M.brickLane = MATS.get('brickLane').material;
M.court = MATS.get('court').material;
M.concrete = MATS.get('concrete').material;
M.asphalt = MATS.get('asphalt').material;
M.asphaltBack = MATS.get('asphaltBack').material;
M.grass = MATS.get('grass').material;

export function ensureBuildMaterials() {
  if (!MATS.has('fabricAwning')) {
    std('fabricAwning', {
      color: 0x173a2c, roughness: 0.97, metalness: 0.0, side: THREE.DoubleSide,
    });
  }
  if (!MATS.has('roofShed')) {
    std('roofShed', {
      color: 0x858b87, map: corrugationTex, roughness: 0.8, metalness: 0.05,
      side: THREE.DoubleSide,
    });
  }
  if (!MATS.has('timber')) {
    std('timber', { color: 0x6a4a2e, roughness: 0.9 });
  }
}
