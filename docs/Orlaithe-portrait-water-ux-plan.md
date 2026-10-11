# Orlaithe：portrait補完・水位UX 監査と実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. この文書は計画のみ。実装・画像生成・commit・pushは別途の実装指示後に行う。

**Goal:** 既存の人物・会話・save・水位条件を維持し、対話相手の肖像不足と、発見済み水没地域への無駄足を減らす。

**Architecture:** portraitは既存selectPortrait／createPortraitViewを全対話経路で再利用する。水位案内はselectLakeWaterを使う読み取り専用の翌朝シミュレーションから導き、発見済みの地域についてのみ表示する。両案件は独立して実装・受け入れ可能。

**Tech Stack:** 既存ES modules、Three.js、HTML/CSS、Node assert、Playwright Chromium／WebKit。新しいportrait renderer、日付時計、save形式、画像生成システムは作らない。

**Spec:** この文書の監査・推奨仕様・受け入れ条件。今回のユーザー依頼を実装前の仕様として整理した。

**監査基準：** remote main `0da8db5779f97afca87fac369d6ef1c1c3ddbaa2`。GitHub branches/mainで確認し、local HEADとの一致とworking tree cleanを確認した。監査方法はソース、既存データmoduleの実行、assetファイルの存在確認、既存水位関数の読み取り専用試行。今回、新機能のテストPASSや実機での確認を主張しない。

## Global Constraints

- 既存人物ID、interaction ID、地域ID、解放条件、stage条件を変更しない。
- SAVE_KEY=`bellmire.stay.v1`、SAVE_VERSION=1を維持する。新しい予測結果・portrait URL・自動休息進捗をsaveへ保存しない。
- 区画14、王宮内部、Finnの正体、王家の陰謀は未確定・未解放のまま。
- portraitは水彩／絵画調。街と人物モデルは現在の低ポリ3Dのまま。既存22枚のファイル内容・人物名・会話内容をportrait補完のために変更しない。
- normal／low／veryLow／extremeLow、現在の周期、雨による開始条件、同日水位固定を維持する。
- 未発見の地域・隠された入口・The Ring・特殊水位の意味を案内から漏らさない。内部phase名はプレイヤーに表示しない。
- 未再現の問題を広範囲に予防修正しない。既存会話の漏洩候補も失敗テストで確認してから限定修正する。
- 画像生成はこの計画では行わない。実装時も人物設定が未定義の年齢・性別・出自を勝手に確定しない。
- Task 5相当のスマホ実機合否はユーザーが決める。自動検証のみで実機PASSにしない。

## Review Focus

1. visitor-talk／mire-traveler／一般客inspectを通常talkへ置換して記憶やJournalが変わらないか → P2・P3の履歴差分テスト。
2. 同日水位cacheとreload、雨が止んだ日、天候を手動変更した直後を誤って予測しないか → W1のcache・再計算テスト。
3. 今日閉じているだけで、未発見の特別な場所や入口名がDOM／aria／地図に現れないか → W2の非漏洩テスト。
4. 開いたままの地図／宿泊画面が翌朝も古い待ち時間を表示しないか → W2の開閉・更新テスト。
5. 小さいスマホで肖像・待ち日数が切れ、スクロールやカメラ・ジョイスティックに競合しないか → P3・W2・V1の実入力テスト。

---

## 1. portrait：正確な棚卸し

### 集計と必要枚数

| 対象 | 正式portrait | 下描きfallbackのみ | portrait表示未設定 | 数え方 |
|---|---:|---:|---:|---|
| 通常の人物会話 | 22 | 5 | 0 | dialogue.charactersの27人。人間／猫、昼夜でも同一人物は重複計上しない |
| 定期旅人 | 0 | 0 | 3 | visitorPlansの固定plan ID。個人名ではなく既存の役割名で表示 |
| 湿地専用の旅人 | 0 | 0 | 1 | mire:traveler。通常会話一覧に入っていない専用handler |
| 小計：個人として追える対話対象 | **22** | **5** | **4** | **31人、個人用新規9枚** |
| 王都の一般宿泊客 | 0 | 0 | 最大8表示枠 | 2施設×4枠。11役割が日替わりで入れ替わり、固定の11人ではない |

**全対話対象の補完は新規20枚：個人用9枚＋一般客11役割の共通肖像11枚。** 夜／表情差分は新規必須枚数に含めず、今回は作らない。優先着手単位は個人用9枚。一般客の11枚は独立した後続Taskとして切り離せる。一般の群衆モデル全員に固有肖像を作る計画ではない。

「portrait未設定」は肖像表示経路がないもの。「fallbackのみ」は通常会話UIのSVG下描きが既に出るもの。portraitDefault:nullでもselectPortraitが別登録から正式画像を選ぶ場合があるため、フィールドのnull検索だけで分類していない。既存22枚はselectPortraitの返すsrcとファイル存在を確認した。実装時には画像load後のUI状態も検証する。

