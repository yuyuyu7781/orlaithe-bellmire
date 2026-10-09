const {boot}=require('./capital-browser.cjs');
const {plan,move}=require('./native-navigation.cjs');
const talk=require('./native-talk.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');

(async()=>{
 const b=await boot(),p=b.page,out={fixture:'Day30, existing ward unlocks and outdoor starting positions; RAF stopped/manual simulation. Not a fresh Day1 journey or real touch.',acquired:[],comparisons:[]};
 try {
  await p.evaluate(()=>{requestAnimationFrame=()=>0;while(app.townLife.state.dayIndex<30)app.townLife.dayAdvance();for(const k of ['region:violet-mire','cv:arrival','cv:market','region:caer-canalWard','cv:canal-level','region:caer-civicWard','cv:archive-catalog','region:caer-scholarHeights'])app.stayState.data.discoveries[k]={day:25,period:'day',playerMode:'human',label:''};app.stayState.changed();app.capitalLife.sync();app.setWeather('clear');app.townLife.setPeriod('day');});
  await p.locator('#walk').click();
  const found=key=>p.evaluate(k=>!!app.stayState.data.discoveries[k],key);
  async function dismiss(){if(await p.locator('#inspectionCard:not([hidden])').count())await p.locator('#inspectionCard button').click();await p.waitForSelector('#inspectionCard',{state:'hidden'});}
  async function act(id){console.log('native',id);await move(p,await talk.approach(p,id));await talk.face(p,id);await p.keyboard.press('e');}
  async function enter(id){await dismiss();await p.evaluate(id=>{const s=app.capital.shops.find(s=>s.id===id);app.walking.relocate(new app.THREE.Vector3(...s.exterior.approach));},id);await act('enter:'+id);assert.equal(await p.evaluate(()=>app.shopSystem.current?.shop.id),id);}
  async function exit(){const id=await p.evaluate(()=>app.shopSystem.current.shop.id);await dismiss();await act('exit:'+id);assert.equal(await p.evaluate(()=>app.shopSystem.current),null);}
  async function doc(room,id){const key='cv:doc:'+id;assert.equal(await found(key),false);await act('inside:'+room+':doc-'+id);await p.waitForSelector('.capital-research-overlay:not([hidden])');out.acquired.push({key,via:'native door, collision-aware W, selected E',text:await p.locator('.research-reading p').innerText()});assert.ok(await found(key));await p.locator('.research-close').click();}
  async function mode(id){if(await p.evaluate(()=>app.walking.state.profile.id)!==id){const button=p.locator(id==='cat'?'#catWalk':'#walk');if(!await button.isVisible())await p.locator('#toggle').click();await button.click();}assert.equal(await p.evaluate(()=>app.walking.state.profile.id),id);}
  async function forward(end,seconds){await p.evaluate(end=>{const w=app.walking;w.state.yaw=Math.atan2(w.state.feet.x-end[0],w.state.feet.z-end[2]);w.update(0);},end);await p.keyboard.down('w');try{return await p.evaluate(seconds=>{for(let i=0;i<seconds/.016;i++)app.walking.update(.016);return app.walking.state.feet.toArray();},seconds);}finally{await p.keyboard.up('w');}}
  await enter('cv-records');await doc('cv-records','building');await doc('cv-records','district');
  const route=await p.evaluate(()=>app.shopSystem.current.catRoutes.find(r=>r.id==='records-floor'));
  await move(p,(await plan(p,route.start)).path);
  const stopped=await forward(route.end,2);assert.ok(stopped[2]>route.end[2]+.5,'human must stop before low beam');
  assert.equal(await found('cv:research-cat:records-floor'),false);
  await mode('cat');await move(p,(await plan(p,route.start)).path);await move(p,[route.end]);
  await act('inside:cv-records:research-cat-records-floor');assert.ok(await found('cv:research-cat:records-floor'));out.acquired.push({key:'cv:research-cat:records-floor',via:'cat UI switch, W through low beam, E',humanStopped:stopped,catFeet:await p.evaluate(()=>app.walking.state.feet.toArray())});await dismiss();
  // The same nearby tabletop remains unread by a cat, even after an E operation.
  const passage=await p.evaluate(()=>{const e=app.inspections.resolver.entries.get('inside:cv-records:doc-passage');return app.inspections.resolver.position(e,undefined,'cat').toArray();});
  await move(p,(await plan(p,[passage[0],0,passage[2]+1])).path);
  await p.evaluate(point=>{const w=app.walking;w.state.yaw=Math.atan2(w.state.feet.x-point[0],w.state.feet.z-point[2]);w.update(0);app.inspections.update(.2);},passage);await p.keyboard.press('e');assert.equal(await found('cv:doc:passage'),false);await dismiss();await mode('human');await exit();
  await enter('cv-archive');await doc('cv-archive','commerce');await doc('cv-archive','canal');await exit();
  await enter('cv-maps');await doc('cv-maps','oldMap');const districtBefore=await p.evaluate(()=>app.capitalResearch.stats.read);await act('inside:cv-maps:doc-district');await p.waitForSelector('.capital-research-overlay:not([hidden])');assert.equal(await p.evaluate(()=>app.capitalResearch.stats.read),districtBefore);await p.locator('.research-close').click();await exit();
  assert.equal(await found('cv:trace:wall-stairs'),false);await p.evaluate(()=>{const e=app.inspections.resolver.entries.get('cv:trace:wall-stairs'),v=app.inspections.resolver.position(e);v.z+=4;v.y=app.capital.heightAt(v.x,v.z);app.walking.relocate(v);});await act('cv:trace:wall-stairs');assert.ok(await found('cv:trace:wall-stairs'));out.acquired.push({key:'cv:trace:wall-stairs',via:'outdoor starting fixture, collision-aware W, selected E',text:await p.locator('#inspectionCard p').innerText()});await dismiss();
  assert.equal(await found('cv:elda-memory'),false);
  const elder=await p.evaluate(()=>{for(let i=0;i<4000;i++){app.residentDay.update(.04);app.capitalLife.update(.04);}app.walking.refreshDynamic();const c=app.capitalLife.controllers.find(c=>c.record.id==='cvElda');if(!c.visible||c.inside)throw Error('Natural Elda unavailable');const q=c.feet.clone();q.z+=4;q.y=app.capital.heightAt(q.x,q.z);app.walking.relocate(q);return{feet:c.feet.toArray(),state:c.currentState,inside:c.inside};});
  await act('talk:cvElda');assert.equal(await p.evaluate(()=>app.dialogue.conversationLog.at(-1).speakerId),'cvElda');assert.ok(await found('cv:elda-memory'));out.acquired.push({key:'cv:elda-memory',via:'natural schedule, outdoor starting fixture, W and E',elder});await dismiss();
  const titles=await p.evaluate(()=>Object.fromEntries(app.capitalResearch.list().map(i=>[i.key,i.title])));
  assert.equal(titles['doc:palace'],undefined);assert.equal(titles['doc:passage'],undefined);
  await p.locator('#capital-research-button').click();
  const compare=p.getByRole('button',{name:'並べて記録する',exact:true});
  async function clear(){for(const b of await p.locator('.research-choices button[aria-pressed="true"]').all())await b.click();}
  await p.getByRole('button',{name:titles['doc:building'],exact:true}).click();assert.ok(await compare.isDisabled());
  for(const key of ['doc:commerce','doc:oldMap','trace:wall-stairs'])await p.getByRole('button',{name:titles[key],exact:true}).click();assert.equal(await p.locator('.research-comparison article').count(),3);await clear();
  const pairs=[['doc:building','trace:wall-stairs'],['doc:commerce','memory:elda'],['doc:oldMap','trace:wall-stairs'],['doc:building','cat:records-floor']],covered=new Set();
  for(const pair of pairs){await clear();for(const key of pair){await p.getByRole('button',{name:titles[key],exact:true}).click();covered.add(key);}assert.equal(await p.locator('.research-comparison article').count(),2);for(const key of pair)assert.ok((await p.locator('.research-comparison').innerText()).includes(titles[key]));if(pair.includes('doc:oldMap')){await p.getByRole('button',{name:'地図を重ねて見る',exact:true}).click();assert.equal(await p.locator('.research-map-overlay path').count(),3);}await compare.click();const key='cv:compare:'+pair.slice().sort().map(k=>k.replace(':','-')).join('_');assert.ok(await found(key));const journal=await p.evaluate(k=>app.stayState.data.journal.find(j=>j.id===k),key);assert.ok(journal.text.includes('合うところも、合わないところも'));out.comparisons.push({pair,key});}
  assert.deepEqual([...covered].sort(),['doc:building','doc:commerce','doc:oldMap','trace:wall-stairs','memory:elda','cat:records-floor'].sort());
  const count=await p.evaluate(()=>app.capitalResearch.stats.comparisons);await clear();for(const key of pairs[0].slice().reverse())await p.getByRole('button',{name:titles[key],exact:true}).click();await compare.click();assert.equal(await p.evaluate(()=>app.capitalResearch.stats.comparisons),count);await p.locator('.research-close').click();
  assert.equal(await p.evaluate(()=>app.capitalResearch.stats.stage),'olderLayerSuspected');
  out.stage=await p.evaluate(()=>app.capitalResearch.stats.stage);out.negativeCases=['unread hidden','single disabled','maximum three','reverse comparison deduplicated','same document at two sites','human beam blocked','cat tabletop unread'];
  const data=await import('../capital-research-data.js');out.placement={logicalDocuments:data.researchDocuments.length,placements:data.researchDocuments.reduce((n,d)=>n+d.rooms.length,0),facilities:[...new Set(data.researchDocuments.flatMap(d=>d.rooms))],coverage:'Existing baseline inspects 15 of 17 document placements; generic passage/guild placements are data-only checks.'};assert.equal(out.placement.logicalDocuments,11);assert.equal(out.placement.placements,17);assert.equal(out.placement.facilities.length,9);
  for(const id of ['passage','family','repair'])assert.ok(data.researchDocuments.find(d=>d.id===id).text.length>20);
  await p.evaluate(()=>app.stayState.flush());assert.deepEqual(b.errors,[]);fs.writeFileSync('/tmp/capital-phase2-acceptance.json',JSON.stringify(out,null,2));console.log('PASS six actual evidence acquisitions and four UI comparisons, natural Elda, native doors and cat passage');
 } catch(e){console.error('STATE',await p.evaluate(()=>({feet:app.walking.state.feet.toArray(),profile:app.walking.state.profile.id,selected:app.inspections.selected?.id,opened:app.inspections.opened?.id,inputBlocked:app.walking.state.inputBlocked,room:app.shopSystem.current?.shop.id,research:app.capitalResearch.active})).catch(()=>null));throw e;} finally {await b.browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
