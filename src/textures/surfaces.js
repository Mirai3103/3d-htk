/**
 * Tiling surface textures: stucco, brick, grass, asphalt, concrete, sports court,
 * corrugated metal, roof tiles, speckled granite.
 */

import { HALF_PI, seededRandom, TAU } from '../core/math.js';
import { canvasTexture, makeCanvas, rgba } from './canvas.js';

const stuccoCanvas = makeCanvas(256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#fbf8ee';
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(11);
  for (let i = 0; i < 3800; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const alpha = rng() * 0.04;
    ctx.fillStyle = rng() > 0.5 ? rgba(112, 94, 65, alpha) : rgba(255, 255, 255, alpha * 1.5);
    ctx.fillRect(x, y, 1 + rng() * 1.4, 1 + rng() * 1.2);
  }
  ctx.globalAlpha = 0.025;
  ctx.strokeStyle = '#5b533e';
  for (let y = 12; y < h; y += 36) {
    ctx.beginPath();
    ctx.moveTo(0, y + rng() * 8);
    ctx.lineTo(w, y + rng() * 8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
});
export const stuccoTex = canvasTexture(stuccoCanvas, 2, 2);

const brickCanvas = makeCanvas(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#b9bbb0';
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(37);
  const cols = 8;
  const rows = 8;
  const bw = w / cols;
  const bh = h / rows;
  const tones = [
    [182, 91, 78], [196, 105, 91], [170, 78, 69], [204, 116, 99],
    [190, 98, 82], [179, 86, 73], [199, 111, 95], [169, 81, 74],
  ];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const tone = tones[(x * 3 + y * 5 + Math.floor(rng() * 8)) % tones.length];
      const jitter = (rng() - 0.5) * 12;
      ctx.fillStyle = rgba(tone[0] + jitter, tone[1] + jitter, tone[2] + jitter);
      ctx.fillRect(x * bw + 1.5, y * bh + 1.5, bw - 3, bh - 3);
      ctx.globalAlpha = 0.12;
      ctx.fillStyle = '#fff3d9';
      ctx.fillRect(x * bw + 3, y * bh + 3, bw - 6, 1.1);
      ctx.fillStyle = '#4b2b26';
      ctx.fillRect(x * bw + 3, y * bh + bh - 5, bw - 6, 1);
      ctx.globalAlpha = 1;
      for (let k = 0; k < 9; k++) {
        ctx.globalAlpha = rng() * 0.08;
        ctx.fillStyle = rng() > 0.5 ? '#3e221e' : '#ffd4b7';
        ctx.fillRect(x * bw + 4 + rng() * (bw - 9), y * bh + 4 + rng() * (bh - 9), 1.5, 1.5);
      }
      ctx.globalAlpha = 1;
    }
  }
  ctx.globalAlpha = 0.04;
  ctx.fillStyle = '#33211b';
  for (let i = 0; i < 1500; i++) {
    ctx.fillRect(rng() * w, rng() * h, 1, 1);
  }
  ctx.globalAlpha = 1;
});
export const brickTex = canvasTexture(brickCanvas, 15, 11);
export const laneBrickTex = canvasTexture(brickCanvas, 2.2, 12);
laneBrickTex.needsUpdate = true;

const grassCanvas = makeCanvas(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#7d9b58';
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(83);
  for (let i = 0; i < 9000; i++) {
    const x = rng() * w;
    const y = rng() * h;
    const v = rng();
    ctx.globalAlpha = 0.08 + rng() * 0.16;
    ctx.fillStyle = v > 0.58 ? '#b9c77a' : v > 0.24 ? '#52733b' : '#8eaa65';
    ctx.fillRect(x, y, 1.2, 2 + rng() * 3);
    ctx.fillRect(x + 1.4, y + rng() * 2, 1, 1.4 + rng() * 2);
  }
  ctx.globalAlpha = 1;
});
export const grassTex = canvasTexture(grassCanvas, 44, 32);

