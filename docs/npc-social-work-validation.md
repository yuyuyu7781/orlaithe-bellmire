# NPCの仕事仕草・短い視線交流

基準: `956a8ea77040d69e8216a52bc88da85b6f0a9972`。
ユーザー承認: 2026-10-11。既存8人、既存移動・描画・会話機構の最小拡張。

## 作業分離
元のmainはd5097e4、evan-default.pngにユーザーの未コミット変更あり。
専用のfeat/npc-social-work worktreeをorigin/mainから作成。作成直後HEAD=origin/main、clean確認。
元の画像はstash・置換・commit対象にしない。SHA256/size/mtime_ns/inodeを作業前後で照合する。
元mainは操作せず、最終一致は専用worktree HEADとorigin/mainについて確認する。

## 監査・設計
resident-lifeに呼吸・視線・腕・仕事姿勢・歩行・描画距離制限がある。
resident-dayにschedule、短距離往復、actorBuckets、譲り合いがある。
named-travelにブラン/Finnの同一経路復帰、shop-systemに室内workstation移動がある。
既存の屋外交流は毎更新、近くの到着済み人物を向き合わせ、conversation状態にする。
これを期限付きのpresentationに置き換える。経路stateやactivityを交流目的で変更しない。

resident-routinesの既存カタログへ人物別仕草・期限付き交流の関数を追加。
resident-lifeの既存頭・腕・body回転で表示。座標・地形・3Dモデル・小道具は追加変更しない。
既存空間バケットを再利用し、代表8人の共有場所だけで交流。
根拠のない関係性や新しい会話文は作らない。プレイヤー追視も追加しない。

| 人物 | 既存仕事地点での小さな仕草 | 間隔/作業時間 |
| --- | --- | --- |
| ブラン | 縄を扱う腕、手元と港の確認 | 29/7秒 |
| Finn | 周囲を見る、控えめな腕・姿勢変更 | 37/5秒 |
| ローワン | 舟仕事の手元と水辺の確認 | 31/8秒 |
| イーラ | 店の手元・周囲の確認 | 43/6秒 |
| ガレン | 設備点検の前傾・片腕の確認 | 35/9秒 |
| ソフィア | 記録確認を思わせる下向き・静かな腕 | 47/10秒 |
| ニーヴァ | 採取物・手元の確認 | 41/8秒 |
| オーウェン | 補修箇所・道具確認を思わせる前傾と腕 | 33/7秒 |

これは新設定ではなく、既存roleの表示演出。既存小道具の有無は維持。
仕事地点以外・夜は静かなidle。仕草の間には休止を置く。
交流は同じ共有地点・region・親、距離0.9〜3.5m、作業中/移動中/会話中でない場合のみ。
2〜2.8秒で終了し、約64〜82秒以上の間隔を空ける。位置は一切変えない。
仕事・経路・会話・event・非表示/遠距離になると交流を双方中断。

## 保護範囲
save bellmire.stay.v1/version1、新fieldなし。仕草・交流状態は保存しない。
ID、会話、人物設定、schedule、portrait、water UX、stage、地域/Ring解放、地形は変更しない。
モイラ/ミラの関係、Finnの正体、王宮、区画14などの未確定・非解放状態は維持。

## RED記録
- 人物別仕草selectorがなく、8人の役割別work/idleテスト失敗。
- 期限付き共有地点交流がなく、終了/cooldown/優先順位テスト失敗。
- 実際のブランへの会話中、resident-lifeの頭・身体・腕・prop姿勢が変化する失敗を再現。
  named-travelは位置を停止するが、resident-lifeのposeは会話を参照せず継続していた。

## 追加で再現した不整合
- named-travelの無効経路・出発待機のearly returnで、共有recordがwaitingに戻り仕事仕草が出た。待機stateとroutePendingを共有recordへ反映するだけに修正。
- Finnの既存external visitに入ったとき、以前のroutePendingが残りidleが抑制された。訪問開始時のpresentation用metadataを同期。訪問条件や経路は維持。
- work/idle切替時の腕の急変を連続性テストで再現。作業pulseで休止姿勢から補間し、小道具の既存持ち姿勢を維持。