### 正式portraitがある22人：変更不要

| 地域 | ID・NPC名 |
|---|---|
| Bellmire | baker：モイラ、bookseller：エヴァン、boatworker：ブラン、starmaker：ネリッサ、greenBard：フィン |
| Lunmere | lunHost：マレン、lunBoat：ローワン、lunWatcher：イーラ |
| Caer Veyra・外門区 | cvCedric：セドリック、cvLeon：レオン、cvMira：ミラ |
| Caer Veyra・水路区 | cvGaren：ガレン、cvSophia：ソフィア |
| Caer Veyra・中央区 | cvEdras：エドラス、cvLyune：リュネ、cvCassian：カシアン、cvOrm：オルム |
| Caer Veyra・学術高台 | cvSerena：セレナ、cvYulio：ユリオ、cvNoah：ノア |
| Caer Veyra・旧市街 | cvElda：エルダ、cvVal：ヴァル |

Bellmireの宿・酒場には独立した名前付き宿主／店主のcharacter登録がない。そこへ新しい人物やportraitを補完名目で作らない。宿にいるフィンや旅人は既存の同一IDとして数える。Nine Stones、Lake Lun、Caerith、Drowned Way、The Ring、Hollow Crownには、この監査で追加の独立会話人物登録は見つからない。観察文や休息対象をNPCとして数えない。未実装／未解放の王宮・区画14も対象外。

### 新規個人portrait 9枚

優先度はP1主要、P2高頻度の宿・店、P3物語上重要、P4繰り返し会話する準主要、P5一般を基本とする。既存の中心人物はすでに正式画像があり、不足分に無理にP1を付けない。以下の差別化案は作画提案であり、人物の設定変更ではない。

| NPC名／既存ID | 地域・役割／分類 | 年齢感：確定情報と提案 | 外見の差別化案・注意 | 優先 | 登録先・save／ID影響 |
|---|---|---|---|---|---|
| エステル／cvTessa | 中央区・朝鐘の宿の宿主／fallback | 既存46歳 | 既存灰褐色髪・体幅を維持。受付仕事の布／帳面を小さく。ミラの栗髪・温かい厨房風と区別 | P2 | caer-veyra-portraits.jsにcvTessa。lodgingCharactersにもapplyCapitalPortraitを適用。ID・記憶・schedule不変 |
| アヴェン／cvAven | 学術高台・共同下宿主人／fallback | 既存53歳 | 灰色の髪、控えめな生活感。リュネの資料館風やエルダの老婦人像と区別 | P2 | 同登録にcvAven。名前・roleは現在の値をそのまま。save変更なし |
| イセル／cvIsel | 学術高台・旅の学者／fallback | 既存39歳 | 暗褐色髪、細身、少し旅支度。ユリオの眼鏡／測量像、ノアの若い学生像と区別。秘密の所属や意味を絵に足さない | P3 | 同登録にcvIsel。既存会話・出現時刻・記憶を維持 |
| ニーヴァ／mireGatherer | Violet Mire・湿地の採取人／fallback | 年齢・性別未定義。成人として作画、数値設定は追加しない | 3D側の髪色#6a6255・緑系衣服を参照。籠／草の気配を薄く。イーラの商店主像と区別 | P4 | violet-mire-data.jsの当人portraitDefaultへsrc。既存mireGatherer維持 |
| オーウェン／mireKeeper | Violet Mire・木道の保守人／fallback | 年齢・性別未定義。成人の作画案 | 髪色#4a493e、既存の作業・tools傾向。ヴァルの骨太石工、ガレンの水門管理人と区別 | P4 | 同ファイルの当人portraitDefault。save変更なし |
| 湖からの旅人／lake-traveller | Bellmireへ来る旅人／表示なし | 年齢・性別未定義。成人 | 髪#6c5546、外套#7a766a、小包。フィンの長髪・緑外套・弦楽器と重ねない | P4 | town-calendar.js visitorPlansの既存planへportraitDefault。visitor:lake-travellerの発見／Journalを維持 |
| 布を持ってきた商人／cloth-merchant | Bellmire・市の日の行商／表示なし | 年齢・性別未定義。成人 | 髪#594b3c、外套#6c686e、布／荷物の印象。ソフィアの港の帳簿像と区別 | P5 | 同visitorPlans。visitor:cloth-merchant不変。通常人物のmemoriesへ移さない |
| 舟で来た荷運び人／boat-carrier | Bellmire・港、市、宿、酒場／表示なし | 年齢・性別未定義。成人 | 髪#5a483b、外套#65767a、箱。ブランと同じ顔・ひげ・縄の構図にしない | P5 | 同visitorPlans。visitor:boat-carrier不変 |
| 湿地を通る旅人／mire:traveler | Violet Mire・専用会話／表示なし | 年齢・性別未定義。成人 | 3D髪#7b7462、灰青系衣服、道中の落ち着き。湖の旅人・イセル・フィンと区別 | P5 | violet-mire.jsの当該entryへportraitCharacter。既存interaction／discovery IDのmire:traveler維持 |

