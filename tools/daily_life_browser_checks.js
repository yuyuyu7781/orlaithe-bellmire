// Invoke in an isolated browser fixture; this deliberately advances its clock.
// It uses production movement/physics, and never relocates a resident.
export function checkDailyTransitions(app,ticks=9000){
 const require=(ok,message)=>{if(!ok)throw Error(message);};
 const life=app.residentDay;require(life.entries.length===8,'Expected eight existing scheduled residents');
 app.walking.leave();const result=[];
 for(const period of ['day','evening','night','morning']){
  const before=life.entries.map(e=>e.feet.clone());app.townLife.setPeriod(period);
  require(life.entries.every((e,i)=>e.feet.distanceTo(before[i])<1e-6),'Clock teleported a resident');
  let updated=0;for(let i=0;i<ticks;i++){life.update(.05);updated+=life.stats.updated;}
  const inside=life.entries.filter(e=>e.inside).length;
  require(life.entries.every(e=>e.cursor>=e.route.length&&!e.departingShop),'A resident did not finish the street route: '+period+' '+JSON.stringify(life.entries.map(e=>({i:e.index,cursor:e.cursor,total:e.route.length,state:e.currentState,p:e.feet.toArray()}))));
  if(period==='evening'||period==='night')require(inside===4,'Missing tavern/inn arrivals');
  else require(inside===0,'Residents did not return to work');
  result.push({period,inside,updated,states:life.entries.map(e=>e.currentState)});
 }
 require(app.walking.catSteps.length===5,'Expected five tested low cat steps');
 require(app.ambientAudio.stats.configured===0&&app.ambientAudio.stats.contexts===0,'Unset audio should stay inert');
 return {scheduled:8,clockTeleports:0,transitions:result,catSteps:5};
}
