# カメラ開始領域の左右非対称UX修正

状態：**自動検証済み／iPhone実機再確認待ち。Task 5は未PASS。**
基準main：1cf119bdb182828cbcd262f0186c50c2c74ef18c。

## 原因と最小修正

実機診断では右方向のpointermove／touchmoveは届いていたが、開始X=173.667が48%未満のためleft movement regionとして拒否され、yawが変わらなかった。左方向は開始X=301.667から35まで受理された。左右のyaw計算の差ではなく、固定開始領域が自然なドラッグ距離を非対称にしていた。

walking.jsのcanvas pointerdownからtouch開始Xの48%制限だけを削除した。空きcanvasの左右から開始できる。ジョイスティックは独立したDOM要素のpointer capture／stopPropagationで操作を所有し、他のUIも自身のDOM targetに届く。modal／inputBlocked／既存pointer／button／pointer lockの条件、移動・カメラ計算・取消し・capture処理は維持した。

診断表示はCAMERA DIAG 2「開始領域修正／実機確認待ち」に更新し、廃止した48%判定の理由表示を削除した。walkingと診断moduleのcache用queryを更新した。通常URLでは診断無効。save、既存ID、stage、地域解放、水位、ジョイスティックやUIの配置は変更していない。

## REDと修正後の検証

RED：[38035571494](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/38035571494)。Chromium／WebKitのnative tapが報告開始X=173.667で「actual: left movement region / expected: accepted」と失敗。

GREEN：[38036604601](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/38036604601)、af17344、両engine成功。

- 報告座標の173.667→385.667、301.667→35、および左右同じ212pxドラッグをChromium native CDP touchで実行し、正しいyaw変化を確認。
- 開始位置30%／44%／64%／84%、縦横で実際の空きcanvasを選び、native touch tapの受理とmouse pointer dragの左右yawを確認。UIは隠さない。
- 実ジョイスティック単独ではyaw不変。同時に中央からカメラを操作でき、カメラの指を離してもジョイスティックは保持、全指を離すとanalog解除。
- UIボタン、実際に開いた世界地図／都市地図／会話中のカメラ停止と閉じた後の復帰、pointer／touch cancel、診断hit test、saveキーbellmire.stay.v1の不変、通常URLで診断なし。
- 既存mobile-interaction／mobile-pc-regression／mobile-scroll-recovery成功。ローカルNode回帰22本、構文・diffチェック成功。独立レビューCritical0／Important0。

WebKitはデスクトップengineのnative tapとmouse dragであり、iPhoneのOSジェスチャーやtouch dragそのものを再現した判定ではない。実機の最終合否はユーザーの再確認で決める。

途中の失敗は隠さず記録する。検証用branchへのHTML転送で出力が切れ、起動失敗したため完全なファイルを復元し転送に検査を加えた。mainには転送失敗版を反映しない。追加テストでは実UIの重なり、live move処理待ち、touchEndの対象指、都市地図の未到着fixture、modal close待ちを訂正した。都市地図の到着状態はテスト内のメモリだけに一時設定して戻し、saveを書き換えない。これらのためのゲーム本体の追加修正は行っていない。

既存bellmire-v101.ymlは今回以前から無効なworkflowで、jobなしのfailureが継続する。今回の対象workflow成功と区別し、関係のない修正は加えない。

## iPhone再確認

https://yuyuyu7781.github.io/orlaithe-bellmire/?cameraDebug=1 を再読み込みし、表示先頭がCAMERA DIAG 2であることを確認する。saveを消す必要はない。

1. 地図・会話を閉じ、中央〜左寄りの空き領域から右方向、右寄りから左方向へ、同程度の距離をドラッグする。開始判定accepted、yaw変化、実際の視点移動を確認。
2. 左下ジョイスティックの操作では視点が動かず、移動・停止できることを確認。
3. ジョイスティックを保持しながら空き領域から左右のカメラ操作を行い、片方の指を離しても残った操作が続くことを確認。
4. 地図・会話・メニューの操作で背後のカメラが動かないこと、閉じた後に復帰することを確認。
5. 縦・横で比較する。Safariの端ジェスチャーはOS側の動作があるため、まず端から40px以上内側を使う。今回はOSの履歴ジェスチャー抑止は加えていない。

異常があれば開始・現在座標、deltaX、start判定、yawと操作後の画面を残す。診断を外すにはURLのcameraDebugを削除する。
