/**
 * Souvenir album artwork: the leather cover, the endpaper inside it, and one canvas per page
 * (a taped-in photo over a caption). Page photos are the only pictures in the project that
 * are loaded at run time; see data/album.js. They are requested as soon as the site boots
 * (preloadAlbumPhotos), so the album opens with its pictures already in place.
 */

import * as THREE from 'three';
import { maxAnisotropy } from '../core/engine.js';
import { seededRandom, TAU } from '../core/math.js';
import { ALBUM, ALBUM_ITEMS } from '../data/album.js';
import { drawHeart, fitText, makeCanvas, rgba } from './canvas.js';

const SANS = '"Segoe UI", Arial, sans-serif';
const SERIF = '"Times New Roman", "Liberation Serif", "DejaVu Serif", Georgia, serif';

// Pages are laid out on a 1024 × 1360 grid and painted at this fraction of it.
const PAGE_GRID_W = 1024;
const PAGE_GRID_H = 1360;
const PAGE_SCALE = 0.75;

// The photo card in the upper part of a page and the picture's window inside it (grid units).
const CARD_X = 104;
const CARD_Y = 132;
const CARD_W = PAGE_GRID_W - 208;
const CARD_H = 740;
const CARD_PAD = 26;
const PHOTO_W = CARD_W - CARD_PAD * 2;
const PHOTO_H = CARD_H - CARD_PAD - 54;

function finish(canvas) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

// ---- Cover and endpaper --------------------------------------------------------------------

export const albumCoverTex = finish(makeCanvas(512, 696, (ctx, w, h) => {
  const leather = ctx.createLinearGradient(0, 0, w, h);
  leather.addColorStop(0, '#22505c');
  leather.addColorStop(1, '#163b46');
  ctx.fillStyle = leather;
  ctx.fillRect(0, 0, w, h);
  const rng = seededRandom(1947);
  for (let i = 0; i < 5200; i++) {
    ctx.fillStyle = rng() > 0.5 ? rgba(8, 26, 32, rng() * 0.22) : rgba(120, 170, 180, rng() * 0.1);
    ctx.fillRect(rng() * w, rng() * h, 1 + rng() * 2, 1 + rng() * 2);
  }
  // Darker binding strip along the spine (left edge).
  const binding = ctx.createLinearGradient(0, 0, 54, 0);
  binding.addColorStop(0, 'rgba(6, 22, 28, 0.6)');
  binding.addColorStop(1, 'rgba(6, 22, 28, 0)');
  ctx.fillStyle = binding;
  ctx.fillRect(0, 0, 54, h);

  const gold = '#e2bd6a';
  ctx.strokeStyle = gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(46, 34, w - 80, h - 68);
  ctx.lineWidth = 1.5;
  ctx.strokeRect(56, 44, w - 100, h - 88);

  const cx = (46 + w - 34) / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = gold;
  drawHeart(ctx, cx, 168, 46);
  ctx.fill();
  const titleSize = fitText(ctx, ALBUM.title, w - 150, 60, SERIF, 700);
  ctx.font = `700 ${titleSize}px ${SERIF}`;
  ctx.fillText(ALBUM.title, cx, 300);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 110, 334);
  ctx.lineTo(cx + 110, 334);
  ctx.stroke();
  ctx.fillStyle = '#f2dfae';
  ctx.font = `italic 600 ${fitText(ctx, ALBUM.occasion, w - 160, 30, SERIF, 'italic 600')}px ${SERIF}`;
  ctx.fillText(ALBUM.occasion, cx, 384);
  ctx.fillStyle = gold;
  ctx.font = `700 ${fitText(ctx, ALBUM.subtitle.toUpperCase(), w - 160, 24, SANS, 700)}px ${SANS}`;
  ctx.fillText(ALBUM.subtitle.toUpperCase(), cx, h - 96);
}));

function paintPaper(ctx, w, h) {
  ctx.fillStyle = '#fbf7ef';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(130, 112, 90, 0.03)';
  for (let i = 0; i < 2200; i++) ctx.fillRect((i * 73) % w, (i * 197) % h, 2, 2);
}

/** Wrap `text` into at most `maxLines` centred lines starting at baseline y. */
function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  const shown = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    shown[maxLines - 1] = `${shown[maxLines - 1].replace(/[.,;:\s]*$/, '')}…`;
  }
  let lineY = y - (shown.length * lineHeight - lineHeight) * 0.25;
  for (const shownLine of shown) {
    ctx.fillText(shownLine, x, lineY);
    lineY += lineHeight;
  }
}

