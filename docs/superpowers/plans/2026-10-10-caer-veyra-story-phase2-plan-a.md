# Caer Veyra Story Phase 2 — 推奨A Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
> この計画では変更範囲が小さく依存が強いため、同一セッションでのexecuting-plansを推奨する。実装方法の選択前にコード変更へ入らない。

**Goal:** 既存Phase 2を再利用し、六種類の証拠を実際に探索・比較できることと旧save互換を保証し、再現した不具合と断定的な表現だけを最小限修正する。

**Architecture:** 既存discoveries、researchStage(data)、capitalLife.sync、資料比較UIを維持する。追加の責務は検証ツールに置き、新しい物語システム・進行条件・保存領域を作らない。ランタイム修正は失敗テストが示した原因箇所と新規Journalの一文に限定する。

**Tech Stack:** JavaScript ES modules / Three.js / Node.js assert / CommonJSの既存Playwrightツール / Chromium / ローカルHTTP。

**Spec:** `Caer-Veyra-Story-Phase-2-design.md`（同じ文書を実装時のrepo rootに用意する）。2026-10-10のユーザー承認により推奨Aを採用。設計書の「未承認」はこの承認で置き換える。

**Baseline:** `yuyuyu7781/orlaithe-bellmire`、main `22ab0b88729379e068e6ee12067b6a20fd5d59f0`。計画作成時にmainの一致と対象ソースを再確認済み。ゲームテストは今回未実行。

## Global Constraints

- 「記録から消えたもの」より「消えたはずなのに残っている痕跡」を探す。
- 公文書・普通の帳簿・古地図・建築痕跡・人の記憶・猫だけの物理的痕跡を並べる。六種類を新しい必須条件にしない。
- tracesRemain：trace付き資料1種類以上。
- conflictingSources：trace付き資料2種類以上＋比較キー1件以上。
- olderLayerSuspected：trace付き資料4種類以上＋比較キー2件以上＋建築または猫発見1件以上。
- SAVE_KEY=bellmire.stay.v1、SAVE_VERSION=1、人物・地域・資料・Thread IDは固定。
- 新saveフィールド、新Thread、第二の保存領域、比較の自動採点を追加しない。
- 王家の陰謀、秘密結社、Finnの正体、区画14の正体・入口、王宮内部は確定・解放しない。
- 既存5区画、人物ID、14portrait、他地域、宿泊・舟・水位・解放条件を維持。
- 過去のJournalを一括書換えしない。新規Journal生成時の文だけ変更する。
- geometry・ライト・常駐NPC・毎frame処理を追加しない。
- テストは専用origin・ブラウザcontextの合成saveで行い、ユーザーの実saveを上書きしない。
- 実機未確認はrelease判定「保留」。PCエミュレーションで代用しない。
- この依頼の成果物は計画。実装実行、公開、merge、実save利用を今回実施しない。

## Review Focus

1. 猫・エルダ未取得でも正規の最終stageに到達した旧save：reload→sync→flushでも後退しない（Task 1）。
2. 別設置点で同じ資料を読む／同じ比較を逆順に記録：発見キーが増えず、順序でstageが変わらない（Task 1・2）。
3. 閉館への切替／Journal経由／別UIとの重なり：閉じた後の操作とinput blockの所有者が正しい（Task 3）。
4. 鐘の異変当夜・王都以外・猫でのFinn：研究反応が既存の優先会話を奪わない（Task 3）。
5. 痕跡の全取得・再開・猫移動：区画14・王宮の入口や地図／再訪先を増やさず、謎を確定しない（Task 2・4）。

## ファイル構成と変更制限

