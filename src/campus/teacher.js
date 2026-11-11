/**
 * The courtyard teacher: a woman in áo dài holding the class register, standing in the middle
 * of the yard. Unlike the batched scenery she is a real, jointed Object3D: she breathes and
 * looks around, and while spoken to (interaction/dialogue.js) she turns to the listener and
 * gestures. Her place and speech live in data/teacher.js.
 */

import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { camera, scene } from '../core/engine.js';
import { damp, HALF_PI, TAU } from '../core/math.js';
import { addSolidCircle } from '../geometry/colliders.js';
import { TEACHER } from '../data/teacher.js';

// The figure is modelled 1.83 m tall; scaled she stands about 1.6 m, a head above the pupils.
const SCALE = 0.875;
const HIP_HEIGHT = 0.86;
const HEAD_TOP = 1.85;

const LOOKS = {
  young: {
    aodai: 0xe8619f, silkPants: 0xf4f1ea, shoes: 0xf3d3e2, hair: 0x18181b, skin: 0xe9c3a6,
    velvet: false, glasses: null, pearls: false, wrinkles: 0, hairStyle: 'long',
  },
  middle: {
    aodai: 0x0d9488, silkPants: 0xf3ecc0, shoes: 0x1e293b, hair: 0x27272a, skin: 0xe6b99c,
    velvet: false, glasses: 'rect', pearls: true, wrinkles: 1, hairStyle: 'lowBun',
  },
  senior: {
    aodai: 0x881337, silkPants: 0xf1dc8c, shoes: 0x27272a, hair: 0xc3cbd6, skin: 0xdfb094,
    velvet: true, glasses: 'round', pearls: true, wrinkles: 2, hairStyle: 'bun',
  },
};

let root = null;
let pickProxy = null;
let joints = null;
let talking = false;
let talkBlend = 0;

function std(color, roughness, extra) {
  const material = new THREE.MeshStandardMaterial({ color, roughness, ...extra });
  material.envMapIntensity = 0.38;
  return material;
}

/** A pivot that is animated on its own; everything rigidly attached to it gets merged. */
function joint(parent, x = 0, y = 0, z = 0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.userData.joint = true;
  parent.add(group);
  return group;
}

/** A rigid sub-assembly (a shoe, the book): only there to carry a shared transform. */
function rigid(parent, x = 0, y = 0, z = 0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);
  return group;
}

function part(parent, geometry, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  parent.add(mesh);
  return mesh;
}

/**
 * Collapse the many small meshes hanging off each joint into one mesh per material, so the
 * whole figure costs a couple of dozen draw calls instead of well over sixty. Joints must be
 * direct children of joints.
 */
function bake(jointGroup) {
  const buckets = new Map();
  const collect = (node, matrix) => {
    for (const child of [...node.children]) {
      if (child.userData.joint) {
        bake(child);
        continue;
      }
      child.updateMatrix();
      const childMatrix = matrix.clone().multiply(child.matrix);
      if (child.isMesh) {
        const geometry = child.geometry.clone().applyMatrix4(childMatrix);
        if (!buckets.has(child.material)) buckets.set(child.material, []);
        buckets.get(child.material).push(geometry);
      } else {
        collect(child, childMatrix);
      }
      node.remove(child);
    }
  };
  collect(jointGroup, new THREE.Matrix4());
  for (const [material, geometries] of buckets) {
    const mesh = new THREE.Mesh(mergeGeometries(geometries, false), material);
    // She casts a shadow but takes none: the shadow map is baked once at boot, so a figure
    // that moves would otherwise be shaded by her own stale silhouette.
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    jointGroup.add(mesh);
    for (const geometry of geometries) geometry.dispose();
  }
}

