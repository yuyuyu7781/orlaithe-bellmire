import assert from 'node:assert/strict';
import {weatherProfiles,timeAtmosphere} from '../scene-settings.js';
import {createStayState} from '../stay-state.js';
import {rememberConversation,rememberedDialogue} from '../dialogue-memory.js';
import {stayObservation} from '../stay-dialogue.js';
assert(weatherProfiles.dawn.sun<timeAtmosphere.morning.sun);
assert(weatherProfiles.dawn.exposure<timeAtmosphere.morning.exposure);
assert(weatherProfiles.dawn.hemi>weatherProfiles.blackout.hemi);
assert(weatherProfiles.rain.density<weatherProfiles.fog.density);
const stay=createStayState(),ids=['baker','bookseller','boatworker','starmaker','greenBard'];
for(const id of ids)rememberConversation(stay,{id,name:id},'human');
stay.data.currentDay=2;
for(const id of ids){assert(stayObservation(stay,id,{profile:'human',index:2}));assert.equal(stayObservation(stay,id,{profile:'human',index:3}),null);}
for(const weather of ['rain','dawn','blackout']){stay.data.weather=weather;for(const id of ids)assert(stayObservation(stay,id,{profile:'human',index:2}));}
stay.data.weather='clear';stay.data.currentDay=3;
assert.match(stayObservation(stay,'starmaker',{profile:'human',index:2}),/鐘/);
assert.match(stayObservation(stay,'greenBard',{profile:'human',index:2}),/古い印/);
rememberConversation(stay,{id:'greenBard',name:'フィン'},'cat');stay.data.currentDay=4;
assert.match(rememberedDialogue(stay,{id:'greenBard'},{profile:'human',index:2}),/低いところ/);
console.log('PASS distinct predawn/morning and rain/fog / five weather-day observations / rumours retain their turn / Finn cross-form memory priority');
