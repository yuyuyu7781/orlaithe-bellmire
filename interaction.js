// Resolution is independent of inspection text/UI. Future dialogue can register
// a separate kind and handler without adding residents to the inspect registry.
export function createInteractionResolver({THREE,camera,scene,targets=[],ignored=[]}){
  const entries=new Map(),ray=new THREE.Raycaster(),point=new THREE.Vector3(),direction=new THREE.Vector3();
  const belongs=(o,roots)=>{for(let p=o;p;p=p.parent)if(roots.includes(p))return true;return false;};
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const blockers=[];
  function refreshOccluders(){blockers.length=0;scene.traverse(o=>{if(o.isMesh&&!o.userData.walkSoft&&!belongs(o,ignored)&&!o.material.transparent)blockers.push(o);});}
  refreshOccluders();
  function register(entry){if(!entry.id||!entry.object?.isObject3D)throw Error('Interaction requires an id and scene object');if(entries.has(entry.id))throw Error('Duplicate interaction id: '+entry.id);entries.set(entry.id,{kind:'inspect',range:3.6,profiles:['human'],...entry});return()=>entries.delete(entry.id);}
  targets.forEach(register);
  function position(entry,out=new THREE.Vector3(),profile='human'){entry.object.updateWorldMatrix(true,false);return entry.object.localToWorld(out.fromArray(entry.localPoints?.[profile]??entry.localPoint??[0,0,0]));}
  function resolve(actor){camera.getWorldDirection(direction);const options=[];
    for(const entry of entries.values()){
      if((entry.enabled&&!entry.enabled(actor))||!visible(entry.object)||!entry.profiles.includes(actor.profile))continue;
      position(entry,point,actor.profile);if(entry.contactPoint){const contact=entry.object.localToWorld(new THREE.Vector3().fromArray(entry.contactPoint));if(Math.abs(contact.y-actor.feet.y)>(entry.levelTolerance??.65))continue;}const delta=point.clone().sub(camera.position),distance=delta.length(),horizontal=Math.hypot(point.x-actor.feet.x,point.z-actor.feet.z);
      if(horizontal>entry.range||Math.abs(delta.y)>5.2||distance<.01)continue;
      const facing=direction.dot(delta.clone().normalize());if(facing<.20)continue;
      options.push({entry,point:point.clone(),distance,score:horizontal+(1-facing)*1.5+(entry.priority??0)});
    }
    options.sort((a,b)=>a.score-b.score);
    for(const candidate of options){ray.set(camera.position,candidate.point.clone().sub(camera.position).normalize());ray.far=candidate.distance-.06;
      if(!ray.intersectObjects(blockers,false).some(hit=>visible(hit.object)&&!belongs(hit.object,[candidate.entry.object])))return candidate.entry;
    }
    return null;
  }
  return {entries,register,position,resolve,refreshOccluders,isVisible:visible};
}

export function createInspectionSystem({THREE,scene,camera,walking,targets,ignored=[]}){
  const resolver=createInteractionResolver({THREE,scene,camera,targets,ignored}),handlers=new Map();
  const prompt=document.createElement('button'),card=document.createElement('aside'),title=document.createElement('strong'),text=document.createElement('p'),close=document.createElement('button');
  prompt.id='inspectPrompt';prompt.className='inspect-prompt';prompt.hidden=true;prompt.setAttribute('aria-keyshortcuts','E');prompt.setAttribute('aria-controls','inspectionCard');
  card.id='inspectionCard';card.className='inspection-card';card.hidden=true;card.setAttribute('role','status');card.setAttribute('aria-live','polite');close.textContent='閉じる';close.setAttribute('aria-label','説明を閉じる');card.append(title,text,close);document.body.append(prompt,card);
  const content=document.createElement('div');card.insertBefore(content,text);
  let selected=null,opened=null,openedProfile=null,elapsed=0,closeTimer=null;
  function dismiss(){const animate=opened?.kind==='talk'&&!matchMedia('(prefers-reduced-motion:reduce)').matches;
    opened=null;openedProfile=null;
    if(closeTimer!==null)return;
    const finish=()=>{card.hidden=true;card.classList.remove('conversation-closing');card.inert=false;content.replaceChildren();closeTimer=null;};
    if(animate){card.classList.add('conversation-closing');card.inert=true;closeTimer=setTimeout(finish,110);}else finish();}
  function present(entry,{label=entry.label,text:message=entry.text,kind=entry.kind,extra=null}={}){
    clearTimeout(closeTimer);closeTimer=null;card.classList.remove('conversation-closing');card.inert=false;card.dataset.period=extra?.dataset.period??'day';card.dataset.conversationMode=extra?.dataset.conversationMode??'';close.setAttribute('aria-label',kind==='talk'?'会話を閉じる':'説明を閉じる');title.textContent=label;text.textContent=message;content.replaceChildren(...(extra?[extra]:[]));card.classList.toggle('dialogue-card',kind==='talk');opened=entry;openedProfile=walking.state.profile.id;card.hidden=false;
  }
  handlers.set('inspect',entry=>present(entry,{text:entry.textByProfile?.[walking.state.profile.id]??entry.text}));
  function activate(){update(.2);if(!selected||!walking.active)return false;const handle=handlers.get(selected.kind);if(!handle)return false;handle(selected);return true;}
  function update(dt){
    if(!walking.active){selected=null;prompt.hidden=true;dismiss();elapsed=0;return;}
    if(opened&&(openedProfile!==walking.state.profile.id||!resolver.isVisible(opened.object)||(opened.enabled&&!opened.enabled({feet:walking.state.feet,profile:walking.state.profile.id}))))dismiss();
    if(opened){const p=resolver.position(opened,undefined,walking.state.profile.id);if(Math.hypot(p.x-walking.state.feet.x,p.z-walking.state.feet.z)>opened.range+.8)dismiss();}
    elapsed+=dt;if(elapsed<.12)return;elapsed=0;
    selected=resolver.resolve({feet:walking.state.feet,profile:walking.state.profile.id??'human'});prompt.hidden=!selected;
    if(selected)prompt.textContent=(matchMedia('(pointer:coarse)').matches?(selected.verb??'調べる'):'E · '+(selected.verb??'調べる'))+' — '+selected.label;
  }
  function key(e){if(!walking.active||e.repeat||e.ctrlKey||e.metaKey||e.altKey||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)||e.target.isContentEditable)return;
    if(e.code==='KeyE'){if(activate())e.preventDefault();}else if(e.code==='Escape')dismiss();
  }
  const click=e=>{e.stopPropagation();activate();};prompt.addEventListener('click',click);close.addEventListener('click',dismiss);document.addEventListener('keydown',key);
  function destroy(){clearTimeout(closeTimer);document.removeEventListener('keydown',key);prompt.remove();card.remove();}
  return {resolver,handlers,present,activate,update,dismiss,destroy,get selected(){return selected},get opened(){return opened}};
}
