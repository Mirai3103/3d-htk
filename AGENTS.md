# AGENTS.md — THCS Huỳnh Thúc Kháng 3D Campus

Procedural low-poly 3D model of a Vietnamese secondary school, built with **Three.js + Vite**.
Everything (geometry, textures, signs) is generated in code: there are **no image/model assets
and no CDN**. `bun run build` produces **one self-contained file: `dist/index.html`**
(via `vite-plugin-singlefile`).

## Commands (package manager: **bun**)

| Command            | What it does                                                         |
| ------------------ | -------------------------------------------------------------------- |
| `bun install`      | Install deps                                                         |
| `bun run dev`      | Dev server with HMR (full reload on most changes)                    |
| `bun run lint`     | ESLint: catches **missing imports** (`no-undef`), writes to imports  |
| `bun run build`    | Single-file bundle → `dist/index.html`                               |
| `bun run check`    | `lint` + `build`. **Run this after every change.**                   |

`bun run check` passing ≠ the scene works: runtime errors only show in the browser console.
When in doubt, open `bun run dev` (or `dist/index.html`) and check the console.

Do not edit `index.backup.donttouch.html` (original single-file version, kept for reference) or
`vite-project-template/`.

## World conventions

- Units are **metres**. `+X` east/right, `+Z` toward the street (front), `-Z` back, `+Y` up.
- The school lot is `x ∈ [-50, 100]`, `z ∈ [-30, 30]`: the main campus `x ∈ [-50, 50]` and the
  east side yard (basketball court, parking rows, secondary gate) `x ∈ [50, 100]`. Main gate at
  `z = +30`, admin block at the back.
- All randomness uses `seededRandom(seed)` (`core/math.js`) so the campus is deterministic.
  Never use `Math.random()` for scene content.

## Source map (`src/`)

Every file starts with a doc comment saying what it owns. Dependencies flow downward:

```
main.js                     boot() + animate() render loop. Per-frame updates are called here.
core/
  math.js                   TAU, HALF_PI, seededRandom, damp
  dom.js                    references to static DOM in index.html (loader, panel, buttons…)
  engine.js                 renderer, scene, camera, OrbitControls, raycaster, clock, targetPixelRatio
textures/                   canvas-painted textures (no image files)
  canvas.js                 makeCanvas, canvasTexture, signTexture, fitText, drawStar, rgba
  surfaces.js               stucco, brick, grass, asphalt, concrete, court, corrugation, roof tile
  signs.js                  gate/admin signs, banner, stage backdrop, plaque, flag
  sky.js                    env maps per weather, lamp glow, moon
materials/
  registry.js               MATS map, std(), addSignMaterial(), M (direct handles), SIGN/GLOW lists
  library.js                ALL named materials (std('wall', {...}) …), wetMaterials, ensureBuildMaterials
geometry/
  batching.js               UNIT geometries, Builder, siteBuilder, commitGeometry, flushBatches
  colliders.js              walk-mode collision registry: solid boxes/circles, raised floors
scene/
  sky.js                    sky dome shader, stars, moon (skyGroup follows the camera)
  lights.js                 ambient/hemi/sun/fill lights, lampLights, makeLampGlow()
  rain.js                   GPU rain points
  weather.js                WEATHERS presets, setWeather(name), updateWeather(dt), currentWeather
  puddles.js                createPuddles(), puddleMeshes
data/
  buildings.js              BUILDINGS directory (text, bounds, label anchor, camera view), BUILDING_ORDER
kit/                        reusable parts; every function takes a Builder `b` first
  architecture.js           windows, doors, railings, gable/hip roofs, porch, sagging awning
  vegetation.js             addTree, addPalm, addPottedPlant, addFlowerCluster, addOrientedCone
  furniture.js              addBench, addStudent, addBicycleRack
campus/                     one file per place on the site; each exports build*()
  index.js                  buildCampus(): calls every builder in order  ← register new builders here
  ground.js perimeter.js gate.js administration.js classroomBlock.js ceremonyStage.js
  memorialBust.js sportsCourt.js bicycleShed.js courtyardLife.js courtyardLamps.js neighborhood.js
  sideYard.js
interaction/
  cameraRig.js              overview framing, flyTo*/startCameraFlight, constrainCamera, isCameraFlying
  walk.js                   first-person walk mode: enter/exitWalk, isWalking, updateWalk(dt)
  picking.js                invisible pick proxies from BUILDINGS bounds, findBuildingAtEvent
  hover.js                  hovered state + outline box (getHoveredBuilding, setHoveredBuilding)
  labels.js                 HTML labels projected from 3D, toggleLabels
  panel.js                  selectBuilding(id), closePanel()
  input.js                  initInput(): every DOM/pointer/keyboard/resize listener
styles/
  index.css                 @imports the parts below — ORDER MATTERS, responsive.css last
  base.css brand.css controls.css labels.css panel.css hint.css walk.css loader.css responsive.css
```

`index.html` holds only the static markup (header, weather buttons, info panel, loader) plus a
tiny classic error-guard script. IDs/classes used by JS are referenced through `core/dom.js`.

## How geometry works (read before adding scenery)

Static scenery is **not** added as individual meshes. You call a `Builder`, which queues a
transformed copy of a unit geometry under a **material key**; after all builders run,
`flushBatches()` merges everything per key into one mesh (very few draw calls).

