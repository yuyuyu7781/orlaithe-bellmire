import assert from 'node:assert/strict';
import {walkingProfiles,humanRouteStandard} from '../walking.js';
import {townLandmarks,createDestinations,destinationReading} from '../navigation-data.js';
assert(humanRouteStandard.minimumWidth>walkingProfiles.human.radius*2+.5);
assert(humanRouteStandard.maximumRiser<walkingProfiles.human.stepUp);
assert(walkingProfiles.cat.radius<walkingProfiles.human.radius);
const door={shop:{id:'bakery',name:'パン屋'},approach:[-25.965,3.5,27]};
const destinations=createDestinations([door]);assert.equal(destinations[0].position[0],door.approach[0]);destinations[0].position[0]=0;assert.equal(door.approach[0],-25.965);
assert.equal(new Set(townLandmarks.map(d=>d.id)).size,9);
assert(townLandmarks.some(d=>d.id==='nine-stones'));assert(townLandmarks.some(d=>d.id==='bellmire'));
for(const [position,yaw] of [[[0,0,-10],0],[[10,0,0],-Math.PI/2],[[-10,0,0],Math.PI/2],[[0,0,10],Math.PI]]){
 const r=destinationReading({x:0,y:0,z:0},yaw,{position});assert.equal(r.distance,10);assert(Math.abs(r.bearing)<1e-8);assert.equal(r.arrived,false);
}
assert.equal(destinationReading({x:0,y:3.5,z:0},0,{position:[0,1.38,0]}).arrived,false);
assert.equal(destinationReading({x:0,y:3.5,z:0},0,{position:[.8,3.5,0]}).arrived,true);
console.log('PASS visible human lane standard / cat profile separation / copied entrance targets / heading conventions / terrace-safe arrival');
const {readFileSync}=await import('node:fs');
const report=JSON.parse(readFileSync(new URL('./walking-reachability.json',import.meta.url)));
assert.equal(report.checks.length,30);
assert.equal(new Set(report.checks.map(c=>c.source+':'+c.id)).size,30);
for(const source of ['square','harbor','market'])assert.equal(report.checks.filter(c=>c.source===source).length,10);
console.log('PASS recorded plaza-harbor-market matrix: 3 starts × 10 destinations');
