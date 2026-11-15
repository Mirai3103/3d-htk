/**
 * The souvenir album lying on the Teachers' Day table: a hard-cover book that opens, and
 * whose sheets curl over as they are turned. It is a real Object3D (not batched) because it
 * moves. This module owns the book: its cover, its sheets and how a sheet bends for a given
 * amount of turn. interaction/albumView.js decides when it opens and feeds it the pointer.
 *
 * Book frame (the `book` group): X runs from the spine across the right-hand page, Y up the
 * page, Z out of the paper. Lengths below are in book units; SCALE turns them into metres.
 */

import * as THREE from 'three';
import { renderer, scene } from '../core/engine.js';
import { damp } from '../core/math.js';
import { ALBUM_ITEMS } from '../data/album.js';
import {
  ALBUM_PHOTO_CARD,
  albumCoverTex,
  albumEndpaperTex,
  albumFarewellTex,
  albumPaperTex,
  albumPhotoReady,
  createAlbumPageTexture,
} from '../textures/album.js';

const PAGE_W = 3.45;
const PAGE_H = 4.65;
const PAGE_T = 0.012;
const SEG_W = 40;
const SEG_H = 12;
const STACK = 0.026; // gap between resting sheets
const SCALE = 0.25 / PAGE_W; // a page is 25 cm wide

const COVER_T = 0.06;
const SPINE_T = 0.04;
const COVER_W = PAGE_W + 0.16;
const COVER_H = PAGE_H + 0.24;
const BLOCK = 0.05; // the unturned rest of the album, under the right-hand sheets
const ARCH = 0.085; // how far an open page bows up next to the spine

const SHEETS = Math.max(1, Math.ceil(ALBUM_ITEMS.length / 2));
const RIGHT_BASE = BLOCK + PAGE_T;
const LEFT_BASE = PAGE_T;
// Underside of the closed front cover.
const STACK_TOP = RIGHT_BASE + (SHEETS - 1) * STACK + PAGE_T / 2 + 0.008;

const COVER_SECONDS = 0.85;
const PAPER_TINT = 0xd6d2ca;

let root = null;
let book = null;
let coverPivot = null;
let spinePivot = null;
let pickProxy = null;

const sheets = [];
let wantOpen = false;
/** 0 closed … 1 open, linear in time; `openness` is its eased value. */
let coverT = 0;
let openness = 0;
/** Pages that have their artwork so far, counted in reading order. */
let paintedPages = 0;

/** The sheet under the pointer while it is being dragged. */
let dragged = null;
let dragStartX = 0;
let dragStartT = 0;

const pagePlane = new THREE.Plane();
const hit = new THREE.Vector3();

// ---- Materials -----------------------------------------------------------------------------

/** Paper material tuned down so print and photos keep their contrast in full sun. */
function paperMaterial(map) {
  const material = new THREE.MeshStandardMaterial({
    map, roughness: 0.78, metalness: 0.02,
    color: PAPER_TINT,
  });
  material.envMapIntensity = 0.3;
  return material;
}

function plainMaterial(color, roughness) {
  const material = new THREE.MeshStandardMaterial({ color, roughness });
  material.envMapIntensity = 0.3;
  return material;
}

// ---- Page curl -----------------------------------------------------------------------------
// A turning sheet is a strip that cannot stretch: for a turn amount t (0 = lying right,
// 1 = lying left) we choose the tangent angle at each point across the page and integrate it,
// so the paper keeps its width however it bends.

const COLS = SEG_W + 1;
const ROWS = SEG_H + 1;
const gridX = new Float32Array(ROWS * COLS);
const gridZ = new Float32Array(ROWS * COLS);
const gridTheta = new Float32Array(ROWS * COLS);

