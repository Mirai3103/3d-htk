/**
 * Neighbouring houses, outside trees and the roadside fence.
 */

import { HALF_PI } from '../core/math.js';
import { Builder, siteBuilder } from '../geometry/batching.js';
import { addDoorZ, addGableRoofX, addWindowZ } from '../kit/architecture.js';
import { addTree } from '../kit/vegetation.js';

function addNeighborhoodHouse(x, z, w, d, h, wallKey, roofKey, ridgeKey, seed, yaw = 0) {
  const b = new Builder(x, z, yaw);
  b.box('stoneBase', w + 0.2, 0.26, d + 0.2, 0, 0.13, 0);
  b.box(wallKey, w, h, d, 0, h / 2, 0);
  b.box('trim', w + 0.24, 0.18, d + 0.24, 0, h, 0);
  addGableRoofX(b, 0, h, 0, w, d, Math.max(1.1, d * 0.22), 0.55, roofKey, ridgeKey, wallKey);
  const zf = d / 2 + 0.02;
  addDoorZ(b, -w * 0.23, 0.05, zf, 0.92, 2.0, seed % 2 ? 'doorWood' : 'doorTeal');
  addWindowZ(b, w * 0.17, 0.95, zf, 1.2, 1.15, seed % 3 !== 0);
  addWindowZ(b, w * 0.34, 0.95, zf, 0.9, 1.15, seed % 2 === 0);
  // A narrow veranda canopy over the front door.
  b.box('roofTile', 2.6, 0.1, 1.25, -w * 0.18, 2.65, zf + 0.5, 0.16, 0, 0);
  b.cylinder('trim', 0.055, 2.5, -w * 0.18 - 1.2, 1.25, zf + 1.02);
  b.cylinder('trim', 0.055, 2.5, -w * 0.18 + 1.2, 1.25, zf + 1.02);
  // Low front wall and a couple of shrubs.
  const yard = new Builder(x, z + d / 2 + 2.4, yaw);
  yard.box('creamDim', w + 0.4, 0.7, 0.18, 0, 0.35, 0);
  yard.box('stoneBase', w + 0.4, 0.18, 0.2, 0, 0.09, 0);
  addTree(yard, -w * 0.36, 0.6, 4.2, 1.8, seed * 7 + 3);
  addTree(b, w * 0.43, -d * 0.2, 3.8, 1.6, seed * 7 + 4);
}

export function buildNeighborhood() {
  const wallOptions = ['cream', 'wallPale', 'trimSoft', 'cream', 'wallPale'];
  const roofOptions = [
    ['roofTile', 'ridgeTile'], ['roofBlue', 'ridge'], ['roofMaroon', 'ridgeMaroon'],
    ['roofTeal', 'ridge'], ['roofRed', 'ridgeMaroon'], ['roofGrey', 'ridgePale'],
  ];
  const houses = [
    [-36, -47, 13, 8, 4.4, 0, 0],
    [-14, -48, 11, 7.5, 3.9, 1, 0],
    [7, -49, 14, 8, 5.1, 2, 0],
    [29, -46.5, 11, 7.8, 4.0, 3, 0],
    [47, -44, 9, 8.4, 3.7, 4, 0],
    [-63, -17, 10, 12, 4.6, 1, HALF_PI],
    [-63, 14, 10, 11, 3.8, 0, HALF_PI],
    [63, -18, 10, 12, 4.6, 2, -HALF_PI],
    [63, 20, 10, 11, 4.1, 4, -HALF_PI],
    [-40, 49, 11, 8, 4.4, 3, 0],
    [42, 48, 12, 8.5, 4.8, 5, 0],
    [-12, 51, 10, 7, 3.9, 1, 0],
  ];
  for (const [x, z, w, d, h, wi, yaw] of houses) {
    const [roofKey, ridgeKey] = roofOptions[wi % roofOptions.length];
    addNeighborhoodHouse(x, z, w, d, h, wallOptions[wi % wallOptions.length], roofKey, ridgeKey, 40 + wi, yaw);
  }

  // Background orchard / neighborhood trees.
  const outsideTrees = [
    [-73, 2, 8.6, 3.8, 901], [-78, -35, 9.4, 4.2, 902], [-69, 39, 7.8, 3.3, 903],
    [72, -2, 9.0, 4.0, 904], [75, -36, 8.4, 3.6, 905], [68, 36, 8.2, 3.5, 906],
    [-26, -60, 8.2, 3.5, 907], [22, -64, 9.0, 3.9, 908], [52, -58, 7.4, 3.0, 909],
    [-62, 58, 7.8, 3.2, 910], [13, 61, 8.0, 3.3, 911], [62, 63, 8.4, 3.6, 912],
  ];
  for (const [x, z, h, r, s] of outsideTrees) addTree(siteBuilder, x, z, h, r, s);

  // A simple low fence along part of the road frontage, beyond the wall.
  const b = siteBuilder;
  for (let x = -55; x < -12; x += 4.2) {
    b.box('creamDim', 0.13, 0.85, 0.13, x, 0.425, 42.2);
    b.box('creamDim', 3.3, 0.08, 0.08, x + 1.65, 0.6, 42.2);
  }
}
