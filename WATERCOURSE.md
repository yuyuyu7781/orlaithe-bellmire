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
