/**
 * Small math helpers shared everywhere: angle constants, a seeded PRNG and frame-rate
 * independent damping.
 */

export const TAU = Math.PI * 2;
export const HALF_PI = Math.PI / 2;

export function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function damp(current, target, lambda, dt) {
  return target + (current - target) * Math.exp(-lambda * dt);
}
