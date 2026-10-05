// One authoritative watercourse. Points describe water SURFACES, not pipe centres.
// The spring emerges from the existing upper-terrace rock face; the open leat
// stays on the lower terrace instead of crossing the town on timber stilts.
export const watercourseLayout={
 source:[20,4.86,-14.48],stone:[20.61,4.475,-13.62],
 open:[[20,4.23,-13.40],[20,4.23,-13.02],[20,4.04,-13.02],[20,4.04,-12.60],[20,3.97,-12.60],[20,3.95,-8],[20,3.90,6.8],[20,3.88,8.8],[21.05,3.85,11.4],[21.05,3.81,24.4]],
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
 function flow(x,y,z,w,h,d,role){const o=slab(x,y,z,w,h,d,water);o.name='Water '+role;o.userData.waterRole=role;waterParts.push(o);return o;}
 // Small spring pool backed by the existing cliff, with an actual 63cm drop.
 slab(20,3.5,-14.05,1.36,.63,1.44,wet);
 const pond=flow(20,4.13,-14.05,1.10,.10,1.30,'spring-pool');
 for(const x of [19.39,20.61])slab(x,4.08,-14.05,.12,.31,1.44,dry);
 slab(20,4.08,-14.73,1.36,.31,.12,dry);
 for(const x of [19.53,20.47])slab(x,4.08,-13.39,.40,.31,.12,dry);
 const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.48,0),wet);rock.position.set(20,4.87,-14.88);rock.scale.set(1.08,.95,.76);rock.castShadow=false;root.add(rock);
 const spring=flow(20,4.23,-14.48,.27,.63,.045,'spring-fall');drops.push(spring);
 for(const [x,y,z]of [[19.66,4.58,-14.65],[20.35,4.51,-14.63]]){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(.13,0),moss);o.position.set(x,y,z);o.userData.walkSoft=true;root.add(o);}
 function channel(a,b,{width=.58,material=dry,role='open',depth=.50}={}){
  a=new THREE.Vector3(...a);b=new THREE.Vector3(...b);const delta=b.clone().sub(a),length=delta.length();
  if(Math.hypot(delta.x,delta.z)<.001){const o=flow(a.x,b.y,a.z,width,a.y-b.y,.045,role+'-fall');drops.push(o);flecks.push({a:a.clone(),b:b.clone(),width,offset:.2});return;}
  const group=new THREE.Group();group.name='Open leat '+role;group.position.copy(a).add(b).multiplyScalar(.5);group.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),delta.clone().normalize());root.add(group);sections.push(group);
  const part=(x,y,w,h,ma)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,length+.025),ma);o.position.set(x,y,0);o.receiveShadow=true;group.add(o);return o;};
  part(0,-.10-depth/2,width+.26,depth,wet);
  for(const x of [-width/2-.065,width/2+.065])part(x,.015,.13,.31,material);
  const surface=part(0,-.05,width,.10,water);surface.name='Water '+role;surface.userData.waterRole=role;waterParts.push(surface);
  for(let j=0;j<Math.max(1,Math.ceil(length/2.4));j++)flecks.push({a:a.clone(),b:b.clone(),width,offset:j*2.4});
 }
 const open=watercourseLayout.open;for(let i=1;i<open.length;i++)channel(open[i-1],open[i]);
 // A low foundation under the two short stepped spill stones, not a viaduct.
 slab(20,3.5,-13.02,.85,.26,.48,wet);
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
 function update(t){flecks.forEach((f,i)=>{const u=((f.offset+t*.42)%f.length)/f.length;position.copy(f.a).lerp(f.b,u);position.y+=.009;matrix.compose(position,f.rotation,scale);marks.setMatrixAt(i,matrix);});marks.instanceMatrix.needsUpdate=true;}
 update(0);marks.computeBoundingBox();marks.computeBoundingSphere();
 const points=[watercourseLayout.source,[20,4.23,-14.48],...open,...watercourseLayout.feed.slice(1),...lower.slice(1)].map(p=>new THREE.Vector3(...p));
 const upstream={group:root,points:open.map(p=>new THREE.Vector3(...p)),sections,pond,spring,stonePoint:new THREE.Vector3(...watercourseLayout.stone),update:()=>{}};
 return{root,waterParts,drops,update,upstream,points,bridges,materials:{dry,wet,timber,moss},layout:watercourseLayout,stats:{timberLength:.9,smallSpringDrop:.63,bridges:bridges.length,flowMarks:flecks.length,addedLights:0}};
}
