# NPCの建物出入り・屋内外生活導線

基準main: `4c659d5e26de5d28afae78370032e3cf80709a78`。
承認された6人・既存建物だけを既存executorへ接続する。

## 作業分離
専用worktree `orlaithe-npc-doors` / `feat/npc-building-transitions` は基準origin/mainと一致したclean状態から開始。
元worktreeのmainはd5097e4のまま保持。ユーザーのevan-default.pngは一切操作せず、SHA256・size・mtime_ns・inodeを開始時のsnapshotと照合する。
最終一致/clean確認の対象は専用worktree HEADとorigin/main。元worktreeのdirty状態を消さない。

## 監査と再利用
- shop-system: 既存entrances/approach/normal、遅延生成interior、npcPosition/workstations、workerStates、playerのroom切替、同一actorのreparent。
- named-travel: ブラン/Finnの既存street graph、経路要求、会話停止、hidden移動、実歩行距離phase。
- resident-day: Lunmere/王都schedule、waypoint、canStandTownAs/canStandActor、既存collision・譲り合い、遠距離/非表示の低頻度更新。
- resident-life/resident-routines: 既存joint/feet、仕事/idle、期限付き視線交流、会話/event停止。
- 既存扉は静的。新door animationや別transition systemは追加しない。

## 対象
| 人物 | 既存建物 / schedule導線 |
| --- | --- |
| ブラン | 夕方・夜の酒場、既存悪天候時の宿 |
| Finn | 夕方の宿、夜の酒場。既存Lunmere訪問/食堂条件を保持 |
| ローワン | 朝・夜の舟小屋、夕方の食堂。昼の湖側作業先を保持 |
| イーラ | 朝・昼・夜の小商店、夕方の食堂 |
| ガレン | 朝・夕方の水門管理室、昼の既存屋外仕事地点 |
| ソフィア | 朝・夕方の舟運組合、昼の既存屋外仕事地点 |

夜の既存帰宅先などを新しい家/interiorに置き換えない。
ニーヴァ/オーウェンは既存屋外避難地点・経路を維持。

## 最小設計
屋外は各executorが既存経路を歩く。named-travelは既存graph上から実入口までcollisionで検証した最後の区間を接続。
入口では内向きに揃え、約0.7秒停止後にinside状態へ移る。
同じ建物にplayerがいるときは、既存室内spawn近くの安全な空き点から同一actorを表示し、既存workerがnpcPosition/workstationsへ歩く。
playerが別の場所にいる場合は室内位置の細かな演出を省き、schedule上のinside状態だけ維持。
退出時は室内workerが既存room.exitまで歩き、約0.7秒停止してから屋外executorへ返す。player不在の室内では細かな歩行を省く。
表示用歩行phaseは実際の室内移動距離から計算し、既存feet/jointと実移動yawを再利用する。
同一objectを維持し、室内表示時に屋外drawを呼ばない。退出後は室内shopWork metadataを消す。

## 優先順位・入口・復元
story/event > dialogue > door transition > scheduled movement > work > idle/social。
会話中は対象だけ停止。eventの既存bellPauseはcommunity adapterから室内workerへも直接参照する。
transition途中のschedule変更は既存schedulePendingで保留し、完了後に最新scheduleへ戻る。
初期化中のweather→period設定はまだ歩行を開始しない。既存初期配置で最終の保存時刻へ復元し、一時的な昼scheduleのdepartureを残さない。
入口の譲り合いは既存collisionのみ。交流のために入口へ寄せたり、新queue/群衆AIを追加しない。

## 失敗テストで再現した問題と修正
- ブランが実酒場入口から約4.69m離れて消える → 既存graphから実entranceへ接続。
- 実入口のraw Yが歩行floorと0.08m違う → canStandTownAsの実floorへ合わせる。
- 室内到着時に入口から約4.44m離れた仕事地点へ直接表示 → 入口近くから既存workerで歩く。
- 室内出口へ歩く前に消失 → 既存workerのexit到達まで屋外handoffを待つ。
- 室内歩行時feetが動かず、進行方向とyawが逆向きになる → 実距離phase/方向を既存animationへ接続。
- event停止中にも室内workerが動く / community開始直後1フレームが動く → 既存pauseを双方のownerで参照。
- 屋外復帰後も室内shopWorkが残る → 対象6人だけ屋外ownerへ戻すとき削除。
- 2回目の退出で待機が2tickに短縮 → 新しい退出開始時にexitWaitを初期化。
- ローワンの旧経路が舟小屋を横切り停滞 → NPC waypointだけを既存建物の東側の安全経路へ。猫専用低い横木も避ける。描画済み道路・水・地形は変更なし。
- 朝saveのreloadで初期weather設定の昼departureが残る → 開始前のhydrateと同室early returnのdeparture cleanupを修正。

