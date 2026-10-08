// Shared read-only dependency metadata. Existing bell timing remains owned by
// story-thread.js; no scheduler duplication or global quest list is introduced.
export const threadDefinitions=[
 {id:'bell',dependencies:[],flags:['belfry-mark','star-chart'],journalEntries:['bell-thread-heard','bell-thread-night']},
 {id:'drowned',dependencies:['bell'],flags:['drowned:entry','drowned:mark'],journalEntries:['drowned:entry','drowned:nine-link']},
 {id:'ring',dependencies:['drowned','nine','caerith','bell'],flags:['ring:visit','ring:groove','ring:direction'],journalEntries:['ring:visit','ring:comparison','ring:returning-water']},
 {id:'hollowCrown',dependencies:['ring'],flags:['crown:entrance','crown:visit','crown:sky'],journalEntries:['crown:entrance','crown:visit','crown:shape']}
];
export function threadSnapshot(data){return threadDefinitions.map(def=>({...def,stage:data.threads?.[def.id]?.stage??'unseen',discovered:def.flags.some(id=>!!data.discoveries[id]),flags:Object.fromEntries(def.flags.map(id=>[id,!!data.discoveries[id]]))}));}
const regionKey=id=>id.replace(/^(quiet:|place:)/,'');
export const journalRegion=raw=>{if(raw.startsWith('region:'))return raw.slice(7);const id=regionKey(raw);return id.startsWith('crown:')?'hollow-crown':id.startsWith('ring:')?'the-ring':id.startsWith('drowned:')?'drowned-way':id.startsWith('caerith:')?'caerith':id.startsWith('nine:')?'nine-stones':id.startsWith('lun:')?'lunmere':id.startsWith('lake:')?'lake-lun':'bellmire';};

export const ringStages=[{id:'compared',all:['ring:direction'],any:['ring:groove','ring:center']},{id:'observed',all:['ring:groove']},{id:'discovered',all:['ring:visit']}];
export function ringStage(data,exposed){const seen=id=>!!data.discoveries[id];return ringStages.find(s=>(s.all??[]).every(seen)&&(!s.any||s.any.some(seen)))?.id??(exposed?'exposed':'unseen');}

export const crownStages=[{id:'observed',all:['crown:sky']},{id:'visited',all:['crown:visit']},{id:'entrance',all:['crown:entrance']}];
export function crownStage(data){return crownStages.find(s=>s.all.every(id=>!!data.discoveries[id]))?.id??'unseen';}