function buildFigure(look) {
  const mat = {
    skin: std(look.skin, 0.62),
    hair: std(look.hair, 0.75),
    shoe: std(look.shoes, 0.4),
    pants: std(look.silkPants, 0.35),
    aodai: std(look.aodai, look.velvet ? 0.65 : 0.38, { side: THREE.DoubleSide }),
    pearl: std(0xf6f2ea, 0.15, { metalness: 0.1 }),
    gold: std(0xe0aa2c, 0.25, { metalness: 0.85 }),
    dark: std(0x18181b, 0.3, { metalness: 0.2 }),
    eye: std(0x0f172a, 0.35),
    eyeWhite: std(0xf4f4f4, 0.4),
    smile: std(0xb5173f, 0.6),
    blush: std(0xe08a82, 0.7),
    wrinkle: std(0xa8734f, 0.8),
    badge: std(0x1d4ed8, 0.3),
    bookCover: std(0x1e3a8a, 0.5),
    paper: std(0xf2efe6, 0.7),
  };

  const figure = new THREE.Group();
  figure.scale.setScalar(SCALE);

  // Hips, silk trousers and heeled shoes.
  const hips = joint(figure, 0, HIP_HEIGHT, 0);
  part(hips, new THREE.BoxGeometry(0.31, 0.14, 0.21), mat.pants);
  for (const side of [1, -1]) {
    const leg = rigid(hips, side * 0.09, -0.05, 0);
    part(leg, new THREE.CylinderGeometry(0.082, 0.095, 0.76, 16), mat.pants, 0, -0.38, 0);
    const shoe = rigid(leg, 0, -0.77, 0.025);
    part(shoe, new THREE.BoxGeometry(0.095, 0.05, 0.21), mat.shoe);
    part(shoe, new THREE.CylinderGeometry(0.015, 0.012, 0.06, 8), mat.shoe, 0, -0.01, -0.07);
  }

  // Áo dài: fitted bodice, standing collar, the row of buttons running to her right arm.
  const torso = joint(hips, 0, 0.07, 0);
  part(torso, new THREE.BoxGeometry(0.31, 0.48, 0.195), mat.aodai, 0, 0.24, 0);
  part(torso, new THREE.CylinderGeometry(0.065, 0.07, 0.045, 16), mat.aodai, 0, 0.495, 0);
  for (let i = 0; i < 4; i++) {
    part(torso, new THREE.SphereGeometry(0.007, 8, 8), mat.pearl, -0.02 - i * 0.028, 0.46 - i * 0.032, 0.1);
  }
  part(torso, new THREE.BoxGeometry(0.06, 0.025, 0.012), mat.badge, 0.085, 0.37, 0.105);
  if (look.pearls) {
    const necklace = part(torso, new THREE.TorusGeometry(0.074, 0.011, 8, 20), mat.pearl, 0, 0.465, 0.01);
    necklace.rotation.x = HALF_PI + 0.15;
  }

  // The two long panels of the dress hinge at the waist and sway.
  const flapGeometry = new THREE.BoxGeometry(0.3, 0.68, 0.012);
  flapGeometry.translate(0, -0.34, 0);
  const frontFlap = joint(torso, 0, 0.02, 0.104);
  part(frontFlap, flapGeometry, mat.aodai);
  const backFlap = joint(torso, 0, 0.02, -0.104);
  part(backFlap, flapGeometry, mat.aodai);

  // Arms: her left (+X) wears a watch, her right holds the class register.
  const arm = (side) => {
    const shoulder = joint(torso, side * 0.195, 0.43, 0);
    part(shoulder, new THREE.CylinderGeometry(0.052, 0.046, 0.24, 12), mat.aodai, 0, -0.1, 0);
    const forearm = joint(shoulder, 0, -0.21, 0);
    part(forearm, new THREE.CylinderGeometry(0.044, 0.036, 0.23, 12), mat.aodai, 0, -0.1, 0);
    part(forearm, new THREE.SphereGeometry(0.042, 12, 12), mat.skin, 0, -0.24, 0);
    if (side > 0) {
      part(forearm, new THREE.CylinderGeometry(0.039, 0.039, 0.025, 12), mat.dark, 0, -0.2, 0);
      const face = part(forearm, new THREE.CylinderGeometry(0.018, 0.018, 0.01, 12), mat.gold, 0.038, -0.2, 0);
      face.rotation.z = HALF_PI;
    } else {
      const book = rigid(forearm, -0.02, -0.25, 0.06);
      book.rotation.set(0.3, 0.2, -0.2);
      part(book, new THREE.BoxGeometry(0.18, 0.25, 0.028), mat.bookCover);
      part(book, new THREE.BoxGeometry(0.17, 0.24, 0.022), mat.paper, 0.006, 0, 0);
      part(book, new THREE.BoxGeometry(0.09, 0.04, 0.03), mat.gold, 0, 0.05, 0);
    }
    return { shoulder, forearm };
  };
  const leftArm = arm(1);
  const rightArm = arm(-1);

  // Head and face.
  const head = joint(torso, 0, 0.5, 0);
  part(head, new THREE.CylinderGeometry(0.052, 0.06, 0.1, 12), mat.skin, 0, 0.04, 0);
  part(head, new THREE.SphereGeometry(0.172, 24, 20), mat.skin, 0, 0.21, 0).scale.set(1, 1.08, 0.96);
  for (const side of [-1, 1]) {
    part(head, new THREE.SphereGeometry(0.035, 10, 10), mat.skin, side * 0.168, 0.205, -0.01).scale.set(0.5, 1, 0.7);
    part(head, new THREE.SphereGeometry(0.013, 8, 8), mat.pearl, side * 0.172, 0.17, -0.005);
    part(head, new THREE.SphereGeometry(0.018, 12, 12), mat.eye, side * 0.06, 0.215, 0.153).scale.set(1, 1.15, 0.5);
    part(head, new THREE.SphereGeometry(0.005, 8, 8), mat.eyeWhite, side * 0.064, 0.222, 0.162);
    part(head, new THREE.BoxGeometry(0.045, 0.011, 0.01), mat.hair, side * 0.06, 0.255, 0.154).rotation.z = side * -0.05;
    if (look.wrinkles === 0) {
      part(head, new THREE.CircleGeometry(0.022, 12), mat.blush, side * 0.092, 0.178, 0.152).rotation.y = side * 0.35;
    }
    if (look.wrinkles >= 1) {
      part(head, new THREE.BoxGeometry(0.004, 0.032, 0.004), mat.wrinkle, side * 0.045, 0.168, 0.16).rotation.z = side * 0.35;
    }
    // Soft fringe swept to each side.
    part(head, new THREE.ConeGeometry(0.055, 0.15, 8), mat.hair, side * 0.095, 0.29, 0.125)
      .rotation.set(Math.PI - 0.3, 0, side * -0.45);
  }
  if (look.wrinkles >= 2) {
    for (let i = 0; i < 2; i++) {
      part(head, new THREE.BoxGeometry(0.085, 0.004, 0.004), mat.wrinkle, 0, 0.295 + i * 0.016, 0.148);
    }
  }
  part(head, new THREE.ConeGeometry(0.016, 0.045, 8), mat.skin, 0, 0.195, 0.168).rotation.x = 0.25;
  part(head, new THREE.TorusGeometry(0.024, 0.005, 8, 16, Math.PI), mat.smile, 0, 0.162, 0.159).rotation.x = Math.PI;

  if (look.glasses) {
    const round = look.glasses === 'round';
    const frame = round ? mat.gold : mat.dark;
    const glasses = rigid(head, 0, 0.215, 0.162);
    for (const side of [-1, 1]) {
      const rim = part(glasses, new THREE.TorusGeometry(0.032, 0.004, round ? 8 : 4, round ? 20 : 4), frame, side * 0.058, 0, 0);
      if (!round) rim.rotation.z = Math.PI / 4;
    }
    part(glasses, new THREE.BoxGeometry(0.03, 0.004, 0.004), frame);
  }

  // Hair: a cap over the skull, then the style that goes with her age.
  const cap = part(head, new THREE.SphereGeometry(0.18, 24, 16, 0, TAU, 0, Math.PI * 0.56), mat.hair, 0, 0.218, 0);
  cap.scale.set(1.02, 1.07, 1.02);
  cap.rotation.x = -0.15;
  if (look.hairStyle === 'long') {
    part(head, new THREE.BoxGeometry(0.32, 0.48, 0.09), mat.hair, 0, 0.04, -0.13).rotation.x = 0.08;
  } else if (look.hairStyle === 'lowBun') {
    part(head, new THREE.SphereGeometry(0.085, 16, 16), mat.hair, 0, 0.14, -0.18).scale.set(1.15, 0.9, 0.9);
    part(head, new THREE.CylinderGeometry(0.006, 0.003, 0.2, 8), mat.gold, 0, 0.15, -0.22).rotation.z = HALF_PI - 0.2;
  } else {
    part(head, new THREE.SphereGeometry(0.09, 16, 16), mat.hair, 0, 0.2, -0.185);
    part(head, new THREE.TorusGeometry(0.055, 0.008, 8, 16), mat.gold, 0, 0.2, -0.15);
  }

  bake(hips);
  return { figure, joints: { hips, head, leftArm, rightArm, frontFlap, backFlap } };
}

