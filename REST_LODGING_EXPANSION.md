# 休息拠点・宿泊体験の拡張

基準main: `4dd943d89a0e4259c6a7b8ae9532167148183f8d`。
環境設定・save version・既存人物のportrait・主要物語・王都解放条件は変更しない。

## 拠点

| 場所 / ID | 用途と設備 | 人物 |
| --- | --- | --- |
| 中央区「朝鐘の宿」 / cv-civic-inn | 受付、小食堂、共同机、荷物置き、掲示板、客室2床。手続き客の実用的で静かな宿 | テッサ / cvTessa。事務的で親切、朝の書類準備に詳しい |
| 高台学術区「高台の共同下宿」 / cv-scholar-house | 共有食堂、大きな机、小書棚、受付、長期・短期の寝床、観測テラス、夜食、測量棒・外套・書きかけの紙、ランプ | アヴェン / cvAven。共同生活を支える主人。イセル / cvIsel。旅して比較する学者 |
| Violet Mire「湿地作業者の休息小屋」 / mire-rest | 既存作業小屋を再利用。簡易寝床・湯・採集籠・補修具・荷物置き | 新しい宿主なし。リスとオーウェンの作業小屋の用途に接続 |
| Caerith「湖上作業者の休憩所」 / caerith-rest | 船着場に近い小規模な屋根・舟道具・荷物置き・簡易寝床。正式宿ではない | 常駐NPCなし |

既存 Bellmire / Lunmere / ミラの宿は維持。
街道旅籠は今回は追加しない。4拠点追加で休息先を増やし、街道の施設密度を維持する。
Nine Stones / Drowned Way / The Ring / Hollow Crown に宿は追加しない。

## 夜と人物

テッサとアヴェンは営業中の室内にいて、受付・共同机側を低速で移動する。
同じ受付位置で重ならないよう、アヴェンとイセルには個別の位置・仕事動線を持たせる。
新人物は準主要として登録。既存主要14人の基本設定・正式portraitはそのまま。
新3人は既存portrait fallbackと人間/猫会話・会話記憶を利用する。

イセルは39歳の旅の学者。数週間以上下宿し、古道・方位・地域の比較を行う。
昼・朝は会えない。晴れの夕方もまだ外出中。夜は帰るが、7日周期の観測日は
晴れなら戻らない。雨・停電では夕方から在宿し、夜も会える。
天候 `night` でも昼のperiodには登場させない。時刻は既存4periodを使い、
新しい時刻シミュレーションやリアルタイム期限は作らない。

Nine Stones: 円形自体は珍しくない / 配置と間隔を比較。
The Ring: 用途より輪の形が残る可能性。
Hollow Crown: 地図の空白は何もないこととは限らない。
進行は既存discoveriesと会話回数を参照する。真相・フィンの正体・記録欠落の原因は説明しない。
セレナの天文学、ユリオの地図、ノアの研究補佐とは違い、現地を歩いて比較する役割。
フィンとの新しい特別な関係・重要イベントは作らない。

日替わり客は日付から決定的に選ぶ。中央区は地方役人・商人・申請の職人・市民・書記志望。
学術区は学生・測量師・教師・観測者・地図写し・記録者。
中央区: 昼2〜4人、夜2人。学術区: 昼1人、夜2〜4人。
席に着く人と立って待つ人を混ぜ、短い生活会話を持たせる。
一般客の会話は調べる/声をかける軽量カードで、Journalに人物記録を大量追加しない。
姿・会話の組合せは日替わりだが、全員に長距離pathfindingは割り当てない。

## 宿泊・安全・保存

既存「翌朝まで休む」UIを再利用。寝床は人間のみ。猫は入室・低い寝床脇の布の探索ができる。
通常宿と下宿は宿泊、作業小屋は簡易寝床で朝を待つ。表示文と朝の記録を分ける。
HP・通貨systemはないため、回復数値や新しい料金systemは導入しない。
既存dayAdvanceで翌朝へ進み、既存7日周期・季節・水位の安全処理を継承。
確認dialogは移動入力を停止。休息開始時にinspectionを閉じ、対象寝床が現在室内のものか確認。
猫や別の室内の古いtargetからの休息は拒否。安全なwake地点を検査して移動する。

