import {capitalCharacters,capitalEvents,capitalRecordStages} from './caer-veyra-data.js';
import {mireIncidents} from './violet-mire-data.js';
import {deriveProgression} from './progression-data.js';
import {worldNodes} from './world-graph.js';
import {lunmereCharacters,lakeTownEvents} from './lunmere-data.js';
import {seasonProfiles} from './town-calendar.js';
import {townEventDefinitions} from './shop-data.js';

export const SAVE_KEY='bellmire.stay.v1';
export const SAVE_VERSION=1;
const phases=['morning','day','evening','night'],weather=['clear','rain','fog','blackout','dawn','night'];
const people=['baker','bookseller','boatworker','starmaker','greenBard',...lunmereCharacters.map(c=>c.id),'mireGatherer','mireKeeper',...capitalCharacters.map(c=>c.id)];
const eventIds=[...townEventDefinitions,...lakeTownEvents,...mireIncidents,...capitalEvents].map(e=>e.id),eventStages=['unseen','heard','noticed','resolved'];
const object=v=>v&&typeof v==='object'&&!Array.isArray(v),integer=(n,fallback=1)=>Number.isSafeInteger(n)&&n>=1?Math.min(n,9999):fallback;
const short=(s,max=500)=>typeof s==='string'?s.slice(0,max):'';
export function defaultStay(){return {version:SAVE_VERSION,currentDay:1,dayPhase:'day',dayStart:1,weather:'clear',season:'spring',events:{},discoveries:{},memories:{},flags:{},journal:[],threads:{},progression:{modelVersion:1,chapters:{},acts:{}},weatherHistory:[],travelHistory:[],boatDock:'lunmere',waterLevelState:{day:0,phase:'normal',firstLowDay:null}};}
// Whitelist and bounds protect every consumer; storage never supplies DOM/paths.
export function validateStay(raw){
 const d=defaultStay();if(!object(raw)||raw.version!==SAVE_VERSION)return d;
 for(const e of Array.isArray(raw.travelHistory)?raw.travelHistory.slice(-120):[])if(object(e)&&worldNodes.some(n=>n.id===e.region))d.travelHistory.push({day:integer(e.day),region:e.region,mode:e.mode==='cat'?'cat':'human',travelMode:['road','boat','revisit'].includes(e.travelMode)?e.travelMode:'road'});
 d.boatDock=['lunmere','lake','caerith'].includes(raw.boatDock)?raw.boatDock:'lunmere';
 const level=raw.waterLevelState;if(object(level)){d.waterLevelState={day:Number.isSafeInteger(level.day)&&level.day>=1?integer(level.day):0,phase:['normal','low','veryLow','extremeLow'].includes(level.phase)?level.phase:'normal',firstRingDay:Number.isSafeInteger(level.firstRingDay)&&level.firstRingDay>=7?integer(level.firstRingDay):null,firstLowDay:Number.isSafeInteger(level.firstLowDay)&&level.firstLowDay>=4?integer(level.firstLowDay):null};}
 const capital=raw.threads?.caerVeyraRecords;if(object(capital))d.threads.caerVeyraRecords={stage:capitalRecordStages.includes(capital.stage)?capital.stage:'unseen'};
 const mire=raw.threads?.violetMire;if(object(mire))d.threads.violetMire={stage:['unseen','exit','visited','reflected'].includes(mire.stage)?mire.stage:'unseen'};
 const crown=raw.threads?.hollowCrown;if(object(crown))d.threads.hollowCrown={stage:['unseen','entrance','visited','observed'].includes(crown.stage)?crown.stage:'unseen'};
 const ring=raw.threads?.ring;if(object(ring))d.threads.ring={stage:['unseen','exposed','discovered','observed','compared'].includes(ring.stage)?ring.stage:'unseen'};
 const drowned=raw.threads?.drowned;if(object(drowned))d.threads.drowned={stage:['unseen','heard','discovered','explored','marked','linked'].includes(drowned.stage)?drowned.stage:'unseen'};
 d.season=Object.hasOwn(seasonProfiles,raw.season)?raw.season:'spring';d.currentDay=integer(raw.currentDay);d.dayStart=integer(raw.dayStart);d.dayPhase=phases.includes(raw.dayPhase)?raw.dayPhase:'day';d.weather=weather.includes(raw.weather)?raw.weather:'clear';
 const thread=raw.threads?.bell;if(object(thread)){d.threads.bell={stage:['unseen','heard','chart','linked','anomaly','afterglow'].includes(thread.stage)?thread.stage:'unseen',anomalyDay:Number.isSafeInteger(thread.anomalyDay)?integer(thread.anomalyDay):null,catFound:thread.catFound===true};}
 for(const id of eventIds){const e=raw.events?.[id];if(object(e)&&eventStages.includes(e.state)){d.events[id]={state:e.state};for(const key of ['heardDay','noticedDay','resolvedDay','returnedDay'])if(Number.isSafeInteger(e[key])&&e[key]>=1)d.events[id][key]=integer(e[key]);for(const key of ['heardAt','noticedAt','resolvedAt'])if(phases.includes(e[key]))d.events[id][key]=e[key];}}
 for(const [id,e]of Object.entries(object(raw.discoveries)?raw.discoveries:{}).slice(0,1000))if(/^[\w:-]{1,100}$/.test(id)&&!['__proto__','prototype','constructor'].includes(id)&&object(e))d.discoveries[id]={day:integer(e.day),playerMode:e.playerMode==='cat'?'cat':'human',period:phases.includes(e.period)?e.period:'day',label:short(e.label,100)};
 if(d.boatDock==='caerith'&&!d.discoveries['region:caerith'])d.boatDock='lunmere';
 for(const id of people){const m=raw.memories?.[id];if(!object(m))continue;d.memories[id]={};for(const mode of ['human','cat'])if(object(m[mode]))d.memories[id][mode]={visits:Math.min(9999,Math.max(0,Number.isSafeInteger(m[mode].visits)?m[mode].visits:0)),firstDay:integer(m[mode].firstDay),lastDay:integer(m[mode].lastDay)};}
 if(Number.isSafeInteger(raw.flags?.finnLowViewDay))d.flags.finnLowViewDay=integer(raw.flags.finnLowViewDay);
 for(const e of Array.isArray(raw.journal)?raw.journal.slice(-400):[])if(object(e)&&short(e.id,100)&&short(e.text))d.journal.push({id:short(e.id,100),day:integer(e.day),text:short(e.text).replaceAll('テヴ','ローワン').replace(/^(イーラ)(のそばへ|と、街の暮らし)/,e.id.startsWith('met:lunHost:')?'マレン$2':'$1$2').replace(/^(マレン)(のそばへ|と、街の暮らし)/,e.id.startsWith('met:lunWatcher:')?'イーラ$2':'$1$2'),kind:short(e.kind,30),playerMode:e.playerMode==='cat'?'cat':'human'});
 for(const e of Array.isArray(raw.weatherHistory)?raw.weatherHistory.slice(-30):[])if(object(e)&&weather.includes(e.weather))d.weatherHistory.push({day:integer(e.day),weather:e.weather});d.progression=deriveProgression(d);return d;
}
export function createStayState({storage=null}={}){
 let data=defaultStay(),timer=null,dirty=false;const listeners=new Set(),status={available:!!storage,error:null,writes:0};
 try{const source=storage?.getItem(SAVE_KEY);if(source){const parsed=JSON.parse(source);if(parsed?.version>SAVE_VERSION){status.available=false;status.error='newer-save';}else data=validateStay(parsed);}}catch{status.error='invalid-or-unavailable-save';}
 function flush(){clearTimeout(timer);timer=null;if(!dirty||!status.available)return false;try{storage.setItem(SAVE_KEY,JSON.stringify(data));dirty=false;status.writes++;return true;}catch{status.available=false;status.error='storage-unavailable';return false;}}
 function changed(){data.progression=deriveProgression(data);dirty=true;clearTimeout(timer);if(status.available)timer=setTimeout(flush,350);for(const fn of listeners)fn(data);}
 function note(id,text,{kind='place',playerMode='human'}={}){if(data.journal.some(e=>e.id===id))return false;data.journal.push({id,day:data.currentDay,text,kind,playerMode});if(data.journal.length>400)data.journal.shift();changed();return true;}
 function reset(){clearTimeout(timer);data=defaultStay();dirty=true;status.available=!!storage;changed();flush();}
 return {get data(){return data},status,changed,flush,note,reset,onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);}};
}
