// The existing stay day is the single clock. No real-world date dependency.
export const seasonProfiles={
 spring:{label:'いつもの季節',dayLength:1,leafTint:null,clothTint:null,sunHeight:1,weatherWeights:{clear:4,rain:2,fog:1},goods:'薬草と布',visitorDensity:1},
 summer:{label:'夏',dayLength:1.12,leafTint:null,clothTint:null,sunHeight:1,weatherWeights:{clear:5,rain:1,fog:1},goods:'籠と干し布',visitorDensity:1},
 autumn:{label:'秋',dayLength:.92,leafTint:0x929065,clothTint:0xa99b80,sunHeight:.90,weatherWeights:{clear:3,rain:3,fog:1},goods:'薬草と乾いた実',visitorDensity:1},
 winter:{label:'冬',dayLength:.82,leafTint:null,clothTint:null,sunHeight:1,weatherWeights:{clear:2,rain:2,fog:2},goods:'羊毛',visitorDensity:.8}
};
export const weeklyDays=[{id:'ordinary',label:'いつもの日'},{id:'cargo',label:'荷の多い日'},{id:'roads',label:'旅人の来る日'},{id:'market',label:'市の日'},{id:'quiet',label:'静かな日'},{id:'water-lights',label:'水辺に灯りを出す日'},{id:'departures',label:'旅立ちの日'}];
export function townRhythm(day,period='day',weather='clear',season='spring'){
 const cycleDay=((Math.max(1,Math.floor(day))-1)%7)+1,weekly=weeklyDays[cycleDay-1],market=cycleDay===4&&['day','evening'].includes(period)&&!['rain','blackout','dawn'].includes(weather),gathering=cycleDay===6&&['evening','night'].includes(period)&&!['rain','blackout'].includes(weather);
 return {cycleDay,weekIndex:Math.floor((Math.max(1,day)-1)/7),weekly,market,gathering,season,marketMultiplier:market?1.20:cycleDay===5?.85:1};
}
export const visitorPlans=[
 {id:'lake-traveller',name:'湖からの旅人',role:'旅人',origin:'harbor',days:[3,4,5,6],schedule:{morning:'inn',day:'square',evening:'inn',night:'inn'},coat:0x7a766a,accent:0x998975,hair:0x6c5546,prop:'parcel',text:'ルンメアから来た。向こうは三日ずっと雨だったよ。',second:'湖の道でも、円に細い線を添えた石を見た気がする。どの岸だったかは、もう曖昧だけれど。'},
 {id:'cloth-merchant',name:'布を持ってきた商人',role:'行商人',origin:'cable',days:[4],schedule:{morning:'market',day:'market',evening:'market',night:'inn'},coat:0x6c686e,accent:0x9b8373,hair:0x594b3c,prop:'parcel',text:'今日の市に合わせて、丘を越えてきたんだ。この布は雨でも乾きやすいよ。'},
 {id:'boat-carrier',name:'舟で来た荷運び人',role:'荷運び人',origin:'harbor',days:[2,3,4,5],schedule:{morning:'harbor',day:'market',evening:'tavern',night:'inn'},coat:0x65767a,accent:0xa0977e,hair:0x5a483b,prop:'crate',text:'湖からの荷は、今日は軽い。市の籠は、先に上へ運んでおこう。'}
];
export const visitorPresent=(plan,day)=>plan.days.includes(townRhythm(day).cycleDay);
