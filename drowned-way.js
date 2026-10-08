import {recordTravel} from './world-graph.js';
import {createDetailBatch} from './miniature.js';
import {lakeWaterPhase} from './lake-water-level.js';
export const drownedLayout={id:'drowned-way',entry:[-312,6.04,-43],width:2.8,bounds:{minX:-353,maxX:-309,minZ:-47,maxZ:-34},route:[[-312,6.04,-43],[-317,5.95,-43],[-321,5.54,-43],[-331,5.50,-42],[-340,5.46,-40],[-350,5.44,-37]],futureDirection:[-360,5.03,-33]};
export function roadReading(x,z){let nearest=null;for(let i=1;i<drownedLayout.route.length;i++){const a=drownedLayout.route[i-1],b=drownedLayout.route[i],dx=b[0]-a[0],dz=b[2]-a[2],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[2])*dz)/(dx*dx+dz*dz))),distance=Math.hypot(x-a[0]-t*dx,z-a[2]-t*dz);if(!nearest||distance<nearest.distance)nearest={distance,height:a[1]+t*(b[1]-a[1]),segment:i,t};}return nearest;}
const outsideRoad=(x,z)=>x<drownedLayout.bounds.minX||x>drownedLayout.bounds.maxX||z<drownedLayout.bounds.minZ||z>drownedLayout.bounds.maxZ;
export function drownedHeight(x,z){if(!['veryLow','extremeLow'].includes(lakeWaterPhase())||outsideRoad(x,z))return null;const end=drownedLayout.route.at(-1),prev=drownedLayout.route.at(-2);if((x-end[0])*(end[0]-prev[0])+(z-end[2])*(end[2]-prev[2])>0)return null;const q=roadReading(x,z);return q.distance<=drownedLayout.width/2?q.height:null;}
export function drownedBoatBlocked(x,z){if(lakeWaterPhase()==='normal'||outsideRoad(x,z))return false;const q=roadReading(x,z);return q.distance<drownedLayout.width/2+1.15;}
export function buildDrownedWay({THREE,scene,box,lake}){
 const root=new THREE.Group();root.name='Drowned Way lakebed road';scene.add(root);const stone=lake.materials.stone.clone();stone.color.setHex(0x778785);const moss=lake.materials.reeds,wood=lake.materials.wood;const beds=[],positions=[];
 // A continuous narrow stone bed carries footsteps; instanced chips do not
 // redefine the collision surface or create gaps between decorative paving.
 for(let i=1;i<drownedLayout.route.length;i++){const a=drownedLayout.route[i-1],b=drownedLayout.route[i],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz),nx=-dz/l*1.4,nz=dx/l*1.4;positions.push(a[0]+nx,a[1]-.018,a[2]+nz,b[0]+nx,b[1]-.018,b[2]+nz,a[0]-nx,a[1]-.018,a[2]-nz,a[0]-nx,a[1]-.018,a[2]-nz,b[0]+nx,b[1]-.018,b[2]+nz,b[0]-nx,b[1]-.018,b[2]-nz);for(const sign of [-1,1]){const ax=a[0]+nx*sign,az=a[2]+nz*sign,bx=b[0]+nx*sign,bz=b[2]+nz*sign;positions.push(ax,a[1]-.018,az,ax,3.9,az,bx,b[1]-.018,bz,bx,b[1]-.018,bz,ax,3.9,az,bx,3.9,bz);}}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();const bed=new THREE.Mesh(g,stone);bed.name='Drowned Way continuous wet stone bed';bed.userData.walkSoft=true;bed.receiveShadow=true;root.add(bed);beds.push(bed);
 const batch=createDetailBatch(THREE,root,'Drowned Way weathered paving');for(let i=1;i<drownedLayout.route.length;i++){const a=drownedLayout.route[i-1],b=drownedLayout.route[i],n=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/.85),yaw=-Math.atan2(b[2]-a[2],b[0]-a[0]);for(let j=0;j<n;j++){const t=(j+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,y=a[1]+(b[1]-a[1])*t;for(const [ki,k]of [-.9,0,.9].entries()){const seed=j*7+i*3+ki;if(seed%17===4&&ki!==1)continue;const jitter=Math.sin(seed*1.7)*.06;batch.add('block',stone,[x+Math.sin(yaw)*k+jitter,y-.035,z+Math.cos(yaw)*k-jitter],[.66+(seed%4)*.05,.07,.66+(seed%3)*.06],yaw+Math.sin(seed)*.06,new THREE.Color(seed%3===0?0xcbd5cf:0xe0e4dd));}}}
 for(const [x,z]of [[-322,-44.4],[-328,-40.8],[-344,-37.2]])batch.add('leaf',moss,[x,roadReading(x,z).height-.05,z],[.4,.12,.3]);batch.finish();
 const exposed=new THREE.Group();root.add(exposed);const targets=[],catSteps=[],gaps=[];
 const piece=(x,y,z,w,h,d,m=stone,soft=false,parent=exposed)=>{const o=box(x,y,z,w,h,d,m,parent);o.castShadow=false;o.userData.walkSoft=soft;return o;};
 const notice=(id,label,text,object,profiles=['human','cat'],point=[0,.18,0])=>targets.push({id:'drowned:'+id,label,text,kind:'inspect',object,profiles,range:2.8,localPoint:point});
 const entrance=piece(-314.4,5.9,-41.65,.5,.12,.35,stone,true,root);notice('entry','湖岸の古い石段','古い道が、水の下から続いている。',entrance,['human','cat']);
 notice('post','古い杭','水に触れていたところだけ、木が黒い。縄の跡は、もうほどけている。',piece(-323,5.45,-44.45,.14,.8,.14,wood,true));
 const marker=piece(-333,5.44,-42.8,.5,.55,.35);notice('mark','斜めの線の標石','欠けた円のそばに、斜めの短い線。向きだけが、どこか違う。',marker,['human','cat'],[0,.35,0]);
 const ring=piece(-340,5.48,-40,.5,.015,.5,stone,true);notice('hollow','浅い円の窪み','丸い窪みの内側だけ、石の色が濃い。端が一か所、欠けている。',ring);
 const imprint=new THREE.Mesh(new THREE.TorusGeometry(.16,.012,3,12,Math.PI*1.55),moss);imprint.rotation.x=-Math.PI/2;imprint.position.y=.025;imprint.userData.walkSoft=true;ring.add(imprint);
 for(let i=0;i<3;i++)piece(-333.24+i*.10,5.72+i*.025,-42.61,.045,.14,.014,moss,true); // three oblique lines, not nine identical marks
 notice('end','水へ続く切れ目','石道はここで崩れている。水の下にも、細い列が続いているように見える。',piece(-349,5.38,-37,.8,.08,.5,stone,true));
 for(const [i,x,z]of [[0,-325,-42.6],[1,-343,-38.7]]){const y=roadReading(x,z).height;const top=piece(x,y+.57,z,.9,.12,1.8);for(const dz of [-.8,.8])piece(x,y-.03,z+dz,.18,.68,.18);gaps.push({x,z,y,object:top});notice(i?'cat-circle':'cat-lines',i?'水際の小さな円':'倒石の下の線',i?'草の根の下に、小さな丸い石片。縁だけがすり減っている。':'石の下面に、浅い線。水の匂いの向こうに、古い革の匂いが残っている。',top,['cat'],[0,-.2,0]);}
 for(const [x,z]of [[-327,-41.8],[-346,-38.0]]){const y=roadReading(x,z).height,o=piece(x,y-.02,z,.7,.22,.6);o.userData.walkSurface=true;catSteps.push(o);}
 const continuation=createDetailBatch(THREE,root,'Drowned Way submerged continuation');for(let i=0;i<5;i++)continuation.add('block',stone,[-353-i*1.5,5.13-i*.04,-35.8+i*.6],[.85,.15,.6],.15);continuation.finish();
 const puddles=createDetailBatch(THREE,exposed,'Drowned Way shallow rain puddles');for(const [x,z]of [[-329,-41.6],[-345,-38.1]])puddles.add('block',lake.materials.water,[x,roadReading(x,z).height+.008,z],[.45,.008,.25]);const puddleDetails=puddles.finish();
 return{root,exposed,paving:[bed,batch.root,continuation.root],targets,catSteps,gaps,stone,puddles:puddleDetails.root,heightAt:drownedHeight,layout:drownedLayout};
}
export function connectDrownedWay({THREE,road,level,walking,boatTravel,inspections,shopSystem,stay,townLife,dialogue,regions,minimap}){
 let busy=false,elapsed=0,uiKey='';stay.data.threads.drowned??={stage:'unseen'};
 const discovered=()=>!!stay.data.discoveries['drowned:entry'];
 function remember(id,text,mode=walking.state.profile.id){if(stay.data.discoveries[id])return false;if(id==='drowned:walk')recordTravel(stay.data,'drowned-way',walking.state.profile.id);stay.data.discoveries[id]={day:stay.data.currentDay,period:stay.data.dayPhase,playerMode:mode,label:id};stay.note(id,text,{kind:mode==='cat'?'cat':'place',playerMode:mode});stay.changed();return true;}
 for(const t of road.targets){t.enabled=()=>!shopSystem.current&&level.phase!=='normal'&&(t.id==='drowned:entry'||['veryLow','extremeLow'].includes(level.phase));inspections.resolver.register(t);}
 const motifEntries=['nine:stone-5','caerith:foundation'].map(id=>{const entry=inspections.resolver.entries.get(id);return{entry,text:entry?.text}});
 const lakeRegion=regions.regions.find(r=>r.id==='lake-lun');lakeRegion.cameraPresets.push({id:'lake-drowned-way',name:'Drowned Way',eye:[-331,26,-14],focus:[-331,5.5,-41],visible:()=>discovered(),enabled:()=>discovered()&&['veryLow','extremeLow'].includes(level.phase),disabledLabel:'Drowned Way（水没）'});
 lakeRegion.navigationTargets.push({id:'drowned-way',name:'古い石道のある岸',short:'石',position:[...drownedLayout.entry],enabled:()=>discovered()&&level.phase!=='normal'});
 function sync(){if(busy)return;busy=true;try{for(const o of road.paving)o.visible=level.phase!=='normal';road.exposed.visible=['veryLow','extremeLow'].includes(level.phase);road.puddles.visible=['veryLow','extremeLow'].includes(level.phase)&&townLife.state.weather==='rain';road.stone.color.setHex(townLife.state.weather==='rain'?0x687b7b:0x778785);
 const d=stay.data;for(const {entry,text}of motifEntries)if(entry)entry.text=d.discoveries['drowned:mark']?text+(entry.id.startsWith('nine:')?' 水辺の標石を思い出した。線の向きは、同じではない。':' 湖岸の石道を思い出した。こちらは、大きな欠けた輪だ。'):text;const t=d.threads.drowned??={stage:'unseen'},baseStage=d.discoveries['drowned:mark']?'marked':d.discoveries['drowned:walk']?'explored':discovered()?'discovered':d.discoveries['drowned:rumor']?'heard':'unseen';
 if(d.discoveries['drowned:mark']&&(d.discoveries['nine:stone-3']||d.discoveries['nine:stone-5']||d.discoveries['nine:stone-9']))stay.note('drowned:nine-link','石の刻みは、Nine Stonesで見たものに少し似ていた。向きは違う。');
 if((d.discoveries['drowned:hollow']||d.discoveries['drowned:mark'])&&d.discoveries['caerith:foundation'])stay.note('drowned:caerith-link','島の欠けた輪と、石道の標石。大きさも、向きも違っていた。');
 const linked=!!d.discoveries['drowned:nerissa']||!!d.discoveries['drowned:nine-link']||d.journal.some(j=>j.id==='drowned:nine-link'||j.id==='drowned:caerith-link');const stage=baseStage==='marked'&&linked?'linked':baseStage;if(t.stage!==stage){t.stage=stage;stay.changed();}
 minimap.setSpecialMarkers?.(level.phase!=='normal'?[{id:'drowned-way',name:'古い石段',short:'石',position:drownedLayout.entry}]:[]);
 const key=level.phase+':'+discovered();if(key!==uiKey){uiKey=key;if(regions.current.id==='lake-lun'&&!boatTravel.active)regions.refreshArea();else regions.refresh();}
 }finally{busy=false;}}
 inspections.onPresent(({entry,text})=>{if(!entry.id.startsWith('drowned:'))return;remember(entry.id,entry.id==='drowned:entry'?'水が引いた湖岸に、古い石道が現れていた。':text);sync();});
 const lunLines={lunHost:'今年はよく引くね。朝、岸の石が長く見えていたよ。',lunBoat:'舟底をこすらないようにしないとな。石の列のそばは、少し回って。',lunWatcher:'あの石は、昔から時々見えるよ。水が戻ると、また見えなくなる。'};
 for(const c of dialogue.characters){const previous=c.eventReply;c.eventReply=args=>{const prior=previous?.(args);if(stay.data.threads.bell?.anomalyDay===stay.data.currentDay&&townLife.state.period==='night')return prior;
 if(args.index%3===0&&lunLines[c.id]&&(level.phase!=='normal'||stay.data.currentDay>=2))return level.phase==='normal'?({lunHost:'水が引く朝は、岸の石が長く見えることがあるね。',lunBoat:'浅いところの石は、舟からだと見えにくいんだ。',lunWatcher:'たまに水が引くと、岸から石道みたいなものが見えるよ。'}[c.id]):lunLines[c.id];
 if(c.id==='greenBard'&&discovered()&&args.index%3===0)return '道は、沈んでも道のままなんだね。';
 if(c.id==='starmaker'&&stay.data.discoveries['drowned:mark']&&args.index%3===0)return '線の向きが違う。でも、配置は古い星図に少し似ている。';return prior;};}
 dialogue.onSpeak(({character,text})=>{if(lunLines[character.id]&&stay.data.currentDay>=2&&/水が|石道|舟底|岸の石|あの石/.test(text??'')){remember('drowned:rumor','水が引く朝、岸から石が長く見えることがあるらしい。');sync();}if(character.id==='starmaker'&&stay.data.discoveries['drowned:mark']){remember('drowned:nerissa','向きは違うのに、古い星図にも似た配置があるという。');sync();}});
 stay.onChange(sync);level.onChange(sync);townLife.onChange(sync);sync();
 return{remember,sync,layout:drownedLayout,get progress(){return{...stay.data.threads.drowned,water:level.phase}},update(dt){elapsed+=dt;if(elapsed<.5)return;elapsed=0;if(!walking.active||shopSystem.current)return;const p=walking.state.feet,q=roadReading(p.x,p.z);if(boatTravel.active){if(level.phase!=='normal'&&q.distance<8)remember('drowned:from-boat','舟から見ると、水の下の石は岸から細く続いていた。');return;}if(['veryLow','extremeLow'].includes(level.phase)&&q.distance<1.4&&p.x<-322){if(remember('drowned:walk','濡れた石道を歩いた。岸の声が、少し遠くなった。'))sync();}}};
}
