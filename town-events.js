import {townEventDefinitions,rumorPools} from './shop-data.js';
// Extends the shared resolver/card. No extra quest HUD or polling loop.
export function createTownEvents({THREE,scene,culture,inspectTargets,inspections,walking,townLife,shopSystem,dialogue}){
 const entries=[],discoveries=new Map(),props=[];
 for(const event of townEventDefinitions){if(!event.enabled)continue;
  const original=inspectTargets.find(q=>q.id===event.source),object=original?.object??culture.goods.find(o=>o.name===event.source);
  if(!object)throw Error('Missing town event source '+event.source);
  object.updateWorldMatrix(true,true);const b=new THREE.Box3().setFromObject(object,true),center=b.getCenter(new THREE.Vector3());center.y=b.min.y+.3;
  // Tiny tangible clues attach to the already-grounded goods/water system.
  // Their silhouettes stay below the walker's step allowance; no new blockers.
  if(['cat-bread','cat-ribbon','ninth-bell','upstream-stone'].includes(event.id)){
   const clue=event.id==='upstream-stone'?new THREE.Mesh(new THREE.IcosahedronGeometry(.085,0),culture.tools.materials.stone):event.id==='ninth-bell'?new THREE.Mesh(new THREE.CylinderGeometry(.055,.040,.10,6),culture.tools.materials.wood):new THREE.Mesh(new THREE.BoxGeometry(event.id==='cat-bread'?.085:.19,.018,.025),culture.tools.materials.linen);
   const at=event.id==='upstream-stone'?new THREE.Vector3(21.35,6.275,21):event.id==='ninth-bell'?new THREE.Vector3(center.x,b.max.y+.05,center.z):new THREE.Vector3(b.max.x+.055,b.min.y+.012,center.z-.12);
   clue.name=event.label;clue.position.copy(object.worldToLocal(at));clue.userData.walkSoft=true;object.add(clue);props.push(clue);
  }
  const entry={id:'event:'+event.id,kind:'town-event',verb:'調べる',label:event.label,object,localPoint:original?.localPoint??object.worldToLocal(center).toArray(),profiles:event.profiles??['human','cat'],range:3.2,priority:.25,event,
   enabled:()=>!shopSystem.current&&(!event.periods||event.periods.includes(townLife.state.period))};
  inspections.resolver.register(entry);entries.push(entry);
 }
 inspections.handlers.set('town-event',entry=>{const playerMode=walking.state.profile.id,event=entry.event;
  discoveries.set(event.id,{id:event.id,playerMode,period:townLife.state.period,location:event.area});
  inspections.present(entry,{text:playerMode==='cat'&&event.kind!=='cat-discovery'?'木と紙に、何人もの手の匂いが重なっている。隙間には、風が少し残る。':event.text});
 });
 function apply(){for(const character of dialogue.characters){const additions=entries.filter(e=>e.event.rumorIds?.includes(character.id)&&(!e.event.periods||e.event.periods.includes(townLife.state.period))).map(e=>e.event.rumor);character.rumorPool=[...(rumorPools[character.id]??[]),...additions];}}
 townLife.onChange(apply);apply();
 return {entries,discoveries,get stats(){return {observations:entries.length,catOnly:entries.filter(e=>e.profiles.length===1&&e.profiles[0]==='cat').length,discovered:discoveries.size,addedLights:0,addedMeshes:props.length};}};
}
