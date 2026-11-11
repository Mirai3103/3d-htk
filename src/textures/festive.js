/**
 * Teachers' Day (20 November) decorations: the colour palette shared by every balloon, pennant
 * and paper prop, the painted check-in backdrop, one atlas for the small printed props, and
 * the title card of the memory-video screen.
 */

import * as THREE from 'three';
import { seededRandom, TAU } from '../core/math.js';
import { MEMORY_VIDEO } from '../data/video.js';
import { drawHeart, fitText, makeCanvas, rgba, signTexture } from './canvas.js';

// The anniversary on the backdrop counts from the first Teachers' Day, 20/11/1982.
const TEACHERS_DAY_YEAR = 2026;

const SANS = '"Segoe UI", Arial, sans-serif';
const SERIF = '"Times New Roman", "Liberation Serif", "DejaVu Serif", Georgia, serif';

// ---- Palette -------------------------------------------------------------------------------
// One tiny swatch texture colours all the party props: a prop's geometry has every UV parked
// on its swatch (see campus/teachersDayBooth.js), so dozens of colours cost two draw calls.

const SWATCHES = {
  red: '#d5302b',
  crimson: '#a51f25',
  pink: '#ee819b',
  blush: '#f8c3c6',
  gold: '#efb02e',
  yellow: '#f6d24f',
  cream: '#fff1d6',
  white: '#fbfaf5',
  teal: '#2e9a92',
  sky: '#74bfe2',
  lilac: '#b598d6',
  orange: '#f08a3c',
  green: '#5a9f4c',
  leaf: '#2f6a3b',
  kraft: '#c39a6b',
  navy: '#21395c',
};
const SWATCH_NAMES = Object.keys(SWATCHES);
const GRID = 4;
const CELL = 16;

const paletteCanvas = makeCanvas(GRID * CELL, GRID * CELL, (ctx) => {
  SWATCH_NAMES.forEach((name, i) => {
    ctx.fillStyle = SWATCHES[name];
    ctx.fillRect((i % GRID) * CELL, Math.floor(i / GRID) * CELL, CELL, CELL);
  });
});
export const festiveTex = new THREE.CanvasTexture(paletteCanvas);
festiveTex.colorSpace = THREE.SRGBColorSpace;
festiveTex.magFilter = THREE.NearestFilter;
festiveTex.minFilter = THREE.NearestFilter;
festiveTex.generateMipmaps = false;

/** UV of the centre of a named swatch. */
export function festiveUV(name) {
  const i = SWATCH_NAMES.indexOf(name);
  if (i < 0) throw new Error(`Unknown festive colour: ${name}`);
  return [((i % GRID) + 0.5) / GRID, 1 - (Math.floor(i / GRID) + 0.5) / GRID];
}

// ---- Painted flowers -----------------------------------------------------------------------

function drawBloom(ctx, x, y, r, petals, color, heart, turn) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(turn);
  ctx.fillStyle = color;
  for (let i = 0; i < petals; i++) {
    ctx.rotate(TAU / petals);
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.58, r * 0.3, r * 0.5, 0, 0, TAU);
    ctx.fill();
  }
  ctx.fillStyle = heart;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.27, 0, TAU);
  ctx.fill();
  ctx.restore();
}

function drawLeaf(ctx, x, y, length, angle, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.5, -length * 0.3, length, 0);
  ctx.quadraticCurveTo(length * 0.5, length * 0.3, 0, 0);
  ctx.fill();
  ctx.restore();
}

