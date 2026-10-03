import {characters,selectDialogue} from './dialogue-data.js';

// Shares proximity/input and small card with inspection; content stays separate.
export function createDialogueSystem({THREE,inspections,walking,actors,getTime=()=> 'clear'}){
  const turns=new Map(),entries=[],unregister=[];
  for(const character of characters){
    const object=actors[character.id];if(!object)throw Error('Missing dialogue actor: '+character.id);
    object.updateWorldMatrix(true,true);
    const b=new THREE.Box3().setFromObject(object,true),point=b.getCenter(new THREE.Vector3());
    point.y=b.min.y+(b.max.y-b.min.y)*.80;
    // Local coordinates track moving residents and corrected terrain contact.
    const localPoint=object.worldToLocal(point).toArray();
    const entry={id:'talk:'+character.id,kind:'talk',verb:'話す',object,localPoint,
      label:character.name+'（'+character.role+'）',range:3.1,profiles:['human'],character};
    unregister.push(inspections.resolver.register(entry));entries.push(entry);
  }
  function speak(entry){
    const character=entry.character,index=turns.get(character.id)??0;
    const text=selectDialogue(character,{profile:walking.state.profile.id,time:getTime(),index});
    const portrait=document.createElement('div');portrait.className='dialogue-portrait';
    if(character.portrait?.src){const img=document.createElement('img');img.alt=character.portrait.alt??character.name;img.src=character.portrait.src;img.onerror=()=>{img.remove();placeholder();};portrait.append(img);}
    else placeholder();
    function placeholder(){const span=document.createElement('span');span.className='portrait-silhouette';span.setAttribute('aria-hidden','true');portrait.append(span);portrait.setAttribute('aria-label',character.name+'の肖像（未設定）');}
    inspections.present(entry,{label:entry.label,text,kind:'talk',extra:portrait});turns.set(character.id,index+1);
  }
  inspections.handlers.set('talk',speak);
  return {characters,entries,turns,destroy(){unregister.forEach(fn=>fn());inspections.handlers.delete('talk');if(inspections.opened?.kind==='talk')inspections.dismiss();}};
}

// A modest traveller's cape and wooden strings; no new resident/height change.
export function addBardDetails({THREE,bard}){
  const g=new THREE.Group();g.name='Green bard cape and travelling strings';bard.add(g);
  const wood=new THREE.MeshStandardMaterial({color:0x76533a,roughness:.96}),iron=new THREE.MeshStandardMaterial({color:0x35392e,roughness:.8}),green=new THREE.MeshStandardMaterial({color:0x345747,roughness:1});
  function mesh(geometry,material,x,y,z){const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);g.add(o);o.castShadow=true;return o;}
  mesh(new THREE.BoxGeometry(.68,.92,.06),green,0,1.18,-.32);
  const body=mesh(new THREE.SphereGeometry(.25,7,5),wood,.08,1.06,.34);body.scale.set(.75,1,.3);
  mesh(new THREE.BoxGeometry(.085,.52,.055),wood,.08,1.48,.34);
  for(const dx of [-.025,0,.025])mesh(new THREE.BoxGeometry(.005,.66,.009),iron,.08+dx,1.24,.423);
  mesh(new THREE.CylinderGeometry(.035,.035,.012,8),iron,.08,1.12,.423).rotation.x=Math.PI/2;
  g.traverse(o=>{if(o.isMesh)o.userData.walkSoft=true;});
}
