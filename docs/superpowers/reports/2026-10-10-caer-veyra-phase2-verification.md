# Caer Veyra Story Phase 2 推奨A 検証記録

状態：**自動検証済み／実機確認待ち**。スマホ実機はユーザー担当、未確認。
基準main：22ab0b88729379e068e6ee12067b6a20fd5d59f0。

## Task 1

変更前Nodeチェック：check_stay_state / check_world_graph / check_story_thread はPASS。
check_capital / check_capital_research は17 !== 14でFAIL。既存lodgingCharactersの3人追加にテストが追従していない。
元の14人は !lodging で確認し、全IDの重複なし・保存可能性も確認する。ゲームの人数・IDは変更しない。
stageの独立境界値、traceなしの資料・記憶・物理のみ、比較接頭辞の現行挙動、discoveries 999/1000/1001とJournal 399/400/401を固定するテストはローカルNode24でPASS。
既存Node24では --experimental-default-type=module が廃止されているため、.mjsと自動ESM検出を使用。

この環境ではAF_UNIX socketが禁止されChromium起動がBLOCKED。ブラウザ検証は同じコードをGitHub Actionsの検証用ブランチphase2-plan-aで実行する。合成save・専用localhost originのみを使用。ユーザーの実saveは取得・利用しない。
CI準備とテスト用commitを検証ブランチに先行作成するが、合格前にはmainへ反映しない。


Task 1 結果：PASS（実機を除く）。Node主要5本と独立stage10ケース、S6/S7は合格。追加の旧地域・舟・水位・terrain・navigation・宿泊・人物配置等のNode回帰17本も合格（合計22本）。check_progression_mireの旧24人期待値だけは既存lodging3人追加に追従して27人へ訂正。
ブラウザ変更前基準：save互換、研究save互換、資料/猫/痕跡、UI、性能39視点は [run37958618024](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37958618024) でPASS。人物14人とFinn–Val二日間は [run37959675849](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37959675849) でPASS。
会話終了直後のテスト停止は110msの閉じるアニメーション中に入力したfixtureタイミング不備。画面hiddenを待つテスト修正のみ。本体の通路修正はしていない。
S0新規Day1リセットはcapital-save-compat、S1〜S5はresearch-compatの旧3時代＋9 round trips。起動時にBellmireの旅履歴が1件正当に追加される現行動作を区別。Ring compared fixtureにはvisit/direction/grooveを用意。不正fixtureをゲーム側で救済する変更はなし。
未知比較キーがstageへ数えられる現行動作、discoveries先頭1000件・Journal末尾400件という既存上限を特性として固定。旧saveの厳格化・schema変更はなし。

## Task 2

実施内容：対象のdoc/trace/cat/memory/compareキーは注入しない。Day30と既存区画解放と屋外開始位置のみfixture。扉のE操作、衝突判定下のW移動、モードUI、自然scheduleのElda、比較UIで検証する。
配置数の訂正：元コードは11論理資料・設定17配置・設定9施設。設計/計画の15という数は誤記。専用8室の既存baselineは資料15配置を確認し、通行所とguildの2設定には汎用室内での研究資料生成処理がない。設定上17に対し、現行の実配置は専用室内の15（資料を置く施設7）である。配置を新規追加して数を合わせない。

Task 2 結果：PASS。 [run37961207082](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37961207082)。六種類の取得、自然scheduleのElda、4組のUI比較、SVG3線、最大3件、未読非表示、逆順重複、2施設のdistrict ID維持、人間の梁停止／猫の実移動／猫で資料未読、閉館扉、未解放Old門をassert。Eldaの既存directionはOldの正当な代替解放条件なので、未解放負例は会話前に確認する。施設や人物の本体配置は変更なし。


## Task 3

UI追加検証：昼の資料読書→夜の閉館、比較だけは夜も利用可、Escape／背景／閉じる、Journalリンク、都市図、全体地図の7経路で入力blockと実W移動の復帰をassert。変更前コードでPASS。UI block残留は未再現、本体修正なし。
資料11件・建築12件・猫10件・人物研究応答12件・既存Finn–Val二接触の文章を読み、年代・建造者・人物正体・王家の陰謀の確定を導いていないことを確認。普通の通行・家族・補修の本文とMiraの朝食応答を維持。新規最終Journalの断定文だけは承認済み指定文のRED/GREEN対象。