/** A flower border that climbs into both lower corners; `edge` is 0 mid-width, 1 at a side. */
function drawFlowerBorder(ctx, w, h, seed, count, climb) {
  const rng = seededRandom(seed);
  const petals = ['#e2504a', '#f08aa0', '#f6b93b', '#fff6e6', '#f39a6b', '#c9567e'];
  const hearts = ['#f6c544', '#fff0b8', '#a3432a', '#f0a530', '#fff0c0', '#f7d98a'];
  const leaves = ['#3f7d46', '#5b9a55', '#2f6a3b'];
  const flowers = [];
  for (let i = 0; i < count; i++) {
    const x = (i + 0.2 + rng() * 0.6) / count * w;
    const edge = Math.abs(x / w - 0.5) * 2;
    const top = h - (h * 0.05 + rng() * h * 0.1 + Math.pow(edge, 2.3) * climb * (0.55 + rng() * 0.45));
    flowers.push({ x, top, r: h * (0.022 + rng() * 0.022) * (1 + edge * 0.35), kind: Math.floor(rng() * petals.length) });
  }
  // Tallest first, so the short ones in front overlap their stems.
  flowers.sort((a, b) => a.top - b.top);
  for (const f of flowers) {
    const lean = (rng() - 0.5) * f.r * 2.4;
    ctx.strokeStyle = leaves[f.kind % leaves.length];
    ctx.lineWidth = Math.max(2, f.r * 0.14);
    ctx.beginPath();
    ctx.moveTo(f.x + lean, h + 4);
    ctx.quadraticCurveTo(f.x + lean * 1.4, (f.top + h) / 2, f.x, f.top);
    ctx.stroke();
    const leafCount = 1 + Math.floor((h - f.top) / (f.r * 3.2));
    for (let k = 0; k < leafCount; k++) {
      const t = 0.3 + (k / Math.max(1, leafCount)) * 0.6;
      const side = k % 2 ? 1 : -1;
      drawLeaf(
        ctx, f.x + lean * (1 - t), f.top + (h - f.top) * t, f.r * (1.1 + rng() * 0.7),
        side > 0 ? -0.6 + rng() * 0.4 : Math.PI + 0.6 - rng() * 0.4, leaves[(f.kind + k) % leaves.length],
      );
    }
    drawBloom(ctx, f.x, f.top, f.r, 6 + (f.kind % 3) * 2, petals[f.kind], hearts[f.kind], rng() * TAU);
  }
}

// ---- The check-in backdrop (5.2 × 3.05 m) --------------------------------------------------

export const teachersDayBackdropTex = signTexture((ctx, w, h) => {
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#fff8ec');
  bg.addColorStop(0.55, '#ffeadb');
  bg.addColorStop(1, '#f9d2c5');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // A warm sun behind the lettering and soft confetti light.
  const sun = ctx.createRadialGradient(w / 2, h * 0.4, 40, w / 2, h * 0.4, w * 0.36);
  sun.addColorStop(0, 'rgba(255, 206, 150, 0.62)');
  sun.addColorStop(0.6, 'rgba(255, 214, 170, 0.28)');
  sun.addColorStop(1, 'rgba(255, 220, 180, 0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(2011);
  for (let i = 0; i < 34; i++) {
    const tones = [[255, 255, 255], [255, 190, 150], [246, 196, 92], [244, 150, 160]];
    const [r, g, b] = tones[i % tones.length];
    ctx.fillStyle = rgba(r, g, b, 0.1 + rng() * 0.16);
    ctx.beginPath();
    ctx.arc(rng() * w, rng() * h * 0.8, 18 + rng() * 80, 0, TAU);
    ctx.fill();
  }
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = i % 3 ? rgba(226, 168, 60, 0.75) : rgba(214, 72, 72, 0.6);
    const x = rng() * w;
    const y = rng() * h * 0.62;
    if (Math.abs(x - w / 2) < w * 0.33 && y > h * 0.08 && y < h * 0.6) continue;
    if (i % 5 === 0) {
      drawHeart(ctx, x, y, 16 + rng() * 16);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 3 + rng() * 5, 0, TAU);
      ctx.fill();
    }
  }

  drawFlowerBorder(ctx, w, h, 1982, 46, h * 0.5);

  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 7;
  ctx.strokeRect(24, 24, w - 48, h - 48);
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, w - 80, h - 80);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const years = TEACHERS_DAY_YEAR - 1982;
  const strap = `KỶ NIỆM ${years} NĂM NGÀY NHÀ GIÁO VIỆT NAM`;
  ctx.font = `800 ${fitText(ctx, strap, w - 330, 76, SANS, 800)}px ${SANS}`;
  ctx.fillStyle = '#a3241f';
  ctx.fillText(strap, w / 2, 152);
  ctx.font = `600 42px ${SANS}`;
  ctx.fillStyle = '#b07a22';
  ctx.fillText(`20/11/1982  –  20/11/${TEACHERS_DAY_YEAR}`, w / 2, 214);

  const hero = 'Tri ân Thầy Cô';
  const heroSize = fitText(ctx, hero, w - 400, 270, SERIF, 'italic 700');
  ctx.font = `italic 700 ${heroSize}px ${SERIF}`;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#fffaf0';
  ctx.lineWidth = 20;
  ctx.strokeText(hero, w / 2, 440);
  ctx.fillStyle = '#eeb244';
  ctx.fillText(hero, w / 2 + 5, 446);
  ctx.fillStyle = '#b3211e';
  ctx.fillText(hero, w / 2, 440);

  // A flourish: two gold rules with a heart between them.
  ctx.strokeStyle = '#d9a441';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 330, 505);
  ctx.lineTo(w / 2 - 46, 505);
  ctx.moveTo(w / 2 + 46, 505);
  ctx.lineTo(w / 2 + 330, 505);
  ctx.stroke();
  ctx.fillStyle = '#d5302b';
  drawHeart(ctx, w / 2, 505, 44);
  ctx.fill();

  ctx.font = `800 54px ${SANS}`;
  ctx.fillStyle = '#254a5c';
  ctx.fillText('TRƯỜNG THCS HUỲNH THÚC KHÁNG', w / 2, 592);
  ctx.font = `italic 600 38px ${SERIF}`;
  ctx.fillStyle = '#8a5437';
  ctx.fillText('Tôn sư trọng đạo  ·  Uống nước nhớ nguồn', w / 2, 650);
}, 1792, 1056);