export function buildTeacher() {
  const built = buildFigure(LOOKS[TEACHER.look] ?? LOOKS.young);
  joints = built.joints;
  root = new THREE.Group();
  root.name = 'teacher';
  root.position.set(TEACHER.x, 0, TEACHER.z);
  root.rotation.y = TEACHER.yaw;
  root.add(built.figure);
  scene.add(root);
  addSolidCircle(TEACHER.x, TEACHER.z, 0.26);

  // Invisible box that pointer picking aims at (see interaction/picking.js).
  const height = HEAD_TOP * SCALE + 0.1;
  pickProxy = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, height, 0.8),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  pickProxy.position.set(TEACHER.x, height / 2, TEACHER.z);
  pickProxy.userData.npc = 'teacher';
  scene.add(pickProxy);

  updateTeacher(0, 0);
}

export function getTeacherPickProxy() {
  return pickProxy;
}

/** World point just above her head, where the speech bubble is anchored. */
export function getTeacherAnchor(out) {
  return out.set(TEACHER.x, HEAD_TOP * SCALE + 0.14, TEACHER.z);
}

/** While talking she faces the camera and gestures; otherwise she idles. */
export function setTeacherTalking(value) {
  talking = value;
}

/** Per-frame, from animate(): blend between the idle and the "explaining" pose. */
export function updateTeacher(t, dt) {
  if (!root) return;
  talkBlend = damp(talkBlend, talking ? 1 : 0, 5, dt);
  const k = talkBlend;
  const mix = (idle, teach) => idle + (teach - idle) * k;

  // Turn towards the listener by the shortest way round.
  const facing = talking
    ? Math.atan2(camera.position.x - TEACHER.x, camera.position.z - TEACHER.z)
    : TEACHER.yaw;
  const turn = Math.atan2(Math.sin(facing - root.rotation.y), Math.cos(facing - root.rotation.y));
  root.rotation.y += turn * (1 - Math.exp(-4.5 * dt));

  const { hips, head, leftArm, rightArm, frontFlap, backFlap } = joints;
  hips.position.y = HIP_HEIGHT + mix(Math.sin(t * 1.8) * 0.006, Math.sin(t * 2.2) * 0.008);

  // Her left hand hangs relaxed, or opens out to make a point.
  leftArm.shoulder.rotation.set(
    mix(Math.sin(t * 1.5) * 0.04, -0.65 + Math.sin(t * 3.5) * 0.18),
    mix(0, 0.25),
    mix(-0.08, -0.25),
  );
  leftArm.forearm.rotation.x = mix(-0.15, -0.7 + Math.cos(t * 3.5) * 0.15);
  // Her right arm keeps the register against her chest.
  rightArm.shoulder.rotation.set(mix(-0.25, -0.4), mix(-0.1, -0.2), mix(0.12, 0.15));
  rightArm.forearm.rotation.set(mix(-0.85, -1.0), mix(0.3, 0.4), 0);

  head.rotation.y = mix(Math.sin(t * 0.7) * 0.1, Math.sin(t * 1.8) * 0.07);
  head.rotation.x = mix(0, Math.sin(t * 3.5) * 0.05);

  const sway = Math.abs(Math.sin(t * 2.2) * 0.02);
  frontFlap.rotation.x = -0.04 - sway;
  backFlap.rotation.x = 0.04 + sway;
}
