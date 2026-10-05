// One authoritative watercourse. Points describe water SURFACES, not pipe centres.
// A visible spring basin occupies an open pocket below the housing terrace; the leat
// stays on the lower terrace instead of crossing the town on timber stilts.
export const watercourseLayout={
 source:[20,6.0,-16.25],springBasin:{center:[20,6.0,-16.25],radius:[1.3,1.5],lookout:[17.9,6.1,-16.3]},falls:[[20,6.0,-14.64],[20,5.13,-14.64],[20,5.13,-14.15],[20,4.23,-14.15]],stone:[20.61,4.475,-13.62],
 open:[[20,4.23,-13.40],[19.94,4.18,-12.92],[19.90,4.10,-12.15],[20.08,4.02,-11.15],[20,3.97,-10.05],[20,3.95,-8],[20,3.90,6.8],[20,3.88,8.8],[21.05,3.85,11.4],[21.05,3.81,24.4]],
 feed:[[21.05,3.81,24.4],[21.05,3.78,25.3]],
 wheel:[21.05,5.98,27],
 lower:[[21.05,3.78,25.3],[21.05,3.76,28.7],[21.35,3.75,29.3],[21.35,2.12,29.3],[21.35,2.09,32.2],[21.35,1.88,35.60],[21.35,1.88,35.78],[21.35,1.23,35.78]],
 bridges:[{id:'upper',x:20,z:-8.9,water:3.954,width:1.45},{id:'middle',x:21.05,z:17.6,water:3.835,width:1.45},{id:'mill',x:21.05,z:23.15,water:3.814,width:3.4},{id:'quay',x:21.35,z:34.2,water:2.09,width:1.45}],
 timberLength:.9
};

