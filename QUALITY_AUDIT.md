# Bellmire v19.2–v20.5 quality audit

Baseline main: `0944bf1`. No environment settings or upstream water layout changed.

## Ground and streets

Six house shells had bottoms above the actual terrace at their centres. Five
receive stone bases inside their existing footprint. The raised market porch
uses four visible corner piers, preserving its passage and goods below.
Eighteen old random boulders were removed; five clearly floated and the others
were misplaced/buried. Their random draws remain reserved to avoid shifting
unrelated seeded scenery. Existing designed spring/stream stones are untouched.

`tools/ground_audit_browser.mjs` reports shell bases, registered goods, water/void
placements and visible standing actor feet without mutating the scene. Final
checks found zero unsupported shells, registered goods or standing actor foot
gaps. Basement geometry extending into stepped ground is not counted as floating.

Fifteen city/outskirts routes used native forward input with the production
walking update. Bakery access uses the existing quay/stair route; stopping by
an occupied doorway is valid only when standing on clear ground within 0.65m.
Tavern access from square, market, harbor and mill passed. No human radius change.
The three original cat shelves remain, plus a tavern shelf; a second countryside
opening admits cats only. Six extra supports passed native Space-key jumps.

## Quiet daily additions

Eleven scheduled residents/visitors remain eleven. Existing work poses now show
bread handling, reading/measuring and calmer rest. Existing inn/tavern bench
positions are usable by scheduled guests, using cached seated leg geometry and
moving torso, head, neck and arms together. Bounded local detours reuse the
existing helper only after a stall, with a cooldown and smaller Mobile budget.
The inn-side outing reaches the hill through collision-validated steps.

Six incidents reuse townEvent/save discovery IDs: a wheel repair, late cask,
moved cloth stall, absent skiff, forgotten inn parcel and cat-found key. Four
quietly settle the following day. Hearing one rumor updates its related incident,
not every incident associated with that speaker. Existing human/cat memory,
portraits and unresolved water/line mysteries remain.

Night has fewer background neighbors and three small emissive branch lanterns,
without additional lights. Spring greens and autumn dry leaves/cloth are restrained;
autumn harvest bread and spring young-leaf days use the existing weekly calendar.
Journal adds a paper-style category selector without achievements or completion
counts. Hill, roadside and seasonal notes reuse the existing versioned save.
Finn and Nerissa gain short conditional comparisons of signs, without answers.

## Validation and practical limits

See `tools/v205-validation.json` for route, seven-day, incident, jump, contact and
same-view performance results. Six native inn-bed rests reach Day 7 and survive
reload. Five shops, human/cat conversations, portraits, nineteen cameras, six
weather modes, follow, scene animation and WebGL passed. PC and 390px mobile
viewport were exercised; a physical smartphone was not available.

Overview draw calls rise by 23 (under 1%), triangles by 814 (under 1%), meshes by
27. Lights (14), shadow casters (193) and transparent meshes (34) are unchanged.
Software-renderer wall times are host-load dependent, not physical-phone FPS.
Existing near/mid/far throttling, room visibility and Mobile budgets remain.
Full crowd deadlock resolution and complete long-distance schedules for every
background actor remain future work.
