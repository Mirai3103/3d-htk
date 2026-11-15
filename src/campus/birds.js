/**
 * A small flock of low-poly birds circling gently high above the sunny courtyard.
 */

import * as THREE from 'three';
import { scene } from '../core/engine.js';
import { seededRandom, TAU } from '../core/math.js';

const birds = [];

function createWingGeometry(side) {
  const geometry = new THREE.BufferGeometry();
  const s = side;
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0, 0, 0.09,
    0, 0, -0.09,
    s * 0.44, 0.03, -0.05,
  ]), 3));
  geometry.computeVertexNormals();
  return geometry;
}

export function buildBirds() {
  const rng = seededRandom(509);
  const material = new THREE.MeshLambertMaterial({
    color: 0xf4f2ea,
    side: THREE.DoubleSide,
  });
  const bodyGeom = new THREE.ConeGeometry(0.038, 0.24, 4);
  bodyGeom.rotateX(Math.PI / 2);
  const leftWingGeom = createWingGeometry(-1);
  const rightWingGeom = createWingGeometry(1);

  const count = 6;
  for (let i = 0; i < count; i++) {
    const group = new THREE.Group();
    group.name = `bird-${i}`;
    const body = new THREE.Mesh(bodyGeom, material);
    const leftWing = new THREE.Mesh(leftWingGeom, material);
    const rightWing = new THREE.Mesh(rightWingGeom, material);
    group.add(body, leftWing, rightWing);

    const scale = 0.85 + rng() * 0.35;
    group.scale.setScalar(scale);
    scene.add(group);

    birds.push({
      group,
      leftWing,
      rightWing,
      cx: 4 + (rng() - 0.5) * 14,
      cz: 2 + (rng() - 0.5) * 12,
      rx: 22 + rng() * 14,
      rz: 16 + rng() * 10,
      baseY: 22 + rng() * 6,
      speed: (0.14 + rng() * 0.06) * (i % 2 === 0 ? 1 : -1),
      phase: (i / count) * TAU + rng() * 0.5,
      flapSpeed: 7.5 + rng() * 2.5,
      flapOffset: rng() * TAU,
    });
  }
}

export function updateBirds(t) {
  for (const b of birds) {
    const angle = b.phase + t * b.speed;
    const x = b.cx + Math.cos(angle) * b.rx;
    const z = b.cz + Math.sin(angle) * b.rz;
    const y = b.baseY + Math.sin(t * 0.65 + b.phase) * 1.1;

    const dx = -Math.sin(angle) * b.rx * b.speed;
    const dz = Math.cos(angle) * b.rz * b.speed;

    b.group.position.set(x, y, z);
    b.group.rotation.set(0, Math.atan2(dx, dz), (b.speed > 0 ? -1 : 1) * 0.14);

    // Alternate between gentle wingbeats and short glides.
    const glide = Math.max(0, Math.sin(t * 0.7 + b.flapOffset));
    const flap = Math.sin(t * b.flapSpeed + b.flapOffset) * (0.18 + 0.42 * glide);
    b.leftWing.rotation.z = -flap;
    b.rightWing.rotation.z = flap;
  }
}