| ファイル | 責務・扱い |
| --- | --- |
| tools/check_capital_research.mjs | 既存CLIへ独立した境界値ケースを追加 |
| tools/capital-research-compat.cjs | 旧save・研究途中・六種類未取得の最終stageのround trip |
| tools/capital-phase2-acceptance.cjs | 新規。六種類を操作で取得し比較する代表ルートと非解放の負例 |
| tools/capital-research-people.cjs | 既存会話・Finn・第2接触の回帰。再現ケースのみ追加 |
| tools/capital-research-ui.cjs | 既存390pxテストへ閉館・UI block・再操作の検証追加 |
| capital-research.js | 必ず変更候補となる新規最終Journalの一文。その他は再現した原因のみ |
| capital-research-data.js | データ・stage定義は読取参照。内容に断定があれば対象文だけ。researchStage/researchStagesは変更しない |
| tools/capital-browser.cjs / native-navigation.cjs / native-talk.cjs | 既存補助を再利用。代替boot・移動システムを作らない |
| docs/superpowers/reports/2026-10-10-caer-veyra-phase2-verification.md | 新規。基準・ケース・証拠・修正理由・実機判定 |
| stay-state.js / progression-data.js / story-thread-data.js | 変更しない |
| caer-veyra.js / caer-veyra-data.js / capital-dedicated-interiors.js | 原因が実行証拠で特定された場合だけ対象箇所を変更。解放条件は維持 |

rootにAGENTS.mdは基準SHAでは存在しない。実行環境の親階層・対象フォルダに追加指示があれば実装時に読む。無関係な分割・整理、依存の更新、一般化した新テスト基盤を行わない。

## 依存関係と実行前提

Task 1 → Task 2 → Task 3 → Task 4 → Task 5（スマホ実機）。
Task 3はTask 1・2の失敗を再現して原因を特定した後に行う。Task 4が通るまで実機最終確認に進まない。

既存インターフェース（新規ランタイムAPIは作らない）：

- researchStage(data) → null | 'tracesRemain' | 'conflictingSources' | 'olderLayerSuspected'。
- defaultStay() → 既存stayデータ、validateStay(raw) → 正規化された既存stayデータ。
- boot(opts={}) → Promise<{browser,page,errors}>。opts.viewport、opts.touchを再利用。
- plan(page, goal:[number,number,number]) → Promise<{path,nodes}>。
- move(page, path) → Promise<移動結果>。実際のW入力でwalking.updateを進める既存補助。
- talk.approach(page,id) → Promise<path>、talk.face(page,id) → Promise<void>。
- app.capitalResearch.open(doc=null)、close()、list()、stats.stage、stats.read、stats.comparisons。
- app.capitalLife.sync()、app.stayState.flush()、app.stayState.data。
- 比較UI：.capital-research-overlay、.research-comparison article、aria-pressed、ボタン「並べて記録する」「地図を重ねて見る」「閉じる」。

実行時はusing-git-worktreesを読み、既存の隔離checkoutを確認してから作業する。mainが変わっていたら差分を照合して計画の基準を更新し、古い行番号をそのまま適用しない。実装用repoに本計画とSpecを配置する。テスト結果は個人情報を含まない合成データだけを報告する。

NodeのES module既定を明示する。既存bootはplaywright、/usr/bin/chromium、CDNのThree.jsを必要とする。初期起動ができなければ環境BLOCKEDと記録し、機能FAILやPASSと混同しない。現行補助のindex.html注入markerが置換されたこととapp公開を確認する。ブラウザテストは同一portを使うため順番に実行する。

---

### Task 1: 未変更基準、stage境界、save互換を固定する

**Files:** Modify/Test: tools/check_capital_research.mjs、tools/capital-research-compat.cjs。Read: stay-state.js、capital-research-data.js、caer-veyra.js、progression-data.js。Create: 上記検証報告。

**Interfaces:** Consumes: researchStage、defaultStay、validateStay、boot、capitalLife.sync、stayState.flush。Produces: 既存閾値を固定するCLIケースとS0〜S7の実行結果。後続Taskはこの結果を基準にする。

- [x] **Step 1:** SHA、git status、実行環境、既存チェック結果を検証報告へ記録する。CLIは以下を個別実行。Expected: exit 0、assert失敗なし。既存FAILは変更前FAILとして残す。
  - node --experimental-default-type=module tools/check_capital_research.mjs
  - node --experimental-default-type=module tools/check_capital.mjs
  - node --experimental-default-type=module tools/check_stay_state.mjs
  - node --experimental-default-type=module tools/check_world_graph.mjs
  - node --experimental-default-type=module tools/check_story_thread.mjs
