# Orlaithe v23.4–v24.4 — Lake Lun / three-region travel

## Region integration

`regions.js` is the catalogue and UI adapter. Each region supplies a stable id,
name, safe entry point, walking boundary, camera presets, navigation targets,
map bounds and ambient profile. The catalogue currently contains Bellmire,
Nine Stones and Lake Lun. Future regions can extend the catalogue and road table.

The selector sits above the existing controls, including on a collapsed panel.
Unvisited regions are disabled and the revisit function independently rejects
unvisited ids. Walking across a region boundary unlocks it; camera viewing does
not. Revisit preserves human/cat mode, closes observations/quiet views, exits an
interior if necessary and checks the destination with the existing town collision
policy before relocation. Bellmire returns to the verified inn approach,
Nine Stones to its eastern approach, Lake Lun to the shore entrance.

The original 19 Bellmire camera ids are unchanged. Nine Stones has eight spots;
Lake Lun has eight: overview, shore, pier, shore path, boat, water edge, opposite
shore and Nine Stones direction. Leaving walking uses the current region's
camera, rather than sending a lake visitor back to the town overview. The panel
can collapse on desktop as well as mobile. Navigation and the existing single
2D minimap consume the current region's destinations/bounds/roads; inter-region
entries give a broad direction rather than claiming to plot an exact route.

## Landscape and walking

The old Nine Stones flooded ending now connects to a supported descending road.
Its existing nine stones, inscriptions and wind grass are preserved. Removed
onward placeholder land/water is replaced by Lake Lun's actual terrain.
The new connecting road is approximately 95.9 m long, from (-206.1, 9.48, -23)
to (-300, 6.12, -27). It descends through sparse low trees and cool green verges.
Bellmire inn to lake is roughly 300 m along the walking routes, before detours.

The lake is approximately 55 × 52 m, with irregular near/west edges and low
banks enclosing both ends. A visible opposite shore prevents a sea horizon.
Opaque, rough bluegray/teal water and seven batched light marks avoid mirrors,
particles or a high-cost shader. The shore has sparse reeds, two low dry cat
steps, a supported 9 × 2.4 m old wooden pier and one small moored skiff.
There are no new houses, shops, residents or lights.

The route and bank sampler follow deterministic rendered heights. Water has no
walkable ground; the pier is a registered supported floor. Ground footprints
keep players from stepping off the bank. A dry driftwood gap has enough clearance
for a cat but rejects a human. Reeds and the pier-side verge offer two cat-only
observations. The flat bank stone and fallen log reuse the existing cat jump.

## Discoveries, dialogue and audio

Four normal observations: lake surface, old mooring peg, skiff and a shallow
shore mark. Two optional quiet views use the existing immediate-return interaction.
Two cat discoveries: an old knot beside the pier and a rounded fragment in reeds.
The shore mark only suggests a partial circle/lines; it explains no mystery.

Lake visit and meaningful observations are written to existing version-1
`discoveries` and Journal records. The validated save structure/key are unchanged;
old saves start with Lake Lun locked, and damaged/newer-save handling is retained.
There is no achievement list or counter. Nerissa occasionally comments on the
similar shape by water; Finn says the lake does not reflect everything.
Other dialogue, memories and portraits keep their previous priority.

A quiet `lake-water` zone/source uses the existing gesture-enabled single AudioContext,
distance gains, quality-dependent update interval and mute. Its filtered noise
is deliberately restrained. There is no new audio timer, file dependency or
forced continuous musical effect. Detailed boat/pier creak recordings are future work.

Six existing weather settings apply. Dawn is cold bluegray; rain darkens stone,
wood and water while keeping the shore visible; fog softens the opposite bank;
night/blackout retain safe dark silhouettes without artificial lake lighting.

## Simulation and verification

No new animation loop. Region/visit checks run at 0.5 s and only save on meaningful
changes. Lake geometry has no per-frame animation. Nine grass/resonance only
updates near its stone field, not at the lake. Existing near/mid/far resident
schedule updates and inactive interior policy continue. Legacy distant town
pose/smoke/mill visual updates are reduced to 0.5 s (Standard/High) / 1 s (Mobile);
time, schedules, events and saved progress continue. Town geometry remains visible
as distant scenery. Bellmire's upstream, mill structure, harbor and city layout
were not rebuilt.

Browser checks in Chromium/WebGL with software rendering:

- Native W-key walking: inn → outskirts → Nine Stones → descending road → lake
  entry → pier → lake entry → Nine Stones → outskirts → inn. 12,506 movement
  update samples, valid feet and camera clearance. No route teleport used along
  that trip; only the initial fixture start and the separately tested UI revisits.
- Initially locked Nine/Lake revisit rejection; all three unlock after arrival.
  Actual selector changes return to safe entries; walking exit and all 35 presets.
- Four normal observations and two cat observations using native E selection;
  cat road out/back, shore circuit, crawl clearance and native Space jump to stone.
- Rock/log/peg ground offsets within 0.00000001 m; unsupported water rejected for
  human and cat. Nine stone transforms identical after day/reload.
- Native inn entry, upstairs staircase, bed confirmation and Day 2 wakeup; save/
  reload retains all three visits. Separate reload retains cat clues and Journal.
- Native postvisit Nerissa/Finn dialogue with official portraits; five shops,
  five people, human/cat portraits/logs and entry/exit regression passes.
- All six weather renders; original 19 views, follow, resident/cat/mill/cable-car
  animation and WebGL context checks pass. All existing `tools/check_*.mjs` pass.
- 390 × 844 touch viewport: selector, map and expanded eight spots stay inside
  the viewport; expanded panel 372 px high, no horizontal overflow. Desktop
  collapse and quiet-view immediate cancellation pass.
- One AudioContext, lake distance gain, mute, no stone resonance at far lake.

Raw results are in `tools/v244-validation.json`. Physical smartphone hardware
was unavailable; touch viewport and Mobile quality are emulation, not an actual
phone benchmark.

## Comparable performance

Same camera, weather and render setup; counted entire composer frame, including
shadow/postprocessing passes. Baseline is remote v23.3 `7c3aa15`. Software WebGL
CPU timings are indicative and vary with shared-host load.

| Region | High/Standard calls before → after | Mobile calls before → after | H/S triangles before → after |
|---|---:|---:|---:|
| Bellmire overview | 2603 → 2603 | 2589 → 2589 | 105341 → 105341 |
| Nine Stones front | 61 → 61 | 47 → 47 | 11032 → 10812 |
| Lake Lun overview | — → 36 | — → 22 | — → 10372 |

Whole-scene meshes: 3145 → 3166 (+21 net, including removal of placeholders).
Lights 14 → 14, shadow casters 193 → 193, transparent meshes 34 → 34.
`residentDay` scheduled actors remain 20, with one moving in the measured scene
(this is not the entire town's resident total). Median resident/region update:
0.1–0.2 ms baseline, about 0.2 ms after; measured p95 0.9–5.5 ms across scenes/
qualities. Lake Mobile triangles: 10358. This is not a real-device FPS claim.

## Remaining scope

Lunmere settlement, controllable boats, larger lake travel, recorded water/wind/
pier sounds and physical-phone performance remain future work. This region is
intentionally a short shore visit. The nine/circle/star/water mysteries remain
unresolved, and the existing town daily life continues.


## v24.5–v26.0

Lake Lun滞在の追加とLunmereへの湖畔道、四地域UI、検証結果は [LUNMERE.md](LUNMERE.md) を参照。既存湖・桟橋・小舟の形状は維持。
