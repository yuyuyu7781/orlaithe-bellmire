# Caer Veyra v52.6 住民配置・室内人物の表示修正

- 王都の住民は初回に現在時刻の目的地へ配置する。未開放区画は、初めて開いた時に配置する。以後の時間変更では通常の徒歩移動を維持する。
- 一般住民の夕方と雨天の行き先を個別の仕事場・自宅前へ分散。仕事場の列の間隔も広げる。出発待ちは個人ごとに0.5〜18.5秒。
- 室内の予定が変わらない人物は、予定更新後も外側のモデルを非表示にする。室内会話と同じ人物モデルを使い、別の人物は生成しない。
- ミラの表示役割を「宿屋兼食堂の主人」に統一。内部ID・画像・保存形式は変更しない。

検証: `tools/capital-population.cjs`、`tools/capital-actor-location.cjs`、`tools/capital-path-audit.cjs`、`tools/check_capital.mjs`、`tools/check_capital_research.mjs`。
Chromium/SwiftShaderで確認。実機スマートフォンは未確認。
