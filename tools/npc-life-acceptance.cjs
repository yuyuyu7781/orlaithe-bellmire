const assert=require('node:assert/strict'),{boot}=require('./capital-browser.cjs');
const ids=['boatworker','greenBard','lunBoat','lunWatcher','cvGaren','cvSophia','mireGatherer','mireKeeper'];
(async()=>{const b=await boot({viewport:{width:390,height:844},touch:true,baselineDir:process.env.NPC_BASELINE_DIR}),p=b.page;try{
await p.evaluate(()=>{requestAnimationFrame=()=>0;app.walking.enter('human');for(const k of ['mire:exit','mire:visit','region:violet-mire','cv:arrival','region:caer-veyra','region:caer-lowerWard','cv:market','cv:canal-level','region:caer-canalWard'])app.stayState.data.discoveries[k]={day:1};app.townLife.dayAdvance();app.townLife.dayAdvance();app.capitalLife.sync();app.mireStay.sync();window.npcTestController=id=>app.namedTravel.controllers.get(id)??app.residentDay.entries.find(e=>e.record.id===id);});
for(const id of ids){
 const result=await p.evaluate(id=>{
 const a=app,c=npcTestController(id),actor=c.actor??c.record.object,named=!!c.actor;
 a.inspections.dismiss();const opened=a.dialogue.entries.find(e=>e.character.id===id);actor.visible=true;for(let q=actor.parent;q;q=q.parent)q.visible=true;
 // A validated short segment exercises the real existing route executor without
 // waiting a whole day. No engine, dialogue handler or collision policy is mocked.
 let start=null,end=null;
 for(const n of a.residentDay.nodes.filter(n=>n.point.distanceTo(c.feet)<8)){
  const y=a.walking.canStandTownAs('human',n.point.x,n.point.z,n.point.y,actor);if(y===null)continue;
  for(let k=0;k<8;k++){const q=n.point.clone();q.y=y;q.x+=Math.sin(k*Math.PI/4)*.7;q.z+=Math.cos(k*Math.PI/4)*.7;let clear=true,fy=y;
   for(let j=1;j<=20;j++){const s=n.point.clone().lerp(q,j/20);fy=a.walking.canStandTownAs('human',s.x,s.z,fy,actor);if(fy===null){clear=false;break;}}
   if(clear){start=n.point.clone();start.y=y;end=q;end.y=fy;break;}}
  if(start)break;
 }
 if(!start)throw Error('No valid fixture segment '+id);
 c.feet.copy(start);c.cursor=0;c.wait=0;c.departureWait=0;c.routePause=0;c.marginPoint=null;c.departingShop=null;c.inside=null;c.visible=true;c.currentState='walking';c.destination=named?'square':'neighborhood';if(named){c.place='town';c.path=[end];c.externalVisit=null;}else c.route=[end];
 actor.position.copy(actor.parent.worldToLocal(start.clone().add(new a.THREE.Vector3(0,c.offset,0))));
 a.camera.position.copy(start).add(new a.THREE.Vector3(0,3,4));a.camera.lookAt(start);a.camera.updateMatrixWorld();
 a.walking.setArea(null);a.walking.refreshDynamic();let player=null;for(const r of [1.6,2,2.4]){for(let k=0;k<16;k++){const q=start.clone().add(new a.THREE.Vector3(Math.sin(k*Math.PI/8)*r,0,Math.cos(k*Math.PI/8)*r)),y=a.walking.canStandAs('human',q.x,q.z,q.y);if(y!==null){q.y=y;player=q;break;}}if(player)break;}if(!player)throw Error('No safe interaction approach '+id);a.walking.relocate(player,{yaw:0});
 a.inspections.handlers.get('talk')(opened);
 const before=c.feet.toArray(),route=(named?c.path:c.route).map(v=>typeof v==='number'?v:v.toArray()),cursor=c.cursor;
 for(let i=0;i<40;i++){if(named)a.namedTravel.update(.05);else a.residentDay.update(.05);}
 const during=c.feet.toArray(),sameRoute=JSON.stringify(route)===JSON.stringify((named?c.path:c.route).map(v=>typeof v==='number'?v:v.toArray())),sameCursor=cursor===c.cursor;
 a.inspections.dismiss();if(named)a.namedTravel.update(.05);else a.residentDay.update(.05);const r=a.residentLife.records.find(r=>r.object===actor);const motion={state:r.currentState,activity:r.activity,phase:r.walkPhase??0,paused:actor.userData.conversationPaused};for(let i=0;i<19;i++){if(named)a.namedTravel.update(.05);else a.residentDay.update(.05);}
 return{before,during,after:c.feet.toArray(),sameRoute,sameCursor,motion};
 },id);
 assert.deepEqual(result.during,result.before,id+' must stop during actual dialogue');assert.ok(result.sameRoute&&result.sameCursor,id+' must retain exact route and cursor');assert.notDeepEqual(result.after,result.before,id+' must resume after dismissal');
 if(process.env.NPC_CHECK_ANIMATION&&['boatworker','greenBard'].includes(id)){assert.equal(result.motion.state,'walking',id+' real movement must drive shared foot animation');assert.equal(result.motion.activity,'walking');assert.ok(result.motion.phase>0);assert.equal(result.motion.paused,false);}console.log('PASS conversation freeze/resume',id);
}
assert.deepEqual(b.errors,[]);console.log('PASS eight real route executors freeze only dialogue target and resume');
}finally{await b.browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
