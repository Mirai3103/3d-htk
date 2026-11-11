/**
 * Walkable-space registry for the first-person walk mode. Campus builders register what
 * blocks a pedestrian (solid boxes / circles) and what can be stepped onto (raised floors)
 * right next to the geometry they describe, through `Builder.solidBox / solidCircle / floor`.
 *
 * Everything here is 2D: the XZ plane in metres, world frame. Boxes may be rotated (yaw).
 */

const solids = [];
const floors = [];

function makeBox(x, z, w, d, yaw) {
  return { x, z, hw: w / 2, hd: d / 2, cos: Math.cos(yaw), sin: Math.sin(yaw) };
}

/** A footprint the walker cannot enter (wall, railing, bench…). */
export function addSolidBox(x, z, w, d, yaw = 0) {
  solids.push({ circle: false, ...makeBox(x, z, w, d, yaw) });
}

/** A round footprint the walker cannot enter (trunk, post, column…). */
export function addSolidCircle(x, z, r) {
  solids.push({ circle: true, x, z, r });
}

/** A raised walking surface `height` metres above the ground (platform, step, plinth…). */
export function addFloor(x, z, w, d, height, yaw = 0) {
  floors.push({ height, ...makeBox(x, z, w, d, yaw) });
}

/** Height of the highest floor under (x, z); 0 on plain ground. */
export function floorHeightAt(x, z) {
  let height = 0;
  for (const f of floors) {
    if (f.height <= height) continue;
    const dx = x - f.x;
    const dz = z - f.z;
    const lx = dx * f.cos - dz * f.sin;
    const lz = dx * f.sin + dz * f.cos;
    if (Math.abs(lx) <= f.hw && Math.abs(lz) <= f.hd) height = f.height;
  }
  return height;
}

/**
 * Push a circle of `radius` at `point` ({ x, z }, mutated) out of every solid it overlaps.
 * Two passes are enough to settle the usual "pressed into a corner" case.
 */
export function resolveSolids(point, radius) {
  for (let pass = 0; pass < 2; pass++) {
    let moved = false;
    for (const s of solids) {
      const dx = point.x - s.x;
      const dz = point.z - s.z;
      if (s.circle) {
        const reach = s.r + radius;
        const distSq = dx * dx + dz * dz;
        if (distSq >= reach * reach) continue;
        const dist = Math.sqrt(distSq);
        // Dead centre has no direction to leave by; pick one.
        const nx = dist > 1e-6 ? dx / dist : 1;
        const nz = dist > 1e-6 ? dz / dist : 0;
        point.x = s.x + nx * reach;
        point.z = s.z + nz * reach;
        moved = true;
        continue;
      }
      let lx = dx * s.cos - dz * s.sin;
      let lz = dx * s.sin + dz * s.cos;
      if (Math.abs(lx) >= s.hw + radius || Math.abs(lz) >= s.hd + radius) continue;
      const nearX = Math.max(-s.hw, Math.min(s.hw, lx));
      const nearZ = Math.max(-s.hd, Math.min(s.hd, lz));
      const ox = lx - nearX;
      const oz = lz - nearZ;
      if (ox === 0 && oz === 0) {
        // Centre is inside the box: leave through the nearest face.
        const exitX = s.hw + radius - Math.abs(lx);
        const exitZ = s.hd + radius - Math.abs(lz);
        if (exitX < exitZ) lx = (lx < 0 ? -1 : 1) * (s.hw + radius);
        else lz = (lz < 0 ? -1 : 1) * (s.hd + radius);
      } else {
        const dist = Math.hypot(ox, oz);
        if (dist >= radius) continue;
        const push = (radius - dist) / dist;
        lx += ox * push;
        lz += oz * push;
      }
      point.x = s.x + lx * s.cos + lz * s.sin;
      point.z = s.z - lx * s.sin + lz * s.cos;
      moved = true;
    }
    if (!moved) break;
  }
  return point;
}