/** Inside of the front cover: a dedication, facing page 1. */
export const albumEndpaperTex = finish(makeCanvas(512, 696, (ctx, w, h) => {
  paintPaper(ctx, w, h);
  ctx.strokeStyle = 'rgba(165, 140, 112, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(34, 34, w - 68, h - 68);
  const crease = ctx.createLinearGradient(w, 0, w - 90, 0);
  crease.addColorStop(0, 'rgba(28, 20, 12, 0.22)');
  crease.addColorStop(1, 'rgba(28, 20, 12, 0)');
  ctx.fillStyle = crease;
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#b3211e';
  drawHeart(ctx, w / 2, 214, 40);
  ctx.fill();
  ctx.fillStyle = '#3b2e22';
  ctx.font = `italic 600 31px ${SERIF}`;
  wrapText(ctx, ALBUM.dedication, w / 2, 300, w - 150, 44, 5);
  ctx.fillStyle = 'rgba(105, 88, 70, 0.8)';
  ctx.font = `700 15px ${SANS}`;
  ctx.fillText(ALBUM.subtitle.toUpperCase(), w / 2, h - 96);
}));

/** The last thing in the album, under the final sheet: a goodbye. */
export const albumFarewellTex = finish(makeCanvas(512, 696, (ctx, w, h) => {
  paintPaper(ctx, w, h);
  ctx.strokeStyle = 'rgba(165, 140, 112, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(34, 34, w - 68, h - 68);
  const crease = ctx.createLinearGradient(0, 0, 90, 0);
  crease.addColorStop(0, 'rgba(28, 20, 12, 0.22)');
  crease.addColorStop(1, 'rgba(28, 20, 12, 0)');
  ctx.fillStyle = crease;
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#3b2e22';
  ctx.font = `italic 600 31px ${SERIF}`;
  wrapText(ctx, ALBUM.farewell, w / 2, 290, w - 150, 44, 5);
  ctx.fillStyle = '#b3211e';
  drawHeart(ctx, w / 2, 452, 30);
  ctx.fill();
  ctx.fillStyle = 'rgba(105, 88, 70, 0.8)';
  ctx.font = `700 15px ${SANS}`;
  ctx.fillText(ALBUM.occasion.toUpperCase(), w / 2, h - 96);
}));

/** Plain paper, for the page block and for sheets before their artwork exists. */
export const albumPaperTex = finish(makeCanvas(128, 128, (ctx, w, h) => paintPaper(ctx, w, h)));

// ---- Pages ---------------------------------------------------------------------------------

function paintPageBackground(ctx, w, h, pageNum, isLeftPage) {
  paintPaper(ctx, w, h);
  const margin = 52;
  ctx.strokeStyle = 'rgba(165, 140, 112, 0.35)';
  ctx.lineWidth = 2;
  ctx.strokeRect(margin, margin, w - margin * 2, h - margin * 2);
  ctx.strokeStyle = 'rgba(165, 140, 112, 0.18)';
  ctx.lineWidth = 1;
  ctx.strokeRect(margin + 8, margin + 8, w - (margin + 8) * 2, h - (margin + 8) * 2);

  // Shade towards the spine and, faintly, towards the outer edge.
  const crease = isLeftPage
    ? ctx.createLinearGradient(w, 0, w - 165, 0)
    : ctx.createLinearGradient(0, 0, 165, 0);
  crease.addColorStop(0, 'rgba(28, 20, 12, 0.24)');
  crease.addColorStop(0.38, 'rgba(28, 20, 12, 0.06)');
  crease.addColorStop(1, 'rgba(28, 20, 12, 0)');
  ctx.fillStyle = crease;
  ctx.fillRect(0, 0, w, h);
  const edge = isLeftPage
    ? ctx.createLinearGradient(0, 0, 48, 0)
    : ctx.createLinearGradient(w, 0, w - 48, 0);
  edge.addColorStop(0, 'rgba(60, 48, 36, 0.08)');
  edge.addColorStop(1, 'rgba(60, 48, 36, 0)');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgba(84, 66, 48, 0.92)';
  ctx.font = `italic 600 26px ${SERIF}`;
  ctx.textAlign = 'center';
  ctx.fillText(`— Trang ${String(pageNum).padStart(2, '0')} —`, w * 0.5, h - 74);
}