- [x] **Step 2:** repo rootで別実行枠のローカルserverを起動する：python3 -m http.server 8001 --bind 127.0.0.1。node tools/capital-research-compat.cjs、node tools/capital-save-compat.cjs、node tools/capital-research.cjs、node tools/capital-research-ui.cjs、node tools/capital-research-people.cjsを個別に実行。Expected: exit 0、pageerror/console errorなし。
- [x] **Step 3:** check_capital_research.mjsへ以下の独立ケースを追加する。各caseはdefaultStay()から作り、他caseの発見を持ち越さない。trace資料はcommerce/building/canal/oldMapを順に利用。比較キーは既存sort規則を使う。cat/建築/記憶だけはnull、passage/family/repair/districtは系統数へ加算されないこともassertする。

| trace資料数 | 比較数 | 物理 | researchStageの期待値 |
| --- | --- | --- | --- |
| 0 | 0 | なし | null |
| 1 | 0 | なし | tracesRemain |
| 1 | 1 | なし | tracesRemain |
| 2 | 0 | なし | tracesRemain |
| 2 | 1 | なし | conflictingSources |
| 3 | 2 | 建築1 | conflictingSources |
| 4 | 1 | 建築1 | conflictingSources |
| 4 | 2 | なし | conflictingSources |
| 4 | 2 | wall-stairs | olderLayerSuspected |
| 4 | 2 | records-floor | olderLayerSuspected |

- [x] **Step 4:** 追加ケースをCLIで実行する。Expected: 全PASS。特性固定のテストなので最初からPASSでよい。わざと実装を壊してREDを作らない。不一致はsystematic-debuggingで再現し、現行仕様とテストfixtureの誤りを先に判別する。
- [x] **Step 5:** compatへS0新規、S1王都前v1、S2旧王都stage（arrival/ordinary/missing/compared）、S3研究3stage、S4a猫もエルダもないが建築で最終到達、S4bエルダも建築もないが猫で最終到達、S5同じ証拠の取得順違いを追加する。S4の4資料・2比較は実際に比較可能な取得済み証拠から作る。各fixtureについてflush→reload→capitalLife.sync→flush→localStorage解析を行い、既存の有効なdiscoveries、memories、day、dock、水位、Thread、旅履歴を比較する。Journalは既存の名前移行・新しいstage記録の追記を区別してassertする。raw全体deepEqualで正当な既存migrationまで失敗させない。
- [x] **Step 6:** S6（未知stage、未知／未読比較キー、discoveries 999/1000/1001、Journal 399/400/401）、S7（不正JSON、未来version、保存例外）を既存validator/save処理の契約に照らして確認する。容量上限の先頭1000／末尾400という現行特性とfallbackを記録。未知比較キーをstageが数える現行挙動は特性テストとして明記し、valid saveの互換を変える修正はしない。データ消失が新変更によるならFAIL、既存上限由来なら既知制約として記録する。
- [x] **Step 7:** node tools/capital-research-compat.cjs、node tools/capital-save-compat.cjsを再実行。Expected: S0〜S5の有効save保持、S4a/bのstage維持、S5のstage一致、S6〜S7は明示した現行挙動。報告を添えてコミット：test: pin phase2 stages and legacy save round trips。

### Task 2: 六種類の探索と比較を一つの受け入れシナリオにする

**Files:** Create/Test: tools/capital-phase2-acceptance.cjs。Read: capital-research-data.js、capital-dedicated-interiors.js、caer-veyra-data.js、caer-veyra.js、既存browser/nav/talk補助。Modify: 検証報告。

**Interfaces:** Consumes: Task 1の基準、boot/plan/move/talk、既存app API。Produces: 六種類の取得・比較・非解放をassertする独立コマンド、fixture使用範囲付き結果JSON。実装は既存CJSの非同期main＋finallyでbrowser.close()に合わせる。

- [x] **Step 1:** 新テストのsetupは日付・既存区画解放・区画間の開始位置だけをfixtureにする。対象doc/trace/cat/memory/compareのキーを一切注入しない。結果へ「区画・時刻fixtureあり、完全新規通しプレイではない」を記録する。requestAnimationFrame停止や歩行updateの手動進行も記録する。
- [x] **Step 2:** 次の取得表をテストへ実装する。施設入口まではsetupで移動可、入口の操作と室内／痕跡への接近は既存入力・衝突判定を使う。目的地点直上へのrelocate、shopSystem.enterやhandler直接呼出しを取得証拠にしない。施設と資料IDの対応はデータから確認し、実際のinspect IDを利用する。

