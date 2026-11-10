/**
 * Weather presets (sunny / cloudy / rain / night) and the per-frame interpolation that
 * drives lights, sky, fog, materials and rain.
 */

import * as THREE from 'three';
import { damp } from '../core/math.js';
import { ROOT } from '../core/dom.js';
import { clock, renderer, scene } from '../core/engine.js';
import { ENV_TEXTURES } from '../textures/sky.js';
import { M, SIGN_MATERIALS } from '../materials/registry.js';
import { wetMaterials } from '../materials/library.js';
import { moon, moonMaterial, skyUniforms, starMaterial, stars } from './sky.js';
import { ambient, courtyardFill, hemi, lampGlows, lampLights, sun } from './lights.js';
import { rain, rainUniforms } from './rain.js';
import { puddleMeshes } from './puddles.js';

const WEATHERS = {
  sunny: {
    label: 'Sunny',
    skyTop: '#0c5fc9', skyHorizon: '#b9e3f8', skyGround: '#b9cbc1',
    cloudLight: '#fffdf6', cloudDark: '#b9cbd5',
    sunColor: '#fff4d5', sunIntensity: 3.35,
    hemiSky: '#b9ddff', hemiGround: '#8b7e58', hemiIntensity: 1.02,
    ambientColor: '#f7f0da', ambientIntensity: 0.13,
    fogColor: '#c7dfea', fogNear: 135, fogFar: 445,
    cloud: 0.06, night: 0, rain: 0, wet: 0, lamps: 0, windows: 0,
    exposure: 1.02, shadow: 0.8, envIntensity: 0.48, stars: 0,
    sunVisible: 1,
    env: 'sunny',
  },
  cloudy: {
    label: 'Cloudy',
    skyTop: '#7e8e9a', skyHorizon: '#cbd3d5', skyGround: '#aab0aa',
    cloudLight: '#eef0ed', cloudDark: '#9faab0',
    sunColor: '#dce5e8', sunIntensity: 0.06,
    hemiSky: '#c4d0d4', hemiGround: '#60675d', hemiIntensity: 1.4,
    ambientColor: '#c7d1d4', ambientIntensity: 0.36,
    fogColor: '#aeb9bc', fogNear: 64, fogFar: 310,
    cloud: 0.95, night: 0, rain: 0, wet: 0, lamps: 0, windows: 0,
    exposure: 0.82, shadow: 0.015, envIntensity: 0.24, stars: 0,
    sunVisible: 0.1,
    env: 'cloudy',
  },
  rain: {
    label: 'Rain',
    skyTop: '#26343d', skyHorizon: '#6f7e85', skyGround: '#596663',
    cloudLight: '#9eafb7', cloudDark: '#424f56',
    sunColor: '#a6b8c2', sunIntensity: 0.22,
    hemiSky: '#879ba4', hemiGround: '#46504a', hemiIntensity: 0.78,
    ambientColor: '#8f9fa5', ambientIntensity: 0.17,
    fogColor: '#6d7b80', fogNear: 22, fogFar: 165,
    cloud: 1, night: 0.03, rain: 1, wet: 1, lamps: 0.08, windows: 0,
    exposure: 0.84, shadow: 0.12, envIntensity: 0.26, stars: 0,
    sunVisible: 0,
    env: 'rain',
  },
  night: {
    label: 'Night',
    skyTop: '#020713', skyHorizon: '#0e1a2c', skyGround: '#05090d',
    cloudLight: '#1e2b3e', cloudDark: '#070d15',
    sunColor: '#8ba5dc', sunIntensity: 0.3,
    hemiSky: '#2b4368', hemiGround: '#0d120e', hemiIntensity: 0.22,
    ambientColor: '#1b2e4b', ambientIntensity: 0.06,
    fogColor: '#06101c', fogNear: 44, fogFar: 230,
    cloud: 0.38, night: 1, rain: 0, wet: 0.12, lamps: 1, windows: 1,
    exposure: 0.86, shadow: 0.38, envIntensity: 0.09, stars: 0.9,
    sunVisible: 0,
    env: 'night',
  },
};

const COLOR_KEYS = [
  'skyTop', 'skyHorizon', 'skyGround', 'cloudLight', 'cloudDark', 'sunColor',
  'hemiSky', 'hemiGround', 'ambientColor', 'fogColor',
];
const NUM_KEYS = [
  'sunIntensity', 'hemiIntensity', 'ambientIntensity', 'fogNear', 'fogFar',
  'cloud', 'night', 'rain', 'wet', 'lamps', 'windows', 'exposure', 'shadow',
  'envIntensity', 'stars', 'sunVisible',
];

