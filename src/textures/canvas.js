/**
 * Canvas 2D helpers for procedural textures (no image files are used anywhere).
 */

import * as THREE from 'three';
import { maxAnisotropy } from '../core/engine.js';

export function makeCanvas(w, h, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  draw(ctx, w, h);
  return canvas;
}

export function canvasTexture(canvas, repeatX = 1, repeatY = 1, srgb = true) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = Math.min(8, maxAnisotropy);
  texture.needsUpdate = true;
  return texture;
}

export function rgba(r, g, b, a = 1) { return `rgba(${r | 0},${g | 0},${b | 0},${a})`; }

export function drawStar(ctx, cx, cy, outer, inner, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / points;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** Heart path centred on (cx, cy), `size` wide; fill or stroke it afterwards. */
export function drawHeart(ctx, cx, cy, size) {
  const s = size / 1.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.5);
  ctx.bezierCurveTo(cx - s * 0.55, cy + s * 0.1, cx - s * 0.6, cy - s * 0.35, cx - s * 0.28, cy - s * 0.45);
  ctx.bezierCurveTo(cx - s * 0.1, cy - s * 0.5, cx, cy - s * 0.38, cx, cy - s * 0.25);
  ctx.bezierCurveTo(cx, cy - s * 0.38, cx + s * 0.1, cy - s * 0.5, cx + s * 0.28, cy - s * 0.45);
  ctx.bezierCurveTo(cx + s * 0.6, cy - s * 0.35, cx + s * 0.55, cy + s * 0.1, cx, cy + s * 0.5);
  ctx.closePath();
}

export function signTexture(draw, w = 1024, h = 288) {
  const c = makeCanvas(w, h, draw);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, maxAnisotropy);
  t.needsUpdate = true;
  return t;
}

export function fitText(ctx, text, maxWidth, startSize, fontFamily, weight = 700) {
  let size = startSize;
  do {
    ctx.font = `${weight} ${size}px ${fontFamily}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  } while (size > 10);
  return size;
}
