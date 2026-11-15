/**
 * Environment-map texture used by sunny lighting.
 */

import * as THREE from 'three';
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

export const sunnyEnvTex = makeEnvironmentTexture('#4b9bdc', '#d8edf5', '#6c7a57', 'rgb(255,244,204)');