発見・宿泊は既存discoveriesの `lodging:<id>` に記録。
イセルの初会話は人物Journalへ一度記録。会話段階は既存memoriesを利用する。
客のseedは保存済みcurrentDayから導くので、save schemaに新項目は不要。
発見した中央区/学術区宿は都市図の区画情報に「休息」として表示。未発見宿情報は出さない。
World MapやWorld Graphの大改修・未探索地域の暴露は行わない。

王都の新施設は既存streetFrontageで入口・窓・庇・interaction pointを連動。
湿地は乾いた作業小屋側、Caerithは船着場側の安全な接近位置。
新室内の中央通路・入口に文字面や家具を置かない。
新人物は既存conversation lockを継承し、会話中の仕事移動を停止する。

## 性能と検証

室内は入室時にlazy生成、退出後は非表示。客は各宿最大4人、現在の室内のみ描画。
増加した常設人物は3人。一般客には世界全体のschedule entityを作らない。
各新室内はambient light 1個、追加point lightなし。照明はemissive材を再利用。
書籍は束・棚として表現し、大量の本meshや高負荷water shaderを追加しない。

- `tools/lodging-expansion.cjs`: PC1280×800 / touch390×844、4拠点×2で8回の実入力入室、宿泊・日付更新・安全な退出・猫探索。
  新人物3人×4方向/距離×PC/touch=24会話で位置差0。
  30日×朝昼夕夜×晴雨×2宿=480状態で客の入替・イセル在宿条件を確認。
  Bellmireのみ / Lunmere到達 / 王都到達 / 全区画 / 最新相当の5保存scopeを既存validator経由で確認。
  実際の保存再読込で日付・発見・会話記憶を確認。
- `tools/lodging-night-dialogue.cjs`: イセルの3地域反応・猫への知識流出なし、390px実タップ会話とportrait fallback、観測テラスまで実歩行。
- `tools/interior-entry-view.cjs`: 35室×PC/touch=70入室視界検査、旧ミラ宿の会話・宿泊、全室退出。
- `tools/npc-placement-audit.cjs`: 118 scheduled、27 named actorsが27個の一意entity、配置不正0。Lunmere女将24時間/天候条件、35室の可視性/会話所有、再読込。
- `tools/capital-path-audit.cjs`: 5,673経路点、衝突不正0。
- `tools/capital-cats.cjs`: 26既存猫経路・11発見と人間排除。
- `tools/capital-save-compat.cjs`: v1旧保存、旧テヴIDの記憶・Journal、既存Thread/舟状態・新規reset。
- `tools/mobile-pc-regression.cjs`: PC WASD・マウスカメラ・地図・会話と復帰。
- `tools/town-frontage-conversation.cjs`: 既存14室112会話の位置固定と、新旧入口の実入室。

自動検証は Chromium + software WebGL + responsive/touch simulation。
実iPhone/Android・実GPU・実スピーカーはユーザー実機確認待ち。
物理的な30日間の手動プレイではなく、高速状態シミュレーションと主要操作の実入力を組み合わせた検証。

## 変更ファイル

新規: `lodging-data.js`, `lodging-interiors.js`, `lodging-shelters.js`,
`tools/lodging-expansion.cjs`, `tools/lodging-night-dialogue.cjs`, 本書。
既存: `caer-veyra-data.js`, `caer-veyra-interiors.js`, `caer-veyra.js`,
`capital-city-map.js`, `shop-system.js`, `stay-ui.js`, `index.html`、
`capital-research.js`（王都module参照URLのみ）。

残課題: 実機の操作/照明確認。街道旅籠、通貨/料金/数値回復、一般客の個別長距離歩行は追加していない。

王都の描画・都市図・資料機能のmodule参照URLは同じ版に揃える。更新時に新NPCのデータと旧描画moduleが混在するのを防ぎ、同じ地域可否stateを参照する。既存の資料探索回帰テストも実行する。
