/**
 * Text signs, banners, plaques and the national flag, painted onto canvases.
 */

import * as THREE from 'three';
import { maxAnisotropy } from '../core/engine.js';
import { seededRandom } from '../core/math.js';
import { drawStar, fitText, makeCanvas, rgba, signTexture } from './canvas.js';

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

// East (secondary) gate: green board with white lettering and a red frame, as on the
// real gate photographed from the lane.
export const sideGateSignTex = signTexture((ctx, w, h) => {
  const font = '"Segoe UI", Arial, sans-serif';
  ctx.fillStyle = '#b63a2e';
  ctx.fillRect(0, 0, w, h);
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#1e8b74');
  bg.addColorStop(1, '#146b58');
  ctx.fillStyle = bg;
  ctx.fillRect(12, 12, w - 24, h - 24);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#f7f4e6';
  ctx.font = `700 28px ${font}`;
  ctx.fillText('PHÒNG GIÁO DỤC VÀ ĐÀO TẠO HUYỆN NGHĨA HÀNH', w / 2, 58);
  const mainText = 'TRƯỜNG TRUNG HỌC CƠ SỞ HUỲNH THÚC KHÁNG';
  const mainSize = fitText(ctx, mainText, w - 170, 86, font, 900);
  ctx.font = `900 ${mainSize}px ${font}`;
  ctx.fillText(mainText, w / 2, 141);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#f0dda6';
  ctx.font = `600 22px ${font}`;
  ctx.fillText('ĐT: 0255.3682222', w - 28, 181);
}, 2048, 200);

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

/** A navy slogan board: gold rule and the wording, nothing else. */
function makeSloganTex(slogan, width, height) {
  return signTexture((ctx, w, h) => {
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
    ctx.font = `800 ${Math.round(h * 0.43)}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText(slogan, w / 2, h * 0.72);
  }, width, height);
}

export const bannerTex = makeSloganTex('TIÊN HỌC LỄ  ·  HẬU HỌC VĂN', 2048, 128);
// Shorter board on the administration block, painted 8:1 to match its plaque.
export const sloganTex = makeSloganTex('THI ĐUA DẠY TỐT  ·  HỌC TỐT', 1024, 128);

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

// Memorial plaque, after the real one: dark red granite, engraved silver lettering, a double
// line border with a fret in each corner.
export const bustPlaqueTex = signTexture((ctx, w, h) => {
  const font = '"Times New Roman", "Liberation Serif", "DejaVu Serif", Georgia, serif';
  ctx.fillStyle = '#74161b';
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(211);
  for (let i = 0; i < 2600; i++) {
    ctx.fillStyle = rng() > 0.5 ? rgba(40, 6, 10, rng() * 0.3) : rgba(190, 70, 70, rng() * 0.16);
    ctx.fillRect(rng() * w, rng() * h, 1 + rng() * 2.4, 1 + rng() * 2);
  }

  const silver = '#eee6da';
  ctx.strokeStyle = silver;
  ctx.lineWidth = 4;
  ctx.strokeRect(26, 26, w - 52, h - 52);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(36, 36, w - 72, h - 72);
  // Corner frets: a small square spiral, mirrored into each corner.
  ctx.lineWidth = 2.5;
  for (const [cx, cy, sx, sy] of [[26, 26, 1, 1], [w - 26, 26, -1, 1], [26, h - 26, 1, -1], [w - 26, h - 26, -1, -1]]) {
    ctx.beginPath();
    ctx.moveTo(cx + sx * 46, cy + sy * 10);
    ctx.lineTo(cx + sx * 46, cy + sy * 46);
    ctx.lineTo(cx + sx * 10, cy + sy * 46);
    ctx.moveTo(cx + sx * 34, cy + sy * 20);
    ctx.lineTo(cx + sx * 34, cy + sy * 34);
    ctx.lineTo(cx + sx * 20, cy + sy * 34);
    ctx.stroke();
  }

  const lines = [
    ['CỤ : HUỲNH THÚC KHÁNG', 700, 50],
    ['(1876 - 1947)', 700, 38],
    ['Sinh tại Huyện Tiên Phước ,', 700, 36],
    ['Tỉnh Quảng Nam', 700, 36],
    ['Nguyên là Quyền chủ tịch nước', 700, 36],
    ['Việt Nam Dân Chủ Cộng Hòa .', 700, 36],
    ['Mất vào ngày 21 tháng 4 năm 1947', 700, 36],
    ['Tại Thị Trấn Chợ Chùa', 700, 36],
    ['Huyện Nghĩa Hành', 700, 36],
    ['Tỉnh Quảng Ngãi .', 700, 36],
  ];
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const top = 132;
  const step = (h - 100 - top) / (lines.length - 1);
  lines.forEach(([text, weight, startSize], i) => {
    const size = fitText(ctx, text, w - 104, startSize, font, weight);
    ctx.font = `${weight} ${size}px ${font}`;
    const y = top + i * step;
    ctx.fillStyle = 'rgba(30, 4, 8, 0.55)';
    ctx.fillText(text, w / 2 + 1.5, y + 1.5);
    ctx.fillStyle = silver;
    ctx.fillText(text, w / 2, y);
  });
}, 640, 984);

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
