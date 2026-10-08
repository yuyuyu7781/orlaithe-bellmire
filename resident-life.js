import {residentLifeSettings,residentRoles,residentVariation,everydayResidentRole,communityAppearance,carriedPropVisible} from './resident-life-settings.js';

// The existing roots, routes, ground anchors and dialogue identities remain the
// source of truth. Only bodies and joint-local poses change. Small accessories
// share four dynamic instance batches instead of hundreds of separate draws.
export function createResidentLife({THREE,scene,camera=null,getQuality=()=> 'standard',residentScale,actors,moving=[],seatedWithBoots=[]}){
 const root=new THREE.Group();root.name='Resident living details';scene.add(root);
 const material=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.98}),geometries={
  block:new THREE.BoxGeometry(1,1,1),ball:new THREE.SphereGeometry(1,6,4),
  limb:new THREE.CylinderGeometry(.5,.5,1,6),hair:new THREE.SphereGeometry(1,8,4,0,Math.PI*2,0,1.45)
 },parts=new Map(Object.keys(geometries).map(k=>[k,[]])),records=[],movingMap=new Map(moving.map(q=>[q.object,q])),identity=new Map(Object.entries(actors).map(([id,o])=>[o,id]));
 const world=new THREE.Vector3(),frustum=new THREE.Frustum(),projection=new THREE.Matrix4(),sphere=new THREE.Sphere(new THREE.Vector3(),1.4);let lastPose=-Infinity,period='day',weather='clear',getArea=()=> 'town';
 function add(kind,parent,position,size,color){const node=new THREE.Object3D();node.position.set(...position);node.scale.set(...size);parent.add(node);parts.get(kind).push({node,color:new THREE.Color(color),owner:parent});return node;}
 function contactLegs(parent,base,sx,sy,sz,color){const positions=[],normals=[],colors=[];
  const g=new THREE.BoxGeometry(1,1,1).toNonIndexed(),normalMatrix=new THREE.Matrix3(),matrix=new THREE.Matrix4(),v=new THREE.Vector3(),n=new THREE.Vector3();
  for(const x of [-.115,.115])for(const [y,h,w,d,c]of [[.31,.54,.115,.13,color],[.055,.11,.15,.23,0x3f3830]]){matrix.makeScale(w/sx,h/sy,d/sz);matrix.setPosition(x/sx,base+y/sy,.035/sz);normalMatrix.getNormalMatrix(matrix);const tint=new THREE.Color(c);for(let i=0;i<g.attributes.position.count;i++){v.fromBufferAttribute(g.attributes.position,i).applyMatrix4(matrix);n.fromBufferAttribute(g.attributes.normal,i).applyMatrix3(normalMatrix).normalize();positions.push(...v.toArray());normals.push(...n.toArray());colors.push(tint.r,tint.g,tint.b);}}
  g.dispose();const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const m=new THREE.Mesh(geometry,footMaterial);m.name='Resident grounded boots and trousers';m.userData.walkSoft=true;parent.add(m);return m;
 }
 const footMaterial=new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:1});
 residentScale.residents.forEach((entry,index)=>{
  const o=entry.object,head=entry.head,body=o.children.find(c=>c.geometry?.type==='CylinderGeometry');if(!head||!body)return;
  o.updateWorldMatrix(true,true);const b=new THREE.Box3().setFromObject(o,true),base=o.worldToLocal(new THREE.Vector3(o.getWorldPosition(world).x,b.min.y,o.getWorldPosition(world).z)).y;
  const appearance=o.userData.community?communityAppearance(o.userData.appearanceIndex):(!identity.has(o)&&index%5<2?communityAppearance(index):null);const variation={...residentVariation(index),...(appearance?{height:appearance.height,shoulders:appearance.shoulders}: {})},id=identity.get(o),motion=movingMap.get(o),place=o.getWorldPosition(new THREE.Vector3()),role=residentRoles[id]??o.userData.visitorRole??everydayResidentRole(entry,index,place,body.material.color.getHex());
  // Feet remain at the same contact point; variation is only +/- 2.2 percent.
  if(!entry.seated)o.scale.y*=variation.height;
  const scale=o.getWorldScale(new THREE.Vector3()),sx=scale.x,sy=scale.y,sz=scale.z;
  body.scale.x*=variation.shoulders;if(appearance)body.scale.y*=appearance.coatLength;if(appearance)body.scale.z*=1+(appearance.shoulders-1)*.6;head.scale.multiplyScalar(residentLifeSettings.headScale);
  let feet=motion?.feet??[];
  if(!entry.seated&&!motion){const p=body.geometry.parameters,cut=Math.min(p.height*.48,.52/sy),previous=body.geometry;body.geometry=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom*.94,p.height-cut,p.radialSegments??8);body.position.y+=cut/2;
   // Geometry was per-person at construction; it has no other owner.
   previous.dispose();feet=[contactLegs(o,base,sx,sy,sz,body.material.color.getHex())];}
  if(entry.seated&&!seatedWithBoots.includes(o)){const p=body.geometry.parameters,cut=.28/sy,previous=body.geometry;body.geometry=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height-cut,p.radialSegments??8);body.position.y-=cut/2;head.position.y-=cut;previous.dispose();}
  // Keep the seated torso at its existing bench/car seat. Visible thighs and
  // dangling calves are instances, not a new support or collision surface.
  if(entry.seated&&!seatedWithBoots.includes(o)){for(const sign of [-1,1]){const thigh=add('limb',o,[sign*.11/sx,base+.06/sy,.15/sz],[.12/sx,.37/sy,.12/sz],role.accent);thigh.rotation.x=Math.PI/2;add('limb',o,[sign*.11/sx,base-.24/sy,.31/sz],[.10/sx,.48/sy,.10/sz],role.accent);add('block',o,[sign*.11/sx,base-.51/sy,.34/sz],[.13/sx,.10/sy,.20/sz],0x3f3830);}}
  const radius=head.geometry.parameters.radius;
  const top=body.position.y+body.geometry.parameters.height*.5,chin=head.position.y-radius*head.scale.y;
  const neck=chin>top-.02/sy?add('limb',o,[0,(top+chin)/2,0],[.13/sx,(chin-top+.065/sy),.13/sz],head.material.color.getHex()):null;
  add('hair',head,[0,radius*.15,0],[radius*(appearance?.hairVolume??1.01),radius*(appearance?.hairVolume??1.035),radius*1.01],role.hair);
  if(appearance?.hat)add('block',head,[0,radius*.85,0],[radius*2.2,radius*.25,radius*2.1],role.accent);if(appearance&&index%3===1)add('ball',head,[0,0,-radius*.55],[radius*.75,radius*.65,radius*.45],role.hair);
  if(id==='greenBard'||id==='starmaker')add('ball',head,[0,-radius*.25,-radius*.55],[radius*.80,radius*.91,radius*.40],role.hair);
  if(id==='baker')add('ball',head,[0,radius*.35,-radius*.78],[radius*.44,radius*.43,radius*.42],role.hair);
  if(id==='bookseller')for(const sign of [-1,1])add('block',head,[sign*radius*.36,radius*.10,radius*.98],[radius*.43,radius*.20,radius*.065],0x696453);
  if(id==='boatworker')add('hair',head,[0,-radius*.58,radius*.12],[radius*.74,radius*.33,radius*.80],role.hair);
  add('ball',head,[0,-radius*.10,radius*.94],[radius*.12,radius*.16,radius*.15],head.material.color.getHex());
  for(const sign of [-1,1])add('block',head,[sign*radius*.36,radius*.10,radius*.92],[radius*.084,radius*.084,radius*.036],0x514536);
  const arms=[];
  if(motion?.arms?.length){for(let i=0;i<motion.arms.length;i++){const old=motion.arms[i],pivot=new THREE.Group();pivot.position.copy(old.position);pivot.position.y+=old.geometry.parameters.height*.45;o.add(pivot);old.position.set(0,-old.geometry.parameters.height*.45,0);pivot.add(old);motion.arms[i]=pivot;arms.push(pivot);add('ball',pivot,[0,-old.geometry.parameters.height*.95,0],[.055/sx,.065/sy,.055/sz],head.material.color.getHex());}}
  else {const bodyTop=body.position.y+body.geometry.parameters.height*.5;for(const sign of [-1,1]){const pivot=new THREE.Group();pivot.position.set(sign*.29/sx,bodyTop-.08/sy,0);o.add(pivot);add('limb',pivot,[0,-.26/sy,0],[.11/sx,.52/sy,.11/sz],body.material.color.getHex());add('ball',pivot,[0,-.55/sy,0],[.055/sx,.065/sy,.055/sz],head.material.color.getHex());arms.push(pivot);}}
  // A slim apron/scarf adds occupational silhouette without enlarging bodies.
  if(id&&id!=='greenBard')add('block',body,[0,-body.geometry.parameters.height*.10,body.geometry.parameters.radiusBottom*.84],[.34/sx,.46/sy,.025/sz],role.accent);
  const prop=new THREE.Group();o.add(prop);prop.position.set(0,base+(entry.seated?.25:.87)/sy,.42/sz);
  if(role.prop==='book'||role.prop==='chart'){add('block',prop,[0,0,0],[.29/sx,.055/sy,.22/sz],role.prop==='book'?0x59614e:0xb9ad91);add('block',prop,[0,.033/sy,.01/sz],[.25/sx,.015/sy,.18/sz],0xc9bda3);prop.rotation.x=.20;}
  if(role.prop==='basket'){add('limb',prop,[0,-.10/sy,0],[.36/sx,.22/sy,.30/sz],0x987b54);for(const x of [-.08,.07])add('ball',prop,[x/sx,.015/sy,0],[.09/sx,.06/sy,.075/sz],0xc49a63);}
  if(role.prop==='parcel'){add('block',prop,[0,-.04/sy,0],[.34/sx,.23/sy,.24/sz],0xa09375);add('block',prop,[0,-.04/sy,.126/sz],[.022/sx,.23/sy,.012/sz],0x6e6049);}
  if(role.prop==='tools'){add('block',prop,[0,-.08/sy,0],[.035/sx,.36/sy,.035/sz],0x746451);add('block',prop,[0,.08/sy,0],[.18/sx,.07/sy,.07/sz],0x626a67);}
  if(role.prop==='rope'){for(let i=0;i<4;i++)add('ball',prop,[(i%2?1:-1)*.075/sx,Math.floor(i/2)*.045/sy,0],[.11/sx,.036/sy,.095/sz],0x978265);}
  if(role.prop==='crate'){add('block',prop,[0,-.02/sy,0],[.40/sx,.28/sy,.29/sz],0x8c7354);for(const x of [-.15,.15])add('block',prop,[x/sx,-.02/sy,.15/sz],[.035/sx,.28/sy,.025/sz],0x5e4c39);}
  if(role.prop==='broom'){prop.position.x=.32/sx;add('limb',prop,[0,-.25/sy,0],[.028/sx,.88/sy,.028/sz],0x877051);add('block',prop,[0,-.72/sy,0],[.23/sx,.10/sy,.08/sz],0xaca07a);}
  const footRest=feet[0]?.name==='Resident grounded boots and trousers'?feet[0].geometry.attributes.position.array.slice():null;
  const record={diverse:!!appearance,appearance,initialVisible:o.visible,initialParent:o.parent,index,footRest,object:o,head,body,neck,standingNeckY:neck?.position.y,standingBodyY:body.position.y,standingHeadY:head.position.y,standingArmY:arms.map(a=>a.position.y),standingPropY:prop.position.y,baseBody:body.rotation.clone(),baseHead:head.rotation.clone(),arms,feet,variation,role,id,moving:!!motion,seated:entry.seated,prop,scale:{sx,sy,sz},lastTime:null};records.push(record);o.userData.residentLife={role:id??role.activity,posture:role.posture,heightFactor:variation.height,shoulderFactor:variation.shoulders,gaitSpeed:appearance?.gait??(.92+variation.seed*.16),gaitAmplitude:.94+variation.seed*.12};
  o.updateWorldMatrix(true,true);
  // No terrain re-placement: maintain each original foot/seat world height.
  if(!entry.seated){const contact=new THREE.Box3().setFromObject(feet[0]??o,true).min.y;o.position.y+=(b.min.y-contact)/(o.parent?.getWorldScale(new THREE.Vector3()).y??1);}
 });
 const owners=new Set(records.map(r=>r.object));for(const list of parts.values())for(const p of list){for(let o=p.node;o;o=o.parent)if(owners.has(o)){p.owner=o;break;}}
 const batches=[];for(const [kind,list]of parts){if(!list.length)continue;const mesh=new THREE.InstancedMesh(geometries[kind],material,list.length);mesh.name='Resident '+kind+' details';mesh.userData.walkSoft=true;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;list.forEach((p,i)=>mesh.setColorAt(i,p.color));mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);root.add(mesh);batches.push({mesh,list});}
 function breathValue(t,phase){return Math.sin(t*.7+phase)*.025;}
 function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;}
 function update(time,{force=false}={}){
  const poseTick=force||Math.abs(time-lastPose)>=1/residentLifeSettings.idleRate;if(poseTick)lastPose=time;
  const quiet=period==='night'?.55:1;
  if(camera){camera.updateMatrixWorld();frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));}
  const active=new Set();
  for(const r of records){const {object:o,head,body,arms,variation:v,role}=r;
   // Existing scheduled/walking people keep their own physical route state.
   // A few background neighbours stay indoors in bad weather; room actors
   // remain exclusively controlled by the shop system.
   if(getArea()==='town'&&!r.id&&!r.moving&&!o.userData.dailyLife&&o.parent===r.initialParent){const sheltered=weather==='dawn'&&period==='morning'?r.index%3!==0:weather==='rain'?r.index%3===1:weather==='blackout'?r.index%4!==0:period==='night'?r.index%3!==0:false;o.visible=r.initialVisible&&!sheltered;}
   if(!o.userData.dailyLife&&!r.id){r.activity=period==='morning'?(r.seated?'reading':'sweeping'):period==='day'?role.activity:period==='evening'?'conversation':'resting';}if(r.diverse)r.prop.visible=carriedPropVisible(r);if(!visible(o))continue;
   o.getWorldPosition(sphere.center);sphere.center.y+=.85;const distance=camera?camera.position.distanceTo(sphere.center):0,inView=!camera||frustum.intersectsSphere(sphere),interval=distance<18&&inView?1/residentLifeSettings.idleRate:distance<42&&inView?.25:getQuality()==='mobile'?2:1;
   if(!force&&distance>85&&getArea()==='town')continue; // Remote schedules advance; distant body/detail animation sleeps.
   const pose=force||(poseTick&&Math.abs(time-(r.lastTime??-Infinity))>=interval);if(pose)r.lastTime=time;
   if(r.diverse)r.prop.visible=carriedPropVisible(r);const sitting=!!r.sitting;
   const seatDrop=sitting?Math.max(0,r.standingBodyY-body.geometry.parameters.height/2-Math.min(...r.footRest.filter((_,i)=>i%3===1))-.44/r.scale.sy):0;body.position.y=r.standingBodyY-seatDrop;head.position.y=r.standingHeadY-seatDrop;if(r.neck)r.neck.position.y=r.standingNeckY-seatDrop;arms.forEach((a,i)=>a.position.y=r.standingArmY[i]-seatDrop);r.prop.position.y=r.standingPropY-seatDrop;
   if(r.footRest){const foot=r.feet[0];r.standingGeometry??=foot.geometry;if(sitting&&!r.seatGeometry){const pieces=[];for(const sign of [-1,1])for(const [y,z,h,d]of [[.44,.15,.12,.36],[.24,.33,.38,.11],[.055,.38,.11,.23]]){const g=new THREE.BoxGeometry(.12/r.scale.sx,h/r.scale.sy,d/r.scale.sz).toNonIndexed();g.translate(sign*.115/r.scale.sx,(y/r.scale.sy)+(r.baseFeetY??(r.baseFeetY=Math.min(...r.footRest.filter((_,i)=>i%3===1)))),z/r.scale.sz);pieces.push(g);}
    const positions=[],normals=[],colors=[];for(const g of pieces){positions.push(...g.attributes.position.array);normals.push(...g.attributes.normal.array);const tint=new THREE.Color(r.role.accent);for(let i=0;i<g.attributes.position.count;i++)colors.push(tint.r,tint.g,tint.b);g.dispose();}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeBoundingBox();g.computeBoundingSphere();r.seatGeometry=g;}
    foot.geometry=sitting?r.seatGeometry:r.standingGeometry;
   }
   if(pose&&r.footRest&&!sitting){const p=r.feet[0].geometry.attributes.position,walking=['walking','goingHome'].includes(r.currentState);for(let i=0;i<p.count;i++){const k=i*3,sign=r.footRest[k]<0?-1:1,swing=walking?Math.sin((r.walkPhase??time*4)+sign*Math.PI/2):0;p.array[k]=r.footRest[k];p.array[k+1]=r.footRest[k+1]+Math.max(0,swing)*.045;p.array[k+2]=r.footRest[k+2]+swing*.10;}p.needsUpdate=true;}
   if(pose){const breath=Math.sin(time*.85+v.phase),look=Math.sin(time*.31+v.phase),weight=(v.seed-.5)*.045;
    body.rotation.z=r.baseBody.z+weight+breath*.008*quiet;body.rotation.x=r.baseBody.x+(role.posture==='working'?.035:role.posture==='thoughtful'?.015:-.009)+Math.sin(time*.63+v.phase)*.006*quiet;
    head.rotation.y=r.baseHead.y+look*.16*quiet;head.rotation.x=r.baseHead.x+(role.activity==='reading'||role.activity==='measuring'?.055:0)+breath*.025*quiet;
   }
   if(pose){arms.forEach((arm,i)=>{const sign=i?1:-1;arm.rotation.z=(role.prop&&r.prop.visible?-sign*.21:sign*.10)+Math.sin(time*.7+v.phase+i)*.012*quiet;if(role.prop&&r.prop.visible)arm.rotation.x=-1.04+Math.sin(time*.57+v.phase)*.035*quiet;else if(!r.moving)arm.rotation.x=Math.sin(time*.61+v.phase+i)*.04*quiet;});
   if(r.diverse&&!r.prop.visible&&!['walking','goingHome'].includes(r.currentState)){if(r.appearance.stance==='behind')arms.forEach(a=>a.rotation.x=.3);if(r.appearance.stance==='folded')arms.forEach((a,i)=>{a.rotation.x=-.7;a.rotation.z=i?.4:-.4;});if(r.appearance.stance==='leaning')body.rotation.z+=.035;}
   const action=o.userData.shopWork?.currentState==='walking'?'walking':r.activity??role.activity,swing=Math.sin(time*1.2+v.phase)*quiet;
   if(sitting){arms.forEach(a=>a.rotation.x=-.40);head.rotation.x=r.baseHead.x+.055;}
   else if(action==='reading'||action==='measuring'){head.rotation.x=r.baseHead.x+.16;arms.forEach((a,i)=>a.rotation.x=-.98+Math.sin(time*.6+v.phase+i)*.045);r.prop.rotation.x=.20+swing*.025;}
   else if(action==='bread'){arms.forEach((a,i)=>a.rotation.x=-.88+Math.sin(time*.8+v.phase+i)*.08);head.rotation.x=r.baseHead.x+.12;}
   else if(action==='resting'){arms.forEach(a=>a.rotation.x=-.12);head.rotation.y=r.baseHead.y+Math.sin(time*.31+v.phase)*.10;}
   else if(action==='sweeping'){arms.forEach((a,i)=>{a.rotation.x=-.65+swing*.16;a.rotation.z=i?.12:-.24;});r.prop.rotation.x=swing*.13;}
   else if(action==='rope'){arms.forEach((a,i)=>a.rotation.x=-.92+Math.sin(time*.8+v.phase+i)*.13*quiet);}
   else if(action==='conversation'&&!r.moving){arms[0].rotation.x=-.25+Math.max(0,swing)*.18;head.rotation.y=r.baseHead.y+.25+Math.sin(time*.4+v.phase)*.08;}
   else if(action==='browsing'||action==='well'){head.rotation.x=r.baseHead.x+.10+breathValue(time,v.phase)*quiet;}
   r.prop.rotation.z=Math.sin(time*.57+v.phase)*.025*quiet;}
   o.updateWorldMatrix(true,true);
   o.getWorldPosition(sphere.center);sphere.center.y+=.85;if(!camera||frustum.intersectsSphere(sphere))active.add(o);
  }
  // The shop system hides outdoor roots; the shared batch must still show the
  // currently visible indoor actors. Compact only visible, in-view people into
  // each draw so close-up/mobile views do not submit the whole town's details.
  root.visible=true;for(const {mesh,list}of batches){let count=0;for(const p of list)if(active.has(p.owner)&&visible(p.node)){mesh.setMatrixAt(count,p.node.matrixWorld);mesh.setColorAt(count,p.color);count++;}mesh.count=count;mesh.visible=count>0;mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;}
 }
 update(0,{force:true});
 return {root,records,update,setPeriod(value){period=value;},setEnvironment(value,area=getArea){weather=value;getArea=area;},stats:{residents:records.length,standing:records.filter(r=>!r.seated).length,seated:records.filter(r=>r.seated).length,heldProps:records.filter(r=>r.role.prop).length,detailInstances:[...parts.values()].reduce((n,p)=>n+p.length,0),detailBatches:batches.length,contactMeshes:records.filter(r=>!r.seated&&!r.moving).length,addedLights:0,activities:[...new Set(records.map(r=>r.role.activity))]}};
}