変更前RED： [run37961647211](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37961647211)、86d20ca。108会話handler fixture中24件（研究中間/最終×Bellmire/王都×異変当夜/翌日×human×index1/4/7）で研究応答が既存の鐘応答を上書き。研究なし・cat・通常日のケースは一致。新規最終Journalの厳密一致もFAIL。修正はcapital-research.jsの同wrapperへ既存鐘の優先guardを追加し、新規生成文を指定の仮説文へ変更する2箇所だけ。stage/ID/save/解放/geometry/毎frame処理は変更なし。

Task 3 結果：GREEN。 [run37962088043](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37962088043) で108会話・UI7経路・旧3時代＋9 round trips＋旧Journal保持が合格。独立した第2接触負例は [run37962297674](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37962297674)、関連する六種類取得・比較は [run37962385819](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37962385819) でPASS。修正commit 9a1d88d。未再現のUI・通路・save候補には予防的修正をしていない。


## Task 4

既存境界： [run37963232841](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37963232841) で5閉鎖/解放・50断面・人間/猫50実W接近・斜め/側面回避不可・開通Canal通過・arrival/partial/all savesのreloadはPASS。
同runの新規受け入れは停止RAF後に地域detailの更新を進めておらずdistrict14の観察対象が非表示になったfixture不備。正常なregion/capital/shop/inspection更新を進めるテスト修正だけを行う。地域・入口・geometry本体は変更なし。
性能の初回別runner比較は39視点でcalls/triangles/mesh/lights/transparent/castersがすべて完全一致、NPC118人で一致。CPU更新中央値は0.2→0.4ms。同一runnerの前後測定で切り分ける。SwiftShaderの計測で、実機FPSを示すものではない。


新規境界・既存操作： [run37963807631](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37963807631) で4状態の都市図・全体地図・再訪UI・入口ID照合、両profileの王宮接近停止、district14同一区画/非入室、既存old-cavityの人間停止/猫観察通路と同一区画/非入室、合成save reload、native宿泊・翌朝、Lunmereのnative乗船/W短距離/下船をPASS。
原状のdistrict14とold-cavityは観察点/観察通路であり新portalではない。既存経路を塞ぐ壁を追加して仕様を変えない。別区域・室内へ入らないことと選択先・入口の不変を確認。
舟の実操作は船着場の短い往復のみ。島への全航路通しプレイと自然Day1通しプレイは未検証。舟・dock・島のデータ契約はNode回帰、dock保持は旧save回帰で確認する。

既存CI制約：bellmire-v101.ymlは既存のYAML不正で、jobなしのfailure runを作る。本変更に含めず、今回のCaer Veyra Phase2検証workflowの成否と区別する。


## 受け入れ条件と検証範囲

| 条件 | コマンド／証拠 | 判定 |
| --- | --- | --- |
| AC1 基準SHA・既存再利用 | baseline22ab0b8、runtime diffはcapital-research.jsの2箇所 | PASS |
| AC2 六種類の取得・比較 | capital-phase2-acceptance：targetキー注入なし、自然Elda、4組のUI比較 | PASS |
| AC3 普通の生活資料 | 非trace passage/family/repair、Mira朝食文、既存14会話、全本文の意味確認 | PASS |
| AC4 現行閾値・未読非表示 | check_capital_research独立10境界、acceptance負例 | PASS |
| AC5 自由比較・非採点 | 2件/最大3件のUI、類似/不一致のJournal、本文の意味確認 | PASS |
| AC6 仮説文 | compat新規Journal厳密一致RED→GREEN、旧同ID文保持 | PASS |
| AC7 未確定・非解放 | 本文確認、4状態map/再訪/入口snapshot、両profile接近・非入室、既存closures | PASS |
| AC8 save round trip | capital-save-compat / research-compat、S0〜S7、取得後reload | PASS |
| AC9 同じ比較重複防止 | 逆順UI比較、同doc別施設、S5取得順、同ID旧Journal保持 | PASS |
| AC10 人間/猫の経路・読書 | 実Wのhuman梁停止／cat通過、モードUI、catでdoc未取得 | PASS |
| AC11 既存機能回帰 | Node22本、browser基準5本、closures、native休息/舟短距離、地図再訪、性能39視点 | PASS |
| AC12 スマホ実機 | phase2-mobile-checklist.md、ユーザー担当 | PENDING |

