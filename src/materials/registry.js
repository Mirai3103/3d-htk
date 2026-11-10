/**
 * Material registry. Every batched material is registered under a string key (see
 * materials/library.js) and Builder calls refer to it by that key.
 */

import * as THREE from 'three';

export const MATS = new Map();
export const SIGN_MATERIALS = [];
export const GLOW_MATERIALS = [];

function addMaterial(key, material, options = {}) {
  material.envMapIntensity = options.envMapIntensity ?? 0.38;
  MATS.set(key, {
    material,
    castShadow: options.castShadow ?? true,
    receiveShadow: options.receiveShadow ?? true,
  });
  return material;
}

export function std(key, params, options) {
  return addMaterial(key, new THREE.MeshStandardMaterial(params), options);
}

export const M = {};

export function addSignMaterial(key, texture, options = {}) {
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    emissive: 0xffffff,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    roughness: 0.86,
    metalness: 0.0,
    toneMapped: true,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  material.envMapIntensity = 0.25;
  MATS.set(key, { material, castShadow: false, receiveShadow: false });
  SIGN_MATERIALS.push(material);
  return material;
}
