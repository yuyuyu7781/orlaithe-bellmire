import {watercourseLayout} from './waterways.js';
// Shop identities extend the existing town clock and dialogue IDs.
export const shops=[
 {id:'bakery',name:'パン屋',actor:'baker',site:'baker',center:[-31,24],hours:{morning:'open',day:'open',evening:'limited',night:'closed'},palette:{wall:0xd9ccb3,wood:0x896447,accent:0xa16945},inside:'窯の近くは暑いから、気をつけて。今の籠は、まだ冷ましているところなんだ。',catInside:'小麦袋の横なら通れるよ。粉の上だけは歩かないでおくれ。'},
 {id:'bookshop',name:'古書店',actor:'bookseller',site:'bookseller',center:[-18,29],hours:{morning:'open',day:'open',evening:'open',night:'closed'},palette:{wall:0xc9c2ad,wood:0x65523f,accent:0x465c4c},inside:'その棚は古い本が多い。上から取らない方がいいですよ。机の上の紙は、まだ乾いていません。',catInside:'机の下なら静かだよ。積んだ本を倒さないようにね。'},
 {id:'inn',name:'宿屋',site:'inn',center:[-39,-1],hours:{morning:'open',day:'open',evening:'open',night:'open'},palette:{wall:0xd5cbb4,wood:0x78604a,accent:0x798365}},
 {id:'tavern',name:'酒場',site:'tavern',center:[-10,8],hours:{morning:'closed',day:'quiet',evening:'open',night:'open'},palette:{wall:0xbeb39c,wood:0x70503b,accent:0x754b3b},inside:'荷は片付いたよ。ここでは縄の代わりに、椅子へ腰を落ち着けるんだ。',catInside:'魚籠は港に置いてきたぞ。ここならベンチの横で休める。'},
 {id:'orrery',name:'天球儀店',actor:'starmaker',site:'starmaker',center:[3,-3],hours:{morning:'open',day:'open',evening:'open',night:'quiet'},palette:{wall:0xcac9b9,wood:0x605748,accent:0x394954},inside:'この円は少しずつ調整するんです。棚の真鍮器具は、持つと案外重いですよ。',catInside:'机の下は空いていますよ。小さな歯車には触れないでね。'}
];
export const isShopOpen=(shop,period)=>shop.hours[period]!=='closed';
export const shopStatus=(shop,period)=>({open:'営業中',limited:'片付けながら営業中',quiet:'静かに営業中',closed:'閉まっている'})[shop.hours[period]];

