# Bellmire v17.4–v17.7 — a working town watercourse

The starting main was v17.2 (`b17288f`). `createMillrace` and its existing root,
update hook and inspection/event interfaces are extended in place. The old
`upper-leat.js` builder is no longer instantiated. There is one active watercourse.

## Layout

`watercourseLayout` in `waterways.js` is the shared scene/event/map definition.
Water coordinates are surface heights, and every reach runs downhill.

- The spring emerges from the foot of the existing upper rock face at
  `(20, 4.86, -14.48)`. A **0.63 m** fall enters a small stone receiving pool.
  Two low spill stones bring it onto the lower terrace's shallow, open stone leat.
- The visible route follows the gap between the existing buildings. It stays at
  ground level rather than crossing the town on a long suspended timber gutter.
- Only the **0.9 m** feed immediately before the wheel has timber side pieces.
- The wheel stays at **x=21.05, z=27**, with unchanged model scale and animation.
  Its centre is lowered from **7.67 to 5.98**; the lowest blades enter the shallow
  mill pool by approximately 0.11 m. The axle still joins the adjacent mill house.
- The tailrace turns away from the mill wall, drops along the terrace's existing
  face, and spills into the harbor at its existing **1.23 m** water surface.
- Four short crossings serve the source-side path, middle terrace, mill approach
  and quay. Geometry marked `walkSurface` supplies the actual walking floor.
  Approaches have two rises, or three at the uneven quay. Individual rises remain
  below the existing human `.38` step allowance. Decorative toe boards do not
  become shoulder-height obstacles on the neighboring lower approach.

No buildings, shop doors, cat passages or harbor boats are relocated. Existing
contact placement reserves both dry service margins and the bridge approaches;
small grounded furniture/cargo relocates locally rather than blocking them.
The mill crossing also covers the bend in the existing NPC street route.

## Life, material and motion

`mill-life.js` uses the existing static detail batching for one washing ledge,
a bucket, folded cloth, a small work table/sack and sparse bank moss/seams.
Candidate footprints must stand safely on the dry side; their real occupied
footprints are registered as obstacles. There are no additional lights.

The existing scheduled harbor/mill residents exchange morning destinations on
alternate clear days. Their existing route graph, collision checks, speed and
weather/calendar overrides remain in use. At the mill the existing `well` idle
looks down toward the water; no separate crowd or movement engine is added.

Port stones, wood, boats, moorings and lamps retain the existing harbor system.
The new wet/dry stones and muted timber join that palette. Existing weather
surface and harbor-water ownership handles rain, dawn, night and blackout;
there is no second competing color pass. Thirty-three opaque flow marks are
instanced into one draw; positions/quaternions are reused without per-frame
vector allocation. No water shader, extra render pass or particle emitter is added.

The existing `leat` inspection and `upstream-stone` event use the spring bank.
Their IDs, saved state, nine-line mystery and Journal relationship are unchanged.
Navigation still targets the dry mill approach `(24.48, 4.15, 28.18)`, not the
wheel centre. The 2D minimap draws the same water points as the scene. The existing
19 camera keys remain; the canal and mill cameras now frame the revised system.

## Verification and limits

See `tools/v177-validation.json` for the recorded browser results and performance
comparison. Tests use Chromium/WebGL, native keyboard interactions and the real
walking collision update, with independent starting points between route tests.
New watercourse/crossing checks run in both human and cat profiles. Regression
checks cover the sixteen established walking routes, five interiors and five
portrait conversations in both profiles, inspection/event save and reload,
six weather modes, nineteen cameras, following, animations and cat jumps.
PC and 390 px phone-sized navigation/map layouts are checked; a physical phone
has not been available. Software-renderer timings are indicative, not handset FPS.

The water is deliberately stylized: no fluid simulation, reflected scene or
physical erosion. Deeper washing/working animations and real-device performance
measurement remain future work. Environment and dependency settings are unchanged.

At the same overview and Standard quality, the before/after structural counts
were: draw calls **2,587 → 2,547**, triangles **102,213 → 102,509**, meshes
**2,927 → 2,888**, lights **14 → 14**, shadow casters **208 → 199**, transparent
meshes **34 → 34**, textures **18 → 18**. The triangles increase by about 0.29%.
Mobile overview calls were **2,573 → 2,533**. Software-renderer median render
samples (High/Standard/Mobile overview) were **23.8/19.5/12.1 ms →
34.9/23.9/9.4 ms**; repeated runs varied and this is not a real-phone benchmark.

The seven-day simulation retains the existing weather/calendar/visitor behavior.
It advances the legacy moving residents as well as scheduled residents; freezing
those actors can otherwise artificially block a crossing. Crowded NPC crossings
can still produce waits. Retreats now use collision-validated approach steps,
rather than requiring a perfectly level patch beside the bridge.

