# Bellmire v15.6–v16.0 — 静かな滞在

既存の歩行・会話・室内・イベント・時刻を拡張する。街路、portrait画像、環境設定は変更しない。

## 日と休息

`townLife.state.dayIndex / dayPhase / dayStart` を共有し、`dayAdvance()` は翌朝へ進める。宿屋2階の2室にある寝床へ人間で近づき、E／既存タップ操作で「休む」を選ぶ。確認を挟み、短い暗転後に客室の安全な床へ復帰する。猫には休息操作を出さない。

徒歩中は朝→昼→夕→夜が各240秒で進む。室内でも進み、夜から翌日へは休息を使う。時刻選択は従来どおり使える。記録・休息の確認中、非表示タブでは時計を止める。保存するのは時刻区分で、秒単位の途中経過やプレイヤー座標は保存しない。

## 保存

`stay-state.js` に一本化。キー `bellmire.stay.v1`、version 1。日・時刻・天候履歴、7イベントの段階と日付、特別な観察／猫発見、5人の人間／猫別会話履歴、フィンの継続会話フラグ、旅の記録を保持する。350msデバウンスとpagehideで保存し、毎フレーム書かない。

読み込みは既知ID・列挙値・上限を検証する。壊れたJSONは初期値、未知の新しいversionは上書きせず初期状態で起動。保存拒否時はセッション内の進行を維持する。JournalはtextContentで表示する。開発用の `BellmireStay.resetProgress()` は確認後、進行を初期化して再読み込みする（一般UIには出さない）。

## 日跨ぎの出来事

- 小麦：Day 1にモイラから聞く／港の荷札を調べる。翌朝に届き、外と店内に小麦袋が現れる。台詞も変わる。
- 本：猫で古書店の机下の薄い本を見つけるとresolved。翌日、床の本は消えて棚へ戻り、エヴァンの言葉が変わる。
- 石：水路の丸い石はnoticedのまま残る。Day 2以降、ブランの噂に別の見方が加わる。意味は解かない。

人間と猫の挨拶は別々に記憶する。フィンだけ、前日に猫で会っていれば人間での再会時に低い目線をほのめかす。正体の説明は加えない。

## 日ごとの細部と記録

`day-details.js` は既存の布・羊毛・荷物の色を控えめな3色で変える。元の色を保存して戻してから適用し、色が累積しない。位置・輪郭・collisionは動かさず、灯りやmeshを増やさない。

「記録」ボタンの旅日記は会った人物、実際に聞いた噂、調べた特別な場所、猫の発見をDay付きで残す。未達成一覧や進捗率は出さない。最大200件、重複IDを抑制し、閉じている間はDOMを更新しない。PC／スマホでスクロールでき、Escape／閉じるで徒歩へ戻る。

## 屋外の連続性

8人の既存residentDayは、プレイヤーが室内にいる間も0.5秒間隔で状態・経路を進める。現在の室内以外は描画しない。主要人物も室外は0.5秒間隔で進め、経過時間の移動量を複数waypointへ消費するので、低頻度更新が移動速度を遅くしない。Mobileでは遠い主要人物を0.25秒間隔に抑える。入室する住民が着いた時だけ室内の配置を再評価する。

ブランとフィンは同じ検証済み街路グラフを再利用して移動する。ブランの初期位置を街路につながる岸側へ寄せ、港→酒場、フィンの広場・水車側の水辺・宿屋・酒場を連続移動で結ぶ。詰まった時だけ上限付きの局所迂回を試し、プレイヤーが近ければ待つ。通常最大1800、Mobile最大600探索ノードで、毎フレーム経路探索しない。店から出る際は間隔を置き、入口が混雑していれば扉のすぐ外の安全な床から現れる。残る3店主は既存の室内作業移動を維持し、屋外の長距離移動は未実装。

## 今後

日送りの追加手段、住民同士の譲り合いの深化、3店主の店内／店先の連続移動、保存形式の移行、実機スマホと実音源の確認。時刻・天候履歴と会話データは既存の拡張構造を維持する。

## v16.1–v16.6: weather and the next mornings

- `scene-settings.js` distinguishes blue predawn (`dawn`) from the warmer
  manual morning period. Rain keeps a clear foreground and lighter distant fog;
  fog weather retains its own denser profile. The existing atmosphere shader,
  sun, shadow map and bloom are reused.
- `weather-surfaces.js` restores immutable dry pigment colours before a mild
  wet wash. `harbor-details.js` remains the sole owner of water colour/time
  changes. Weather switches cannot accumulate darkening.
- Four practical outdoor blackout lamps (inn entrance, tavern entrance, quay,
  wheel outlet) and two carried oil lamps use opaque emission, no new lights.
  Normal windows/point lamps are off. Each lazy interior retains one oil lamp;
  the bakery oven uses the same backup material. Outdoor root visibility is
  still owned by `shop-system`, including weather changes made indoors.
- The original eight residents' schedules route two market neighbours to the
  inn in rain and four guests indoors at predawn. Existing background neighbours
  have a restrained shelter visibility policy. Named actors and moving people
  retain their own movement/controllers and indoor visibility policy.
- Four upper residential balconies are at approximately `(-34,11.91,-20.05)`,
  `(-25,12.44,-21.05)`, `(-19,11.91,-29.05)`, `(14,13.50,-26.05)`.
  Their floor clearance over the street is 2.61–7.25 units. Shared instance
  batches form the timber/rails/pots, with one small cloth per home. They add
  no walkable surface, street collider, shadow caster or light.
- `stay-dialogue.js` supplies short Day 2/3 and rain/predawn/blackout observations.
  Existing event replies, next-day memories, portrait variants and every fourth
  human rumour turn keep precedence. Other people keep distinct human/cat
  memories. Finn's “yesterday's low view” only refers to an actual previous-day
  feline meeting; it does not repeat a stale yesterday indefinitely.
- `stay-atmosphere.js` reuses the mooring/chart/belfry cultural interactions.
  Day 2 reveals faint related marks. Only inspecting them after seeing the
  upstream stone records the resemblance. Day 3 bell metadata comes from the
  existing `onBell` trigger; a relevant inspection/conversation records the
  rumour. No sound file, answer, quest objective or reward UI is added.
- Existing versioned saves, discoveries and journal IDs are reused; no save
  migration or extra per-frame storage writes are needed. A small, inert
  `futureCalendar` holds season/festival/visitor extension points. An actual
  visiting traveller and seasonal simulation remain unimplemented.
