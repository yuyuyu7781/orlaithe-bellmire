# Caer Veyra Story Phase 2：最新main照合と設計案
作成日：2026-10-10（日本時間）
基準：yuyuyu7781/orlaithe-bellmire / main / 22ab0b88729379e068e6ee12067b6a20fd5d59f0
状態：実装前レビュー用。ゲームコード・GitHub・saveは変更していない。テストは今回未実行。
今回の作業は既存Phase 2の要件照合と補強設計。新しいPhase 2を作り直さない。

## 1. 目的と固定する境界
「記録から消えたもの」より「消えたはずなのに残っている痕跡」を探す。
公文書・普通の帳簿・古地図・建築痕跡・人の記憶・猫だけの物理的痕跡を並べ、
現在の都市より古い層がある可能性を感じさせる。原因と正体は決定しない。

王家の陰謀、秘密結社、Finnの正体、区画14の正体・入口、王宮内部は確定・解放しない。
旧地名・欠番・古石だけで意図的削除を断定しない。改修、統合、再測量、転写ミス、
石材再利用、記憶の年代違いを併記できる内容とする。
既存5区画、人物ID、14portrait、他地域、宿泊・舟・水位・解放条件を維持。

## 2. 照合結果：既存／不足／新規
「既存」はソースで確認した存在。「動作合格」は新しい実行証拠が必要。

| 項目 | 既存実装 | 不足・確認事項 | 今回新規にする範囲 |
| --- | --- | --- | --- |
| 主題 | CAER_VEYRA_REMAINING_TRACES.mdに同じ第2段階の仕様 | 報告と現行コード・実機体験の一致を再検証 | 要件と証拠の対応表 |
| 資料 | capital-research-data.js：11種類、8カテゴリ。施設配置は15か所 | 全15か所には一般室内も含まれる。専用8室だけの巡回で全設置点を確認した扱いにしない | 配置ごとの検証一覧 |
| 普通の生活 | passage/family/district/repairと普通の市民・朝食 | 普通の資料をすべて謎へ変えない | 回帰シナリオ |
| 建築 | researchTraces 12件 | 各形状と観察文の対応・接地・近接操作を再検証 | 新規地形は原則なし |
| 猫 | researchCatFinds 10件、室内5＋屋外5経路 | 人間が通れない／猫なら通れる実移動、文字解釈をさせない確認 | 両モードの負例テスト |
| 記憶 | cv:elda-memory。既存エルダ会話から記録 | 最終stageの必須条件ではない。会話内容と記録の対応を確認 | 六種類を並べる受け入れシナリオ |
| 比較 | 既読の資料・猫・建築・記憶を2〜3件選択、手動記録 | どんな組合せでも比較件数に入る。関連性や六種類の利用を判定しない | 重複・未知キー・未読証拠の負例検証 |
| 古地図 | 三年代の簡略図。再測量・改修を断定しない | 精密な座標パズルではない。図と現地の観察を接続できるか | 操作シナリオ |
| 人物 | 12王都人物のresearchReplies＋Finn差分、翌日以降の第2接触 | 優先される既存会話を覆わないか。条件外のFinn反応を確認 | 優先順位の回帰 |
| 進行 | 既存caerVeyraRecordsに3stageを追加済み | 系統数の実体はtrace付き資料の種類数。物理・記憶はその系統数に含まれない | 境界値テスト |
| セーブ | version 1、既存discoveries/Journal、stage許可リスト | 保存だけでなくsync後のstage、旧比較キー、容量上限を確認 | 旧・新saveの比較検証 |
| スマホ | 390px Chromium用テストと過去報告 | 実機GPU・実タッチの合格証拠はない | 最終実機チェック |

今回の依頼を「未着手」と扱うと、資料UI・Thread・専用室内・猫経路の二重実装になる。
存在する処理を再利用し、不足の検証と小さな補強に限定する。

## 3. 進め方の選択肢
A：既存維持＋検証補強（推奨）
- 六種類の組合せを体験シナリオで保証する。
- 関連する比較を自動採点しない。既存の自由な比較・stage閾値を維持。
- 古い層を断定する文や、既存会話の優先順位に問題があれば対象箇所だけ修正。
- 新saveフィールド、必須条件、地域解放、室内を増やさない。