## v17.8–v18.1: a higher, gentler spring landscape

Starting main: `ae6f6a5` (v17.7). The same builder/root and downstream crossings
remain active. The source rises **1.14 m**, from y=4.86 to **6.00**, against the
existing rock face. Two rock-backed falls descend **0.87 m** and **0.90 m**,
with a short wet shelf between them and a shallow receiving surface at y=4.23.
This is a local source correction, not a new terrace or suspended aqueduct.

The first six metres now bend slightly (x=19.90–20.08), vary in width
(0.56–0.66 m), and have lower banks before joining the existing stone town leat.
The mill remains at `(21.05, 5.98, 27)`; its blade contact, short **0.9 m** timber
feed, tailrace, four crossings and harbor outlet are unchanged.

Existing harbor weather handling now owns a small set of shared water tones:
spring +7%, shallow stream +1%, mill −7%, tailrace −4%, harbor unchanged.
The existing rain/dawn/night/blackout multipliers apply to every tone, with no
second color controller. Waterfall sheets have gently tapered edges and a lighter shared tone; their
small flow streaks remain in the same opaque instanced draw (38 marks).
No new lights, particles, textures or water shader are introduced.

The existing washing ledge and work table are reused. Two additional dry-side
fittings add a bucket foothold near the spring and a small damp timber stack near
the mill. They use the existing instance batches and dry-footprint validation.
The existing alternating morning mill/harbor schedules remain unchanged.

Two short-range audio zones (spring/stream) use the existing single-context,
gesture-activated filtered-water texture, mute control and quality update cadence.
The wheel sound anchor now matches its actual position. The `leat` observation
and Journal sentence describe the small falls; event IDs, saved progress and the
unresolved nine-line/circle motif remain intact. The map uses the same fall points.

Current browser results and before/after counts are in `tools/v181-validation.json`.
Testing includes actual keyboard walking in both profiles. At bridge boundaries,
validation accepts support on either the current step or the reachable next step;
a second `canStand` call can otherwise select the next step prematurely. This
required only a validation correction, not a change to player collision rules.

Limits: stylized geometric water rather than fluid simulation; generic water-use
idle remains simple. No physical handset or acoustic listening comparison was
available. Software-renderer timings and viewport tests do not establish real
phone performance. Environment/dependency settings were not changed.

At the same Standard overview, v17.7 → v18.1: calls **2,547 → 2,560**,
triangles **102,509 → 103,005**, meshes **2,888 → 2,901**. Lights remain **14**,
shadow casters **199**, transparent meshes **34**, textures **18**. The increase
is approximately **0.51% calls / 0.48% triangles**. Mobile overview calls are
**2,533 → 2,546**; harbor walking calls remain **155** (High/Standard) and **141**
(Mobile). Software-renderer median overview samples were High **25.3 → 33.2 ms**,
Standard **14.6 → 21.2 ms**, Mobile **45.6 → 27.1 ms**. Shared host contention and
software rendering make these timings noisy; they are not a handset benchmark.

Final dry fitting locations: spring bucket `(18.25,3.5,-12.4)` and damp timber
`(24.45,4.15,30.55)`. Earlier candidate positions were rejected by footprint
checks. All four fitting sites now instantiate; seven instance batches contain
36 details. Human/cat water crossings and mill-to-harbor/tavern routes were
rechecked after placement, with no change to player collision settings.

## v18.2–v18.5: an exposed spring, not a wall outlet

Starting main: `e437fe9` (v18.1). **Option A** is used: a visible, shallow,
roughly 2.6 × 3 m spring basin occupies a small open pocket in front of the
upper homes. Its water surface is y=5.60; an irregular, faceted rock mound
meets the existing lower ground at y=3.50. Water leaves the pond over a visible
short stone lip, then drops **0.67 m / 0.70 m** into the existing receiving pool.
The pond does not begin in a building wall or under a house.

The old solid cliff skirt is divided into three separate, grounded rock masses,
leaving an actual collision opening at x=17.3–22.5, z=−19.2–−15. Its occupied
housing terrace remains supported behind the pocket. Houses, shop functions,
doors and residents are not removed or relocated. The western high wood
crossing retains its original west end and is shortened from 13 to 9.5 m;
its previously unsupported east projection no longer covers the spring.
The twelve old suspended diagonal stair slabs over the source are retired.

Seven ground-supported stone rises lead to a dry lookout at
`(17.9,5.7,-16.3)`. Each rise is about 0.314 m, within the existing human step
allowance. The real walking system, not a teleport or enlarged collision rule,
is used to climb and descend. The nearby accessible residential side lane is
`(23.1,3.5,-11.5)`; the previous floating stair point is not treated as an
accessible street.

