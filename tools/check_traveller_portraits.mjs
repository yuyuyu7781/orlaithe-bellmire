import assert from'node:assert/strict';import fs from'node:fs';import{visitorPlans}from'../town-calendar.js';import{selectPortrait}from'../dialogue-data.js';
const baseline=JSON.parse(fs.readFileSync(new URL('./traveller-legacy-baseline.json',import.meta.url)));assert.deepEqual(visitorPlans.map(({portraitDefault,...legacy})=>legacy),baseline);
for(const plan of visitorPlans){const image=selectPortrait(plan);assert.ok(image?.src,plan.id);assert.ok(fs.existsSync(image.src));}
console.log('PASS three visitor portraits; IDs, names, lines, days, schedules, roles and return dialogue unchanged');
