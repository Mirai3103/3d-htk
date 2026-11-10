/**
 * Environment-map, lamp-glow and moon textures used by lighting and the sky.
 */

import * as THREE from 'three';
import { TAU } from '../core/math.js';
import { makeCanvas } from './canvas.js';

function makeEnvironmentTexture(top, horizon, ground, sunColor) {
  const canvas = makeCanvas(512, 256, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, top);
    g.addColorStop(0.47, horizon);
    g.addColorStop(0.54, horizon);
    g.addColorStop(1, ground);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const sun = ctx.createRadialGradient(w * 0.76, h * 0.27, 0, w * 0.76, h * 0.27, 75);
    sun.addColorStop(0, sunColor);
    sun.addColorStop(0.16, sunColor.replace('rgb', 'rgba').replace(')', ',0.62)'));
    sun.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, w, h);
    const cloud = ctx.createRadialGradient(w * 0.25, h * 0.32, 3, w * 0.25, h * 0.32, 120);
    cloud.addColorStop(0, 'rgba(255,255,255,0.22)');
    cloud.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = cloud;
    ctx.fillRect(0, 0, w, h);
  });
  const t = new THREE.CanvasTexture(canvas);
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

function makeGlowTexture(warm = true) {
  const canvas = makeCanvas(128, 128, (ctx, w, h) => {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    if (warm) {
      g.addColorStop(0, 'rgba(255, 247, 207, 1)');
      g.addColorStop(0.16, 'rgba(255, 215, 136, 0.92)');
      g.addColorStop(0.44, 'rgba(255, 183, 84, 0.3)');
      g.addColorStop(1, 'rgba(255, 170, 70, 0)');
    } else {
      g.addColorStop(0, 'rgba(236, 245, 255, 1)');
      g.addColorStop(0.15, 'rgba(197, 220, 244, 0.85)');
      g.addColorStop(0.5, 'rgba(156, 193, 229, 0.18)');
      g.addColorStop(1, 'rgba(130, 170, 215, 0)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export const glowTex = makeGlowTexture(true);

function makeMoonTexture() {
  const canvas = makeCanvas(256, 256, (ctx, w, h) => {
    const halo = ctx.createRadialGradient(128, 128, 40, 128, 128, 124);
    halo.addColorStop(0, 'rgba(248, 244, 220, 0.2)');
    halo.addColorStop(0.42, 'rgba(238, 239, 228, 0.09)');
    halo.addColorStop(1, 'rgba(230, 238, 246, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, w, h);
    const disc = ctx.createRadialGradient(113, 110, 5, 128, 128, 52);
    disc.addColorStop(0, '#fffdf0');
    disc.addColorStop(0.55, '#f6f0d9');
    disc.addColorStop(0.88, '#e6dec6');
    disc.addColorStop(1, '#d4ccb5');
    ctx.beginPath();
    ctx.arc(128, 128, 46, 0, TAU);
    ctx.fillStyle = disc;
    ctx.fill();
    const craters = [
      [108, 110, 8, 0.11], [143, 121, 11, 0.09], [121, 151, 7, 0.1],
      [150, 149, 5, 0.08], [98, 139, 5, 0.07], [132, 96, 4, 0.08],
    ];
    for (const [x, y, r, alpha] of craters) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TAU);
      ctx.fillStyle = `rgba(119, 122, 115, ${alpha})`;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(128, 128, 46, 0, TAU);
    ctx.strokeStyle = 'rgba(255, 250, 231, 0.38)';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.needsUpdate = true;
  return t;
}

export const moonTex = makeMoonTexture();

export const ENV_TEXTURES = {
  sunny: makeEnvironmentTexture('#4b9bdc', '#d8edf5', '#6c7a57', 'rgb(255,244,204)'),
  cloudy: makeEnvironmentTexture('#8e9aa4', '#d5d9da', '#6b7167', 'rgb(242,245,244)'),
  rain: makeEnvironmentTexture('#46545d', '#829097', '#4d5652', 'rgb(192,208,214)'),
  night: makeEnvironmentTexture('#050b18', '#1e2e47', '#14160f', 'rgb(179,199,237)'),
};