// Placement changes happen on the clock, not through a second movement AI.
export const dailyLocations={
 baker:{morning:'bakery',day:'bakery',evening:'bakery',night:'private'},
 bookseller:{morning:'bookshop',day:'bookshop',evening:'bookshop',night:'private'},
 boatworker:{morning:'harbor',day:'harbor',evening:'tavern',night:'tavern'},
 starmaker:{morning:'orrery',day:'orrery',evening:'orrery',night:'orrery'},
 greenBard:{morning:'waterfront',day:'square',evening:'inn',night:'tavern'}
};
export const rumorPools={
 baker:['湖から来る小麦の荷が、二日ほど遅れているそうだよ。'],
 bookseller:['裏の古い印を、夜に確かめていた旅人がいたそうです。'],
 boatworker:['上流で丸い石が見つかったそうだ。荷札にも似た印があったな。'],
 starmaker:['九つ目の鐘だけ、少し違って聞こえると言う人がいるんです。'],
 greenBard:['宿の人が、小さな落とし物を預かっているらしいよ。急ぐものでもなさそうだ。']
};
// Small observations, not quests. The existing interaction system presents them.
export const townEventDefinitions=[
 {id:'delayed-grain',kind:'delivery-delay',area:'bakery',enabled:true,periods:['morning','day'],source:'Bakery wheat delivery',rumorIds:['baker'],label:'届いていない小麦袋',text:'荷札には袋が三つとある。並んでいるのは二つで、残りの場所だけきれいに空いている。',rumor:'小麦袋が一つ、まだ港に来ていないんだ。今朝の分は足りるけれどね。'},
 {id:'unaddressed-crate',kind:'cargo',area:'harbor',enabled:true,source:'Harbor sailcloth',rumorIds:['boatworker'],label:'裏返った荷札',text:'木札は裏返っている。送り先の字は潮に薄れ、円の印だけが残った。',rumor:'送り先の読めない箱が一つある。荷主が戻れば、すぐ分かるだろう。'},
 {id:'missing-folio',kind:'missing-book',area:'bookshop',enabled:true,source:'Bookshop wrapped folios',rumorIds:['bookseller'],label:'空いた本の包み',text:'紐だけが丸く残っている。誰かが本を読み終えたら、ここへ戻すつもりだったのだろう。',rumor:'薄い本が一冊、棚から見当たらないんです。たいてい窓辺で見つかるのですが。'},
 {id:'upstream-stone',kind:'water-mark',area:'mill',enabled:true,source:'leat',rumorIds:['starmaker'],label:'水路の丸い石',text:'上流の溝に、丸い石がひとつ挟まっている。濡れると、細い九本の線が浮かぶ。',rumor:'上流の石に線があるそうです。水が乾くと、数えにくくなるとか。'},
 {id:'ninth-bell',kind:'rumor',area:'tavern',enabled:true,periods:['evening','night'],source:'Tavern cooperage',rumorIds:['greenBard'],label:'酒場の置き杯',text:'片付けられていない杯が二つ。九つ目の鐘の話は、今夜も結論が出なかったらしい。',rumor:'九つ目の鐘は、帰るのを忘れた人にだけ違って聞こえる、と誰かが言っていたよ。'},
 {id:'cat-bread',kind:'cat-discovery',area:'bakery',enabled:true,profiles:['cat'],source:'Bakery flour and wool',label:'袋の裏の匂い',text:'粉の匂いの奥に、冷めたパンの甘い匂いがある。小さな欠片が、袋の陰に転がっている。'},
 {id:'cat-ribbon',kind:'cat-discovery',area:'harbor',enabled:true,profiles:['cat'],source:'Harbor herbs',label:'荷物の陰の紐',text:'箱の陰で、短い紐が風に動いている。人の手より、濡れた木の匂いが強い。'},
 {id:'loose-cart-wheel',kind:'repair',area:'workshop',enabled:true,source:'Workshop repair tools',rumorIds:['boatworker'],label:'修理を待つ車輪',text:'車輪の留め具が一つ外れている。荷は降ろされ、工具だけが並んでいる。',rumor:'荷車の車輪を直している。明日は、丘の道へまた出せるだろう。',settlesAfter:1,resolvedText:'留め具が新しくなっている。車輪の脇の荷は、もう運び出された。'},
 {id:'late-cask',kind:'delivery',area:'tavern',enabled:true,source:'Tavern cooperage',rumorIds:['boatworker'],label:'空いた樽置き場',text:'樽の丸い跡が一つだけ空いている。木札は、明日の荷を待っている。',rumor:'酒場の小樽は明日の舟だ。今夜は奥の樽から出すそうだ。',settlesAfter:1,resolvedText:'小樽の木札には、今朝の日付。置き場の石が、少し湿っている。'},
 {id:'moved-cloth',kind:'market',area:'market',enabled:true,source:'Market folded linen',rumorIds:['baker'],label:'布屋の小さな札',text:'古い場所を消して、庇のそばと書き足してある。雨の日のために移したのだろう。',rumor:'布屋が庇の近くへ寄ったよ。雨でも、あの布なら見つけやすい。'},
 {id:'absent-skiff',kind:'harbor',area:'harbor',enabled:true,source:'moorings',rumorIds:['boatworker'],label:'帰りを待つ係留縄',text:'一つの縄だけ、杭に巻いてある。舟が戻るまで、場所を空けてあるようだ。',rumor:'小舟が湖へ荷を届けに行った。明日には、あの杭へ戻るはずだ。',settlesAfter:1,resolvedText:'縄に新しい水滴が残る。舟は朝のうちに戻ったらしい。'},
 {id:'inn-parcel',kind:'lost-property',area:'inn',enabled:true,source:'Inn wool bundles',rumorIds:['greenBard'],label:'宿に残された包み',text:'小さな布包みには、使い込んだ櫛が入っている。宿の人が、持ち主を待っている。',rumor:'宿に小さな包みが残ったそうだよ。明日、戻ってくる人のものかもしれない。',settlesAfter:1,resolvedText:'包みのあったところに、短い礼の紙だけが置かれている。'},
 {id:'cat-old-key',kind:'cat-discovery',area:'harbor',enabled:true,profiles:['cat'],source:'Harbor herbs',label:'籠の裏の古い鍵',text:'濡れた草の奥に、冷たい金属の匂い。小さな鍵の丸い頭が、縄に引っかかっている。'}

];
export const soundAnchors=[
 {id:'harbor-water',area:'town',kind:'water',position:[0,1.38,38],src:null},
 {id:'spring-water',area:'town',kind:'water',position:watercourseLayout.source,radius:9,gain:.18,src:null},
 {id:'stream-water',area:'town',kind:'water',position:[20,4,-6],radius:11,gain:.12,src:null},
 {id:'mill-wheel',area:'town',kind:'wheel',position:watercourseLayout.wheel,src:null},
 {id:'bell',area:'town',kind:'bell',position:[-8,20,-20],src:null},
 ...shops.map(s=>({id:s.id+'-room',area:s.id,kind:s.id,position:[0,1,0],src:null})),
 {id:'footsteps',kind:'movement',profiles:{human:null,cat:null},src:null}
];
