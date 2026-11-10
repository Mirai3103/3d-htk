/**
 * Text signs, banners, plaques and the national flag, painted onto canvases.
 */

import * as THREE from 'three';
import { maxAnisotropy } from '../core/engine.js';
import { drawStar, fitText, makeCanvas, signTexture } from './canvas.js';

// Main gate name board, after the real one: cream board, thick ochre frame, navy lettering.
export const gateSignTex = signTexture((ctx, w, h) => {
  const font = '"Segoe UI", Arial, sans-serif';
  const frame = 22;
  ctx.fillStyle = '#d4913a';
  ctx.fillRect(0, 0, w, h);
  const board = ctx.createLinearGradient(0, frame, 0, h - frame);
  board.addColorStop(0, '#fbf3d8');
  board.addColorStop(1, '#f0e1b4');
  ctx.fillStyle = board;
  ctx.fillRect(frame, frame, w - frame * 2, h - frame * 2);
  ctx.strokeStyle = 'rgba(110, 62, 18, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(frame + 1.5, frame + 1.5, w - frame * 2 - 3, h - frame * 2 - 3);

  const ink = '#1b2241';
  const raised = (text, x, y) => {
    ctx.fillStyle = 'rgba(40, 30, 10, 0.28)';
    ctx.fillText(text, x + 2.5, y + 2.5);
    ctx.fillStyle = ink;
    ctx.fillText(text, x, y);
  };
  ctx.textAlign = 'center';
  ctx.font = `700 38px ${font}`;
  raised('ỦY BAN NHÂN DÂN HUYỆN NGHĨA HÀNH', w / 2 + 40, 88);
  const mainText = 'TRƯỜNG THCS HUỲNH THÚC KHÁNG';
  const mainSize = fitText(ctx, mainText, w - 150, 86, font, 900);
  ctx.font = `900 ${mainSize}px ${font}`;
  raised(mainText, w / 2, 198);
  ctx.textAlign = 'left';
  ctx.font = `700 32px ${font}`;
  raised('ĐC: PHÚ VINH TÂY - TT. CHỢ CHÙA - H.NGHĨA HÀNH', frame + 30, 274);
}, 1536, 322);

export const gateSignSmallTex = signTexture((ctx, w, h) => {
  ctx.fillStyle = '#f4e7c8';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#b7914d';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, w - 16, h - 16);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2b3a49';
  ctx.font = '800 52px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TRƯỜNG THCS', w / 2, 120);
  ctx.font = '900 66px "Segoe UI", Arial, sans-serif';
  ctx.fillText('HUỲNH THÚC KHÁNG', w / 2, 205);
  ctx.font = '500 24px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#6f684f';
  ctx.fillText('NĂM HỌC 2026 – 2027', w / 2, 252);
});

export const adminSignTex = signTexture((ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, '#173d55');
  g.addColorStop(1, '#0c2c3d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#d9b873';
  ctx.lineWidth = 5;
  ctx.strokeRect(7, 7, w - 14, h - 14);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbf2dc';
  ctx.font = '800 72px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TRƯỜNG THCS HUỲNH THÚC KHÁNG', w / 2, h * 0.59);
  ctx.fillStyle = '#d9bd7f';
  ctx.font = '600 22px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TIÊN HỌC LỄ · HẬU HỌC VĂN', w / 2, h * 0.82);
}, 2048, 250);

export const bannerTex = signTexture((ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#173f69');
  bg.addColorStop(1, '#0d2e50');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#d8b361';
  ctx.lineWidth = 3;
  ctx.strokeRect(7, 7, w - 14, h - 14);
  ctx.fillStyle = '#f4dd9d';
  ctx.textAlign = 'center';
  ctx.font = '800 55px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TIÊN HỌC LỄ  ·  HẬU HỌC VĂN', w / 2, h * 0.66);
  ctx.textAlign = 'left';
  ctx.font = '600 20px "Segoe UI", Arial, sans-serif';
  ctx.fillStyle = 'rgba(242, 222, 160, 0.58)';
  ctx.fillText('THCS HUỲNH THÚC KHÁNG', 38, h * 0.72);
  ctx.textAlign = 'right';
  ctx.fillText('NGHĨA HÀNH · QUẢNG NGÃI', w - 38, h * 0.72);
}, 2048, 128);

export const stageBackdropTex = signTexture((ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#a82b22');
  g.addColorStop(1, '#7d1515');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(244, 204, 102, 0.7)';
  ctx.lineWidth = 9;
  ctx.strokeRect(18, 18, w - 36, h - 36);
  ctx.strokeStyle = 'rgba(244, 204, 102, 0.24)';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, w - 72, h - 72);
  ctx.fillStyle = '#f0cb72';
  drawStar(ctx, w / 2, 145, 43, 17);
  ctx.fill();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff3d9';
  ctx.font = '900 59px "Segoe UI", Arial, sans-serif';
  ctx.fillText('TRƯỜNG THCS HUỲNH THÚC KHÁNG', w / 2, 275);
  ctx.fillStyle = '#f2d595';
  ctx.font = '600 32px "Segoe UI", Arial, sans-serif';
  ctx.fillText('NGÀY HỘI KHAI GIẢNG', w / 2, 340);
}, 1024, 410);

export const bustPlaqueTex = signTexture((ctx, w, h) => {
  ctx.fillStyle = '#d7cbb3';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#8d7d5e';
  ctx.lineWidth = 5;
  ctx.strokeRect(7, 7, w - 14, h - 14);
  ctx.fillStyle = '#5b523f';
  ctx.textAlign = 'center';
  ctx.font = '700 33px "Segoe UI", Arial, sans-serif';
  ctx.fillText('CHỦ TỊCH', w / 2, h * 0.44);
  ctx.font = '700 29px "Segoe UI", Arial, sans-serif';
  ctx.fillText('HỒ CHÍ MINH', w / 2, h * 0.67);
}, 420, 260);

const flagCanvas = makeCanvas(512, 320, (ctx, w, h) => {
  ctx.fillStyle = '#cf251e';
  ctx.fillRect(0, 0, w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, 'rgba(255, 160, 95, 0.2)');
  g.addColorStop(0.45, 'rgba(255, 255, 255, 0.035)');
  g.addColorStop(1, 'rgba(80, 0, 0, 0.18)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#f1c733';
  drawStar(ctx, w / 2, h / 2, 93, 36);
  ctx.fill();
});
export const flagTex = new THREE.CanvasTexture(flagCanvas);
flagTex.colorSpace = THREE.SRGBColorSpace;
flagTex.anisotropy = Math.min(8, maxAnisotropy);
