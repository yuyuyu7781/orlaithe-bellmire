import {lakeWaterPhase,lakeWaterOffset} from './lake-water-level.js';
// A small deterministic island; terrain and walking use identical heights.
export const caerithLayout={center:[-367,-76],entry:[-367,6.12,-56],dock:[-367,5.78,-53],bounds:{minX:-387,maxX:-347,minZ:-98,maxZ:-50}};
const coast=a=>1+.055*Math.sin(a*3)+.025*Math.cos(a*5);
export function caerithHeight(x,z){if(Math.abs(x+367)<=1.2&&z>=-59.6&&z<=-52.6)return 6.12;const ux=(x+367)/17,uz=(z+76)/19,r=Math.hypot(ux,uz)/coast(Math.atan2(uz,ux));return r<=1?6.02+1.7*Math.pow(1-r,1.3)+.10*Math.sin((x+367)*.3)*Math.sin((z+76)*.2):null;}
export function buildCaerith({THREE,scene,box,lake}){
 const root=new THREE.Group();root.name='Isle of Caerith';scene.add(root);const floors=[],targets=[],catSteps=[],materials={...lake.materials,grass:lake.materials.grass.clone(),stone:lake.materials.stone.clone()};materials.grass.color.setHex(0x76816f);materials.stone.color.setHex(0x8b9593);
 const piece=(x,y,z,w,h,d,m,soft=false)=>{const o=box(x,y,z,w,h,d,m,root);o.userData.walkSoft=soft;return o;};
 const positions=[],segments=36,rings=7;
 for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const point=(r,k)=>{const a=k/segments*Math.PI*2,x=-367+17*r*coast(a)*Math.cos(a),z=-76+19*r*coast(a)*Math.sin(a);return[x,caerithHeight(x,z)??6.02,z];};const a=point(j/rings,i),b=point((j+1)/rings,i),c=point((j+1)/rings,i+1),d=point(j/rings,i+1);positions.push(...a,...d,...b,...b,...d,...c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();const land=new THREE.Mesh(g,materials.grass);land.userData.walkSoft=true;root.add(land);floors.push(land);
 // The original lake stays unchanged. One opaque water apron opens its far side.
 const water=piece(-367,5.65,-78,90,.018,65,materials.water,true);water.name='Lake Lun island-side water';
 const skirt=new THREE.Mesh(new THREE.CylinderGeometry(1,1,1,36,1,true),materials.stone);skirt.position.set(-367,4.75,-76);skirt.scale.set(17,2.54,19);const sp=skirt.geometry.attributes.position;for(let i=0;i<sp.count;i++){const a=Math.atan2(sp.getZ(i),sp.getX(i)),c=coast(a);sp.setXYZ(i,sp.getX(i)*c,sp.getY(i),sp.getZ(i)*c);}sp.needsUpdate=true;skirt.geometry.computeVertexNormals();skirt.userData.walkSoft=true;root.add(skirt);
 const landing=piece(-367,5.97,-56.1,2.4,.15,7,materials.wood,true);landing.userData.walkSurface=true;floors.push(landing);
 for(const x of [-367.9,-366.1])for(const z of [-57,-53.3])piece(x,5,z,.14,1.05,.14,materials.wood,true);
 const notice=(id,label,text,o,profiles=['human','cat'])=>{targets.push({id,kind:'inspect',label,text,object:o,localPoint:[0,.25,0],profiles,range:2.5});return o;};
 notice('caerith:landing','古い船着場','濡れた縄の跡が、何度も同じ木に重なっている。',landing);
 // Missing sectors make a broken foundation, not a sealed arena.
 for(let i=0;i<9;i++){if(i===2||i===6)continue;const a=i*Math.PI*2/9,x=-367+3.2*Math.sin(a),z=-78+3.2*Math.cos(a),y=caerithHeight(x,z);const wall=piece(x,y-.06,z,1.65,.45+(i%3)*.3,.65,materials.stone);wall.rotation.y=a; if(i===0)notice('caerith:foundation','円の残る基礎','草に隠れた石の端は、まっすぐではなかった。',wall);}
 const tower=piece(-370,caerithHeight(-370,-81)-.08,-81,2.6,2.6,.55,materials.stone);notice('caerith:tower','崩れた塔','壁の欠けたところから、湖の向こうが見える。何を見ていたのだろう。',tower);
 const second=piece(-371.4,caerithHeight(-371.4,-80.2)-.08,-80.2,.5,1.65,1.8,materials.stone);second.rotation.z=.06;
 const rubble=[];for(let i=0;i<5;i++){const x=i===3?-364:-372+i*1.6,z=i===3?-71:-73-(i%2)*1.6,y=caerithHeight(x,z);const o=piece(x,y-.035,z,1.1,.22+(i%2)*.08,.65,materials.stone);o.rotation.y=i*.27;o.userData.walkSurface=true;catSteps.push(o);rubble.push(o);}
 notice('caerith:cat-lines','倒石の裏の線','石の下側に浅い線。雨の匂いの奥に、乾いた土が残っている。',rubble[0],['cat']);notice('caerith:cat-circle','低い石の円','地面に近いところだけ、丸い傷が残っていた。',rubble[4],['cat']);
 const scratch=new THREE.Mesh(new THREE.TorusGeometry(.12,.008,3,12,Math.PI*1.6),materials.reeds);scratch.rotation.x=-Math.PI/2;scratch.position.y=.116;scratch.userData.walkSoft=true;rubble[4].add(scratch);
 notice('caerith:shore-stone','湖側の石','水の届いたところだけ、石の色が濃い。',piece(-358,caerithHeight(-358,-69)-.04,-69,.7,.32,.8,materials.stone));
 // Three low gaps remain dry; human-sized bodies use the open path beside them.
 for(const [x,z]of [[-363,-69],[-375,-77],[-368,-84]]){const y=caerithHeight(x,z);piece(x,y+.6,z,1.6,.14,.65,materials.stone);for(const dx of [-.7,.7])piece(x+dx,y-.02,z,.22,.64,.65,materials.stone);}
 for(const [id,x,z,focus,label]of [['lake',-362,-84,[-337,5.7,-24],'湖を眺める'],['lunmere',-373,-84,[-429,7,14],'Lunmere方向を眺める']]){const y=caerithHeight(x,z),o=piece(x,y,z,.45,.03,.5,materials.stone,true);targets.push({id:'caerith:view-'+id,kind:'quiet-view',verb:'眺める',label,text:'湖を隔てると、町の声は届かない。',object:o,localPoint:[0,.1,0],profiles:['human','cat'],range:2.4,viewEye:[x,y+1.5,z],viewFocus:focus});}
 const grass=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),materials.grass,24),m=new THREE.Matrix4();for(let i=0;i<24;i++){const a=i*2.399,r=9+(i%4),x=-367+r*Math.cos(a),z=-76+r*Math.sin(a);m.compose(new THREE.Vector3(x,caerithHeight(x,z)+.1,z),new THREE.Quaternion(),new THREE.Vector3(.55,.2,.45));grass.setMatrixAt(i,m);}grass.userData.walkSoft=true;root.add(grass);
 const far=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),materials.grass,6);for(let i=0;i<6;i++){m.compose(new THREE.Vector3(-407+i*15,5.4,-114-2*Math.sin(i)),new THREE.Quaternion(),new THREE.Vector3(11,1.6,5));far.setMatrixAt(i,m);}far.userData.walkSoft=true;root.add(far);
 const submerged=new THREE.Group();root.add(submerged);for(let i=0;i<4;i++)box(-378-i*1.3,5.02,-48+i*.6,1,.68,.55,materials.stone,submerged).userData.walkSoft=true;
 return{root,floors,targets,catSteps,materials,water,landing,submerged,heightAt:caerithHeight,layout:caerithLayout};
}
export function connectCaerith({caerith,walking,inspections,shopSystem,stay,townLife,ambientAudio,dialogue}){
 let lowWater=false;for(const t of caerith.targets){t.enabled=()=>!shopSystem.current&&!!stay.data.discoveries['region:caerith'];inspections.resolver.register(t);}
 const clue={id:'lake:submerged-line',kind:'inspect',label:'水の下の石列',object:caerith.submerged,localPoint:[-379,5.8,-48],profiles:['human','cat'],range:8,text:'水の下に、まっすぐ続く石が見えた。先は、まだ水に隠れている。',enabled:()=>lowWater&&!shopSystem.current};inspections.resolver.register(clue);
 function remember(id,text,mode=walking.state.profile.id){if(stay.data.discoveries[id])return;stay.data.discoveries[id]={day:stay.data.currentDay,period:stay.data.dayPhase,playerMode:mode,label:id};stay.note(id,text,{playerMode:mode,kind:mode==='cat'?'cat':'place'});stay.changed();}
 inspections.onPresent(({entry,text})=>{if(entry.id.startsWith('caerith:')||entry.id===clue.id)remember(entry.id,text);});
 function apply(){const s=townLife.state;lowWater=lakeWaterPhase()!=='normal';caerith.submerged.visible=lowWater;caerith.materials.stone.color.setHex(s.weather==='rain'?0x737e7e:0x8b9593);caerith.materials.grass.color.setHex(s.season==='autumn'?0x85856d:s.weather==='rain'?0x647464:0x76816f);}
 townLife.onChange(apply);apply();ambientAudio.zones.push({id:'caerith-water',sourceId:'lake-water',area:'town',position:[-367,6,-76],radius:43,gain:.075,src:null},{id:'caerith-wind',sourceId:'nine-wind',area:'town',position:[-367,9,-76],radius:30,gain:.055,src:null});
 for(const id of ['lunHost','lunBoat','lunWatcher']){const c=dialogue.characters.find(c=>c.id===id),previous=c.calendarReply;c.calendarReply=arg=>stay.data.discoveries['region:caerith']&&arg.index%3===0?({lunHost:'島から帰ったんだね。温かいものを用意しようか。',lunBoat:lowWater?'今日は岸の石が出ている。舟底をこすらないように。':'あの船着場は古いけれど、縄はまだ掛けられるよ。',lunWatcher:stay.data.discoveries[clue.id]?'水が引くと、昔からあそこに石が見えるんだ。':'島の草は、ここの岸より少し遅く乾くよ。'}[id]):previous?.(arg);}
 const finn=dialogue.characters.find(c=>c.id==='greenBard'),previousFinn=finn.calendarReply;finn.calendarReply=arg=>stay.data.discoveries['caerith:cat-circle']&&arg.profile==='cat'?'低いところには、消えずに残るものもあるね。':stay.data.discoveries['region:caerith']&&arg.index%3===0?'あの島も、湖から見ると小さくなるね。':previousFinn?.(arg);
 dialogue.onSpeak(({character})=>{if(character.id==='greenBard'&&walking.state.feet.x<-397&&!shopSystem.current)remember('finn:lunmere','湖岸で、フィンの弦を調える音が聞こえた。');});
 return{apply,remember,get waterLevel(){return{phase:lakeWaterPhase(),visualOffset:lakeWaterOffset()};},get lowWater(){return lowWater}};
}
