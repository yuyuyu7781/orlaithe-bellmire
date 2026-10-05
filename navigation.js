import {createDestinations,destinationReading} from './navigation-data.js';

// Directional assistance, not autopilot or a promise of a straight walk.
// Both player profiles retain their own collision world and choice of route.
export function createNavigation({walking,shopSystem,stay=null,panel=document.getElementById('panel')}){
 const destinations=createDestinations(shopSystem.entrances);
 for(const d of destinations){const [x,y,z]=d.position,ground=walking.canStandAs('human',x,z,y);if(ground!==null)d.position[1]=ground;}
 const state={selected:null,mapOpen:false};
 const tools=document.createElement('div');tools.className='travel-tools';
 const toggle=document.createElement('button');toggle.textContent='行先';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','destinationChoices');
 const choices=document.createElement('label');choices.id='destinationChoices';choices.hidden=true;choices.setAttribute('aria-label','行先を選ぶ');
 const select=document.createElement('select');select.id='destinationSelect';select.setAttribute('aria-label','徒歩の行先');
 select.add(new Option('案内なし',''));for(const d of destinations)select.add(new Option(d.name,d.id));choices.append(select);
 const stop=document.createElement('button');stop.textContent='案内終了';stop.hidden=true;
 const guide=document.createElement('div');guide.className='destination-guide';guide.hidden=true;
 const arrow=document.createElement('span');arrow.className='destination-arrow';arrow.textContent='↑';arrow.setAttribute('aria-hidden','true');
 const distance=document.createElement('span');guide.append(arrow,distance);
 const notice=document.createElement('div');notice.className='travel-notice';notice.setAttribute('role','status');notice.setAttribute('aria-live','polite');notice.hidden=true;
 tools.append(toggle,choices,stop);panel.append(tools,guide,notice);
 let elapsed=0,noticeUntil=0;
 function choose(id){state.selected=destinations.find(d=>d.id===id)??null;select.value=state.selected?.id??'';stop.hidden=!state.selected;notice.hidden=true;update(1);}
 toggle.onclick=()=>{choices.hidden=!choices.hidden;toggle.setAttribute('aria-expanded',String(!choices.hidden));};select.onchange=()=>{choose(select.value);choices.hidden=true;toggle.setAttribute('aria-expanded','false');};stop.onclick=()=>choose('');
 function update(dt){elapsed+=dt;if(elapsed<.2)return;elapsed=0;const target=state.selected,room=shopSystem.current;
  guide.hidden=!target||!walking.active||!!room;
  if(!notice.hidden&&performance.now()>noticeUntil)notice.hidden=true;
  if(stay&&walking.active&&!room&&walking.state.feet.x<-53&&!stay.data.discoveries['outskirts-visit']){stay.data.discoveries['outskirts-visit']={day:stay.data.currentDay,playerMode:walking.state.profile.id,period:stay.data.dayPhase,label:'町の外へ'};stay.changed();}
  if(!target||!walking.active)return;
  const reading=destinationReading(walking.state.feet,walking.state.yaw,target);
  if((room&&room.shop.id===target.shopId)||(!room&&reading.arrived)){
   state.selected=null;select.value='';stop.hidden=true;guide.hidden=true;notice.textContent=target.name+'に着いた';notice.hidden=false;noticeUntil=performance.now()+5000;return;
  }
  if(room)return;
  arrow.style.transform='rotate('+reading.bearing+'rad)';distance.textContent=target.name+' · '+Math.round(reading.distance)+'m（直線）';guide.setAttribute('aria-label',target.name+'の方角の目安。道沿いに進んでください。');
 }
 return {destinations,state,tools,guide,notice,choose,update,destroy(){tools.remove();guide.remove();notice.remove();}};
}
