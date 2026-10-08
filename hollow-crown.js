import {evaluateConditions} from './progression-data.js';
import {createDetailBatch} from './miniature.js';
import {crownStage} from './story-thread-data.js';
import {ringOpen} from './the-ring.js';
export const crownLayout={id:'hollow-crown',center:[-411,1.6,-146],radius:14,entry:[-411,2.14,-133],bounds:{minX:-429,maxX:-393,minZ:-164,maxZ:-97},passage:[[-405,4.8,-94],[-405,4.5,-98],[-405,3.6,-105],[-407,2.8,-113],[-411,2.4,-123],[-411,2.14,-133]]};
let unlocked=false;
export const crownOpen=()=>unlocked&&ringOpen();
export function crownEligible(data){return evaluateConditions('crown-observation',data);}
export function setCrownUnlocked(value){unlocked=!!value;}
export function passageReading(x,z){let best={distance:Infinity};for(let i=1;i<crownLayout.passage.length;i++){const a=crownLayout.passage[i-1],b=crownLayout.passage[i],dx=b[0]-a[0],dz=b[2]-a[2],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz))),distance=Math.hypot(x-a[0]-dx*t,z-a[2]-dz*t);if(distance<best.distance)best={distance,height:a[1]+(b[1]-a[1])*t,segment:i};}return best;}
const inBounds=(x,z)=>x>-430&&x<-392&&z<-92&&z>-165;
const floorY=(x,z)=>{const dx=x+411,dz=z+146,r=Math.hypot(dx,dz);return 1.6+Math.max(0,r-7)*.09+.025*Math.sin(dx*.4)*Math.sin(dz*.4);};
export function crownHeight(x,z){if(!crownOpen()||!inBounds(x,z))return null;const q=passageReading(x,z);if(q.distance<1.08)return q.height;return Math.hypot(x+411,z+146)<14.7?floorY(x,z):null;}
export function crownDryVolume(x,z,y){return crownOpen()&&inBounds(x,z)&&crownHeight(x,z)!==null&&y<5.4;}
export function crownWallBlocked(x,z,y,profile){if(!crownOpen()||!inBounds(x,z))return false;const q=passageReading(x,z),r=Math.hypot(x+411,z+146);if(q.distance<1.09&&z>-132)return false;if(r>14.25-profile.radius&&r<15.6&&z<-134)return true;return false;}
export function buildHollowCrown({THREE,scene,box,lake}){
 const root=new THREE.Group();root.name='Hollow Crown half-buried stone hollow';root.visible=false;scene.add(root);const details=new THREE.Group();root.add(details);
 const stone=lake.materials.stone.clone();stone.color.setHex(0x626d70);const earth=lake.materials.earth.clone();earth.color.setHex(0x59625d);const pale=stone.clone();pale.color.setHex(0xa4afa9);const moss=lake.materials.reeds;
 const batch=createDetailBatch(THREE,root,'Hollow Crown shared masonry'),points=[];const tri=(a,b,c)=>points.push(...a,...b,...c);
 for(let i=1;i<crownLayout.passage.length;i++){const a=crownLayout.passage[i-1],b=crownLayout.passage[i],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz),nx=-dz/l*1.1,nz=dx/l*1.1;const v=[a[0]+nx,a[1]-.025,a[2]+nz],w=[a[0]-nx,a[1]-.025,a[2]-nz],q=[b[0]+nx,b[1]-.025,b[2]+nz],r=[b[0]-nx,b[1]-.025,b[2]-nz];tri(v,q,r);tri(v,r,w);for(const[c,d]of [[v,q],[r,w]]){tri(c,[c[0],-.1,c[2]],d);tri(d,[c[0],-.1,c[2]],[d[0],-.1,d[2]]);}
  const yaw=-Math.atan2(dz,dx),n=Math.ceil(l/.85);for(let j=0;j<n;j++){const t=(j+.5)/n,x=a[0]+dx*t,z=a[2]+dz*t,y=a[1]+(b[1]-a[1])*t;batch.add('block',stone,[x,y-.035,z],[1.98,.07,.71],yaw);for(const sign of[-1,1])batch.add('block',stone,[x+nx*sign*1.2,y+1.2,z+nz*sign*1.2],[.32,2.4,.79],yaw);if(i>2&&i<5&&j%5!==2)batch.add('block',earth,[x,y+2.65,z],[2.8,.3,.79],yaw);if(j%6===2)batch.add('leaf',moss,[x+nx*.85,y+.04,z+nz*.85],[.22,.05,.4]);}
 }
 // An uneven floor and inward rock shelves make an open-roof depression.
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2,b=(i+1)/64*Math.PI*2;for(const [inner,outer]of [[0,7],[7,14.7]]){const v=[-411+Math.cos(a)*inner,floorY(-411+Math.cos(a)*inner,-146+Math.sin(a)*inner)-.025,-146+Math.sin(a)*inner],w=[-411+Math.cos(b)*inner,floorY(-411+Math.cos(b)*inner,-146+Math.sin(b)*inner)-.025,-146+Math.sin(b)*inner],q=[-411+Math.cos(a)*outer,floorY(-411+Math.cos(a)*outer,-146+Math.sin(a)*outer)-.025,-146+Math.sin(a)*outer],r=[-411+Math.cos(b)*outer,floorY(-411+Math.cos(b)*outer,-146+Math.sin(b)*outer)-.025,-146+Math.sin(b)*outer];tri(v,w,r);tri(v,r,q);}
  if((i<14||i>18)&&(i<38||i>42)){const h=3.6+(i%7)*.3,r=15.7+.35*Math.sin(i*1.7),x=-411+Math.cos(a)*r,z=-146+Math.sin(a)*r;batch.add(i%5===0?'block':'leaf',stone,[x,floorY(x,z)+h/2,z],i%5===0?[1.65,h,2.1]:[1.6,h/2,1.45],-a,new THREE.Color(i%3?0xc8cfca:0xa6b5b2));if(i%4===0)batch.add('block',pale,[x-.2,3.2,z],[.10,1.15,.05],-a);if(i%5===2)batch.add('leaf',moss,[x-Math.cos(a)*1.1,2.4,z-Math.sin(a)*1.1],[.8,.14,.4]);}
 }
 // Continuous bank supports the irregular rock ridges; no floating crown of boulders.
 for(let i=0;i<64;i++){const a=i/64*Math.PI*2,b=(i+1)/64*Math.PI*2;const vertex=(angle,r,y)=>[-411+Math.cos(angle)*r,y,-146+Math.sin(angle)*r];const v=vertex(a,14.7,floorY(-411+Math.cos(a)*14.7,-146+Math.sin(a)*14.7)-.03),w=vertex(b,14.7,floorY(-411+Math.cos(b)*14.7,-146+Math.sin(b)*14.7)-.03),q=vertex(a,18.4,3.65+.15*Math.sin(a*3)),r=vertex(b,18.4,3.65+.15*Math.sin(b*3));if((i<13||i>19)&&(i<38||i>42)){tri(v,w,r);tri(v,r,q);}const outer=22+.8*Math.sin(a*5),outerB=22+.8*Math.sin(b*5),u=vertex(a,outer,5.8+.35*Math.sin(a*4)),t=vertex(b,outerB,5.8+.35*Math.sin(b*4));if((i<13||i>19)&&(i<38||i>42)){tri(q,r,t);tri(q,t,u);tri(u,t,vertex(b,outerB,-.1));tri(u,vertex(b,outerB,-.1),vertex(a,outer,-.1));}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.computeVertexNormals();const bed=new THREE.Mesh(g,earth);bed.receiveShadow=true;bed.userData.walkSoft=true;root.add(bed);
 for(const[x,z]of[[-414,-146],[-405,-148]])batch.add('block',lake.materials.water,[x,floorY(x,z)+.01,z],[1.5,.016,.7]);batch.finish();root.traverse(o=>o.userData.walkSoft=true);
 const targets=[],catSteps=[],routes=[];
 const marker=(x,z,w=.4,h=.12,d=.35)=>{const o=box(x,(crownHeight(x,z)??(z>-132?passageReading(x,z).height:floorY(x,z)))-.03,z,w,h,d,stone,details);o.castShadow=false;o.userData.walkSoft=true;return o;};
 function notice(id,label,text,x,z,profiles=['human','cat'],kind='inspect'){const o=marker(x,z);const e={id:'crown:'+id,label,text,object:o,localPoint:[0,.12,0],range:2.7,profiles,kind};targets.push(e);return e;}
 notice('rim','欠けた石稜','高い石と低い石が、空の縁を途切れさせている。ここでは、円よりも空いたところが目につく。',-420,-141);
 notice('center','中央の空白','底には土と浅い水だけがある。何かがあったとは、まだ言えない。',-411,-146);
 notice('mineral','白い鉱物筋','薄い白い筋が、古い石を横切っている。刻んだ線とは違うようだ。',-399,-146);
 notice('stairs','低い石段','段は低地へ向いている。The Ringの溝と、向きが少しずれている。',-410,-136);
 notice('water','石の間の水','水の表面が、上の空を小さく切り取っている。鐘に似た音は、今はしない。',-414,-146);
 notice('crack','外気の入る裂け目','岩の間から、冷たい外の空気が抜けてくる。遠い水音が少し近くなった。',-418,-153);
 notice('sky','空へ開いた欠け目','欠け目から空を見上げる。星図の線のようにも思えるが、ここにあるのは空白だけだ。',-405,-154,['human']);
 for(const [id,x,z,eye,focus]of[['rim',-420,-138,[-429,13,-132],[-411,2,-146]],['sky',-410,-146,[-410,3.25,-146],[-414,11,-151]]]){const e=notice('view-'+id,'空洞を眺める','石稜の向こうに空がある。中央には、何も置かれていない。',x,z,['human'],'quiet-view');Object.assign(e,{verb:'眺める',viewEye:eye,viewFocus:focus});}
 for(let i=0;i<4;i++){const x=[-421,-400,-419,-404][i],z=[-146,-142,-153,-155][i],y=floorY(x,z);const o=box(x,y+.62,z,1.6,.16,.3,stone,details);o.userData.walkSoft=true;for(const dx of[-.72,.72]){const p=box(x+dx,y,z,.13,.65,.28,stone,details);p.userData.walkSoft=true;}routes.push({id:'crown-gap-'+i,start:[x,y,z-1],end:[x,y,z+1],center:[x,y,z],clearance:.62,object:o});if(i<3)notice('cat-'+i,['乾いた古い紐','石穴を通る風','小さな白い石'][i],['低い岩の下に、擦れた紐が一本。水の匂いは薄い。','石穴の向こうから風が来る。通れるのは、ここまでの細い隙間だけだ。','草のない土の上に、白い石が一つ。軽い冷たさが鼻に残る。'][i],x,z,['cat']);}
 for(let i=0;i<6;i++){const x=-420+i*3,z=i%2?-151:-140,o=marker(x,z,.7,.22,.6);o.userData.walkSurface=true;catSteps.push(o);}
 root.traverse(o=>{if(o.isMesh)o.castShadow=false;});
 return{root,details,targets,catSteps,routes,stone,earth,heightAt:crownHeight,layout:crownLayout};
}
export function crownRegion(stay){const found=()=>!!stay.data.discoveries['crown:visit'];const c=(id,name,eye,focus)=>({id:'crown-'+id,name,eye,focus,enabled:crownOpen});const t=(id,name,p)=>({id:'crown-'+id,name,short:name.slice(0,1),position:p,enabled:()=>found()&&crownOpen()});return{id:'hollow-crown',name:'Hollow Crown',visitedFlags:['crown:visit'],description:'Hollow Crown — 石と空洞、頭上の空白',conditional:true,visible:found,enabled:crownOpen,contains:p=>p.y<4.7&&crownHeight(p.x,p.z)!==null,walkingBounds:crownLayout.bounds,entryPoint:crownLayout.entry,mapBounds:crownLayout.bounds,ambientProfile:'stone-hollow',cameraPresets:[c('overview','全景',[-430,15,-127],[-411,2,-146]),c('rim','外周',[-421,6,-139],[-411,3,-146]),c('center','中央',[-408,6,-142],[-411,2,-146]),c('sky','空の欠け目',[-411,3.3,-146],[-418,10,-151]),c('passage','連絡路',[-407,5,-119],[-411,2,-132]),c('ring','The Ring方面',[-405,6,-111],[-403,6,-84])],navigationTargets:[t('entry','石段',crownLayout.entry),t('center','中央低地',crownLayout.center),t('rim','外周',[-420,2,-138]) ]};}
export function connectHollowCrown({THREE,crown,ring,stay,level,walking,boatTravel,regions,inspections,quietStay,townLife,dialogue,ambientAudio,camera,getQuality=()=>'standard'}){
 let elapsed=0,busy=false,last='';stay.data.threads.hollowCrown??={stage:'unseen'};
 const seen=id=>!!stay.data.discoveries[id];
 function remember(id,text){if(seen(id))return;stay.data.discoveries[id]={day:stay.data.currentDay,period:stay.data.dayPhase,playerMode:walking.state.profile.id,label:id};stay.note(id,text,{kind:walking.state.profile.id==='cat'?'cat-discovery':'place',playerMode:walking.state.profile.id});stay.changed();}
 for(const e of crown.targets){e.enabled=()=>crownOpen();inspections.resolver.register(e);}
 const entrance=inspections.resolver.entries.get('ring:beyond');entrance.text='泥が流れた下に、狭い石段が続いている。石の間から、外とは違う冷たい空気が来る。';entrance.kind='crown-descent';entrance.verb='石段を確かめる';entrance.enabled=()=>ringOpen();
 inspections.handlers.set('crown-descent',e=>{if(!crownEligible(stay.data)){inspections.present(e,{text:'泥と水の下へ、もう一段。まだ足を置くところは見えない。'});return;}remember('crown:entrance','泥の下に、下へ続く石段があった。水が低い間なら、足を置けそうだ。');inspections.present(e,{text:e.text});sync();});
 function sync(){if(busy)return;busy=true;try{setCrownUnlocked(seen('crown:entrance'));crown.root.visible=crownOpen();crown.details.visible=crownOpen()&&(regions.current.id==='hollow-crown'||Math.hypot(camera.position.x+411,camera.position.z+146)<(getQuality()==='mobile'?45:65));crown.stone.color.setHex(townLife.state.weather==='rain'?0x53636a:0x626d70);const stage=crownStage(stay.data);(stay.data.threads.hollowCrown??={stage:'unseen'}).stage=stage;const key=seen('crown:visit')+':'+crownOpen();if(key!==last){last=key;regions.refresh();if(regions.current.id==='hollow-crown')regions.refreshArea();}}finally{busy=false;}}
 inspections.onPresent(({entry,text})=>{if(entry.id.startsWith('crown:'))remember(entry.id,text??entry.text);});
 const lines={greenBard:'そこまで行ったんだ。……頭の上には、まだ空があった？',starmaker:'欠け目と円の向きは比べられます。でも、星図が場所を示すとはまだ言えません。',bookseller:'中空の冠、という書き込みがある。図の隣ではないから、同じ場所かどうかは分からない。',lunHost:'そこまでは知らないね。昔の旅人が、湖の下にも空があると言っていたことはあるよ。',lunBoat:'あの水位の先に、下へ行く場所があったのか。戻る岸だけは、先に見ておいて。',lunWatcher:'似た話を聞いたかもしれない。話していた人は、土のついた靴を乾かしていたよ。'};
 for(const c of dialogue.characters){const previous=c.eventReply;c.eventReply=args=>{if(stay.data.threads.bell?.anomalyDay===stay.data.currentDay&&townLife.state.period==='night')return previous?.(args);return seen('crown:visit')&&lines[c.id]&&args.index%3===0?lines[c.id]:previous?.(args);};}
 dialogue.onSpeak(({character,text})=>{if(character.id==='starmaker'&&seen('ring:visit')&&text.includes('星図'))remember('ring:nerissa-reply','ネリッサは、円と線の向きを星図と比べていた。');});
 ambientAudio.zones.push({id:'crown-water',enabled:crownOpen,sourceId:'lake-water',area:'town',position:crownLayout.center,radius:22,gain:.035,src:null},{id:'crown-air',enabled:crownOpen,sourceId:'nine-wind',area:'town',position:[-418,3,-153],radius:20,gain:.025,src:null});
 const view=inspections.handlers.get('quiet-view');inspections.handlers.set('quiet-view',e=>{view?.(e);if(e.id.startsWith('crown:view-'))remember('crown:shape','外周の高い石に囲まれ、中央だけが空いていた。');});
 stay.onChange(sync);level.onChange(sync);townLife.onChange(sync);sync();
 return{sync,remember,update(dt){elapsed+=dt;if(elapsed<.5)return;elapsed=0;sync();if(crownOpen()&&walking.active&&!boatTravel.active&&Math.hypot(walking.state.feet.x+411,walking.state.feet.z+146)<14.7){remember('crown:visit','沈んだ道のさらに下に、石に囲まれた空洞があった。中央には何もなかった。');remember('region:hollow-crown','石稜の間から空が見える、Hollow Crownに立った。');}}};
}
