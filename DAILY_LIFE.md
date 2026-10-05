# Bellmire v14.9–v15.5 — 少人数から始める街の生活

既存31人、歩行・会話・portrait・営業時間・時刻を継続利用する。
新しい住民、ライト、音源、画像、環境設定は追加しない。

## 街路を歩く8人

`resident-day.js` が既存の一般住民8人を管理する。`resident-routes.js` は
人間の実歩行で検証した床・街路の座標列。時計の変化では目的地と経路だけを
変更し、座標は移動更新で進める。経路探索は目的地の変更時のみ。
歩行・待機・仕事・立ち話・休憩・入室・帰宅を状態として保持する。

速度、出発待ち、途中休止を個別化。毎移動の小区間は人間と同じ床・段差・壁・水の
判定を通す。衣服や持ち物全体の箱を人体の衝突幅にせず、移動する身体は半径0.23mの
丸い判定を使う。仕事場では道の脇へ寄り、通行者へ小さく待避する。
夕方は4人が酒場へ、夜は3人が酒場・1人が宿屋へ向かい、残りは帰宅する。
入店は入口へ着いてから。翌朝の退店も入口から順に出て歩く。

主要5人の従来の屋外時刻配置は維持しており、全員の連続した通勤AIへの置換は
今後の課題。店内では既存本人が安全な作業点へ歩き、籠・本・縄・星図・楽器と
腕や視線の動作を再利用する。一般住民の立ち話も同じ生活表現を使う。

## 室内

非表示の店は描画・作業更新を行わない。パン屋は販売と作業場、古書店は奥の書庫、
酒場は奥の席と厨房、天球儀店は奥の机・星図を補う。
宿屋は20cm×16段の階段、2階廊下、ベッド・机・荷物・窓を備える2客室。
家具と床を同じ歩行判定へ登録し、上階からの不自然な落下を防ぐ。
到着済みの一般住民は、訪問中の該当室内だけ空いている床へ配置する。

## 出来事

`town-events.js` の既存7件を再利用し、`unseen / heard / noticed / resolved`を
ページ内で保持する。解決済み状態は再調査で戻らない。
小麦はモイラの噂→港の荷→後の夕・夜に配達、古書店の本は猫の店内発見→台詞変更。
上流の刻印などは解決を強要せずnoticedに留める。クエストUI・報酬・永続保存はない。

## 猫探索

既存3抜け道とモデル尺度は維持。既存の低い荷箱など5個だけにcatStepを登録する。
Space／右下の「跳ぶ」で小さなジャンプ。高さ差、向き、着地点、空中の壁・水を
事前に確認し、対象外の高い屋根や開水面へは飛ばない。中断時は安全な出発点へ戻る。
2個の足場には猫だけが高い位置から気づく短い調査文を追加する。

## 音・更新頻度

`ambient-audio.js` は既存soundAnchorsを再利用した距離音量ゾーンと
morningBell / eveningBell / nightBellの通知。音源未設定ではAudioContextも作らず無音。
将来srcを設定し、ユーザー操作からenable()を呼んだ時だけ共有ミキサーを開始する。
実際の音源、足音、鐘のワンショット再生は今回の対象外。

NPC移動はnear(<18m)通常、mid(<42m)10Hz、farはStandard4Hz／Mobile2Hz。
小さなidleは近景12Hz、中景4Hz、遠景Standard1Hz／Mobile0.5Hz。
室内にいる間は屋外の移動処理を停止し、非表示人物のidleを止める。
High / Standard / Mobileは既存設定を維持する。実機スマホの性能保証はしていない。

## 確認記録

`tools/daily_life_browser_checks.js` は隔離したブラウザで8人の昼→夕→夜→朝を進め、
時計変更の瞬間の座標差が0、全街路経路の完了、4人の夜間入室、翌朝の復帰を確認する。
`tools/v155-validation.json` に総合シナリオ、16人間徒歩ルート、宿屋の上下移動、
5個の猫ジャンプ、5人×人間/猫のportrait会話、19カメラ・6天候の結果を記録した。
スマホ縦幅では酒場の入退店・会話のタップ操作とUI収まりを確認した。