function tangentAngle(s, t) {
  const lift = Math.sin(Math.PI * t);
  // Resting bow beside the spine, mirrored as the sheet changes side.
  const arch = ARCH * openness;
  const slope = Math.PI * arch * Math.cos(Math.PI * s) * (1 - 0.35 * s) - 0.35 * arch * Math.sin(Math.PI * s);
  const rest = (1 - 2 * t) * Math.atan(slope) * (1 - 0.65 * lift);
  const swing = Math.PI * t * t * (3 - 2 * t);
  // Mid-turn the page rolls over its own belly, with a slight S as it passes upright.
  const roll = lift * (1 - 2 * t) * 1.38 * (0.44 - s);
  const wave = -0.34 * lift * lift * Math.cos(Math.PI * s);
  const peel = 0.42 * Math.sin(Math.PI * Math.min(t * 2.2, 1)) * (1 - lift) * s * s;
  return THREE.MathUtils.clamp(swing + rest + roll + wave + peel, -0.25, Math.PI + 0.25);
}

function deformSheet(sheet) {
  const position = sheet.mesh.geometry.getAttribute('position');
  const rest = sheet.rest;
  const t = THREE.MathUtils.clamp(sheet.t, 0, 1);
  const lift = Math.sin(Math.PI * t);
  const zRight = RIGHT_BASE + (SHEETS - 1 - sheet.index) * STACK;
  const zLeft = LEFT_BASE + sheet.index * STACK;
  const zSpine = (1 - t) * zRight + t * zLeft + lift * 0.045;
  const du = PAGE_W / SEG_W;

  for (let r = 0; r < ROWS; r++) {
    // A dragged corner leads: rows turn a little ahead of or behind the middle of the page.
    const tRow = THREE.MathUtils.clamp(t + sheet.skew * (r / SEG_H - 0.5) * lift * 0.32, 0, 1);
    const row = r * COLS;
    gridX[row] = 0;
    gridZ[row] = zSpine;
    gridTheta[row] = tangentAngle(0, tRow);
    for (let c = 1; c < COLS; c++) {
      const mid = tangentAngle((c - 0.5) / SEG_W, tRow);
      gridX[row + c] = gridX[row + c - 1] + Math.cos(mid) * du;
      gridZ[row + c] = gridZ[row + c - 1] + Math.sin(mid) * du;
      gridTheta[row + c] = tangentAngle(c / SEG_W, tRow);
    }
  }

  for (let i = 0; i < position.count; i++) {
    const u = rest[i * 3];
    const y = rest[i * 3 + 1];
    const offset = rest[i * 3 + 2];
    const c = THREE.MathUtils.clamp(Math.round((u / PAGE_W) * SEG_W), 0, SEG_W);
    const r = THREE.MathUtils.clamp(Math.round((y / PAGE_H + 0.5) * SEG_H), 0, SEG_H);
    const cell = r * COLS + c;
    // Paper thickness goes along the curve's normal.
    position.setXYZ(
      i,
      gridX[cell] - offset * Math.sin(gridTheta[cell]),
      y,
      gridZ[cell] + offset * Math.cos(gridTheta[cell]),
    );
  }
  position.needsUpdate = true;
  sheet.mesh.geometry.computeVertexNormals();
}

// ---- Construction --------------------------------------------------------------------------

function addSheets(edgeMaterial) {
  for (let index = 0; index < SHEETS; index++) {
    const geometry = new THREE.BoxGeometry(PAGE_W, PAGE_H, PAGE_T, SEG_W, SEG_H, 1);
    geometry.translate(PAGE_W / 2, 0, 0);
    const front = paperMaterial(albumPaperTex);
    const back = paperMaterial(albumPaperTex);
    // Box faces: +X, -X, +Y, -Y, +Z (front of the sheet), -Z (its back).
    const mesh = new THREE.Mesh(geometry, [edgeMaterial, edgeMaterial, edgeMaterial, edgeMaterial, front, back]);
    mesh.frustumCulled = false;
    mesh.receiveShadow = true;
    book.add(mesh);
    const sheet = {
      index,
      mesh,
      front,
      back,
      rest: geometry.getAttribute('position').array.slice(),
      t: 0,
      targetT: 0,
      skew: 0,
      targetSkew: 0,
      skewTimer: 0,
    };
    sheets.push(sheet);
    deformSheet(sheet);
  }
}

/**
 * Put the album on a table: (x, y, z) is the world point on the table top under the middle
 * of its spine, `yaw` the way the reader faces it from (0 = reader stands at +Z).
 */
