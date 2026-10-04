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
// Reserved, inactive hooks: no quest UI, timers, sound download or side effects.
export const townEventDefinitions=[
 {id:'delayed-grain',kind:'delivery-delay',area:'harbor',enabled:false,rumorIds:['baker']},
 {id:'inn-keepsake',kind:'lost-item',area:'inn',enabled:false,profiles:['human','cat'],rumorIds:['greenBard']}
];
export const soundAnchors=[
 {id:'harbor-water',area:'town',kind:'water',position:[0,1.38,38],src:null},
 {id:'mill-wheel',area:'town',kind:'wheel',position:[21,2,30],src:null},
 {id:'bell',area:'town',kind:'bell',position:[-8,20,-20],src:null},
 ...shops.map(s=>({id:s.id+'-room',area:s.id,kind:s.id,position:[0,1,0],src:null})),
 {id:'footsteps',kind:'movement',profiles:{human:null,cat:null},src:null}
];
