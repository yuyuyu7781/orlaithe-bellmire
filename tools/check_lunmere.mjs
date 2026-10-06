import assert from 'node:assert/strict';
import {lunmereLayout,lunmereShops,lunmereCharacters,lakeTownEvents} from '../lunmere-data.js';
import {lunmereHeight} from '../lunmere.js';
import {defaultStay,validateStay} from '../stay-state.js';
for(let i=1;i<lunmereLayout.road.length;i++){const a=lunmereLayout.road[i-1],b=lunmereLayout.road[i];assert.ok(Math.abs(b[1]-a[1])/Math.hypot(b[0]-a[0],b[2]-a[2])<.03);for(let t=0;t<=1;t+=.025)assert.ok(Number.isFinite(lunmereHeight(a[0]+t*(b[0]-a[0]),a[2]+t*(b[2]-a[2]))));}
assert.equal(lunmereHeight(-425,-13),null);assert.equal(lunmereShops.length,4);assert.equal(lunmereCharacters.length,3);assert.equal(lakeTownEvents.length,8);
const old=validateStay(defaultStay());assert.equal(old.currentDay,1);assert.deepEqual(old.memories,{});
const raw=defaultStay();raw.currentDay=4;raw.events['lake-parcel']={state:'resolved',noticedDay:2,resolvedDay:3};raw.events['lun-low-water']={state:'noticed',noticedDay:4};raw.memories.lunHost={human:{visits:2,firstDay:3,lastDay:4},cat:{visits:1,firstDay:4,lastDay:4}};raw.discoveries['region:lunmere']={day:3};raw.discoveries['lun:cat-circle']={day:4,playerMode:'cat'};raw.journal.push({id:'lunmere-arrival',day:3,text:'湖の町に着いた。'});
const restored=validateStay(JSON.parse(JSON.stringify(raw)));assert.equal(restored.events['lake-parcel'].resolvedDay,3);assert.equal(restored.events['lun-low-water'].state,'noticed');assert.equal(restored.memories.lunHost.cat.visits,1);assert.ok(restored.discoveries['region:lunmere']);assert.equal(restored.discoveries['lun:cat-circle'].playerMode,'cat');assert.equal(restored.journal[0].day,3);
assert.equal(new Set(lakeTownEvents.map(e=>e.id)).size,8);assert.equal(new Set(lunmereShops.map(e=>e.id)).size,4);
console.log('PASS four facilities / three identities / eight incidents / gentle lakeside gradients / dry land boundary / backward-compatible saved memories and discoveries');