export function buildAlbum({ x, y, z, yaw }) {
  root = new THREE.Group();
  root.position.set(x, y, z);
  root.rotation.y = yaw;
  book = new THREE.Group();
  book.rotation.x = -Math.PI / 2;
  book.scale.setScalar(SCALE);
  book.position.y = COVER_T * SCALE;
  root.add(book);

  const leather = plainMaterial(0x1c4652, 0.62);
  const edge = plainMaterial(0xcfcac1, 0.85);
  const farewell = paperMaterial(albumFarewellTex);
  const coverFront = new THREE.MeshStandardMaterial({ map: albumCoverTex, roughness: 0.6, metalness: 0.05 });
  coverFront.envMapIntensity = 0.3;

  // Back board, fixed to the table, and the block of pages glued to it.
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(COVER_W, COVER_H, COVER_T),
    [leather, leather, leather, leather, edge, leather],
  );
  board.position.set(COVER_W / 2, 0, -COVER_T / 2);
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(PAGE_W - 0.02, PAGE_H - 0.02, BLOCK),
    [edge, edge, edge, edge, farewell, edge],
  );
  block.position.set(PAGE_W / 2, 0, BLOCK / 2);

  // Front cover: hinged halfway up the spine, so it lies flat on the table once open.
  coverPivot = new THREE.Group();
  coverPivot.position.set(0, 0, STACK_TOP / 2);
  const cover = new THREE.Mesh(
    new THREE.BoxGeometry(COVER_W, COVER_H, COVER_T),
    [leather, leather, leather, leather, coverFront, paperMaterial(albumEndpaperTex)],
  );
  cover.position.set(COVER_W / 2, 0, STACK_TOP / 2 + COVER_T / 2);
  coverPivot.add(cover);

  // Spine strip: upright while closed, folded under the open cover.
  spinePivot = new THREE.Group();
  spinePivot.position.set(-SPINE_T, 0, -COVER_T);
  const spineHeight = STACK_TOP + COVER_T * 2;
  const spine = new THREE.Mesh(new THREE.BoxGeometry(SPINE_T, COVER_H, spineHeight), leather);
  spine.position.set(SPINE_T / 2, 0, spineHeight / 2);
  spinePivot.add(spine);

  for (const mesh of [board, block, cover, spine]) mesh.receiveShadow = true;
  book.add(board, block, coverPivot, spinePivot);
  addSheets(edge);
  scene.add(root);
  warmPages();

  // Generous invisible box, so the closed album is easy to click or tap.
  pickProxy = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.24, 0.48),
    new THREE.MeshBasicMaterial({ visible: false }),
  );
  pickProxy.position.set(x, y + 0.12, z);
  pickProxy.rotation.y = yaw;
  pickProxy.userData.prop = 'album';
  scene.add(pickProxy);
}

export function getAlbumPickProxy() {
  return pickProxy;
}

/**
 * Where the album is, for the camera and the prompt: `center` (world, on the open pages at
 * the spine), `front` (unit vector towards the reader) and the open spread's size in metres.
 */
export function getAlbumFrame(center, front) {
  if (!root) return null;
  root.updateWorldMatrix(false, false);
  center.set(0, (COVER_T + BLOCK) * SCALE, 0).applyMatrix4(root.matrixWorld);
  front.set(Math.sin(root.rotation.y), 0, Math.cos(root.rotation.y));
  return { width: COVER_W * 2 * SCALE, height: COVER_H * SCALE };
}

// ---- Opening, turning ----------------------------------------------------------------------

/** Paint the next page in reading order; `upload` also sends it to the GPU straight away. */
function paintNextPage(upload) {
  const sheet = sheets[paintedPages >> 1];
  const isLeft = paintedPages % 2 === 1;
  const pageNum = paintedPages + 1;
  const material = isLeft ? sheet.back : sheet.front;
  const texture = createAlbumPageTexture(pageNum, isLeft, ALBUM_ITEMS[pageNum - 1]);
  material.map = texture;
  material.emissiveMap = texture;
  if (upload) renderer.initTexture(texture);
  paintedPages++;
}

