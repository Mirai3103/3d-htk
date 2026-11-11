# AGENTS.md — THCS Huỳnh Thúc Kháng 3D Campus

Procedural low-poly 3D model of a Vietnamese secondary school, built with **Three.js + Vite**.
Everything (geometry, textures, signs) is generated in code: there are **no image/model assets
and no CDN**. `bun run build` produces **one self-contained file: `dist/index.html`**
(via `vite-plugin-singlefile`), plus a copy of `public/` beside it — today only the memory
video, `dist/videos/` (see "The memory video").

## Commands (package manager: **bun**)

| Command            | What it does                                                         |
| ------------------ | -------------------------------------------------------------------- |
| `bun install`      | Install deps                                                         |
| `bun run dev`      | Dev server with HMR (full reload on most changes)                    |
| `bun run lint`     | ESLint: catches **missing imports** (`no-undef`), writes to imports  |
| `bun run build`    | Single-file bundle → `dist/index.html` (+ `public/` copied to `dist/`) |
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
  canvas.js                 makeCanvas, canvasTexture, signTexture, fitText, drawStar, drawHeart, rgba
  surfaces.js               stucco, brick, grass, asphalt, concrete, court, corrugation, roof tile
  signs.js                  gate/admin signs, banner, stage backdrop, plaque, flag
  sky.js                    env maps per weather, lamp glow, moon
  festive.js                Teachers' Day: colour-swatch palette, check-in backdrop, props atlas,
                            the video screen's title card
  album.js                  souvenir album: cover, endpapers, one painted page per ALBUM_ITEMS entry
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
  teacher.js                TEACHER: the courtyard teacher's look, position and speech lines
  album.js                  ALBUM (cover wording) + ALBUM_ITEMS (one { imageLink, description } per page)
  video.js                  MEMORY_VIDEO: the memory video's file and the screen's title card wording
kit/                        reusable parts; every function takes a Builder `b` first
  architecture.js           windows, doors, railings, gable/hip roofs, porch, sagging awning
  vegetation.js             addTree, addPalm, addPottedPlant, addFlowerCluster, addOrientedCone
  furniture.js              addBench, addStudent, addBicycleRack
campus/                     one file per place on the site; each exports build*()
  index.js                  buildCampus(): calls every builder in order  ← register new builders here
  ground.js perimeter.js gate.js administration.js classroomBlock.js ceremonyStage.js
  memorialBust.js sportsCourt.js bicycleShed.js courtyardLife.js courtyardLamps.js neighborhood.js
  sideYard.js
  teacher.js                the teacher NPC (a jointed Object3D, not batched): buildTeacher, updateTeacher
  teachersDayBooth.js       20/11 check-in corner by the great tree: buildTeachersDayBooth, update…
  album.js                  the souvenir album on its table (real meshes: cover, curling sheets)
  memoryScreen.js           the memory-video screen: batched stand + its self-lit picture mesh
interaction/
  cameraRig.js              overview framing, flyTo*/startCameraFlight, constrainCamera, isCameraFlying
  walk.js                   first-person walk mode: enter/exitWalk, isWalking, updateWalk(dt)
  picking.js                pick proxies (buildings, teacher, album, video screen), findPickAtEvent
  dialogue.js               teacher's "talk" prompt and speech bubble: talkToTeacher, closeDialogue
  closeUp.js                shared by the close-up views: camera return pose, reach, prompt chip
  albumView.js              reading the album: "open" prompt, camera in/out, page turning input
  videoView.js              watching the memory video: "watch" prompt, camera in/out, <video> overlay
  hover.js                  hovered state + outline box (getHoveredBuilding, setHoveredBuilding)
  labels.js                 HTML labels projected from 3D, toggleLabels
  panel.js                  selectBuilding(id), closePanel()
  input.js                  initInput(): every DOM/pointer/keyboard/resize listener
styles/
  index.css                 @imports the parts below — ORDER MATTERS, responsive.css last
  base.css brand.css controls.css labels.css panel.css hint.css walk.css dialogue.css album.css
  video.css loader.css
  responsive.css
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

## The teacher (NPC)

A teacher in áo dài stands in the middle of the courtyard (`campus/teacher.js`). Clicking or
tapping her — or her "Talk to the teacher" prompt, or pressing **E** near her in walk mode —
opens a speech bubble (`interaction/dialogue.js`) that types out one short passage per click and
closes after the last; Esc or the × ends it early. In the orbit views the camera flies in first.

- Her text, position and look are data: edit `TEACHER` in `data/teacher.js` (one `lines` entry =
  one bubble; keep them short).
- She is animated, so she is built from real meshes under joints (merged per joint and material
  by `bake()`), casts a shadow but receives none (the shadow map is static).
- The bubble and prompt are plain HTML in `#npc-layer`, projected each frame by `updateDialogue`.

## The Teachers' Day corner (20/11)

A check-in booth stands in front of the great tree (`campus/teachersDayBooth.js`): backdrop,
balloon garland, marquee "20 ♥ 11", flower stands, memory-video screen (left), souvenir table
with the wish board beside it (right), photo frame, bunting tied to the trunk. It is also a selectable place (`teachersDay` in `data/buildings.js`).

- Its many colours come from **one swatch texture** (`textures/festive.js`): the materials
  `festGloss` (balloons) and `festMatte` (paper, cloth, pennants; two-sided) read a colour by
  UV, so a prop is coloured with the module's `tint(UNIT.x, 'red')` / `colorize(geometry, 'gold')`
  helpers instead of a material per colour. Add a colour by adding a swatch to `SWATCHES`.
