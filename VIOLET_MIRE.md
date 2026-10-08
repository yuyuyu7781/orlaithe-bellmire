# Orlaithe v35.1–v39.0 実装・検証記録

基準main: `c3679527a20f57c1b2b412ac0e25f1cf5d0a1e53`。環境設定と既存地域の主要配置は変更していません。

## 進行・互換性

3 Chapter / 8 Actを内部管理として追加しました。Bellmireの日常と鐘、湖周辺の石・岸・沈んだ道・円環、Hollow CrownとViolet Mireを分けます。各Actは依存・解放条件・地域・Journal hook・完了flagを持ち、既存4Threadと新しいViolet Mire Threadを参照します。保存version 1を維持し、読み込み時に旧発見・Threadから上位進行を再構築します。旧人物IDとローワンへの表示名移行、既存portrait fallbackも維持します。

World GraphにrequiredRegions / requiredThreads / requiredDiscoveries / anyDiscoveries / requiredDay / conditionalStateを整理しました。プレイヤーには章番号や達成一覧を出しません。

## Hollow Crown → Violet Mire

Hollow Crown訪問とThread進行に加え、裂け目・空・猫の冷風・鉱物筋のうち一つを観察すると出口を調べられます。通路を開く時は既存の特殊低水位が必要です。既存岩壁の狭い一角だけを通路へ接続し、基本地形は維持しています。

約38.5mの湿った上り通路を通り、約52×70mの湿地へ出ます。入口・中央木道湿地・奥部の3区画。泥、苔、細木、根、低木、低い修理済み木道、3つの深い水たまりと浅い水面を配置。基本色は緑・泥茶・青灰で、紫は小花と夕方の控えめな色差に限定しました。水は粗い不透明素材で、鏡面反射や高負荷shaderは追加していません。

木道の描画と歩行支持を同じ経路から作り、人間のcollision radiusは維持。深い水は水深・植生・木道で誘導します。一度到達した湿地の乾いた入口は通常水位でも安全に再訪できます。一方、Hollow Crownへ戻る通路は水位条件に従います。水位復帰時、通路滞在者は湖岸へ安全退避します。

## 探索・生活

人間観察8件、眺める2地点。木道、花、石、杭、水面、根、反射、古い道標を調べられます。反射は観察文と水色の控えめな違いで扱い、魔法映像や星座パズルにはしていません。

猫専用通路5本、発見3件（古い布・風の抜ける穴・花びら）、低いジャンプ足場7か所。刻印ばかりにはしていません。

採取人リスと木道保守のオーウェンの2人を追加。既存schedule・route・混雑回避・仮portraitを再利用し、朝昼の作業、夕夜の休憩小屋、雨の避難を持ちます。オーウェンは条件日に出口付近へ歩き、作業時だけ道具を持ちます。特殊低水位の通路が開いた9日周期の昼には旅人1人が現れます。

週周期の小事件4件：板の修理、花、濡れた荷物、遅れた旅人。調べるとJournalへ記録し、クエストUIは追加していません。Hollow Crownの石と水が湿地へ続く観察、星図との方向の似方、フィン・ネリッサ・エヴァン・Lunmere3人の短い会話差分を追加しました。

奥に少し整備された古い石道と壊れた終端を置き、道標を調べた時だけCaer Veyraの名前を知ります。本体へは行けません。

## 世界UI・人物・音

World Mapは出口発見で無名の湿地印、到達でViolet Mire、道標観察で未実装Caer Veyraの薄い印を表示。発見済み接続から陸路・舟路・条件付き経路の旅程を表示し、水没・未開放時の注意を付けます。自動操縦はありません。地図SVGは状態fingerprintで再利用し、無関係な保存変更で全DOMを再生成しません。既存の地図表示中3D描画停止を維持。

7スポット、地域セレクト、4ナビ対象、木道と乾燥地中心の簡素なミニマップを追加。Journalの既存記録を保持して印・線と旅の軌跡の閲覧を追加しました。

主要10人の軽いrelationship graphを追加し、知人・訪問地域・稀な移動方針を会話条件へ渡せます。既存フィンの地域移動を維持し、湿地保守人の出口への実移動を追加。ネリッサの新しい長距離通勤は実装していません。既存外来NPCの一部はWorld Graphの発見済み旅程を取得し、遠距離ではstate simulationへ切り替えます。全距離を実際に歩く方式ではありません。

春は花17、秋は11と草色の差。冬夏はprofile追加用の構造のみです。6天候の湿地色・霧を調整し、通常は薄い湿気、霧天は少し奥が隠れる程度。ambient profileを地域データに整理し、既存水・風音の低音量zoneと既存gain crossfadeを再利用。鳥・虫・木・滴りの音源未設定は安全に無音となります。

## 更新予算・監査

active / nearby / background / dormantを維持。現在地域の植物だけ粗い頻度で更新し、遠距離はschedule/event/stateのみ。120m以上離れた湿地の細部batchを省略し、地面・水面の遠景は残します。dormant動的collision枠を休止し、近距離と再訪安全検査では復帰します。湿地滞在の計測時は動的枠2 active / 44 sleeping。NPC到着後に古い回避地点へ戻る既存の不具合も修正しました。

