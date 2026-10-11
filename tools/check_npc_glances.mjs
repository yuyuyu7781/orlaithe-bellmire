import assert from 'node:assert/strict';
import * as routines from '../resident-routines.js';
assert.equal(typeof routines.updateResidentGlances,'function','existing shared-place exchange needs bounded state');
const person=(id,x)=>({record:{id,object:{userData:{}}},feet:{x,y:0,z:0,distanceTo(q){return Math.hypot(this.x-q.x,this.y-q.y,this.z-q.z)}},visible:true,inside:false,space:'lun-diner',region:'lunmere',parent:'town',available:true,action:{kind:'idle'}});
const a=person('lunBoat',0),b=person('lunWatcher',2),entries=[a,b];
routines.updateResidentGlances(entries,100,{scan:true});assert.equal(a.record.glance?.partner,b.record);assert.equal(b.record.glance?.partner,a.record);
const until=a.record.glance.until;assert(until>100&&until<=104);routines.updateResidentGlances(entries,until+.1,{scan:false});assert.equal(a.record.glance,null);assert.equal(b.record.glance,null);assert(a.record.nextGlance>until+20);
for(const property of ['available','space','region','parent','visible']){
 const x=person('lunBoat',0),y=person('lunWatcher',2);y[property]=property==='space'||property==='region'||property==='parent'?'different':false;
 routines.updateResidentGlances([x,y],200,{scan:true});assert.ok(!x.record.glance,property+' mismatch must not start exchange');
}
for(const kind of ['work','moving','blocked']){const x=person('lunBoat',0),y=person('lunWatcher',2);y.action={kind};routines.updateResidentGlances([x,y],200,{scan:true});assert.ok(!x.record.glance,kind+' must take priority');}
const x=person('lunBoat',0),y=person('lunWatcher',2);routines.updateResidentGlances([x,y],200,{scan:true});y.available=false;routines.updateResidentGlances([x,y],200.1,{scan:false});assert.ok(!x.record.glance&&!y.record.glance,'dialogue/movement/region loss cancels both ends immediately');
const close=person('lunWatcher',.3),far=person('lunWatcher',4);for(const other of [close,far]){const x=person('lunBoat',0);routines.updateResidentGlances([x,other],300,{scan:true});assert.ok(!x.record.glance,'no overlap or distant pairing');}
const secret=person('cvElda',2);routines.updateResidentGlances([person('lunBoat',0),secret],300,{scan:true});assert.ok(!secret.record.glance,'unrequested named actor excluded');
assert.deepEqual([a.feet.x,b.feet.x],[0,2],'glance never changes positions');
console.log('PASS bounded shared-place glance, cooldown, work/movement priority, pair cancellation, distance and identity guards');
