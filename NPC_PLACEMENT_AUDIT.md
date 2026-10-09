# NPC placement and room ownership audit

Remote main baseline: 599c5d1b2d8bca04da0fdcd01a1bdea6ce8ae331.

## Fixes

- Lunmere's major residents started at home and queued a commute even on first loading. The inn keeper was not assigned to the inn until arrival; entering the inn did not complete that commute. Major residents now initialize at the current scheduled destination, using the existing capital's `settleOnArrival` mechanism.
- Maren (`lunHost`, unchanged save ID) serves the inn throughout its opening periods and uses the inn as her weather shelter. Her old evening assignment to the separate diner made an open inn unstaffed.
- Iera (`lunWatcher`, unchanged save ID) works at the shop in the morning/day and shelters there; her existing evening routine remains.
- Rowan's lake work and travel routine remain. Ordinary residents retain their walking schedules instead of being placed simultaneously on a shared square node.
- Violet Mire's three scheduled residents use the same initial settling mechanism when first present. Existing availability and rare traveler conditions remain.
- No new actors, portraits, story conditions, geography or save fields. The same actor moves between outdoors and interiors; no clones are created.

## Audit and evidence

`node tools/npc-placement-audit.cjs`

- 115 scheduled NPC entries across Bellmire, Lunmere, Violet Mire and the five capital wards. All finite coordinates; no blocked standing positions in the tested initialized outdoor state.
- 24 named conversation actors, 24 unique actor objects.
- Test-only discoveries enable all capital wards and Violet Mire; game unlock rules are unchanged.
- Maren in the inn: six weather modes × four periods. Visible room parent, conversation enabled and grounded feet are checked.
- Human/cat: actual E key through proximity selection opens `talk:lunHost`; exiting hides the indoor owner outdoors.
- 31 enterable rooms: named actor visibility and conversation eligibility must agree in both directions, after resident/shop updates.
- Native page reload reconstructs Maren's inn assignment without new save fields.

`node tools/capital-portraits.cjs` passes the existing 14 capital actors × PC/mobile × human/cat × repeat tests, fallback, legacy portraits, conversation memories, save/reload and regional redisplay.

`node tools/check_resident_life.mjs`, `node tools/check_resident_layout.mjs`, `node tools/check_lunmere.mjs` validate existing identity, restrained appearance, capital distribution and Lunmere saved data.

Scope limits: browser/software WebGL verification, not a real phone. This audit does not prove every possible long-running crowd movement or rare encounter combination. Regions without permanent NPCs keep that design; conditional Finn visits are not converted into permanent residents.