B：六種類を最終stageの新しい必須条件にする
- 構造上は明確だが、既に最終stageへ達したsaveの後退、会話待ち、猫操作の強制が発生しうる。
- この案を選ぶ場合だけ、旧到達の保持と比較の証拠モデルを別仕様として設計する。
- 今回の推奨案には含めない。

C：Phase 2を全面再構成
- 既存資産・saveとの重複が大きい。今回の目的に不要。

以下はAの設計案。実装を開始するための承認はまだ得ていない。

## 4. 六種類の証拠と探索導線
全種類を一度に要求するパズルにはしない。複数の入口から自由に読む。

| 種類 | 既存ID | 他の証拠とのつながり | 残す別解 |
| --- | --- | --- | --- |
| 公文書 | cv:doc:building / canal / district | 階段、旧床、点検番号 | 改修、番号統合、分類替え |
| 普通の帳簿 | cv:doc:commerce | エルダの下水門前という呼び名 | 急ぎの走り書き、非公式な地名 |
| 古地図 | cv:doc:oldMap / waterMemory | 現在の区画図、測量印、記憶 | 再測量、年代違い、水面と水路の違い |
| 建築 | cv:trace:wall-stairs / old-height / arch-layer等 | 建築台帳、旧床、地図 | 再利用、道路改修 |
| 人の記憶 | cv:elda-memory | commerce / waterMemory | 日常の記憶であり年代は不明 |
| 猫の物理痕跡 | cv:research-cat:records-floor / old-floor / shelf-number等 | 建築、台帳、点検綴り | 猫は傷・風・匂い・床縁だけを認識 |

推奨する受け入れプレイ：
1. 通行記録や家系資料から「現在も暮らしに使う場所」を体験する。
2. commerceとエルダの生活の呼び名を並べる。
3. buildingとwall-stairsを並べる。
4. oldMapとdistrictまたはmap-heightを並べる。
5. waterMemoryとエルダの記憶を並べ、どちらも嘘と決めない。
6. 猫でrecords-floor等を実際に発見し、人間へ戻って建築資料と並べる。
7. 古い層の可能性が見えるが、入口・由来・建てた主体は不明のまま終える。

ここでの7手順は検証用の代表例。プレイヤーの必須順序ではない。
区画14やFinnの稀な会話は最終stageの必須にしない。

## 5. 現行stageと依存関係
researchStage(data)の現行定義：
- tracesRemain：trace付き資料1種類以上。
- conflictingSources：trace付き資料2種類以上＋比較キー1件以上。
- olderLayerSuspected：trace付き資料4種類以上＋比較キー2件以上＋建築または猫発見1件以上。
- 全資料取得、全猫発見、エルダ会話、Finn遭遇は要求されない。
- 同じ資料の別設置点は同じdoc ID。同じ比較は選択キーをソートして記録する。
- 比較2件は独立した組合せだが、証拠の独立性・関連性を自動判定していない。

依存する順序：
王都到着 → 既存の到着日起点の区画条件 → 開いている施設／物理痕跡
→ discoveriesへ発見記録 → 比較UIの候補 → 比較記録
→ researchStage → capitalLife.syncのcaerVeyraRecords更新
→ Journalの研究段階記録・人物反応・既存Chapter/Act。

区画解放は変更しない：
- Canal：到着＋1日、market/gate/guideのいずれか。
- Civic：到着＋2日、Canal訪問、notice/canal-level/canal-ledgerのいずれか。
- Scholar：到着＋3日、Civic訪問、records-map/archive-catalog/scholar-introのいずれか。
- Old：到着＋4日、Scholar訪問、old-map/elda-direction/cat-old-entryのいずれか。
- 既存のrequiredDiscoveries等の全条件を省略せず使用する。
- 新たな「Phase 2完了」をOld解放条件へ追加しない。循環依存を作らない。

## 6. ソースから見つかった確認点
確定した実装上の性質：
- 比較件数はcv:compare:という接頭辞のキー数で数える。
- 2件と3件の一部重複する比較も別件として数える。
- 猫だけ、記憶だけ、建築だけでは最初のresearchStageへ入らない。
- 資料ボタンはdocを1種類以上読んだ時だけ出る。
- 実際の資料本文を更新しても、既存Journal本文はsave内の旧文が残る。
- discoveriesは先頭1000件、Journalは末尾400件まで読み戻す。
- 最終Journal文は「都市の石にも、古い層の痕跡が残っている」と断定寄り。
- 研究会話wrapperはhuman・index%3===1・researchStageの条件を先に評価し、
  Finnについては地域と鐘の優先反応の条件をこのwrapperでは検査していない。
