// Small differences around the shared adult scale, never a second size system.
export const residentLifeSettings={heightVariation:.022,shoulderVariation:.065,headScale:.90,idleRate:12};
export const residentRoles={
 baker:{activity:'bread',posture:'working',prop:'basket',hair:0x704a35,accent:0x8a5c45},
 bookseller:{activity:'reading',posture:'thoughtful',prop:'book',hair:0x514c40,accent:0x59614e},
 boatworker:{activity:'rope',posture:'carrying',prop:'rope',hair:0x453e34,accent:0x637675},
 starmaker:{activity:'measuring',posture:'thoughtful',prop:'chart',hair:0x302f2d,accent:0x3e4c5c},
 greenBard:{activity:'listening',posture:'relaxed',prop:null,hair:0x68533e,accent:0x345747}
};
export function residentVariation(index){const seed=(Math.sin((index+1)*12.9898)*43758.5453)%1,unit=seed-Math.floor(seed);return {seed:unit,height:1+(unit-.5)*2*residentLifeSettings.heightVariation,shoulders:1+Math.sin(index*2.17)*residentLifeSettings.shoulderVariation,phase:unit*Math.PI*2};}

// Reuse the same people and adult dimensions; place suggests the work they do.
export function everydayResidentRole(entry,index,place,accent){
 const activity=entry.seated?'resting':place.z>32?(index%2?'rope':'carrying'):['browsing','conversation','sweeping','resting','well','carrying'][index%6];
 const prop=activity==='sweeping'?'broom':activity==='carrying'?'crate':activity==='rope'?'rope':entry.seated?'book':null;
 return {activity,posture:entry.seated?'seated':activity==='sweeping'?'working':activity==='resting'?'relaxed':prop?'carrying':'listening',prop,hair:[0x51483b,0x6a5140,0x746c59][index%3],accent};
}

// Stable visual traits shared by communities; no random regeneration on reload.
export function communityAppearance(index){return {height:[.94,1.07,.99,1.03,.96,1.05][index%6],shoulders:[1.10,1.06,.93,.98,1.03,.95][index%6],coatLength:[1.12,.93,1.04,.98][index%4],hairVolume:[.96,.91,1.1,1.02][index%4],hat:index%7===4,stance:['behind','working','folded','relaxed','listening','leaning'][index%6],gait:.88+(index%5)*.06};}
export function carriedPropVisible(record){
 if(!record.role.prop)return false;
 if(!record.diverse)return record.prop.visible;
 const state=record.currentState,activity=record.activity??record.role.activity;
 if(record.sitting||state==='talking'||activity==='conversation'||activity==='resting'||activity==='browsing'||activity==='listening')return false;
 if(state==='walking'||state==='goingHome')return record.object.userData.community&&[1,3,9].includes(record.object.userData.appearanceIndex)&&record.destination!=='home';
 return state==='working'&&['rope','carrying','bread','sweeping','reading','measuring'].includes(activity);
}
