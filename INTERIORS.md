# Bellmire v12.8–v13.1: small enterable shops

The v12.7 town, cat model, three exterior cat shelves, official five portraits,
14 outdoor inspections, renderer, weather and camera identities remain the base.
There is no page reload, replacement world or second movement controller.

## Enter, walk and leave

While walking as a human or cat, face a shop door and use **E** or the small
interaction button. A closed shop shows a short explanation. An open shop moves
the existing camera into its small room. Approach its front door and use **E /
外へ出る** to return to the actual safe position from which you entered. Switching
to a town camera or resident follow also restores the exterior before leaving
walking mode. Changing between human and cat inside uses the existing safe spawn
search, so a person cannot appear inside a low desk.

`interaction.js` still resolves inspect/talk/enter/exit together, with line of
sight, contact height, distance and facing. Doors have a small tie-breaking
preference, not priority through walls. Scene visibility and per-entry eligibility
keep outdoor objects and absent residents from stealing indoor interactions.

`walking.js` uses an optional area policy for floor and furniture bounds. Human
radius/height are 0.24/1.8; cat radius/height are 0.13/0.52. Water, cliff protection
and the indexed outdoor obstacles remain unchanged. `refreshObstacle` updates
both visible-object collision bounds and their spatial cells after clutter moves.
The five scheduled actors use visible dynamic bounds, so moving a shopkeeper
inside does not leave an invisible body blocking the old street position.

## Rooms and schedules

| Room | Contents | Morning | Day | Evening | Night |
| --- | --- | --- | --- | --- | --- |
| Bakery | counter, bread shelves/baskets, sacks, crates, worktable, oven, Moira | open | open | reduced | closed |
| Bookshop | shelves/books, paper, desk, lamp, Evan | open | open | open | closed |
| Inn | reception, luggage, bench, table, warm lamps, suggestion of upstairs | open | open | open | open |
| Tavern | counter, barrels, tables, benches, lanterns | closed | quiet | open | active |
| Orrery shop | brass rings, charts, instruments, shelf/desk, Nerissa | open | open | open | quiet |

Hours are coarse periods, not real-world hour numbers. `shop-data.js` is their
single source; the existing `townLife` broadcasts changes. Closed exterior doors
have a crossbar. Existing time-based window and shop lighting is reused. If a
shop closes while you are inside, you may still leave; it does not trap/eject you.

`dailyLocations` puts Moira/Evan/Nerissa in their shops while working. At night
Moira and Evan are unavailable in private rooms. Bran works at the harbor in the
morning/day, then visits the tavern. Finn is at the waterfront in the morning,
walks his original square route at midday, visits the inn in the evening and the
tavern at night. These are clock-triggered placements, not a full travel AI.
Actual existing actors, scales, animations and portraits are reused. A shop actor
is drawn only when its room is active. Exterior follow of an indoor resident
frames that resident's shop entrance instead of tracking an invisible body.

The bakery worktable and bookshop low desk leave a 0.70-unit gap: cats can pass
underneath, people use the open aisle alongside. The three outdoor cat routes
remain physical low shelves. `human-routes.js` moves four small grounded props
by 0.20–0.35 units in the market, inn, tavern and mill neighborhoods. Candidates
on low inaccessible ledges or outside the verified main paths are left in place.
Bakery, bookshop/harbor, orrery, upper houses and plaza routes were also walked. It preserves buildings and cat shelves, rejects overlaps and
moves the corresponding collision boxes. Other main routes remain as built;
small low service hatches are not newly invented human doorways.

## Dialogue and future hooks

Location-specific human/cat lines extend `selectDialogueTurn`; original outdoor,
time/actor lines and Finn's first cat encounter remain compatible. Each character
can hold `rumorPool`; one brief rumor is used every fourth human conversation.
Cats continue receiving sensory/personal reactions rather than human rumors.
The five original PNG portraits and missing-image fallback are unchanged.

Inactive `townEventDefinitions` provide delivery/lost-item examples. `soundAnchors`
reserve area/profile references with null sources. They do not run quests, load
sounds or add a new audio loop. More rooms, event conditions, continuous travel,
full upstairs areas and positional audio can be added later.

## Rendering and validation

`interiors.js` builds rooms lazily; only the occupied room is attached to the scene.
Cached rooms are detached on exit, so their transforms/lights are not traversed
by the exterior renderer. Re-entry refreshes the shared interaction occluders. Outside
point lights are inactive indoors; one room ambient light and emissive lanterns
use no shadows, large textures, new postprocessing or new point lights. Hidden
rooms have no animation loop. High / Standard / Mobile remain available.

Data checks: `node tools/check_scene_data.mjs` and `node tools/check_shop_data.mjs`.
Browser checks use Chromium/WebGL, native walking updates and E/tap controls,
including PC/mobile portrait layouts, human/cat routes, shop hours and exits.
At 960×640, the unchanged main overview measured 2,513 draw calls / 85,545
rendered triangles. The new overview measured 2,528 / 85,281 (+0.6% calls);
logical exterior meshes are 2,793, visible lights remain 14 (12 point lights),
shadow casters 205 and transparent visible meshes 34. The bakery measured 95
calls in Standard and 81 in Mobile, with 96 visible meshes, 3 lights, no point
lights or shadow casters. These are Chromium software-WebGL scene counts, not
physical-phone FPS. Unvisited rooms allocate nothing; outside point lights and
cached architectural shadows return correctly after room/quality changes.

Verified by native keyboard/tap walking: five rooms entered/exited as both actors,
two indoor and three outdoor cat passages, seven backstreet areas, fourteen
outdoor inspections, five human/cat conversations with official portraits, Finn's
first cat line, closed bakery/night and tavern/morning, four periods, all six
weather types inside/outside, all nineteen views, follow, animation, all quality
presets, inspect/talk separation, repeat visits, rumor cadence and portrait load
failure fallback. Physical phone performance, seamless doorway transitions and
fully furnished upper floors remain future work.
