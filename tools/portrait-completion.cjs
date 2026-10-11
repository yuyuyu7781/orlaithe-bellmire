const assert=require('node:assert/strict'),{boot}=require('./capital-browser.cjs');
(async()=>{const b=await boot({viewport:{width:390,height:844}}),p=b.page;try{
 await p.evaluate(()=>{requestAnimationFrame=()=>0;app.walking.enter('human');});
 const ids=await p.evaluate(()=>app.dialogue.characters.map(c=>c.id));
 for(const viewport of [{width:320,height:740},{width:375,height:812},{width:390,height:844},{width:430,height:932},{width:844,height:390}]){await p.setViewportSize(viewport);for(const mode of ['human','cat'])for(const period of ['day','night'])for(const id of ids){await p.evaluate(({id,mode,period})=>{app.inspections.dismiss();app.walking.enter(mode);app.townLife.setPeriod(period);app.inspections.handlers.get('talk')(app.dialogue.entries.find(e=>e.character.id===id));},{id,mode,period});await p.waitForFunction(()=>document.querySelector('.dialogue-portrait')?.dataset.state==='image');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,id+' overflow');}}
 await p.evaluate(()=>{const c=app.dialogue.characters.find(c=>c.id==='mireGatherer');c.portraitDefault={src:'data:image/png;base64,AA=='};app.inspections.handlers.get('talk')(app.dialogue.entries.find(e=>e.character.id===c.id));});await p.waitForFunction(()=>document.querySelector('.dialogue-portrait')?.dataset.state==='fallback');assert.ok(await p.locator('#inspectionCard p').textContent());
 console.log('PASS 27 characters × 5 viewports × human/cat × day/night; broken-image fallback');
 }finally{await b.browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
