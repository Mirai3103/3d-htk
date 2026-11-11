/**
 * Campus directory: names, descriptions, pick bounds, label anchors and camera views for
 * every selectable building. Edit content here. `view` is the camera for a selected building;
 * an optional `mobileView` replaces it on narrow screens (otherwise `view` is pulled back).
 */

import * as THREE from 'three';

export const BUILDINGS = {
  admin: {
    name: 'Administration Block',
    short: 'Administration',
    kind: 'Landmark',
    sub: 'Landmark · Back of campus',
    area: 720,
    storeys: 3,
    description: 'The school’s civic heart: principal’s office, staff room, library and meeting rooms.',
    bounds: { x: -12, z: -22.1, w: 21.7, h: 14.5, d: 17.2, base: 0 },
    label: new THREE.Vector3(-12, 18.4, -23.2),
    view: { position: [6.0, 17.5, 3.5], target: [-12, 5.0, -22.0] },
  },
  back: {
    name: 'Back Classroom Block',
    short: 'Back Classrooms',
    kind: 'Teaching',
    sub: 'Teaching block · North edge',
    area: 684,
    storeys: 2,
    description: 'General classrooms arranged along an open, naturally ventilated corridor.',
    bounds: { x: 17, z: -24.4, w: 39.4, h: 10.5, d: 11.7, base: 0 },
    label: new THREE.Vector3(17, 14.2, -24.5),
    view: { position: [28.5, 16.0, 8.0], target: [16.5, 4.0, -24.0] },
  },
  right: {
    name: 'Right Classroom Wing',
    short: 'Right Wing',
    kind: 'Teaching',
    sub: 'Classroom wing · East side',
    area: 648,
    storeys: 2,
    description: 'A long classroom wing overlooking the courtyard, with the bicycle shed on its outer side.',
    bounds: { x: 42, z: -2, w: 10.5, h: 10.3, d: 37.6, base: 0 },
    label: new THREE.Vector3(42, 14.2, -2.2),
    view: { position: [19.0, 15.2, 8.0], target: [42, 4.0, -2.0] },
  },
  innerLeft: {
    name: 'Inner Left Wing',
    short: 'Inner Left Wing',
    kind: 'Teaching',
    sub: 'Classroom wing · West side',
    area: 576,
    storeys: 2,
    description: 'Classrooms and subject rooms forming the western edge of the central courtyard.',
    bounds: { x: -28.1, z: -3, w: 12.7, h: 10.2, d: 33.3, base: 0 },
    label: new THREE.Vector3(-29, 14.2, -3.2),
    view: { position: [-8.5, 14.0, 25.0], target: [-29, 3.6, -3.5] },
  },
  outerLeft: {
    name: 'Outer Left Wing',
    short: 'Outer Left Wing',
    kind: 'Teaching',
    sub: 'Classroom wing · West perimeter',
    area: 720,
    storeys: 2,
    description: 'Classrooms, science labs and a computer room along the quiet outer edge of the site.',
    bounds: { x: -44, z: -3, w: 10.5, h: 10.2, d: 41.3, base: 0 },
    label: new THREE.Vector3(-44, 14.2, -3.2),
    view: { position: [-12.0, 25.0, 28.0], target: [-43.0, 4.0, -4.0] },
  },
  stage: {
    name: 'Ceremony Stage',
    short: 'Ceremony Stage',
    kind: 'Gathering',
    sub: 'Open-air pavilion · Central courtyard',
    area: 40,
    storeys: 1,
    storeysLabel: 'open-air',
    description: 'The focus for flag ceremonies, assemblies, welcomes and school events.',
    bounds: { x: 3, z: -14.7, w: 10.7, h: 6.4, d: 11.7, base: 0 },
    label: new THREE.Vector3(3, 9.0, -15.0),
    view: { position: [15.5, 12.2, 5.5], target: [2.6, 2.8, -15.2] },
  },
  gate: {
    name: 'Main Gate',
    short: 'Main Gate',
    kind: 'Entrance',
    sub: 'Entrance · Front boundary',
    area: null,
    storeys: null,
    description: 'The formal school entrance, pedestrian side gate, guard room and the threshold to the red-brick courtyard.',
    bounds: { x: -1.5, z: 28.9, w: 19.0, h: 8.6, d: 6.3, base: 0 },
    label: new THREE.Vector3(0, 9.5, 30.3),
    view: { position: [7.5, 8.2, 43.5], target: [0, 3.5, 29.4] },
  },
  teachersDay: {
    name: 'Teachers’ Day Corner',
    short: 'Teachers’ Day',
    kind: 'Event',
    sub: 'Check-in backdrop · Under the great tree',
    area: 36,
    storeys: 1,
    storeysLabel: 'open-air',
    description: 'A photo spot dressed for Vietnamese Teachers’ Day, 20 November: a painted backdrop under a balloon garland, marquee “20 ♥ 11” numbers, congratulation flower stands, a wall of pupils’ wishes and a souvenir table with a photo album to leaf through.',
    bounds: { x: -12, z: 7.7, w: 11.6, h: 4.2, d: 6.9, base: 0 },
    label: new THREE.Vector3(-12, 5.0, 6.6),
    view: { position: [-7.0, 4.6, 20.2], target: [-9.6, 1.8, 6.4] },
    // Phones: the panel covers the lower half, so look down from higher up and aim short of
    // the booth to lift it into the free part of the screen.
    mobileView: { position: [-8.0, 9.0, 24.0], target: [-10.5, 0.5, 13.5] },
  },
};

export const BUILDING_ORDER = ['admin', 'back', 'right', 'innerLeft', 'outerLeft', 'stage', 'gate', 'teachersDay'];
export const BUILDING_TOTAL = BUILDING_ORDER.length;