| 種類 | 取得対象 | 取得後のassert |
| --- | --- | --- |
| 公文書 | cv-recordsのbuilding | discoveries['cv:doc:building']が操作前はなく操作後にある |
| 普通の帳簿 | cv-archiveのcommerce | cv:doc:commerce、本文に生活の勘定と余白の呼び名 |
| 古地図 | cv-mapsのoldMap | cv:doc:oldMap、「地図を重ねて見る」でSVGの3年代の線 |
| 建築 | civicWardのwall-stairs | cv:trace:wall-stairs、近接E操作と観察文 |
| 人の記憶 | cvEldaに人間で会話 | cv:elda-memory、conversationLogのspeakerId=cvElda |
| 猫の痕跡 | cv-recordsのrecords-floor | 通路手前→実移動→近接Eでcv:research-cat:records-floor |

- [x] **Step 3:** エルダは自然scheduleで実在する場所を選び、controllerを強制配置しないケースを主とする。不在なら既存の時間進行で探し、上限に達したらFAIL／調査対象とする。会話fixtureによる切り分けは別caseとして記録し、自然配置合格に数えない。モード変更もプレイヤーの既存UIを使う。
- [x] **Step 4:** building＋wall-stairs、commerce＋memory:elda、oldMap＋wall-stairs、building＋cat:records-floorを順にUIで比較する。各回は2〜3件のarticle、選択した本文、既存のソート比較キー、新Journalの「合うところも、合わないところも」をassert。六種類すべてが比較へ登場したことを集合でassertする。比較件数だけで六種類PASSにしない。
- [x] **Step 5:** 負例を追加する：未取得資料はlist()/選択ボタンに出ない、1件では記録disabled、4件目を選んでも最大3件、逆順の同じ比較でキーが増えない、資料別設置点で同じdoc IDは1件。records-floor経路は人間のW入力で越えられず猫なら越えられる。猫によるdoc近接操作では資料発見が増えない。未開放区域と閉館時は入口で取得できない。
- [x] **Step 6:** 11論理資料ID・17配置と9設置施設を別の集合として記録する。専用8室の巡回だけで配置を全確認したことにしない。配置漏れは既存capital-research.cjsとデータの差分として報告する。passage/family/repairの普通の文章とMiraの朝食の反応も維持されることを確認する。
- [x] **Step 7:** node tools/capital-phase2-acceptance.cjsを実行。Expected: 上記assert全PASS、pageerrorなし。PASSしても自然なDay1からの全通しプレイや実タッチとは呼ばない。取得・移動のFAILは録画／座標／selected ID／モードを記録しTask 3へ渡す。コミット：test: cover six evidence routes and comparisons。

### Task 3: 再現した不具合と新Journalの断定だけを最小修正する

**Files:** Modify/Test: tools/capital-research-people.cjs、tools/capital-research-ui.cjs、tools/capital-phase2-acceptance.cjs。Modify: capital-research.js（syncの新規最終Journal文、必要ならeventReply wrapper、dismiss/update）。その他は原因が特定された箇所のみ。

**Interfaces:** Consumes: Task 1/2の再現記録、createCapitalResearchの既存open/close/list/statsとeventReply(args)。Produces: 同じAPI・同じID・同じstageを保つ最小修正と回帰テスト。新公開APIなし。