- syncは現在証拠からThreadを再計算する。新条件を追加すると保存済stageが後退しうる。

未確認・バグ候補として検証するもの：
- 手で作った未知／未読比較キーが件数へ入る時のstage。
- 六種類を使わず最終stageへ到達する体験が今回の意図を損ねるか。
- Finnの研究反応が鐘の異変当夜の反応を上書きするか。
- 猫発見・建築・記憶だけを持つ保存から比較画面へ入れるか。
- nightで比較画面を閉じた時やJournal経由時に他UIの入力blockが残るか。
- 同じ比較の再記録とJournal上限後の再記録で重複やstate変更が起こるか。

これらは今回実行して再現した不具合ではない。テストで現象を確定してから修正する。

## 7. 失敗条件
F1：既存資料ボタン、Thread、doc ID、NPC、専用室内、猫経路を重複追加する。
F2：旧saveの発見・記憶・日付・舟dock・Threadが消失／後退する。
F3：公文書と帳簿をすべて陰謀資料にし、生活が背景から消える。
F4：猫の観察が古文書の解読、年代断定、人物の正体説明になる。
F5：区画14や王宮内部が地図・再訪・歩行・猫抜け道から解放される。
F6：新手掛かりの必須化により閉館・稀なFinn出現・未開放区画で進行が詰まる。
F7：鐘の異変等の既存会話優先順位、NPC自然schedule、宿泊が壊れる。
F8：比較UIを閉じても操作できない／他UIが開いているのに操作が復帰する。
F9：読んだ順で同じ証拠集合のstageが変わる、比較やJournalが無制限に重複する。
F10：実機未確認をスマホ合格と記載する、状態注入テストを自然な通しプレイと記載する。

## 8. 受け入れ条件
AC1：mainのSHAとPhase 2対象ファイル一覧を記録し、既存機能を再利用する。
AC2：六種類すべてを実入力で発見／会話し、2〜3件を自由に並べられる。
AC3：普通の通行・家族・朝食の記録は通常の生活資料として残る。
AC4：stageの閾値を現行のまま維持し、未取得証拠をUI候補に表示しない。
AC5：並べた記録は類似と不一致を残し、正解／CLEAR／原因の自動採点を出さない。
AC6：最終文は「今の都市より古い構造があるのかもしれない。改修や再利用だけで説明できる部分もある。」
という水準の仮説。年代・建造者・地下宮殿を断定しない。
AC7：区画14、王宮、Finn正体、陰謀・結社は未確定・未開放のまま。
AC8：保存→再読込→sync→再保存で既存の有効な記憶・発見・Threadを維持する。
AC9：比較の同一選択を順序変更して繰り返してもdiscoveriesのキーは増えない。
AC10：人間は猫専用通路で通れず、猫は実移動で発見できる。猫ではdoc読書不可。
AC11：施設の開館、5区画の既存解放、旧地域・舟・休息・portrait・Journal・地図の回帰が通る。
AC12：PC確認の後、スマホ実機で最終確認し、端末・ブラウザ・対象SHA・結果を記録する。

AC6の文変更が必要なら新規Journal生成時の文だけ変更する。
過去のJournalを一括書換えしない。既存save本文が旧文のままであることを互換上の制約として報告する。

## 9. save互換方針
SAVE_KEY=bellmire.stay.v1、SAVE_VERSION=1、人物・地域・資料・Thread IDは固定。
新Threadや第二の保存領域を作らない。既存stage許可リストとderiveProgressionを保持する。
推奨Aでは新しい必須発見・stage閾値・saveフィールドを追加しない。

fixture：
S0：新規Day1、王都・研究データなし。
S1：王都前のv1、旧Lunmere名・会話記憶・鐘・舟dockを含む。
S2：王都到着済み／portrait以前／stage arrival, ordinary, missing, compared。
S3：研究途中。各stage、doc、比較、建築、猫、エルダ記憶を含む。
S4：既存olderLayerSuspectedだがエルダ記憶・猫発見の一方を持たない正規データ。
S5：同じ証拠を異なる順序で取得した保存。
S6：不正stage、未知比較キー、未読比較キー、1000件に近いdiscoveries、400件を超えるJournal。
S7：保存不可／容量不足／不正JSON／未来version。

