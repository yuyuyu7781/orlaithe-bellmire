# Bellmire west approach — v18.7–v19.1

Baseline main: b2e9d89. Town layout, spring, falls, stream, waterwheel and harbor
are unchanged. The west approach branches from the tested inn-side street at
(-38.55,6.25,5). Two modest stone pillars mark the gate (-53,6.25,5).
The path bends over approximately 74 metres to a lookout (-109,8.65,-14).
It is a compact outing, not a separate large map or several kilometres of countryside.

Ground-supported terraces rise from 6.25 to 8.65, with physical risers below
human step allowance. A broad grass bank and 2.4 m stone path transition gradually
away from the town. Three sparse shade trees and one old low wall opening are
shared-material low-poly scenery. A visible broken wooden rail closes the playable
hill; a nonwalkable trail beyond it suggests further travel. No invisible global
wall or new player collision profile is introduced.

Three shared observations: road sign, ordinary stone with a partial circle,
and lookout resting stone. A fourth, cat-only observation finds a thread behind
the wall. The low opening's shoulder gap is 0.44 m: the 0.26 m cat fits, while
human shoulders are 0.48 m. Its dry bank has actual visible supporting ground.
The ordinary road remains usable by both profiles. No new jump system is needed.

The existing navigation gains only gate and hill destinations; the 2D map bounds
include them and consume the same road samples. No second WebGL map pass. The
existing save discoveries/Journal format stores visit and observations without a
version change. Journal records the outward view and familiar lines, not objectives.
Finn and Nerissa have one conditional reaction each after those observations.
Nine Stones and explanations of the mystery are not added.

Traveller and cloth merchant use the same resident graph, branching from the
existing inn route to the hill approach. They retain their existing stay days,
schedules and departure state. The boat carrier continues using the harbor.
No extra NPC or cart is added. Existing water/wheel audio fades by world distance;
no new audio source or loop. Rain reuses the existing particle count and shifts
its origin around the outdoor player beyond the gate.

Verification is recorded in tools/outskirts-validation.json: native walks from
square to gate/hill/back/inn, cats on side bank and hill, cat-only wall clearance,
traveller crossing the gate, visible end fence, six weather views, observations
and reload, five human/cat shop conversations and portraits, 19 cameras,
existing animation/follow, PC/mobile navigation/map and all quality settings.
Independent walking tests relocate only to a valid starting location.
Physical smartphone performance is not tested. Shared-host software-rendered
frame samples are indicative only; scene counts are recorded separately.
No environment settings changed.

Same-camera overview counters before → after: draw calls 2547 → 2645
(+3.85%); triangles 105261 → 106113 (+0.81%); scene meshes 2884 → 2980.
Lights 14, transparent meshes 34 and shadow casters 193 are unchanged.
The added geometry is static, opaque, and shared-material; no permanent second
render pass. No cart is implemented. A true continuous interior doorway mesh,
further countryside, wind audio and real-phone performance remain future work.