/** Whatever has not been painted yet, at once. */
function paintPages() {
  while (paintedPages < sheets.length * 2) paintNextPage(false);
}

function idleMoment() {
  return new Promise((resolve) => {
    if (window.requestIdleCallback) window.requestIdleCallback(() => resolve(), { timeout: 1200 });
    else window.setTimeout(resolve, 80);
  });
}

/**
 * Get the pages ready before anyone opens the album: each one is painted and uploaded in an
 * idle moment, once its photo is in (textures/album.js preloads them), so the first opening
 * neither waits for the network nor stalls on painting. Opening earlier just paints the rest.
 */
async function warmPages() {
  while (paintedPages < sheets.length * 2) {
    const page = paintedPages;
    await albumPhotoReady(ALBUM_ITEMS[page]);
    await idleMoment();
    if (paintedPages === page) paintNextPage(true);
  }
}

/** Open the cover, or turn every sheet back and close it. Pages not painted yet are painted now. */
export function setAlbumOpen(open) {
  wantOpen = open;
  dragged = null;
  if (open) {
    paintPages();
  } else {
    for (const sheet of sheets) {
      sheet.targetT = 0;
      sheet.targetSkew = 0;
    }
  }
}

function turnedCount() {
  let count = 0;
  for (const sheet of sheets) if (sheet.targetT >= 0.5) count += 1;
  return count;
}

/** Page numbers showing on the left and right (null where there is none), and what can turn. */
export function albumSpread() {
  const turned = turnedCount();
  const total = ALBUM_ITEMS.length;
  const left = turned > 0 && turned * 2 <= total ? turned * 2 : null;
  const right = turned < SHEETS ? turned * 2 + 1 : null;
  return { left, right, total, canPrev: turned > 0, canNext: turned < SHEETS };
}

/** Turn one sheet: +1 to the next spread, -1 back. */
export function flipAlbum(direction) {
  const turned = turnedCount();
  const sheet = direction > 0 ? sheets[turned] : sheets[turned - 1];
  if (!sheet || !wantOpen) return;
  sheet.targetT = direction > 0 ? 1 : 0;
  // A brief corner-first lean makes the automatic turn look hand-made.
  sheet.targetSkew = direction > 0 ? -0.35 : 0.35;
  sheet.skewTimer = 0.28;
}

/** Book-frame point where a world ray meets the open pages, or null if it misses the paper. */
function pagePoint(ray) {
  if (!book) return null;
  book.updateWorldMatrix(true, false);
  hit.set(0, 0, BLOCK).applyMatrix4(book.matrixWorld);
  pagePlane.setFromNormalAndCoplanarPoint(THREE.Object3D.DEFAULT_UP, hit);
  if (!ray.intersectPlane(pagePlane, hit)) return null;
  book.worldToLocal(hit);
  return hit;
}

/** Is the ray over the open pages? */
export function albumPageUnder(ray) {
  const point = pagePoint(ray);
  return Boolean(point) && Math.abs(point.x) <= PAGE_W + 0.1 && Math.abs(point.y) <= PAGE_H / 2 + 0.1;
}

/**
 * Number (1-based) of the page whose photo card the ray points at, or 0: only for a page that
 * is lying flat and has a picture.
 */
export function albumPhotoUnder(ray) {
  if (!wantOpen || coverT < 1 || !albumPageUnder(ray)) return 0;
  const turned = turnedCount();
  const onRight = hit.x >= 0;
  const sheet = onRight ? sheets[turned] : sheets[turned - 1];
  if (!sheet || Math.abs(sheet.t - (onRight ? 0 : 1)) > 0.02) return 0;
  const pageNum = onRight ? turned * 2 + 1 : turned * 2;
  if (!ALBUM_ITEMS[pageNum - 1]?.imageLink) return 0;
  // Across the page from its left edge, and down it from its top edge, as painted.
  const u = (onRight ? hit.x : hit.x + PAGE_W) / PAGE_W - ALBUM_PHOTO_CARD.x;
  const v = 0.5 - hit.y / PAGE_H - ALBUM_PHOTO_CARD.y;
  const inside = u >= 0 && u <= ALBUM_PHOTO_CARD.width && v >= 0 && v <= ALBUM_PHOTO_CARD.height;
  return inside ? pageNum : 0;
}

