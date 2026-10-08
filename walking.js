import {gameModalOpen,resetGamePointers} from './game-input-state.js?v=52.9';
// Walking is separate from the miniature's view/animation system. Future actors
// can supply their own dimensions and ground policy without changing input/UI.
export const walkingProfiles={
  human:{id:'human',eyeHeight:1.65,height:1.8,radius:.24,footRadius:.16,speed:3.2,stepUp:.38,stepDown:.42,fov:46},
  cat:{id:'cat',eyeHeight:.32,height:.52,radius:.13,footRadius:.085,speed:3.8,stepUp:.40,stepDown:.42,fov:60}
};

// Major lanes aim for 1.2m of visible width: 0.48m shoulders plus turning room.
// Low cat passages are deliberately exempt; never globally shrink collision.
export const humanRouteStandard={minimumWidth:1.2,landingDepth:1.2,maximumRiser:.25};

export function createWalkingSystem({THREE,scene,camera,controls,canvas,terrain,surfaces,
  surfaceMaterials,dynamicObjects,ignoredObjects,waterMaterials,trackBounds,spawn,terrainSamplers=[],movementBlockers=[],waterExclusions=[]}){
  const state={active:false,profile:walkingProfiles.human,feet:spawn.clone(),yaw:-Math.PI*.83,pitch:-.05};
  const input={keys:new Set(),touch:new Set(),forward:0,right:0,analog:{x:0,y:0}};
  const ground=[],floors=[],obstacles=[],waterZones=[],waterSurfaces=[],catSteps=[];let jumpState=null;
  const upAxis=new THREE.Vector3(0,1,0),direction=new THREE.Vector3(),euler=new THREE.Euler(0,0,0,'YXZ');
  const dynamicBounds=dynamicObjects.map(object=>({object,bounds:new THREE.Box3()}));
  const terrainSet=new Set(terrain),surfaceSet=new Set(surfaces),ignored=new Set(ignoredObjects);
  let eyeY=spawn.y+state.profile.eyeHeight,lastPointer=null,savedNear=camera.near,savedFov=camera.fov,panelWasCollapsed=false;
  const hint=document.getElementById('walkHint'),lookButton=document.getElementById('walkLook');
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true};
  const contains=(b,x,z)=>x>=b.min.x-.001&&x<=b.max.x+.001&&z>=b.min.z-.001&&z<=b.max.z+.001;
  scene.updateMatrixWorld(true);
  scene.traverse(object=>{
    if(!object.isMesh||!visible(object)||object.userData.walkSoft)return;
    for(let p=object;p;p=p.parent)if(ignored.has(p)||dynamicObjects.includes(p))return;
    const bounds=new THREE.Box3().setFromObject(object,true),g=object.geometry.parameters||{};
    if(terrainSet.has(object)){ground.push(bounds);return}
    if(waterMaterials.includes(object.material)){waterZones.push(bounds);waterSurfaces.push({object,bounds});return}
    // Only named decks and low stone/path slabs are floors; never roofs or cargo.
    const isFloor=surfaceSet.has(object)||object.userData.walkSurface||
      (object.geometry.type==='BoxGeometry'&&surfaceMaterials.includes(object.material)&&g.height<=.65&&Math.min(g.width,g.depth)>=.2);
    if(isFloor)floors.push(bounds);
    const size=bounds.getSize(new THREE.Vector3());
    if(Math.max(size.x,size.z)<.07||size.y<.035)return;
    const up=new THREE.Vector3(0,1,0).transformDirection(object.matrixWorld);
    const round=(object.geometry.type==='SphereGeometry'||
      (object.geometry.type==='CylinderGeometry'&&Math.abs(up.y)>.99))?
      {x:(bounds.min.x+bounds.max.x)/2,z:(bounds.min.z+bounds.max.z)/2,rx:size.x/2,rz:size.z/2}:null;
    obstacles.push({object,bounds,isFloor,round});
  });
  obstacles.push({bounds:trackBounds,isFloor:false});

  // A small spatial index keeps collision work local even in the dense market.
  const cells=new Map(),cellSize=4;
  for(const o of obstacles){
    const b=o.bounds;
    for(let x=Math.floor(b.min.x/cellSize);x<=Math.floor(b.max.x/cellSize);x++)
      for(let z=Math.floor(b.min.z/cellSize);z<=Math.floor(b.max.z/cellSize);z++){
        const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(o);
      }
  }
  function registerObstacle(object){
    object.updateWorldMatrix(true,true);const o={object,bounds:new THREE.Box3().setFromObject(object,true),isFloor:false,round:null};obstacles.push(o);
    for(let x=Math.floor(o.bounds.min.x/cellSize);x<=Math.floor(o.bounds.max.x/cellSize);x++)for(let z=Math.floor(o.bounds.min.z/cellSize);z<=Math.floor(o.bounds.max.z/cellSize);z++){const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(o);}
    return o;
  }
  function refreshObstacle(root){
    const moved=obstacles.filter(o=>{for(let p=o.object;p;p=p.parent)if(p===root)return true;return false;});
    for(const [key,list] of cells){const kept=list.filter(o=>!moved.includes(o));if(kept.length)cells.set(key,kept);else cells.delete(key);}
    root.updateWorldMatrix(true,true);
    for(const o of moved){o.bounds.setFromObject(o.object,true);if(o.round){const b=o.bounds;o.round={x:(b.min.x+b.max.x)/2,z:(b.min.z+b.max.z)/2,rx:(b.max.x-b.min.x)/2,rz:(b.max.z-b.min.z)/2};}
      for(let x=Math.floor(o.bounds.min.x/cellSize);x<=Math.floor(o.bounds.max.x/cellSize);x++)for(let z=Math.floor(o.bounds.min.z/cellSize);z<=Math.floor(o.bounds.max.z/cellSize);z++){const key=x+','+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(o);}
    }return moved.length;
  }
  let actorIgnore=null;
  let area=null;const leaveListeners=new Set();
  function setArea(policy=null){area=policy;state.area=policy?.id??'town';clearInput();}
  function relocate(feet,{yaw=state.yaw,pitch=0}={}){const y=canStand(feet.x,feet.z,feet.y);if(y===null)throw Error('Unsafe walking destination');jumpState=null;state.feet.set(feet.x,y,feet.z);state.yaw=yaw;state.pitch=pitch;clearInput();eyeY=y+state.profile.eyeHeight;updateCamera(0);}
  function nearby(x,z,profile=state.profile){
    const found=new Set(),r=profile.radius;
    for(let ix=Math.floor((x-r)/cellSize);ix<=Math.floor((x+r)/cellSize);ix++)
      for(let iz=Math.floor((z-r)/cellSize);iz<=Math.floor((z+r)/cellSize);iz++)
        for(const o of cells.get(ix+','+iz)||[])found.add(o);
    return found;
  }
  function groundAt(x,z,currentY,profile=state.profile){
    if(area)return area.groundAt(x,z,currentY,profile);
    let y=-Infinity;
    for(const b of ground)if(contains(b,x,z))y=Math.max(y,b.max.y);
    for(const sample of terrainSamplers){const h=sample(x,z);if(h!==null&&Number.isFinite(h))y=Math.max(y,h);}
    if(!Number.isFinite(y))return null;
    // Bridge only the tiny seams between existing dock planks, not open water.
    for(const b of floors)if(x>=b.min.x-.025&&x<=b.max.x+.025&&z>=b.min.z-.025&&z<=b.max.z+.025&&b.max.y<=currentY+profile.stepUp+.001)y=Math.max(y,b.max.y);
    if(profile.id==='cat')for(const step of catSteps){if(!visible(step.object))continue;const b=step.bounds;if(contains(b,x,z)&&b.max.y<=currentY+profile.stepUp+.001)y=Math.max(y,b.max.y);}
    if(!waterExclusions.some(exclude=>exclude(x,z,y)))for(const b of waterZones)if(contains(b,x,z)&&b.max.y>=y-.04)return null;
    return y;
  }
  function intersectsBody(bounds,x,z,feetY,isFloor=false,round=null,profile=state.profile){
    const p=profile;
    if(bounds.max.y<=feetY+.06||bounds.min.y>=feetY+p.height-.02)return false;
    if(isFloor&&bounds.max.y<=feetY+p.stepUp+.001)return false;
    if(round){
      const dx=(x-round.x)/(round.rx+p.radius),dz=(z-round.z)/(round.rz+p.radius);
      return dx*dx+dz*dz<1;
    }
    const dx=x-Math.max(bounds.min.x,Math.min(x,bounds.max.x));
    const dz=z-Math.max(bounds.min.z,Math.min(z,bounds.max.z));
    return dx*dx+dz*dz<p.radius*p.radius;
  }
  function canStand(x,z,currentY,profile=state.profile){
    const p=profile,foot=p.footRadius??p.radius,y=groundAt(x,z,currentY,p);
    if(y===null||y-currentY>p.stepUp+.001||currentY-y>p.stepDown+.001)return null;
    // Check both feet, separately from shoulder clearance at walls/props.
    for(const [dx,dz] of [[foot,0],[-foot,0],[0,foot],[0,-foot]]){
      const edge=groundAt(x+dx,z+dz,y,p);
      if(edge===null||Math.abs(edge-y)>Math.max(p.stepUp,p.stepDown)+.001)return null;
    }
    if(!area&&movementBlockers.some(block=>block(x,z,y,p)))return null;
    if(area){for(const o of area.obstacles)if(intersectsBody(o.bounds,x,z,y,o.isFloor,o.round,p))return null;}
    else for(const o of nearby(x,z,p))if(!o.disabled&&(!o.object||visible(o.object))&&intersectsBody(o.bounds,x,z,y,o.isFloor,o.round,p))return null;
    for(const o of dynamicBounds)if(o.object!==actorIgnore&&visible(o.object)&&intersectsBody(o.bounds,x,z,y,false,o.round??null,p))return null;
    return y;
  }
  function registerDynamicObject(object){if(dynamicBounds.some(e=>e.object===object))return;for(const o of obstacles)for(let p=o.object;p;p=p.parent)if(p===object){o.disabled=true;break;}object.updateWorldMatrix(true,true);const bounds=new THREE.Box3().setFromObject(object,true),position=object.getWorldPosition(new THREE.Vector3());dynamicBounds.push({object,bounds,bodyRadius:.23,footOffset:bounds.min.y-position.y,bodyHeight:1.8});refreshDynamic();}
  let dynamicActivity=()=>true;const dynamicActivityStats={active:0,sleeping:0};
  function refreshDynamic(force=false){dynamicActivityStats.active=dynamicActivityStats.sleeping=0;for(const o of dynamicBounds){if(!visible(o.object)||(!force&&!dynamicActivity(o.object))){dynamicActivityStats.sleeping++;o.bounds.makeEmpty();continue;}dynamicActivityStats.active++;if(o.bodyRadius){const p=o.object.getWorldPosition(new THREE.Vector3()),y=p.y+o.footOffset;o.round={x:p.x,z:p.z,rx:o.bodyRadius,rz:o.bodyRadius};o.bounds.min.set(p.x-o.bodyRadius,y,p.z-o.bodyRadius);o.bounds.max.set(p.x+o.bodyRadius,y+o.bodyHeight,p.z+o.bodyRadius);}else{o.object.updateWorldMatrix(true,true);o.bounds.setFromObject(o.object,true);}}}
  function move(dx,dz){
    // Small substeps prevent wall/water tunnelling, even after a slow frame.
    const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.08));dx/=count;dz/=count;
    for(let i=0;i<count;i++){
      let y=canStand(state.feet.x+dx,state.feet.z+dz,state.feet.y);
      if(y!==null){state.feet.x+=dx;state.feet.z+=dz;state.feet.y=y;continue}
      y=canStand(state.feet.x+dx,state.feet.z,state.feet.y);
      if(y!==null){state.feet.x+=dx;state.feet.y=y}
      y=canStand(state.feet.x,state.feet.z+dz,state.feet.y);
      if(y!==null){state.feet.z+=dz;state.feet.y=y}
    }
  }
  function registerCatStep(object){object.updateWorldMatrix(true,true);const entry={object,bounds:new THREE.Box3().setFromObject(object,true)};catSteps.push(entry);object.userData.catStep=true;return entry;}
  function jumpPoint(from,to,t){const horizontal=Math.max(0,Math.min(1,(t-.22)/.56)),apex=Math.max(from.y,to.y)+.22,p=from.clone().lerp(to,horizontal);p.y=t<.22?from.y+(apex-from.y)*Math.sin(t/.22*Math.PI/2):t>.78?apex+(to.y-apex)*(1-Math.cos((t-.78)/.22*Math.PI/2)):apex+Math.sin((t-.22)/.56*Math.PI)*.03;return p;}
  function jump(){if(state.inputBlocked||!state.active||state.profile.id!=='cat'||jumpState)return false;refreshDynamic();const p={...state.profile,stepUp:1.05,stepDown:1.05},forward=new THREE.Vector3(-Math.sin(state.yaw),0,-Math.cos(state.yaw));
    const candidates=catSteps.filter(step=>visible(step.object)).map(step=>({step,point:step.bounds.getCenter(new THREE.Vector3()).setY(step.bounds.max.y)})).filter(q=>{const delta=q.point.clone().sub(state.feet);return Math.hypot(delta.x,delta.z)<1.35&&delta.y>=-.95&&delta.y<=.90&&delta.clone().setY(0).normalize().dot(forward)>.15;}).sort((a,b)=>a.point.distanceTo(state.feet)-b.point.distanceTo(state.feet));
    candidates.push({step:null,point:state.feet.clone().addScaledVector(forward,.55)});
    for(const q of candidates){const y=canStand(q.point.x,q.point.z,state.feet.y,p);if(y===null)continue;q.point.y=y;if(Math.abs(y-state.feet.y)>.95)continue;let clear=true;
      for(let i=1;i<=12;i++){const t=i/12,pos=jumpPoint(state.feet,q.point,t);if(groundAt(pos.x,pos.z,state.feet.y,p)===null){clear=false;break;}for(const o of nearby(pos.x,pos.z,p)){let belongs=false;for(let a=o.object;a;a=a.parent)if(a===q.step?.object)belongs=true;if(!belongs&&!o.disabled&&(!o.object||visible(o.object))&&intersectsBody(o.bounds,pos.x,pos.z,pos.y,o.isFloor,o.round,p)){clear=false;break;}}if(!clear)break;}
      if(clear){jumpState={from:state.feet.clone(),to:q.point.clone(),elapsed:0,duration:.42};return true;}
    }return false;
  }
  function releaseCamera(){const pointer=lastPointer;lastPointer=null;if(pointer&&canvas.hasPointerCapture(pointer.id))canvas.releasePointerCapture(pointer.id);}
  function setAnalog(x=0,y=0){if(!state.active||state.inputBlocked||gameModalOpen())x=y=0;const length=Math.max(1,Math.hypot(x,y));input.analog.x=x/length;input.analog.y=y/length;}
  function clearInput(){input.keys.clear();input.touch.clear();input.forward=input.right=0;input.analog.x=input.analog.y=0;releaseCamera();resetGamePointers();}
  document.addEventListener('game-input-reset',()=>{input.analog.x=input.analog.y=0;releaseCamera();});

  function updateHint(){hint.dataset.profile=state.profile.id;hint.textContent=(state.profile.id==='cat'?'猫 · ':'人間 · ')+( document.pointerLockElement===canvas?
    'WASD / 矢印キーで移動 · マウスで見回す · Escでマウス解除':
    matchMedia('(pointer:coarse)').matches?'左下で移動 · 右側をドラッグして見回す':'WASD / 矢印キーで移動 · 画面をドラッグして見回す')}
  function look(dx,dy){state.yaw-=dx*.003;state.pitch=THREE.MathUtils.clamp(state.pitch-dy*.003,-1.25,1.25)}
  function updateCamera(dt){
    eyeY=THREE.MathUtils.lerp(eyeY,state.feet.y+state.profile.eyeHeight,1-Math.exp(-18*dt));
    eyeY=Math.max(eyeY,state.feet.y+Math.min(state.profile.id==='cat'?.12:.22,state.profile.eyeHeight));
    camera.position.set(state.feet.x,eyeY,state.feet.z);
    euler.set(state.pitch,state.yaw,0);camera.quaternion.setFromEuler(euler);
  }
  const lastLocations=new Map();
  function canStandActor(id,x,z,y,object){const saved=actorIgnore;try{actorIgnore=object;return canStandAs(id,x,z,y);}finally{actorIgnore=saved;}}
  function canStandTownAs(id,x,z,y,object=null){const saved=area,old=actorIgnore;try{area=null;actorIgnore=object;return canStandAs(id,x,z,y);}finally{area=saved;actorIgnore=old;}}
  function canStandAs(id,x,z,y){const profile=walkingProfiles[id];return profile?canStand(x,z,y,profile):null;}
  function safeLocation(profile){
    let y=canStand(state.feet.x,state.feet.z,state.feet.y,profile);if(y!==null)return new THREE.Vector3(state.feet.x,y,state.feet.z);
    // A cat in a low passage cannot become a person inside the table/wall.
    for(let r=.25;r<=3;r+=.25)for(let i=0;i<16;i++){const x=state.feet.x+Math.sin(i*Math.PI/8)*r,z=state.feet.z+Math.cos(i*Math.PI/8)*r;y=canStand(x,z,state.feet.y,profile);if(y!==null)return new THREE.Vector3(x,y,z);}
    const previous=lastLocations.get(profile.id);if(previous&&canStand(previous.x,previous.z,previous.y,profile)!==null)return previous.clone();
    const fallback=area?.spawn??spawn;
    if(canStand(fallback.x,fallback.z,fallback.y,profile)!==null)return fallback.clone();
    if(canStand(spawn.x,spawn.z,spawn.y,profile)===null)throw Error('No safe walking spawn');return spawn.clone();
  }
  function enter(id='human'){
    const profile=walkingProfiles[id];if(!profile)return;if(jumpState){state.feet.copy(jumpState.from);jumpState=null;}
    const wasActive=state.active;if(wasActive)lastLocations.set(state.profile.id,state.feet.clone());refreshDynamic();const feet=safeLocation(profile);
    if(!wasActive){savedNear=camera.near;savedFov=camera.fov;const panel=document.getElementById('panel');panelWasCollapsed=panel.classList.contains('collapsed');}
    jumpState=null;state.profile=profile;state.feet.copy(feet);state.active=true;clearInput();camera.near=id==='cat'?.035:.06;camera.fov=profile.fov;camera.updateProjectionMatrix();
    controls.enabled=false;eyeY=state.feet.y+profile.eyeHeight;updateCamera(0);
    document.body.classList.add('walking');document.body.classList.toggle('cat-walking',id==='cat');document.getElementById('walk').classList.toggle('active',id==='human');document.getElementById('catWalk')?.classList.toggle('active',id==='cat');
    document.getElementById('panel').classList.add('collapsed');document.getElementById('toggle').textContent='操作';updateHint();
  }
  function leave(){
    if(!state.active)return;
    for(const fn of leaveListeners)fn();
    if(jumpState)state.feet.copy(jumpState.from);jumpState=null;lastLocations.set(state.profile.id,state.feet.clone());state.active=false;clearInput();if(document.pointerLockElement===canvas)document.exitPointerLock();
    camera.near=savedNear;camera.fov=savedFov;camera.updateProjectionMatrix();
    document.body.classList.remove('walking','cat-walking');document.getElementById('catWalk')?.classList.remove('active');document.getElementById('walk').classList.remove('active');
    document.getElementById('panel').classList.toggle('collapsed',panelWasCollapsed);document.getElementById('toggle').textContent=panelWasCollapsed?'操作':'街を見る';
  }
  const inputBlocks=new Set();
  function setInputBlocked(reason,blocked){if(blocked)inputBlocks.add(reason);else inputBlocks.delete(reason);state.inputBlocked=inputBlocks.size>0;clearInput();}
  function update(dt){
    if(!state.active)return;
    if(state.inputBlocked||gameModalOpen())return;
    refreshDynamic();dt=Math.min(.05,Math.max(0,dt));
    if(jumpState){jumpState.elapsed+=dt;const t=Math.min(1,jumpState.elapsed/jumpState.duration);state.feet.copy(jumpPoint(jumpState.from,jumpState.to,t));updateCamera(dt);if(t===1)jumpState=null;return;}
    const pressed=(...codes)=>codes.some(c=>input.keys.has(c)||input.touch.has(c));
    input.forward=Number(pressed('KeyW','ArrowUp','forward'))-Number(pressed('KeyS','ArrowDown','backward'))+input.analog.y;
    input.right=Number(pressed('KeyD','ArrowRight','right'))-Number(pressed('KeyA','ArrowLeft','left'))+input.analog.x;
    direction.set(input.right,0,-input.forward);
    if(direction.lengthSq()>0){direction.multiplyScalar(1/Math.max(1,direction.length())).applyAxisAngle(upAxis,state.yaw).multiplyScalar(state.profile.speed*dt);move(direction.x,direction.z)}
    updateCamera(dt);
  }
  const movementKeys=new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']);
  addEventListener('keydown',e=>{
    if(!state.active||state.inputBlocked||gameModalOpen()||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName))return;
    if(e.code==='Space'&&state.profile.id==='cat'&&!e.repeat){e.preventDefault();jump();}
    if(movementKeys.has(e.code)){e.preventDefault();input.keys.add(e.code)}
  });
  addEventListener('keyup',e=>input.keys.delete(e.code));
  addEventListener('blur',clearInput);
  addEventListener('resize',clearInput);
  addEventListener('orientationchange',clearInput);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInput()});
  document.addEventListener('pointerlockchange',()=>{clearInput();updateHint()});
  lookButton.onclick=async()=>{
    if(!state.active)return;
    try{await canvas.requestPointerLock?.()}catch{updateHint()}
  };
  canvas.addEventListener('pointerdown',e=>{
    if(!state.active||state.inputBlocked||gameModalOpen()||lastPointer||e.button!==0||document.pointerLockElement===canvas||(e.pointerType==='touch'&&e.clientX<innerWidth*.48))return;e.preventDefault();
    lastPointer={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove',e=>{
    if(!state.active||state.inputBlocked||gameModalOpen())return;
    if(document.pointerLockElement===canvas){look(e.movementX,e.movementY);return}
    if(lastPointer?.id!==e.pointerId)return;
    e.preventDefault();look(e.clientX-lastPointer.x,e.clientY-lastPointer.y);lastPointer.x=e.clientX;lastPointer.y=e.clientY;
  });
  const release=e=>{if(lastPointer?.id===e.pointerId)releaseCamera()};
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
  canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('dragstart',e=>e.preventDefault());
  // Debug/authoring diagnostics use the same feet/body policy as real movement.
  // They never open an invisible corridor or change a collider.
  function inspectClearance(x,z,y,id='human'){
    const profile=walkingProfiles[id];if(!profile)throw Error('Unknown walking profile');
    const floor=groundAt(x,z,y,profile),support=canStand(x,z,y,profile);
    const blocked=floor===null?[]:[...nearby(x,z,profile),...dynamicBounds.filter(o=>visible(o.object))].filter(o=>!o.disabled&&(!o.object||visible(o.object))&&intersectsBody(o.bounds,x,z,floor,o.isFloor,o.round,profile));
    return {walkable:support!==null,floor,blockers:blocked.map(o=>({name:o.object?.name||o.object?.geometry?.type||'track',min:o.bounds.min.toArray(),max:o.bounds.max.toArray()})),profile:id};
  }
  // Read-only world data also supports route validation and future actor policies.
  return {get active(){return state.active},state,input,setAnalog,resetInput:clearInput,setInputBlocked,enter,leave,update,groundAt,canStand,canStandAs,registerObstacle,refreshObstacle,registerCatStep,jump,catSteps,get jumping(){return !!jumpState;},setArea,relocate,onLeave(fn){leaveListeners.add(fn);return()=>leaveListeners.delete(fn);},profiles:walkingProfiles,lastLocations,
    refreshWaterSurfaces(){for(const {object,bounds}of waterSurfaces){object.updateWorldMatrix(true,false);bounds.setFromObject(object,true);}},world:{ground,floors,obstacles,waterZones},refreshDynamic,setDynamicActivity(fn){dynamicActivity=fn;refreshDynamic();},dynamicActivityStats,inspectClearance,canStandTownAs,canStandActor,registerDynamicObject};
}
