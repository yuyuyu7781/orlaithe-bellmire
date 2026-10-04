// Small, lazy rooms share the town's renderer and walking profiles. Furniture
// defines visible collision; unopened rooms have no meshes or animation work.
export function buildInterior({THREE,shop}){
 const root=new THREE.Group();root.name=shop.name+' 室内';root.position.set(200,0,0);
 const supports=[],workstations=[],obstacles=[],inspect=[],catRoutes=[],materials={};
 const material=(key,color,emissive=0)=>materials[key]??=new THREE.MeshStandardMaterial({color,roughness:1,emissive,emissiveIntensity:emissive?.5:0});
 const wall=material('wall',shop.palette.wall),wood=material('wood',shop.palette.wood),dark=material('dark',0x45423b),linen=material('linen',0xc7b796),accent=material('accent',shop.palette.accent),paper=material('paper',0xd0c5a7),brass=material('brass',0xa58b54),glow=material('glow',0xeac38c,0xffbd75),stone=material('stone',0x8c8473);
 function mesh(geometry,m,p,solid=true){const o=new THREE.Mesh(geometry,m);o.position.fromArray(p);root.add(o);o.receiveShadow=false;o.castShadow=false;if(solid)obstacles.push({object:o,bounds:new THREE.Box3(),isFloor:false});return o;}
 const box=(x,y,z,w,h,d,m,solid=true)=>mesh(new THREE.BoxGeometry(w,h,d),m,[x,y+h/2,z],solid);
 const cylinder=(x,y,z,r,h,m,solid=true)=>mesh(new THREE.CylinderGeometry(r,r,h,8),m,[x,y+h/2,z],solid);
 function lamp(x,y,z){box(x,y,z,.12,.08,.12,dark,false);box(x,y+.08,z,.17,.25,.17,glow,false);box(x,y+.33,z,.23,.06,.23,wood,false);}
 function table(x,z,w=1.35,d=.75,h=.83){for(const dx of [-w/2+.09,w/2-.09])for(const dz of [-d/2+.09,d/2-.09])box(x+dx,0,z+dz,.09,h,.09,wood);return box(x,h,z,w,.10,d,wood);}
 function shelf(x,z,books=false){box(x,0,z,1.65,2.25,.48,wood);for(let j=0;j<3;j++){box(x,.42+j*.62,z+.26,1.52,.08,.12,linen,false);for(let k=0;k<5;k++)if(books){box(x-.58+k*.28,.5+j*.62,z+.29,.17,.34+.05*(k%2),.10,k%2?accent:paper,false);}else{cylinder(x-.56+k*.28,.50+j*.62,z+.28,.09,.12,linen,false);}}}
 function stack(x,z){box(x,0,z,.65,.60,.55,wood);box(x,.61,z,.48,.31,.40,linen);}
 function barrel(x,z){cylinder(x,0,z,.30,.65,wood);for(const y of [.12,.48])cylinder(x,y,z,.31,.025,dark,false);}
 function notice(id,label,text,point,object){inspect.push({id:'inside:'+shop.id+':'+id,kind:'inspect',label,text,object:object??root,localPoint:point,localPoints:{cat:point},profiles:['human','cat'],range:2.5,enabled:()=>root.visible});}
 // Floor and closed wall boundaries remain visible; the front has an actual door.
 box(0,-.16,0,7,.16,8.8,wood,false);
 for(let row=0;row<11;row++)box(0,.002,-4+row*.8,6.8,.008,.025,dark,false);
 box(-3.5,0,0,.16,3.1,8.8,wall);box(3.5,0,0,.16,3.1,8.8,wall);box(0,0,-4.4,7.1,3.1,.16,wall);
 box(-2.25,0,4.4,2.5,3.1,.16,wall);box(2.25,0,4.4,2.5,3.1,.16,wall);box(0,2.35,4.4,2, .75,.16,wall);
 const ceiling=shop.id==='inn'?6.40:3.10;box(0,ceiling,0,7.1,.12,8.8,wood,false);for(const x of [-2.8,0,2.8])box(x,ceiling-.16,0,.13,.16,8.8,dark,false);
 const door=box(0,0,4.36,1.42,2.30,.08,wood);door.name='外へ出る扉';lamp(-.95,1.8,4.2);
 const ambient=new THREE.AmbientLight(0xffe4bd,.95);root.add(ambient);
 // A small recessed window and timber framing break up the quiet side wall.
 box(-3.405,1.16,-.9,.028,.88,.66,glow,false);for(const z of [-1.26,-.9,-.54])box(-3.38,1.12,z,.055,.99,.045,wood,false);for(const y of [1.12,1.58,2.08])box(-3.38,y,-.9,.06,.045,.78,wood,false);
 const npcPosition=[1.7,0,-2.7];
 if(shop.id==='bakery'){
  npcPosition.splice(0,3,1.3,0,-2.6);
  box(1.9,0,-1.1,2.35,.90,.65,wood);shelf(-2.3,-4,false);shelf(.05,-4,false);
  box(2.6,0,-3.55,1.25,1.48,1.05,stone);box(2.6,.28,-2.99,.64,.62,.06,dark,false);box(2.6,.34,-2.94,.46,.17,.025,glow,false);
  for(const x of [-2.86,-2.30,-1.74]){const loaf=mesh(new THREE.SphereGeometry(.12,7,4),material('bread',0xbc935b),[x,.66,-3.65],false);loaf.scale.set(1.0,.65,1.5);}
  stack(-2.95,-1.9);cylinder(-2.7,0,-2.7,.27,.60,linen);lamp(1.9,.90,-1.1);
  notice('oven','パン窯','石には朝の熱が残っている。窯の脇の籠は、次の焼き上がりを待っている。',[2.6,.7,-2.9]);
 }else if(shop.id==='bookshop'){
  shelf(-2.5,-4,true);shelf(-.4,-4,true);shelf(1.7,-4,true);shelf(-2.5,-2.5,true);
  table(2.35,-1.9,1.15,.8);lamp(2.35,.93,-1.9);for(let i=0;i<4;i++)box(2.15,.94+i*.035,-1.8,.32,.03,.26,i%2?paper:accent,false);
  notice('ledger','机の紙束','紙の端には、何人もの指の跡がある。書きかけの頁は閉じずに置かれている。',[2.3,1,-1.8]);
 }else if(shop.id==='inn'){
  box(1.8,0,-2.3,2.5,.96,.70,wood);lamp(1.8,.96,-2.3);stack(-2.8,-3.6);stack(-2,-3.6);
  table(.1,.7);box(2.6,0,1.1,.65,.45,1.7,wood);
  // Sixteen real 20cm treads, with a hole in the upper deck above them.
  for(let i=0;i<16;i++)floor(-2.62,.20*(i+1),2.0-i*.35,1.25,.35);
  floor(-2.3,3.2,-3.8,2.2,1.05);floor(.76,3.2,0,5.25,8.6);
  for(const x of [-3.5,3.5])box(x,3.2,0,.16,3.2,8.8,wall);
  for(const z of [-4.4,4.4])box(0,3.2,z,7.1,3.2,.16,wall);
  // Corridor and two small bedrooms; each side doorway has a 1.1m opening.
  box(1.7,3.2,0,3.4,2.85,.12,wall);
  for(const z of [-3.65,-.7,.7,3.65])box(-.1,3.2,z,.12,2.85,1.0,wall);
  for(const z of [-2,2]){box(2.25,3.2,z,1.2,.42,1.8,wood);box(2.25,3.62,z,1.1,.12,1.7,linen,false);box(2.25,3.75,z-.6,.7,.13,.35,paper,false);for(const dx of [-.20,.20])for(const dz of [-.20,.20])box(.8+dx,3.2,z+dz,.06,.75,.06,wood);box(.8,3.95,z,.55,.08,.55,wood);box(3.40,4.15,z,.025,1,.70,glow,false);box(1.0,3.2,z+1.05,.60,.35,.45,wood);}
  notice('upstairs','宿の客室','荷物置きには、旅人が結び直した紐が残っている。窓の下では港の音が少し遠い。',[-1,4.0,-1]);

  notice('guestbook','宿帳','名前の横に、小さな円を添える旅人がいる。受付の灯りは、遅い到着にも残されている。',[1.8,1.05,-2.3]);
 }else if(shop.id==='tavern'){
  box(0,0,-2.7,4.8,1,.72,wood);barrel(-2.6,-3.7);barrel(2.5,-3.7);table(-2,0,1.2,.75);table(2,.5,1.2,.75);
  for(const x of [-2,2])box(x,0,1.35,1.25,.43,.36,wood);lamp(0,1,-2.7);lamp(-2,.93,0);lamp(2,.93,.5);
  npcPosition.splice(0,3,1.1,0,-1.6);
  notice('bar','酒場の木札','港から戻った人が、札を裏返していく。小さな傷の多い札ほど、手に馴染んでいる。',[0,1,-2.7]);
 }else{
  npcPosition.splice(0,3,1.7,0,-2.95);
  shelf(-2.4,-4,false);table(1.9,-2,1.45,.9);table(-2.3,1,1.0,.70);lamp(2.3,.93,-2);
  box(-2.3,.95,1,.52,.008,.38,paper,false);box(1.6,.95,-2,.38,.015,.27,paper,false);
  cylinder(-2.3,1,1,.11,.30,brass,false);
  for(const angle of [0,Math.PI/2,Math.PI/3]){const ring=mesh(new THREE.TorusGeometry(.34,.022,5,16),brass,[1.9,1.3,-2],false);ring.rotation.set(Math.PI/2,angle,angle/2);}
  cylinder(1.9,.93,-2,.20,.05,brass,false);notice('starwheel','小型天球儀','真鍮の円には、何度も直した跡がある。星の位置より、道具の癖を先に覚えるらしい。',[1.9,1.25,-2]);
 }
 if(['bakery','bookshop'].includes(shop.id)){
  const x=-1.35,z=.10;table(x,z,1.4,.80,.70);
  box(x,.81,z,.5,.14,.38,shop.id==='bakery'?linen:accent,false);
  catRoutes.push({id:shop.id+'-under-table',label:shop.id==='bakery'?'小麦袋脇の作業台下':'古書店の低い机の下',center:[200+x,0,z],start:[200+x,0,z-1],end:[200+x,0,z+1],clearance:.70});
 }
 // Quiet back-room details reuse materials, without changing the entry route.
 if(shop.id==='bakery'){box(0,1.9,-2.9,1.2,.06,.05,wood,false);box(-.85,0,-2.9,.08,2.1,.08,wood);box(-.85,1.6,-2.9,.40,.35,.04,linen,false);workstations.push([1.3,0,-2.6],[1.05,0,-1.95]);}
 if(shop.id==='bookshop'){box(-.9,0,-3.1,.10,1.95,.15,wood);box(-.9,1.85,-3.1,.12,.08,1.0,wood,false);workstations.push([1.7,0,-2.7],[1.25,0,-2.65],[1.4,0,-1.2]);}
 if(shop.id==='tavern'){box(0,1.05,-3.7,1.2,.30,.12,paper,false);box(-1,1.05,-3.7,.25,.18,.25,linen,false);workstations.push([1.1,0,-1.6],[.6,0,-1.4]);}
 if(shop.id==='orrery'){box(.0,0,-4.05,.65,1.3,.18,wood);box(0,1.4,-4.08,.48,.62,.025,paper,false);workstations.push([1.7,0,-2.95],[.65,0,-2.65],[.45,0,-1.1]);}
 root.updateMatrixWorld(true);for(const o of obstacles)o.bounds.setFromObject(o.object,true);
 const bounds=new THREE.Box3(new THREE.Vector3(196.58,0,-4.32),new THREE.Vector3(203.42,0,4.32));
 const policy={id:shop.id,spawn:new THREE.Vector3(200,0,2.7),obstacles,groundAt(x,z,currentY=0,profile={stepUp:.38}){if(x<bounds.min.x||x>bounds.max.x||z<bounds.min.z||z>bounds.max.z)return null;let y=0;for(const o of supports){const b=obstacles.find(q=>q.object===o).bounds;if(x>=b.min.x-.001&&x<=b.max.x+.001&&z>=b.min.z-.001&&z<=b.max.z+.001&&b.max.y<=currentY+profile.stepUp+.001)y=Math.max(y,b.max.y);}return y;}};
 return {root,policy,door,inspect,catRoutes,npcPosition,workstations,ambient,materials,shop,exit:[200,0,3.05],stats:{meshes:root.children.filter(o=>o.isMesh).length,obstacles:obstacles.length}};
}