新画像の予定ファイルは `cv-tessa-default.png`、`cv-aven-default.png`、`cv-isel-default.png`、`mire-gatherer-default.png`、`mire-keeper-default.png`、`visitor-lake-traveller-default.png`、`visitor-cloth-merchant-default.png`、`visitor-boat-carrier-default.png`、`mire-traveler-default.png`。全て既存assets/portraits配下。既存画像を上書きしない。

### 一般宿泊客：11役割の共通肖像

これらは名前付き人物の追加ではない。NPC名欄には現在表示される役割名を使い、interaction ID `inside:<shop.id>:guest-<0..3>`を維持する。同じ表示枠の顔は日替わりのrole keyに追従させ、古い役割の画像が残らないようにする。年齢・性別は全て未定義。成人の作画提案としてのみ扱う。

| 現在の表示名 | 地域・役割 | 差別化案／似せない相手 | 優先／登録先 |
|---|---|---|---|
| 地方の役人 | 中央区・宿泊客 | 地味な旅装と書類。セドリック／カシアンの正式制服に似せない | P5／lodging-data.jsの既存civicRoles key 0対応 |
| 商人 | 同・宿泊客 | 小さな革袋、抑えた暖色。ソフィア／布の商人と区別 | P5／civic key 1 |
| 建築申請の職人 | 同・宿泊客 | 作業着と丸めた紙。ヴァル／オーウェンの顔・道具構図を避ける | P5／civic key 2 |
| 家系記録を調べる市民 | 同・宿泊客 | 普通の身なり。王族・秘密の紋章を付けない | P5／civic key 3 |
| 書記志望の旅人 | 同・宿泊客 | 控えめな紙入れ。エドラスの成熟した学者像と区別 | P5／civic key 4 |
| 学生 | 学術高台・共同下宿客 | 素朴な学習道具。ノアのくせ毛と同じ顔にしない | P5／scholarRoles key 0 |
| 測量師 | 同・宿泊客 | 旅装と実務道具。ユリオの眼鏡・猫背の組合せを避ける | P5／scholar key 1 |
| 地方の教師 | 同・宿泊客 | 落ち着いた服と小さな本。リュネ／エドラスと区別 | P5／scholar key 2 |
| 観測者 | 同・宿泊客 | 小さな観測記録。セレナの髪型、ネリッサの天体装飾を避ける | P5／scholar key 3 |
| 地図写し | 同・宿泊客 | 紙と細い筆。イセル／ユリオと顔・髪・姿勢を分ける | P5／scholar key 4 |
| 旅の記録者 | 同・宿泊客 | 使用感のある手帳。フィンの緑外套と特別な旅人演出を避ける | P5／scholar key 5 |

予定ファイル：`guest-civic-0..4-default.png`（5枚）、`guest-scholar-0..5-default.png`（6枚）。登録はlodging-data.jsにrole key→既存portraitDefault形式のデータを置き、lodgingGuestsの戻り値で参照する。人物別のsave IDを新設しない。小屋のguestモデルは現在非表示で、客を新設する計画には含めない。

### 再利用する仕組みと変更範囲

既存：dialogue-data.js/selectPortrait → portrait-ui.js/createPortraitView → interaction.js/present(extra)。昼夜／表情欠損時のdefault復帰、画像load失敗時のSVG下描き、portrait-profiles.jsのmobile framing、portrait.cssを使う。

不足：capitalの14枚はapplyCapitalPortraitを通るが、concatされるlodgingCharactersの3人はその経路を通らない。旅人3人と湿地旅人は別handler、一般客はinspect経路で、現在extra肖像がない。

新規：表示経路だけを接続する。visitor-talk／mire-travelerのkind、会話文、発見保存は変えない。一般客entryにoptional `portraitCharacter`を設定し、interaction.presentがextra未指定時だけ既存selectPortrait／createPortraitViewを使用する。dialogue-cardの表示クラスは既存talkまたは肖像extraがある時に付ける。kindをtalkへ改変してJournal hookを変えてはならない。通常会話システムへ旅人を再登録しない。

## 2. 水位：既存／不足／新規