Node22本：stay_weather、stay_state、progression_mire、drowned_way、navigation_data、nine_terrain、lunmere、boat_caerith、watercourse、capital_research、world_graph、lake_regions、resident_layout、ring、portrait_framing、capital、resident_life、town_calendar、docking、story_thread、scene_data、shop_data。
ブラウザ基準5本：capital-save-compat、capital-research-compat、capital-research、capital-research-ui、capital-research-people。追加：capital-phase2-acceptance、capital-closures、capital-research-perf（39視点×前後）。

Nodeはデータ・契約の回帰で、全地域の自然Day1通しプレイを意味しない。390px/hasTouch/SwiftShaderは実機確認を代替しない。未知比較キーや容量上限の既存制約を受け入れたことも、実機PASSを意味しない。

配置数は設定と実配置を分ける。capital-research-data.jsには17 room entries、caer-veyra-interiors.jsの汎用分岐にはresearch-document生成がないため、cv-passage/cv-guildの2設定を実探索PASSに数えない。専用8室のbaselineが11論理資料・15実配置を確認する。この既存設定差は六種類の代表ルートを妨げず、今回の修正対象に加えない。


Task 4 最終一括結果： [run37964647847](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37964647847)、78728d3でNode22本、ブラウザ基準5本、acceptance、closures、性能前後39視点がすべてPASS。比較本文6種類の厳密一致と人間の実前進を追加した [run37965761738](https://github.com/yuyuyu7781/orlaithe-bellmire/actions/runs/37965761738)、403e878もPASS。
同一runner A/Bは基準22abのcapital-research.jsを一時使用し、修正版へ復元する。39視点すべてでrender6指標、NPC118人のschedule統計、室内統計が完全一致。CPU更新中央値は0.4→0.5ms、最大0.8→1.0ms。CPUが同値14視点・増加15・減少10で、修正した会話/Journalの分岐は性能シナリオで使われず、更新ループ/geometryに増分はない。0.1ms刻みの小さな計測差として記録する。実機性能の合否はPENDING。詳細はphase2-performance.csv。
ランタイム変更は9a1d88dの2箇所だけ。その他はテスト・CI・設計/計画/検証記録。mainの最終SHA、最終main CIとworking treeの確認は最終報告に記載する。

## Task 5

ユーザーによる実機確認待ち。phase2-mobile-checklist.mdへ代表ルート、タッチ/長文/比較/モード切替/Journal/地図/宿泊/閉館/復帰/保存再開/10分探索を記載。機種・OS・ブラウザ・対象SHA・品質・結果を記録し、実機PASS後にAC12を更新する。

## 実行上の判断（全件）

以下は実行中のRulingを順番どおり保存したもの。手順やfixtureの訂正を本体不具合の修正と混同しない。

- Ruling: user now authorizes implementation, commits and main push; supersedes plan-only prohibition.
- Ruling: fresh clone on feature branch provides isolated workspace; no additional worktree needed.
- Task 1: Ruling: Node24 removed --experimental-default-type; use automatic ESM detection with node tools/check_*.mjs — same module semantics, no repo configuration change.
- Task 1: Ruling: lodging added 3 people; assert original 14 with !lodging filter and total with lodging count — preserve all production IDs.
- Task 1: Ruling: local AF_UNIX sockets denied; run browser verification in GitHub Actions feature branch — no real save used; main unchanged until green. Commit-before-verification on feature branch is required to run hosted CI, not a completion claim.
- Task 1: Ruling: hosted RED ring stage unseen was invalid test fixture (compared Thread with all Ring discoveries wiped). Seed ring:visit/direction/groove so sync derives legitimate compared stage; do not change Ring runtime.
- Task 1: Ruling: extra Node regression check_progression_mire count24 is stale after 3 lodging residents; test-only update to 24+lodgingCharacters.length.
- Task 1: Ruling: reload correctly appends the initial Bellmire travel entry; assert preserved history plus that exact startup entry, not raw whole-history equality — follows existing recordTravel behavior, no production change.
- Task 2 pre-flight Ruling: source has 11 logical documents, 17 placement entries across 9 facilities (not design's 15). Derive separate counts from researchDocuments; keep all existing placements, no additions.
- Ruling: cloud skill task-start helper resource is unavailable; use this plan-specific ledger and task briefs directly. No review gate is skipped.
- Task 1: complete (commits22ab0b8..804d340, tests22 Node +5 hosted browser baselines → PASS): hosted five browser baselines, independent stages/save and 22 Node regressions passed. Performance baseline39 views retained. Ruling: inspection closing110ms requires test waitForSelector hidden; no runtime collision fix.
- Task 2: Ruling: mode UI lives in collapsed controls after entering walk; open #toggle before clicking, never force hidden button. No runtime change. Cost if wrong: acceptance UI route requires correction.
- Task 2: Ruling: unread tabletop negative used a blocked furniture coordinate; derive nearby safe floor before native path. Do not reposition game furniture. Cost if wrong: negative case misses a real inaccessible route.
- Task 2: Ruling: outdoor relocation alone leaves region activity as Bellmire; Elda controller visible but actor culled. Set existing current ward as starting fixture and run normal activity updates; do not force controller/actor position or visibility. Cost if wrong: natural encounter claim requires revalidation.
- Task 2: Ruling: selection clear must query current aria-pressed first after each render, not stale nth locators. Test-only correction; cost if wrong: comparison harness may misreport failures. Six acquisitions including natural Elda verified in37960728929 before this harness failure.
- Task 2: Ruling: Elda direction legitimately opens oldQuarter through existing alternative condition; place locked-ward negative before Elda conversation, do not require ward remain locked after that clue. Cost if wrong: may under-test a new unintended unlock; Task4 snapshots allow only existing condition changes.
- Task 3: Ruling: commit both independently reproduced fixes together in9a1d88d because they are exactly two lines in one runtime file and share browser regressions; retain separate RED evidence. Cost if wrong: independent revert needs a partial revert instead of one commit revert.
- Task 3: Ruling: encounter absence negative must remove completed-second flag and assert actual externalVisit absent; pre-first negative must have research and natural visitors present. Strengthen fixtures so another false conjunct cannot hide a failure. Cost if wrong: negative encounter coverage could still be vacuous.
- Task 4: Ruling: district14 and old-cavity are existing observation markers/cat observation paths, not portal entrances. Assert same known ward/no room and unchanged selectable/revisit/entrance identities while preserving the existing cat path; palace approach and existing gates assert physical stop. No new wall/content. Cost if wrong: hidden alternate entry may require additional route coverage.
- Task 4: Ruling: stopped RAF requires normal region/capital/shop/inspection ticks after outdoor fixtures; otherwise prior ward detail remains culled and targets/obstacles are unavailable. Add engine ticks, never force scene visibility. Cost if wrong: manual frame schedule may differ from real phone behavior (Task5 remains pending).
- Task 4: Ruling: CPU0.2→0.4ms across different hosted runners cannot establish regression; compare baseline22ab and final runtime consecutively on one runner, asserting all39 render counts/NPC118 and reporting CPU without invented phone-FPS threshold. Cost if wrong: CPU variance may mask device-specific slowdown; real-device10-minute check remains required.
- Task 4: Ruling: checkout is shallow, fetch exact baseline commit before A/B source substitution and restore with trap plus git diff assertion; no tracked production fixture copy. Cost if wrong: A/B could compare wrong code, guarded by exact git show and restoration.
- Task 4: Ruling: legacy bellmire-v101.yml is already invalid YAML (unindented JS in run block), generates zero-job failures on every push. Leave unrelated legacy workflow untouched under minimal-scope instruction; report separately from Phase2 PASS. Cost if wrong: repository all-workflow badge remains red despite target suite being green.
- Task 4: Ruling: distinguish configured17 slots/9 facilities from actual15 dedicated-room document placements/7 document facilities. Generic passage/guild factory has no research-document generation; mark those2 as baseline configuration gap, not verified physical routes. Six representatives all passed; add no content under A. Cost if wrong: readers may overestimate placement coverage.
