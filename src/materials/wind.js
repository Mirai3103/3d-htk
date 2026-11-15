/**
 * GPU vertex-shader wind sway for batched foliage and flowers. All batched meshes stay in a
 * single draw call per material and share one uniform (`windUniform`).
 */

export const windUniform = { value: 0 };

const PRESETS = {
  canopy: `
    float windH = smoothstep(1.9, 5.2, position.y);
    float windPhase = position.x * 0.31 + position.z * 0.27 + position.y * 0.18;
    float windGust = 0.72 + 0.28 * sin(uWindTime * 0.55 + position.x * 0.08 + position.z * 0.06);
    transformed.x += (sin(uWindTime * 1.45 + windPhase) * 0.06 + sin(uWindTime * 2.8 + windPhase * 1.9) * 0.018) * windGust * windH;
    transformed.z += (cos(uWindTime * 1.25 + windPhase * 1.15) * 0.05 + cos(uWindTime * 2.4 + windPhase * 1.7) * 0.015) * windGust * windH;
    transformed.y += sin(uWindTime * 1.9 + windPhase * 1.4) * 0.015 * windH;
  `,
  palm: `
    float windH = smoothstep(1.3, 3.6, position.y);
    float windPhase = position.x * 0.42 + position.z * 0.38 + position.y * 0.24;
    float windGust = 0.7 + 0.3 * sin(uWindTime * 0.6 + position.x * 0.09);
    transformed.x += sin(uWindTime * 1.65 + windPhase) * 0.055 * windGust * windH;
    transformed.z += cos(uWindTime * 1.4 + windPhase * 1.1) * 0.048 * windGust * windH;
    transformed.y += sin(uWindTime * 2.2 + windPhase * 1.6) * 0.026 * windGust * windH;
  `,
  flora: `
    float windH = smoothstep(0.06, 0.45, position.y);
    float windPhase = position.x * 1.65 + position.z * 1.45 + position.y * 2.2;
    float windGust = 0.75 + 0.25 * sin(uWindTime * 0.65 + position.x * 0.12);
    transformed.x += sin(uWindTime * 2.25 + windPhase) * 0.02 * windGust * windH;
    transformed.z += cos(uWindTime * 1.95 + windPhase * 1.15) * 0.018 * windGust * windH;
    transformed.y += sin(uWindTime * 2.7 + windPhase * 0.9) * 0.007 * windH;
  `,
};

/** Attach a gentle GPU wind sway to a material (`'canopy'`, `'palm'` or `'flora'`). */
export function applyWind(material, kind) {
  const snippet = PRESETS[kind];
  if (!material || !snippet) return;
  material.customProgramCacheKey = () => `wind-${kind}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = windUniform;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWindTime;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${snippet}`);
  };
}

export function updateWind(t) {
  windUniform.value = t;
}
