/**
 * Campus directory: names, descriptions, pick bounds, label anchors and camera views for
 * every selectable building. Edit content here. `view` is the camera for a selected building;
 * an optional `mobileView` replaces it on narrow screens (otherwise `view` is pulled back).
 */

import * as THREE from 'three';

export const BUILDINGS = {
  admin: {
    name: 'Nhà Hành chính',
    short: 'Hành chính',
    kind: 'Điểm nhấn',
    sub: 'Điểm nhấn · Cuối khuôn viên',
    area: 720,
    storeys: 3,
    description: 'Trái tim của nhà trường: phòng hiệu trưởng, phòng giáo viên, thư viện và các phòng họp.',
    bounds: { x: -12, z: -22.1, w: 21.7, h: 14.5, d: 17.2, base: 0 },
    label: new THREE.Vector3(-12, 18.4, -23.2),
    view: { position: [6.0, 17.5, 3.5], target: [-12, 5.0, -22.0] },
  },
  back: {
    name: 'Dãy lớp học phía sau',
    short: 'Lớp học sau',
    kind: 'Giảng dạy',
    sub: 'Dãy lớp học · Rìa phía bắc',
    area: 684,
    storeys: 2,
    description: 'Các phòng học phổ thông nối nhau dọc hành lang mở, thông gió tự nhiên.',
    bounds: { x: 17, z: -24.4, w: 39.4, h: 10.5, d: 11.7, base: 0 },
    label: new THREE.Vector3(17, 14.2, -24.5),
    view: { position: [28.5, 16.0, 8.0], target: [16.5, 4.0, -24.0] },
  },
  right: {
    name: 'Dãy lớp học bên phải',
    short: 'Dãy bên phải',
    kind: 'Giảng dạy',
    sub: 'Dãy lớp học · Phía đông',
    area: 648,
    storeys: 2,
    description: 'Dãy lớp học dài nhìn ra sân trường, phía ngoài là nhà để xe đạp.',
    bounds: { x: 42, z: -2, w: 10.5, h: 10.3, d: 37.6, base: 0 },
    label: new THREE.Vector3(42, 14.2, -2.2),
    view: { position: [19.0, 15.2, 8.0], target: [42, 4.0, -2.0] },
  },
  innerLeft: {
    name: 'Dãy lớp học trái trong',
    short: 'Dãy trái trong',
    kind: 'Giảng dạy',
    sub: 'Dãy lớp học · Phía tây',
    area: 576,
    storeys: 2,
    description: 'Phòng học và phòng bộ môn tạo nên rìa phía tây của sân trường trung tâm.',
    bounds: { x: -28.1, z: -3, w: 12.7, h: 10.2, d: 33.3, base: 0 },
    label: new THREE.Vector3(-29, 14.2, -3.2),
    view: { position: [-8.5, 14.0, 25.0], target: [-29, 3.6, -3.5] },
  },
  outerLeft: {
    name: 'Dãy lớp học trái ngoài',
    short: 'Dãy trái ngoài',
    kind: 'Giảng dạy',
    sub: 'Dãy lớp học · Rìa phía tây',
    area: 720,
    storeys: 2,
    description: 'Phòng học, phòng thí nghiệm và phòng máy tính dọc rìa yên tĩnh phía ngoài khuôn viên.',
    bounds: { x: -44, z: -3, w: 10.5, h: 10.2, d: 41.3, base: 0 },
    label: new THREE.Vector3(-44, 14.2, -3.2),
    view: { position: [-12.0, 25.0, 28.0], target: [-43.0, 4.0, -4.0] },
  },
  stage: {
    name: 'Lễ đài',
    short: 'Lễ đài',
    kind: 'Hội họp',
    sub: 'Nhà ngoài trời · Sân trường trung tâm',
    area: 40,
    storeys: 1,
    storeysLabel: 'tầng ngoài trời',
    description: 'Nơi diễn ra lễ chào cờ, sinh hoạt dưới cờ, đón tiếp và các sự kiện của trường.',
    bounds: { x: 3, z: -14.7, w: 10.7, h: 6.4, d: 11.7, base: 0 },
    label: new THREE.Vector3(3, 9.0, -15.0),
    view: { position: [15.5, 12.2, 5.5], target: [2.6, 2.8, -15.2] },
  },
  gate: {
    name: 'Cổng chính',
    short: 'Cổng chính',
    kind: 'Lối vào',
    sub: 'Lối vào · Rìa phía trước',
    area: null,
    storeys: null,
    description: 'Cổng trường trang trọng, lối đi bộ bên cạnh, phòng bảo vệ và ngưỡng bước vào sân gạch đỏ.',
    bounds: { x: -1.5, z: 28.9, w: 19.0, h: 8.6, d: 6.3, base: 0 },
    label: new THREE.Vector3(0, 9.5, 30.3),
    view: { position: [7.5, 8.2, 43.5], target: [0, 3.5, 29.4] },
  },
  teachersDay: {
    name: 'Góc Ngày Nhà giáo',
    short: 'Ngày 20/11',
    kind: 'Sự kiện',
    sub: 'Phông check-in · Dưới gốc cây lớn',
    area: 36,
    storeys: 1,
    storeysLabel: 'tầng ngoài trời',
    description: 'Góc chụp ảnh chào mừng Ngày Nhà giáo Việt Nam 20/11: phông vẽ dưới giàn bóng bay, số “20 ♥ 11” cỡ lớn, kệ hoa chúc mừng, màn hình chiếu video kỷ niệm và bàn lưu niệm với cuốn album ảnh bên cạnh bảng lời chúc của học sinh.',
    bounds: { x: -11.45, z: 7.7, w: 14.9, h: 4.2, d: 6.9, base: 0 },
    label: new THREE.Vector3(-12, 5.0, 6.6),
    view: { position: [-6.2, 5.0, 22.6], target: [-9.0, 1.8, 6.4] },
    // Phones: the panel covers the lower half, so look down from higher up and aim short of
    // the booth to lift it into the free part of the screen.
    mobileView: { position: [-8.0, 9.0, 24.0], target: [-10.5, 0.5, 13.5] },
  },
};

export const BUILDING_ORDER = ['admin', 'back', 'right', 'innerLeft', 'outerLeft', 'stage', 'gate', 'teachersDay'];
export const BUILDING_TOTAL = BUILDING_ORDER.length;
