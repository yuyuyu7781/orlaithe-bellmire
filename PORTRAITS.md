# Bellmire v12.7 — 会話の肖像

## 再利用したもの

`dialogue-data.js` の5人のid/役割/台詞、通常・微笑み・真剣・夜のportraitフィールド、時間帯と人間/猫の台詞選択を維持。`interaction.js` の距離・視線・遮蔽・E/タップ・閉じる処理は変更しない。3D住民や猫、街、レンダリング設定も変更しない。

## 表示とプロフィール

`portrait-profiles.js` が5人のdisplayName、role、mood、impression、portraitDirection、intro、palette、仮カードの役割印を提供し、既存character.visualProfileがあればそれを優先して統合する。フィンは全体の調和による静かな美しさを制作方向として持ち、特別な効果は使わない。

`portrait-ui.js` はこの情報と選択された画像を受け取るDOM表示部。画像がない間は、配色ごとの水彩洗いを思わせる背景と簡素なSVGの下描きカードを表示。これは完成人物画ではない。画像の読み込み中・失敗時も仮カードを残し、成功時だけ画像へ切り替える。名前・役割・短い導入文・台詞・閉じるを表示する。

`portrait.css` は会話だけの紙色、薄い枠、影、レスポンシブな配置を担当。スマホは肖像とプロフィールを上段、台詞を下段に置く。短い画面ではパネル内をスクロールでき、歩行ボタンを覆いにくい位置に置く。reduced-motion設定では登場アニメーションを止める。画像未設定のカードに最終アートらしい顔を描き込むことはしない。

## 画像の差し替え

既存フィールドの文字列パスも使える。透過画像も紙色の枠に載せられる。

```js
character.portraitDefault = {
  src: './assets/portraits/moira-default.webp',
  alt: 'モイラの水彩肖像',
  objectPosition: '50% 35%',
  fit: 'contain' // 省略時はcover
};
character.portraitNight = './assets/portraits/moira-night.webp';
character.portraitHappy = './assets/portraits/moira-smile.webp';
```

将来の朝・夕・考え中などは、同じ人物に任意の差分定義を足せる。選択順は時間帯×表情、明示的な表情差分、既存夜差分、時間帯の通常差分、通常画像、従来portrait。台詞のexpressionが表示部まで渡る。

```js
character.portraits = {
  expressions: { thinking: './assets/portraits/moira-thinking.webp' },
  periods: {
    morning: { default: './assets/portraits/moira-morning.webp' },
    night: { happy: './assets/portraits/moira-night-smile.webp' }
  }
};
```

画像がなくても朝は少し明るく、夕/夜は薄いランプ色を枠へ加える。昼の画像を夜に使う場合の色調差は控えめ。これらは3Dの天候とは独立している。

## 猫のための余地

現在の「猫プレイヤー→人間5人」の台詞はそのまま。将来の猫NPCは別id/役割/台詞/visualProfile.subjectKind='cat'を持つ対象として同じ表示部を使用でき、猫型の仮カードと簡素な小枠になる。人物のkind='talk'と物のkind='inspect'は従来通り分離する。猫NPCや新しい猫との会話対象は今回は追加しない。

## 検証と残課題

PC/タッチ画面で5人×昼/夜、画像なし・画像あり・破損画像のフォールバック、閉じる、調べるとの切替を確認した。画像ありはテスト用SVGをブラウザで差し込み、製品用の完成画像は追加しない。実際の徒歩接近/Eキー会話、人間歩行、14対象の調査、追跡、カメラ、天候、住民/猫/水車/ケーブルカーのアニメーションとWebGLも確認した。

完成水彩画像、猫NPC会話、会話ログ/分岐は今後の作業。人物データ・選択・DOM表示が分かれているため、画像や差分を足す際に3D街を変更する必要はない。環境設定・依存関係は変更しない。

検証記録: 960×640と390×844で5人×昼/夜、画像表示・未設定・破損データの復帰を確認。360×480で猫NPC用仮カードを使った表示部テストとスクロール/閉じるも成功。完成画像や実際の猫NPCを製品に加えず、ブラウザのテスト用画像・データだけで差し替え経路を確認した。6天候・19カメラ・徒歩会話・14調査対象・追跡・既存アニメーションでもWebGL/ブラウザの実行エラーは出ていない。
