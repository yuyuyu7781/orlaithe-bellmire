import assert from 'node:assert/strict';
import {shops,isShopOpen,dailyLocations,rumorPools,townEventDefinitions,soundAnchors} from '../shop-data.js';
import {characters,selectDialogueTurn,selectPortrait} from '../dialogue-data.js';
const periods=['morning','day','evening','night'];
assert.equal(shops.length,5);assert.equal(new Set(shops.map(s=>s.id)).size,5);
for(const s of shops){for(const p of periods){assert.ok(['open','quiet','limited','closed'].includes(s.hours[p]));assert.equal(isShopOpen(s,p),s.hours[p]!=='closed');}if(s.actor)assert.ok(characters.find(c=>c.id===s.actor));}
assert.equal(isShopOpen(shops.find(s=>s.id==='bakery'),'night'),false);
assert.equal(isShopOpen(shops.find(s=>s.id==='tavern'),'morning'),false);
for(const p of periods)assert.equal(isShopOpen(shops.find(s=>s.id==='inn'),p),true);
for(const c of characters){for(const p of periods)assert.ok(dailyLocations[c.id][p]);assert.ok(rumorPools[c.id].length);assert.ok(selectPortrait(c).src);}
const base=characters.find(c=>c.id==='baker'),sample={...base,rumorPool:['quiet rumor'],locationLines:{bakery:{human:['inside oven'],cat:['under table']}}};
assert.equal(selectDialogueTurn(sample,{location:'bakery'}).text,'inside oven');
assert.equal(selectDialogueTurn(sample,{location:'bakery',profile:'cat'}).text,'under table');
assert.equal(selectDialogueTurn(sample,{location:'bakery',index:1}).text,base.lines.human.default[0]);
assert.equal(selectDialogueTurn(sample,{location:'bakery',time:'night',index:1}).text,base.lines.human.night[0]);
assert.equal(selectDialogueTurn(sample,{location:'bakery',profile:'cat',index:1}).text,base.lines.cat.default[0]);
assert.equal(selectDialogueTurn(sample,{location:'bakery',index:3}).text,'quiet rumor');
assert.ok(!selectDialogueTurn(sample,{location:'bakery',profile:'cat',index:3}).text.includes('quiet rumor'));
assert.equal(selectDialogueTurn(sample,{location:'town',index:0}).text,selectDialogueTurn(base,{index:0}).text);
assert.equal(townEventDefinitions.filter(e=>e.enabled).length,7);assert.equal(townEventDefinitions.filter(e=>e.profiles?.length===1&&e.profiles[0]==='cat').length,2);assert.ok(townEventDefinitions.every(e=>e.id&&e.source&&e.text));assert.ok(soundAnchors.every(s=>s.src===null));
console.log('PASS five shop schedules / five daily placements / location and actor dialogue / occasional rumors / unchanged portraits / seven active observations / two cat discoveries / inactive audio hooks');