export function createMillrace({THREE,scene,water,wood,stone,iron,box}){
 const root=new THREE.Group();root.name='Spring, open town leat and working millrace';scene.add(root);
 const waterParts=[],drops=[],sections=[],flecks=[],bridges=[];
 const dry=new THREE.MeshStandardMaterial({color:0x9c9f8e,roughness:1}),wet=new THREE.MeshStandardMaterial({color:0x79867c,roughness:1});
 dry.userData.storybookKind=wet.userData.storybookKind='stone';
 const timber=wood.clone();timber.color.lerp(new THREE.Color(0x52645a),.13);timber.userData.storybookKind='wood';
 const moss=new THREE.MeshStandardMaterial({color:0x596850,roughness:1}),foam=new THREE.MeshStandardMaterial({color:0x819b94,roughness:1});
 const slab=(x,y,z,w,h,d,ma,parent=root)=>{const o=box(x,y,z,w,h,d,ma,parent);o.castShadow=false;return o;};
 function flow(x,y,z,w,h,d,role){const o=slab(x,y,z,w,h,d,water);if(role==='spring-fall'){const positions=o.geometry.attributes.position;for(let i=0;i<positions.count;i++){const top=positions.getY(i)>0;positions.setX(i,positions.getX(i)*(top?.82:1));}positions.needsUpdate=true;o.geometry.computeVertexNormals();}o.name='Water '+role;o.userData.waterRole=role;waterParts.push(o);return o;}
 // Visible spring pool in a cleared rock pocket, not water emitted by a wall.
 const basin=watercourseLayout.springBasin;
 const support=new THREE.Mesh(new THREE.CylinderGeometry(1,1.18,2.4,12),wet);
 support.position.set(20,4.7,-16.25);support.scale.set(1.46,1,1.66);support.castShadow=false;root.add(support);
 const sourcePool=new THREE.Mesh(new THREE.CylinderGeometry(1,1,.10,12),water);
 sourcePool.position.set(20,5.95,-16.25);sourcePool.scale.set(...[basin.radius[0],1,basin.radius[1]]);sourcePool.name='Visible spring basin';sourcePool.userData.waterRole='spring-pool';root.add(sourcePool);waterParts.push(sourcePool);
 // An open outlet tongue lets the pond surface feed the first drop visibly.
 flow(20,5.90,-14.85,.47,.10,.42,'spring-step');
 // Eight low rises lead to a dry bank, with no changes to main streets.
 for(let i=0;i<8;i++){const top=3.5+(i+1)*.325,step=slab(17.9,3.5,-13.75-i*.30,.76,top-3.5,.30,dry);step.userData.walkSurface=true;step.name='Spring bank stair';}
 const lookout=slab(17.9,5.95,-16.3,.88,.15,.84,dry);lookout.userData.walkSurface=true;lookout.name='Dry spring lookout';
 // Keep the front bank open at the outlet; stones follow the rounded pond.
 for(let i=0;i<9;i++){const a=(i+1)*Math.PI*2/10;if(Math.cos(a)>.8)continue;bankRock(20+Math.sin(a)*1.37,6.02,-16.25+Math.cos(a)*1.54,.32,.26,.35,i%3?wet:dry);}
 // Two low stone shelves continue the existing falls below the visible pond.
 function bankRock(x,y,z,w,h,d,material=wet){const o=new THREE.Mesh(new THREE.DodecahedronGeometry(1,0),material);o.position.set(x,y,z);o.scale.set(w/2,h/2,d/2);o.castShadow=false;o.receiveShadow=true;root.add(o);return o;}
 bankRock(20,4.72,-14.92,1.18,2.48,.38);
 bankRock(20,4.46,-14.44,1.12,1.88,.40);
 const pond=flow(20,4.13,-13.91,1.03,.10,1.02,'spring-pool');
 slab(20,3.5,-13.91,1.13,.63,1.02,wet);
 for(const side of [-1,1]){
  bankRock(20+side*.55,4.22,-13.93,.22,.36,1.05,dry);
  bankRock(20+side*.48,5.16,-14.46,.26,.32,.65,wet);
  bankRock(20+side*.35,5.92,-14.88,.30,.30,.42,wet);
 }
 slab(20,5.87,-14.77,.54,.13,.29,wet);
 flow(20,5.92,-14.75,.43,.08,.24,'spring-step');
 let spring;
 for(let i=1;i<watercourseLayout.falls.length;i++){
  const a=watercourseLayout.falls[i-1],b=watercourseLayout.falls[i];
  if(a[1]>b[1]){const o=flow(a[0],b[1],a[2],i===1?.32:.44,a[1]-b[1],.055,'spring-fall');drops.push(o);spring??=o;for(const side of [-1,0,1])flecks.push({a:new THREE.Vector3(...a),b:new THREE.Vector3(...b),width:.32,offset:.3+side*.23,side:side*.075});}
  else flow(20,a[1]-.10,(a[2]+b[2])/2,.47,.10,Math.abs(b[2]-a[2])+.06,'spring-step');
 }
 // The receiving shallows continue into the first curved reach without a gap.
 flow(20,4.13,-13.50,.62,.10,.28,'spring-pool');
 for(const [x,y,z]of [[19.53,4.42,-14.15],[20.48,5.26,-14.49],[19.60,6.10,-14.80]]){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(.10,0),moss);o.position.set(x,y,z);o.userData.walkSoft=true;root.add(o);}
 function channel(a,b,{width=.58,material=dry,role='open',depth=.50,natural=false}={}){
  a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const delta=b.clone().sub(a),length=delta.length();
  if(Math.hypot(delta.x,delta.z)<.001){const o=flow(a.x,b.y,a.z,width,a.y-b.y,.045,role+'-fall');drops.push(o);flecks.push({a:a.clone(),b:b.clone(),width,offset:.2});return;}
  const group=new THREE.Group();group.name='Open leat '+role;group.position.copy(a).add(b).multiplyScalar(.5);group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.clone().normalize());root.add(group);sections.push(group);
  const part=(x,y,w,h,ma)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,length+.025),ma);o.position.set(x,y,0);o.receiveShadow=true;group.add(o);return o;};
  part(0,-.10-depth/2,width+.26,depth,wet);
  if(!natural)for(const x of [-width/2-.065,width/2+.065])part(x,.015,.13,.31,material);
  else for(const side of [-1,1]){const o=part(side*(width/2+.07),-.045,.16,.19,material);o.rotation.y=side*.035;}
  const surface=part(0,-.05,width,.10,water);surface.name='Water '+role;surface.userData.waterRole=role;waterParts.push(surface);
  for(let j=0;j<Math.max(1,Math.ceil(length/2.4));j++)flecks.push({a:a.clone(),b:b.clone(),width,offset:j*2.4});
 }
 const open=watercourseLayout.open;for(let i=1;i<open.length;i++)channel(open[i-1],open[i],i<6?{width:i===1?.62:i===3?.66:.56,natural:true,role:'shallow-stream',depth:.38}:{});
 // A low foundation under the two short stepped spill stones, not a viaduct.
 // The stream bed replaces the previous rectangular spill-stone foundation.
 channel(...watercourseLayout.feed,{width:.74,material:timber,role:'short-timber-feed',depth:.26});
 const lower=watercourseLayout.lower;for(let i=1;i<lower.length;i++)channel(lower[i-1],lower[i],{width:.82,role:i===1?'wheel-pool':'tailrace'});
 // Support the terrace-to-quay cascade on the existing face rather than air.
 slab(21.35,1.2,29.34,1.08,2.34,.38,wet);
 for(const x of [20.87,21.83])slab(x,1.2,29.34,.13,2.66,.43,dry);
 for(const spec of watercourseLayout.bridges){
  const deckTop=spec.water+.24,ground=spec.id==='quay'?1.38:3.5,span=2.12;
  const deck=slab(spec.x,deckTop-.08,spec.z,span,.08,spec.width,timber);deck.name='Leat footbridge '+spec.id;deck.userData.walkSurface=true;
  const steps=spec.id==='quay'?3:2,approachTop=ground+(deckTop-ground)*(steps-1)/steps;
  for(const side of [-1,1]){const landing=slab(spec.x+side*1.23,ground,spec.z,.42,approachTop-ground,spec.width,dry);landing.userData.walkSurface=true;landing.name='Bridge approach '+spec.id;}
  if(steps===3)for(const side of [-1,1]){const landing=slab(spec.x+side*1.64,ground,spec.z,.42,(deckTop-ground)/3,spec.width,dry);landing.userData.walkSurface=true;landing.name='Quay outer bridge step';}
  // Low edge boards avoid shoulder-high rails across existing diagonal routes.
  for(const side of [-1,1]){const edge=slab(spec.x,deckTop,spec.z+side*(spec.width/2-.025),span,.035,.05,timber);edge.userData.walkSoft=true;}
  bridges.push({...spec,deck,deckTop,approachTop,approaches:[spec.x-1.4,spec.x+1.4]});
 }
 // Shared opaque stream marks: one draw, no particles or second water shader.
 const geometry=new THREE.BoxGeometry(.045,.008,.18),marks=new THREE.InstancedMesh(geometry,foam,flecks.length),matrix=new THREE.Matrix4(),scale=new THREE.Vector3(1,1,1);marks.frustumCulled=false;marks.userData.walkSoft=true;marks.name='Quiet downstream flow marks';root.add(marks);
 const position=new THREE.Vector3();for(const f of flecks){f.length=f.a.distanceTo(f.b);f.rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,0,1),f.b.clone().sub(f.a).normalize());}
 function update(t){flecks.forEach((f,i)=>{const u=((f.offset+t*.42)%f.length)/f.length;position.copy(f.a).lerp(f.b,u);position.y+=.009;if(f.side)position.x+=f.side;matrix.compose(position,f.rotation,scale);marks.setMatrixAt(i,matrix);});marks.instanceMatrix.needsUpdate=true;}
 update(0);marks.computeBoundingBox();marks.computeBoundingSphere();
 const points=[watercourseLayout.source,...watercourseLayout.falls,...open,...watercourseLayout.feed.slice(1),...lower.slice(1)].map(p=>new THREE.Vector3(...p));
 const upstream={group:root,points:open.map(p=>new THREE.Vector3(...p)),sections,pond,sourcePool,spring,stonePoint:new THREE.Vector3(...watercourseLayout.stone),update:()=>{}};
 return{root,waterParts,drops,update,upstream,points,bridges,materials:{dry,wet,timber,moss},layout:watercourseLayout,stats:{timberLength:.9,smallSpringDrop:1.77,springStages:2,bridges:bridges.length,flowMarks:flecks.length,addedLights:0}};
}
