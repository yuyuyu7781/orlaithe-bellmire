// Day-scoped water, shared by the road, water surfaces and the boat controller.
// Weather changes within the same day never flood a walking player immediately.
export const waterOffsets={normal:0,low:-.12,veryLow:-.5};
let current='normal';
export const lakeWaterOffset=()=>waterOffsets[current];
export const lakeWaterPhase=()=>current;
export function selectLakeWater(data){
 const old=data.waterLevelState??{},day=data.currentDay,rumor=data.discoveries['drowned:rumor']??data.discoveries['drowned:entry'];
 if(old.day===day&&Object.hasOwn(waterOffsets,old.phase))return {...old};
 let firstLowDay=old.firstLowDay??null;
 if(!firstLowDay&&day>=4&&rumor&&rumor.day<day&&data.weather!=='rain')firstLowDay=day;
 const cycle=firstLowDay?(day-firstLowDay)%7:-1;
 const phase=cycle===0||cycle===1?'veryLow':cycle===2||(!firstLowDay&&day%7===3)?'low':'normal';
 return{day,phase,firstLowDay};
}
export function setLakeWaterPhase(phase){current=Object.hasOwn(waterOffsets,phase)?phase:'normal';}
export function createLakeWaterLevel({stay,townLife,walking,surfaces,beforeChange=()=>{}}){
 const water=surfaces.map(object=>({object,y:object.position.y}));let applied=null,busy=false;const listeners=new Set();
 function apply(){if(busy)return;busy=true;try{const next=selectLakeWater(stay.data),changed=JSON.stringify(next)!==JSON.stringify(stay.data.waterLevelState);
 if(applied!==next.phase){beforeChange(next.phase);setLakeWaterPhase(next.phase);for(const {object,y}of water){object.position.y=y+lakeWaterOffset();object.updateWorldMatrix(true,false);}walking.refreshWaterSurfaces?.();applied=next.phase;for(const f of listeners)f(next);}
 stay.data.waterLevelState=next;if(changed)stay.changed();}finally{busy=false;}}
 townLife.onChange(apply);apply();return{apply,onChange(fn){listeners.add(fn);return()=>listeners.delete(fn)},get state(){return stay.data.waterLevelState},get phase(){return current}};
}
