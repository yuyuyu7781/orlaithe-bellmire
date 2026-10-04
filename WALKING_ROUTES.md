# Bellmire walking access (v13.6)

The bakery was reachable via the old inland/western detour; direct route-search
limits did not prove that it was impossible to reach. The missing connection was
a readable short climb from the west quay (1.38) to its forecourt (3.5).

- A 1.3-wide, ten-tread stone stair at x=-24 joins z=31.6 to z=28.
  Each rise is about .212. The existing geometry is also the collision floor.
- The noticeboard and its paper move together .5 to the east so its edge no
  longer catches shoulders at the upper stair. Buildings are unchanged.
- Existing contact placement reserves the quay connection and clears cargo
  beside it, rather than removing items or allowing walking through them.
- The old western stair is widened from .9 to 1.2; the mill approach step from
  .7 to 1.2; cable-car side steps from 1/1.1 to 1.2.
- Existing major street reservations grow from .6 to 1.2 total width so newly
  placed goods cannot occupy the shoulder clearance around those routes.

`humanRouteStandard` in walking.js defines the preferred visible lane width
(1.2), landing depth (1.2), and riser limit (.25). Human body radius stays .24,
stepUp .38 and stepDown .42. Water/cliff checks are unchanged. This is a design
standard, not permission to pass through walls. Three low cat passages retain
separate .13 body radius and .52 height; they are deliberately not widened.

Walking checks use keyboard input and the real movement/collision update; camera
teleportation is not used to establish reachability. The plaza, harbor and market
are connected by real streets, and some routes share these street junctions.
The old cached route toward the market met a visible worktable at its corner;
the verified market route passes around it rather than through its geometry.

## Reachability and navigation (v13.7–v13.8)
Thirty real walking checks passed: plaza, harbor and market each to bakery,
bookshop, inn, tavern, orrery shop, mill, harbor, plaza, cable-car stop and belfry.
Five store entrances were reached on foot, entered with E and exited normally.
The recorded feet/endpoints are in tools/walking-reachability.json. Route tests
include market → bookshop/bakery, harbor → market/mill, and mill → harbor on
return journeys. They establish connectivity, not shortest-route optimization.

The left panel's 行先 menu uses shopSystem.entrances[].approach, with actual
walking floor height, and five verified landmark feet positions. The small arrow
and distance are explicitly directional/straight-line hints, not autopilot.
Arrival requires the same elevation and proximity to an entrance/landmark;
entering the selected store also finishes navigation. Cat mode uses the same
compass/map without forcing the human path or disabling its shortcuts.

地図 toggles a compact paper map, with optional enlargement. Existing building
bounds and destination data generate the marks; town-roads.js provides simplified
strokes of checked streets. It is an approximate city map, not a precise GPS
route. The map hides during conversations/inspections, indoors and outside walking
mode, while preserving the user's visibility choice for returning outside.

Navigation updates at most 5Hz, visible maps at 4Hz, with canvas DPR capped at 2.
Closed/indoor maps do not draw. No second WebGL camera/pass, downloaded textures,
new lights or shaders are added. The only new 3D pieces are ten stair treads.
Browser viewport/touch tests do not replace real-device mobile performance tests.

Final checks: Chromium passed human navigation arrival at all ten destinations,
all three cat passages (cat can cross; human clearance fails as intended),
PC/tablet/mobile portrait and landscape map bounds, touch 390×844 map controls,
and entry → portrait conversation → exit. The destination menu folds after
selection so keyboard walking can resume without a focused hidden select.
The map retains its choice while hidden and reappears after leaving a room.
Six weather modes, 19 cameras, tracking and animations passed their browser
smoke check; scene/shop/portrait/navigation data checks passed too.

At the harbor walking start, map closed/open WebGL measurements were identical:
High and Standard 145 draw calls / 27,192 triangles; Mobile 131 / 27,178.
These are one camera sample, not overall town counts or real-phone frame rates.
Full pathfinding, per-turn routing, and navigation inside rooms remain future
work. Indoor maps are intentionally hidden; the compass does not force a route.