30日高速進行では発見時系列をテスト側で設定し、日送り・水位再発・Thread/Act・schedule/event・保存再読み込みを検証しています。30日全ての手動操作ではありません。別の新規保存テストでは主要な解放と探索を実入力で検証します。

湿地の人間・猫558歩行サンプル、深水3箇所、足場7箇所、再訪地点とNPC接地を検査。既存Crown通路・床と市街地の接地監査、19カメラ、6天候、3品質、舟の人間/猫乗降と往復、旧保存、スマホ幅390pxのUIも検証しました。詳細結果はvalidation JSONに保存しています。

## 性能

同じカメラで基準mainと比較。Chromium software WebGLのcomposer全passを含むdraw callsです。meshは視錐台と交差する可視mesh数で、描画batch数とは異なります。H/S/MはHigh/Standard/Mobile。

|場面|calls H/S/M|triangles H/S/M|mesh H/S/M|基準calls H/S/M|
|---|---:|---:|---:|---:|
|Bellmire|2603/2603/2589|98337/98337/98323|2844/2844/2844|2603/2603/2589|
|Nine Stones|61/57/43|3808/2396/2382|42/42/42|61/57/43|
|Lake Lun normal|116/116/99|5178/5178/5004|99/99/96|116/116/99|
|Lunmere|211/215/201|5090/7670/7656|195/195/195|214/218/204|
|Caerith|64/60/46|5150/2570/2556|45/45/45|64/60/46|
|Drowned Way|83/83/69|5578/5578/5564|67/67/67|83/83/69|
|Lake Lun extremeLow|139/139/125|10548/10548/10534|122/122/122|139/139/125|
|The Ring|55/55/41|5802/5802/5788|40/40/40|55/55/41|
|Hollow Crown|53/53/39|4908/4908/4894|38/38/38|53/53/39|
|Violet Mire|70/74/60|10036/10616/10602|55/55/55|新規|

全scene meshは3527→3589（+62）。lights14、shadow casters207、transparent meshes34は維持。scheduled residents34→37（追加2住民＋稀な旅人）。既存場面の差は主にNPC可視状態の変化とCrown出口の小修正です。

update medianは短い60サンプルのscheduler/pose/地域更新時間であり、実機FPSの保証ではありません。各品質・場面のmedian/p95/active actor/予算はJSONに収録。実機スマホ、実GPUの長時間温度・電池・FPS、スピーカーでの音質は未確認です。

## 残課題

Caer Veyra本体、夏冬の本格差分、鳥虫等の収録音、全人物の実距離地域間歩行は未実装。World Mapには未知の余白を残しています。追加2人のportraitは安全な仮カードです。実機による水際操作と長時間性能の確認が必要です。

## 全地域訪問後の追加計測

湿地の発見前だけでなく、湿地を解放した後に既存地域へ戻った状態も計測しました。湖周辺では残した遠景・人物により最大約12 calls増えます。

|場面|calls H/S/M|triangles H/S/M|mesh H/S/M|
|---|---:|---:|---:|
|Bellmire|2603/2603/2589|98337/98337/98323|2844/2844/2844|
|Nine Stones|61/57/43|3808/2396/2382|42/42/42|
|Lake Lun normal|128/128/111|5860/5860/5686|111/111/108|
|Lunmere|223/227/213|5772/8352/8338|207/207/207|
|Caerith|76/72/58|5832/3252/3238|57/57/57|
|Drowned Way|84/84/70|5854/5854/5840|68/68/68|
|Lake Lun extremeLow|151/151/137|11230/11230/11216|134/134/134|
|The Ring|56/56/42|6078/6078/6064|41/41/41|
|Hollow Crown|58/58/44|13116/13116/13102|43/43/43|
|Violet Mire|70/71/57|10036/10480/10466|55/52/52|

最新の短時間update medianはHigh/Standardで0.1〜0.6ms、Mobileで0.1〜0.4msでした。機種間比較や長時間FPSとしては扱いません。

新規保存の通し試験はPASS。Bellmireから既存街道、宿泊翌朝、水位条件、古道、猫、舟とCaerith、Nine Stones刻印、特殊低水位、Ring、Crown、湿地、猫発見、物理的な湖岸帰還、保存再読み込みを実入力で確認しました。訪問済み地域への再訪を途中で利用しています。Lunmere3人全員への連続会話は別試験で扱います。

Lunmere一般住民の同一店舗利用者2組でhome座標が重複していたため、待機地点を店の左右へ分離しました。主要3人（マレン・ローワン・イーラ）の実入力会話を修正後に確認し、湿地の会話差分を取得しました。建物配置は維持しています。

最終実装コミット: `5ff212be512f578269e4285b8be163f262ed663e`。最終計測全場面のupdate median範囲: 0.1〜0.6ms。

実装コミット:

- `d2c7ca6` Orlaithe v35.1–v35.2: organize acts and data-driven world unlocks
- `6445416` Orlaithe v35.3–v38.9: connect Violet Mire exploration and world travel
- `c5d7540` Orlaithe v39.0: keep wetland revisits and visitor routes safe across water states
- `3ce7db2` Orlaithe v39.0: validate actor arrivals and suspend dormant collision work
- `0c984b5` Orlaithe v39.0: simplify distant Mire detail without removing its landscape
- `5ff212b` Orlaithe v39.0: separate shared shop resident idle positions
