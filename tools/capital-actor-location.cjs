// Regression: opening a room must not summon its owner out of the street.
const {boot}=require('./capital-browser.cjs'),fs=require('fs');
(async()=>{const b=await boot(),p=b.page;try{const result=await p.evaluate(()=>{
 requestAnimationFrame=()=>0;const a=app,d=a.stayState.data;d.currentDay=30;for(const k of ['region:violet-mire','cv:arrival','cv:market','region:caer-canalWard','cv:canal-level','region:caer-civicWard','cv:archive-catalog','region:caer-scholarHeights','cv:old-map'])d.discoveries[k]={day:25};a.stayState.changed();a.capitalLife.sync();a.walking.enter('human');
 const registered=a.dialogue.entries.map(e=>({id:e.character.id,uuid:e.object.uuid}));if(new Set(registered.map(e=>e.id)).size!==registered.length||new Set(registered.map(e=>e.uuid)).size!==registered.length)throw Error('Duplicate named actor registration');
 const rows=[];
 for(const c of a.capitalLife.controllers.filter(e=>e.record.id)){
  const id=c.record.id,actor=c.record.object,entry=a.dialogue.entries.find(e=>e.character.id===id),shop=a.capital.shops.find(s=>s.characterId===id);if(!shop||entry.object!==actor)throw Error('Identity mismatch '+id);
  c.inside=null;c.visible=true;c.renderHidden=false;c.currentState='walking';const feet=c.feet.toArray();a.shopSystem.enter(shop);a.shopSystem.update(.016);
  const outsideNotSummoned=!actor.visible&&!entry.enabled()&&c.feet.toArray().every((v,i)=>v===feet[i]);if(!outsideNotSummoned)throw Error('Room summoned outdoor actor '+id);a.shopSystem.exit();
  c.inside=shop.id;c.visible=false;c.currentState='inside';a.shopSystem.enter(shop);a.shopSystem.update(.016);const legitimateIndoor=actor.visible&&actor.parent===a.shopSystem.current.root&&entry.enabled();if(!legitimateIndoor)throw Error('Missing scheduled indoor actor '+id);
  let instances=0;a.scene.traverse(o=>{if(o===actor)instances++});if(instances!==1)throw Error('Duplicate scene actor '+id);a.shopSystem.exit();a.shopSystem.update(.016);if(actor.visible)throw Error('Indoor actor also visible outside '+id);
  rows.push({id,outsideNotSummoned,legitimateIndoor,instances});
 }
 return{registered,rows};
});if(result.rows.length!==14||b.errors.length)throw Error(JSON.stringify(b.errors));fs.writeFileSync('/tmp/capital-actor-location.json',JSON.stringify(result,null,2));console.log('PASS 24 unique named actors; all 14 capital owners stay at scheduled location across room entry/exit');}finally{await b.browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
