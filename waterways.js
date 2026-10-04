export function createMillrace({THREE,scene,water,wood,stone,iron,box}){
  const root=new THREE.Group();root.name='Millrace and gravity-fed sluice';scene.add(root);
  const waterParts=[],drops=[];
  const slab=(x,y,z,w,h,d,ma)=>box(x,y,z,w,h,d,ma,root);
  function flow(x,y,z,w,h,d){const o=slab(x,y,z,w,h,d,water);waterParts.push(o);return o;}
  // The old canal lay below the terrace. An exposed millrace at the side of the
  // existing mill carries water into the lower paddles, then a short tailrace
  // exits at the quay edge into the harbor. No terrain or houses are cut away.
  slab(21.05,3.5,28.2,1.15,1.82,7.8,stone);
  flow(21.05,5.32,28.2,.88,.09,7.8);
  for(const x of [20.52,21.58])slab(x,5.32,28.2,.14,.32,7.8,stone);
  slab(21.05,6.05,22.95,1.0,.14,2.9,wood);
  // This water is contained in an overhead trough; its solid underside provides
  // head clearance, and it is not a water hazard on the walking floor below.
  flow(21.05,6.19,22.95,.72,.07,2.9).userData.walkSoft=true;
  for(const x of [20.59,21.51])slab(x,6.05,22.95,.10,.40,2.9,wood);
  for(const z of [21.75,23.5]){for(const x of [20.63,21.47])slab(x,3.5,z,.09,2.55,.09,iron);}
  const drop=flow(21.05,5.40,24.44,.72,.86,.09);drops.push(drop);
  // A little header and timber gate make the stream's direction legible.
  // A masonry header receives the visible upper-terrace supply rather than
  // leaving the upstream end of the timber trough suspended in empty space.
  slab(21.05,3.5,21.0,1.30,2.69,1.15,stone);
  for(const x of [20.43,21.67])slab(x,6.19,21.0,.12,.34,1.3,stone);
  for(const x of [20.48,21.62])slab(x,6.19,20.40,.14,.42,.12,stone);
  flow(21.05,6.19,21.0,1.06,.07,1.10).userData.walkSoft=true;
  slab(21.05,6.70,20.48,1.20,.045,.055,iron);
  slab(21.05,6.01,21.45,1.2,.12,.20,wood);slab(21.05,6.15,23.8,1.08,.08,.08,iron);
  slab(21.05,5.43,31.7,1.2,.18,1.25,stone);
  // A short descending wooden tailrace reaches the existing quay edge.
  // Its solid trough lets pedestrians pass under the high end; the low end
  // stays beside the water, away from the main quay promenade.
  const chute=new THREE.Group();root.add(chute);
  const fall=5.41-2.06,run=35.42-32.1,length=Math.hypot(fall,run);
  chute.position.set(21.05,(5.41+2.06)/2,(32.1+35.42)/2);chute.rotation.x=Math.atan2(fall,run);
  const part=(x,y,w,h,ma)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,length),ma);o.position.set(x,y,0);o.castShadow=o.receiveShadow=true;chute.add(o);return o;};
  part(0,-.08,.98,.10,wood);for(const x of [-.44,.44])part(x,.075,.10,.30,wood);
  const tailWater=part(0,0,.72,.06,water);tailWater.userData.walkSoft=true;waterParts.push(tailWater);
  for(const x of [20.57,21.53])slab(x,1,35.50,.16,1.18,.35,stone);
  slab(21.05,2.18,35.50,1.12,.18,.35,stone);
  slab(21.05,1.97,35.48,.88,.06,.48,stone);flow(21.05,2.03,35.48,.72,.03,.48);
  const outlet=flow(21.05,1.23,35.72,.72,.83,.085);drops.push(outlet);
  const pool=new THREE.Mesh(new THREE.CylinderGeometry(.50,.50,.018,12),water);pool.position.set(21.05,1.239,35.95);root.add(pool);waterParts.push(pool);
  // Sparse, low-poly flow flecks, animated separately from the rotating wheel.
  const flecks=[],foam=new THREE.MeshStandardMaterial({color:0xa5b5ac,roughness:.85});
  const ripple=new THREE.Mesh(new THREE.TorusGeometry(.26,.012,4,12),foam);ripple.rotation.x=Math.PI/2;ripple.position.set(21.05,1.246,35.89);root.add(ripple);ripple.userData.walkSoft=true;
  for(let i=0;i<10;i++){const o=slab(21.05+(i%3-1)*.17,5.415,25+i*.58,.055,.012,.20,foam);flecks.push(o);o.userData.walkSoft=true;}
  // The existing drop is the delivery point, not a new water source. Two
  // narrow moving highlights connect its lip to the wheel's lower millrace.
  const deliveryFlecks=[];
  for(let i=0;i<2;i++){const o=slab(21.05+(i?-.16:.16),5.50,24.495,.035,.12,.012,foam);o.userData.walkSoft=true;deliveryFlecks.push(o);}
  const impact=new THREE.Mesh(new THREE.TorusGeometry(.20,.012,4,12),foam);impact.rotation.x=Math.PI/2;impact.scale.x=1.4;impact.position.set(21.05,5.425,24.57);impact.userData.walkSoft=true;root.add(impact);
  const upstream=createUpstream({THREE,root,water,wood,stone,iron,box,waterParts});
  function update(t){upstream.update(t);deliveryFlecks.forEach((o,i)=>{o.position.y=6.17-((t*.8+i*.36)%.67);});flecks.forEach((o,i)=>{o.position.z=24.7+((i*.68+t*.7)%6.3);});}
  return {root,waterParts,drops,update,upstream};
}