## 会話・領域・save・性能
story/event（既存bellPauseなど）、player dialogue、移動、仕事、idle/交流の順。
対象の会話中は頭・body・腕・propの回転を固定。経路は前フェーズの所有executorに任せ、同一path/cursorへ戻る。
領域外は既存schedule/時間・簡易移動更新を維持。交流は現在の親/region/共有場所が一致するvisible/active対象だけ。
reloadは既存scheduleから復元し、仕草や交流途中状態は保存しない。
交流の新規候補scanは3秒ごと、対象8人、既存actorBuckets。進行中の期限/中断確認も8人に限定。
既存の遠距離pose更新頻度・画面外detail batchingを維持。描画mesh/instance/lightを増やさない。

## 検証記録
- Node: tools/check_*.mjs 32/32 PASS（従来30本＋actions/glancesの2本）。browser engine選択も含む。
- Chromium 119: 新旧NPC acceptance 5/5、既存統合回帰24/24 PASS。
- WebKit 26.5/build2336: 新旧NPC acceptance 5/5、portrait/water 6/6、camera 1/1 PASS。WebKitのcamera検証はtouch tap＋mouse dragで、OS固有edge gestureの実機再現ではない。
- 統合回帰対象: portrait/guest/visitor、save round trip、capital research、boat、非解放境界、天候/日替わり、宿泊/帰還、mobile/camera/scroll、既存story条件。
- 8人の実際の描画jointでwork/idleを確認。16枚の静止画と、通常RAFでのwork開始/終了動画をレビュー。会話中のjoint固定は人間/猫および既存live-route上で確認。
- 共有地点2箇所（lun-diner/mire-shelter）の制御fixtureで短いglance・終了・cooldown・姿勢復帰・座標/save非変更を確認。
- code review: Critical/Importantなし。API/geometry/portrait/save/storyの範囲外変更なし。
- ローカルのcapital-phase2-acceptanceは基準mainでも、Chromium119のSVG map-routeによるクリック遮断で失敗。今回の移動/仕草の回帰とは分け、地図を変更せず最新版CIで再確認する。基準mainの同workflowはGitHub CIでPASS。
- 同一環境で基準main→実装後を順に測定: 39視点のcalls/triangles/mesh/lights/transparent/castersとNPC118は全一致。CPU中央値0.6→0.5ms。
- 390×844/mobileの700更新×4地域: 中央値（前→後ms）はBellmire7.3→8.7、Lunmere0.9→0.8、Caer Veyra1.1→1.0、Mire1.5→1.2。Bellmireの差を確認するため逆順で再測定し、基準8.6/実装8.5ms、p95基準21.4/実装16.8msだった。初回差は一貫して再現せず、無根拠な性能修正は行わない。
- software GLのCPU計測であり、iPhone実機FPSの合否には用いない。実機の重さ/発熱/操作感は確認待ち。
- 最新Chromium/WebKitのCI結果は公開時に最終報告する。

## 既知の制限
- 頭・腕・bodyの小さな回転による演出。新animation assetや道具モデルは追加していない。
- 交流は代表8人の自然な共有地点のみ。会う時間帯・配置によっては見られない。文章会話や人間関係の確定情報は追加していない。
- settled pose/social fixtureは条件を制御した描画確認。通常の歩行・会話停止/復帰は別の既存live-route acceptanceで検証。
- 自動検証はiPhone実機のFPS・発熱・操作感を保証しない。

## iPhone実機チェック
自動検証をiPhone実機PASSとは扱わない。
- 8人の仕事地点で、手元・周囲を見る違いと休止が見える。
- 食堂/休憩場所などで短い視線反応が終わり、連続しすぎない。
- 人間/猫で話しかけると歩行・仕草・交流が止まり、閉じると復帰する。
- region/室内の出入り、reload、宿泊後に位置・経路が正常。
- 左右上下カメラ、ジョイスティックとの同時操作、modal後復帰、地図pinchが正常。
- portraitと水位案内、既存story・未解放境界が維持される。
- 約10分遊んで重さ・発熱・クラッシュ・通路の妨害が増えていない。
