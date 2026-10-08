# Orlaithe Mobile Interaction Audit & Repair (v52.9)

対象は操作系のみ。地域、NPC、物語、保存スキーマ、進行条件、環境設定は変更しない。

## 原因と修正

World Map / City Mapには内部ピンチ処理がなく、狭い画面でも720px幅のSVGをスクロール表示していた。ページのピンチ拡大と地図操作の区別、倍率の上限・下限、全体表示がなかった。実機で起きたすべての現象の再現はできないが、このコード上の問題を修正した。

共通 `map-gestures.js` がSVG viewBoxで1〜3倍を管理する。2本指の中心を基準に拡大縮小し、拡大中は1本指でパンできる。地図範囲から外れないようパンを制限する。指の増減時に基準を取り直し、up/cancel/lost captureで解除する。全体表示は1倍・初期位置に戻す。開き直しと画面サイズ変更も全体表示に戻す。横向きでは地図の高さを制限し、閉じる／全体表示のバーを上部に固定する。PCではホイール、キーボード + / - / 0 / Home も使用可能。

左下の安全領域に浮動ジョイスティックを置く。接触位置が入力中心。ノブ移動半径36px、外円100px、dead zone 12%。中心からの距離で入力強度を0〜1に連続変化させ、360度移動する。人間・猫は既存の速度／衝突処理を使う。舟はYが前後、Xが旋回。通常の指離しでは既存の舟の慣性を維持し、モーダルやフォーカス喪失では停止する。舟のカメラは既存の後方追従を維持。

右側canvasの指はカメラ専用。左の移動と別のpointer IDを保持し同時操作できる。猫ジャンプは右側の別タッチで押せる。PCのWASD・矢印キー・マウス操作は維持。スマホ方向ボタンは主要操作から除去。

pointer captureを使用し、範囲外に指が出ても操作を継続。cancel、lost capture、blur、hidden、モード／地域／室内変更、画面回転、モーダル開閉でリセットする。会話、Journal、資料比較、地図、宿泊などの表示中は徒歩・舟入力を停止する。

## ブラウザとの役割分担

- 地図面とジョイスティック、スマホcanvasのみ `touch-action:none`。
- 会話、Journal、資料パネルは `pan-y pinch-zoom`。通常スクロールとアクセシビリティのページ拡大を維持。
- 操作面のみ `user-select:none` / `-webkit-user-select:none` / `-webkit-touch-callout:none` とcontextmenu/drag抑止。文章全体は選択禁止にしない。
- 重要ボタンは44px以上。safe-area insetと動的viewport高さを使用。
- viewport metaで最大倍率やユーザー拡大を禁止しない。OSの戻るジェスチャーを無効化しない。
- `?mobileDebug=1` は入力モード、ジョイスティック入力、地図倍率を表示する。通常非表示、保存には影響しない。

## 自動・シミュレーション検証

`node tools/mobile-interaction.cjs` : Chromiumの実際のCDP touchイベント。320×740 / 375×812 / 390×844 / 430×932 / 844×390。両地図の1→3→1、1未満／3超クランプ、指の増減、パン、cancel、全体表示、閉じる／再表示、ページ倍率、横溢れ。アナログ強度・dead zone・移動＋カメラ、5秒保持、モーダル停止／復帰、猫ジャンプ同時入力、舟の推進／旋回、blur／モード／地域／回転解除を確認。

`node tools/mobile-pc-regression.cjs` : PCのWASD、マウスカメラ／解放、地図ホイール／全体表示／地点選択／Escape、会話停止・復帰。

`node tools/check_capital.mjs`, `node tools/check_capital_research.mjs`, `node tools/check_boat_caerith.mjs` : 既存の区画進行・資料／portrait構造・舟航路と安全境界。

`node tools/capital-save-compat.cjs` : 旧保存と新規保存の実際の再読み込み、人物名／会話記憶／Journal／Thread／舟位置互換。

`node tools/mobile-scroll-recovery.cjs` : 320pxでのnative touchによるJournal／資料スクロール、文章の選択可能状態、visibilitychange復帰、右カメラpointerの画面回転時解除、素早いdrag→pinchと指の同時解放、画面キャプチャ。

`node tools/capital-portraits.cjs` : 14人 × PC／390px × 人間／猫 × 再会話、夜間画像、未設定／失敗fallback、旧地域8人、保存再読み込み・地域再表示。

`node tools/capital-research-ui.cjs` : 8室 × 6天候 × 4時間帯、庭の実歩行、Journalリンク、資料比較の390px表示。

結果は実機確認とは異なる。Chromium、responsive viewport、touch/pointerシミュレーション、ソフトウェアWebGLによる検証である。

## ユーザー実機確認待ち

実iPhone Safari / Android、OSコピー・辞書メニュー、戻る端swipe、通知／アプリ切替、Dynamic Island・ホームインジケータ、実GPU・スピーカーは未確認。CSSとイベント対策は実装したが、実機での動作を保証したという意味ではない。

以下を **OK / NG / 気になる** で返してください。NGの場合は端末名、OS／ブラウザ、縦横、場所、操作手順を添えると切り分けやすいです。

|番号|実機チェック|
|---|---|
|1|左下を触って歩く。離すと停止する|
|2|指を円状に倒し、斜め・ゆっくり・通常速度で動く|
|3|1秒／5秒長押ししてコピー・辞書・選択が出ない|
|4|左で移動しながら右でカメラ。片方を離しても他方は続く|
|5|猫に切替、移動しながら右のジャンプを押す|
|6|World Mapを開くと移動が止まる|
|7|ゆっくり／素早く1倍→3倍→1倍。指を1本ずつ／同時に離す|
|8|拡大後にドラッグ。地図が完全に外へ消えない|
|9|全体表示で倍率・位置が戻る|
|10|地図を閉じて歩き、再表示すると全体表示になる|
|11|Caer Veyra City Mapでも7〜10を行う|
|12|Journal・資料・比較の縦スクロール。横溢れと裏の移動がない|
|13|会話・portraitのスクロール、閉じた後の歩行|
|14|縦→横→縦、通知／アプリ切替後に入力が残らない|
|15|舟に乗って前後・旋回。指離し、地図表示、下船後に正常復帰|

## 回復と残課題

地図は全体表示、閉じる、再表示、画面回転で復帰可能。入力は指離し／cancel／フォーカス喪失／モーダル／モード変更で解除する。OSからpointercancelが届かない異常やSafari固有の挙動は実機二重チェックで確認する。舟の自由カメラ、新しいゲーム機能、保存形式の変更は今回対象外。