function buildWeatherRuntime(name) {
  const source = WEATHERS[name];
  const runtime = { name, label: source.label, env: source.env };
  for (const key of COLOR_KEYS) runtime[key] = new THREE.Color(source[key]);
  for (const key of NUM_KEYS) runtime[key] = source[key];
  return runtime;
}

let targetWeather = buildWeatherRuntime('sunny');
export const currentWeather = buildWeatherRuntime('sunny');
let weatherName = 'sunny';

scene.environment = ENV_TEXTURES.sunny;
scene.environmentIntensity = currentWeather.envIntensity;
scene.background = new THREE.Color(currentWeather.fogColor);

export function setWeather(name) {
  if (!WEATHERS[name] || weatherName === name) return;
  weatherName = name;
  targetWeather = buildWeatherRuntime(name);
  scene.environment = ENV_TEXTURES[targetWeather.env];
  document.querySelectorAll('.weather-btn').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.weather === name));
  });
  ROOT.dataset.weather = name;
}

ROOT.dataset.weather = 'sunny';

export function updateWeather(dt) {
  const k = 1 - Math.exp(-2.2 * dt);
  for (const key of COLOR_KEYS) currentWeather[key].lerp(targetWeather[key], k);
  for (const key of NUM_KEYS) {
    currentWeather[key] = damp(currentWeather[key], targetWeather[key], 2.2, dt);
  }

  ambient.color.copy(currentWeather.ambientColor);
  ambient.intensity = currentWeather.ambientIntensity;
  hemi.color.copy(currentWeather.hemiSky);
  hemi.groundColor.copy(currentWeather.hemiGround);
  hemi.intensity = currentWeather.hemiIntensity;
  sun.color.copy(currentWeather.sunColor);
  sun.intensity = currentWeather.sunIntensity;
  sun.shadow.intensity = currentWeather.shadow;
  courtyardFill.intensity = 0.06 + currentWeather.sunIntensity * 0.045;
  courtyardFill.color.copy(currentWeather.sunColor);

  if (scene.fog) {
    scene.fog.color.copy(currentWeather.fogColor);
    scene.fog.near = currentWeather.fogNear;
    scene.fog.far = currentWeather.fogFar;
  }
  scene.background.copy(currentWeather.fogColor);
  renderer.toneMappingExposure = currentWeather.exposure;
  scene.environmentIntensity = currentWeather.envIntensity;

  skyUniforms.uTop.value.copy(currentWeather.skyTop);
  skyUniforms.uHorizon.value.copy(currentWeather.skyHorizon);
  skyUniforms.uGround.value.copy(currentWeather.skyGround);
  skyUniforms.uSunColor.value.copy(currentWeather.sunColor);
  skyUniforms.uCloudLight.value.copy(currentWeather.cloudLight);
  skyUniforms.uCloudDark.value.copy(currentWeather.cloudDark);
  skyUniforms.uCloud.value = currentWeather.cloud;
  skyUniforms.uNight.value = currentWeather.night;

  starMaterial.opacity = currentWeather.stars * 0.95;
  stars.visible = currentWeather.stars > 0.01;
  moonMaterial.opacity = currentWeather.night * 0.88;
  moon.visible = currentWeather.night > 0.02;

  M.windowLit.emissiveIntensity = currentWeather.windows * 3.1;
  M.windowDark.emissiveIntensity = 0;
  M.lampGlass.emissiveIntensity = 0.16 + currentWeather.lamps * 3.2;
  for (const material of SIGN_MATERIALS) {
    material.emissiveIntensity = currentWeather.night * 0.52;
  }
  for (const glow of lampGlows) glow.opacity = currentWeather.lamps * 0.92 * (1 - currentWeather.night * 0.06);
  for (const warningLamp of lampLights) warningLamp.intensity = currentWeather.lamps * 100;
  for (const puddle of puddleMeshes) {
    puddle.visible = currentWeather.wet > 0.08;
  }
  M.puddle.opacity = currentWeather.wet * 0.58;

  for (const entry of wetMaterials) {
    entry.material.color.copy(entry.baseColor).lerp(entry.wetColor, currentWeather.wet);
    entry.material.roughness = THREE.MathUtils.lerp(entry.dryRoughness, entry.wetRoughness, currentWeather.wet);
    entry.material.metalness = THREE.MathUtils.lerp(entry.dryMetalness, entry.wetMetalness, currentWeather.wet);
  }

  rainUniforms.uOpacity.value = currentWeather.rain * 0.92;
  rainUniforms.uTime.value = clock.getElapsed();
  rain.visible = currentWeather.rain > 0.012;
}
