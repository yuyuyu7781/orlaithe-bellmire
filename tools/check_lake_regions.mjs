import assert from 'node:assert/strict';
import {lakeHeight,lakeLayout,lakeEdge} from '../lake-lun.js';
import {createRegionData} from '../regions.js';
import {validateStay,defaultStay} from '../stay-state.js';
// Collision gradients and water exclusion, independent of the render loop.
for(let i=1;i<lakeLayout.road.length;i++){
 const a=lakeLayout.road[i-1],b=lakeLayout.road[i];assert.ok(Math.abs(b[1]-a[1])/Math.hypot(b[0]-a[0],b[2]-a[2])<.1);
 for(let t=0;t<=1;t+=.025){const x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t;assert.ok(Number.isFinite(lakeHeight(x,z)));}
}
assert.equal(lakeHeight(-330,-24),null);assert.equal(lakeHeight(-400,-24),null);
assert.ok(lakeHeight(lakeEdge(-41)+.4,-41)>5.9);
const regions=createRegionData(Array.from({length:19},(_,i)=>({id:'legacy-'+i})),[{id:'inn',position:[-33,6.25,2.5]}]);
assert.deepEqual(regions.map(r=>r.id),['bellmire','nine-stones','lake-lun','lunmere','caerith']);assert.equal(regions[0].cameraPresets.length,19);
for(const r of regions){assert.ok(r.cameraPresets.length>=6);assert.ok(r.navigationTargets.length>=2);assert.ok(r.mapBounds.minX<r.mapBounds.maxX);assert.equal(r.entryPoint.length,3);assert.ok(r.ambientProfile);}
const raw=defaultStay();raw.discoveries['lake:visit']={day:2,label:'湖岸',playerMode:'human'};raw.discoveries['lake:cat-reeds']={day:2,label:'葦',playerMode:'cat'};raw.discoveries['region:nine-stones']={day:1};raw.journal.push({id:'lake:visit',day:2,text:'静かな湖岸に出た。'});const restored=validateStay(JSON.parse(JSON.stringify(raw)));
assert.ok(restored.discoveries['lake:visit']);assert.equal(restored.discoveries['lake:cat-reeds'].playerMode,'cat');assert.ok(restored.discoveries['region:nine-stones']);assert.equal(restored.journal[0].day,2);
console.log('PASS descending road / safe shore and excluded water / five extensible regions / 19 legacy cameras / backward-compatible lake discoveries');