| 項目 | 既存 | 不足／新規 |
|---|---|---|
| 水位決定 | lake-water-level.js/selectLakeWater、日単位cache、2周期 | 次の通行可能朝を読み取り専用で計算する関数がない |
| 旧道 | veryLow／extremeLowで歩行可能。lowは石が見えても通れない | 見えた状態と歩ける状態の説明を分ける |
| 世界地図 | worldSnapshotで既知／噂／未発見、open／submergedを判定。再訪可否も連動 | 既知の選択地点に現在状態と待ち日数を添える |
| 生活会話 | Lunmere3人に岸・水の話。フィン等に既存の観察反応 | ローワンの既存水位話枠へ、発見済み旧道の具体的な見通しを添える |
| 宿泊 | stay-ui.js/restで一泊、翌朝、安全な立ち位置、Journal、flush | 宿泊確認画面に既知の旧道の待ち時間を補足。連泊自動化は初回に入れない |
| Journal | 過去の観察・旅の履歴・地図リンクがある | 現況を過去の記録へ上書きしない。初回は動的な水位欄を追加しない |
| 水辺観察 | 古い石段／岸の跡、既存resolver | 新ターゲット・隠し入口を増やさない。初回は説明の重複を避け追加しない |

### 水位決定ロジック：最新mainでの事実

1. offsetはnormal=0、low=-0.12、veryLow=-0.5、extremeLow=-1.25。同じ日付で有効なphaseが保存されていればその値を返す。日中に雨へ変更しても、即座に歩行者の足元を水没させない。
2. 普通の低水位周期の開始：Day≥4、drowned:rumorまたはdrowned:entryが存在し、その発見dayが現在dayより前、weather≠rain。初めて満たした日をfirstLowDayへ設定する。
3. firstLowDayから7日周期。差分mod7が0・1ならveryLow、2ならlow、3・4・5・6ならnormal。未開始でもday mod7=3の時だけlowになり得る。lowだけで旧道は通れない。
4. 特殊周期の開始：Day≥7、drowned:walk、drowned:rumor、caerith:foundation、nine:stone-3/5/9のどれか、非rain。満たした日をfirstRingDayへ設定する。
5. firstRingDay以後は、現行の全季節とも10日周期・2日間extremeLow。普通の周期より優先する。古いtestのログ文言には「14-day recurrence」とあるが、現行の実際の式は10日。ログ名から周期を決めない。
6. 一度両周期の起点が設定されると、雨はそれを消さない。同日のcacheも維持される。季節profileは現在4季節とも同じ値。
7. createLakeWaterLevel.applyがtownLife.onChangeと初期化で再計算し、waterLevelStateを既存saveへ保存する。phaseが変わる時だけsurface・歩行判定・boatなどへ通知する。

読み取り専用試行例：firstLowDay=4ならDay4/5=veryLow、6=low、7〜10=normal、11=veryLow。Day6のlowは「下がりつつ」ではなく低水位の後の戻りなので、「low→もうすぐ下がる」と固定対応させない。未起点・雨・発見済みの試行ではDay5〜19までfirstLowDay=null、旧道の通行可能日が出なかった。

### 地域・船・履歴への影響

- Drowned Way：drownedHeightの歩行床はveryLow／extremeLow限定。低水位時は舟の接近を既存drownedBoatBlockedで制限。entry観察はlowでも可能。drowned:walkでtravelHistoryへ記録。
- The Ring：ringOpenはextremeLowのみ。案内はring:visitまたは既存worldSnapshotの発見済み判定の時に限る。水位条件や物理床は変えない。
- Hollow Crown：既存の解放状態に加えringOpenが必要。発見済みでも条件が閉じれば通れない。初回案内で隠し入口の場所や解放方法を新たに説明しない。
- Violet Mire：本体は発見・解放後も陸地として残る。Hollow Crown側の連絡路はextremeLow依存。Caer Veyra方面の街道解放は既存条件のまま。湿地全体が水位だけで閉じるとは案内しない。
- Lake Lun／Lunmere／Caerith：同じoffsetで水面・痕跡・舟を更新。Caerithの陸地や通常の岸を水位待ち地域として扱わない。boatは既存のsurface height／航行不可領域／dock更新を維持。
- index.htmlのbeforeChangeは水没床にいる歩行者の退避、深部からの退避、危険水域のboat cancelを担当。予測はこの処理を呼ばず、scene・現在のglobal phase・boat位置を動かさない。
- worldSnapshotは発見と利用可能性を別判定する。案内を見たことだけでdiscoveries／travelHistoryに地域を追加しない。噂だけは発見済みではない。

### 現在日から次の通行可能朝を計算する設計

既存lake-water-level.jsへ純粋関数を追加する案：

`forecastKnownWaterAccess(data, regionId, {maxNights=14}={}) -> null | {day, stateText, walkableToday, nightsToOpen:number|null, forecastText, assumption:'current-weather', evaluatedThroughDay}`