/** Take hold of the top sheet on the side the ray points at. Returns whether one was grabbed. */
export function grabAlbumPage(ray) {
  if (!wantOpen || coverT < 1 || !albumPageUnder(ray)) return false;
  const turned = turnedCount();
  const sheet = hit.x >= 0 ? sheets[turned] : sheets[turned - 1];
  if (!sheet) return false;
  dragged = sheet;
  dragStartX = hit.x;
  dragStartT = sheet.t;
  return true;
}

/** Follow the pointer: sideways travel turns the sheet, height on the page leans its corner. */
export function dragAlbumPage(ray) {
  if (!dragged || !pagePoint(ray)) return;
  const t = THREE.MathUtils.clamp(dragStartT + (dragStartX - hit.x) / (PAGE_W * 1.65), 0, 1);
  dragged.t = t;
  dragged.targetT = t;
  dragged.targetSkew = -THREE.MathUtils.clamp(hit.y / (PAGE_H * 0.5), -1, 1) * 0.85;
  dragged.dirty = true;
}

/** Let go. A quick tap turns the sheet; a drag turns it once it is past about a third. */
export function releaseAlbumPage(wasTap) {
  if (!dragged) return;
  const fromRight = dragStartT < 0.5;
  if (wasTap && Math.abs(dragged.t - dragStartT) < 0.06) dragged.targetT = fromRight ? 1 : 0;
  else if (fromRight) dragged.targetT = dragged.t > 0.28 ? 1 : 0;
  else dragged.targetT = dragged.t < 0.72 ? 0 : 1;
  dragged.targetSkew = 0;
  dragged = null;
}

/** Per-frame, from animate(): swing the cover and settle the sheets. */
export function updateAlbum(dt) {
  if (!root) return;

  // The cover waits for every sheet to be back before it closes.
  let anyTurned = false;
  for (const sheet of sheets) if (sheet.t > 0.02) anyTurned = true;
  const coverGoal = wantOpen ? 1 : anyTurned ? coverT : 0;
  if (coverT !== coverGoal) {
    const step = dt / COVER_SECONDS;
    coverT = coverGoal > coverT ? Math.min(coverGoal, coverT + step) : Math.max(coverGoal, coverT - step);
    openness = coverT * coverT * (3 - 2 * coverT);
    coverPivot.rotation.y = -Math.PI * openness;
    spinePivot.rotation.y = -Math.PI * 0.5 * openness;
    for (const sheet of sheets) sheet.dirty = true;
  }

  for (let i = 0; i < sheets.length; i++) {
    const sheet = sheets[i];
    if (sheet !== dragged && sheet.t !== sheet.targetT) {
      // Sheets turn one after another, so neighbours never pass through each other, and
      // none leaves before the cover is out of the way.
      const waitsForCover = sheet.targetT > sheet.t && coverT < 1;
      const waitsForPrevious = sheet.targetT > sheet.t && i > 0 && sheets[i - 1].t < 0.3;
      const waitsForNext = sheet.targetT < sheet.t && i < sheets.length - 1 && sheets[i + 1].t > 0.7;
      if (!waitsForCover && !waitsForPrevious && !waitsForNext) {
        sheet.t = damp(sheet.t, sheet.targetT, 7, dt);
        if (Math.abs(sheet.targetT - sheet.t) < 0.002) sheet.t = sheet.targetT;
        sheet.dirty = true;
      }
    }
    if (sheet.skewTimer > 0) {
      sheet.skewTimer -= dt;
      if (sheet.skewTimer <= 0) sheet.targetSkew = 0;
    }
    if (sheet.skew !== sheet.targetSkew) {
      sheet.skew = damp(sheet.skew, sheet.targetSkew, sheet === dragged ? 14 : 9, dt);
      if (Math.abs(sheet.targetSkew - sheet.skew) < 0.002) sheet.skew = sheet.targetSkew;
      sheet.dirty = true;
    }
    if (sheet.dirty) {
      deformSheet(sheet);
      sheet.dirty = false;
    }
  }
}