const asphaltCanvas = makeCanvas(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#535552';
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(51);
  for (let i = 0; i < 9000; i++) {
    const c = 55 + rng() * 65;
    ctx.globalAlpha = 0.12 + rng() * 0.25;
    ctx.fillStyle = rgba(c, c, c - 2);
    const r = rng() * 1.9 + 0.4;
    ctx.beginPath();
    ctx.arc(rng() * w, rng() * h, r, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 0.07;
  ctx.strokeStyle = '#1d211f';
  for (let i = 0; i < 12; i++) {
    ctx.beginPath();
    ctx.moveTo(rng() * w, rng() * h);
    ctx.lineTo(rng() * w, rng() * h);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
});
export const asphaltTex = canvasTexture(asphaltCanvas, 24, 2.2);
export const backRoadTex = canvasTexture(asphaltCanvas, 20, 1.5);
backRoadTex.needsUpdate = true;

const concreteCanvas = makeCanvas(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#c8c1b2';
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(91);
  for (let i = 0; i < 4200; i++) {
    ctx.globalAlpha = 0.04 + rng() * 0.08;
    const c = rng() > 0.55 ? 255 : 92;
    ctx.fillStyle = rgba(c, c - 2, c - 7);
    ctx.fillRect(rng() * w, rng() * h, 1 + rng() * 2, 1 + rng() * 2);
  }
  ctx.globalAlpha = 0.16;
  ctx.strokeStyle = '#8e897b';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  for (let x = 128; x < w; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 170; y < h; y += 170) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
});
export const concreteTex = canvasTexture(concreteCanvas, 9, 7);
const forecourtTex = canvasTexture(concreteCanvas, 4, 2);
forecourtTex.needsUpdate = true;

const courtCanvas = makeCanvas(640, 800, (ctx, w, h) => {
  ctx.fillStyle = '#858a85';
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(23);
  for (let i = 0; i < 6500; i++) {
    const c = rng() > 0.45 ? 70 + rng() * 70 : 145 + rng() * 40;
    ctx.globalAlpha = 0.16 + rng() * 0.08;
    ctx.fillStyle = rgba(c, c + 2, c);
    ctx.fillRect(rng() * w, rng() * h, 1 + rng() * 2, 1 + rng() * 2);
  }
  ctx.globalAlpha = 1;
  ctx.translate(w / 2, h / 2);
  ctx.strokeStyle = 'rgba(249, 245, 225, 0.58)';
  ctx.lineWidth = 4;
  ctx.strokeRect(-w * 0.41, -h * 0.42, w * 0.82, h * 0.84);
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-w * 0.41, 0);
  ctx.lineTo(w * 0.41, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, w * 0.075, 0, TAU);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(249, 245, 225, 0.36)';
  ctx.beginPath();
  ctx.arc(-w * 0.33, 0, w * 0.095, -HALF_PI, HALF_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w * 0.33, 0, w * 0.095, HALF_PI, -HALF_PI);
  ctx.stroke();
});
export const courtTex = canvasTexture(courtCanvas, 1, 1);

// Full-size outdoor basketball court (28 × 15 m playing area inside a 30 × 17 m slab).
const basketballCanvas = makeCanvas(840, 476, (ctx, w, h) => {
  ctx.fillStyle = '#4f6f68';
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(47);
  for (let i = 0; i < 9000; i++) {
    const c = rng() > 0.5 ? 255 : 30;
    ctx.globalAlpha = 0.025 + rng() * 0.05;
    ctx.fillStyle = rgba(c, c, c);
    ctx.fillRect(rng() * w, rng() * h, 1 + rng() * 2, 1 + rng() * 2);
  }
  ctx.globalAlpha = 1;
  const m = w / 30; // 28 px per metre
  const x0 = m;
  const x1 = w - m;
  const y0 = m;
  const y1 = h - m;
  ctx.strokeStyle = 'rgba(248, 246, 232, 0.72)';
  ctx.lineWidth = 3;
  ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
  ctx.beginPath();
  ctx.moveTo(w / 2, y0);
  ctx.lineTo(w / 2, y1);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w / 2, h / 2, 1.8 * m, 0, TAU);
  ctx.stroke();
  const keyW = 4.9 * m;
  const keyL = 5.8 * m;
  ctx.strokeRect(x0, h / 2 - keyW / 2, keyL, keyW);
  ctx.strokeRect(x1 - keyL, h / 2 - keyW / 2, keyL, keyW);
  ctx.beginPath();
  ctx.arc(x0 + keyL, h / 2, 1.8 * m, -HALF_PI, HALF_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x1 - keyL, h / 2, 1.8 * m, HALF_PI, -HALF_PI);
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, x1 - x0, y1 - y0);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(x0 + 1.575 * m, h / 2, 6.75 * m, -HALF_PI, HALF_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x1 - 1.575 * m, h / 2, 6.75 * m, HALF_PI, -HALF_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x0 + 1.575 * m, h / 2, 1.25 * m, -HALF_PI, HALF_PI);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x1 - 1.575 * m, h / 2, 1.25 * m, HALF_PI, -HALF_PI);
  ctx.stroke();
  ctx.restore();
});
export const basketballTex = canvasTexture(basketballCanvas, 1, 1);