- [x] **Step 1:** systematic-debuggingを使用し、Finn wrapperより前の元eventReplyと呼出し側を読む。未研究／中間／最終×王都／Bellmire×昼／鐘異変当夜×human/catの対象caseをpeopleへ追加する。既存の鐘異変反応をソースから期待文として固定し、index%3===1を含む会話操作で比較する。通常の研究反応も残ることをassertする。第2接触は未遭遇・同日・自然不在でdisabled、翌日以降かつ自然来訪時だけenabledをassertする。
- [x] **Step 2:** UIへ昼の資料読書→夜の閉館、比較画面だけの開閉、Journalリンク、地図との順次開閉を追加。各caseで開いているUIに応じinputBlockedが正しいことをassertし、最後に実際の移動入力でfeetが動くことを確認する。重なりは実際に起こせる経路で試す。390pxで横overflowなし、長文末尾でも閉じるボタンが画面内、Escape／背景クリック／閉じるで正しく解除。
- [x] **Step 3:** people/ui/acceptanceを実行し、変更前FAILを保存する。再現しない候補は「未再現、コード変更なし」と記録する。失敗テストがfixture不備ならfixtureを直し、ランタイムに回避処理を足さない。
- [x] **Step 4:** 新規最終Journalの文を正確に次へ変更する：
  「今の都市より古い構造があるのかもしれない。改修や再利用だけで説明できる部分もある。」
  compatで新規到達のcv:research-stage:olderLayerSuspectedのtextがこの文と一致することを先にassertし、変更前RED→変更後PASSを確認する。既存同IDの旧Journalは書換えられないこともassertする。refreshで同IDを再作成するmigrationは作らない。
- [x] **Step 5:** 再現したFAILだけ原因箇所を修正する。Finnは確認した既存の地域・鐘の優先条件を保ち、通常研究応答まで一律old優先へ変えない。UIはcapital-research自身のblockだけ解除する。通路・配置は問題地点だけを調整。stage閾値／save仕様／解放条件の変更が必要ならAの範囲外として止め、失敗ケースと理由を報告する。
- [x] **Step 6:** 各修正の失敗テストを再実行してPASSを確認後、Task 1・2の関連テストを実行。表現は資料・会話・Journal全文を人が読み、年代・建造者・正体・陰謀を断定していないか確認する。文字列の禁止語検索だけを意味の保証に使わない。コミットは修正原因ごと：fix: keep phase2 journal conclusion tentative／fix: preserve reproduced dialogue or UI behavior。

### Task 4: 非解放・既存機能・性能の最終自動回帰

**Files:** Modify/Test: tools/capital-phase2-acceptance.cjs。Reuse: tools/capital-closures.cjs、tools/capital-research-perf.cjs、Task 1のCLI/browser群。Modify: 検証報告。

**Interfaces:** Consumes: Task 3の同APIと変更一覧。Produces: 対象SHAの自動検証判定、実機へ渡す安全な検証手順と結果表。

- [x] **Step 1:** 非解放caseをacceptanceへ追加。研究前／六種類取得後／最終stage／reload後の4状態で、王宮内部と区画14が地図の選択先・regionSystemの再訪先・入口inspectに追加されないことを基準snapshotと照合する。名前だけで判定せず実際の地図・再訪UIを操作する。王宮への既存閉鎖地点・旧点検口district14・猫のold-cavityは両profileの接近／移動を試し、境界越えや新room入室が起こらないことをassertする。未知の再訪IDを新造しない。
- [x] **Step 2:** 六種類取得後のS4・reloadを再実行し、区画解放条件が研究完了を要求していないことと既存Canal/Civic/Scholar/Old条件を確認する。tools/capital-closures.cjsを実行。Expected: 既存閉鎖・解放の全ケースPASS。
- [x] **Step 3:** Task 1のCLI5本とbrowser5本、acceptanceを順に実行。Expected: exit0、assert失敗なし、pageerrorなし。旧地域／舟／水位／宿泊／portrait／Journal／都市図／全体地図の回帰は既存チェックのcoverageを報告で示し、未カバーの操作だけ手動で確認する。既存失敗を黙って除外しない。
- [x] **Step 4:** capital-research-perf.cjsを変更前と同じ日・カメラ・品質で測定し、draw calls、geometry、NPC数、CPU updateを比較する。ランタイム文言のみの差で負荷増加があればscheduleや測定の揺れを切り分ける。毎frame／geometry追加がないことをdiffで確認する。SwiftShaderの結果を実機FPSと呼ばない。
- [x] **Step 5:** 報告の各AC1〜AC12へコマンド・fixture区分・結果・証拠を対応させる。FAIL、環境BLOCKED、実機PENDINGを区別する。実機テスト版は対象SHAを明示し、ユーザーの既存originと保存領域を共有しない環境を選ぶ。公開やdeployは本計画実行と別の操作として扱う。コミット：test: verify phase2 boundaries and regression evidence。

### Task 5: スマホ実機の最終受け入れ

