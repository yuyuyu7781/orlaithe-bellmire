# Bellmire v11.5 — 人物と話せる街

以下はv11.5時点の記録です。現在の正式portraitと表記は [PORTRAITS.md](PORTRAITS.md) を参照してください。portrait差分・時間帯台詞とネリッサの接近改善は [ATMOSPHERE.md](ATMOSPHERE.md) を参照してください。

歩行中、住民に近づいて視点を向けると「話す」が表示されます。E キーまたは表示のタップで開始し、閉じるボタン／Escape／対象から離れる／歩行終了で閉じます。会話中も歩行と住民アニメーションは継続します。

## 人物

既存の住民5人を使い、建物や住民の位置・接地・身長・巡回経路を維持しています。

- モイラ（パン屋）: 既存のパン屋付近を歩く住民。
- エヴァン（古書店主）: 古書店前の既存住民。
- ブラン（港の荷運び）: 西桟橋の既存作業者。
- ネリッサ（天球儀店主）: 市場寄りの既存住民。
- フィン（緑の吟遊詩人）: 広場の既存緑衣の住民。緑の外套と小さな木製弦楽器を追加し、継続登場の人物として識別します。

各人物には短い日常の台詞を2つ用意し、話しかけるたびに順番に表示します。九・鐘・星・円・水のモチーフを控えめに含め、核心設定を説明しません。

## 構造

- `dialogue-data.js`: 安定した id、名前、役割、portrait、台詞、吟遊詩人の人物像。
- `dialogue.js`: 既存住民への対象登録、会話表示、portrait 領域、吟遊詩人の小物。
- `interaction.js`: 距離・向き・遮蔽による共通の対象選択、E／タップ、共通の小さなパネルと閉じる処理。`inspect` と `talk` は別のハンドラーで処理します。
- 人物へのローカル座標は実際の身長から求め、移動・接地後も追従します。建物越しには選ばれません。

portrait は `null` または `{src:'画像のURL',alt:'人物の説明'}`。未設定・読み込み失敗では控えめなシルエットになり、3D住民には画像を適用しません。

台詞は `lines.human.default` を基本とします。時間帯別は `lines.human.night` / `dawn` など、将来の猫用は `lines.cat.default` などに追加できます。未設定の時間帯・プロフィールは通常台詞に戻ります。今回は猫操作や猫専用台詞、水彩イラスト素材、会話分岐・保存は追加していません。

## v11.5 の確認

Chromium の WebGL で9エリアへキーボード操作で歩き、5人全員への会話開始・名前と台詞・再会話・終了、その後の歩行を確認しました。既存14対象もすべて徒歩で訪れて説明を開閉しました。

スマホ相当の390px幅で、タップによる調べる／話す／閉じる、移動ボタンとの非重複、portrait画像の差し込み、人間／猫・時間帯の台詞選択と未設定時のフォールバックを検査しました。猫用の検査文はテストだけで、製品の猫専用台詞には含めません。

既存1789メッシュの配置・形状・色、地上用品の接地、31人の身長帯、住民・猫の150秒分の接地と建物・小物との交差、19カメラ・天候6種・追跡・水車／住民／猫／ケーブルカーのアニメーションを確認しました。環境設定は変更していません。

## v13.1 interiors and daily places

The same five actors/portraits now use `shop-data.js` schedules and enterable rooms.
Location-specific introductions precede the existing time/actor lines; each
fourth human conversation may use a short `rumorPool` entry. Inspect/enter/exit
remain separate kinds sharing proximity, facing, sight and E/tap handling. See
[INTERIORS.md](INTERIORS.md) for shop hours, walking policies and future hooks.
