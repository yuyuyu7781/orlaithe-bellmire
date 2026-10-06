import {rememberedDialogue,rememberConversation} from './dialogue-memory.js';
import {createPortraitView} from './portrait-ui.js';
import {characters,selectDialogueTurn,selectPortrait} from './dialogue-data.js';

// Shares proximity/input and small card with inspection; content stays separate.
export function createDialogueSystem({THREE,inspections,walking,actors,getTime=()=> 'clear',getLocation=()=> 'town',stay=null,additionalCharacters=[]}){
  const characterList=[...characters,...additionalCharacters];
  const turns=new Map(),entries=[],unregister=[],conversationLog=[],listeners=new Set();
  for(const character of characterList){for(const profile of ['human','cat']){const key=profile==='human'?character.id:character.id+':cat';turns.set(key,stay?.data.memories[character.id]?.[profile]?.visits??0);}
    const object=actors[character.id];if(!object)throw Error('Missing dialogue actor: '+character.id);
    object.updateWorldMatrix(true,true);
    const b=new THREE.Box3().setFromObject(object,true),point=b.getCenter(new THREE.Vector3());
    point.y=b.min.y+(b.max.y-b.min.y)*.80;
    // Local coordinates track moving residents and corrected terrain contact.
    const localPoint=object.worldToLocal(point.clone()).toArray();
    const catPoint=point.clone();catPoint.y=b.min.y+Math.min(1.45,(b.max.y-b.min.y)*.80);
    const localPoints={cat:object.worldToLocal(catPoint).toArray()};
    const entry={id:'talk:'+character.id,kind:'talk',verb:'話す',object,localPoint,localPoints,
      label:character.name+'（'+character.role+'）',range:3.1,profiles:['human','cat'],contactPoint:[0,0,0],levelTolerance:.65,character};
    unregister.push(inspections.resolver.register(entry));entries.push(entry);
  }
  function speak(entry){
    const character=entry.character,profile=walking.state.profile.id,key=profile==='human'?character.id:character.id+':'+profile,index=turns.get(key)??0;
    const time=getTime(),location=getLocation(character.id),turn=selectDialogueTurn(character,{profile:walking.state.profile.id,time,index,location});const text=character.eventReply?.({profile,time,index,location})??character.calendarReply?.({profile,time,index,location})??rememberedDialogue(stay,character,{profile,index,time,location})??turn.text;
    const image=selectPortrait(character,{expression:turn.expression,time});
    const portrait=createPortraitView(character,{image,time,expression:turn.expression});
    portrait.element.dataset.conversationMode=profile;portrait.element.dataset.portraitVariant=turn.expression;portrait.element.dataset.dialogueVariant=profile+':'+location+':'+time;
    conversationLog.push({day:stay?.data.currentDay??1,speaker:character.name,speakerId:character.id,text,time,timestamp:new Date().toISOString(),playerMode:profile,location,portraitVariant:turn.expression,dialogueVariant:portrait.element.dataset.dialogueVariant});if(conversationLog.length>100)conversationLog.shift();
    inspections.present(entry,{label:portrait.profile.displayName,text,kind:'talk',extra:portrait.element});turns.set(key,index+1);rememberConversation(stay,character,profile);for(const fn of listeners)fn({character,text,profile,time,location});
  }
  inspections.handlers.set('talk',speak);
  return {characters:characterList,entries,turns,onSpeak(fn){listeners.add(fn);return()=>listeners.delete(fn);},get conversationLog(){return conversationLog.map(entry=>({...entry}));},clearConversationLog(){conversationLog.length=0;},destroy(){unregister.forEach(fn=>fn());inspections.handlers.delete('talk');if(inspections.opened?.kind==='talk')inspections.dismiss();}};
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