function paintCornerMounts(ctx, fx, fy, fw, fh) {
  const s = 34;
  ctx.fillStyle = '#d4b48c';
  ctx.strokeStyle = 'rgba(95, 72, 48, 0.35)';
  ctx.lineWidth = 1.5;
  const corners = [
    [[fx - 4, fy - 4], [fx + s, fy - 4], [fx - 4, fy + s]],
    [[fx + fw + 4, fy - 4], [fx + fw - s, fy - 4], [fx + fw + 4, fy + s]],
    [[fx - 4, fy + fh + 4], [fx + s, fy + fh + 4], [fx - 4, fy + fh - s]],
    [[fx + fw + 4, fy + fh + 4], [fx + fw - s, fy + fh + 4], [fx + fw + 4, fy + fh - s]],
  ];
  for (const [a, b, c] of corners) {
    ctx.beginPath();
    ctx.moveTo(...a);
    ctx.lineTo(...b);
    ctx.lineTo(...c);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  // A strip of masking tape across the top edge.
  ctx.save();
  ctx.translate(fx + fw * 0.5, fy - 6);
  ctx.rotate(-0.025);
  ctx.fillStyle = 'rgba(242, 228, 198, 0.78)';
  ctx.fillRect(-72, -14, 144, 28);
  ctx.strokeStyle = 'rgba(180, 158, 122, 0.32)';
  ctx.strokeRect(-72, -14, 144, 28);
  ctx.restore();
}

/**
 * Paint one album page. `photo` is a loaded image, or null; `state` then says whether it is
 * still 'loading' or 'failed' (a painted sunset stands in).
 */
function paintPage(ctx, pageNum, isLeftPage, item, photo, state) {
  const w = PAGE_GRID_W;
  const h = PAGE_GRID_H;
  ctx.save();
  ctx.scale(PAGE_SCALE, PAGE_SCALE);
  paintPageBackground(ctx, w, h, pageNum, isLeftPage);
  if (!item) {
    ctx.restore();
    return;
  }

  ctx.fillStyle = 'rgba(104, 82, 58, 0.95)';
  ctx.font = `600 20px ${SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(`KỶ NIỆM #${String(pageNum).padStart(2, '0')}`, w * 0.5, 104);

  const cardX = CARD_X;
  const cardY = CARD_Y;
  const cardW = CARD_W;
  const cardH = CARD_H;
  const imgX = cardX + CARD_PAD;
  const imgY = cardY + CARD_PAD;
  const imgW = PHOTO_W;
  const imgH = PHOTO_H;

  ctx.save();
  ctx.shadowColor = 'rgba(38, 26, 14, 0.18)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.restore();
  ctx.strokeStyle = 'rgba(180, 165, 145, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  ctx.save();
  ctx.beginPath();
  ctx.rect(imgX, imgY, imgW, imgH);
  ctx.clip();
  if (photo) {
    // Cover the frame, cropping whichever side overflows.
    const scale = Math.max(imgW / photo.width, imgH / photo.height);
    const drawW = photo.width * scale;
    const drawH = photo.height * scale;
    ctx.drawImage(photo, imgX - (drawW - imgW) / 2, imgY - (drawH - imgH) / 2, drawW, drawH);
    ctx.fillStyle = 'rgba(255, 240, 215, 0.04)';
    ctx.fillRect(imgX, imgY, imgW, imgH);
  } else if (state === 'failed') {
    const sunset = ctx.createLinearGradient(imgX, imgY, imgX, imgY + imgH);
    sunset.addColorStop(0, '#e9b893');
    sunset.addColorStop(0.55, '#d48c70');
    sunset.addColorStop(1, '#6d597a');
    ctx.fillStyle = sunset;
    ctx.fillRect(imgX, imgY, imgW, imgH);
    ctx.fillStyle = 'rgba(255, 245, 230, 0.85)';
    ctx.beginPath();
    ctx.arc(imgX + imgW * 0.5, imgY + imgH * 0.45, 68, 0, TAU);
    ctx.fill();
  } else {
    ctx.fillStyle = '#efe9df';
    ctx.fillRect(imgX, imgY, imgW, imgH);
    ctx.fillStyle = '#9c8974';
    ctx.font = `500 26px ${SANS}`;
    ctx.fillText('Đang tải ảnh kỷ niệm…', imgX + imgW * 0.5, imgY + imgH * 0.5);
  }
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.lineWidth = 2;
  ctx.strokeRect(imgX, imgY, imgW, imgH);
  ctx.restore();

  paintCornerMounts(ctx, cardX, cardY, cardW, cardH);
  ctx.fillStyle = 'rgba(96, 80, 62, 0.95)';
  ctx.font = `italic 600 24px ${SERIF}`;
  ctx.textAlign = 'right';
  ctx.fillText(ALBUM.subtitle, cardX + cardW - 26, cardY + cardH - 18);

  // Divider with a diamond, then the caption.
  const dividerY = cardY + cardH + 54;
  ctx.strokeStyle = 'rgba(165, 135, 102, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w * 0.5 - 150, dividerY);
  ctx.lineTo(w * 0.5 - 22, dividerY);
  ctx.moveTo(w * 0.5 + 22, dividerY);
  ctx.lineTo(w * 0.5 + 150, dividerY);
  ctx.stroke();
  ctx.fillStyle = '#b69068';
  ctx.beginPath();
  ctx.moveTo(w * 0.5, dividerY - 7);
  ctx.lineTo(w * 0.5 + 7, dividerY);
  ctx.lineTo(w * 0.5, dividerY + 7);
  ctx.lineTo(w * 0.5 - 7, dividerY);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#3b2e22';
  ctx.font = `italic 600 36px ${SERIF}`;
  ctx.textAlign = 'center';
  wrapText(ctx, `“${item.description ?? ''}”`, w * 0.5, dividerY + 76, w - 220, 48, 4);
  ctx.restore();
}

// ---- Page photos ---------------------------------------------------------------------------

const MAX_DOWNLOADS = 4; // at a time, in page order, so the first spreads arrive first

/** link → { photo: undefined while loading | a drawable | null when it failed, ready: Promise }. */
const photos = new Map();
const waiting = [];
let downloading = 0;

/** Try the picture itself, then the same picture through a cross-origin friendly proxy. */
function fetchImage(link) {
  return new Promise((resolve) => {
    const attempt = (url, viaProxy) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => {
        const remote = /^https?:/i.test(link);
        if (!viaProxy && remote) attempt(`https://wsrv.nl/?url=${encodeURIComponent(link)}`, true);
        else resolve(null);
      };
      image.src = url;
    };
    attempt(link, false);
  });
}

