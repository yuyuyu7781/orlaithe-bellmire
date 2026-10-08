const {boot}=require('./capital-browser.cjs');
(async()=>{const b=await boot();try{const result=await b.page.evaluate(()=>{
 requestAnimationFrame=()=>0;const a=app,d=a.stayState.data;a.setWeather('clear');a.townLife.setPeriod('day');d.currentDay=30;for(const k of ['region:violet-mire','cv:arrival','cv:market','region:caer-canalWard','cv:canal-level','region:caer-civicWard','cv:archive-catalog','region:caer-scholarHeights','cv:old-map'])d.discoveries[k]={day:25};a.stayState.changed();a.capitalLife.sync();a.walking.enter('human');a.townLife.setPeriod('day');
 const cs=a.capitalLife.controllers,lower=cs.filter(e=>e.community.regionId==='caer-lowerWard'&&!e.record.id);
 if(lower.some(e=>!e.initialized))throw Error('Unsettled first appearance');
 const stationary=lower.filter(e=>e.cursor>=e.route.length).length;if(stationary<lower.length/2)throw Error('Synchronized initial commute');
 a.townLife.setPeriod('evening');const goals=lower.map(e=>a.residentDay.nodes[e.route.at(-1)??e.node].point.toArray().join(','));if(new Set(goals).size<lower.length*.8)throw Error('Shared evening destination');
 const departing=lower.filter(e=>e.cursor<e.route.length);const waits=new Set(departing.map(e=>e.wait));if(waits.size<departing.length*.8)throw Error('Synchronized departures');
 a.townLife.setPeriod('day');const mira=cs.find(e=>e.record.id==='cvMira');mira.inside='cv-inn';mira.visible=false;mira.destination='cv-inn';a.residentDay.refreshSchedules(e=>e===mira);a.shopSystem.update(.016);
 if(mira.visible||mira.record.object.visible)throw Error('Indoor Mira leaked outdoors after schedule refresh');
 const entry=a.dialogue.entries.find(e=>e.character.id==='cvMira');if(entry.enabled())throw Error('Indoor Mira enabled outdoors');if(entry.character.role!=='宿屋兼食堂の主人')throw Error('Wrong Mira role');
 a.shopSystem.enter(a.capital.shops.find(s=>s.id==='cv-inn'));a.shopSystem.update(.016);if(!entry.enabled()||!mira.record.object.visible)throw Error('Mira unavailable in inn');a.shopSystem.exit();a.shopSystem.update(.016);if(mira.record.object.visible)throw Error('Mira visible at inn front');
 return{lowerResidents:lower.length,initialStationary:stationary,eveningDestinations:new Set(goals).size,departureOffsets:waits.size,miraRole:entry.character.role};
 });if(b.errors.length)throw Error(b.errors.join('\n'));console.log('PASS',JSON.stringify(result));}finally{await b.browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
