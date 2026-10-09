const{boot}=require('./capital-browser.cjs'),assert=require('node:assert/strict'),fs=require('fs');
(async()=>{const b=await boot(),p=b.page,out=[];try{for(const era of ['before-capital','capital-before-portrait','capital-with-portrait']){const raw={version:1,currentDay:30,dayPhase:'day',weather:'clear',season:'autumn',threads:{bell:{stage:'afterglow',anomalyDay:6,catFound:true},drowned:{stage:'linked'},ring:{stage:'compared'}},discoveries:{'region:lunmere':{day:4}},memories:{lunBoat:{human:{visits:5,firstDay:4,lastDay:20}}},journal:[{id:'met:lunBoat:human',day:4,text:'テヴと話した。',kind:'person'}]};if(era!=='before-capital'){raw.threads.caerVeyraRecords={stage:'compared'};raw.memories.cvMira={human:{visits:3,firstDay:25,lastDay:29}};for(const k of ['region:violet-mire','cv:arrival','cv:archive-catalog','cv:old-number'])raw.discoveries[k]={day:25};}await p.evaluate(raw=>localStorage.setItem('bellmire.stay.v1',JSON.stringify(raw)),raw);await p.reload();await p.waitForSelector('#loading.hide',{state:'attached',timeout:90000});const r=await p.evaluate(()=>({day:app.stayState.data.currentDay,bell:app.stayState.data.threads.bell.stage,memory:app.stayState.data.memories,capital:app.stayState.data.threads.caerVeyraRecords.stage,research:app.capitalResearch.stats,portraits:app.dialogue.characters.filter(c=>c.id.startsWith('cv')&&!c.lodging).map(c=>({id:c.id,path:c.portraitDefault?.src})),journal:app.stayState.data.journal,chapter:app.stayState.data.progression.chapters}));assert.equal(r.bell,'afterglow');assert.equal(r.memory.lunBoat.human.visits,5);assert.ok(r.journal.every(e=>!e.text.includes('テヴ')));assert.equal(r.research.read,0);assert.ok(r.portraits.length===14&&r.portraits.every(c=>c.path.includes('cv-')));if(era!=='before-capital'){assert.equal(r.capital,'compared');assert.equal(r.memory.cvMira.human.visits,3);}out.push({era,...r});}
// Valid v1 saves must survive reload -> sync -> flush, without six-kind requirements.
for(const spec of [
 {name:'S0',stage:null,docs:0,pairs:0},
 {name:'S2-arrival',stage:'arrival',docs:0,pairs:0},
 {name:'S2-ordinary',stage:'ordinary',docs:0,pairs:0},
 {name:'S2-missing',stage:'missing',docs:0,pairs:0},
 {name:'S3-traces',stage:'tracesRemain',docs:1,pairs:0},
 {name:'S3-conflicting',stage:'conflictingSources',docs:2,pairs:1},
 {name:'S4-building',stage:'olderLayerSuspected',docs:4,pairs:2,physical:'cv:trace:wall-stairs'},
 {name:'S4-cat',stage:'olderLayerSuspected',docs:4,pairs:2,physical:'cv:research-cat:records-floor'},
 {name:'S5-reversed',stage:'olderLayerSuspected',docs:4,pairs:2,physical:'cv:trace:wall-stairs',reverse:true}
]){
 const result=await p.evaluate(spec=>{
 const d=app.stayState.data;d.discoveries={};d.journal=[];d.memories={lunBoat:{human:{visits:5,firstDay:4,lastDay:20}}};d.currentDay=30;
 d.boatDock='caerith';d.waterLevelState={day:30,phase:'veryLow',firstLowDay:4,firstRingDay:7};d.travelHistory=[{day:20,region:'lunmere',mode:'human',travelMode:'road'}];
 d.threads.bell={stage:'afterglow',anomalyDay:6,catFound:true};d.threads.ring={stage:'compared'};d.threads.caerVeyraRecords={stage:spec.stage??'unseen'};
 let keys=['region:lunmere','region:caerith','ring:visit','ring:direction','ring:groove'];if(spec.name!=='S0')keys.push('region:violet-mire','cv:arrival');
 if(spec.stage==='ordinary')keys.push('region:caer-canalWard');
 if(spec.stage==='missing')keys.push('cv:records-map','cv:archive-catalog');
 keys.push(...['commerce','building','canal','oldMap'].slice(0,spec.docs).map(id=>'cv:doc:'+id));
 keys.push(...['cv:compare:doc-building_doc-commerce','cv:compare:doc-canal_doc-oldMap'].slice(0,spec.pairs));
 if(spec.physical)keys.push(spec.physical);if(spec.reverse)keys.reverse();
 for(const key of keys)d.discoveries[key]={day:25,playerMode:'human',period:'day',label:''};
 app.stayState.changed();app.capitalLife.sync();app.stayState.flush();
 return {keys,stage:d.threads.caerVeyraRecords.stage,water:d.waterLevelState,history:d.travelHistory};
 },spec);
 await p.reload();await p.waitForSelector('#loading.hide',{state:'attached',timeout:90000});
 const restored=await p.evaluate(()=>{app.capitalLife.sync();app.stayState.changed();app.stayState.flush();return JSON.parse(localStorage.getItem('bellmire.stay.v1'));});
 for(const key of result.keys)assert.ok(restored.discoveries[key],spec.name+' '+key);
 assert.equal(restored.threads.caerVeyraRecords.stage,result.stage,spec.name);
 if(spec.stage)assert.equal(restored.threads.caerVeyraRecords.stage,spec.stage,spec.name);
 assert.equal(restored.currentDay,30);assert.equal(restored.boatDock,'caerith');assert.equal(restored.memories.lunBoat.human.visits,5);
 assert.equal(restored.threads.bell.stage,'afterglow');assert.equal(restored.threads.ring.stage,'compared');
 assert.deepEqual(restored.waterLevelState,result.water);assert.deepEqual(restored.travelHistory,[...result.history,{day:30,region:'bellmire',mode:'human',travelMode:'road'}]);
 assert.ok(!restored.discoveries['cv:elda-memory']);if(spec.physical!=='cv:research-cat:records-floor')assert.ok(!restored.discoveries['cv:research-cat:records-floor']);
 if(spec.stage==='olderLayerSuspected')assert.equal(restored.journal.find(j=>j.id==='cv:research-stage:olderLayerSuspected')?.text,'今の都市より古い構造があるのかもしれない。改修や再利用だけで説明できる部分もある。','new final Journal stays tentative');
 out.push({era:spec.name,stage:restored.threads.caerVeyraRecords.stage,roundTrip:true});
}
const legacyText='紙の記録だけでなく、今日使われている都市の石にも、古い層の痕跡が残っている。理由はまだ決められない。';await p.evaluate(text=>{const d=app.stayState.data;d.discoveries['cv:research-stage:olderLayerSuspected']={day:25};d.journal=d.journal.filter(j=>j.id!=='cv:research-stage:olderLayerSuspected');d.journal.push({id:'cv:research-stage:olderLayerSuspected',day:25,text,kind:'sign'});app.stayState.changed();app.stayState.flush();},legacyText);await p.reload();await p.waitForSelector('#loading.hide',{state:'attached',timeout:90000});assert.equal(await p.evaluate(()=>app.stayState.data.journal.find(j=>j.id==='cv:research-stage:olderLayerSuspected')?.text),legacyText,'existing final Journal unchanged');out.push({era:'old-final-journal',unchanged:true});
if(b.errors.length)throw Error(b.errors);fs.writeFileSync('/tmp/research-compat.json',JSON.stringify(out,null,2));console.log('PASS three legacy eras + nine round trips, optional Elda/cat, original fourteen portraits and startup travel append');}finally{await b.browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
