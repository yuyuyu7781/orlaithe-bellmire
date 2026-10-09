# 室内入室時の文字面監査

## 原因

ミラの宿の入室 spawn は world `(200, 0, 10.5)`、human camera は
`(200, 1.65, 10.5)`、向きは室内奥（-Z）。専用室内の `sign()` が
「食堂・朝食と旅人の宿」を local `(0, 1.75, 10)`、幅2.8m×高さ0.5mの
薄い箱として通路中央に置いていた。正面の ray hit は約0.4875m。
そのためカメラに極端に近い文字面が大きく投影された。
parent は室内root、scale は `(2.8, .5, .025)`。billboard / Sprite /
DOM UI の混同や保存データの異常ではない。

同じ sign helper が公文書館・記録院・鐘楼・天文台・地図庫・ヴァル工房・水門管理室にもある。
一般王都室内と Bellmire / Lunmere の室内にはこの helper はない。

## 修正

- 共通 sign helper を壁面固定の `PlaneGeometry(2.8, .5)` に変更。
- 左右壁では室内へ向く rotation、奥壁では +Z 向き。scale は `(1,1,1)`。
- 壁から .14m の位置へ置き、通路中央の立て看板と支柱を除去。
- 入口側の文字は横壁へ移し、入室正面を空ける。
- 奥壁付近の案内だけ奥壁へ配置。他の案内を同じ奥壁位置に重ねない。
- 文字内容・zone論理座標・入室 spawn/yaw・家具・NPC・宿泊・save形式は維持。
- 3D案内は室内root所属の通常Mesh。UI文字やカメラ追従レイヤーへ移さない。
- module query を更新し、専用内装の旧版をキャッシュから使い続けないようにする。

## 検証

`node tools/interior-entry-view.cjs`

PC 1280×800 と mobile touch simulation 390×844 で全 shop interior の入室視界を検査。
画面内15方向の raycast により入室直後に1.5m以内の文字面がないことを確認する。
文字Meshの parent、unit scale、PlaneGeometry を検査。
ミラの宿の入室直後スクリーンショットを双方で確認。
ミラとの会話、寝床選択・翌朝への宿泊、全室の退出は実キーボード／タップ入力で確認する。

検査対象:

- Bellmire: パン屋、古書店、宿屋、酒場、天球儀店
- Lunmere: 宿、食堂、舟小屋、小商店、住宅2室
- Caer Veyra: 宿、食堂、通行所、衛兵詰所、工房、水門管理室、舟運組合、倉庫事務所、旧水路点検室、記録院、公文書館、行政庁、中央鐘楼、天文台、地図庫、学院、旧鐘楼、ヴァル工房、エルダ家、半地下室

修正前に実症状を再現したのはミラの宿。他室内は同種の配置と修正後の入室視界を監査。
検証は Chromium / software WebGL / touch simulation。実iPhone・Androidでの確認は未実施。

変更: `capital-dedicated-interiors.js`, `caer-veyra-interiors.js`,
`tools/interior-entry-view.cjs`, 本書。環境設定変更なし。

結果: 31室 × PC/touch の62入室検査 PASS。ミラの宿で正面に当たる文字面は
修正前 .4875m → 修正後 22.36m（奥の壁面案内）。PC / mobile画像を目視確認。
会話・宿泊の日付更新・全31室の退出 PASS、browser error 0。
