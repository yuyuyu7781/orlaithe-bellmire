export function createRestSystem({THREE,walking,inspections,shopSystem,townLife,stay}){
 const day=document.createElement('span');day.className='stay-day';day.id='stayDay';document.querySelector('#timePeriod').closest('label').before(day);
 const dialog=document.createElement('dialog');dialog.className='stay-dialog';dialog.setAttribute('aria-labelledby','restTitle');
 const title=document.createElement('h2');title.id='restTitle';title.textContent='ひと晩、休む';const text=document.createElement('p');text.textContent='ここで休んで、翌朝を迎えますか。';
 const confirm=document.createElement('button');confirm.id='confirmRest';confirm.textContent='翌朝まで休む';const cancel=document.createElement('button');cancel.textContent='まだ起きている';dialog.append(title,text,confirm,cancel);
 const shade=document.createElement('div');shade.className='rest-shade';shade.hidden=true;shade.setAttribute('aria-hidden','true');document.body.append(dialog,shade);
 let target=null,busy=false;const targets=[];
 function close(){dialog.close();if(!busy)walking.setInputBlocked('rest',false);}
 cancel.onclick=close;dialog.addEventListener('cancel',()=>{walking.setInputBlocked('rest',false);});dialog.addEventListener('close',()=>{if(!busy)walking.setInputBlocked('rest',false);});
 shopSystem.onRoom(room=>{for(const bed of room.beds??[]){const entry={id:'rest:inn:'+bed.room,kind:'rest',verb:'休む',label:bed.label??'宿屋の寝床',object:bed.object,localPoint:bed.localPoint,range:1.85,profiles:['human'],contactPoint:[0,0,0],levelTolerance:.65,enabled:()=>shopSystem.current===room&&!busy,bed};targets.push(entry);inspections.resolver.register(entry);}});
 inspections.handlers.set('rest',entry=>{if(busy)return;target=entry;const shelter=shopSystem.current?.shop.restType==='shelter';title.textContent=shelter?'簡易寝床で夜を越す':'ひと晩、泊まる';text.textContent=shelter?'簡素な寝床で体を休め、翌朝を待ちますか。':'ここで休んで、翌朝を迎えますか。';inspections.dismiss();walking.setInputBlocked('rest',true);document.exitPointerLock?.();dialog.showModal();confirm.focus();});
 async function rest(){if(busy||!target||walking.state.profile.id!=='human'||!shopSystem.current?.beds.includes(target.bed)||!(shopSystem.current?.shop.id==='inn'||shopSystem.current?.shop.restable))return false;busy=true;const lodging=shopSystem.current.shop;inspections.dismiss();walking.setInputBlocked('rest',true);shade.hidden=false;close();
  try{await new Promise(resolve=>setTimeout(resolve,160));townLife.dayAdvance();
   const candidates=[target.bed.wake,[198.6,3.2,-2],[198.6,3.2,2],walking.state.feet.toArray()];
   for(const p of candidates){const y=walking.canStandAs('human',p[0],p[2],p[1]);if(y!==null){walking.relocate(new THREE.Vector3(p[0],y,p[2]),{yaw:-Math.PI/2,pitch:-.1});break;}}
   stay.data.discoveries['lodging:'+lodging.id]={day:townLife.state.dayIndex,label:lodging.name,period:townLife.state.period,playerMode:'human'};stay.note('morning:'+townLife.state.dayIndex,lodging.restType==='shelter'?'作業小屋の簡易寝床で、次の朝を待った。':lodging.restType==='residency'?'共同下宿の机に、朝食の器と次の朝の光があった。':'宿屋の窓に、次の朝の光が入った。',{kind:'stay'});stay.flush();await new Promise(resolve=>setTimeout(resolve,160));return true;
  }finally{shade.hidden=true;busy=false;walking.setInputBlocked('rest',false);}}
 confirm.onclick=rest;
 townLife.onChange(state=>{day.textContent='Day '+state.dayIndex;document.getElementById('timePeriod').value=state.period;});day.textContent='Day '+townLife.state.dayIndex;
 const persist=()=>stay.flush();addEventListener('pagehide',persist);document.addEventListener('visibilitychange',()=>{if(document.hidden)persist();});
 return {targets,dialog,rest,get busy(){return busy},reset(){stay.reset();location.reload();}};
}
