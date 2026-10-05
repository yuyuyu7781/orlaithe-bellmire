# Bellmire v16.7–v17.2

## Reused foundations

`town-calendar.js` derives a repeating seven-day rhythm from the existing stay
clock. Day 1 normal, 2 cargo, 3 arrivals, 4 market, 5 quiet, 6 waterfront lamps,
7 departures. Weather and phase gate the market / gathering. Save v1 keeps its
existing validation and adds optional `season` (old saves default to spring).
Spring, summer, autumn, winter have profiles for daylight, goods, weather
weights and visitor density; only spring and subtle autumn visuals are active.
`BellmireStay.setSeason('autumn')` switches the trial; `'spring'` restores it.
Weather weights and visitor-density metadata are future hooks, not random AI.

Three visitors reuse `resident-day` routes, adult scale, resident accessories,
collision, yielding, interior guests and distance tiers. A lake traveller stays
on cycle days 3–6, a cloth merchant on day 4, a boat carrier on days 2–5. They
enter from harbor / cable side and walk back before being hidden. Harbor arrivals
use separated nodes. Exact NPC transit positions are not saved; reload rebuilds
schedule-based travel. New visitor dialogue uses the inspection card without a
portrait, leaving the five official character portraits untouched. A second
traveller remark mentions a similar circle on an uncertain lake shore.

Market and gathering inspections, encounters and occasional character lines
write only meaningful Journal entries. Existing event replies take precedence.
Finn uses the existing waterfront destination on gathering evenings; he remains
an ordinary musician. Rain removes tagged drying cloth, shelters some residents
and suppresses the extra market / gathering. Blackout sends a few more scheduled
residents toward the tavern, retaining the established backup lanterns. Dawn and
fog retain their existing lighting and resident policies.

## Sound and diagnostics

`ambient-audio.js` now uses a single user-activated Web Audio context. The small
`音：切 / 入` control is beside the weather controls, avoiding mobile follow / jump
controls. Default and reload are muted. Low-pass noise provides restrained harbor
water, wheel water / occasional quiet timber taps and rain; room rain is quieter. Damped partials represent the
existing morning / evening / night bell triggers, with an eight-second minimum
separation. Brief filtered noise footsteps distinguish human stone / interior
wood / cat. These are provisional synthesized textures, not field recordings.
External `zone.src` recording support is retained; unavailable files fail quietly.
Muted audio suspends; a hidden tab mutes. Zone updates are .25 seconds normally,
.5 on Mobile. No second renderer, new shadow caster or real-time light is added.

`?diagnostics=1` enables an otherwise absent FPS / aggregate calls / triangles /
scheduled-NPC / quality panel. FPS is approximate and hardware-dependent.

## Verification

Chromium / SwiftShader, desktop 960×640 and touch 390×844:

- Seven days advanced; three visitor types reach town via existing street graph,
  and all leave after their schedules (departure routes are allowed to finish).
- Six real inn-upper-floor bed interactions reach Day 7; reload retains the day.
- Reload retains autumn, Journal and existing save fields; audio starts muted.
- Native W/E approach and conversation with all three visitors; market and
  gathering inspections write notes; no page errors.
- Sixteen real human routes, including the straight tavern lane, pass on both
  normal and market days; 520/520 tavern-lane clearance samples remain valid.
- Five shops / five official portraits / human and cat dialogue / entry-exit pass.
- Five native Space jumps and touch jump control pass. Nineteen cameras, six
  weather presets, tracking, human14 / cat5 inspections, animations and WebGL pass.
- Inn weather changes and outdoor catch-up / safe exits pass.
- User-gesture audio produces nonzero rain RMS (~0.0058), one context; mute and
  reload work. Production quality / final subjective audio on a real handset
  remain to be checked.

Standard overview structural load (Day 1 baseline → current):

| Metric | v16.6 | v17.2 |
| --- | ---: | ---: |
| draw calls | 2587 | 2587 |
| triangles | 102237 | 102213 |
| meshes including hidden | 2911 | 2927 |
| lights | 14 | 14 |
| shadow casters | 208 | 208 |
| transparent meshes | 34 | 34 |

Day 4: 2609 calls / 102609 triangles (about +0.9% calls); Day 6 transition:
2608 / 102513. Scheduled controllers: 8 → 11, plus the existing two named
outdoor controllers. Visitor controllers are inactive while absent. Selected
software-render medians High / Standard / Mobile overview: baseline
22.6 / 16.0 / 10.4 ms; current 14.9 / 16.8 / 12.8 ms. These noisy software
measurements are not handset FPS or a guarantee of hardware performance.

Run `node tools/check_town_calendar.mjs` alongside the existing stay, scene,
resident and shop checks. Future work: recorded ambience, real-phone profiling,
more seasonal goods, and saved visitor transit / richer external travel.