- 対象は発見済みdrowned-way、発見済みthe-ring、必要なら発見済みhollow-crownの既知ルート。判定にはworldSnapshot.discovered／regionVisitedと既存discoveryを使い、噂だけはnull。循環importを避け、known判定・条件評価は呼び出し側または軽量な既存progression predicatesで行う。world-graphから水位moduleへの新しい循環依存を作らない。
- dataをcloneし、まず現在のselectLakeWaterで同日cacheを含む状態を得る。既存evaluateConditions('low-water'/'extreme-water'/'descent', clone)等の現在の通行条件で判定する。Hollow Crownの非水位条件は既存crown:entranceであり、これが無い場合は水位だけで開通する日数を返さない。crown-observationは入口を発見する際の条件で、発見後の毎回の通行条件へ追加しない。今日通れるならnightsToOpen=0。
- 翌日から一日ずつcurrentDayとdayStartを増やし、dayPhase=morningとする。現行dayAdvance同様、weather・season・discoveriesは現時点の値を維持する。各朝selectLakeWaterの戻り値をclone.waterLevelStateへ入れて起点を次朝へ持ち越し、同じ条件で最初に開く朝を探す。
- 直接mod7だけで予測しない。extremeLow優先・雨・未起点・同日cacheを含め、実際の関数を使う。firstRingDayや必要な未発見条件はUIへ返さない。
- 上限は14泊、またはDay9999の少ない方。見通しが出ない時はnull。14を固定の「14泊待てば必ず通れる」と表示しない。未起点の雨や条件不足では日数を作らない。
- 現行の宿泊は天候を自動抽選しない。「今の天気が続けば」という前提付きで見通しを出し、天候・季節・discoveryの変更時に再計算する。将来天候抽選が実装された場合には予測仕様を改める。今回は自然な天候を装うための新しい天候周期を作らない。
- 予測結果は一切保存しない。入力data、現在のwater phase、記憶、events、Journal、sceneが不変であることをテストする。

### 表示内容と場所：冗長にしない推奨仕様

| 状態 | 発見済みDrowned Wayの文案 | 未発見／噂だけ |
|---|---|---|
| normal | 「旧道は水の下。今は岸で待つ方がよさそう。」 | 日数・旧道名の新規案内なし |
| low | 「岸の石は少し見える。旧道を歩くには、まだ水が高い。」 | 既存の噂・観察だけを維持 |
| veryLow | 「旧道が通れそう。濡れた石には気をつけて。」 | 新しい地域案内を先出ししない |
| extremeLow | 「かなり水が引いている。前に歩いた旧道は通れそう。」 | The Ring、特殊な場所、入口、内部phaseを出さない |
| 次の朝まで1〜2泊 | 「今の天気が続けば、あと1泊ほどで旧道を歩けそう。」など実計算値 | 表示なし |
| 3泊以上 | 「あと5泊ほど待つことになりそう。」など実計算値 | 表示なし |
| 予測不能 | 「雨が続く間は、旧道を歩ける朝の見通しは立ちにくい。」等、条件に合う安全な文 | 特殊条件や未発見の石・場所は説明しない |

現在stateTextとforecastTextを分離する。「下がりつつ」はphaseの名前だけで判断しない。今通れるなら待ち日数より現在の可否を優先。The Ring発見済みならその既知地点について別の状態を示せるが、Drowned Wayの文に奥の未発見地点を混ぜない。

**主な生活案内：ローワンの既存水位会話枠。** 人間の会話で既存index%3枠へ具体的な見通しを差し込み、鐘の当夜反応など既存優先順を維持する。猫の認識を数値予報へ勝手に置き換えない。マレン／イーラへ同じ日数を重ねない。

**実用の再確認：世界地図の選択した既知地点の詳細。** 全地域一覧に予報一覧は出さない。既存の「今は水の下」を、選択地点だけ現在状態＋待ち日数へ補足し、pinch／再訪ボタン／hidden判定を再実装しない。

**宿泊時：通常の一泊確認文の下に短い補足。** 湖沿いの宿・休息地点では待ち日数を示す。初回の表示対象はlunmere-data.jsのlun-inn（柳の宿、restable:true）とlodging-shelters.jsのcaerith-rest（湖上作業者の休憩所、restable:true、restType:shelter）に限定する。Bellmireなど遠い宿への日数案内は初回に広げず、施設IDを新設しない。通常confirmRestの挙動を変えない。今日通れる時は「今日は旧道が通れそうです。」とし、泊まればまた閉じる場合は翌朝の状態も誤解なく添える。

**Journal：初回は変更しない。** 過去の日付の記録は歴史として残し、既存「地図で見る」から現況へつなぐ。同じ予報を毎日appendしない。岸の観察文にも同じ日数を重ねない。

### 既存会話のネタバレ候補

the-ring.js/connectTheRingは、found()だけでなくringOpen()かつLunmere人物の時にも、輪の石や大きな円の既存台詞を返す条件を持つ。したがって「新しい案内だけを隠す」では未発見The Ringの非漏洩受け入れを満たさない可能性がある。

