# Caer Veyra 正式portrait対応表

対象14人の元PNGをそのまま登録。内部ID・保存key・schedule・会話記憶は維持し、役割表示とportraitの紹介文を今回の指定へ更新した。Bellmire／Lunmereのportrait設定、portrait UI、環境設定は変更していない。

| 名前 | 内部ID | 役割 | 所属区画 | 元画像 | 登録ファイル | PC focusX / focusY / zoom | スマホ focusX / focusY / zoom |
|---|---|---|---|---|---|---|---|
| セドリック | `cvCedric` | 外門の記録官 | Lower Ward | セドリック.png | `cv-cedric-default.png` | 50 / 27 / 1.02 | 50 / 25 / 1.01 |
| レオン | `cvLeon` | 門の警備・治安担当 | Lower Ward | レオン.png | `cv-leon-default.png` | 49 / 27 / 1.02 | 49 / 25 / 1.01 |
| ミラ | `cvMira` | 宿・食堂の看板娘 | Lower Ward | ミラ.png | `cv-mira-default.png` | 50 / 28 / 1.02 | 50 / 26 / 1.01 |
| ガレン | `cvGaren` | 運河・水門の門番 | Canal Ward | ガレン.png | `cv-garen-default.png` | 48 / 28 / 1.02 | 48 / 26 / 1.01 |
| ソフィア | `cvSophia` | 運河港の女商人・帳簿役 | Canal Ward | ソフィア.png | `cv-sophia-default.png` | 50 / 27 / 1.02 | 50 / 25 / 1.01 |
| エドラス | `cvEdras` | 記録院・公文書館の学者 | Civic Ward | エドラス.png | `cv-edras-default.png` | 51 / 30 / 1.02 | 51 / 28 / 1.01 |
| リュネ | `cvLyune` | アーキビスト | Civic Ward | リュネ.png | `cv-lyune-default.png` | 52 / 20 / 1 | 52 / 18 / 1.00 |
| カシアン | `cvCassian` | 星章の文官 | Civic Ward | カシアン.png | `cv-cassian-default.png` | 50 / 25 / 1.02 | 50 / 23 / 1.01 |
| オルム | `cvOrm` | 鐘楼守・番人 | Civic Ward | オルム.png | `cv-orm-default.png` | 52 / 26 / 1.02 | 52 / 24 / 1.01 |
| セレナ | `cvSerena` | 星読みの学者 | Scholar Heights | セレナ.png | `cv-serena-default.png` | 52 / 28 / 1.02 | 52 / 26 / 1.01 |
| ユリオ | `cvYulio` | 地図学者・測量担当 | Scholar Heights | ユリオ.png | `cv-yulio-default.png` | 48 / 24 / 1.02 | 48 / 22 / 1.01 |
| ノア | `cvNoah` | 学徒・研究者 | Scholar Heights | ノア.png | `cv-noah-default.png` | 53 / 26 / 1.02 | 53 / 24 / 1.01 |
| エルダ | `cvElda` | 旧市街の老婦人 | Old Quarter | エルダ.png | `cv-elda-default.png` | 53 / 31 / 1.02 | 53 / 29 / 1.01 |
| ヴァル | `cvVal` | 石工職人 | Old Quarter | ヴァル.png | `cv-val-default.png` | 49 / 26 / 1.02 | 49 / 24 / 1.01 |

登録先は `assets/portraits/`。ファイル名だけASCIIへ変更し、画像の再圧縮・縮小・crop・色変更・生成は一切していない。元ZIPと登録PNGのSHA-256一致を確認した。

採用版：セレナ＝金髪＋前髪、ユリオ＝眼鏡あり、ノア＝薄めの髪色、カシアン＝眼鏡なし、リュネ＝今回の短めのまとめ髪の画像。人物名と画像ファイル名はすべて一致していた。

## 設定と互換性

`caer-veyra-portraits.js` が名前・役割・区画・画像path・focus・zoomを管理し、`caer-veyra-data.js` の既存14人物へ適用する。既存 `portraitDefault` / `portraitNight` / `portraits.expressions` へ渡すため、昼夜・表情差分は従来の選択処理を利用する。今回はdefault画像だけを登録し、夜は同じ元画像と既存UIの夜表示を使う。夜／表情の別画像は未提供。

