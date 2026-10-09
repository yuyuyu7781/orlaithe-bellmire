import {lodgingFacilities,lodgingCharacters} from './lodging-data.js';
import {applyCapitalPortrait} from './caer-veyra-portraits.js?v=52.6';
// Capital data stays independent of the renderer, clock and save consumers.
export const capitalId='caer-veyra';
export const capitalRoad=[[-479,5.3,-248],[-490,5.8,-256],[-508,6.7,-270],[-532,7.4,-289],[-553,8,-309],[-562,8,-320],[-578,8,-320],[-600,8,-320]];
export const capitalWards=[
 {id:'lowerWard',name:'下層市街',english:'Lower Ward',center:[-600,8,-320],size:[76,76],population:18,ambient:'capital-market',connections:['canalWard','civicWard'],entry:[-578,8,-320]},
 {id:'canalWard',name:'水路区',english:'Canal Ward',center:[-684,8,-320],size:[76,76],population:16,ambient:'capital-canal',connections:['lowerWard','civicWard'],entry:[-650,8,-320]},
 {id:'civicWard',name:'中央区',english:'Civic Ward',center:[-644,8,-410],size:[78,76],population:14,ambient:'capital-civic',connections:['lowerWard','canalWard','scholarHeights','oldQuarter'],entry:[-644,8,-377]},
 {id:'scholarHeights',name:'高台学術区',english:'Scholar Heights',center:[-730,16,-425],size:[76,78],population:10,ambient:'capital-heights',connections:['civicWard'],entry:[-700,16,-425]},
 {id:'oldQuarter',name:'旧区画',english:'Old Quarter',center:[-560,10,-430],size:[70,78],population:6,ambient:'capital-old',connections:['civicWard'],entry:[-588,10,-430]}
];
export const capitalLinks=[
 {from:'lowerWard',to:'canalWard',points:[[-600,8,-320],[-640,8,-320],[-648,8,-320],[-648,8,-325.2],[-684,8,-325.2],[-684,8,-320]],gate:[-643,8,-320]},
 {from:'lowerWard',to:'civicWard',points:[[-600,8,-320],[-624,8,-352],[-644,8,-366],[-644,8,-410]],gate:[-644,8,-371]},
 {from:'canalWard',to:'civicWard',points:[[-684,8,-320],[-684,8,-350],[-672,8,-366],[-644,8,-377],[-644,8,-410]],gate:[-672,8,-368]},
 {from:'civicWard',to:'scholarHeights',points:[[-644,8,-410],[-682.9,8,-410],[-691.9,16,-425],[-730,16,-425]],gate:[-687.4,12,-417.5]},
 {from:'civicWard',to:'oldQuarter',points:[[-644,8,-410],[-605.1,8,-410],[-595.1,10,-430],[-588,10,-430],[-560,10,-430]],gate:[-599,9.2,-422]}
];
const wardFlags=id=>['region:caer-'+id];
export const capitalUnlocks={
 lowerWard:{requiredRegions:['violet-mire']},
 canalWard:{requiredDiscoveries:['cv:arrival'],arrivalDays:1,anyDiscoveries:['cv:market','cv:gate','cv:guide']},
 civicWard:{requiredDiscoveries:['cv:arrival'],arrivalDays:2,requiredRegions:['caer-canalWard'],anyDiscoveries:['cv:notice','cv:canal-level','cv:canal-ledger']},
 scholarHeights:{requiredDiscoveries:['cv:arrival'],arrivalDays:3,requiredRegions:['caer-civicWard'],anyDiscoveries:['cv:records-map','cv:archive-catalog','cv:scholar-intro']},
 oldQuarter:{requiredDiscoveries:['cv:arrival'],arrivalDays:4,requiredRegions:['caer-scholarHeights'],anyDiscoveries:['cv:old-map','cv:elda-direction','cv:cat-old-entry']}
};
const facility=(id,name,ward,type,dx,dz,w,d,actor=null)=>({id:'cv-'+id,name,ward,type,offset:[dx,dz],size:[w,d],characterId:actor,hours:{morning:'open',day:'open',evening:'open',night:['lodging','dining','guard','bell','observatory','residential','repair'].includes(type)?'open':'closed'}});
export const capitalFacilities=[
 facility('inn','ミラの宿', 'lowerWard','lodging',-22,22,11,13,'cvMira'),facility('diner','ミラの食堂','lowerWard','dining',-5,23,10,11),facility('passage','通行所','lowerWard','records',23,-18,9,10,'cvCedric'),facility('guard','衛兵詰所','lowerWard','guard',23,15,9,10,'cvLeon'),facility('craft','職人工房','lowerWard','repair',-24,-19,11,10),
 facility('sluice','水門管理室','canalWard','waterworks',22,-22,10,11,'cvGaren'),facility('guild','舟運組合','canalWard','guild',-23,23,12,11,'cvSophia'),facility('warehouse','倉庫事務所','canalWard','warehouse',22,24,11,12),facility('inspection','旧水路点検室','canalWard','waterworks',-24,-23,10,10),
 facility('records','記録院','civicWard','records',-22,23,12,12,'cvEdras'),facility('archive','公文書館','civicWard','archive',22,20,17,15,'cvLyune'),facility('admin','行政庁','civicWard','records',-23,-23,12,12,'cvCassian'),facility('bell','中央鐘楼','civicWard','bell',23,-22,9,10,'cvOrm'),
 facility('observatory','天文台','scholarHeights','observatory',-22,-22,12,12,'cvSerena'),facility('maps','地図庫','scholarHeights','maps',23,22,12,12,'cvYulio'),facility('academy','学院','scholarHeights','archive',-22,23,12,12,'cvNoah'),
 facility('val','ヴァル工房','oldQuarter','repair',-20,23,10,10,'cvVal'),facility('elda','エルダの家','oldQuarter','residential',20,22,9,10,'cvElda'),facility('old-bell','鐘のない鐘楼','oldQuarter','bell',20,-23,8,9),facility('cellar','半地下室','oldQuarter','cellar',-20,-23,9,10)
];
capitalFacilities.push(...lodgingFacilities);
capitalFacilities.find(s=>s.id==='cv-val').hours.night='closed';
const people=[
 ['cvCedric','セドリック','城門の通行役人','lowerWard','cv-passage',42,1.73,.94,0x493e32,'几帳面な通行役人。濃茶の短髪。','Violet Mireから来たのか。今日は泥がひどかっただろ。名前は、この欄へ。','通行の記録には、荷の数まで書く。古い帳面には、頁が抜けたものもある。'],
 ['cvLeon','レオン','衛兵','lowerWard','cv-guard',28,1.84,1.02,0x88704d,'長身で引き締まった衛兵。','門の内側では荷車が曲がる。広場へは、井戸の側を歩いて。','またいるな。荷車の下で寝るなよ。'],
 ['cvMira','ミラ','宿兼食堂の主人','lowerWard','cv-inn',38,1.67,1.18,0x80513c,'栗色の髪、温かな宿の主人。','まず靴を乾かして、何か食べて。街の話は、それからでいいよ。','朝食は鐘の後。まだ暗くても、台所には誰かいるよ。'],
 ['cvGaren','ガレン','水門管理人','canalWard','cv-sluice',52,1.79,1.25,0x787873,'大柄で白髪混じりの水門管理人。','水位標を見ろ。舟を入れる時は、下の門からだ。','この下の石組みは、俺たちが造ったものじゃない。使えるから使う。'],
 ['cvSophia','ソフィア','舟運・倉庫運営','canalWard','cv-guild',32,1.82,.97,0x36342f,'動きやすい服の、判断の早い舟運担当。','荷は東の倉庫、空の舟は橋の向こう。そこだけ間違えなければ大丈夫。','水位が変わると、荷の順番も変わるの。人は待てても、濡れる荷は待てない。'],
 ['cvEdras','エドラス','記録院書記官','civicWard','cv-records',48,1.74,.88,0x756c5d,'指先にインクを残す静かな書記官。','記録にないことと、存在しなかったことは、別です。土地の申請なら右の机へ。','書かれていない場所は珍しくありません。……この規模の地図で、ここだけというのは珍しいですが。'],
 ['cvLyune','リュネ','公文書館管理人','civicWard','cv-archive',62,1.70,.94,0xbbbbb1,'銀髪、姿勢の良い資料管理人。','目録は残っています。本文は、ここにはありません。なかったとは言っていません。','棚の番号は変えません。欠けた年代を、隣の年代で埋めることもありません。'],
 ['cvCassian','カシアン','行政官','civicWard','cv-admin',38,1.78,1,0x534b40,'端正な服装の現代の行政官。','区画境界は、排水と通行の都合で変わります。古い名前が残ることもあります。','古い道と今の道が違っていても、まずは測り直す。それが役所の仕事です。'],
 ['cvOrm','オルム','中央鐘楼管理人','civicWard','cv-bell',58,1.72,1.12,0x8b8b80,'作業者の手を持つ鐘楼管理人。','Bellmireの鐘か。何回ではなく、どれくらい間が空いた？ 点検ではそこを聞く。','響きは石と空気で変わる。古い比率が残っていても、同じ鐘とは限らない。'],
 ['cvSerena','セレナ','天文学者','scholarHeights','cv-observatory',42,1.80,.91,0x3e4145,'黒髪に少量の銀髪、体系的な観察者。','形だけでなく、見た方向と時刻も残してください。似ていることは、同じであることではありません。','Nine Stonesと円環。点の間隔は近い。でも、向きと欠け方は合いません。'],
 ['cvYulio','ユリオ','地図師','scholarHeights','cv-maps',35,1.72,.95,0x665847,'少し猫背で、地図の話に熱が入る地図師。','この線、今の道にはありません。現地で確かめるなら、鐘のない鐘楼の方です。','線が消えたのか、初めから引かなかったのか。古い図だけでは決められません。'],
 ['cvNoah','ノア','研究補佐','scholarHeights','cv-academy',22,1.69,.87,0x6d5b42,'くせ毛で、少しラフな研究補佐。','これ、同じ形に見えません？ ……先生は、もう一度向きを測ろうって。','資料を並べる机が足りないんです。似ているところより、合わないところが増えてしまって。'],
 ['cvElda','エルダ','旧区画の住人','oldQuarter','cv-elda',70,1.54,1.01,0xc3c0b2,'小柄な白髪の住人。昔の地名を普通に使う。','鐘のない鐘楼の方だよ。昔はここから水が見えたよ。','昔、ああいう色の外套を着た子がいたねえ。誰の家の子だったか。'],
 ['cvVal','ヴァル','石壁・鐘楼の修繕師','oldQuarter','cv-val',50,1.81,1.22,0x72695a,'骨太な修繕師。手に石粉。','使える石は戻す。合わない石は、横へ置く。','この片は、今の都市図にない場所のものだ。名前は知らん。']
];
export const capitalCharacters=people.map(([id,name,role,ward,mainLocation,age,height,width,hair,intro,a,b])=>({id,name,role,ward,region:'caer-veyra',mainLocation,profile:{age,height,width,hair},visualProfile:{intro,palette:{cloth:ward==='oldQuarter'?'#696c60':'#6a7680',hair:'#'+hair.toString(16).padStart(6,'0'),wash:'#b6b1a0'},framing:{objectPositionX:50,objectPositionY:32,zoom:1,mobile:{objectPositionY:29,zoom:1}}},portrait:null,portraitDefault:null,portraitHappy:null,portraitSerious:null,portraitNight:null,portraits:{periods:{},expressions:{}},lines:{human:{default:[a,b]},cat:{default:[id==='cvLeon'?'またいるな。荷車の下で寝るなよ。':'その隙間なら通れるんだね。濡れた石には気をつけて。']}},schedule:{morning:['cvCedric','cvLeon'].includes(id)?'cv-work-'+id:mainLocation,day:id==='cvMira'?mainLocation:'cv-work-'+id,evening:ward==='lowerWard'?'cv-diner':mainLocation,night:id==='cvMira'?mainLocation:id==='cvLeon'?'cv-work-'+id:['cvOrm','cvSerena','cvVal'].includes(id)?mainLocation:'home'}})).map(applyCapitalPortrait).concat(lodgingCharacters);
export const capitalObservations=[
 ['gate','lowerWard',0,8,'使われ続ける外門','新しい金具の下に、古い門の継ぎ目が残る。通行の声は途切れない。'],['market','lowerWard',-8,3,'市場の朝','布と朝食の匂いが重なる。古い柱に、今日の値札が結ばれている。'],['guide','lowerWard',8,6,'街の案内','水門は西、役所は北。古い呼び名が、余白に小さく残っている。'],['well','lowerWard',-14,5,'共同井戸','桶の縁は何度も直されている。井戸の石だけは、周りの舗装より暗い。'],['stable','lowerWard',-29,4,'門の内側の厩舎','旅人の馬に、今日の草が分けられている。古い門の影で、荷を降ろす。'],['notice','lowerWard',-9,-8,'運搬の公告','明日の水門通行と荷の搬入時刻が書かれている。'],
 ['canal-level','canalWard',12,4,'水位標','数字の下に、別の間隔で刻まれた古い線がある。管理人は今日の高さを記録している。'],['canal-ledger','canalWard',-10,7,'舟の順番','麦、石材、布。水門の帳面には、普通の荷が並ぶ。'],['canal-reflection','canalWard',6,-7,'夕方の運河','塔と橋の影が、水の上で長くほどける。揺れるたび、線の向きが少し変わる。'],['old-water','canalWard',-12,-9,'古い石積み','新しい水門の下に、違う幅の石が続いている。'],
 ['records-map','civicWard',-10,8,'都市図の余白','Bellmireと湖と九石の線はある。大きな円環と空洞の辺りだけ、線が迂回しているようにも見える。'],['archive-catalog','civicWard',10,7,'目録の抜け','目録の番号はある。本文の束はない。隣の資料は、土地の境界と住民の申請だ。'],['scholar-intro','civicWard',8,-8,'測量の紹介札','古い図の向きは、高台の地図庫でも確かめられるらしい。'],['bell-gap','civicWard',-9,-8,'鐘の間隔','整備帳には、回数よりも間隔が細かく書かれている。'],['public-life','civicWard',0,9,'申請を待つ人々','屋根の修理と家族の住所。歴史の資料を扱う窓口にも、今日の暮らしが並ぶ。'],
 ['old-map','scholarHeights',9,7,'現在図にない街路','古い地図の細い線は、鐘のない鐘楼へ曲がる。現在図には、その曲がり角がない。'],['star-directions','scholarHeights',-8,-8,'方向を比べる庭','石と水と空の記録を並べても、同じ形にはならない。空白の向きだけが、少し気にかかる。'],['sundial','scholarHeights',8,-8,'増築の日時計','台座は古く、目盛りは新しい。違う世代の道具が、一緒に使われている。'],
 ['buried-well','oldQuarter',-14,8,'埋めた井戸','今の道の下に、井戸の縁が残っている。水を汲むには、もう低すぎる。'],['sealed-gate','oldQuarter',8,-8,'塞がれた門','門の向こうと手前で、舗装の向きが違う。今の街路には繋がらない。'],['old-number','oldQuarter',8,8,'古い壁番号','番号の間に、後から小さな数字が足されている。現在の資料番号とは合わない。'],['stone-fragment','oldQuarter',-8,-8,'修繕待ちの石片','同じ石材でも、溝の向きは違う。誰かが比べていたのかもしれない。']
];
export const capitalEvents=[
 ['caravan','lowerWard','商隊の荷物','門の脇で荷を数えている。旅人は井戸の前で道を聞く。',['morning','day']],['market-clear','lowerWard','市場の片付け','布を畳む音がする。朝の値札は、箱の中へ戻った。',['evening','night']],['gate-shift','lowerWard','衛兵交代','帳面を渡して、交代の衛兵が門へ向かった。',['morning','evening']],['craft-delivery','lowerWard','工房の搬入','直した車輪を運ぶ人が、古門の柱を避けて曲がる。',['day']],
 ['sluice-cycle','canalWard','水門の日課','舟を一隻通して、門がゆっくり戻る。今日の水位を帳面へ写す。',['morning','day']],['cargo-mix','canalWard','積み荷の入れ違い','布の箱が石材の列へ混ざった。倉庫の人が札を替えている。',['day','evening']],['warehouse-check','canalWard','倉庫点検','縄と床板を確かめる。濡れた包みは、別の棚へ置く。',['morning']],
 ['public-notice','civicWard','公告の貼り替え','水路工事と住所の変更。紙の端だけが新しい。',['morning','day']],['land-reader','civicWard','土地資料の閲覧','古い土地の境界を、普通の利用者が確かめている。',['day']],['bell-service','civicWard','鐘の点検','鳴らす前に、間隔を書き直す。管理人の手には油がついている。',['morning','evening']],
 ['survey-class','scholarHeights','測量の授業','学生が同じ石を違う方角から測る。結果は少しずつ違う。',['day']],['night-observe','scholarHeights','夜の観測','古い塔と新しい観測室で、時刻を合わせている。',['evening','night']],
 ['wall-repair','oldQuarter','古壁の修繕','使える石を戻している。古材の台の上に、名前のない石片が混ざる。',['day']],['old-breakfast','oldQuarter','旧区画の朝','低い窓から、朝食の匂いがする。古い通路にも、今日の暮らしがある。',['morning']]
].map(([id,ward,label,text,periods])=>({id:'cv:event:'+id,ward,label,text,periods}));
export const capitalCatCounts={lowerWard:5,canalWard:5,civicWard:5,scholarHeights:5,oldQuarter:6};
export const capitalCatTexts={lowerWard:['荷車の下に、乾いた麦粒と古い布がある。','工房の裏で、油と木の削り屑の匂いがする。'],canalWard:['水際の古い石積みは、新しい壁と少し違う。','舟の隙間に、何度も結び直した細い縄がある。'],civicWard:['壁の低い番号は、書架の札と一致しない。','搬入口の下に、古い紙の切れ端が残る。'],scholarHeights:['地図庫の石裏に、消えかけた短い線がある。','観測庭園の隙間から、冷たい風が抜ける。'],oldQuarter:['今の街路と違う向きの、古い通路が壁の中へ続いている。','塞がれた門の裏に、濡れていない古い木片がある。','排水溝の低い傷は、上の壁の番号より古そうだ。']};
export const capitalRecordStages=['unseen','arrival','ordinary','missing','compared','tracesRemain','conflictingSources','olderLayerSuspected'];

export const capitalCatRouteNames={lowerWard:['宿裏庭','荷車下','市場の低い屋根','工房裏','城壁沿い'],canalWard:['倉庫の低い梁','水門脇','荷揚げ桟橋','舟の隙間','運河壁の低所'],civicWard:['公文書館中庭','鐘楼基部','行政庁裏','古い回廊','資料搬入口'],scholarHeights:['低い屋根の縁','旧観測塔基部','石壁の切れ目','地図庫外廊','観測庭園'],oldQuarter:['壁内の通路跡','半地下の入口','狭い旧アーチ','低い屋根裏','閉じた門の裏','旧排水溝']};