S0〜S5はvalidな既存saveを維持。S6〜S7の期待値は現行validatorの仕様を先に確認する。
未知データ全保持や、すでに上限で切り捨てられたデータの復元は約束しない。
テストは専用origin・ブラウザcontextの合成saveで行い、ユーザーの実saveを上書きしない。

## 10. テスト戦略
以下のコマンドは開発環境での実行計画。今回の合格結果ではない。
CLIは既存ES module設定を確認。package.jsonがない環境ではNodeのmodule既定設定を明示する。
ブラウザ補助はPlaywright・/usr/bin/chromium・port8001のローカルHTTP・Three.js読込が必要。
既存bootがCDNへアクセスする。個人情報／実saveを外部に送らない。

### 10.1 先に既存基準を測る
- node --experimental-default-type=module tools/check_capital_research.mjs
- node --experimental-default-type=module tools/check_capital.mjs
- node --experimental-default-type=module tools/check_stay_state.mjs
- node --experimental-default-type=module tools/check_world_graph.mjs
- node --experimental-default-type=module tools/check_story_thread.mjs
- python3 -m http.server 8001（リポジトリroot、別の実行枠で起動）
- node tools/capital-research-compat.cjs
- node tools/capital-research.cjs
- node tools/capital-research-ui.cjs
既存FAILは変更前の問題として記録し、実装後のFAILと区別する。
成功条件：exit0、assert失敗なし、ブラウザpageerrorなし。

### 10.2 stageと比較の境界
既存check_capital_research.mjsに目的のある負例を加える：
- 資料0→null、1→tracesRemain。
- 1資料＋比較1→tracesRemain、2資料＋比較0→tracesRemain。
- 2資料＋比較1→conflictingSources。
- 3資料＋比較2＋物理1→conflictingSources。
- 4資料＋比較1＋物理1→conflictingSources。
- 4資料＋比較2＋物理0→conflictingSources。
- 4資料＋比較2＋建築1→olderLayerSuspected。
- 4資料＋比較2＋猫1→olderLayerSuspected。
- traceのないpassage/family/repair/districtは系統数を増やさない。
- 同じdocを別施設で読む、同じ比較を逆順・再読込後に記録しても件数は増えない。
- 1件比較ボタンdisabled、4件目は選択されない、未知／未読選択をUIから作れない。
- 件数判定への未知キー注入は現行挙動を明記する。黙ってsave仕様を変更しない。

### 10.3 六種類と実操作
新しい tools/capital-phase2-acceptance.cjs を追加する場合の責務：
- 上記六種類の代表ルートをEキー／タッチ操作で読む。
- エルダの自然配置を使うテストと、人物配置fixtureを使うテストを分ける。
- 猫は通路手前→通過→発見→人間へ戻る→比較。直接発見フラグを入れた確認と区別。
- fixture利用時の前提はログに記録。完全な新規通しプレイとは呼ばない。
- 11資料の論理IDと15設置点を別カウントで確認。
- 閉館時、区域未開放、人間で猫経路、猫でdoc読書を負例にする。
- 旧地名・点検14・王宮遠景から新入口が増えない。

### 10.4 人物と非解放の境界
tools/capital-research-people.cjs / capital-closures.cjs を再利用。
- Finn：未研究・中間・最終、王都／Bellmire、昼／鐘の異変当夜、human/catで会話を確認。
- 第2接触：第1未遭遇・同日・不在時は不可。翌日以降でも稀な自然来訪が必要。
- エルダ：一般会話と研究会話、記憶の保存。会話で歴史の事実を断定しない。
- 14人物のID・portrait・日課を保持。扉を開けただけでNPCを召喚しない。
- 未確定領域は名前検索だけでなく、地図選択／再訪／歩行／猫抜け道から未解放を確認。
- 会話・資料・Journalは全文を人が読み、仮説と事実の書き分けを確認。

