import assert from 'node:assert/strict';
import {residentVariation,residentLifeSettings,residentRoles} from '../resident-life-settings.js';

for(let i=0;i<200;i++){
 const p=residentVariation(i);assert.equal(p.height,residentVariation(i).height);
 assert(p.height>=1-residentLifeSettings.heightVariation&&p.height<=1+residentLifeSettings.heightVariation);
 assert(p.shoulders>=1-residentLifeSettings.shoulderVariation&&p.shoulders<=1+residentLifeSettings.shoulderVariation);
}
assert.equal(Object.keys(residentRoles).length,5);
console.log('PASS restrained adult variation / deterministic profiles / five existing identities');
