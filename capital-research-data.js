// Stable save keys: read/comparison/trace state uses existing discoveries, not a parallel save.
export const researchDocuments=[
 {id:'passage',category:'通行記録',title:'外門通行帳',rooms:['cv-records','cv-passage'],point:[-4,1,5],text:'麦の荷車二台、家族を訪ねる旅人五人。門を通った普通の一日が、同じ幅の欄に記されている。'},
 {id:'commerce',category:'商業記録',title:'食料と荷役の帳簿',rooms:['cv-archive','cv-guild'],point:[-4,1,6],trace:'margin',text:'本文は麦、油、昼食の勘定。余白にだけ「下水門前へ二籠」と走り書きがある。今の荷役所に、その地名はない。記録の主題ではなかったらしい。'},
 {id:'building',category:'建築台帳',title:'改修前の建築台帳',rooms:['cv-records'],point:[4,1,3],trace:'stairs',text:'壁の横に、下へ折れる階段が描かれている。現地の改修札ではそこは床になっている。壁厚の数字は書き直されていない。埋めたのか、図を直し忘れたのか。'},
 {id:'canal',category:'水路点検記録',title:'水路区画の点検綴り',rooms:['cv-sluice','cv-archive'],point:[4,1,-4],trace:'fourteen',text:'今の点検順は12、13、15、16。古い綴りには14もある。入口位置の欄は読めない。区画統合か、別の分類へ移った番号かもしれない。'},
 {id:'bell',category:'鐘楼修繕記録',title:'軸と返り音の修繕帳',rooms:['cv-bell','cv-archive'],point:[-2,1,1],trace:'ratio',text:'軸の長さと綱の間隔、返り音の待ち時間が並ぶ。Bellmireで見た古い比率に近いが、同じではない。古鐘楼の共通様式でも説明できそうだ。'},
 {id:'oldMap',category:'古地図',title:'三年代の都市図',rooms:['cv-maps'],point:[-4,1,3],trace:'shift',text:'同じ道の曲がりが、年代ごとに少し動いている。一枚だけずれが大きい。再測量の誤差か、道の高さや位置を変えた記録なのか、図だけでは決められない。'},
 {id:'district',category:'区画図',title:'現在の区画図',rooms:['cv-records','cv-maps'],point:[4,1,6],text:'排水と通行の境界が引かれている。区画の名前は統合され、古い呼び名は索引に回されている。今日の修理申請も、欄外に挟まっている。'},
 {id:'family',category:'家系記録',title:'住まいと家族の綴り',rooms:['cv-archive'],point:[-4,1,-3],text:'結婚、転居、同居する家族の名。隣の利用者は祖母の住所を探している。読めない字に、後から小さな付箋が添えられている。'},
 {id:'waterMemory',category:'区画図',title:'旧区画の排水配置図',rooms:['cv-archive'],point:[4,1,3],trace:'memory',text:'この年代の図には、旧区画から見える水路がない。エルダの「昔はここから水が見えた」という話とは少し違う。水路ではなく水面だったのか、年代の記憶なのか。'},
 {id:'repair',category:'建築台帳',title:'再利用石材の補修控え',rooms:['cv-val'],point:[-3,1,2],text:'古材の寸法と今日の補修先。出所欄が空いた石にも、荷受けと加工の勘定は残っている。古い石を使っただけで、由来まで分かるわけではない。'},
 {id:'palace',category:'建築台帳',title:'高台基礎の測量写し',rooms:['cv-maps','cv-observatory'],point:[3,1,-4],text:'今の王宮の輪郭より下に、向きの違う基礎線が残る。古い擁壁の再利用か、別の構造か。建物の種類と建てた人の名は、この写しにはない。'}
];
export const researchTraces=[
 {id:'wall-stairs',ward:'civicWard',point:[-7,0,12],label:'階段があったかもしれない床',text:'継ぎ目が途中で壁へ折れる。階段の図とは幅が近いが、ここだけでは確かめられない。'},
 {id:'old-paving',ward:'civicWard',point:[7,0,12],label:'壁へ入る舗装',text:'古い石の列は、今の窓の下へ続いている。外壁を建て直した時、道を残したのかもしれない。'},
 {id:'arch-layer',ward:'oldQuarter',point:[-7,0,12],label:'窓の下の旧アーチ',text:'現在の窓より低い位置に、別の弧が残る。今も家の壁として使われている。'},
 {id:'foundation-turn',ward:'oldQuarter',point:[7,0,12],label:'街路と合わない基礎',text:'基礎の石だけが、道に対して斜めに並ぶ。いつの道を向いていたのかは分からない。'},
 {id:'sealed-door',ward:'canalWard',point:[-7,0,12],label:'点検壁の塞いだ扉',text:'小さな扉を石で埋めた跡。周りの継ぎ目は雨で少し濃くなる。点検路の変更でも説明できそうだ。'},
 {id:'district14',ward:'canalWard',point:[7,0,12],label:'旧点検口の札',text:'現在の札は13から15へ続く。低い石に14の端だけが残る。扉は塞がれ、今回ここからは入れない。'},
 {id:'bell-seam',ward:'civicWard',point:[-7,0,-12],label:'鐘楼の補修継ぎ目',text:'古い軸受けと新しい金具で、寸法の取り方が違う。鐘は今日も普通の時刻を知らせる。'},
 {id:'map-height',ward:'scholarHeights',point:[7,0,12],label:'測量の高さ印',text:'道の高さを示す二つの印。年代の違いか、測り直した基準の違いか。'},
 {id:'palace-layer',ward:'scholarHeights',point:[-7,0,12],label:'王宮基礎を遠くから見る',text:'遠い高台で、新しい石の下に向きの違う古石と閉じたアーチが見える。王宮以前の擁壁かもしれない。近づく道はない。'},
 {id:'bread-arch',ward:'lowerWard',point:[-7,0,12],label:'店先に残る古門',text:'門の古い石に、今日の献立が掛かっている。使い続けるために、内側だけ何度も直したらしい。'},
 {id:'wall-thickness',ward:'oldQuarter',point:[-7,0,-12],label:'厚さの違う壁',text:'修繕した面の奥に、別の厚さの壁が続く。ヴァルは今日使う石を、その手前で選んでいる。'},
 {id:'old-height',ward:'canalWard',point:[7,0,-12],label:'水路脇の旧床高さ',text:'今の通路より低い線に、古い床の縁が残る。水位か、道路の改修に合わせて上げたのかもしれない。'}
];
export const researchCatFinds=[
 {id:'shelf-number',room:'cv-archive',point:[-10,0,-5],label:'書架裏の壁番号',text:'紙の匂いの奥。石の低い場所に、14に似た二つの傷がある。'},
 {id:'archive-wood',room:'cv-archive',point:[10,0,-3],label:'搬入口の木片',text:'乾いた木片に、薄い数字が残る。机の上からは見えない。'},
 {id:'records-floor',room:'cv-records',point:[-7.6,0,-3],label:'台帳棚の裏の旧床',text:'棚の裏に、今の床より低い石の縁がある。隙間は猫の幅だけ。'},
 {id:'bell-cavity',room:'cv-bell',point:[-3,0,-1],label:'鐘楼基部の空洞',text:'冷たい風が、小さな壁穴から戻ってくる。音は鐘より近い。'},
 {id:'val-arch',room:'cv-val',point:[-6.8,0,-2],label:'古材棚の裏の弧',text:'石材の奥に、埋まった弧の上端が見える。木屑は今日のもの。'},
 {id:'canal-number',ward:'canalWard',point:[12,0,12],label:'運河壁の低い番号',text:'低い壁の裏に14。湿った継ぎ目の中に、数字の底だけが残る。'},
 {id:'civic-drain',ward:'civicWard',point:[12,0,12],label:'資料搬入路の下',text:'低い排水路の石は、上の舗装とは違う方向へ続く。'},
 {id:'old-cavity',ward:'oldQuarter',point:[12,0,12],label:'旧壁の小さな空洞',text:'壁の中に、足音の返る小さな空間。向こうへは通れない。'},
 {id:'old-floor',ward:'oldQuarter',point:[12,0,-12],label:'旧排水溝の床縁',text:'石の隙間に、もう一段低い床の端がある。乾いた紐が引っ掛かっている。'},
 {id:'canal-wood',ward:'canalWard',point:[12,0,-12],label:'点検口の木の札',text:'古い木札の端。今の札とは違う位置に釘穴がある。'}
];
export const researchStages=[
 {id:'olderLayerSuspected',minTraces:4,minPairs:2,physical:true},
 {id:'conflictingSources',minTraces:2,minPairs:1},
 {id:'tracesRemain',minTraces:1,minPairs:0}
];
export function researchStage(data){const has=k=>!!data.discoveries[k],traces=researchDocuments.filter(d=>d.trace&&has('cv:doc:'+d.id)).length,pairs=Object.keys(data.discoveries).filter(k=>k.startsWith('cv:compare:')).length,physical=researchTraces.some(t=>has('cv:trace:'+t.id))||researchCatFinds.some(t=>has('cv:research-cat:'+t.id));return researchStages.find(s=>traces>=s.minTraces&&pairs>=s.minPairs&&(!s.physical||physical))?.id??null;}
export const researchReplies={
 cvEdras:'消えたものを探すより、残ってしまったものを見る方が早いのかもしれません。消えた理由まで、分かったわけではありませんが。',
 cvLyune:'無い資料と、見つからない資料は違います。別の分類へ移された束もありますから。',
 cvCassian:'区画統合、水路変更、住居の移転。普通の都市再編でも、古い名前と図が合わなくなることはあります。',
 cvOrm:'古い鐘楼は似た造りになることもある。間隔と、響きの返りをもう一度測ろう。同じだとはまだ言えん。',
 cvSerena:'方向と高さを残してください。年代の違う図を、同じ基準で並べたとは限りません。',
 cvYulio:'少しのずれは測量でも起きる。でも、この年代だけは大きい。街路の位置を変えた記録も探してみます。',
 cvNoah:'一緒に置くと似て見えますね。……でも、合わないところもそのまま残しておいた方がよさそうです。',
 cvElda:'下水門前って呼んでいたよ。朝の籠を取りに行ったもの。図の年代までは、私は覚えていないねえ。',
 cvVal:'塞いだなら理由がある。誰が塞いだかまでは、石には書いてない。',
 cvGaren:'14は古い点検綴りにある。今の入口にはない。番号を変えたのか、使わなくなったのか。舟の順番は今の札で見る。',
 cvSophia:'荷役帳の余白なら、急いで書いた呼び名が残ることもあるよ。荷の勘定とは、分けて読んでね。',
 cvMira:'帳面を見るのもいいけど、朝食の分は残しておくよ。今ここにいる人の名前も、忘れないでね。'
};
