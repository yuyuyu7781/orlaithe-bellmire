import assert from 'node:assert/strict';
import {townRhythm,visitorPlans,visitorPresent,seasonProfiles} from '../town-calendar.js';
import {defaultStay,validateStay} from '../stay-state.js';
assert.equal(townRhythm(1).cycleDay,1);assert.equal(townRhythm(8).cycleDay,1);
assert.equal(townRhythm(4).market,true);assert.equal(townRhythm(4,'day','rain').market,false);
assert.equal(townRhythm(6,'night').gathering,true);assert.equal(townRhythm(6,'night','blackout').gathering,false);
for(const p of visitorPlans){assert.equal(visitorPresent(p,7),false);assert.equal(visitorPresent(p,4),true);}
assert.deepEqual(Object.keys(seasonProfiles),['spring','summer','autumn','winter']);
const old=defaultStay();delete old.season;assert.equal(validateStay(old).season,'spring');
assert.equal(validateStay({...defaultStay(),season:'autumn'}).season,'autumn');assert.equal(validateStay({...defaultStay(),season:'broken'}).season,'spring');
console.log('PASS repeating seven-day rhythm / weather exclusions / visiting windows / backward-compatible seasons');
