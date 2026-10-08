import {researchDocuments,researchCatFinds} from './capital-research-data.js';
export const dedicatedRoomIds=['cv-archive','cv-records','cv-bell','cv-observatory','cv-maps','cv-val','cv-inn','cv-sluice'];
// Shared primitives, deliberately different plans. Static decorations are material batches.
export function buildDedicatedCapitalInterior({THREE,shop}){
 const root=new THREE.Group();root.position.set(200,0,0);root.name=shop.name+' 専用室内';
 const sizes={'cv-archive':[24,30],'cv-records':[18,20],'cv-bell':[10,14],'cv-observatory':[18,22],'cv-maps':[20,24],'cv-val':[16,20],'cv-inn':[18,24],'cv-sluice':[16,20]};
 const[W,D]=sizes[shop.id],obstacles=[],inspect=[],beds=[],seats=[],catRoutes=[],workstations=[],zones=[],timeObjects=[],pieces=[],materials={},geo=new THREE.BoxGeometry(1,1,1);
 const mat=(id,c)=>materials[id]=new THREE.MeshStandardMaterial({color:c,roughness:1});
 const stone=mat('stone',0x777e79),old=mat('old',0x58655f),wall=mat('wall',0xcac5b2),wood=mat('wood',0x74604b),paper=mat('paper',0xddd2b8),cloth=mat('cloth',0x7b8888),brass=mat('brass',0x958365),water=mat('water',0x4e676b),glow=mat('glow',0xe0bd8a);glow.emissive.setHex(0xe3b672);glow.userData.blackoutBackup=true;
 const box=(x,y,z,w,h,d,m=wood,solid=true,floor=false,dynamic=false)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y+h/2,z);o.scale.set(w,h,d);root.add(o);if(solid)obstacles.push({object:o,bounds:new THREE.Box3(),isFloor:floor});if(!dynamic)pieces.push(o);return o;};
 const note=(id,label,text,o,profiles=['human','cat'],kind='inspect',extra={})=>inspect.push({id:'inside:'+shop.id+':'+id,kind,label,text,object:o,localPoint:[0,1.5,0],range:2.8,profiles,enabled:()=>root.visible,...extra});
 const sign=(label,x,z)=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='#d7ceb7';ctx.fillRect(0,0,512,96);ctx.fillStyle='#49483d';ctx.font='32px serif';ctx.textAlign='center';ctx.fillText(label,256,61);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const m=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});for(const dx of[-1.2,1.2])box(x+dx,0,z,.045,1.6,.045,wood,false);const o=box(x,1.5,z,2.8,.5,.025,m,false,false,true);zones.push({label,point:[x,0,z]});return o;};
 const table=(x,z,w=2,d=1)=>{for(const a of[-1,1])for(const b of[-1,1])box(x+a*(w/2-.12),0,z+b*(d/2-.12),.12,.8,.12);return box(x,.8,z,w,.12,d);};
 const bundle=(x,z,m=paper)=>box(x,.93,z,.6,.055,.45,m,false);
 const shelf=(x,z,w=2)=>{box(x,0,z,w,2.3,.45);for(let k=0;k<4;k++){box(x,.22+k*.51,z+.28,w,.07,.5,wood,false);for(let j=0;j<4;j++)box(x-w/2+.25+j*w/4,.3+k*.51,z+.3,w/5,.33,.17,(j+k)%3?paper:cloth,false);}};
 const bench=(x,z,w=2)=>{box(x,0,z,w,.42,.45);seats.push({position:[x,0,z],yaw:Math.PI});};
 box(0,-.14,0,W,.14,D,stone,false);box(-W/2,0,0,.18,3.6,D,wall);box(W/2,0,0,.18,3.6,D,wall);box(0,0,-D/2,W,3.6,.18,wall);
 for(const s of[-1,1])box(s*(W/4+.65),0,D/2,W/2-1.3,3.6,.18,wall);box(0,2.5,D/2,2.6,1.1,.18,wall);const door=box(0,0,D/2-.02,1.5,2.4,.06,wood,false,false,true);door.geometry=new THREE.BoxGeometry(1.5,2.4,.06);door.scale.set(1,1,1);
 const roofY=shop.id==='cv-bell'?6.4:3.65;if(shop.id==='cv-inn'){box(0,roofY,3,W,.14,18,wood,false);for(const x of[-5.5,5.5])box(x,roofY,-9,7,.14,6,wood,false);}else box(0,roofY,0,W,.14,D,wood,false);const ambient=new THREE.AmbientLight(0xe4e5df,1);root.add(ambient);
 box(-W/2+.12,1.4,3,.02,1.2,2.8,cloth,false);box(W/2-.25,1.8,3,.12,.25,.12,glow,false);
 if(shop.id==='cv-archive'){
  sign('受付・土地 / 家系 / 商業',0,12);table(-5,10,4,1.2);bundle(-5,10);table(5,10,3);bench(5,11.3,3);
  sign('閲覧室',0,5);for(const x of[-4,4]){table(x,5,3,1.2);bench(x,6.3,3);bundle(x,5);}
  for(const x of[-8,-4,4,8])for(const z of[-3,-7,-11])shelf(x,z);
  sign('通常書架 / 古書架',0,-2);table(0,-12,3,1);sign('奥書庫・目録',0,-14.6);
  box(10,0,7,3,1.8,.18);table(10,10,1.6);sign('管理机・小型保管室',10,7);shelf(10,3,1.7);
  // Delivery shelves leave low passages, physically too low for a human.
  sign('資料搬入口',10,-9);box(10,.9,-10,2.6,1.3,.4);box(10,0,-11,1,.45,1);
  note('catalog','目録台','土地と家系の目録の間に、本文だけがない年代が残る。今日も普通の資料が運ばれてくる。',bundle(0,-12));
  for(const[x,z]of[[-4,6.3],[4,6.3]]){const g=new THREE.Group();g.name='土地資料を読む市民';root.add(g);const body=box(x,.43,z,.4,.64,.34,cloth,false,false,true),head=box(x,1.07,z,.28,.28,.28,paper,false,false,true);timeObjects.push({objects:[body,head],periods:['morning','day','evening']});}
  workstations.push([0,0,8],[0,0,0],[0,0,-9]);
 }else if(shop.id==='cv-records'){
  sign('受付・都市台帳',0,8);for(const[x,z]of[[-4,5],[4,5],[-4,0],[4,0]]){table(x,z,2.6);bundle(x,z);bench(x,z+1.2);box(x+.6,.94,z,.12,.18,.12,brass,false);}
  for(const x of[-6,-3,3,6])shelf(x,-8);sign('通行 / 建築 / 年代別',0,-9.7);sign('区画図と申請受付',6,2);box(7,1.4,-1,.025,1.3,3,paper,false);
  note('ordinary','今日の都市台帳','屋根の修理、住所の変更、旅人の通行。普通の申請の間に、古い区画図が挟まっている。',bundle(-4,0));
  workstations.push([0,0,5],[0,0,-3]);
 }else if(shop.id==='cv-bell'){
  sign('整備室・間隔と返り音',-2,5);table(-2,1);for(let i=0;i<20;i++)box(2.5,i*.18,-1-i*.24,1.8,.18,.24,stone,true,true);
  box(2.5,3.6,-5.8,1.8,.16,.24,stone,true,true);box(2.5,3.6,-6.4,2.7,.16,1.2,wood,true,true);
  for(const x of[1.4,3.7])box(x,3.7,-6.3,.16,2.5,.16,wood,false);box(2.5,6.1,-6.3,2.6,.18,.22,wood,false);
  const bell=new THREE.Mesh(new THREE.CylinderGeometry(.32,.65,1.1,12),brass);bell.position.set(2.5,5.3,-6.2);root.add(bell);
  for(const x of[1.5,3.5])box(x,.15,-6,.045,5.8,.045,cloth,false);for(const[x,z]of[[-3,-4],[-1,-4]]){box(x,.4,z,.6,.55,.16,brass,false);box(x,.85,z,.95,.09,.3,wood,false);}
  note('repair-mark','古い修繕刻印','古い軸受けの下に、別の寸法の傷。後の修理では、元の刻みを消さずに金具を足したようだ。',box(-3,.3,-4,.3,.1,.25,old,false));
  inspect.push({id:'inside:cv-bell:view',kind:'quiet-view',verb:'眺める',label:'点検足場から鐘を眺める',text:'鐘の下に、綱と何世代もの金具が残る。',object:root,localPoint:[2.5,3.8,-6],range:2.5,profiles:['human','cat'],viewEye:[202.5,5.2,-6],viewFocus:[196,1,2],enabled:()=>root.visible});workstations.push([0,0,2],[0,0,-2]);
 }else if(shop.id==='cv-observatory'){
  sign('新観測室',0,9);table(-4,4,3);bundle(-4,4);box(-7,1,-2,.04,1.6,3,paper,false);
  // Old tower masonry stays visibly inside a later timber addition.
  for(const x of[-3,3])box(x,0,-7,.8,2.8,.7,old);sign('旧観測塔の石 / 夜間観測窓',0,-10.8);
  box(0,0,-6,2,.6,2,stone);box(0,.6,-6,.18,1.7,.18,brass,false);const scope=box(0,2.1,-6,3,.2,.3,wood,false,false,true);scope.rotation.z=.22;
  const shutter=box(0,1.3,-10.8,3,1.5,.1,wood,false,false,true);timeObjects.push({objects:[shutter],periods:['morning','day']});
  sign('記録机・測定器',5,4);table(5,2);bundle(5,2);box(5,.94,2,.4,.3,.35,brass,false);workstations.push([0,0,5],[0,0,-3]);
 }else if(shop.id==='cv-maps'){
  sign('壁地図・方位と年代',0,10);const mapCanvas=document.createElement('canvas');mapCanvas.width=768;mapCanvas.height=256;const ctx=mapCanvas.getContext('2d');ctx.fillStyle='#d9ceb2';ctx.fillRect(0,0,768,256);ctx.lineWidth=3;for(const [i,offset]of[0,3,18].entries()){ctx.strokeStyle=['#625c48','#85745b','#536a70'][i];ctx.setLineDash(i?[9,5]:[]);ctx.beginPath();ctx.moveTo(65,205);ctx.lineTo(265,205+offset/2);ctx.lineTo(445+offset,110+offset);ctx.lineTo(700,110+offset);ctx.stroke();}ctx.setLineDash([]);ctx.strokeStyle='#746b52';ctx.beginPath();ctx.moveTo(70,45);ctx.lineTo(65,85);ctx.moveTo(55,58);ctx.lineTo(70,45);ctx.lineTo(80,62);ctx.stroke();ctx.font='22px serif';ctx.fillStyle='#4b4a3d';ctx.fillText('年代別の写し',110,60);const texture=new THREE.CanvasTexture(mapCanvas);texture.colorSpace=THREE.SRGBColorSpace;const mapMat=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});box(0,1.2,-11.8,8,1.8,.06,mapMat,false);
  for(const x of[-7,7])for(const z of[-6,-2])shelf(x,z,2.5);table(-4,3,3,1.4);table(4,3,3,1.4);table(0,-6,4,2);
  sign('重ね合わせ閲覧机',0,-8);for(const z of[-6.4,-6,-5.6])bundle(0,z);box(5,.94,3,.45,.2,.45,brass,false);sign('巻物 / 測量器具',7,-3);workstations.push([0,0,6],[0,0,-3]);
 }else if(shop.id==='cv-val'){
  sign('石材補修・今日の仕事',0,8);table(-3,2,3,1.3);table(3,-2,3,1.2);
  for(let i=0;i<6;i++){box(3+(i%3-.8)*.5,.93,-2+Math.floor(i/3)*.3,.28,.14,.24,i%2?brass:old,false);box(-6+(i%2)*1.2,0,-7+Math.floor(i/2)*1.2,.8,.4+(i%3)*.12,.9,stone);}
  box(6,0,-7,2,1.4,.45);sign('古壁材・鐘の金具',0,-9.7);bundle(-3,2);box(5,1,-8,1.2,.35,.16,brass,false);workstations.push([0,0,4],[0,0,-3]);
 }else if(shop.id==='cv-inn'){
  sign('食堂・朝食と旅人の宿',0,10);for(const x of[-5,5]){table(x,7,3);bench(x,8.3,3);const cup=box(x,.93,7,.18,.2,.18,paper,false,false,true);timeObjects.push({objects:[cup],periods:['morning','evening','night']});}
  box(-6,0,2,4,1,.8);box(-7,0,.5,1.2,1.5,1,stone);sign('厨房',-6,1);table(6,2);bundle(6,2);sign('受付',6,1);
  // Corridor remains two metres wide; rooms open into it.
  for(const x of[-5,5]){for(const z of[-3,-8]){box(x,0,z-1.7,6,2.3,.12,wall);const bed=box(x,0,z,1.5,.4,2.2);box(x,.4,z,1.45,.14,2.1,cloth,false);beds.push({object:bed,localPoint:[0,1.5,0],wake:[200+Math.sign(x)*2.7,0,z],room:'caer-'+(x<0?'west':'east')+(z===-8?'-rear':'')});}}
  sign('客室・廊下',0,-1.5);sign('小さな裏庭',0,-11.7);const grass=mat('grass',0x74816a);for(const x of[-1.5,1.5])box(x,.02,-10,.5,.25,.8,grass,false);bench(1.3,-9.5,1);box(0,-.04,-10,4,.04,1.2,old,false);note('courtyard','小さな裏庭','洗濯布と草、乾かしている靴。客室の廊下を抜けた小さな庭に、旅人の荷が置かれている。',box(0,1.1,-11.7,1,.1,.04,cloth,false));
  for(const x of[-5,5]){const body=box(x,.43,8.3,.42,.62,.35,cloth,false,false,true),head=box(x,1.05,8.3,.27,.28,.27,paper,false,false,true);timeObjects.push({objects:[body,head],periods:x<0?['morning','evening','night']:['evening','night'],guest:true});}
  note('guestbook','宿泊と朝食の帳面','旅人の名前の横に朝食の人数。来る人が変わっても、台所では同じ支度を続ける。',bundle(6,2));workstations.push([0,0,7],[0,0,2]);
 }else if(shop.id==='cv-sluice'){
  sign('水門管理・点検と荷の順番',0,8);table(-4,4,3);table(4,3,3);bundle(-4,4);for(const x of[-5,5])shelf(x,-7);
  box(0,0,-6,4,.7,2,stone);for(let i=0;i<4;i++)box(-1.5+i,.71,-6,.7,.1,1.6,i%2?water:wood,false);box(6,1.1,-4,.06,1.6,2,paper,false);
  sign('旧点検区画 / 水位の写し',0,-9.7);for(const x of[-6,-4])box(x,.1,-2,.15,2.4,.15,brass,false);workstations.push([0,0,5],[0,0,-3]);
 }
 // Actual tabletop objects use scaled local offsets so interaction never points above the ceiling.
 const placements={'cv-archive':{commerce:[-5,1,10],canal:[4,1,5],bell:[4,1,9],family:[-4,1,5],waterMemory:[-5,1,1]},'cv-records':{passage:[-4,1,5],building:[4,1,5],district:[-4,1,0]},'cv-maps':{oldMap:[-4,1,3],district:[4,1,3],palace:[0,1,-6]},'cv-sluice':{canal:[-4,1,4]}};
 for(const doc of researchDocuments.filter(d=>d.rooms.includes(shop.id))){const[x,y,z]=placements[shop.id]?.[doc.id]??doc.point;box(x,0,z,.72,y-.04,.56,wood);const o=box(x,y-.04,z,.65,.045,.5,paper,false);note('doc-'+doc.id,doc.title,doc.text,o,['human'],'capital-document',{documentId:doc.id,localPoint:[0,1.5,0],range:3,priority:-.2});}
 for(const find of researchCatFinds.filter(f=>f.room===shop.id)){
  const[x,,z]=find.point;box(x-.65,0,z,.18,1,.45,wood);box(x+.65,0,z,.18,1,.45,wood);box(x,.64,z,1.5,.3,.45,wood);
  const o=box(x,.1,z-1.1,.3,.12,.25,old,false);note('research-cat-'+find.id,find.label,find.text,o,['cat'],'capital-cat-trace',{traceId:find.id,localPoint:[0,1.5,0],range:1.6});catRoutes.push({id:find.id,start:[200+x,0,z+1.3],end:[200+x,0,z-1.1],clearance:.64,label:find.label});
 }
 root.updateMatrixWorld(true);for(const o of obstacles)o.bounds.setFromObject(o.object,true);
 // One shared geometry and instanced mesh per material. Interaction/collision proxies stay exact.
 const batches=new Map();for(const o of pieces){let list=batches.get(o.material);if(!list)batches.set(o.material,list=[]);list.push(o);}const proxy=new THREE.MeshBasicMaterial({visible:false});for(const[m,list]of batches){const batch=new THREE.InstancedMesh(geo,m,list.length);batch.name=shop.name+' 静的内装';list.forEach((o,i)=>{o.updateMatrix();batch.setMatrixAt(i,o.matrix);o.material=proxy;});root.add(batch);}
 const policy={id:shop.id,spawn:new THREE.Vector3(200,0,D/2-1.5),obstacles,groundAt(x,z,y=0){const lx=x-200;if(lx<=-W/2+.15||lx>=W/2-.15||z<=-D/2+.15||z>=D/2-.15)return null;if(shop.id==='cv-bell'&&lx>1.6&&lx<3.4&&z<=-1&&z>=-5.92){const i=Math.min(20,Math.floor((-z-1)/.24)),h=i===20?3.76:(i+1)*.18;return h<=y+.39?h:0;}if(shop.id==='cv-bell'&&lx>1.15&&lx<3.85&&z<-5.92&&z>-7)return y>3.2?3.76:0;return 0;}};
 let meshes=0;root.traverse(o=>{if(o.isMesh&&o.material?.visible!==false)meshes++;});
 return{root,policy,door,inspect,beds,seats,catRoutes,workstations,ambient,materials,shop,npcPosition:[0,0,5],exit:[200,0,D/2-1.3],zones,stats:{meshes,obstacles:obstacles.length,dedicated:true,zones:zones.length},applyTime(state){for(const t of timeObjects)for(const o of t.objects)o.visible=t.periods.includes(state.period)&&(!t.guest||state.dayIndex%3!==1);const wet=state.weather==='rain';stone.color.setHex(wet?0x606f70:0x777e79);old.color.setHex(wet?0x485d5c:0x58655f);}};
}
