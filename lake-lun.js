import {createDetailBatch} from './miniature.js';
// Deterministic terrain and the collision sampler share the same route heights.
export const lakeLayout={road:[[-206.1,9.48,-23],[-216,9.48,-23],[-231,8.7,-26],[-249,7.65,-31],[-269,6.8,-34],[-287,6.25,-30],[-300,6.12,-27]],entry:[-300,6.12,-27],pier:[-322,6.15,-24],shore:[-313,6.04,-33],bounds:{minX:-380,maxX:-275,minZ:-60,maxZ:15}};
export const lakeEdge=z=>-316+1.4*Math.sin((z+24)*.13);
const bankY=(x,z)=>6.04+.002*(x+313)+.025*Math.sin((z+23)*.15);
export function lakeHeight(x,z){let y=null;
 for(let i=1;i<lakeLayout.road.length;i++){const a=lakeLayout.road[i-1],b=lakeLayout.road[i],dx=b[0]-a[0],dz=b[2]-a[2],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz)));if(Math.hypot(x-a[0]-dx*t,z-a[2]-dz*t)<=4.4)y=Math.max(y??-Infinity,a[1]+(b[1]-a[1])*t);}
 if(z>=-48&&z<=4&&x>=lakeEdge(z)&&x<=-294)y=Math.max(y??-Infinity,bankY(x,z));return y;
}
export function buildLakeLun({THREE,scene,box}){
 const root=new THREE.Group();root.name='Lake Lun quiet shore';scene.add(root);
 const materials={grass:new THREE.MeshStandardMaterial({color:0x748578,roughness:1}),stone:new THREE.MeshStandardMaterial({color:0x919b95,roughness:1}),earth:new THREE.MeshStandardMaterial({color:0x999784,roughness:1}),wood:new THREE.MeshStandardMaterial({color:0x706553,roughness:1}),reeds:new THREE.MeshStandardMaterial({color:0x6b7c69,roughness:1}),water:new THREE.MeshStandardMaterial({color:0x65858a,roughness:.72,metalness:.015})};
 const floors=[],targets=[],catSteps=[],roadPoints=lakeLayout.road.map(p=>[...p]);
 function mesh(points,mat,name){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.computeVertexNormals();const o=new THREE.Mesh(g,mat);o.name=name;o.userData.walkSoft=true;o.receiveShadow=true;root.add(o);return o;}
 function strip(width,lift,mat){const points=[];for(let i=1;i<roadPoints.length;i++){const a=roadPoints[i-1],b=roadPoints[i],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz),nx=-dz/l*width,nz=dx/l*width;const v=[a[0]+nx,a[1]+lift,a[2]+nz],w=[a[0]-nx,a[1]+lift,a[2]-nz],q=[b[0]+nx,b[1]+lift,b[2]+nz],r=[b[0]-nx,b[1]+lift,b[2]-nz];points.push(...v,...q,...r,...v,...r,...w); // supported shoulders, never a floating road
 for(const side of [[v,q],[r,w]]){const [c,d]=side;points.push(...c,c[0],3.5,c[2],d[0],3.5,d[2],...c,d[0],3.5,d[2],...d);}}
 return mesh(points,mat,'Lake Lun descending '+(width>2?'verge':'old road'));}
 strip(4.4,0,materials.grass);strip(1.3,.006,materials.earth);
 const bank=[];for(let j=0;j<26;j++){const z=-48+j*2,r=z+2,a=lakeEdge(z),b=lakeEdge(r);const v=[a,bankY(a,z),z],w=[-294,bankY(-294,z),z],q=[b,bankY(b,r),r],t=[-294,bankY(-294,r),r];bank.push(...v,...q,...t,...v,...t,...w);bank.push(...v,a,3.5,z,b,3.5,r,...v,b,3.5,r,...q);}mesh(bank,materials.grass,'Lake Lun gently irregular bank');
 const endBanks=[];for(const z of [-48,4]){const west=-371+4*Math.cos((z+20)*.09),east=lakeEdge(z),outside=z+(z<0?-8:8);for(let i=0;i<12;i++){const x=west+(east-west)*i/12,nx=west+(east-west)*(i+1)/12;const a=[x,5.98,z],b=[nx,5.98,z],c=[nx,6.7+.3*Math.sin(i),outside],d=[x,6.7+.3*Math.sin(i),outside];if(z<0)endBanks.push(...a,...b,...c,...a,...c,...d);else endBanks.push(...a,...c,...b,...a,...d,...c);}}mesh(endBanks,materials.grass,'Lake Lun low enclosing end banks');
 const water=[];for(let j=0;j<26;j++){const z=-48+j*2,r=z+2,a=lakeEdge(z),b=lakeEdge(r),far=-371+4*Math.cos((z+20)*.09),nextFar=-371+4*Math.cos((r+20)*.09);water.push(a,5.65,z,nextFar,5.65,r,b,5.65,r,a,5.65,z,far,5.65,z,nextFar,5.65,r);}const lake=mesh(water,materials.water,'Lake Lun enclosed water');
 function slab(x,y,z,w,h,d,m){const o=box(x,y-h,z,w,h,d,m,root);o.castShadow=false;return o;}
 // A narrow but turnable pier; open water is never part of the terrain sampler.
 const pier=slab(-320,6.15,-24,9,.14,2.4,materials.wood);pier.userData.walkSurface=true;floors.push(pier);
 const batch=createDetailBatch(THREE,root,'Lake Lun sparse shore traces');
 for(let i=0;i<5;i++)batch.add('leaf',materials.grass,[-321-i*9,6,-52+Math.sin(i)*2],[8,1.5+(i%3)*.3,6]);
 for(let i=0;i<9;i++)batch.add('leaf',materials.grass,[-373,5.7,-46+i*6],[8,2+(i%3),7]);
 const ripple=new THREE.MeshStandardMaterial({color:0x718d90,roughness:.85});for(let i=0;i<7;i++)batch.add('block',ripple,[-323-i*6,5.655,-30+Math.sin(i)*7],[2.2,.006,.05]);
 for(let i=0;i<12;i++){const z=-45+i*4,x=lakeEdge(z)+.4;for(let j=0;j<3;j++)batch.add('block',materials.reeds,[x+j*.09,bankY(x,z)+.2,z+j*.12],[.035,.4+j*.06,.04]);}
 for(const [x,y,z]of [[-240,8.1,-22],[-273,6.4,-40],[-297,6,-42],[-298,6,-13]]){batch.add('block',materials.wood,[x,y+.8,z],[.16,1.6,.16]);batch.add('leaf',materials.reeds,[x,y+2,z],[1.8,2.2,1.6]);}
 for(let i=0;i<6;i++){batch.add('block',materials.wood,[-316.5-i*1.5,6.155,-24],[.09,.018,2.4]);for(const z of [-25,-23])batch.add('block',materials.wood,[-316.5-i*1.5,5.65,z],[.13,1.0,.13]);}
 for(let i=0;i<7;i++)batch.add('block',materials.stone,[-307-i*5,6.06,-39],[.6,.22,.7]);
 const crawlGround=bankY(-311,-39);const driftwood=slab(-311,crawlGround+.81,-39,2.2,.16,.5,materials.wood);driftwood.name='Lake Lun dry driftwood cat passage';for(const x of [-312,-310])batch.add('block',materials.stone,[x,bankY(x,-39)+.32,-39],[.22,.64,.6]);
 const rock=slab(-312,bankY(-312,-32)+.34,-32,1.5,.34,.9,materials.stone);catSteps.push(rock);
 const log=slab(-308,bankY(-308,-17)+.28,-17,2.3,.28,.6,materials.wood);catSteps.push(log);
 // The small craft is moored, without a boat controller, lights or transparency.
 const boat=new THREE.Group();boat.name='Lake Lun moored skiff';boat.position.set(-321,5.78,-27);root.add(boat);
 const hullPoints=[],rim=[[-1.2,.1,0],[-.65,.1,-.4],[.8,.1,-.32],[1.1,.1,0],[.8,.1,.32],[-.65,.1,.4]];for(let i=0;i<rim.length;i++){const a=rim[i],b=rim[(i+1)%rim.length];hullPoints.push(...a,...b,0,-.15,0);}const hullGeometry=new THREE.BufferGeometry();hullGeometry.setAttribute('position',new THREE.Float32BufferAttribute(hullPoints,3));hullGeometry.computeVertexNormals();const hullMaterial=materials.wood.clone();hullMaterial.side=THREE.DoubleSide;const hull=new THREE.Mesh(hullGeometry,hullMaterial);hull.userData.walkSoft=true;boat.add(hull);
 for(const x of [-.65,.4]){const seat=box(x,.1,0,.2,.07,.6,materials.wood,boat);seat.castShadow=false;seat.userData.walkSoft=true;}
 const rope=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-321,6.16,-25),new THREE.Vector3(-321,5.97,-26.4)]),new THREE.LineBasicMaterial({color:0x80765e}));root.add(rope);
 const peg=slab(-314.2,bankY(-314.2,-21)+.7,-21,.12,.7,.12,materials.wood);
 const mark=slab(-313.2,bankY(-313.2,-36)+.03,-36,.55,.03,.5,materials.stone);mark.userData.walkSoft=true;
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.14,.012,3,12,Math.PI*1.55),materials.reeds);ring.rotation.x=-Math.PI/2;ring.position.set(-313.2,mark.position.y+.032,-36);ring.userData.walkSoft=true;root.add(ring);
 const under=slab(-315,bankY(-315,-25.8)+.018,-25.8,.16,.018,.18,materials.wood);under.userData.walkSoft=true;
 const reedMark=slab(-314,bankY(-314,-41)+.015,-41,.18,.015,.2,materials.stone);reedMark.userData.walkSoft=true;
 targets.push({id:'lake:water',object:rock,label:'静かな湖面',text:'対岸は空の下に残っている。岸へ寄る水だけが、小さく石を洗う。'},
 {id:'lake:peg',object:peg,label:'古い係留杭',text:'木は水に触れるところだけ黒い。縄を結び直した跡が、何度も重なっている。'},
 {id:'lake:boat',object:boat,label:'湖の小舟',text:'小さな舟。岸から離れた跡はなく、濡れた縄が桟橋につながっている。',range:4},
 {id:'lake:shore-mark',object:mark,label:'水際の浅い刻み',text:'水のそばに、閉じない円と浅い線。石群の傷と同じとは言えない。'},
 {id:'lake:cat-rope',object:under,label:'桟橋脇の古い紐',text:'木の下に、水と古い紐の匂い。結び目の内側だけ、まだ乾いていた。',profiles:['cat'],range:1.5},
 {id:'lake:cat-reeds',object:reedMark,label:'葦の間の丸い欠片',text:'葦を抜けると、小さな丸い欠片。水の匂いの奥に、冷たい石が残る。',profiles:['cat'],range:1.5},
 {id:'lake:pier-view',object:pier,label:'桟橋から湖を眺める',kind:'quiet-view',verb:'眺める',viewEye:[-322,7.5,-24],viewFocus:[-350,5.8,-24],text:'桟橋で立ち止まると、岸の水音だけが近くなった。'},
 {id:'lake:shore-view',object:log,label:'湖畔で休む',kind:'quiet-view',verb:'座る',viewEye:[-308,7,-17],viewFocus:[-349,6,-22],text:'湖の向こうにも、低い岸が続いていた。'});
 batch.finish();return{root,materials,floors,roadPoints,catSteps,targets:targets.map(t=>({kind:'inspect',profiles:['human','cat'],range:3,localPoint:[0,0,0],...t})),heightAt:lakeHeight,lake,pier,boat,rock,log,peg,driftwood,addedLights:0};
}
export function connectLakeLun({lake,walking,inspections,stay,townLife,dialogue,ambientAudio,shopSystem}){
 const record=(id,text,cat=false)=>{if(stay.data.discoveries[id])return;stay.data.discoveries[id]={day:stay.data.currentDay,period:townLife.state.period,playerMode:walking.state.profile.id,label:text};stay.note(id,text,{kind:cat?'cat-discovery':'place',playerMode:walking.state.profile.id});stay.changed();};
 inspections.onPresent(({entry})=>{if(entry.id.startsWith('lake:'))record(entry.id,entry.text??entry.label,entry.profiles?.length===1&&entry.profiles[0]==='cat');});
 for(const c of dialogue.characters){const prior=c.calendarReply;c.calendarReply=args=>{const line={starmaker:'水のそばでも、似た形が残っているのね。水が作った傷なのかしら。',greenBard:'湖は、昔から何でも映すわけじゃない。'}[c.id];return args.profile==='human'&&stay.data.discoveries['lake:visit']&&args.index%4===2&&line?line:prior?.(args)??null;};}
 ambientAudio.zones.push({id:'lake-water',area:'town',position:[-320,5.8,-26],radius:45,gain:.18,src:null});
 function paint(){const wet=townLife.state.weather==='rain';lake.materials.stone.color.set(wet?0x76847e:0x919b95);lake.materials.wood.color.set(wet?0x5d574b:0x706553);lake.materials.grass.color.set(wet?0x65776b:townLife.state.season==='autumn'?0x858573:0x748578);lake.materials.water.color.set(townLife.state.weather==='dawn'?0x566f7c:wet?0x536f76:townLife.state.period==='night'?0x455f68:0x65858a);}
 townLife.onChange(paint);paint();let elapsed=0;return{update(dt){elapsed+=dt;if(elapsed<.5)return;elapsed=0;if(walking.active&&!shopSystem.current&&walking.state.feet.x<-294)record('lake:visit','街道を下ると、静かな湖岸に出た。');},get visited(){return !!stay.data.discoveries['lake:visit']}};
}