### 10.5 saveとUI
既存capital-research-compat.cjs、capital-save-compat.cjsを拡張してS0〜S7を試す。
保存直後だけでなく、reload→capitalLife.sync→flush後の内容を照合する。
- 350msの遅延保存を待つかflush()を使い、保存前状態と取り違えない。
- 比較UI・Journal・地図の開閉を連続実施し、他UIのinput blockを解除しない。
- 390pxで長文・3列相当・スクロール末尾でも閉じる操作ができる。
- 再読込後、stage・人物記憶・発見・Journal・dock・水位・旅履歴の対応を確認。
- 1000件近いdiscoveriesで切捨て問題が出たら、上限変更を別判断にし、隠さない。

### 10.6 性能と最後の実機
capital-research-perf.cjsを同じ日・カメラ・品質で実装前後測定。
推奨Aはgeometry・ライト・常駐NPC・毎frame処理を追加しない。
固定条件で差が出たらNPC/LODの揺れを分離して原因を説明。
SwiftShaderのdraw callsやCPU update時間を実機FPSと同一視しない。

スマホ実機は最終手順：
1. 対象SHAの確認済みテスト版を開く。実saveに触れない検証環境を使う。
2. 縦画面で移動、近接操作、資料再読、2〜3件比較、長文スクロール、閉じる。
3. 猫通路、猫→人間切替、Journalリンク、都市図／全体地図、宿泊を確認。
4. バックグラウンド→復帰、ページ再読込後の保存、閉館時の表示を確認。
5. 10分程度探索して著しい操作遅延・継続的な引っ掛かり・落ちる現象がないか記録。
6. 機種・OS・ブラウザ・画面向き・品質・SHAと結果を残す。
実機で修正が必要になったら、関連自動テスト後に実機を再確認する。
実機未確認はrelease判定「保留」。PCエミュレーションで代用しない。
公開、merge、実save利用はこの設計依頼だけで実施しない。

## 11. 変更候補と作業順
| 順番 | 対象 | 目的 | 前提 |
| --- | --- | --- | --- |
| 1 | 上記CLI・既存browser tools | 未変更基準とfixtureを記録 | 対象SHA固定 |
| 2 | check_capital_research.mjs / compat tools | 境界値と旧save回帰の不足を埋める | 1 |
| 3 | capital-phase2-acceptance.cjs（新規候補） | 六種類と未解放境界を一つの受け入れシナリオにする | 既存操作helper再利用 |
| 4 | capital-research.js（必要時だけ） | Journalの断定回避／再現した会話優先順位・UI不具合の修正 | 対象の失敗テスト |
| 5 | caer-veyra.js / data / dedicated interiors | 不具合が再現し、このファイルが原因の場合だけ変更 | 2〜4の証拠 |
| 6 | 関連回帰・同条件性能測定 | 既存機能と負荷を確認 | 変更完了 |
| 7 | スマホ実機・検証報告 | 最終受け入れ | 6合格 |

stay-state.js / progression-data.js / capitalUnlocksは推奨案では変更しない。
修正が必要ならsave互換と解放条件への影響を先に再設計する。
これは変更順と設計案であり、ファイル・関数・失敗テストを確定した正式実装計画は
この案のレビュー後にwriting-plansで作る。

## 12. 証拠と限界
この文書の既存判定は基準SHAのソースを読んだ結果。
過去報告のPASSは現行環境での今回のPASSではない。
ゲームコードの変更、テストの再実行、スマホ実機の確認、commit、公開は未実施。

主な参照（すべて基準SHA）：
- CAER_VEYRA_REMAINING_TRACES.md
- CAER_VEYRA_BOUNDARIES.md
- capital-research-data.js / capital-research.js
- capital-dedicated-interiors.js / caer-veyra-data.js / caer-veyra.js
- stay-state.js / progression-data.js / story-thread-data.js
- tools/check_capital_research.mjs
- tools/capital-research.cjs / capital-research-compat.cjs
- tools/capital-research-ui.cjs / capital-research-people.cjs / capital-research-perf.cjs

参照root：
https://github.com/yuyuyu7781/orlaithe-bellmire/tree/22ab0b88729379e068e6ee12067b6a20fd5d59f0

レビューで決めること：
推奨A（既存stageとsave互換を保ち、六種類の探索を受け入れテストで保証する）を採用するか。
六種類を新たな最終stage必須条件にしたい場合はBへ切替え、互換仕様から改めて計画する。