The first curved shallow reach retains its width variations. Continuous low
curb strips are replaced with irregular, small stone margins in **one opaque
instance batch**, leaving the actual water hazard intact. Three low moss patches
extend the existing detail batch. The previous bucket, washing ledge, timber
stack and work table are reused; there is no new visitor area or decorative crowd.

The mill position, blade contact, four existing stream bridges, 0.9 m timber feed,
tailrace and harbor outlet remain unchanged. The source point on the 2D map now
starts at the pond. The existing `leat` inspection is called **奥の泉** and uses
the dry bank; its stable ID, fourteen-target list and Journal hook are retained.
The nine-line stone event stays at its original bank position with unchanged
saved-state IDs. Audio spring/wheel positions reference the same layout data.

`tools/v185-validation.json` records browser checks. Native human/cat walking
covers the new spring stairs, four bridges, spring-to-mill paths and surrounding
streets. Camera-to-pool ray checks confirm that the visible source is the pond,
rather than an intervening building or cliff, in both walking profiles and all
six weather modes. A native spring inspection, Journal and reload are checked.

No new lights, water shader, particles, audio engine or environment settings.
Physical phone performance and listening comparisons remain unverified.

Final terrain shoulders are deliberately low: the rear support tops out at y=8.2
(the existing housing floor), the west shoulder at 6.25, and the east at 4.5.
The pond outlet has one water tongue; its stone lip and middle-step support
remain below the water surface to avoid coplanar overlaps.

Overview and canal cameras retain their original IDs but are reframed to show
the spring and the downstream system together. Browser projection and ray tests
cover PC and 390 × 844 mobile canal framing in all three quality settings. The
rooftop preset still looks across the western roofs; a separate roof-level
spring view was inspected rather than claiming every camera shows the source.

Same-camera v18.1 → v18.5 overview counts (High/Standard): draw calls
2560 → 2559; triangles 103005 → 104613 (+1.56%); scene meshes
2901 → 2903; lights 14 → 14; transparent meshes 34 → 34; shadow casters
199 → 200. Software-rendered median frame samples were High 18.1 → 18.9 ms,
Standard 15.4 → 15.9 ms, and Mobile 21.9 → 38.5 ms. Mobile's timing regression
and large tail variability require physical-device follow-up; counts alone do
not establish acceptable smartphone frame rates. Full samples are in the
validation JSON. No environment configuration was changed.

## v18.6: restore the upper plateau (supersedes the v18.2–18.5 pocket)

The lower spring pocket was the wrong interpretation. The upper terrace is now
continuous at y=8.2 across x=15–29, z=-29–-17, supported down to the existing
y=3.5 ground. It joins the retained upper neighborhood instead of ending behind
an excavated pond. The house at (22,-23), its attached timber upper floor, and
the overlapping legacy shell at (24,-25) are retired together. No shop, entrance,
conversation character or resident route belonged to this residential shell.

A roughly 2.6 × 3 m irregular shallow pond occupies the former home site at
(22,8.32,-23). A short, gently bending stream crosses the plateau to (20,8.25,-17).
Two falls of 2.00 and 1.97 m, separated by a grounded rock shelf, reconcile the
existing approximately four-metre terrace difference. This is deliberately not a
one-metre fall with an unexplained extra height jump. A shallow receiver rejoins
the unchanged lower leat at (20,4.23,-13.4). Wheel, blade contact, short timber
feed, bridges and harbor outlet are unchanged.

Fifteen supported stone steps, each 0.313 m high, lead up the dry west bank; the
plateau path continues behind the pond. Old below-grade diagonal slabs are
removed. The existing drawing bucket is relocated to the dry right bank and
three existing moss patches follow the new pond. No extra lights or particles.
Map, source observation and ambient source anchor use the same layout data.

Browser evidence is in tools/v186-validation.json: native human/cat stair
climb/descent, square-to-source-to-nearby-lane circuit, lower mill/harbor routes,
six weather source visibility, inspection/Journal/save reload, five shop human/
cat conversations and formal portraits, 19 views and WebGL. Independent route
tests relocate only to valid starting points, then walk with native input.

Same-camera software-rendered overview before/after: 2559→2547 calls,
104613→105193 triangles, 2903→2884 meshes, 200→193 shadow casters.
Lights remain 14, transparent meshes 34. High/Standard/Mobile median samples
were 29.9→28.5 / 28.5→19.4 / 34.2→29.8 ms; these shared-host SwiftShader
samples do not establish real smartphone frame rates. No physical phone tested.
Environment configuration unchanged.

The existing overview camera ID is preserved, with a higher, more central
composition (30,78,65) so the retained foreground roof no longer hides the
upper spring. The canal preset remains unchanged. Both are checked for source
visibility and the full system fitting in frame; the mobile check uses the canal
view. Ordinary rooftop/wheel presets retain their specific focus.
