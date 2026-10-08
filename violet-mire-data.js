export const mireLayout={id:'violet-mire',center:[-458,4.5,-216],entry:[-440,4.52,-183],bounds:{minX:-490,maxX:-423,minZ:-252,maxZ:-159},transition:[[-416.6,2.17,-153.4],[-423,2.35,-157],[-429,2.95,-164],[-434,3.65,-173],[-440,4.52,-183]],boardwalk:[[-440,4.62,-183],[-446,4.62,-194],[-456,4.62,-203],[-464,4.62,-216],[-456,4.62,-229],[-468,4.62,-237]],zones:[{id:'entrance',name:'湿地入口',center:[-442,4.5,-187]},{id:'basin',name:'木道の湿地',center:[-461,4.5,-212]},{id:'hollow',name:'Violet Hollow',center:[-463,4.5,-234]}],pools:[{x:-448,z:-217,rx:4,rz:5},{x:-473,z:-211,rx:4,rz:5.5},{x:-458,z:-241,rx:3,rz:3}],royalRoad:[[-468,4.62,-237],[-474,4.9,-243],[-479,5.3,-248]]};
export const mireCharacters=[
 {id:'mireGatherer',name:'リス',role:'湿地の採取人',lines:{human:{default:['摘むのは、足を置けるところの花だけ。奥の水は、浅く見えても違うから。','木道を外れるなら、枝が乾いている方へ。泥の色だけでは分からないよ。']},cat:{default:['そこは根の間だね。籠の花には、まだ触らないでおくれ。']}},portraitDefault:null},
 {id:'mireKeeper',name:'オーウェン',role:'木道の保守人',lines:{human:{default:['新しい板は、古い板より明るい。直したところだけ目立ってしまうんだ。','荷車は向こうの石道まで。こっちの板には、人の重さで十分だよ。']},cat:{default:['板の下なら雨を避けられる。あまり奥へ入らないように。']}},portraitDefault:null}
];
export const mireIncidents=[
 {id:'mire:loose-board',label:'修理した板',text:'外れかけていた板に、新しい釘と短い添え木がある。昨日の泥がまだ乾いていない。',cycle:[1,4],position:[-451,4.5,-199]},
 {id:'mire:blossom',label:'湿地花の開く朝',text:'小さな花が、昨日より少し開いている。薄紫なのは、先の方だけだ。',cycle:[2,5],position:[-447,4.5,-191]},
 {id:'mire:wet-bundle',label:'濡れた包み',text:'布の包みを、乾いた根の上で広げている。水に落ちた角だけ色が濃い。',cycle:[3,6],position:[-472,4.5,-226]},
 {id:'mire:late-traveler',label:'遅い旅の跡',text:'休憩台の土がまだ湿っている。霧で遅れた人が、ここで靴を拭いたらしい。',cycle:[0],position:[-471,4.5,-229]}
];
export const mireSeasonProfiles={spring:{grass:0x697f65,flowers:1},autumn:{grass:0x596958,flowers:.65},summer:{grass:0x60735c,flowers:.85},winter:{grass:0x69736b,flowers:.25}};
export const regionalAtmospheres={
 bellmire:{identity:'street',fogScale:1},'nine-stones':{identity:'wind',fogScale:.9},'lake-lun':{identity:'water',fogScale:1.04},lunmere:{identity:'lakeside',fogScale:1.08},caerith:{identity:'cold-wind',fogScale:1},'drowned-way':{identity:'wet-stone',fogScale:1},'the-ring':{identity:'wet-circle',fogScale:1},'hollow-crown':{identity:'stone-hollow',fogScale:1.02},'violet-mire':{identity:'wetland-quiet',fogScale:1.16}
};