```js
import { Builder, siteBuilder } from '../geometry/batching.js';

const b = new Builder(cx, cz, yaw);           // local frame: origin (cx, 0, cz), rotated by yaw
b.box('wall', w, h, d, x, y, z);              // x,y,z = CENTER of the box in the local frame
b.plane('grass', w, h, x, y, z, -HALF_PI);    // planes are vertical by default; rotate X for floors
b.cylinder('trim', radius, height, x, y, z);
b.sphere('brass', r, x, y, z, sx, sy, sz);
b.blob('leaf', r, x, y, z, sx, sy, sz, ry);   // low-poly icosahedron (foliage)
b.cylinderBetween('trunk', x1, y1, z1, x2, y2, z2, r);
b.geometry('key', anyBufferGeometry, x, y, z, rx, ry, rz, sx, sy, sz);
```

- `siteBuilder` is the world-frame builder (no offset/rotation).
- The first argument is a **material key** registered in `materials/library.js`. An unknown key
  throws `Unknown material batch: <key>` at build time.
- Builder output is **static**: it cannot be moved or animated after `flushBatches()`.
  Anything dynamic (the flag, lamp glows, point lights, puddles, rain) is a real `THREE.Object3D`
  added with `scene.add(...)` and updated per frame.

## Walk mode (first person)

The **Walk** button flies the camera down to the main gate and hands it to `interaction/walk.js`:
arrows / WASD walk and turn, Shift runs, dragging looks around, Esc (or Overview) flies back.
While walking, `#app` has the class `is-walking`, the orbit controls, picking and labels are off
and `animate()` calls `updateWalk(dt)` instead of `controls.update()`.

- The walker is a circle (radius 0.35 m, eyes 1.45 m up) confined to the campus (main lot and east
  side yard). It never raycasts the merged meshes: it collides with the 2D footprints in
  `geometry/colliders.js`.
- **Anything you build that a pupil could bump into needs a collider**, registered right next to
  its geometry, in the same local frame:

  ```js
  b.solidBox(w, d, x, z, ry);     // walls, railings, benches (footprint centred on x, z)
  b.solidCircle(radius, x, z);    // trunks, posts, pots
  b.floor(w, d, x, z, height);    // surface that can be stood on (platform, step, plinth)
  ```

  Kit helpers already do this (`addTree`, `addPalm`, `addPottedPlant`, `addBench`, `addStudent`,
  `addBicycleRack`, ground-level `addRailingX`, `addSimplePorch`).
- A floor is climbed only from a spot at most 0.36 m lower, so a tall platform needs steps that
  are floors too (see the ceremony stage). Stepping off any edge is always allowed.
- Dev only: `?walk=x,z,yawDegrees,pitchDegrees` (e.g. `/?walk=3,-12,180`) starts in walk mode at
  that spot, handy for checking a first-person view.

## Recipes

**Add a material** → `materials/library.js`: `std('myKey', { color: 0x…, roughness: … }, { castShadow, receiveShadow })`.
If weather must change it (e.g. wet look), also add it to `wetMaterials` there, or handle it in
`updateWeather()` (`scene/weather.js`). Need a direct handle? Set `M.myKey = MATS.get('myKey').material`.

**Add a new structure** → create `campus/myThing.js` exporting `buildMyThing()`, use kit helpers,
then call it from `buildCampus()` in `campus/index.js`. Keep it inside the lot unless it is background.

**Make it selectable (info panel + label + hover outline)** → add an entry to `BUILDINGS` and its id to
`BUILDING_ORDER` in `data/buildings.js` (`bounds` = pick box centre/size, `label` = 3D anchor,
`view` = camera position/target used by `flyToBuilding`). Picking, labels and panel pick it up
automatically. Also add a `mobileScales` entry in `cameraRig.js#flyToBuilding` if needed.

**Add a weather preset** → `WEATHERS` in `scene/weather.js` (all keys of `COLOR_KEYS`/`NUM_KEYS`
are required), an env texture in `textures/sky.js` `ENV_TEXTURES`, and a `.weather-btn` with
`data-weather="<name>"` in `index.html`.

**Animate something per frame** → keep the state in the module that owns the object, export an
`updateX(t / dt)` function, and call it from `animate()` in `main.js` (see `updateFlag`).

**New UI control** → markup in `index.html`, element ref in `core/dom.js`, listener in
`interaction/input.js#initInput`, styles in the matching `styles/*.css`.

## Rules / gotchas

- **State ownership:** mutable module state (`let`) is only reassigned inside the module that declares
  it. Other modules use exported functions/getters (`getHoveredBuilding()`, `isCameraFlying()`,
  `toggleLabels()`). Assigning to an imported binding is an error (`no-import-assign`).
- Module side effects run at import time (e.g. `engine.js` creates the renderer, `library.js`
  creates materials, `lights.js` adds lights). Keep heavy work inside functions called from `boot()`.
- `interaction/panel.js ↔ labels.js ↔ hover.js` import each other; that is fine only because they
  touch each other's exports inside functions, never at module top level. Keep it that way.
- `camera.fov` and `camera.near` differ between the orbit views and walk mode. Camera flights carry
  the FOV (`startCameraFlight(..., { fov })`); do not set it elsewhere while a flight is running.
- Shadows are static: `renderer.shadowMap.autoUpdate = false`. If you add/move shadow casters after
  boot, set `renderer.shadowMap.needsUpdate = true`.
- Import three.js as `import * as THREE from 'three'`; addons from `three/addons/...` (pinned 0.186.0).
- Keep it single-file friendly: no runtime `fetch`, no external URLs. Small assets imported from
  `src/` get inlined by the build; avoid large binaries (the HTML is ~720 kB, mostly three.js).
- UI text is English; on-scene signage is Vietnamese (with diacritics) — keep both as they are.