初期全景はHigh/Standardともdraw calls 2579・triangles 101349、mesh 2846・light 14・
shadow casters 208・transparent mesh 34でv14.8と同数。Mobileは2565 calls・101335 triangles。
室内は訪問時に遅延作成し、同時に描く室内は1店。出来事の配達袋は進行時だけ1メッシュ増える。
ソフトウェアWebGLの定常全景中央値はHigh 14.4→12.9ms、Standard 12.2→10.6ms、
Mobile 25.1→13.7ms。同環境でもばらつくため実機性能の保証には使わない。
追加の移動・idle・音ゾーン更新は全景0.2ms／近景0.5ms程度。

## v16.0 の更新

[STAY.md](STAY.md) を現在の仕様として参照。既存8人は室内滞在中も低頻度で進み、ブランとフィンは同じ街路グラフで連続移動する。3店主の屋外長距離移動は引き続き未実装。宿屋の休息、日、保存、会話記憶、旅日記を追加した。

### v16.6 weather reactions

The existing route controller still owns the eight scheduled neighbours and the
named travel adapter still owns Bran/Finn. Rain sends two neighbours towards the
inn; blue predawn keeps four guests indoors. Blackout uses the existing night
routes (tavern/inn/home), with two carried lamps. Background shelter visibility
is owned by resident-life only outside shops, and never overrides named actors
or physically moving residents. There is no second weather AI.

Validation includes a native three-day W/E stay with two bed rests, a Day 2
save/reload, all five human/cat portrait conversations, 16 human routes and 520
lane cells, five cat jumps, all six weather states and nineteen cameras. Inn
weather changes were checked while indoors and after returning outside.

## Small schedule and weather refinement after v18.6

Existing street routes, worker stations, visitor definitions and update loops are
reused. No added NPCs, geometry, lights, timers, saved fields or environment settings.

* Moira/Evan: in clear morning/day weather, brief doorway-to-shopfront errands
  (0.65 m maximum, roughly nine seconds before returning). Existing shop portals
  bridge interior/exterior coordinates. Every exterior step uses human collision;
  a player at the doorway prevents departure and nearby players pause movement.
  Indoors Moira starts her morning workstation cycle sooner; Evan walks more slowly.
* Nerissa: existing desk/instrument stations remain; slower walks and longer night
  work pauses distinguish quiet study without a new animation system.
* Bran/Finn: existing route controllers gain staggered departure waits and occasional
  short waypoint pauses. Weather shelter destinations reuse inn/tavern nodes.
* The three visitor types keep their existing arrival/departure days, with two or
  three deterministic stay-pattern overrides chosen by day. The traveller alternates
  market/square, merchant market/harbor/inn, carrier harbor/market/inn/tavern.
* More of the existing scheduled residents head indoors during rain, dawn and
  blackout. Weather shelter takes priority over the water-light gathering.
* Existing five-person rain/dawn/blackout dialogue, memory, Journal and portraits
  are retained rather than duplicated.

Browser checks cover four phases, four weather states, actual short porch motion,
visitor destination differences across several days, five human/cat shop
conversations and portraits, PC/mobile navigation/map, and 19 views/six weather/
follow/inspection/WebGL. Scene mesh/light counts remain unchanged in the focused
simulation check. No physical-phone frame-time claim is made.

## v21.6 の拡張

共通管理20人、主要人物と旧来歩行を含め31住民中25人に位置移動を持つ。
近傍バケット、短い近隣ルート、立ち話、鐘への小さな反応を追加。
現在の仕様・検証と制限は [CHAPTER_ONE.md](CHAPTER_ONE.md) を参照。