これは今回コードを変更していない。W2でring未発見・extremeLow・Lunmereの該当会話turnを実行する失敗テストを先に作る。未発見の輪への明示的言及が再現した場合のみ、その既存台詞のgateを発見済み条件へ限定し、既知の岸・旧道についての生活文へ戻す。The Ringの出現条件や物語設定を変更しない。

### 宿泊QoL：初回は案内のみ、連泊は見送る

現行restは一泊ごとにtownLife.dayAdvance→翌朝のlistener→shopSystem更新→安全位置→lodging発見／朝のJournal→flushを行う。dayAdvanceはDay上限9999、一日増分、morningへの変更であり、天候は維持される。

単なるcurrentDay+=NやdayAdvanceをN回だけ呼ぶ実装は採用しない。朝をN回進めるだけでも、夜の10秒delayで発生するstory-thread.jsの鐘や、時間帯依存の会話・客・滞在中の経過時間は同等とは言えない。現時点では連泊によって全イベントを飛ばさない安全な24時間simulation APIはない。

後続で検討する場合は、既存一泊処理を一朝単位で再利用し、各泊のlistener・NPC・日替わり客・event settle・Journal・flushを逐次実行する。毎朝利用者へ戻し、現在状態と見通しを再評価、キャンセル・重要な夜イベントの機会を尊重する。隠しイベントを自動実行／既読化しない。予報がnull・すでに通れる・Day上限なら自動待機を出さない。

それでも「全ての時刻のイベントを飛ばさない」を証明できなければ、連泊Taskを実装しない。今回の推奨リリースは、1泊ずつ判断できる案内だけでストレスを減らす構成。

## 3. save互換・依存関係

- portraitデータは表示設定のみ。人物memories whitelistに新IDを足さず、既存27人・visitor発見・mire:traveler・guest枠を維持する。会話kind・visit回数・人物名を改変しない。
- 水位は既存waterLevelStateのday／phase／firstLowDay／firstRingDayを使う。古いv1でfieldが無ければvalidateStayの既存default→selectLakeWater初期計算に従う。同日有効cacheは尊重。不正値・新しいversion・storage拒否も既存fallbackを維持する。
- portrait案は画像・character登録・portrait-ui／interactionの表示に依存。水位案はstay.data→selectLakeWater／既存condition→forecast→地図／宿／ローワンに依存。2本の間に実装依存はない。
- Journalは既存記録と地図リンクを保持。旅行履歴は実際の移動時だけ。予報閲覧で新しい地域を訪問済みにしない。
- townLife、resident-day、town-events、visitor schedules、interior-life、capitalLife、storyThread、boatの時間・更新処理を初回水位案内で改造しない。

## 4. 実装Task分割

### P1：通常会話5人のportrait補完

**Files:** assets/portraitsの5枚、caer-veyra-portraits.js、caer-veyra-data.js、violet-mire-data.js。Test：新規tools/check_portrait_inventory.mjs、既存tools/capital-portraits.cjs／check_scene_data.mjs／check_portrait_framing.mjs。

**Interfaces:** 既存selectPortrait(character,{expression,time})→{src,alt,framing}、applyCapitalPortrait(character)を使用。新規rendererは出さない。後続Taskには同じ画像選択契約を渡す。

- [ ] 不足5人が正式画像を返し、既存22人のsrc／asset hash／name／role／IDが変わらないテストを作る。現状は不足5人のassertだけがFAILになることを確認。
- [ ] 5人の作画briefを確認した後、必要画像を作成・配置する。3人の年齢は既存値、湿地2人の未定義属性は新設定として追加しない。
- [ ] capitalPortraitsへ3人、lodgingCharacters.map(applyCapitalPortrait)、湿地2人のportraitDefaultを最小追加。
- [ ] Run：`node tools/check_portrait_inventory.mjs`、`node tools/check_scene_data.mjs`、`node tools/check_portrait_framing.mjs`、ブラウザで`node tools/capital-portraits.cjs`。全対象srcとload成功、欠損画像時fallback、昼夜・人猫を確認。
- [ ] P1単独レビュー・commit。通常会話台詞・人物設定差分がないことを確認。

### P2：旅人4人の表示接続

**Files:** town-calendar.js、visitors.js、violet-mire.js、interaction.js、必要なportrait-profiles.jsの表示profile、assets/portraitsの4枚。Test：tools/portrait-completion.cjs。

**Interfaces:** 既存plan.id／mire:travelerにportraitDefaultまたはoptional entry.portraitCharacterを付ける。present(entry,{extra})とcreatePortraitViewを使用。entry kind／保存hookを変更しない。

