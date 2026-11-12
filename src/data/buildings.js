/**
 * Campus directory: names, pick bounds, label anchors and camera views for
 * every selectable building. Edit content here. `view` is the camera for a selected building;
 * an optional `mobileView` replaces it on narrow screens (otherwise `view` is pulled back).
 */

import * as THREE from 'three';

export const BUILDINGS = {
  admin: {
    name: 'Nhà Hành chính',
    short: 'Hành chính',
    kind: 'Điểm nhấn',
    bounds: { x: -12, z: -22.1, w: 21.7, h: 14.5, d: 17.2, base: 0 },
    label: new THREE.Vector3(-12, 18.4, -23.2),
    view: { position: [6.0, 17.5, 3.5], target: [-12, 5.0, -22.0] },
  },
  back: {
    name: 'Dãy lớp học phía sau',
    short: 'Lớp học sau',
    kind: 'Giảng dạy',
    bounds: { x: 17, z: -24.4, w: 39.4, h: 10.5, d: 11.7, base: 0 },
    label: new THREE.Vector3(17, 14.2, -24.5),
    view: { position: [28.5, 16.0, 8.0], target: [16.5, 4.0, -24.0] },
  },
  right: {
    name: 'Dãy lớp học bên phải',
    short: 'Dãy bên phải',
    kind: 'Giảng dạy',
    bounds: { x: 42, z: -2, w: 10.5, h: 10.3, d: 37.6, base: 0 },
    label: new THREE.Vector3(42, 14.2, -2.2),
    view: { position: [19.0, 15.2, 8.0], target: [42, 4.0, -2.0] },
  },
  innerLeft: {
    name: 'Dãy lớp học trái trong',
    short: 'Dãy trái trong',
    kind: 'Giảng dạy',
    bounds: { x: -28.1, z: -3, w: 12.7, h: 10.2, d: 33.3, base: 0 },
    label: new THREE.Vector3(-29, 14.2, -3.2),
    view: { position: [-8.5, 14.0, 25.0], target: [-29, 3.6, -3.5] },
  },
  outerLeft: {
    name: 'Dãy lớp học trái ngoài',
    short: 'Dãy trái ngoài',
    kind: 'Giảng dạy',
    bounds: { x: -44, z: -3, w: 10.5, h: 10.2, d: 41.3, base: 0 },
    label: new THREE.Vector3(-44, 14.2, -3.2),
    view: { position: [-12.0, 25.0, 28.0], target: [-43.0, 4.0, -4.0] },
  },
  stage: {
    name: 'Lễ đài',
    short: 'Lễ đài',
    kind: 'Hội họp',
    bounds: { x: 3, z: -14.7, w: 10.7, h: 6.4, d: 11.7, base: 0 },
    label: new THREE.Vector3(3, 9.0, -15.0),
    view: { position: [15.5, 12.2, 5.5], target: [2.6, 2.8, -15.2] },
  },
  bust: {
    name: 'Tượng cụ Huỳnh Thúc Kháng',
    short: 'Tượng cụ Huỳnh Thúc Kháng',
    kind: 'Tưởng niệm',
    bounds: { x: 10, z: -13, w: 2.6, h: 3.0, d: 2.6, base: 0 },
    label: new THREE.Vector3(10, 3.8, -13.2),
    view: { position: [10, 2.2, -6.6], target: [10, 1.5, -13] },
    // Phones: a wider, lower framing of the bust.
    mobileView: { position: [10, 3.2, -4.0], target: [10, 0, -13] },
  },
  gate: {
    name: 'Cổng chính',
    short: 'Cổng chính',
    kind: 'Lối vào',
    bounds: { x: -1.5, z: 28.9, w: 19.0, h: 8.6, d: 6.3, base: 0 },
    label: new THREE.Vector3(0, 9.5, 30.3),
    view: { position: [7.5, 8.2, 43.5], target: [0, 3.5, 29.4] },
  },
  teachersDay: {
    name: 'Góc Ngày Nhà giáo',
    short: 'Ngày 20/11',
    kind: 'Sự kiện',
    bounds: { x: -11.45, z: 7.7, w: 14.9, h: 4.2, d: 6.9, base: 0 },
    label: new THREE.Vector3(-12, 5.0, 6.6),
    view: { position: [-6.2, 5.0, 22.6], target: [-9.0, 1.8, 6.4] },
    // Phones: look down from higher up and aim short of the booth so it sits mid-frame.
    mobileView: { position: [-8.0, 9.0, 24.0], target: [-10.5, 0.5, 13.5] },
  },
};

export const BUILDING_ORDER = ['admin', 'back', 'right', 'innerLeft', 'outerLeft', 'stage', 'bust', 'gate', 'teachersDay'];
export const BUILDING_TOTAL = BUILDING_ORDER.length;
