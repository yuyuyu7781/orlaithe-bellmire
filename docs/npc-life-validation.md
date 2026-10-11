# NPC生活移動 — 実装・検証記録
基準main: d5097e46eda0b4eaa94dcfca2922ecc4bcbf32c7
承認済み: 既存schedule/waypoint/resident-day/resident-lifeの限定拡張。代表8人を優先。
対象: boatworker/greenBard/lunBoat/lunWatcher/cvGaren/cvSophia/mireGatherer/mireKeeper。

## 順序
1. 会話停止・同じ経路復帰
2. named-travelと共通歩行animation整合
3. 代表8人の滞在リズム・安全な短距離移動
4. 無効/切断経路の安全待機と復帰
5. 回帰・fresh review・公開

## 制約
既存ID、会話、save bellmire.stay.v1/version1、地域解放、stage、水位周期、Ring条件、既存portrait、地形は変更しない。spring/watercourseは触らない。

## 実行記録
Task 1: 基準mainで会話中のboatworkerが0.7m進む失敗を確認。inspections.opened.objectだけを停止。位置/route/cursor/waitを保全し、解除後再開。明示的な時刻変更のみschedule更新を解除後へ延期。
代表8人の実executorで会話停止/同一経路復帰PASS。Node回帰30/30 PASS。
Ruling: 共有停止処理は8人だけに限定せず、同じexecutorを使うNPCに適用 — opened.objectの一致だけを判定し別NPCを止めないため — リスクは別handlerの人物固定、visitor/guest回帰で検証する。
Ruling: sibling worktreeを使用 — main保全と既存gitignore無変更 — ローカルの作業用ディレクトリだけ増える。

Task 2: boatworkerの実移動時にrecord.currentStateがundefinedになるREDを確認。実距離から共通のcurrentState/activity/walkPhaseを更新。待機中は足を止め、実際の進行方向を向く。8人会話復帰＋named animation acceptance PASS。

Task 3: authored dwell未設定のRED→GREEN。19/22/24/27/29/31/34/38秒の待機と6〜12秒の作業停止、0.32〜0.58mの安全な往復。8人の実executor移動PASS。屋内/夜/雨/遠距離は短距離演出を抑制。経路/会話/portrait等の設定は変更なし。Node回帰30/30 PASS。

Task 4: 無効scheduleのpaths未定義.at例外、切断graphを歩行可能として扱うREDを基準mainで確認。目的地/node/graph接続を確認し、失敗時は現在位置でwaitingRoute、2秒ごとの低頻度再試行。graph修復後は既存routeへ復帰。Finn既存offscreen regional join後に接続評価する。8人acceptance＋route recovery PASS。
Review: fresh reviewerによるCritical/Importantなし。Minor「折返しで歩行足姿勢のまま停止」をRED確認して修正。追加の往復完了テストで、旧parking処理が帰還位置を約0.95mずらすREDを確認。idle帰還時だけ即arriveし元の立ち位置で完了。通常commute/parkingは維持。
Ruling: 短距離生活演出は代表8人に留める — 会話停止だけ共有実executor全体へ適用 — 全員の新しい生活ルートは未展開。
Ruling: baselineDirブラウザoracleはquery付きJSも同じ基準snapshotへ解決 — 基準/変更後module混在で比較できない問題を再現したため — production非変更。

## 統合検証
Node tools/check_*.mjs 30/30 PASS。
Chromium: portrait-completion/guests/guests-native/travellers/capital-portraits/water-advice-browser/capital-save-compat/capital-research-compat/capital-research-ui/boat-sail/capital-closures/capital-weather/capital-days/lodging-life-audit/lodging-night-dialogue/lodging-return-audit/camera-safari-browser/mobile-interaction/mobile-pc-regression/mobile-scroll-recovery 20/20 PASS。
追加: 8人実executor会話停止/同経路復帰・named gait・8人安全短距離往復/停止、無効/切断経路待機と復帰、既存4時間帯schedule・native reload・Finn day6既存地域移動。
390×844/mobile CPU update profile（118 scheduled、各地域700tick、software Chromium）median ms 基準→変更: Bellmire4.7→4.7、Lunmere0.4→0.5、Caer0.7→0.6、Mire0.9→0.7。p95 基準→変更: 10.7→11.8 / 4.7→4.7 / 5.0→4.7 / 5.5→4.9。iPhone FPS証明ではない。
WebKit: local browser binary unavailable。CIの既存Chromium/WebKit matrixへNPC acceptance3本を追加し、実行結果を確認して最終報告する。

## 設計/制限
時刻・既存day/phaseごとのdestination、street graph、human collision substep、遠距離低頻度更新を再利用。新しいNPC AI/ID/geometry/save fieldなし。
一時座標は保存せず、day/phase/scheduleから既存hydrateで復元。室内入場だけではworld timeを止めず、dialogue/modalは既存clock block。屋外は既存簡易更新を維持。24時間simulation APIや新たな自動時刻進行は追加しない。
雨/夜/屋内/遠隔regionでは短距離演出を抑制。安全な平坦地点がなければ静止を選ぶ。全員が必ず同じ周期で動く設計にはしない。
全街道の全NPC完全踏破・iPhone実機FPSは今回の自動検証範囲外。代表8人の既存目的地/可用性は変えない。
Review追加: record状態だけでなく実脚の変形/関節角と本物のanimate frameを検証。Finnは既存joint脚なのでfootRestなし。古いroute animationがpose tick間に会話中の脚角を上書きするREDを再現。namedTravelを持つactorだけlegacy route loopを除外し、共通resident-lifeで既存joint脚を距離phaseから更新。新renderer/meshは作らない。
Review追加: existing external capital visitにwalking recordを引き継ぐREDを再現。訪問entry時のrecordだけrestingへ同期。visit/join条件・ID・会話・saveは変更しない。
追加acceptance: 人間/猫×8人、会話中の脚静止、実animate frame、named歩行足の変形/関節phase、閉じるanimation完了後のmobile modal解除、実resolver.activate。短距離往復の完了テストだけは他actorを非表示にした独立fixtureで実地形/collision/executorを検証し、群衆の既存yieldを「正確な原点帰還」の失敗と混同しない。population performance/既存街の回帰は通常populationで行う。
Fresh review最終: blocking findingなし。無関係な世界/会話/portraits/geometry修正なし。

## iPhone実機チェック（未PASS）
- Bellmire: ブラン港→酒場、Finn朝水辺/昼広場/夕宿/夜酒場。歩行時の向きと脚、停止時の足。
- Lunmere: ローワン舟小屋→湖畔→食事処、イーラ商店→夕食事処→商店。
- Caer Veyra: ガレン水門管理室↔既存水門作業点、ソフィア舟運組合↔既存荷扱い点→居住地点。
- Violet Mire: ニーヴァ採取地点/オーウェン補修地点→夕方の休憩所→夜の居住地点。
- 移動中に人間/猫で会話し、停止/portrait/会話文/閉じた後の同じ経路再開を確認。
- 30〜60秒観察して滞在・短距離の作業動作の差。雨/夜/室内では無理に動かさない。
- 地域を離れて再訪/屋内から戻る/宿泊/reload後にNPCが消えず時刻に合う。
- 階段・橋・水辺の通過、壁/水の貫通、長時間の詰まり/振動/横滑りを確認。
- ジョイスティック＋左右上下カメラ、会話/modal終了後、地図pinch、宿泊後の操作復帰。
- portrait/水位案内/未解放境界/物語の非漏洩、10分程度の重さ・発熱・クラッシュ。
