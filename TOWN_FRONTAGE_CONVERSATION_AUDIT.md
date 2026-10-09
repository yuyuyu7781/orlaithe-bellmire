# 街並み・室内会話監査

対象: Lunmere / Caer Veyra 5区画。Bellmire の建物配置は変更しない。
基準 main: `5e9bdea6019cb4d70e27ed4056ee5f771eb710a9`。

## 建物の正面

従来は全建物の入口・主窓を world +Z に生成し、屋根も同じ方向だった。
`town-frontage.js` は最寄りの通りの線分へ正面を向ける。正面の local axis は +Z。
90度単位の回転で道路に正対する。乱数は使わない。横向き時は local 幅・奥行きを
交換し、建物中心・敷地・外壁の world footprint と既存 collision を維持する。
屋根、窓、扉、庇、入口の interaction point / approach / normal は同じ基準で生成する。

| 対象 | 正面の基準 |
| --- | --- |
| Lunmere | 主通りと宿・店の連絡通り。敷地を横切る線分は候補から除外。舟小屋は水辺側、住宅は近い通り側 |
| Lower Ward | 市場へ通じる交差街路。左右の建物は道路へ向かい合う |
| Canal Ward | 住宅・店は街路。倉庫・水門施設は運河軸の作業面 |
| Civic Ward | 広場につながる交差街路と公共施設の正面 |
| Scholar Heights | 既存高台道・中央の通行動線。階段と建物中心は維持 |
| Old Quarter | 既存街路へ正面を合わせる。旧壁・アーチ・建物配置は維持し、街区を作り直さない |

宿・食堂は大きめの窓、行政・学術施設は縦長窓、倉庫は少ない窓。
一部の建物に側面窓を加える。全建物を同じ窓パターンにしない。
Lunmere の住民待機点は入口 normal / tangent 基準に補正。
舟小屋からの住宅経路は湖に入らず、乾いた側面を回る。
既存 save format、人物設定、portrait、進行条件、室内構成は変更しない。

## 室内会話

原因: `shop-system.js` の workstation 移動と待機時間更新が会話中も続いていた。
近距離 .65m 未満の停止だけでは通常会話距離の移動を防げなかった。
会話開始時に室内対象の world position と rotation を保存し、会話中は
待機時間・仕事移動・再接地を停止する。NPC を player separation で押し出さない。
会話終了後は .6秒以上待ち、既存の低速の仕事移動へ復帰。退出時もロックを破棄する。
屋外の移動処理は変更しない。会話中の player 入力停止は既存 modal 基盤を維持する。

## 自動・シミュレーション検証

- `tools/town-frontage-conversation.cjs`: 6地区の正面に複数方向があること、26入口で実 E 入室。
  14室 × 4距離/向き × PC・touch = 112会話。6秒相当更新中の NPC world position 差は全件0。
  会話後 .2秒の急発進なし。
  対象: Bellmire 宿・パン屋・古書店・星図施設、Lunmere 宿・店、王都の宿・公文書館・記録院・鐘楼・天文台・地図庫・ヴァル工房・水門管理室。
  雨の Bellmire 舟職人はテスト fixture で宿への到着済み状態にする。実移動の速度は変更しない。
- `tools/town-street-walk.cjs`: 6地区の主要道を実キーボード入力で歩行。昼夜の引き視点を撮影して確認。
- `tools/capital-path-audit.cjs`: 王都 NPC 経路 5,390点、衝突不正0。
- `tools/capital-cats.cjs`: 26猫経路・11発見、猫専用制限を確認。
- `tools/npc-placement-audit.cjs`: 115 schedule、24主要NPCの重複・配置、31室の可視性と会話可否、Lunmere女将24天候/時間条件、保存再読込。
- `tools/capital-save-compat.cjs`: 旧 save / テヴID / 既存 Journal・Thread・舟状態と新規 save。
- `tools/mobile-interaction.cjs`: CDP touch の joystick、カメラ併用、会話 scroll 隔離、猫 jump、舟、map、modal 入力停止。
- `tools/mobile-pc-regression.cjs`: PC歩行・マウス・地図・会話と入力復帰。

Chromium + software WebGL と responsive/touch simulation による検証。
実 iPhone / Android、実 GPU での見え方と操作はユーザー実機確認待ち。
入口を変えた施設、ミラ/マレンの宿で正面・斜め・近距離から話しかけて二重確認する。

## 変更ファイル

`town-frontage.js`, `lunmere.js`, `caer-veyra.js`, `shop-system.js`, `index.html`、
上記追加テスト2本、`tools/npc-placement-audit.cjs`（全区画を実際に開放する fixture の修正）、本書。