/**
 * Decode the picture and scale it down to its window on the page, away from the frame that
 * will paint it: drawing a full-size camera photo for the first time can stall for a while.
 */
async function shrinkPhoto(image) {
  const cover = Math.max(
    (PHOTO_W * PAGE_SCALE) / image.naturalWidth,
    (PHOTO_H * PAGE_SCALE) / image.naturalHeight,
  );
  try {
    if (cover < 1 && window.createImageBitmap) {
      return await createImageBitmap(image, {
        resizeWidth: Math.max(1, Math.round(image.naturalWidth * cover)),
        resizeHeight: Math.max(1, Math.round(image.naturalHeight * cover)),
        resizeQuality: 'high',
      });
    }
    await image.decode?.();
  } catch {
    // The image itself still draws.
  }
  return image;
}

function startDownloads() {
  while (downloading < MAX_DOWNLOADS && waiting.length) {
    downloading++;
    waiting.shift()().finally(() => {
      downloading--;
      startDownloads();
    });
  }
}

/** The photo behind `link`, requested once however many times it is asked for. */
function photoEntry(link) {
  let entry = photos.get(link);
  if (!entry) {
    entry = { photo: undefined, ready: null };
    entry.ready = new Promise((resolve) => {
      waiting.push(async () => {
        const image = await fetchImage(link);
        entry.photo = image ? await shrinkPhoto(image) : null;
        resolve(entry.photo);
      });
    });
    photos.set(link, entry);
    startDownloads();
  }
  return entry;
}

/** Start fetching every page photo. Call early in boot(): nothing waits for it. */
export function preloadAlbumPhotos() {
  for (const item of ALBUM_ITEMS) {
    if (item.imageLink) photoEntry(item.imageLink);
  }
}

/** Resolves once the photo of `item` has arrived or failed; at once for a page without one. */
export function albumPhotoReady(item) {
  return item?.imageLink ? photoEntry(item.imageLink).ready : Promise.resolve();
}

/**
 * Texture for page `pageNum` (1-based); `item` is its entry in ALBUM_ITEMS, or undefined for
 * a blank page. A photo that is already in is painted straight away; otherwise the page says
 * it is loading and is repainted when the photo arrives.
 */
export function createAlbumPageTexture(pageNum, isLeftPage, item) {
  const entry = item?.imageLink ? photoEntry(item.imageLink) : null;
  const pending = Boolean(entry) && entry.photo === undefined;
  const canvas = makeCanvas(PAGE_GRID_W * PAGE_SCALE, PAGE_GRID_H * PAGE_SCALE, (ctx) => {
    paintPage(ctx, pageNum, isLeftPage, item, entry?.photo ?? null, pending ? 'loading' : 'failed');
  });
  const texture = finish(canvas);
  if (pending) {
    entry.ready.then((photo) => {
      paintPage(canvas.getContext('2d'), pageNum, isLeftPage, item, photo, 'failed');
      texture.needsUpdate = true;
    });
  }
  return texture;
}