- [ ] 4人の既存entryで肖像loadが成功する、現状は肖像なしでFAILになるテストを作る。初回／再会、人猫、visitorの市の日・旅の日、湿地訪問済みfixtureを分ける。
- [ ] 作画brief確認後に4枚を追加。visitor handlerと湿地専用handlerへ既存portrait viewを渡し、kindを保持して表示classだけ対応。
- [ ] 会話文、visitor:<id>／met:visitor:<id>／mire:traveler、Journal、再会台詞、visit回数に画像追加以外の差がないことをassert。
- [ ] Run：`node tools/portrait-completion.cjs`と既存`node tools/check_town_calendar.mjs`。既存人物への重複登録がゼロ、reload後のID不変を確認。
- [ ] P2単独レビュー・commit。P1と独立して実行可能。

### P3：一般客11役割の共有portrait

**Files:** lodging-data.js、lodging-interiors.js、interaction.js、assets/portraitsの11枚。Test：tools/portrait-completion.cjsのguest matrix。

**Interfaces:** lodgingGuests(id,state)の現在のkey／role／textに表示用portraitだけを追加。guest entry.portraitCharacter→presentの既存view。P2で表示class接続が完了していれば再利用し、未完了なら同じ共通変更をここで一度だけ行う。

- [ ] civic5・scholar6の全role、表示枠0..3、同じslotの翌日role変更で正しいsrcになるテストを先に書く。一般客の画像なしがFAILになることを確認。
- [ ] 11枚を作画brief確認後に追加。role keyに対応させ、人物名やsave IDを増やさない。
- [ ] inspect kind、声かけのtext、日替わりguest count、夜3分後の静かな状態、会話中に人物が消えない既存仕様を維持。
- [ ] Run：`node tools/portrait-completion.cjs`、`node tools/lodging-life-audit.cjs`、`node tools/lodging-night-dialogue.cjs`。画像load失敗でも文章を読めることをassert。
- [ ] P3レビュー・commit。画像20枚一括の公開が重い場合も、このTaskだけ後続にできる。

### W1：純粋な既知水位予測

**Files:** lake-water-level.js。Test：新規tools/check_water_advice.mjs、既存tools/check_drowned_way.mjs／check_ring.mjs／check_stay_state.mjs。

**Interfaces:** 前述forecastKnownWaterAccess。入力は検証済みstay.data、出力は既知地域向けの状態・日数・自然文だけ。world-graphの公開判定を改変しない。

- [ ] 4phase、未発見／噂だけnull、Drowned発見済み、Ring未／既発見、同日cache、雨・未起点、両起点、旧save、Day9999のテストを書く。新関数なしでFAILを確認。
- [ ] 具体例assert：起点4・Day6→旧道5泊、Day10→1泊、Day11→0泊。特殊周期で普通の周期より早く旧道が開く例もselectLakeWater逐次結果と一致させる。未起点雨は有限日数を返さない。
- [ ] selectLakeWaterの逐次呼び出しと既存条件評価だけで実装。deep input equality、global phase、save書き込みゼロ、先の日付でcache／起点を持ち越すことを確認。
- [ ] Run：`node tools/check_water_advice.mjs`、`node tools/check_drowned_way.mjs`、`node tools/check_ring.mjs`、`node tools/check_stay_state.mjs`。複数日・4季節で「予測日の通常1泊シミュレーションが実際に通行可能」をoracleにする。
- [ ] W1レビュー・commit。portrait Tasksに依存しない。

### W2：既存生活UIへ接続・非漏洩

**Files:** world-map.js、drowned-way.js、stay-ui.js、index.htmlの依存注入。再現した場合のみthe-ring.jsの既存会話gate。Test：新規tools/water-advice-browser.cjs。

**Interfaces:** W1の結果を地図選択詳細、ローワンの既存水位turn、対象宿泊dialogへ表示。宿泊handler・日付処理は既存のまま。

- [ ] 未発見／噂だけ／Drownedのみ既知／Ring既知のfixtures、全phaseでDOM・aria・会話・map選択詳細・Journalをassertする。新日数案内なしのFAILを先に確認。
- [ ] 未発見Ring・extremeLow・Lunmere該当turnで既存「輪の石／大きな円」が出ないテストを実行。再現した台詞gateだけを限定修正。
- [ ] 地図hidden条件と再訪条件を維持し、現在状態＋実計算日数を既知詳細へ出す。UI全域へ同じ予報を重複掲示しない。
- [ ] 宿泊fixtureのshop.id／restableを確認し、通常一泊dialogへ補足を追加。今日開いて明朝閉じる例、一泊／手動複数泊、開いたまま天候変更・reloadを検証する。
- [ ] ローワンの会話に自然文を接続。既存優先の鐘の反応、猫の台詞、未発見の噂turnが変わらないことを確認。現在Journalは書き換えない。
- [ ] Run：`node tools/water-advice-browser.cjs`、`node tools/mobile-interaction.cjs`、`node tools/mobile-pc-regression.cjs`、`node tools/mobile-scroll-recovery.cjs`。world map pinch、modal停止、宿泊後joystick＋左右カメラを実入力で確認。
- [ ] W2レビュー・commit。連泊機能は追加しない。

