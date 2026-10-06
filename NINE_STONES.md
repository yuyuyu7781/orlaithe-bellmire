# Orlaithe v21.7–v22.5 — Nine Stones

Baseline remote main: `dfaa0a5`. Bellmire remains the first base.
Environment settings, upstream spring/falls/leat/wheel and town layout are unchanged.

## Approach and place

The west hill's old repair rail is removed. Its supported road now continues
about 82m to Nine Stones, beyond the existing 60m outskirts approach.
From the inn the walk is approximately 170–190m (about a minute without stops;
a few minutes with observations). Stone/earth paving becomes grassy supported
banks, then an open 33×23m upland. The same human/cat ground and body policy
validates every step; there is no map load or separate movement implementation.

Nine irregularly spaced stones suggest an incomplete circle. Heights range
0.48–2.8m; dimensions, polygon counts, weathering, tilt and damaged tops differ.
Two stones are low/fallen rather than standing tall. Their bounding bottoms are
aligned with the real field. Three have modest marks: lines, a partial arc and
small pits. There are no glowing runes, buildings, new residents or lights.
A resting stone, a small fire/rest trace, sparse verge and short old wall suggest
passing use. The field has a low stepped viewpoint and a town-facing viewpoint,
both using the existing optional seven-second viewing interaction.

## Travel, cat and meaning

The existing lake traveller arrives from Nine Stones on days 3–6, rests there
on alternating daytime patterns, and uses the shared graph to reach the inn.
The rest slot and route skirt the resting stone and standing stones; actual
rest-to-inn arrival was simulated. There are no permanent residents here.

Two discoveries are cat-only: shallow marks behind the fallen stone and a
small ring in the grass. Three low existing-region stones are registered as
cat steps. Native Space jump onto the fallen stone was checked. No high climb
or secret room is added.

Nerissa, Evan and Finn have occasional human replies after a visit, preserving
prior event/calendar replies. They suggest old charts, conflicting counts and
familiarity without explaining anything. Journal records visit/important
observations only. Existing version-1 bounded discoveries store visit, inspected
stone IDs, cat finds and the wind observation; no separate save format is added.

## Air, audio and boundary

All six weather modes apply. Rain slightly darkens stone/grass; autumn is subdued.
Only outside town, non-fog weather uses softer distant density so Bellmire can
be seen across the approach; entering town restores its original density.
Nine Stones has no street lamps. Dawn/night silhouettes remain walkable.

One quiet low-pass noise zone uses the existing gesture-activated context,
distance gain and mute. Fog at evening, after 18 seconds nearby, can leave one
wind/stone observation and a brief soft noise; it is not a melody or a repeated
bell. Town bells attenuate at long distance. No external audio files are added.

The onward Lunmere / Lake Lun sign points across a visibly flooded low wash.
The supported dry bank ends there. This differs from the old Bellmire repair
rail: the next regions are not open. Distant ground suggests continuation.

## Costs and checks

Nine Stones adds no light, transparent mesh or shadow caster. Existing
near/mid/far resident updates and inactive-room behavior continue. Region
observation runs in the existing loop at 0.5-second intervals. The existing static town shadow cache and distance-based NPC animation
throttling are reused. Bellmire remains visible as scenery.

Browser checks: native inn→gate→Nine Stones→gate→inn; native three inspections,
two cat discoveries and cat jump; return dialogue, Journal, localStorage reload;
traveller rest and departure/inn arrival; six native inn rests through Day 7;
five shops and five human/cat portraits; six weather renders, mobile map,
19 existing cameras, follow and WebGL. See tools/v225-validation.json.

Physical smartphone performance is untested. The cloud uses Chromium SwiftShader;
timing is not a device benchmark. Longer crowded journeys and more organic
terrain detail are future refinements. Lunmere and Lake Lun are scenery/hints only.

Measured overview baseline→final: calls 2670→2801, triangles 107035→109577,
meshes 3010→3141; lights 14, shadow casters 193, transparent meshes 34 unchanged.
Mobile overview calls 2656→2787. Exact region-facing stable renders are recorded
in tools/v225-validation.json; walking-town rendering remains frustum culled.
