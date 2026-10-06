// Four modest rooms use the shared shop lifecycle, collision, rest and inspection.
export function buildLunmereInterior({THREE,shop}){
 const root=new THREE.Group();root.position.set(200,0,0);root.name=shop.name+' 室内';const obstacles=[],inspect=[],beds=[],workstations=[],seats=[],materials={};
 const mat=(id,color,emissive=0)=>materials[id]=new THREE.MeshStandardMaterial({color,roughness:1,emissive,emissiveIntensity:.3});
 const wall=mat('wall',0xd2d5c7),wood=mat('wood',0x746958),linen=mat('linen',0xc0c5b0),accent=mat('accent',0x798f87),paper=mat('paper',0xd2cbb7),glow=mat('glow',0xe5bd81,0xffb875);glow.userData.blackoutBackup=true;
 const box=(x,y,z,w,h,d,m,solid=true)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y+h/2,z);root.add(o);if(solid)obstacles.push({object:o,bounds:new THREE.Box3(),isFloor:false});return o;};
 box(0,-.12,0,8,.12,10,wood,false);box(-4,0,0,.16,3.1,10,wall);box(4,0,0,.16,3.1,10,wall);box(0,0,-5,8,3.1,.16,wall);for(const x of [-2.55,2.55])box(x,0,5,2.9,3.1,.16,wall);box(0,2.35,5,2.2,.75,.16,wall);box(0,3.12,0,8,.12,10,wood,false);
 const door=box(0,0,4.98,1.4,2.3,.06,wood),ambient=new THREE.AmbientLight(0xe2e8e2,1);root.add(ambient);
 box(-3.89,1.3,1,.02,1.15,2,accent,false);box(-3.82,1.8,1,.05,.05,2.1,wood,false);box(2.6,1.05,-3.9,.16,.28,.16,glow,false);
 const table=(x,z,w=1.4,d=.8)=>{for(const dx of [-w/2+.1,w/2-.1])for(const dz of [-d/2+.1,d/2-.1])box(x+dx,0,z+dz,.09,.76,.09,wood);return box(x,.76,z,w,.09,d,wood);};
 const notice=(id,label,text,o)=>inspect.push({id:'inside:'+shop.id+':'+id,kind:'inspect',label,text,object:o,localPoint:[0,.3,0],profiles:['human','cat'],range:2.6,enabled:()=>root.visible});
 if(shop.type==='lodging'){
  box(2.4,0,1,2,.9,.7,wood);table(-2,1.3);box(-2,0,2.2,1.5,.43,.36,wood);seats.push({position:[-2,0,2.2],yaw:Math.PI});
  // Two small ground-floor guest rooms off a 1.4m corridor; no false upstairs.
  for(const x of [-2.4,2.4]){box(x,0,-1.7,2.7,2.7,.12,wall);const bed=box(x,0,-3.55,1.2,.42,1.9,wood);box(x,.42,-3.55,1.15,.12,1.8,linen,false);box(x,.55,-4.12,.65,.12,.3,paper,false);table(x>0?3.45:-3.45,-2.3,.6,.55);const bag=box(x>0?3.2:-3.2,0,-4.55,.45,.3,.4,wood,false);bag.userData.interiorVariant='guest-bag';beds.push({object:bed,localPoint:[-.3,.5,0],wake:[200+(x>0?1.25:-1.25),0,-3.3],room:'lunmere-'+(x>0?'east':'west')});}
  notice('guestbook','湖畔の宿帳','名前の脇に、到着した時の霧の濃さが小さく書かれている。',box(2.2,.9,1,.4,.025,.3,paper,false));
 }else if(shop.type==='dining'){
  for(const x of [-2,2]){table(x,-.3);box(x,0,.7,1.5,.43,.36,wood);seats.push({position:[x,0,.7],yaw:Math.PI});for(const dx of [-.3,.3]){const cup=box(x+dx,.85,-.3,.12,.15,.12,linen,false);cup.userData.interiorVariant='night-table';}}
  box(1.6,0,-3.9,3.6,.9,.7,wood);notice('meal','湖の食卓','小さな皿には、焼いた魚と乾いた草の香りが残っている。',box(1.3,.9,-3.9,.35,.025,.25,paper,false));
 }else if(shop.type==='workshop'){
  table(2,-2,2,1);if(shop.craftTemplate){const craft=shop.craftTemplate.clone();craft.position.set(-2,.16,0);craft.scale.setScalar(.85);root.add(craft);obstacles.push({object:craft,bounds:new THREE.Box3(),isFloor:false});}for(let i=0;i<3;i++)box(-2.6,0,-3.5+i*.25,.65,.38,.18,wood);box(-2.6,1,-4.7,2.3,.95,.05,linen,false);notice('tools','舟底の道具','刃の先に、濡れた木の削り屑がついている。',box(2,.86,-2,.55,.04,.12,accent,false));
 }else{
  for(const x of [-2.5,0,2.5]){box(x,0,-4.1,1.65,2.1,.5,wood);for(let i=0;i<3;i++)for(let j=0;j<3;j++)box(x-.5+j*.5,.3+i*.56,-3.8,.3,.28,.14,j%2?linen:accent,false);}
  table(2,-1.7);notice('stock','乾物と旅の布','紙包みには、湖の岸で採れた草の名が書かれている。',box(2,.85,-1.7,.5,.12,.35,paper,false));
 }
 workstations.push([1.1,0,-.8],[.45,0,-2.3]);root.updateMatrixWorld(true);for(const o of obstacles)o.bounds.setFromObject(o.object,true);
 const policy={id:shop.id,spawn:new THREE.Vector3(200,0,3.6),obstacles,groundAt(x,z){return x>196.12&&x<203.88&&z>-4.88&&z<4.88?0:null;}};
let meshCount=0;root.traverse(o=>{if(o.isMesh)meshCount++;});
 return {root,policy,door,inspect,beds,seats,workstations,npcPosition:[1.1,0,-.8],catRoutes:[],ambient,materials,shop,exit:[200,0,3.8],stats:{meshes:meshCount,obstacles:obstacles.length}};
}