The wider reservations initially left the old bookshop canopy and one work stall
without a valid placement candidate. This was caught by comparing the previous
main snapshot, not ignored as an existing warning. The canopy is explicitly
seeded beside the bookshop lane with its posts on the quay; the complete stall
moves to an unobstructed dry area of the east working deck at (31,37.5).
Neither is removed or rescaled. All registered grounding candidates resolve,
and the thirty walking cases are repeated after these final placements.

`tools/check_grounding_clearance.mjs` also verifies, using an isolated Three.js
fixture, that an overhead canopy does not create an imaginary wall while real
posts still keep their collision clearance. No other placement uses the opt-in
`precisePassages` setting. Grounding checks ended with zero unresolved entries.

## v14.2 regression after art and resident changes

The three-start, ten-destination keyboard walking matrix passes again after the
facade and resident changes. The final ten harbor routes are repeated after the
bookshop barrel adjustment. Human/cat profiles, building coordinates, stair
heights, shop entrance points and the three cat storage passages are retained.

A comparison against v13.8 found a pre-existing cat-entry obstruction at the
bookshop: a grounded barrel blocked the low door interaction point. It is seeded
at (-14.8, 33.0), beside the frontage and clear of the main quay street. The
complete barrel and hoops remain; no interaction ray is allowed through solids.
Native cat entry now works, while the human door and navigation target stay put.

Five shops are entered, their five conversation characters spoken to with both
human and cat modes, official portraits displayed, then exited. Shared resident
details render only for visible indoor people. Smartphone-width touch tests
cover map controls, arrival, bakery entry, portrait conversation and return.

## v14.3 — 酒場の直進路

広場西側の掲示板が x=-5.46〜-2.01、z=18.31〜18.47、y=4.30〜5.95 を横切り、人間（半径0.24m、身長1.8m）が x=-4 の見えている路地で止まっていた。掲示板を隣の建物東壁（x=-5.66、z=20.10）へ90度向けて移設。掲示内容は残し、建物と猫専用路地は変更しない。主路地幅1.2m、入口の停止余白1.2m、蹴上げ0.25m以下という既存基準を維持する。衝突を無効化せず、掲示板の実形状を移動して路地を開く。

## v14.4 — 通行監査の再利用

`walking.inspectClearance(x,z,y,profile)` は実歩行と同じ床・身体判定から障害物の名前と実寸boundsを返す。判定を緩めるための別ルートではない。人間用1.2mの直線幅、角と入口前の1.2m余白を制作時に確認する。低い猫棚3か所は例外で、人間には脇の通常路を残す。階段は従来の最大蹴上げ0.25m、人間の許容段差0.38mを維持する。

検証は目的地へのカメラ移動ではなく、W入力と実際のwalk.updateで行う。複数地点間の既存街路を相互に歩き、酒場の掲示板跡は別に直進テストする。描画物の追加後にも同じ経路を再検証する。

### v14.8 完了時の再歩行

外観・住民・出来事の追加後、W入力＋walk.updateで次の15経路と掲示板跡の直進を再確認した。

- 広場 → パン屋／古書店／宿屋／酒場／天球儀店
- 市場 → 酒場／パン屋
- 港 → 酒場／市場／パン屋
- 水車 → 酒場／港
- 天球儀店 → 酒場、ケーブルカー → 広場、鐘楼 → 中層広場

既存の安全な街路を接続した経路であり、完全な最短経路や全区画の網羅試験ではない。酒場前のx=-4、z=20→17→13→入口は別途直進を確認。x=-4.6〜-3.4、z=16〜20の520サンプルが全て人間通行可。PC960×640／スマホ幅390×844でも同じ直進を確認。3つの低い猫棚は猫で実移動し、人間の通行不可を維持。詳細はtools/v148-validation.json。

## v15.5 — 住民と猫探索

人間の半径・既存街路幅・酒場の直進導線は変更しない。一般住民8人の生活移動は
同じ床・段差・壁・水の判定を再利用し、衣服の大きな箱の代わりに身体の丸い
動的判定を使う。仕事場では道の脇へ寄り、通行者を待避する。
宿屋上階は実際の階段で移動する。猫は既存低い足場5個だけへ小ジャンプできる。
既存3抜け道、店舗入口と出口、室内の人間・猫プロフィールは維持する。