fixtureのunsafe開始点、未解放王都の高さ判定、JSONのkey順、歩行終了後の静止feet比較はテスト条件として修正。ゲーム不具合とは数えない。

## 保護範囲
save `bellmire.stay.v1` / version1。新field・座標・transition・portrait URLの保存なし。
ID、人物設定、会話、記憶、既存schedule、portrait42枚、stage、地域/Ring解放、水位周期、物語の未確定要素は維持。
町・室内geometry、upper spring/watercourse、王宮内部、区画14は変更しない。

## 追加acceptance
- npc-door-acceptance: 実酒場入口までの全経路と歩行floor。
- npc-door-room: ブラン/Finnの実入退店、入口spawn、実室内歩行・feet・yaw、event、同一object、2回目退出、屋外owner復帰。
- npc-door-regions: 4人の実入口到達、短い停止、室内event初tick、退出時会話停止/再開、実出口到達。
- npc-door-priority: 6人×human/catの入口会話中停止・再開。
- npc-door-lifecycle: 共通入口のcollision、朝/夕方reload、同一室内再入場、非表示中のinside維持、save v1 keys/memories/threads不変。
- check_npc_actions: entering/leaving中の仕事・idle抑制。
- npc-door-visual: 実transitionのmobile描画証拠（入口停止、室内到着、室内歩行、退出歩行）。

## 検証結果
- 基準mainのNode32/32、既存NPC/宿泊8/8を実装前に確認。
- 実装後Node32/32、追加door5/5、前フェーズNPC5/5、維持対象の統合browser24/24 PASS（ローカルChromium119）。
- portrait/visitor/guest、save旧版往復、資料比較/人物、非解放境界、舟、天候/日替わり、宿泊/帰還、35室入退室、camera/joystick/map/scroll/PCを含む。
- 実入口到達、室内の距離駆動gait/yaw、会話/event停止、2回目退出、朝/夕方reloadとregion再入場を確認。
- 共有入口fixtureの最小actor間隔0.630m。既存collisionで重なりを回避。
- 390×844/mobileの実transition4描画をレビュー。撮影cameraが壁外へ出たfixtureは撮り直し、ゲームgeometryは変更しない。
- 同一環境で基準→実装の順に6地点×500 full-owner更新を測定。actor132・schedule118、mesh/light数は全地点で一致。
- CPU中央値（前→後ms）: Bellmire2.7→3.1、Lunmere0.5→0.5、Caer Veyra0.6→0.6、Mire0.5→0.4、酒場0.2→0.3、舟小屋0.2→0.2。詳細はnpc-building-performance.csv。
- software GLのCPU計測で、実機FPSの保証ではない。新しい毎frame pathfinding・animation asset・scene objectは追加なし。
- 第三者code review: 再現されたexitWait/event/ownership/hydrationの指摘を修正後、未解決Critical/Importantなし。
- 最新Chromium/WebKitはcamera-safari matrixで追加door5本、前フェーズNPC5本、portrait/water6本、宿泊3本、cameraを実行。feature CIを確認後、承認済みmain公開へ進める。
- 基準mainの維持対象CI（camera/Phase2/iPhone/pages）は全PASS。旧bellmire-v101 workflowの定義failureは基準にも存在し、今回の範囲外として変更しない。

## 既知の制限
- 静的扉と短い停止で境界を表現。新規扉開閉animationはない。
- 同一建物で観察している場合に室内の詳細歩行を実行。非表示建物では既存簡易simulation。
- 対象6人の既存建物のみ。新しい自宅や全NPCへの展開は行わない。
- automationはiPhone実機のFPS・熱・Safari OS gestureを保証しない。

## iPhone実機チェック
状態は「自動検証済み／iPhone実機確認待ち」。
- ブラン/Finnが入口まで歩き、一瞬停止・扉向きになってから入る。
- 同じ室内で入口から仕事地点へ歩き、退出時も出口へ歩く。
- ローワン/イーラ、ガレン/ソフィアの既存建物でも同様。
- human/catで入口・室内・退出中に話すと止まり、閉じると再開する。
- 同じ建物へ2回入る、地域を離れて戻る、朝/夕方reloadで二重表示・消失がない。
- 入口にplayerが立った場合に永久詰まりや通路の封鎖がない。
- 室内の仕事/idle、既存短い視線交流、portrait、水位UXが維持される。
- 左右上下カメラ・ジョイスティック同時操作・地図pinch・modal/宿泊後の操作復帰。
- 約10分プレイし、重さ・発熱・クラッシュ・壁/水への貫通が増えない。