`portraitDefault` がnullの時も読み込み失敗時も従来の仮カードへ戻る。役割・紹介文の更新は表示メタデータであり、人物を新規生成したり、職場・移動AI・3D体格を作り直したりしない。人物位置のv46.6修正を維持する。

## 原画像の同一性

| 登録ファイル | SHA-256 |
|---|---|
| `cv-cedric-default.png` | `98540b80e96bcabf11dfade5e1809126bd219df9c631a285c2b9dddd99892d01` |
| `cv-leon-default.png` | `d02bcba1e0dec7dd9c0e66563699b6890ce187af41411bf643b553204dc9e161` |
| `cv-mira-default.png` | `40651f29a426cd683174aa32eeb8c2231abdb4935c3daf03dec220f81bf566d3` |
| `cv-garen-default.png` | `74aae075fafaca63ada0ede619e343bc23a57e41cba12c4366e61ba322f97014` |
| `cv-sophia-default.png` | `9bb397931804a8df29f7383ceb51091c33ac554ddc730e55b7512bcb0dad4cc8` |
| `cv-edras-default.png` | `759297a7bb4fed7c8e11eb32d0abd37b79201bdfd6ebecf042152afb07ea2118` |
| `cv-lyune-default.png` | `838e45aab8c0a568f2716dd078848479eab089ecbb7182e42ac2fbca97b1c017` |
| `cv-cassian-default.png` | `d8113212c1b0b737834d504cca507e04d39b37d6118260f7e8c2a14f60402fe0` |
| `cv-orm-default.png` | `1ddefe6923ba50e045a6aacee1f5b101821b5a8060a26d562a3ab24ee14802f7` |
| `cv-serena-default.png` | `ddcace950693eb9064cdf82b2f5d35378ce118cde79ca99d74f60c5906cf9d10` |
| `cv-yulio-default.png` | `cca32f98ec1ea84b142d698dcf1069c1f3f5dd44c15cf55e995c3072614a5065` |
| `cv-noah-default.png` | `3bfec717272d709b9763eaeafdff5cebb0c1ee315287f2b889621f87cb3ef16b` |
| `cv-elda-default.png` | `78fd88927bb875caf870ccba6121c1f4956fda0e56a947e592c040c0ebf56a2b` |
| `cv-val-default.png` | `448bce097a7ea21b6c34b6bf84fa0a770faaa9f82dc13394c6c63ebd10b76576` |

## 変更ファイル

- `assets/portraits/cv-*-default.png`：元PNG14枚。
- `caer-veyra-portraits.js`：正式portraitの対応・表示設定。
- `caer-veyra-data.js`：既存人物へ設定を適用。
- `caer-veyra.js` / `index.html`：更新した人物データの読み込みversionを更新。
- `tools/capital-portraits.cjs`：portrait・会話・保存のブラウザ検証。
- `CAER_VEYRA_PORTRAITS.md`：対応表・同一性・検証結果。

## 検証結果

- Chromium / WebGLでPC 1280×800、スマホ幅390×844を確認。14人×2幅×人間／猫×再会話2回＝112表示を検証し、画像読み込み・cover・表示モード・横はみ出しなしを確認。
- 夜の14人もdefault画像を安全に利用。14人それぞれで画像未設定／読み込み失敗の28条件を検証し、仮カードへ戻ることを確認。
- Bellmire5人・Lunmere3人の既存画像表示を確認。王都portrait検証前後で既存Threadが不変、保存→再読み込みで会話記憶・Journal・Threadの内容が一致。
- 地域移動後に14人のportraitを再表示。別の実入力テストで14人全員のEキー会話とフィン–ヴァルの既存遭遇も通過。
- 会話の全組み合わせ検証は人物を明示的に室内へ配置するfixtureと実際の会話handlerを利用。入室で人物を召喚する処理は追加していない。
- 既存 `tools/check_*.mjs` 全件、`git diff --check` 通過。ブラウザ検証中のJavaScriptエラーなし。
- 元ZIPと登録PNGは全14枚バイト一致。実機スマホは未確認。夜／表情の別画像は未提供のため未登録。
