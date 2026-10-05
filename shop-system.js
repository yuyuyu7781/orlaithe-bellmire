import {shops,isShopOpen,shopStatus,dailyLocations,rumorPools,townEventDefinitions,soundAnchors} from './shop-data.js';
import {buildInterior} from './interiors.js';

export function createShopSystem({THREE,scene,walking,grounding,miniature,inspections,dialogue,townLife,onExit=()=>{}}){
 const roomListeners=new Set(),rooms=new Map(),entrances=[],actors=new Map(dialogue.entries.map(e=>[e.character.id,e.object]));
 const originals=new Map([...actors].map(([id,o])=>[id,{parent:o.parent,position:o.position.clone(),rotation:o.rotation.clone(),visible:o.visible}]));
 const townRoots=[...scene.children],savedVisibility=new Map(),outdoorPoints=[];scene.traverse(o=>{if(o.isPointLight)outdoorPoints.push(o);});let workTime=0;const workerStates=new Map();let travel=null;let current=null,returnPoint=null,returnYaw=0,savedBackground=null,savedFog=null;
 const label=document.createElement('div');label.className='room-label';label.hidden=true;document.body.append(label);
 const wood=new THREE.MeshStandardMaterial({color:0x775b42,roughness:1}),iron=new THREE.MeshStandardMaterial({color:0x42463d,roughness:1});
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
 function safeNear(p,profile='human',max=4){const candidates=[p.clone()];for(let r=.25;r<=max;r+=.25)for(let i=0;i<16;i++)candidates.push(p.clone().add(new THREE.Vector3(Math.sin(i*Math.PI/8)*r,0,Math.cos(i*Math.PI/8)*r)));
  for(const q of candidates){const y=grounding.heightAt(q.x,q.z);if(y!==null&&walking.canStandAs(profile,q.x,q.z,y)!==null){q.y=y;return q;}}return null;}
 // Match an existing major shell, then use a reachable face, not an arbitrary
 // invisible trigger in the street. New door leaves sit against the visible wall.
 for(const shop of shops){
  const shell=[...miniature.shells].sort((a,b)=>distance(a.b.getCenter(new THREE.Vector3()),new THREE.Vector3(shop.center[0],0,shop.center[1]))-distance(b.b.getCenter(new THREE.Vector3()),new THREE.Vector3(shop.center[0],0,shop.center[1])))[0];
  const b=shell.b,c=b.getCenter(new THREE.Vector3());let chosen=null;
  const blockers=[];scene.traverse(o=>{if(!o.isMesh||o.userData.walkSoft||o.material.transparent)return;for(let p=o;p;p=p.parent)if(!p.visible||[...actors.values()].includes(p))return;blockers.push(o);});
  for(const angle of [0,Math.PI/2,-Math.PI/2,Math.PI]){const n=new THREE.Vector3(Math.sin(angle),0,Math.cos(angle)),tangent=new THREE.Vector3(n.z,0,-n.x),p=new THREE.Vector3(n.x>0?b.max.x:n.x<0?b.min.x:c.x,0,n.z>0?b.max.z:n.z<0?b.min.z:c.z);
   for(const offset of [0,-.8,.8,-1.4,1.4]){const at=p.clone().addScaledVector(tangent,offset).addScaledVector(n,.035),approach=at.clone().addScaledVector(n,1),y=grounding.heightAt(approach.x,approach.z);
    if(y===null||y<b.min.y-.1||y+2>b.max.y||walking.canStandAs('human',approach.x,approach.z,y)===null)continue;
    at.y=approach.y=y;
    // A clear-looking pocket behind a raised porch is not a usable doorway.
    let outwardY=y,accessible=true;for(let r=.12;r<=1.56;r+=.12){const q=approach.clone().addScaledVector(n,r),next=walking.canStandAs('human',q.x,q.z,outwardY);if(next===null){accessible=false;break;}outwardY=next;}if(!accessible)continue;
    const test=new THREE.Box3().setFromCenterAndSize(at.clone().add(new THREE.Vector3(0,1,0)),new THREE.Vector3(n.x?.12:1.1,2,n.x?1.1:.12));
    if(miniature.faces.some(f=>f.wall===shell.object&&test.intersectsBox(new THREE.Box3().setFromObject(f.window,true))))continue;
    const target=at.clone().addScaledVector(n,.13).add(new THREE.Vector3(0,1.05,0)),eye=approach.clone().add(new THREE.Vector3(0,1.65,0));
    const ray=new THREE.Raycaster(eye,target.clone().sub(eye).normalize(),0,eye.distanceTo(target)-.06);if(ray.intersectObjects(blockers,false).length)continue;
    chosen={at,approach,angle,n};break;
   }if(chosen)break;
  }if(!chosen)throw Error('No reachable shop entrance: '+shop.id);
  const g=new THREE.Group();g.name=shop.name+' 入口';g.position.copy(chosen.at);g.rotation.y=chosen.angle;scene.add(g);townRoots.push(g);
  const piece=(x,y,z,w,h,d,material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y+h/2,z);g.add(m);m.userData.walkSoft=true;return m;};
  const leaf=piece(0,0,0,.88,1.95,.075,wood);for(const x of [-.49,.49])piece(x,0,.02,.08,2.05,.10,wood);piece(0,1.96,.02,1.06,.10,.14,wood);piece(.30,.93,.07,.07,.06,.04,iron);
  const latch=piece(0,.86,.075,.65,.08,.03,iron);
  const entry={id:'enter:'+shop.id,kind:'enter',verb:'入る',label:shop.name,object:g,localPoint:[0,1.05,.13],localPoints:{cat:[0,.38,.13]},contactPoint:[0,0,0],levelTolerance:.65,range:2.15,profiles:['human','cat'],priority:-.10,enabled:()=>!current,shop,leaf,latch,approach:chosen.approach.toArray(),normal:chosen.n.toArray()};
  entrances.push(entry);inspections.resolver.register(entry);
 }
 for(const e of dialogue.entries){e.enabled=()=>{const place=travel?.location(e.character.id)??locationFor(e.character.id);return current?place===current.shop.id:!['private',...shops.map(s=>s.id)].includes(place);};e.character.rumorPool=rumorPools[e.character.id]??[];}
 function locationFor(id){return dailyLocations[id]?.[townLife.state.period]??'town';}
 function characterLocation(id){const place=travel?.location(id)??locationFor(id);return current&&place===current.shop.id?current.shop.id:'town';}
 function getRoom(shop){if(rooms.has(shop.id))return rooms.get(shop.id);const room=buildInterior({THREE,shop});rooms.set(shop.id,room);room.root.visible=false;
  for(const target of room.inspect)inspections.resolver.register(target);
  const exit={id:'exit:'+shop.id,kind:'exit',verb:'外へ出る',label:shop.name+'の出口',object:room.door,localPoint:[0,1.08,0],localPoints:{cat:[0,.32,0]},range:2.1,profiles:['human','cat'],enabled:()=>current===room};inspections.resolver.register(exit);for(const fn of roomListeners)fn(room);
  return room;}
 function enter(shop){if(!walking.active||current)return false;if(!isShopOpen(shop,townLife.state.period)){inspections.present(entrances.find(e=>e.shop===shop),{text:'今は閉まっている。扉の向こうでは、静かに次の仕事を待っている。'});return false;}
  const room=getRoom(shop);returnPoint=walking.state.feet.clone();returnYaw=walking.state.yaw;savedBackground=scene.background;savedFog=scene.fog;
  for(const o of townRoots){savedVisibility.set(o,o.visible);if(!o.isLight||o.isPointLight)o.visible=false;if(o.isPointLight)o.userData.inactiveArea=true;}
  for(const p of outdoorPoints){p.userData.inactiveArea=true;p.visible=false;}
  current=room;scene.add(room.root);room.root.visible=true;walking.setArea(room.policy);walking.relocate(room.policy.spawn,{yaw:0});inspections.dismiss();updateActors();updateAppearance();inspections.resolver.refreshOccluders();inspections.update(.2);return true;}
 function restoreActors(){for(const [id,o] of actors){const initial=originals.get(id);if(o.parent!==initial.parent)initial.parent.attach(o);o.position.copy(initial.position);o.rotation.copy(initial.rotation);o.visible=initial.visible;}}
 function exit(){if(!current)return false;inspections.dismiss();current.root.visible=false;restoreActors();scene.remove(current.root);for(const [o,v]of savedVisibility){o.visible=v;if(o.isPointLight)o.userData.inactiveArea=false;}savedVisibility.clear();for(const p of outdoorPoints)p.userData.inactiveArea=false;scene.background=savedBackground;scene.fog=savedFog;
  current=null;walking.setArea(null);const safe=safeNear(returnPoint,walking.state.profile.id)??new THREE.Vector3(0,1.38,32);walking.relocate(safe,{yaw:returnYaw+Math.PI});label.hidden=true;updateActors();onExit();inspections.update(.2);return true;}
 walking.onLeave(exit);
 inspections.handlers.set('enter',e=>enter(e.shop));inspections.handlers.set('exit',exit);
 const outdoorPositions={harbor:new THREE.Vector3(-19,1.38,37.32),waterfront:new THREE.Vector3(10,1.38,32),square:new THREE.Vector3(10,3.5,20)};
 const anchors=new Map();for(const [key,p]of Object.entries(outdoorPositions)){const safe=safeNear(p);if(!safe)throw Error('No safe daily location '+key);anchors.set(key,safe);}
 function setActor(o,p,rotation=0){o.updateWorldMatrix(true,true);const local=o.parent.worldToLocal(p.clone());o.position.copy(local);o.rotation.set(0,rotation,0);o.updateWorldMatrix(true,true);const bottom=new THREE.Box3().setFromObject(o,true).min.y;o.position.y+=p.y-bottom;}
 function updateActors(){for(const [id,o]of actors){const place=travel?.location(id)??locationFor(id);if(current){const here=place===current.shop.id;o.visible=here;if(!here)continue;
    if(o.parent!==current.root)current.root.attach(o);
    let p=current.npcPosition;if(id==='greenBard')p=[-2.5,0,2.7];else if(id==='boatworker')p=[1.1,0,-1.6];
    const stations=current.workstations??[],key=current.shop.id+':'+id;let worker=workerStates.get(key);
    if(!worker){worker={feet:new THREE.Vector3(...p).add(current.root.position),station:0,wait:4,currentState:'working'};workerStates.set(key,worker);}
    const dt=workTime;worker.wait-=dt;if(stations.length&&worker.wait<=0){const target=new THREE.Vector3(...stations[worker.station%stations.length]).add(current.root.position),delta=target.clone().sub(worker.feet),d=Math.hypot(delta.x,delta.z);
     if(d<.05){worker.station++;worker.wait=5+worker.station%3;worker.currentState='working';}else{const blockedByPlayer=walking.active&&walking.state.feet.distanceTo(worker.feet)<.65;const step=Math.min(blockedByPlayer?0:.50*dt,d),x=worker.feet.x+delta.x/d*step,z=worker.feet.z+delta.z/d*step,y=walking.canStandActor('human',x,z,worker.feet.y,o);if(y!==null){worker.feet.set(x,y,z);worker.currentState='walking';}else{worker.wait=2;worker.station++;worker.currentState='working';}}}
    const feet=worker.feet;setActor(o,feet,stations.length?({bakery:1.6,bookshop:Math.PI,orrery:1.8,tavern:0}[current.shop.id]??0):0);o.userData.shopWork={currentState:worker.currentState,station:worker.station};o.visible=true;
   }else{if(travel?.draw(id))continue;const initial=originals.get(id);if(o.parent!==initial.parent)initial.parent.attach(o);
    if(['private',...shops.map(s=>s.id)].includes(place)){o.visible=false;continue;}o.visible=initial.visible;
    if(id==='greenBard'&&place==='square')continue; // Keep his original walking animation at midday.
    const p=anchors.get(place);if(p)setActor(o,p,id==='boatworker'?-.3:Math.PI/3);
   }
  }}
 function updateAppearance(){if(!current)return;scene.background=current.background??=new THREE.Color(current.shop.id==='orrery'?0x484d4c:0x797060);scene.background.set(current.shop.id==='orrery'?0x484d4c:0x797060);scene.fog=current.fog??=new THREE.FogExp2(0x797060,0);scene.fog.density=0;
  const night=townLife.state.period==='night',blackout=townLife.state.weather==='blackout';current.ambient.intensity=blackout?.28:night?.85:1.05;
  for(const m of Object.values(current.materials))if(m.emissive?.getHex())m.emissiveIntensity=m.userData.blackoutBackup?(blackout?1.35:night?.55:.30):blackout?.015:night?.70:.45;
  label.textContent=current.shop.name+' · '+shopStatus(current.shop,townLife.state.period);label.hidden=false;
 }
 function applyTime(){for(const e of entrances){const open=isShopOpen(e.shop,townLife.state.period);e.verb=open?'入る':'閉まっている';e.label=e.shop.name+'（'+shopStatus(e.shop,townLife.state.period)+'）';e.latch.visible=!open;e.leaf.material=wood;}
  updateActors();updateAppearance();}
 townLife.onChange(applyTime);applyTime();
 function update(dt=.016){workTime=Math.min(.05,dt);travel?.update(dt);updateActors();updateAppearance();if(current)for(const o of outdoorPoints)o.visible=false;}
 function trackingPoint(object){const id=[...actors].find(([,o])=>o===object)?.[0],place=id&&locationFor(id),door=entrances.find(e=>e.shop.id===place);return !object.visible&&door?door.object.getWorldPosition(new THREE.Vector3()):object.getWorldPosition(new THREE.Vector3());}
 return {initialAnchor:place=>anchors.get(place)?.clone(),setTravel(adapter){travel=adapter;},onRoom(fn){roomListeners.add(fn);for(const r of rooms.values())fn(r);return()=>roomListeners.delete(fn);},shops,rooms,entrances,enter,exit,update,locationFor,characterLocation,trackingPoint,events:townEventDefinitions,soundAnchors,workerStates,get current(){return current},get stats(){return{builtRooms:rooms.size,visibleRooms:[...rooms.values()].filter(r=>r.root.visible).length,active:current?.shop.id??'town',activeMeshes:current?.stats.meshes??0};}};
}
