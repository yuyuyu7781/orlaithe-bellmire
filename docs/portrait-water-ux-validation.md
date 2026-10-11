# Orlaithe portrait / water UX verification

Audit base: 0da8db5779f97afca87fac369d6ef1c1c3ddbaa2.
Status: 自動検証済み／実機確認待ち. iPhone Safari is NOT declared PASS.

## Implementation
- P1: approved display names cvTessa=エステル and mireGatherer=ニーヴァ; cvTessa/cvAven/cvIsel/mireGatherer/mireKeeper formal images. Existing 22 image hashes/names/roles/IDs/dialogue preserved.
- Art follow-up: only new Estelle portrait revised to distinguish her from existing Maren. Existing Maren untouched.
- W1: pure, known-location-only forecast, sequential existing selectLakeWater per following morning, current cache retained, bounded by Day9999. No new saved fields, no water cycle changes.
- P2: lake-traveller/cloth-merchant/boat-carrier/mire:traveler portraits via existing view; existing kinds, hooks and conversation data preserved.
- W2: Rowan, discovered world-map detail, Lunmere willow inn and Caerith rest lodging confirmation. No daily forecast Journal or automatic multiple-night rest.
- P3: five civic and six scholar anonymous role portraits; existing guest keys/slots, no new people IDs. Total 20 new portrait assets.
- V1: full-branch fresh review and regression. Guest registry-copy issue reproduced by real approach/selection/tap, fixed by binding lodging guest entries to their registered copies only.

## Reproduced defects and fixes
1. Unknown Ring + extreme water + Lunmere dialogue exposed 大きな円/輪. Changed only conversation discovery gate; actual area/water appearance and progression unchanged.
2. Lodging guests acquired portraits on source entries, but the resolver used earlier shallow copies. Native guest tap showed no portrait. One targeted registration binding now carries existing role/text and portrait to actual interactions. No dialogue rewrite or global resolver semantics change.

## Compatibility
SAVE_KEY=bellmire.stay.v1, SAVE_VERSION=1 unchanged. IDs, memories, schedules, visitor/mire kinds, guest slots, stage/unlock rules unchanged. Old テッサ/リス Journal text retained; original historical migration behavior unchanged. Forecast/portrait URLs are not saved. 区画14、王宮内部、Finnの正体、王家の陰謀 remain unresolved/unreleased.

## Final evidence
- All 29 production-focused tools/check_*.mjs checks passed on final production code, including sequential water oracle, 22 legacy hashes, old-name memory/Journal round trip, 288 legacy guest role/count/text cases, visitor plan equality.
- 19 browser scripts passed: portrait-completion, portrait-guests, portrait-guests-native, lodging-life-audit, lodging-night-dialogue, lodging-return-audit, water-advice-browser, portrait-travellers, capital-save-compat, capital-research-compat, capital-research-ui, boat-sail, capital-closures, capital-weather, capital-days, camera-safari-browser, mobile-interaction, mobile-pc-regression, mobile-scroll-recovery.
- 27 resident portraits x 5 sizes x human/cat x day/night; 11 guest roles/four slots/next-day selection; image failure; reload; native touch guests; 320/375/390/430/844x390.
- Water phase/discovery matrix, non-leakage, live weather/reload, ordinary one-night rest and next-morning closure warning. Existing schedule, daily events, weather, boat/mire/ring/save and locked boundaries regressions passed.
- Chromium119 software rendering with exact production Three0.180.0 supplied locally for test networking. Local WebKit could not launch because its executable is unavailable; not counted as PASS. Real iPhone remains pending.

## Continuous verification
A browser-engine selection check (RED: WebKit silently launched Chromium → GREEN) raises the Node total to 30. New Node checks and six portrait/water browser scripts are connected to the existing camera-safari CI matrix. ORLAITHE_BROWSER_ENGINE selects the existing test harness engine only; production modules are unchanged. Chromium/WebKit CI results are reported separately from local Chromium119 checks and iPhone verification.

## Review decisions
- Isolated sibling worktree used within authorized implementation scope; no ignore/config change (cost: local workspace cleanup only).
- Added read-only tomorrowWalkable for lodging warning (cost: optional presentation field; no save format change).
- Bound Rowan advice after regional wrappers to retain advice alongside previous cat/bell priorities (cost: dialogue wrapper order matters; covered by tests).
- Normal shell git push lacks credentials. Connected GitHub Git data API publishes separate task commits; every tree must exactly equal verified local tree, then fetched main is checked. Commit IDs may differ due API authorship/timestamp metadata; final report uses published IDs.

## Deferred minor review findings
- Shared guest crop hints are not read by the renderer; existing default framing remains readable at tested sizes. Optional custom focus cleanup deferred.
- Traveller first/repeat historical Journal differential against baseline is not a dedicated test. Plan data, ordinary memories and reload tested; persistence hooks unchanged by source review. Additional coverage deferred.

## iPhone final checklist
- エステル is visually distinct from マレン; all nine individual and eleven shared role portraits display/read well in portrait and landscape.
- Both capital lodging houses show correct guest role/portrait; following day changes the role and portrait together.
- Discovered Drowned Way status/wait nights are readable on map, Rowan and only the two lake lodging confirmations; low water is not called walkable.
- Undiscovered Ring/hidden entrances/internal phase names do not appear in advice.
- One-night rest updates forecast and restores movement/camera; prior memories and Journal persist on reload.
- World/city map pinch, modal camera exclusion and recovery, joystick, left/right/up/down camera, simultaneous joystick+camera remain usable.
