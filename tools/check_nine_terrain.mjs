import assert from 'node:assert/strict';
import {nineField,nineHeight} from '../nine-terrain.js';
import {walkingProfiles} from '../walking.js';
import {validateStay,defaultStay} from '../stay-state.js';
assert.equal(nineHeight(nineField.minX-.01,-30),null);
assert.equal(nineHeight(-190,nineField.maxZ+.01),null);
let low=Infinity,high=-Infinity;
for(let x=nineField.minX;x<=nineField.maxX;x+=.1)for(let z=nineField.minZ;z<=nineField.maxZ;z+=.1){const y=nineHeight(x,z);assert(Number.isFinite(y));low=Math.min(low,y);high=Math.max(high,y);for(const [dx,dz]of[[.1,0],[0,.1]]){const next=nineHeight(x+dx,z+dz);if(next!==null)assert(Math.abs(next-y)<walkingProfiles.human.stepUp/3);}}
assert(low>9&&high<10.4);assert(nineHeight(-206,-23)<nineHeight(-202,-23));
const save=defaultStay();save.discoveries['nine:cat-chip']={day:4,playerMode:'cat',period:'morning',label:'石片'};save.discoveries['nine:visit']={day:3,playerMode:'human',period:'day',label:'九石'};const restored=validateStay(JSON.parse(JSON.stringify(save)));assert.equal(restored.discoveries['nine:cat-chip'].playerMode,'cat');assert.equal(restored.discoveries['nine:visit'].day,3);
console.log('PASS bounded continuous upland / safe step gradients / downhill onward shore / existing save discoveries');
