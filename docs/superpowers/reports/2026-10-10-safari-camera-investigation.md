# iPhone Safari：右方向カメラの実機調査

状態：**右方向の不具合は未解決／診断版の自動検証済み／実機ログ待ち**。Task 5はPASSにしない。
基準main：f66195ee14e09ad3e1174619adcedf2f67ecefa9。

## 確認したコードと今回の変更

カメラのyawは `yaw -= deltaX * .003`、上下だけpitchのclampがあり、左右別の符号・clamp・移動方向分岐はない。touchの開始位置がinnerWidthの48%より左の場合だけカメラ開始を拒否する。canvasはtouch-action:noneでpointer captureを使う。終了はpointerup／pointercancel／lostpointercaptureと既存の入力resetで行う。

右側には猫ジャンプ、近接操作、地図、会話などのUIがあるため、実機の開始位置とその時点のhit targetを確認する必要がある。rendererはinnerWidth/innerHeightでresizeされ、safe-area対応UIとvisualViewportとの差もログに残す。透明UIを推測で無効化したり、Safari履歴操作を一律に抑止したりはしない。

WebKit Bug 239014（https://bugs.webkit.org/show_bug.cgi?id=239014）は右端の履歴スワイプを戻したときpointer終了が来ない事例を報告している。報告対象はSafari 15／iOS 15であり、今回のiPhoneのOS／Safariや症状が同じとは断定しない。端からの操作と中央寄りの操作の実イベントを比較するための仮説として扱う。

追加は `?cameraDebug=1` の時だけ有効な読み取り専用診断。通常URLでは診断表示・イベントlistener・ログを作らない。save、ID、入力計算、ジョイスティック、UIのpointer-events／touch-action、水位・stage・解放条件は変更しない。indexのwalking import queryだけ更新し、古いmodule cacheと区別する。

診断は256イベントまでをメモリに保持し、pointer/touchの開始・move・終了・取消し・capture、Safari gesture、resize、visualViewport、pagehide/showを記録する。preventDefault、capture設定／解除、入力reset、storage書き込みは行わない。表示のpointer-eventsはnone。

capture段階の処理前状態と、passive window bubble段階のcanvas処理後状態を分ける。bubbleが止められたイベントのみ次のtaskで記録し、afterPhaseを付ける。capture内queueMicrotaskはnativeイベントでcanvas処理より先に走るため、初版の診断テスト失敗とレビューに基づき使用をやめた。

## 実機で確認する手順

1. Safariで https://yuyuyu7781.github.io/orlaithe-bellmire/?cameraDebug=1 を開き、人間または猫の歩行モードへ入る。保存データを消す必要はない。
2. 地図・会話などを閉じ、画面右半分の中央寄り、右端から40px以上内側の同じ位置から、左方向／右方向の視点操作をそれぞれ行う。指のスワイプ方向と視点方向を混同せず、いつも不具合になる操作をそのまま行う。
3. 各操作後の診断表示をスクリーンショットに残す。画面には開始・現在座標、deltaX／totalX、yaw／Δyaw、カメラpointerとcapture、touch数、開始判定、hit target、touch-action、inner／visual viewport、safe-area、イベント数と直近イベントが出る。
4. 次に右端近くの開始位置でも一度確認する。Safariの履歴画面が動く場合は、その有無と戻った後の入力状態を記録する。中央寄りで改善しただけで原因や修正成功とは判定しない。
5. 縦／横、ジョイスティックを離した状態／同時使用でも比較する。機種、iOS、Safariのバージョン、実際の指の移動方向を併記する。

イベントが一切届かない操作では、ブラウザから座標を取得できないためカウンタと表示が変わらないこと自体が手掛かりになる。ログのyawが変わるのに画面が変わらない場合と、moveが届かない／captureが切れる場合を区別する。

メモリログは開発者consoleの `cameraInputDebug.exportText()` でJSONとして取得できる。iPhone側でconsoleを使う必要はなく、画面のスクリーンショットでよい。通常プレイへ戻すにはURLの `?cameraDebug=1` を外す。

## 自動検証の範囲

変更前：[38011159581](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/38011159581)でChromium／WebKitともに「opt-in camera event display missing」のREDを確認した。

診断版の最終検証：[38012130376](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/38012130376)、4e98084、Chromium／WebKitの両job成功。各ドラッグの新しいイベントに限定して左右・開始位置64%／84%・縦横を確認し、cameraResult=accepted、afterPhase=window bubble、yawの変化をassert。native touchの開始／終了、Chromiumでは左右moveとcancel、診断のhit test／viewport／saveキーbellmire.stay.v1の不変、通常URLで診断が無いことを確認。

同runで既存mobile-interaction／mobile-pc-regression／mobile-scroll-recoveryを完走し、地図10viewport cycle、ジョイスティック360度／同時カメラ／入力取消し／modal復帰、PC操作、320pxscrollがPASS。ローカルでNode回帰22本がPASS。save／ID／stage／区域／水位の変更はない。

途中の4f24759 run38011637209ではmobile-interaction.cjsの30行、画面切替後のjoystick boundingBoxがnullで一度失敗した。同じ製品コードの36f8515 Chromium jobと最終runでは完走したため、原因を断定せず、本体への予防修正はしない。別のWebKit runは環境インストール段階で長時間停止したため準備をpackage／system dependencies／browser downloadに分け、時間上限を設けた。最終runでは環境起動・テストともに成功。

独立レビューでcapture内microtaskによる早期取得をImportantとして指摘され、nativeテストのyaw差assert失敗でも確認した。bubble優先＋次task fallbackへ修正後の再レビューはCritical0／Important0。カメラの入力処理自体は修正していない。

Chromiumのnative CDP touchに加え、WebKit desktop engineでnative tap／pointer mouse dragを確認する。WebKit desktopのtapとmouse dragは、iPhone SafariのOS履歴ジェスチャーや実機のtouch dragの再現ではない。自動検証成功は診断版の成立と既存操作の回帰を示し、右方向の不具合解決を示さない。

実機イベントの証拠を受け取り、原因を特定してから必要な入力修正とその再現テストを追加する。右方向の最終合否、Task 5／実機受け入れは未完了。
