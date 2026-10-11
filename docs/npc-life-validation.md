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
