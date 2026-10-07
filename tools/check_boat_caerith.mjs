import assert from 'node:assert/strict';
import {navigableLake,boatDocks,lakeSurfaceHeight} from '../boat-travel.js';
import {caerithHeight,caerithLayout} from '../caerith.js';
import {regionActivity} from '../region-activity.js';
import {defaultStay,validateStay} from '../stay-state.js';
for(const d of Object.values(boatDocks)){assert.ok(navigableLake(d.boat[0],d.boat[2]));assert.ok(d.boat[1]-.12<lakeSurfaceHeight(d.boat[0],d.boat[2]));}
assert.equal(lakeSurfaceHeight(-420,-6),5.78);assert.equal(lakeSurfaceHeight(-367,-53),5.65);
for(const [x,z]of [[-367,-76],[-431,20],[-313,-24],[-373,-30],[-467,-40],[-459,-40],[-330,-51]])assert.equal(navigableLake(x,z),false);
assert.ok(navigableLake(-400,-80));assert.ok(navigableLake(-337,-95));
const legs=[[-420,-6],[-421,-12],[-403,-30],[-385,-49],[-367,-53]];
for(let i=1;i<legs.length;i++)for(let t=0;t<=1;t+=.01){const a=legs[i-1],b=legs[i];assert.ok(navigableLake(a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])));}
assert.equal(caerithHeight(...[caerithLayout.entry[0],caerithLayout.entry[2]]),6.12);assert.equal(caerithHeight(-390,-76),null);
for(const boatDock of ['lunmere','lake','caerith','invalid',{},null])assert.equal(validateStay({...defaultStay(),boatDock}).boatDock,['lunmere','lake'].includes(boatDock)?boatDock:'lunmere');
assert.equal(validateStay({...defaultStay(),boatDock:'caerith',discoveries:{'region:caerith':{day:3}}}).boatDock,'caerith');
assert.equal(regionActivity('caerith','bellmire','mobile').interval,1.5);assert.equal(regionActivity('lake-lun','lunmere').tier,'adjacent');assert.equal(regionActivity('caerith','caerith').animate,true);
console.log('PASS local water envelope / island and dry-shore exclusion / continuous sailing corridor / safe island landing / bounded dock restore');