// The intake follows the open eastern edge and passes below the canal bridge. Its
// narrow piers leave alleys and the future low routes between walls available.
function createUpstream({THREE,root,water,wood,stone,iron,box,waterParts}){
  const group=new THREE.Group();group.name='Upper spring and descending town leat';root.add(group);
  const slab=(x,y,z,w,h,d,ma)=>box(x,y,z,w,h,d,ma,group);
  const points=[[19.66,12.35,-18.4],[21.25,12.35,-18.4],[21.25,12.35,-14.6],[20,6.8,-5],[20,6.65,3],[21.05,6.4,12.5],[21.05,6.26,20.47]].map(p=>new THREE.Vector3(...p));
  // The spring is north of the old timber bridge; the outlet turns around its
  // east end, so neither the pond nor its flow passes through the bridge deck.
  slab(18.8,12.2,-18.5,2,.07,2.4,stone);
  const pond=slab(18.8,12.27,-18.5,1.72,.08,2.2,water);waterParts.push(pond);
  slab(17.84,12.2,-18.5,.12,.37,2.4,stone);
  for(const [z,d]of [[-19.28,.84],[-17.63,.66]])slab(19.76,12.2,z,.12,.37,d,stone);
  for(const z of [-19.64,-17.36])slab(18.8,12.2,z,2,.37,.12,stone);
  const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.72,0),stone);rock.position.set(18.8,12.77,-19.66);rock.scale.set(1.15,.95,.85);group.add(rock);
  const spring=slab(18.8,12.35,-19.08,.24,.60,.055,water);waterParts.push(spring);
  const moss=new THREE.MeshStandardMaterial({color:0x53624d,roughness:1});
  for(const [x,z]of [[18.25,-19.5],[19.25,-19.42]]){const o=new THREE.Mesh(new THREE.IcosahedronGeometry(.18,0),moss);o.position.set(x,12.93,z);group.add(o);o.userData.walkSoft=true;}
  const sections=[],flecks=[];
  for(let i=0;i<points.length-1;i++){
    const a=points[i],b=points[i+1],v=b.clone().sub(a),g=new THREE.Group();g.name='Leat section '+i;g.position.copy(a).add(b).multiplyScalar(.5);g.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),v.clone().normalize());group.add(g);
    const part=(x,y,w,h,ma)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,v.length()+.035),ma);o.position.set(x,y,0);g.add(o);o.castShadow=o.receiveShadow=true;return o;};
    part(0,-.12,.98,.12,i<2?stone:wood);for(const x of [-.46,.46])part(x,.015,.12,.28,i<2?stone:wood);
    const flow=part(0,-.03,.74,.06,water);flow.userData.walkSoft=true;waterParts.push(flow);sections.push(g);
    for(let j=0;j<Math.ceil(v.length()/2);j++){const o=new THREE.Mesh(new THREE.BoxGeometry(.045,.009,.16),new THREE.MeshStandardMaterial({color:0x9cafa3,roughness:.9}));o.position.set(j%2?.16:-.16,.007,0);g.add(o);o.userData.walkSoft=true;flecks.push({o,length:v.length(),offset:j*2,section:i});}
  }
  // Legs end on the existing terrace tops and are kept outside the water trough.
  for(const [i,u,ground]of [[2,.4,3.5],[2,.9,3.5],[3,.6,3.5],[4,.3,3.5],[4,.7,3.5],[5,.25,3.5],[5,.65,3.5]]){
    const p=points[i].clone().lerp(points[i+1],u);
    for(const dx of [-.65,.65]){slab(p.x+dx,ground,p.z,.26,p.y-.12-ground,.30,stone);slab(p.x+dx,p.y-.24,p.z,.34,.12,.43,wood);}
    slab(p.x,p.y-.25,p.z,1.65,.10,.30,wood);
  }
  function update(t){for(const f of flecks)f.o.position.z=-f.length/2+((f.offset+t*.65)%f.length);}
  return {group,points,sections,pond,spring,update};
}