const corrugationCanvas = makeCanvas(256, 128, (ctx, w, h) => {
  ctx.fillStyle = '#d9d9d4';
  ctx.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 8) {
    const g = ctx.createLinearGradient(x, 0, x + 8, 0);
    g.addColorStop(0, 'rgba(255,255,248,0.22)');
    g.addColorStop(0.45, 'rgba(0,0,0,0.06)');
    g.addColorStop(0.58, 'rgba(0,0,0,0.14)');
    g.addColorStop(1, 'rgba(255,255,255,0.19)');
    ctx.fillStyle = g;
    ctx.fillRect(x, 0, 8, h);
  }
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = '#222';
  for (let y = 18; y < h; y += 31) ctx.fillRect(0, y, w, 1);
  ctx.globalAlpha = 1;
});
export const corrugationTex = canvasTexture(corrugationCanvas, 1, 1);

const tileRoofCanvas = makeCanvas(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#a8412f';
  ctx.fillRect(0, 0, w, h);
  const rows = 10;
  const cols = 14;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const shade = (x + y) % 3 === 0 ? 0.93 : 1;
      ctx.fillStyle = `rgb(${Math.round(169 * shade)},${Math.round(68 * shade)},${Math.round(48 * shade)})`;
      ctx.fillRect(x * (w / cols), y * (h / rows), w / cols, h / rows);
    }
    ctx.strokeStyle = 'rgba(66, 23, 18, 0.26)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, y * (h / rows));
    ctx.lineTo(w, y * (h / rows));
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255, 208, 162, 0.14)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y * (h / rows) + 3);
    ctx.lineTo(w, y * (h / rows) + 3);
    ctx.stroke();
  }
  for (let x = 0; x < cols; x++) {
    ctx.strokeStyle = 'rgba(70, 24, 19, 0.18)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x * (w / cols), 0);
    ctx.lineTo(x * (w / cols), h);
    ctx.stroke();
  }
});
export const tileRoofTex = canvasTexture(tileRoofCanvas, 4, 3);

// Polished granite of the memorial pedestal. Painted in neutral greys so the material colour
// decides the stone (pink for the pedestal, grey for the riser under the bust).
const graniteCanvas = makeCanvas(512, 512, (ctx, w, h) => {
  ctx.fillStyle = '#c9c5c2';
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(149);
  const grains = [
    [58, 54, 54], [92, 88, 88], [140, 134, 132], [236, 230, 226], [255, 250, 246], [176, 160, 156],
  ];
  for (let i = 0; i < 17000; i++) {
    const tone = grains[Math.floor(rng() * grains.length)];
    const size = 1 + rng() * 2.4;
    ctx.fillStyle = rgba(tone[0], tone[1], tone[2], 0.3 + rng() * 0.55);
    ctx.fillRect(rng() * w, rng() * h, size, size * (0.6 + rng() * 0.8));
  }
});
export const graniteTex = canvasTexture(graniteCanvas, 2, 3);
