// Uses the existing lazy shop/room lifecycle. Only the entered room is rendered.
export function buildCapitalInterior({THREE,shop}){
 const root=new THREE.Group();root.position.set(200,0,0);root.name=shop.name+' 室内';const obstacles=[],inspect=[],beds=[],seats=[],workstations=[],catRoutes=[],materials={};
 const material=(id,color)=>materials[id]=new THREE.MeshStandardMaterial({color,roughness:1});const wall=material('wall',0xc9c5af),wood=material('wood',0x706151),paper=material('paper',0xd9d0b7),stone=material('stone',0x797d75),cloth=material('cloth',0x788685),brass=material('brass',0x928366),glow=material('glow',0xe1ba80);glow.emissive.setHex(0xf8ba73);glow.emissiveIntensity=.25;glow.userData.blackoutBackup=true;
 const archive=['archive','maps'].includes(shop.type),W=archive?18:shop.type==='lodging'?14:10,D=archive?22:shop.type==='lodging'?18:14;
 const box=(x,y,z,w,h,d,m,solid=true,floor=false)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y+h/2,z);root.add(o);if(solid)obstacles.push({object:o,bounds:new THREE.Box3(),isFloor:floor});return o;};
 box(0,-.12,0,W,.12,D,stone,false);box(-W/2,0,0,.16,3.3,D,wall);box(W/2,0,0,.16,3.3,D,wall);box(0,0,-D/2,W,3.3,.16,wall);for(const sign of [-1,1])box(sign*(W/4+.55),0,D/2,W/2-1.1,3.3,.16,wall);box(0,2.4,D/2,2.2,.9,.16,wall);const door=box(0,0,D/2-.02,1.5,2.4,.06,wood,false);box(0,shop.type==='bell'?6.4:3.35,0,W,.12,D,wood,false);
 const ambient=new THREE.AmbientLight(0xe4e6dc,1);root.add(ambient);box(-W/2+.12,1.25,1,.03,1.4,2.4,cloth,false);box(W/2-.3,1.4,-D/2+1,.1,.2,.1,glow,false);
 // Ancient column reused inside later rooms, kept away from the circulation lane.
 box(-W/2+1,0,-2,.6,2.6,.65,stone);box(-W/2+1,2.6,-2,.85,.2,.9,wall);
 const note=(id,label,text,o,profiles=['human','cat'])=>inspect.push({id:'inside:'+shop.id+':'+id,kind:'inspect',label,text,object:o,localPoint:[0,.22,0],range:2.8,profiles,enabled:()=>root.visible});
 const table=(x,z,w=1.6,d=.85)=>{for(const a of [-1,1])for(const b of [-1,1])box(x+a*(w/2-.1),0,z+b*(d/2-.1),.09,.75,.09,wood);return box(x,.75,z,w,.09,d,wood);};
 const shelf=(x,z,number)=>{box(x,0,z,1.6,2.1,.5,wood);for(let i=0;i<3;i++){box(x,.38+i*.56,z+.27,1.5,.08,.5,wood,false);for(let j=0;j<5;j++)if(!(shop.type==='archive'&&number===3&&i===1&&j>0))box(x-.6+j*.28,.46+i*.56,z+.3,.16,.35,.13,(j+number)%3?paper:cloth,false);}return box(x+.3,1.65,z+.56,.25,.18,.02,paper,false);};
 if(shop.type==='lodging'){
  table(-3,3);table(3,2);box(4,0,3,2,.9,.8,wood);for(const x of [-3.2,3.2]){box(x,0,-1.3,4.7,2.5,.12,wall);const bed=box(x,0,-5,1.3,.4,2.1,wood);box(x,.4,-5,1.25,.12,2,cloth,false);beds.push({object:bed,localPoint:[0,.55,0],wake:[200+(x<0?-1.5:1.5),0,-4],room:'caer-'+(x<0?'west':'east')});}seats.push({position:[-3,0,4],yaw:Math.PI});note('guestbook','宿の到着帳','商人、職人、家族を訪ねる人。名前の横には、朝食の人数が書かれている。',box(4,.91,3,.5,.03,.4,paper,false));
 }else if(archive){
  for(const x of [-6,-3.5,3.5,6])for(let k=0;k<3;k++){const n=k+(x>0?3:0),o=shelf(x,-7+k*3,n);note('shelf-'+x+'-'+k,'書架の札','普通の土地記録と家系記録が並ぶ。棚番号の一部だけが飛んでいる。',o);}
  table(-2,3,2.2);table(2,3,2.2);seats.push({position:[-2,0,4],yaw:Math.PI},{position:[2,0,4],yaw:Math.PI});table(0,-9,3,1);
  note('catalog','目録と欠けた束',shop.type==='maps'?'新旧の地図には、同じ場所で消える細い線がある。注記の紙だけが欠けている。':'目録だけが残る年代がある。隣の棚では、家の境界を普通の利用者が確かめている。',box(0,.84,-9,.8,.05,.6,paper,false));
  note('old-number','低い壁の番号','壁の低い刻みは、現在の書架番号と一致しない。',box(-W/2+.15,.25,-6,.05,.15,.45,stone,false),['cat']);
 }else if(shop.type==='bell'){
  // Broad exposed treads, then a small bell level. The policy uses the same rise.
  for(let i=0;i<20;i++)box(2.5,i*.18,-1-i*.24,1.8,.18,.24,stone,true,true);box(2.5,3.6,-5.8,1.8,.16,.24,stone,true,true);box(2.5,3.6,-6.4,2.7,.16,1.2,wood,true,true);if(shop.id!=='cv-old-bell')box(2.5,4.9,-6,.9,1.3,.8,brass,false);note('gap',shop.id==='cv-old-bell'?'残った支柱':'鐘の整備帳',shop.id==='cv-old-bell'?'支柱には金具の跡だけが残る。今日の修繕は、隣の工房で続いている。':'回数ではなく、間隔と響きを記録している。古い軸の比率は、Bellmireに少し似ている。',table(-2,1));note('bell',shop.id==='cv-old-bell'?'空いた鐘の架':'上層の鐘',shop.id==='cv-old-bell'?'梁には吊った跡がある。鐘はここにない。':'新しい金具と、古い比率の軸が一緒に使われている。',box(2.5,3.8,-6,.6,.12,.6,wood,false));inspect.push({id:'inside:'+shop.id+':view',kind:'quiet-view',verb:'眺める',label:'鐘の上層を眺める',text:'古い鐘と、今日も続く街の音。',object:root,localPoint:[2.5,3.8,-6],range:2.5,profiles:['human','cat'],viewEye:[202.5,5.2,-6],viewFocus:[196,1,2],enabled:()=>root.visible});
 }else if(shop.type==='observatory'){
  table(-2,2,2);const base=box(2,0,-3,1.3,.65,1.3,stone);box(2,.65,-3,.2,1.5,.2,brass,false);box(2,1.9,-3,2,.2,.25,wood,false);note('directions','比較中の観測記録','九石、円環、空洞、湿地。点の向きは近くても、全部は重ならない。',box(-2,.84,2,.8,.03,.65,paper,false));note('old-tower','増築前の石','古い塔の石が、新しい観測室の壁に残っている。',base);
 }else if(shop.type==='dining'){
  for(const x of [-2.8,2.8]){table(x,1);box(x,0,2,1.6,.43,.4,wood);seats.push({position:[x,0,2],yaw:Math.PI});for(const a of [-.3,.3]){const cup=box(x+a,.84,1,.14,.14,.14,paper,false);cup.userData.interiorVariant='night-table';}}note('meal','普段の食卓','煮込みとパン。大きな都市でも、夕食の支度は普通に続いている。',box(2.8,.86,1,.4,.025,.35,cloth,false));
 }else if(shop.type==='residential'||shop.type==='cellar'){
  table(-2,1);box(2,0,-4,1.2,.42,2,wood);box(2,.42,-4,1.2,.12,1.9,cloth,false);shelf(-2,-5,1);note('window','昔の高さの窓','窓の下には、今の舗装より古い石がある。台所の布は、今日干したものだ。',box(-4.8,1.2,1,.05,.6,1,cloth,false));
 }else{
  table(-2,1,2);table(2,-3,2);for(const x of [-3,0,3])shelf(x,-5,1);note('ordinary','仕事の帳面','土地、荷物、修繕、通行。普通の仕事の記録が積み重なっている。',box(-2,.84,1,.65,.035,.45,paper,false));if(shop.type==='repair'){for(let i=0;i<4;i++)box(2+i*.28,.84,-3,.18,.16,.23,i%2?stone:brass,false);note('fragment','古材の石片','現代の都市図にない場所から来た石片が、普通の修繕材の間にある。',box(2,.84,-3,.4,.14,.3,stone,false));}if(shop.type==='waterworks'){note('level','水位の点検表','今日の高さと、舟底の余裕。古い水路は、いまも管理に使われる。',box(-2,.84,1,.65,.04,.5,paper,false));}}
 workstations.push([0,0,-1],[1,0,1.2]);root.updateMatrixWorld(true);for(const o of obstacles)o.bounds.setFromObject(o.object,true);
 const policy={id:shop.id,spawn:new THREE.Vector3(200,0,D/2-1.5),obstacles,groundAt(x,z,y=0){const lx=x-200;if(lx<=-W/2+.13||lx>=W/2-.13||z<=-D/2+.13||z>=D/2-.13)return null;if(shop.type==='bell'&&lx>1.6&&lx<3.4&&z<=-1&&z>=-5.92){const i=Math.min(20,Math.floor((-z-1)/.24));const h=i===20?3.76:(i+1)*.18;return h<=y+.39?h:0;}if(shop.type==='bell'&&lx>1.15&&lx<3.85&&z<-5.92&&z>-7.0)return y>3.2?3.76:0;return 0;}};
 let meshes=0;root.traverse(o=>{if(o.isMesh)meshes++;});return{root,policy,door,inspect,beds,seats,catRoutes,workstations,ambient,materials,shop,npcPosition:[0,0,-1],exit:[200,0,D/2-1.3],stats:{meshes,obstacles:obstacles.length}};
}