- The backdrop text and the anniversary count are painted in `textures/festive.js`
  (`TEACHERS_DAY_YEAR`); the small printed props share one atlas (`PROP_REGIONS`).
- `fairyBulb` and `lantern` glow with the courtyard lamps (`scene/weather.js`). Only the two
  helium-balloon bunches move (`updateTeachersDayBooth`).

## The souvenir album

A closed photo album lies on the souvenir table of the Teachers' Day corner. Clicking it (orbit
views, once the camera is near), its "Open the album" prompt, or **E** next to it in walk mode
flies the camera over the table and opens it; pages turn by dragging or tapping a page, the
‹ › buttons or the arrow keys; Esc / Close turns everything back and returns the camera to
where it was (orbit pose or the walker's eyes).

- **Content is data:** edit `ALBUM` (cover, dedication, farewell) and `ALBUM_ITEMS` in
  `data/album.js`. One entry = one page (photo + caption); two pages per sheet, so the number of
  sheets follows the list. The current entries are mock data.
- Page pictures are the one sanctioned exception to "no external URLs": `imageLink` is loaded at
  runtime, first directly, then through the `wsrv.nl` image proxy (for hosts without CORS), and a
  painted placeholder is shown when both fail (offline). Import a local file in `data/album.js`
  to bundle a picture instead.
- `campus/album.js` owns the book (book frame: X from the spine across the right page, Y up the
  page, Z out of the paper; `SCALE` turns book units into metres). A sheet is a segmented box
  re-bent every frame it moves (`deformSheet`): the curl integrates a tangent angle across the
  page, so the paper never stretches. Sheets turn one after another and never cross.
- `interaction/albumView.js` owns the mode: while `isAlbumActive()` nothing else drives the
  camera (`animate()` skips the orbit controls and `updateWalk`), `#app` has the class
  `is-reading`, and `input.js` routes pointer and keys to it. Anything that sends the camera
  elsewhere (Overview, Walk, selecting a building) must call `closeAlbum({ fly: false })` first.
- Page textures are painted lazily on first open (`textures/album.js`); their materials are in
  `SIGN_MATERIALS`, so the pages stay readable at night.

## The memory video

A screen on a stand, left of the backdrop in the Teachers' Day corner, shows a title card.
Clicking it (orbit views, once the camera is near), its "Watch the video" prompt, or **E** in
front of it in walk mode flies the camera square in front of the screen and plays the video on
it; Space pauses, Esc / Close stops it and returns the camera to where it was.

- **Content is data:** edit `MEMORY_VIDEO` in `data/video.js` (`src`, and the title card's
  wording). The file lives in `public/videos/`: Vite copies `public/` into `dist/` untouched, so
  `src` is a path relative to `index.html` and **`dist/videos/` must be deployed with
  `dist/index.html`**. A full `https://` address works too (second sanctioned exception to "no
  external URLs"). The current file is mock footage. Never `import` a video from `src/`: the
  single-file build would inline it as base64.
- The video is a plain HTML `<video controls>` (`#video-frame`), not a texture, so it also plays
  from hosts without CORS and from a build opened straight from disk. `videoView.js` puts the
  camera on the screen's normal — the picture then projects to an exact rectangle — and lays
  the element over it (`watchingPose()` returns both the pose and the rectangle; narrow windows
  widen the FOV instead of backing away). Nothing is requested until the first click.
- `campus/memoryScreen.js` owns the prop: the stand is batched, the picture is a real
  `MeshBasicMaterial` mesh (self-lit like a display, and the pick target).
- `interaction/videoView.js` owns the mode, built like the album's: while `isVideoActive()`
  nothing else drives the camera, `#app` has the class `is-watching` (the header hides too), and
  anything that sends the camera elsewhere must call `closeVideo({ fly: false })` first.
- Keep the ~3 m in front of the screen free of props: the camera watches from there.

## Recipes

**Add a material** → `materials/library.js`: `std('myKey', { color: 0x…, roughness: … }, { castShadow, receiveShadow })`.
If weather must change it (e.g. wet look), also add it to `wetMaterials` there, or handle it in
`updateWeather()` (`scene/weather.js`). Need a direct handle? Set `M.myKey = MATS.get('myKey').material`.

**Add a new structure** → create `campus/myThing.js` exporting `buildMyThing()`, use kit helpers,
then call it from `buildCampus()` in `campus/index.js`. Keep it inside the lot unless it is background.

**Make it selectable (info panel + label + hover outline)** → add an entry to `BUILDINGS` and its id to
`BUILDING_ORDER` in `data/buildings.js` (`bounds` = pick box centre/size, `label` = 3D anchor,
`view` = camera position/target used by `flyToBuilding`). Picking, labels and panel pick it up
automatically. For phones, add a `mobileScales` entry in `cameraRig.js#flyToBuilding`, or give the
entry its own `mobileView` when it is too low to show above the panel.

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
  `src/` get inlined by the build; avoid large binaries (the HTML is ~800 kB, mostly three.js).
  The only exceptions are the album's page photos (see "The souvenir album") and the memory
  video, which is a separate file by design (see "The memory video").
- All UI text is Vietnamese; on-scene signage is Vietnamese too (with diacritics) — keep both as they are.