### V1：全体回帰・スマホ受け入れ

**Files:** 既存CIへ前述テストを追加する計画、検証記録、実機チェックリスト。ゲームの追加変更はしない。

**Interfaces:** P系とW系は別々の合否とcommitを報告。V1は両方を組み合わせた回帰を担当し、片方の未完了で他方を重複実装しない。

- [ ] 既存Node回帰22本、portrait framing／scene、save旧世代・round trip、capital research、water／boat／mire／ring、lodging／schedule／weather／daily events、物理非解放境界を実行。
- [ ] portrait browser matrix：人猫×昼夜×正式／fallback／未設定／画像error。全31個人と11一般役割を確認し、旧22枚のhash不変、ID・台詞・記憶の差分がないことを検証。
- [ ] 水位 browser matrix：4phase×発見状態、1泊／手動複数泊、weather6種類、season4種類、reload、旧save、不正・storage拒否、map／Journal／Lunmere／Caerith／boat、NPC schedule／客／日替わりeventの同日結果を基準と比較。
- [ ] 夜のstoryThreadなど自動で進めていない時刻は、案内導入前と同じ挙動であることを確認し、自動消化・既読化していないことをassert。
- [ ] 390px中心に320／375／430px、横向き、Chromium／WebKitを自動確認。実機は別判定。必要な失敗箇所のみ最小修正し、関連テストを再実行。
- [ ] 最終review、実装指示で認められた時だけcommit／push／公開。確認SHA・対象CI・working treeを記録。実機前は「自動検証済み／実機確認待ち」。

**後続保留Task W3：休息QoL。** 初回リリースには含めない。24時間の時間帯／遅延イベントを保全する契約、通常一泊との比較oracle、途中停止・reload・storage失敗の仕様を別設計で承認した後に検討。今のmainへ単純な連泊loopを追加するTaskは作らない。

## 5. 失敗条件・受け入れ条件

失敗：既存portraitの上書き・重複登録、NPC改名・ID変更、新人物のsave記憶追加、portraitついでの会話改稿、低ポリ3Dの変更、save version変更、別水位周期、架空の日数、lowで通行可能と案内、forecastで現在phaseやdiscoveryを書換え、未発見Ring／入口を先出し、Journalを現況へ上書き、宿泊でイベントを自動消化、pinch／ジョイスティック／カメラ競合。

受け入れ：個人31人の分類、画像新規9枚、一般客8枠11役割の共有11枚を検査できる。合計20枚を既存rendererで正しい相手へ表示、既存22枚・人物ID・旧saveは不変。W1の予測日と既存逐次水位計算が一致し、未知の時は日数を作らない。未発見と噂だけは新しい数値案内なし。既知地点のみ現在可否・待ち日数が読み取れる。手動宿泊の全副作用は導入前と同じ。一般客Taskと連泊QoL保留は、個人portraitと水位案内の出荷を妨げない。

## 6. スマホ実機：ユーザーの最終チェック

- [ ] 肖像が縦画面で切れすぎず、名前・本文・閉じるボタンが読める。fallbackでも文章が読める。
- [ ] 同じ一般客枠の翌朝の役割と肖像が一致する。人猫・昼夜でも人物が入れ替わらない。
- [ ] Drowned未発見では地図・宿・会話に新しい場所／待ち日数が出ない。
- [ ] Drowned発見済みでは「今日は通れない」「あと1〜2泊」「今日は通れそう」を判断できる。
- [ ] Ring未発見で、低水位の名称・奥の場所・隠し入口・特別な意味が漏れない。
- [ ] 1泊後に案内が更新され、実際の旧道通行可否と一致する。reloadしても同日状態は変わらない。
- [ ] 宿泊・肖像会話を閉じた後、ジョイスティック・カメラ左右上下・同時操作が正常。
- [ ] 世界地図のpinch・スクロール・選択・閉じるが案内表示と競合しない。
- [ ] Caerithへの舟・Lunmereの宿／店・NPCの居場所・日替わり客が通常どおり。

この計画で実装前に決める主な作画判断は、未定義人物の見た目の承認であり、人物設定や水位条件の変更ではない。推奨順はP1とW1から各系統を独立着手し、P2／W2、P3、V1へ。2案件を一つの大きな不可分commitにしない。

## 実装時の承認済み追記
cvTessaの表示名はエステル、mireGathererはニーヴァ。ID・人物設定・schedule・台詞（直接の名前参照以外）・出現条件は保持し、旧Journalや保存済み履歴本文は書き換えない。旧ファイル名cv-tessa-default.pngは人物IDに対応する安定したasset名として維持する。作画briefは本書の新表示名を使用する。
