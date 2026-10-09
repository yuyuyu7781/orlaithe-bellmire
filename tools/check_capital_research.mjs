import assert from 'node:assert/strict';
import {defaultStay,validateStay} from '../stay-state.js';
import {researchDocuments,researchTraces,researchCatFinds,researchStage} from '../capital-research-data.js';
import {lodgingCharacters} from '../lodging-data.js';
import {capitalCharacters} from '../caer-veyra-data.js';
import {deriveProgression} from '../progression-data.js';
const d=defaultStay(),see=k=>d.discoveries[k]={day:30};assert.equal(researchStage(d),null);see('cv:doc:commerce');assert.equal(researchStage(d),'tracesRemain');see('cv:doc:building');see('cv:compare:doc-building_doc-commerce');assert.equal(researchStage(d),'conflictingSources');for(const id of ['canal','oldMap'])see('cv:doc:'+id);see('cv:compare:cat-shelf-number_doc-canal');assert.equal(researchStage(d),'conflictingSources');see('cv:research-cat:shelf-number');assert.equal(researchStage(d),'olderLayerSuspected');d.threads.caerVeyraRecords={stage:'olderLayerSuspected'};d.threads.bell={stage:'afterglow',anomalyDay:6};d.memories.cvMira={human:{visits:5,firstDay:25,lastDay:30}};const restored=validateStay(d);assert.equal(restored.threads.caerVeyraRecords.stage,'olderLayerSuspected');assert.equal(restored.threads.bell.stage,'afterglow');assert.equal(restored.memories.cvMira.human.visits,5);assert.ok(restored.discoveries['cv:research-cat:shelf-number']);for(const stage of ['compared','missing','ordinary','arrival','unseen'])assert.equal(validateStay({version:1,threads:{caerVeyraRecords:{stage}}}).threads.caerVeyraRecords.stage,stage);assert.equal(deriveProgression(restored).chapters.capital,'present');assert.equal(researchDocuments.length,11);assert.equal(new Set(researchDocuments.map(d=>d.category)).size,8);assert.equal(researchTraces.length,12);assert.equal(researchCatFinds.length,10);assert.ok(researchDocuments.some(d=>!d.trace));assert.equal(capitalCharacters.filter(c=>!c.lodging).length,14);assert.ok(capitalCharacters.filter(c=>!c.lodging).every(c=>c.portraitDefault?.src));console.log('PASS source categories, staged comparison/physical evidence, no automatic cause, old/new thread saves and all 14 portraits');

// Pin existing thresholds; six evidence kinds are acceptance coverage, not stage requirements.
for(const [docs,pairs,physical,expected] of [
 [0,0,null,null],[1,0,null,'tracesRemain'],[1,1,null,'tracesRemain'],[2,0,null,'tracesRemain'],[2,1,null,'conflictingSources'],[3,2,'cv:trace:wall-stairs','conflictingSources'],[4,1,'cv:trace:wall-stairs','conflictingSources'],[4,2,null,'conflictingSources'],[4,2,'cv:trace:wall-stairs','olderLayerSuspected'],[4,2,'cv:research-cat:records-floor','olderLayerSuspected']]){
 const data=defaultStay();
 for(const id of ['commerce','building','canal','oldMap'].slice(0,docs))data.discoveries['cv:doc:'+id]={day:30};
 for(const key of ['cv:compare:doc-building_doc-commerce','cv:compare:doc-canal_doc-oldMap'].slice(0,pairs))data.discoveries[key]={day:30};
 if(physical)data.discoveries[physical]={day:30};
 assert.equal(researchStage(data),expected,JSON.stringify({docs,pairs,physical}));
}
for(const key of ['cv:trace:wall-stairs','cv:research-cat:records-floor','cv:elda-memory','cv:doc:passage','cv:doc:family','cv:doc:repair','cv:doc:district']){
 const data=defaultStay();data.discoveries[key]={day:30};assert.equal(researchStage(data),null,key);
}
for(const count of [999,1000,1001]){
 const data=defaultStay();for(let i=0;i<count;i++)data.discoveries['fixture:'+i]={day:30};
 assert.equal(Object.keys(validateStay(data).discoveries).length,Math.min(count,1000));
}
for(const count of [399,400,401]){
 const data=defaultStay();data.journal=Array.from({length:count},(_,i)=>({id:'fixture:'+i,text:'fixture',day:30}));
 const journal=validateStay(data).journal;assert.equal(journal.length,Math.min(count,400));assert.equal(journal[0].id,'fixture:'+Math.max(0,count-400));
}
assert.equal(validateStay({version:1,threads:{caerVeyraRecords:{stage:'unknown'}}}).threads.caerVeyraRecords.stage,'unseen');
const injected=defaultStay();for(const id of ['commerce','building','canal','oldMap'])injected.discoveries['cv:doc:'+id]={day:30};
for(const id of ['cv:compare:unknown','cv:compare:doc-unread','cv:trace:wall-stairs'])injected.discoveries[id]={day:30};
assert.equal(researchStage(injected),'olderLayerSuspected','legacy comparison prefix counting remains unchanged');
console.log('PASS independent stage boundaries, non-trace evidence, legacy unknown comparisons and storage bounds');