// ---- Props atlas ---------------------------------------------------------------------------
// Regions are [x, y, width, height] in canvas pixels; propRegionUV() turns one into the UV
// rectangle of a plane.

const ATLAS_W = 1024;
const ATLAS_H = 1280;
export const PROP_REGIONS = {
  wishBoard: [0, 0, 1024, 640],
  frameTop: [0, 640, 1024, 160],
  frameBottom: [0, 800, 1024, 224],
  souvenir: [0, 1024, 512, 256],
  card: [512, 1024, 512, 256],
};

/** [u0, v0, u1, v1] of a named atlas region (v0 is its bottom edge). */
export function propRegionUV(name) {
  const [x, y, rw, rh] = PROP_REGIONS[name];
  return [x / ATLAS_W, 1 - (y + rh) / ATLAS_H, (x + rw) / ATLAS_W, 1 - y / ATLAS_H];
}

function inRegion(ctx, name, draw) {
  const [x, y, rw, rh] = PROP_REGIONS[name];
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, rw, rh);
  ctx.clip();
  ctx.translate(x, y);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  draw(rw, rh);
  ctx.restore();
}

export const eventPropsTex = signTexture((ctx) => {
  // Cork board covered in pupils' wishes.
  inRegion(ctx, 'wishBoard', (w, h) => {
    ctx.fillStyle = '#d9b685';
    ctx.fillRect(0, 0, w, h);
    const rng = seededRandom(1120);
    for (let i = 0; i < 2600; i++) {
      ctx.fillStyle = rng() > 0.5 ? rgba(120, 82, 40, rng() * 0.28) : rgba(255, 236, 200, rng() * 0.3);
      ctx.fillRect(rng() * w, rng() * h, 1 + rng() * 3, 1 + rng() * 3);
    }
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(150, 22, w - 300, 92);
    ctx.fillStyle = '#b3211e';
    ctx.font = `900 60px ${SANS}`;
    ctx.fillText('LỜI CHÚC GỬI THẦY CÔ', w / 2, 90);

    const papers = ['#ffe27a', '#ffb3c1', '#a8e0d1', '#ffd0a1', '#c9c2f2', '#fff7e2', '#bfe3f7'];
    const cols = 7;
    const rows = 3;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = 92 + col * ((w - 184) / (cols - 1)) + (rng() - 0.5) * 22;
        const cy = 220 + row * 152 + (rng() - 0.5) * 20;
        const size = 108 + rng() * 22;
        const featured = row === 1 && col === 3;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate((rng() - 0.5) * 0.26);
        ctx.fillStyle = 'rgba(60, 35, 10, 0.25)';
        ctx.fillRect(-size / 2 + 5, -size / 2 + 6, size, size);
        if (featured) {
          ctx.fillStyle = '#fffaf0';
          ctx.fillRect(-size * 0.62, -size * 0.62, size * 1.24, size * 1.24);
          ctx.fillStyle = '#d5302b';
          drawHeart(ctx, 0, 4, size * 1.02);
          ctx.fill();
          ctx.fillStyle = '#fffaf0';
          ctx.font = `900 34px ${SANS}`;
          ctx.fillText('20/11', 0, 10);
        } else {
          ctx.fillStyle = papers[Math.floor(rng() * papers.length)];
          ctx.fillRect(-size / 2, -size / 2, size, size);
          ctx.strokeStyle = 'rgba(40, 45, 80, 0.62)';
          ctx.lineWidth = 3;
          const lineCount = 3 + Math.floor(rng() * 2);
          for (let k = 0; k < lineCount; k++) {
            const y = -size * 0.24 + k * size * 0.17;
            ctx.beginPath();
            ctx.moveTo(-size * 0.36, y);
            ctx.lineTo(-size * 0.36 + size * (0.42 + rng() * 0.3), y + (rng() - 0.5) * 4);
            ctx.stroke();
          }
          if (rng() > 0.55) {
            ctx.fillStyle = '#d5302b';
            drawHeart(ctx, size * 0.26, size * 0.3, 24);
            ctx.fill();
          }
        }
        ctx.fillStyle = featured ? '#efb02e' : '#c0392b';
        ctx.beginPath();
        ctx.arc(0, -size * (featured ? 0.55 : 0.41), 7, 0, TAU);
        ctx.fill();
        ctx.restore();
      }
    }
  });

  // Photo frame: header strip...
  inRegion(ctx, 'frameTop', (w, h) => {
    ctx.fillStyle = '#fffdf8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#21395c';
    const text = 'THCS HUỲNH THÚC KHÁNG';
    ctx.font = `900 ${fitText(ctx, text, w - 260, 76, SANS, 900)}px ${SANS}`;
    ctx.fillText(text, w / 2, h * 0.68);
    ctx.fillStyle = '#d5302b';
    for (const x of [70, w - 70]) {
      drawHeart(ctx, x, h / 2, 62);
      ctx.fill();
    }
  });
  // ...and the caption strip below the opening.
  inRegion(ctx, 'frameBottom', (w, h) => {
    ctx.fillStyle = '#fffdf8';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#d5302b';
    ctx.font = `900 150px ${SANS}`;
    ctx.fillText('20·11', 215, h * 0.74);
    ctx.fillStyle = '#b3211e';
    ctx.font = `italic 700 84px ${SERIF}`;
    ctx.fillText('Tri ân Thầy Cô', 700, h * 0.5);
    ctx.fillStyle = '#2e7f79';
    ctx.font = `700 34px ${SANS}`;
    ctx.fillText('#TriÂnThầyCô  #NhàGiáoViệtNam', 700, h * 0.8);
  });

  // Poster on the front of the souvenir table.
  inRegion(ctx, 'souvenir', (w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#c0302a');
    g.addColorStop(1, '#8e1b1c');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#f0c865';
    ctx.lineWidth = 6;
    ctx.strokeRect(14, 14, w - 28, h - 28);
    ctx.fillStyle = '#fff3d9';
    ctx.font = `900 ${fitText(ctx, 'BÀN LƯU NIỆM', w - 76, 86, SANS, 900)}px ${SANS}`;
    ctx.fillText('BÀN LƯU NIỆM', w / 2, 128);
    ctx.fillStyle = '#f4d27c';
    ctx.font = `italic 600 36px ${SERIF}`;
    ctx.fillText('Mở album xem ảnh kỷ niệm', w / 2, 196);
  });

  // Greeting card standing on the table.
  inRegion(ctx, 'card', (w, h) => {
    ctx.fillStyle = '#fff6e6';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#ee819b';
    ctx.lineWidth = 10;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.fillStyle = '#d5302b';
    drawHeart(ctx, w / 2, 62, 56);
    ctx.fill();
    ctx.fillStyle = '#b3211e';
    ctx.font = `italic 700 62px ${SERIF}`;
    ctx.fillText('Kính chúc Thầy Cô', w / 2, 158);
    ctx.fillStyle = '#254a5c';
    ctx.font = `700 34px ${SANS}`;
    ctx.fillText('mạnh khỏe · hạnh phúc', w / 2, 214);
  });
}, ATLAS_W, ATLAS_H);

