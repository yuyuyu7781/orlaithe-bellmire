import {nineHeight,buildNineTerrain} from './nine-terrain.js';
import {createDetailBatch} from './miniature.js';
export const nineLayout={road:[[-109,8.65,-14],[-120,8.65,-14],[-136,9.1,-17],[-151,9.5,-23],[-169,9.8,-28],[-188,10,-29]],centre:[-190,10,-30],lookout:[-187,11.25,-43],returnView:[-173,10.25,-22]};
// A second region uses the same supported floor and collision policy as town.
export function buildNineStones({THREE,scene,box}){
 const root=new THREE.Group();root.name='Nine Stones open upland';scene.add(root);
 const grass=new THREE.MeshStandardMaterial({color:0x78806a,roughness:1}),earth=new THREE.MeshStandardMaterial({color:0x9b9681,roughness:1}),stone=new THREE.MeshStandardMaterial({color:0x92978e,roughness:1}),dark=new THREE.MeshStandardMaterial({color:0x667265,roughness:1}),wood=new THREE.MeshStandardMaterial({color:0x6c6252,roughness:1});
 const stoneSurface=stone.clone();stoneSurface.vertexColors=true;
 const floors=[],roadPoints=[],catSteps=[],targets=[],stones=[];
 function slab(x,y,z,w,h,d,m){const o=box(x,y-h,z,w,h,d,m,root);o.castShadow=false;return o;}
 for(let k=1;k<nineLayout.road.length;k++){const a=nineLayout.road[k-1],b=nineLayout.road[k],n=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/1.7);for(let i=0;i<n;i++){const t=(i+.5)/n,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,y=a[1]+(b[1]-a[1])*t;const f=slab(x,y,z,2.1,y-3.5,10,grass);f.userData.walkSurface=true;floors.push(f);const p=slab(x,y+.012,z,2.1,.024,2.6,earth);p.userData.walkSurface=true;roadPoints.push([x,y+.012,z]);}}
 const field=buildNineTerrain(THREE,grass);root.add(field);
 // Low steps reveal a broad view without a separate climbing system.
 for(let i=0;i<9;i++){const f=slab(-187,10+(i+1)*.14,-37-i*.65,5,6.5+(i+1)*.14,1,grass);f.userData.walkSurface=true;floors.push(f);}
 const top=slab(-187,11.26,-43,7,7.76,4,grass);top.userData.walkSurface=true;floors.push(top);
 const placements=[[-197,-34,2.8,1.0,.8,.06],[-195,-27,.48,2.0,.9,0],[-190,-24,2.1,.8,.9,-.10],[-184,-25,1.9,1,.8,.12],[-181,-31,2.4,.85,.75,-.08],[-184,-36,1.7,1.2,.8,.06],[-190,-38,2.3,.9,.65,.18],[-195,-38,.95,1.1,1.0,-.04],[-199,-30,2.5,.75,1.0,.04]];
 placements.forEach(([x,z,h,w,d,tilt],i)=>{const geo=new THREE.CylinderGeometry(w*.37,w*.52,h,5+i%3,1);const vertices=geo.attributes.position;for(let v=0;v<vertices.count;v++){const y=vertices.getY(v);if(y>0)vertices.setY(v,y-(i===2?.24*Math.max(0,vertices.getX(v)):0));vertices.setX(v,vertices.getX(v)*(1+.06*Math.sin(v*2.3+i)));}geo.computeVertexNormals();const shade=.86+(i%4)*.045,colors=new Float32Array(vertices.count*3).fill(shade);geo.setAttribute('color',new THREE.BufferAttribute(colors,3));const o=new THREE.Mesh(geo,stoneSurface);o.scale.z=d/w;o.position.set(x,10+h/2,z);o.rotation.set(tilt,i*.63,tilt*.6);o.castShadow=false;root.add(o);o.updateWorldMatrix(true,true);const ground=nineHeight(x,z);o.position.y+=ground-[.07,0,.10,.04,.08,.05,.12,.04,.06][i]-new THREE.Box3().setFromObject(o,true).min.y;o.userData.groundHeight=ground;o.userData.buriedDepth=[.07,0,.10,.04,.08,.05,.12,.04,.06][i];o.name='Nine Stones '+(i+1);stones.push(o);if(i===1||i===7){o.userData.catStep=true;catSteps.push(o);}if([2,4,8].includes(i))targets.push({id:'nine:stone-'+(i+1),object:o,label:['欠けた石の線','風化した円','石の小さな窪み'][[2,4,8].indexOf(i)],text:['欠けた面に数本の浅い線。水辺の石とは違うのに、指が同じところで止まる。','円は閉じていない。風に削られたのか、はじめからそうだったのか。','小さな窪みが散っている。星図の点にも、ただの傷にも見える。'][[2,4,8].indexOf(i)]});});
 const batch=createDetailBatch(THREE,root,'Nine Stones sparse verge');const windBatch=createDetailBatch(THREE,root,'Nine Stones wind grass');
 for(let i=0;i<30;i++){const x=-177-(i%10)*2.4,z=-22-Math.floor(i/10)*8;windBatch.add('leaf',dark,[x,nineHeight(x,z)+.12,z],[.16,.24,.13]);}
 for(let i=0;i<6;i++)batch.add('block',stone,[-151-i*.8,9.7,-19],[.72,.4,.32]);
 for(const i of [0,3,7])batch.add('leaf',dark,[placements[i][0]+.2,nineHeight(placements[i][0]+.2,placements[i][1])+.12,placements[i][1]],[.55,.25,.50]);
 const rest=slab(-178,nineHeight(-178,-32)+.4,-32,1.6,.4,.65,stone);catSteps.push(rest);
 batch.add('block',wood,[-177,nineHeight(-177,-33)+.05,-33],[.6,.1,.13]);batch.add('block',dark,[-177.4,nineHeight(-177.4,-33)+.03,-33],[.7,.06,.6]);
 // Three modest physical marks; no emissive runes or particle system.
 for(const i of [2,8]){const q=placements[i];for(let j=0;j<3;j++)batch.add('block',dark,[q[0]-.2+j*.13,nineHeight(q[0],q[1])+.55+j*.03,q[1]+q[4]*.47],[.035,i===8?.045:.24,.025]);}
 const arc=new THREE.Mesh(new THREE.TorusGeometry(.18,.009,3,10,Math.PI*1.4),dark);arc.position.set(-181,nineHeight(-181,-31)+.65,-30.60);arc.userData.walkSoft=true;root.add(arc);
 const catMark=slab(-195,nineHeight(-195,-25.7)+.025,-25.7,.24,.025,.16,dark);catMark.userData.walkSoft=true;
 targets.push({id:'nine:cat-lines',object:catMark,label:'倒石の裏の線',text:'草と冷たい石の匂い。倒れた石の裏側にも、浅い線が続いている。',profiles:['cat'],range:1.4});
 const lowMark=slab(-199.4,nineHeight(-199.4,-30.5)+.018,-30.5,.18,.018,.18,dark);lowMark.userData.walkSoft=true;targets.push({id:'nine:cat-circle',object:lowMark,label:'草の中の小さな輪',text:'低い草の間に、輪の一部が残る。石の上からは見えなかった。',profiles:['cat'],range:1.4});
 const chip=slab(-195.7,nineHeight(-195.7,-37.1)+.02,-37.1,.22,.02,.16,dark);chip.userData.walkSoft=true;targets.push({id:'nine:cat-chip',object:chip,label:'草の下の丸い石片',text:'湿った土の下に、丸みのある石片。浅い傷が地面の側へ続いている。',profiles:['cat'],range:1.4});
 targets.push({id:'nine:rest-trace',object:rest,label:'旅人の休憩跡',text:'煤の跡は冷えている。石の陰には荷物を下ろした草の跡だけが残っていた。'});
 const view=slab(-187,11.3,-43,.4,.04,.4,earth);view.userData.walkSoft=true;targets.push({id:'nine:lookout',profiles:['human'],object:view,label:'石群を見渡す低い丘',kind:'quiet-view',verb:'眺める',viewEye:[-187,13,-43],viewFocus:[-191,10.6,-30],text:'離れて見ると、円の名残のようにも見える。'});
 const back=slab(-173,10.02,-27,.4,.02,.4,earth);back.userData.walkSoft=true;targets.push({id:'nine:return-view',object:back,label:'Bellmireを振り返る場所',kind:'quiet-view',verb:'眺める',viewEye:[-173,12,-27],viewFocus:[-10,8,4],text:'草の向こうに、屋根と鐘楼が重なる。'});
 const signGround=nineHeight(-202,-23);const sign=slab(-202,signGround+1,-23,.7,.16,.15,wood);const signPost=slab(-202,signGround+.9,-23,.12,.9,.12,wood);signPost.name='Nine Stones supported direction post';targets.push({id:'nine:onward',object:sign,label:'低地へ続く道標',text:'Lunmere、Lake Lun。低地の渡しは増水で通れない。道は、水の向こうでも続いている。'});
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#b2aa8e';ctx.fillRect(0,0,512,128);ctx.fillStyle='#45483d';ctx.font='35px serif';ctx.fillText('Lunmere · Lake Lun',12,80);const face=new THREE.Mesh(new THREE.PlaneGeometry(.73,.17),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),side:THREE.DoubleSide}));face.position.set(-202,signGround+.92,-22.918);face.userData.walkSoft=true;root.add(face);
 // A visible flooded wash beyond the playable bank, rather than a hidden wall.
 const lowWater=new THREE.MeshStandardMaterial({color:0x657f7d,roughness:.8});const wash=slab(-211,8.8,-29,7,.08,30,lowWater);wash.userData.walkSoft=true;
 for(let i=0;i<10;i++){const x=-202.2-i*.43,z=-23-.08*Math.sin(i*.6),y=nineHeight(x,z);batch.add('block',earth,[x,y+.008,z],[.48,.016,1.25]);}
 // The old crossing lost its middle span. Water remains visible between banks.
 for(const [x,y,z]of [[-207,9.14,-22.4],[-214.5,9.05,-22.4]]){batch.add('block',wood,[x,y,z],[1.1,.12,.48]);batch.add('block',wood,[x-.3,y-.65,z],[.12,1.3,.12]);}
 batch.add('leaf',grass,[-222,7,-30],[12,4,18]);batch.add('leaf',grass,[-246,5.5,-15],[17,2,13]);batch.add('block',lowWater,[-263,5.0,-13],[22,.05,4]);batch.add('leaf',grass,[-278,4.7,-13],[12,1.7,9]);
 for(const [x,z]of [[-223,-24],[-229,-28]]){batch.add('block',wood,[x,8.3,z],[.18,1.4,.18]);batch.add('leaf',dark,[x,9.2,z],[1.2,1.4,1]);}batch.add('block',earth,[-224,9,-29],[18,.05,1.5]);
 const details=batch.finish();const windy=windBatch.finish();const windMesh=windy.root.children[0],windBases=Array.from({length:windMesh.count},(_,i)=>{const m=new THREE.Matrix4();windMesh.getMatrixAt(i,m);return m});
 return {heightAt:nineHeight,field,windMesh,windBases,root,floors,roadPoints,catSteps,stones,rest,signPost,sign,targets:targets.map(t=>({kind:'inspect',profiles:['human','cat'],range:3,localPoint:[0,0,0],...t})),materials:{grass,earth,stone,stoneSurface,dark},addedLights:0};
}
export function connectNineStones({region,walking,inspections,stay,townLife,dialogue,ambientAudio}){
 let timer=0,windTime=0,grassUpdates=0;const windMatrix=region.windBases[0].clone();
 for(const entry of inspections.resolver.entries.values()){if(entry.kind!=='talk')continue;const c=entry.character,prior=c.calendarReply;c.calendarReply=args=>prior?.(args)??(args.profile==='human'&&stay.data.discoveries['nine:visit']&&args.index%3===1?{starmaker:'その配置……古い星図に少し似ています。でも、同じとは限りません。',bookseller:'昔の記録では、石の数が違うものもある。数え方も、同じだったかどうか。',greenBard:'昔からあるよ。少なくとも、僕が知る限りでは。'}[c.id]??null:null);}
 function record(id,text,kind='place'){stay.data.discoveries[id]={day:stay.data.currentDay,playerMode:walking.state.profile.id,period:townLife.state.period,label:text};stay.note(id,text,{kind,playerMode:walking.state.profile.id});stay.changed();}
 inspections.onPresent(({entry})=>{if(!entry.id.startsWith('nine:'))return;const cat=entry.profiles?.length===1&&entry.profiles[0]==='cat';record(entry.id,entry.id==='nine:lookout'?'上から見ると、九石は円の名残のようにも見える。':cat?entry.text:entry.text??entry.label,cat?'cat-discovery':'place');});
 // Existing ambient context and mute apply; no new audio context or clock.
 function paint(){const wet=townLife.state.weather==='rain';region.materials.stone.color.set(wet?0x7d8580:0x92978e);region.materials.stoneSurface.color.copy(region.materials.stone.color);region.materials.grass.color.set(wet?0x657260:townLife.state.season==='autumn'?0x858166:0x78806a);}
 townLife.onChange(paint);paint();
 ambientAudio.zones.push({id:'nine-wind',area:'town',position:nineLayout.centre,radius:50,gain:.25,src:null});
 function update(dt){timer+=dt;if(timer<.5)return;const elapsed=timer;timer=0;windTime+=elapsed;if(!walking.active)return;const p=walking.state.feet;if(p.x>-165)return;const near=Math.hypot(p.x+190,p.z+30)<45;if(near){const gust=.5+.5*Math.sin(windTime*.19);for(let i=0;i<region.windBases.length;i++){windMatrix.copy(region.windBases[i]);windMatrix.elements[4]+=(.02+.05*gust)*Math.sin(windTime*1.2+i*.7);region.windMesh.setMatrixAt(i,windMatrix);}region.windMesh.instanceMatrix.needsUpdate=true;grassUpdates++;}if(!stay.data.discoveries['nine:visit']&&p.x<-176)record('nine:visit','街道の先に、九つの古い石があった。');
  if(p.x<-178&&!stay.data.discoveries['nine:wind']&&townLife.state.period==='evening'&&townLife.state.weather==='fog'){if(.5+.5*Math.sin(windTime*.19)>.65)windSeconds+=elapsed;if(windSeconds>7){record('nine:wind','石の間に低い響きが残った。風が止むと、聞こえなくなった。');ambientAudio.stoneResonance?.();}}else windSeconds=0;
 }
 let windSeconds=0;return{update,get stats(){return{grassUpdates,grassInstances:region.windBases.length,near:walking.active&&walking.state.feet.x<-165}},get visited(){return !!stay.data.discoveries['nine:visit']}};
}
