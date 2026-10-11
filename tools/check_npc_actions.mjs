import assert from 'node:assert/strict';
import * as routines from '../resident-routines.js';
assert.equal(typeof routines.residentActionFor,'function','existing routines need a presentation selector for eight residents');
const ids=['boatworker','greenBard','lunBoat','lunWatcher','cvGaren','cvSophia','mireGatherer','mireKeeper'];
const places=['harbor','waterfront','lun-boats','lun-store','cv-work-cvGaren','cv-work-cvSophia','mire-flowers','mire-repair'];
const signatures=[];
for(let i=0;i<ids.length;i++){
 const r={id:ids[i],currentState:'working',activity:'resting',object:{userData:{}}};
 const seen=new Set();
 for(let t=0;t<160;t+=.5){const a=routines.residentActionFor(r,t,{location:places[i],period:'day'});assert(a);seen.add(a.kind);}
 assert(seen.has('work')&&seen.has('idle'),ids[i]+' must alternate role work and quiet pauses');
 signatures.push([...Array(100)].map((_,t)=>JSON.stringify(routines.residentActionFor(r,t,{location:places[i],period:'day'}))).join());
 for(const state of ['walking','goingHome','waitingRoute','departing','listening']){r.currentState=state;assert.equal(routines.residentActionFor(r,40,{location:places[i],period:'day'}),null);}
 r.currentState='working';r.routePending=true;assert.equal(routines.residentActionFor(r,40,{location:places[i],period:'day'}),null);r.routePending=false;r.bellPause=8;assert.equal(routines.residentActionFor(r,40,{location:places[i],period:'day'}),null);r.bellPause=0;assert.equal(routines.residentActionFor(r,40,{location:places[i],period:'day',blocked:true}),null);r.object.userData.shopWork={currentState:'walking'};assert.equal(routines.residentActionFor(r,40,{location:places[i],period:'day'}),null);delete r.object.userData.shopWork;r.object.userData.conversationPaused=true;assert.equal(routines.residentActionFor(r,40,{location:places[i],period:'day'}),null);
}
assert.equal(new Set(signatures).size,8,'all eight rhythms/poses must differ');
assert.equal(routines.residentActionFor({id:'cvElda'},40,{}),null,'unrequested characters unchanged');
console.log('PASS eight deterministic work/idle variations and higher-priority suppression');
for(let i=0;i<ids.length;i++){
 const r={id:ids[i],currentState:'working',object:{userData:{}}};let before=null;
 for(let t=0;t<100;t+=.05){const a=routines.residentActionFor(r,t,{location:places[i],period:'day'});if(before)assert.ok(a.arm.every((v,j)=>Math.abs(v-before.arm[j])<.15),ids[i]+' work/idle transition must not snap arms');before=a;}
}
console.log('PASS work/idle arm transitions stay restrained');