// ---- Memory-video screen -------------------------------------------------------------------
// What the screen shows while the video is not playing: a title card with a play button.

export const memoryScreenTex = signTexture((ctx, w, h) => {
  const glow = ctx.createRadialGradient(w / 2, h * 0.4, 40, w / 2, h * 0.45, w * 0.62);
  glow.addColorStop(0, '#8f1f22');
  glow.addColorStop(0.55, '#4f1216');
  glow.addColorStop(1, '#1d080b');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Film perforations along the top and bottom edges.
  const band = 46;
  ctx.fillStyle = 'rgba(12, 4, 6, 0.86)';
  ctx.fillRect(0, 0, w, band);
  ctx.fillRect(0, h - band, w, band);
  ctx.fillStyle = 'rgba(255, 233, 190, 0.82)';
  for (let x = 14; x < w; x += 44) {
    ctx.fillRect(x, 12, 24, 22);
    ctx.fillRect(x, h - 34, 24, 22);
  }

  // Play button.
  const cx = w / 2;
  const cy = 196;
  ctx.fillStyle = 'rgba(255, 226, 150, 0.16)';
  ctx.beginPath();
  ctx.arc(cx, cy, 104, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#f2c35a';
  ctx.beginPath();
  ctx.arc(cx, cy, 82, 0, TAU);
  ctx.fill();
  ctx.fillStyle = '#7a1418';
  ctx.beginPath();
  ctx.moveTo(cx - 26, cy - 42);
  ctx.lineTo(cx + 46, cy);
  ctx.lineTo(cx - 26, cy + 42);
  ctx.closePath();
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff3d9';
  ctx.font = `900 ${fitText(ctx, MEMORY_VIDEO.title, w - 150, 92, SANS, 900)}px ${SANS}`;
  ctx.fillText(MEMORY_VIDEO.title, cx, 392);
  ctx.fillStyle = '#f4d27c';
  ctx.font = `italic 600 ${fitText(ctx, MEMORY_VIDEO.subtitle, w - 200, 40, SERIF, 'italic 600')}px ${SERIF}`;
  ctx.fillText(MEMORY_VIDEO.subtitle, cx, 446);

  // The invitation, in a pill.
  ctx.font = `800 30px ${SANS}`;
  const pill = ctx.measureText(MEMORY_VIDEO.invite).width + 64;
  ctx.fillStyle = '#f2c35a';
  ctx.beginPath();
  ctx.roundRect(cx - pill / 2, 468, pill, 46, 23);
  ctx.fill();
  ctx.fillStyle = '#5c1014';
  ctx.fillText(MEMORY_VIDEO.invite, cx, 502);

  ctx.fillStyle = '#e9566a';
  for (const [x, y, size] of [[118, 150, 46], [w - 118, 150, 46], [196, 300, 26], [w - 196, 300, 26]]) {
    drawHeart(ctx, x, y, size);
    ctx.fill();
  }
}, 1024, 576);
