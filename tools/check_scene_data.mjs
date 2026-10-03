import assert from 'node:assert/strict';
import {characters,selectDialogue,selectDialogueTurn,selectPortrait} from '../dialogue-data.js';
import {weatherProfiles,periodSettings,districtWeights,waterInfluence} from '../scene-settings.js';

assert.equal(characters.length,5);
for(const c of characters){assert.equal(selectPortrait(c),null);assert.equal(typeof selectDialogue(c),'string');assert.ok(c.lines.human.default.length>=2);}
const c={name:'test',portrait:{src:'legacy'},portraitDefault:{src:'default'},portraitHappy:{src:'happy'},portraitSerious:{src:'serious'},portraitNight:{src:'night'},lines:{human:{default:['old line'],night:[{text:'closing time',expression:'serious'}]},cat:{night:['feline night']}}};
assert.equal(selectPortrait(c,{time:'night'}).src,'night');
assert.equal(selectPortrait(c,{time:'night',expression:'happy'}).src,'happy');
assert.equal(selectPortrait(c,{time:'night',expression:'serious'}).src,'serious');
assert.equal(selectPortrait({...c,portraitNight:null},{time:'night'}).src,'default');
assert.equal(selectPortrait({...c,portraitDefault:null,portraitNight:null}).src,'legacy');
assert.equal(selectPortrait({...c,portraitDefault:'image.png'}).src,'image.png');
assert.deepEqual(selectDialogueTurn(c,{time:'night'}),{text:'closing time',expression:'serious'});
assert.equal(selectDialogue(c,{profile:'cat',time:'night'}),'feline night');
assert.equal(selectDialogue(c,{time:'unknown'}),'old line');
assert.equal(selectDialogue(c,{index:5}),'old line');
assert.equal(selectDialogue(characters[0],{time:'dawn'}),selectDialogue(characters[0],{time:'morning'}));
assert.equal(Object.keys(weatherProfiles).length,6);
for(const p of Object.values(weatherProfiles)){assert.ok(periodSettings[p.period]);assert.ok(p.density>0&&p.exposure>0);}
for(let z=-60;z<60;z+=.25){const d=districtWeights(0,z),n=districtWeights(0,z+.001);assert.ok(Math.abs(d.upper+d.middle+d.harbor-1)<1e-9);for(const k of Object.keys(d)){assert.ok(d[k]>=0&&d[k]<=1);assert.ok(Math.abs(d[k]-n[k])<.001);}}
assert.ok(waterInfluence(21,5,28)>.9);assert.equal(waterInfluence(-30,5,0),0);
console.log('PASS dialogue/portrait compatibility, expression and night variants, actor/time fallback, six weather profiles and continuous district/water settings');
