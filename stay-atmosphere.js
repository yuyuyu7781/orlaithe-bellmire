// Reuse the fourteen cultural objects, journal discoveries and bell triggers.
// Similar marks are noticed in context; no additional quest/interaction registry.
export function createStayAtmosphere({THREE,stay,townLife,inspections,dialogue,ambientAudio}){
 const entries=inspections.resolver.entries,marks=[],baseTexts=new Map(),ink=new THREE.MeshStandardMaterial({color:0x6a6856,roughness:1});
 for(const id of ['moorings','star-chart']){const entry=entries.get(id);if(!entry)continue;baseTexts.set(id,entry.text);const root=new THREE.Group();root.name='Faint related mark '+id;entry.object.add(root);
  if(id==='moorings'){
   // A tiny worn stone tag tied to the original mooring post, inside its bounds.
   const stone=new THREE.Mesh(new THREE.BoxGeometry(.14,.18,.008),new THREE.MeshStandardMaterial({color:0xaaa38c,roughness:1}));stone.position.set(0,.10,.104);stone.userData.walkSoft=true;root.add(stone);
   for(let i=0;i<9;i++){const line=new THREE.Mesh(new THREE.BoxGeometry(.005,.07+(i%3)*.008,.002),ink);line.position.set(-.049+i*.012,.10,.109);line.userData.walkSoft=true;root.add(line);}
  }else{
   // The existing wall chart has a circle; these irregular pin-size dots need
   // not be the same emblem as the upstream stone's straight cuts.
   for(let i=0;i<9;i++){const dot=new THREE.Mesh(new THREE.BoxGeometry(.013,.014,.006),ink),a=i*Math.PI*2/9;dot.position.set(Math.cos(a)*.12,Math.sin(a)*.12,.078);dot.userData.walkSoft=true;root.add(dot);}
  }marks.push({id,root});
 }
 const belfry=entries.get('belfry-mark'),belfryText=belfry?.text;
 let busy=false,bellChanged=false;
 function sync(){if(busy)return;busy=true;try{
  const d=stay.data,day=d.currentDay;for(const m of marks)m.root.visible=day>=2;
  if(belfry)belfry.text=belfryText+(day>=3&&bellChanged?' 近くで、昨日と鐘の響きが違ったという話を聞いた。':'');
  const mooring=entries.get('moorings'),chart=entries.get('star-chart');
  if(mooring)mooring.text=baseTexts.get('moorings')+(day>=2?' 杭の石片には、数えにくい短い溝が並ぶ。上流の石に、少し似ている。':'');
  if(chart)chart.text=baseTexts.get('star-chart')+(day>=2?' 円の縁に九つの小さな点。水辺で見た線とは違うが、同じ数にも見える。':'');
  if(d.discoveries['outskirts-stone']&&d.discoveries['belfry-mark'])stay.note('road-bell-marks','道端の石と鐘楼の印。似た線でも、同じ向きには並んでいなかった。',{kind:'place'});
  const stone=d.discoveries['event:upstream-stone'];
  if(day>=2&&stone&&d.discoveries.moorings)stay.note('related-water-marks','上流の石と港の古い印は、少し似ている。',{kind:'place'});
  if(day>=2&&stone&&d.discoveries['star-chart'])stay.note('related-star-circle','水路の線と、星図の円を囲む点。数え直すと、どちらも九つだった。',{kind:'place'});
 }finally{busy=false;}}
 stay.onChange(sync);townLife.onChange(sync);sync();
 ambientAudio.onBell(trigger=>{if(trigger.day>=3){bellChanged=true;sync();}});
 inspections.onPresent(({entry,kind})=>{if(kind==='talk')return;if(entry.id==='belfry-mark'&&stay.data.currentDay>=3&&bellChanged)stay.note('bell-different','鐘楼への道で、昨日と鐘の響きが違ったという話を聞いた。',{kind:'rumor'});sync();});
 dialogue.onSpeak(({character,text,profile})=>{
  if(profile!=='human'||stay.data.currentDay<2)return;
  if(character.id==='starmaker'&&/九つの点/.test(text))stay.note('nerissa-old-chart','ネリッサは、円を九つの点が囲む古い星図を知っていた。意味はまだ分からないという。',{kind:'person'});
  if(stay.data.currentDay>=3&&/鐘.*違った/.test(text))stay.note('bell-different','昨日と鐘の余韻が少し違った、とネリッサは言った。',{kind:'rumor'});
 });
 return {marks,sync,get bellChanged(){return bellChanged},get futureCalendar(){return townLife.state.calendar},addedLights:0};
}
