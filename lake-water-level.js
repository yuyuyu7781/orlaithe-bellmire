import {evaluateConditions,regionVisited} from './progression-data.js';
// Day-scoped water, shared by the road, water surfaces and the boat controller.
// Weather changes within the same day never flood a walking player immediately.
export const waterOffsets={normal:0,low:-.12,veryLow:-.5,extremeLow:-1.25};
export const waterSeasonProfiles={spring:{ringInterval:10,ringDuration:2},summer:{ringInterval:10,ringDuration:2},autumn:{ringInterval:10,ringDuration:2},winter:{ringInterval:10,ringDuration:2}};
let current='normal';
export const lakeWaterOffset=()=>waterOffsets[current];
export const lakeWaterPhase=()=>current;
export function selectLakeWater(data){
 const old=data.waterLevelState??{},day=data.currentDay,rumor=data.discoveries['drowned:rumor']??data.discoveries['drowned:entry'];
 if(old.day===day&&Object.hasOwn(waterOffsets,old.phase))return {...old};
 let firstRingDay=old.firstRingDay??null;
 const has=id=>!!data.discoveries[id];
 const ready=day>=7&&has('drowned:walk')&&has('drowned:rumor')&&has('caerith:foundation')&&['nine:stone-3','nine:stone-5','nine:stone-9'].some(has);
 if(!firstRingDay&&ready&&data.weather!=='rain')firstRingDay=day;
 // Two quiet days, then eight days underwater. Seasonal profiles can override the interval later.
 const profile=waterSeasonProfiles[data.season]??waterSeasonProfiles.spring;
 const ringCycle=firstRingDay?(day-firstRingDay)%profile.ringInterval:-1;
 let firstLowDay=old.firstLowDay??null;
 if(!firstLowDay&&day>=4&&rumor&&rumor.day<day&&data.weather!=='rain')firstLowDay=day;
 const cycle=firstLowDay?(day-firstLowDay)%7:-1;
 const phase=cycle===0||cycle===1?'veryLow':cycle===2||(!firstLowDay&&day%7===3)?'low':'normal';
 return{day,phase:ringCycle>=0&&ringCycle<profile.ringDuration?'extremeLow':phase,firstLowDay,firstRingDay};
}
export function setLakeWaterPhase(phase){current=Object.hasOwn(waterOffsets,phase)?phase:'normal';}
export function createLakeWaterLevel({stay,townLife,walking,surfaces,beforeChange=()=>{}}){
 const water=surfaces.map(object=>({object,y:object.position.y}));let applied=null,busy=false;const listeners=new Set();
 function apply(){if(busy)return;busy=true;try{const next=selectLakeWater(stay.data),changed=JSON.stringify(next)!==JSON.stringify(stay.data.waterLevelState);
 if(applied!==next.phase){beforeChange(next.phase);setLakeWaterPhase(next.phase);for(const {object,y}of water){object.position.y=y+lakeWaterOffset();object.updateWorldMatrix(true,false);}walking.refreshWaterSurfaces?.();applied=next.phase;for(const f of listeners)f(next);}
 stay.data.waterLevelState=next;if(changed)stay.changed();}finally{busy=false;}}
 townLife.onChange(apply);apply();return{apply,onChange(fn){listeners.add(fn);return()=>listeners.delete(fn)},get state(){return stay.data.waterLevelState},get phase(){return current}};
}

// Advice only: replay the real next-morning calculation without applying scene/save changes.
export function forecastKnownWaterAccess(data,regionId,{maxNights=14}={}){
 const rules={'drowned-way':'low-water','the-ring':'extreme-water','hollow-crown':'descent'},rule=rules[regionId];
 if(!rule||!data||!Number.isInteger(data.currentDay)||data.currentDay<1||data.currentDay>9999||!data.discoveries)return null;
 const known=regionVisited(data,regionId)||(regionId==='drowned-way'&&!!data.discoveries['drowned:entry']);if(!known)return null;
 const copy=structuredClone(data);copy.waterLevelState=selectLakeWater(copy);
 const phase=copy.waterLevelState.phase,walkableToday=evaluateConditions(rule,copy);
 const stateText=regionId==='drowned-way'?({normal:'旧道は水の下。今は岸で待つ方がよさそう。',low:'岸の石は少し見える。旧道を歩くには、まだ水が高い。',veryLow:'旧道が通れそう。濡れた石には気をつけて。',extremeLow:'かなり水が引いている。前に歩いた旧道は通れそう。'}[phase]):walkableToday?'前に歩いた場所は、今日は通れそう。':'前に歩いた場所は、今は水の下。';
 let nightsToOpen=walkableToday?0:null,evaluatedThroughDay=copy.currentDay,tomorrowWalkable=null;
 const limit=Math.min(14,Math.max(0,Number.isFinite(maxNights)?Math.floor(maxNights):14),9999-copy.currentDay);
 for(let n=1;n<=Math.max(walkableToday?Math.min(1,9999-copy.currentDay):0,limit);n++){
  copy.currentDay++;copy.dayStart=copy.currentDay;copy.dayPhase='morning';copy.waterLevelState=selectLakeWater(copy);const open=evaluateConditions(rule,copy);
  evaluatedThroughDay=copy.currentDay;if(n===1)tomorrowWalkable=open;if(walkableToday)break;if(open){nightsToOpen=n;break;}
 }
 const place=regionId==='drowned-way'?'旧道':'前に歩いた場所';
 const forecastText=nightsToOpen===0?'':nightsToOpen!==null?`今の天気が続けば、あと${nightsToOpen}泊ほどで${place}を歩けそう。`:data.weather==='rain'?`雨が続く間は、${place}を歩ける朝の見通しは立ちにくい。`:'通れる朝の見通しは、まだ立ちにくい。';
 return{day:data.currentDay,stateText,walkableToday,nightsToOpen,forecastText,tomorrowWalkable,assumption:'current-weather',evaluatedThroughDay};
}
