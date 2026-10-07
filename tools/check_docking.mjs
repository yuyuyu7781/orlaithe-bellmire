import assert from 'node:assert/strict';
import {nearbyDock,boatDocks,pierBounds} from '../boat-travel.js';
// Both long sides and the end of the entire Lake Lun pier, including locations
// beyond the old 2.7m mooring radius. No open-water or remote-shore exit.
for(const x of [-324,-321,-319]){
 assert.equal(nearbyDock(x,-26.5),'lake');
 assert.equal(nearbyDock(x,-21.5),'lake');
}
assert.equal(nearbyDock(-325.6,-24),'lake');
for(const [x,z]of [[-330,-24],[-321,-29],[-400,-35],[-367,-76]])assert.equal(nearbyDock(x,z),null);
for(const [id,d]of Object.entries(boatDocks))assert.equal(nearbyDock(d.boat[0],d.boat[2]),id);
for(const [id,[left,right,near,far]]of Object.entries(pierBounds))for(const z of [near+.3,(near+far)/2,far-.3])assert.equal(nearbyDock(left-1.3,z),id);
console.log('PASS full pier edges / end / all safe docks / open-water rejection');