**Files:** Modify: docs/superpowers/reports/2026-10-10-caer-veyra-phase2-verification.md。ゲームコードは新たな再現がなければ変更なし。

**Interfaces:** Consumes: Task 4のPASS済みSHA、独立した検証環境、六種類の代表ルート。Produces: 実機PASSまたはFAIL/PENDING。PCだけの完了宣言をしない。

- [ ] **Step 1:** 実機担当者と、機種・OS・ブラウザ・対象SHA・画面向き・品質・合成save使用を記録する。端末操作が利用できない場合はユーザーの確認が必要な部分として具体的なチェック表を渡し、PENDINGを残す。
- [ ] **Step 2:** 縦画面でタッチ移動→近接操作→資料読書→2〜3件比較→地図重ね→長文スクロール→閉じるを実施する。Expected: 読める、誤タップで背後が動かない、横overflowなし、閉じる後に移動できる。
- [ ] **Step 3:** 猫通路の実移動、猫→人間切替、エルダ会話、Journalリンク、都市図／全体地図、宿泊を実施。Expected: 対象発見が記録され、閉鎖領域へ入れず、会話・宿泊の既存挙動を維持。
- [ ] **Step 4:** バックグラウンド→復帰、ページreload、保存→再開、閉館時の操作を実施。Expected: 正規stage・記憶・発見が維持され、操作不能やUI block残留がない。
- [ ] **Step 5:** 10分程度探索し、継続的な引っ掛かり・著しい入力遅延・クラッシュの有無を記録する。実機FAILなら再現caseをTask 3へ戻し、関連自動テスト後に修正SHAで実機再試験する。
- [ ] **Step 6:** AC12をPASSにできた時だけ受け入れ完了とする。未確認なら「自動検証済み／スマホ実機待ち」。報告のコミット：docs: record phase2 mobile acceptance。

## 失敗条件と停止判断

- 機能・資料・Thread・猫通路・施設を二重追加したら差分を戻す。
- 旧saveの有効な進行・記憶・発見が失われる／stageが後退するなら互換FAIL。
- 六種類を必須化、比較の採点、未知キーの厳格化でstage計算を変える提案はAの範囲外。
- 王宮／14の入口や再訪先が増える、Finnや陰謀が確定するなら境界FAIL。
- 不具合が未再現なのに候補だけでランタイムを書換えない。
- 上限の既存制約、環境不備、自然schedule未確認を隠してPASSにしない。
- スマホ実機PENDINGでrelease完了としない。

## 受け入れ対応表

| 設計書条件 | 担当 |
| --- | --- |
| AC1 基準SHA・既存再利用 | Task 1 |
| AC2 六種類の取得・比較 | Task 2 |
| AC3 普通の生活資料 | Task 2・3 |
| AC4 閾値・未取得非表示 | Task 1・2 |
| AC5 自由比較・非採点 | Task 2・3 |
| AC6 仮説の文章 | Task 3 |
| AC7 未確定・未解放 | Task 3・4 |
| AC8 save round trip | Task 1・4 |
| AC9 比較重複防止 | Task 1・2 |
| AC10 人間／猫の経路・読書 | Task 2 |
| AC11 既存機能回帰 | Task 4 |
| AC12 スマホ実機 | Task 5 |

## セルフレビューと引継ぎ

Specの全ACを上表で担当へ割り当て、六種類とstage条件を分離した。既存補助の名前・返り値とplan内の参照を照合した。自然schedule、状態fixture、実入力、実タッチの証拠を区別し、REDが必要な修正と最初からPASSでよい特性テストを分けた。未再現候補へ予防的変更を指示していない。

実装前に本計画をレビューし、実行方法を選ぶ。推奨は同一セッションでのexecuting-plans：save・比較・会話の関連が強く、小さな修正を同じ基準で管理できるため。別エージェントによるタスク別実装とレビューも選択可能。選択前の本ターンではコード変更・テスト実行・commit・公開は行っていない。


実行記録：ユーザーの実装・commit・remote main push指示によりTask1〜4を同一セッションで実施。既存stage/save/ID/解放条件を保持し、2件のREDだけを最小修正。判断と証拠はdocs/superpowers/reports/2026-10-10-caer-veyra-phase2-verification.md、Task5は実機確認待ち。
