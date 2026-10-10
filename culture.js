// Small, reusable street details. Wall fittings are separate from grounded goods;
// the existing contact policy and pedestrian corridors remain authoritative.
export function addTownCulture({THREE,scene,grounding,groundedObjects,lit,well,well106,bookTable,landings}){
  const root=new THREE.Group();root.name='Bellmire everyday customs';scene.add(root);
  const mat=(color,roughness=.96,metalness=.02)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
  const m={wood:mat(0x59402f),iron:mat(0x343733,.65,.45),brass:mat(0x806743,.65,.4),stone:mat(0x77756b),cut:mat(0x55594e),green:mat(0x53624d),blue:mat(0x657674),red:mat(0x765147),linen:mat(0xb9aa8c),leather:mat(0x6d4b38),wax:mat(0xc4b695),wicker:mat(0x8b7351)};
  const goods=[],signs=[],fittings=[],landingBells=[];
  scene.updateMatrixWorld(true);
  function facade(x,y,z){let front=z;scene.traverse(o=>{if(!o.isMesh)return;for(let p=o;p;p=p.parent)if(!p.visible||p===root)return;const g=o.geometry.parameters||{};if(!(g.width>=3&&g.width<18&&g.depth>=3&&g.depth<18&&g.height>=2))return;const b=new THREE.Box3().setFromObject(o,true);if(x>=b.min.x&&x<=b.max.x&&y>=b.min.y&&y<=b.max.y&&b.max.z>=z-.35&&b.max.z<=z+5)front=Math.max(front,b.max.z+.002);});return front;}
  function mesh(g,ma,parent,x=0,y=0,z=0){const o=new THREE.Mesh(g,ma);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
  function block(p,x,y,z,w,h,d,ma){return mesh(new THREE.BoxGeometry(w,h,d),ma,p,x,y+h/2,z);}
  function ring(p,x,y,z,r,ma=m.brass){return mesh(new THREE.TorusGeometry(r,.018,4,12),ma,p,x,y,z);}
  function line(p,a,b,ma=m.brass,r=.014){const v=new THREE.Vector3(...b).sub(new THREE.Vector3(...a));const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),5),ma,p,...a);o.position.addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;}
  function nine(p,x,y,z){for(let i=0;i<9;i++)block(p,x+(i-4)*.055,y,z,.018,.11+(i%3)*.018,.016,m.brass);}
  function bell(p,x,y,z,s=.15){mesh(new THREE.CylinderGeometry(s*.45,s,s*1.1,7),m.brass,p,x,y,z);mesh(new THREE.SphereGeometry(s*.18,6,4),m.iron,p,x,y-s*.66,z);ring(p,x,y+s*.7,z,s*.25,m.iron);}
  function emblem(p,kind){
    if(kind==='loaf'){const b=mesh(new THREE.SphereGeometry(.22,8,5),m.linen,p,0,0,.11);b.scale.set(1.45,.65,.3);for(let i=-1;i<=1;i++)line(p,[i*.13-.035,.06,.18],[i*.13+.035,-.04,.18],m.wood,.012);}
    else if(kind==='book'){block(p,-.13,-.17,.1,.23,.34,.045,m.linen);block(p,.13,-.17,.1,.23,.34,.045,m.linen);line(p,[0,-.17,.14],[0,.17,.14],m.leather);}
    else if(kind==='bell')bell(p,0,0,.11,.20);
    else if(kind==='cup'){block(p,-.03,-.18,.1,.28,.32,.065,m.brass);ring(p,.18,-.015,.13,.10);}
    else if(kind==='star'){ring(p,0,0,.11,.24);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,b=(i+2)*Math.PI*2/5;line(p,[Math.sin(a)*.17,Math.cos(a)*.17,.11],[Math.sin(b)*.17,Math.cos(b)*.17,.11]);}}
    else if(kind==='tool'){line(p,[-.17,-.19,.11],[.17,.18,.11],m.linen,.027);block(p,.08,.09,.11,.27,.08,.04,m.iron);}
    else{ring(p,0,0,.11,.23,m.wicker);nine(p,0,-.055,.11);}
  }
  // Above head height, with a bracket touching the facade and two hanging links.
  function sign(name,x,y,z,kind){z=facade(x,y+.25,z);const g=new THREE.Group();g.name=name+' hanging sign';g.position.set(x,y,z);root.add(g);signs.push(g);
    block(g,0,.15,.035,.085,.68,.07,m.iron);block(g,0,.73,.48,.07,.065,.95,m.iron);
    line(g,[0,.26,.07],[0,.73,.87],m.iron,.022);block(g,0,.73,.86,.72,.065,.065,m.iron);
    for(const dx of [-.28,.28]){ring(g,dx,.49,.86,.046,m.iron);line(g,[dx,.49,.86],[dx,.76,.86],m.iron,.014);line(g,[dx,.44,.86],[dx,.27,.86],m.iron,.014);}
    block(g,0,-.34,.86,.85,.60,.13,m.wood);for(const dx of [-.35,.35])block(g,dx,-.34,.938,.027,.60,.015,m.iron);
    const face=new THREE.Group();face.position.set(0,-.035,.82);g.add(face);emblem(face,kind);
    const back=new THREE.Group();back.position.set(0,-.035,.90);back.rotation.y=Math.PI;g.add(back);emblem(back,kind);
  }
  sign('First Loaf',-34.55,6.9,27.0,'loaf');sign('Crooked Leaf',-20.6,7.0,31.61,'book');
  sign('Lantern and Lark',-43.2,8.65,2.50,'bell');sign('Copper Kettle',-7.55,6.0,13.73,'cup');
  sign('Orrery House',5.6,9.1,.75,'star');sign('Woodworker',10.5,11.6,-10.75,'tool');
  sign('Market weavers',23.2,7.6,7.01,'basket');
  function herb(p,x,y,z){line(p,[x,y,z],[x,y+.37,z],m.wicker);for(let i=0;i<5;i++){const a=i*2.4;const leaf=mesh(new THREE.ConeGeometry(.07,.24,4),i%2?m.green:m.blue,p,x+Math.cos(a)*.08,y+.22,z+Math.sin(a)*.07);leaf.rotation.z=Math.cos(a)*.4;}ring(p,x,y+.12,z,.055,m.linen);}
  function candle(p,x,y,z){mesh(new THREE.CylinderGeometry(.065,.075,.24,7),m.wax,p,x,y+.12,z);const flameMat=mat(0xc6a66b);flameMat.emissive.set(0xc38c46);flameMat.emissiveIntensity=.65;lit.push(flameMat);mesh(new THREE.ConeGeometry(.035,.085,5),flameMat,p,x,y+.285,z);}
  function basket(p,x,y,z){mesh(new THREE.CylinderGeometry(.24,.18,.28,9),m.wicker,p,x,y+.14,z);const rim=ring(p,x,y+.29,z,.235,m.wood);rim.rotation.x=Math.PI/2;for(let i=0;i<9;i++){const a=i*Math.PI*2/9;line(p,[x+Math.sin(a)*.18,y+.02,z+Math.cos(a)*.18],[x+Math.sin(a)*.24,y+.28,z+Math.cos(a)*.24],m.linen,.009);}}
  // Reject crowded candidates using actual existing mesh bounds. Grounding also
  // rejects water, buildings, stairs and the reserved moving-resident lanes.
  scene.updateMatrixWorld(true);const occupied=[];
  scene.traverse(o=>{if(!o.isMesh||o.userData.walkSoft)return;for(let p=o;p;p=p.parent)if(!p.visible||p===root)return;const b=new THREE.Box3().setFromObject(o,true);if(b.max.y-b.min.y>.09&&b.max.x-b.min.x<18&&b.max.z-b.min.z<18)occupied.push(b);});
  function overlaps(a,b){return a.max.x>b.min.x-.10&&a.min.x<b.max.x+.10&&a.max.z>b.min.z-.10&&a.min.z<b.max.z+.10&&a.max.y>b.min.y+.04&&a.min.y<b.max.y-.04;}
  function parcel(name,x,z,kind){const g=new THREE.Group();g.name=name;g.position.set(x,0,z);root.add(g);
    if(kind==='stone'){block(g,0,0,0,.46,.68,.30,m.stone);ring(g,0,.45,.158,.13,m.cut);nine(g,0,.38,.17);}else{block(g,0,0,0,.76,.40,.52,m.wood);for(const sx of [-.31,.31])block(g,sx,0,.27,.045,.40,.035,m.iron);}
    if(kind==='flour'){const sack=mesh(new THREE.SphereGeometry(.23,8,6),m.linen,g,0,.63,0);sack.scale.set(1,1.2,.8);ring(g,0,.80,0,.075,m.wicker).rotation.x=Math.PI/2;}
    if(kind==='bread'){basket(g,0,.40,0);for(const dx of [-.13,.10]){const loaf=mesh(new THREE.SphereGeometry(.14,7,5),m.linen,g,dx,.76,0);loaf.scale.set(1,.55,.8);}}
    if(kind==='luggage'){block(g,-.12,.40,0,.35,.25,.35,m.leather);block(g,.19,.40,.02,.16,.15,.30,m.linen);ring(g,-.12,.68,0,.07,m.iron);for(const dx of [-.22,-.03])block(g,dx,.40,.182,.022,.25,.015,m.brass);}
    if(kind==='net'){basket(g,-.12,.40,0);const rope=ring(g,.19,.43,.02,.15,m.wicker);rope.rotation.x=Math.PI/2;block(g,.16,.62,.15,.14,.18,.025,m.wood);const net=mesh(new THREE.PlaneGeometry(.42,.25,4,3),new THREE.MeshStandardMaterial({color:0x777262,roughness:1,wireframe:true,side:THREE.DoubleSide}),g,-.03,.82,0);net.userData.walkSoft=true;line(g,[-.26,.95,0],[.21,.95,0],m.wood,.015);}
    if(kind==='fish'){basket(g,0,.40,0);for(const dx of [-.10,.09]){const fish=mesh(new THREE.SphereGeometry(.10,6,4),m.blue,g,dx,.73,0);fish.scale.set(.70,.48,1.7);const tail=mesh(new THREE.ConeGeometry(.065,.10,3),m.linen,g,dx,.73,-.19);tail.rotation.x=-Math.PI/2;}}
    if(kind==='orrery'){for(const r of [.13,.19]){const o=ring(g,0,.64,0,r,m.brass);o.rotation.y=r===.13?.8:0;}mesh(new THREE.SphereGeometry(.035,7,5),m.brass,g,0,.64,0);block(g,0,.40,0,.055,.06,.055,m.brass);}
    if(kind==='herbs'){basket(g,0,.40,0);herb(g,-.10,.62,0);herb(g,.10,.62,0);}
    if(kind==='wool'){for(const dx of [-.18,.16]){const o=mesh(new THREE.IcosahedronGeometry(.19,1),m.linen,g,dx,.58,0);o.scale.set(1,.85,1);}block(g,0,.40,.19,.44,.09,.16,m.blue);}
    if(kind==='dye'){for(let i=0;i<3;i++)block(g,0,.40+i*.065,0,.58-i*.07,.065,.38,[m.blue,m.red,m.green][i]);line(g,[-.19,.59,.195],[.19,.59,.195],m.linen,.008);}
    if(kind==='tools'){block(g,-.12,.40,0,.27,.055,.38,m.leather);for(const dx of [.12,.24]){line(g,[dx,.43,-.15],[dx,.43,.17],m.wood,.025);block(g,dx,.42,.12,.13,.035,.09,m.iron);}}
    if(kind==='candles'){candle(g,-.16,.40,0);candle(g,.10,.40,.08);block(g,.17,.40,-.15,.18,.03,.19,m.leather);}
    if(kind==='barrel'){mesh(new THREE.CylinderGeometry(.22,.24,.43,8),m.wood,g,0,.615,0);for(const y of [.49,.76]){const r=ring(g,0,y,0,.23,m.iron);r.rotation.x=Math.PI/2;}}
    // Try a few close-by sites without moving any of the town's old objects.
    const offsets=[[0,0]];for(let r=.35;r<=2.5;r+=.35)for(let i=0;i<24;i++)offsets.push([Math.cos(i*Math.PI/12)*r,Math.sin(i*Math.PI/12)*r]);
    let placed=false;for(const [dx,dz]of offsets){
      g.position.set(x+dx,0,z+dz);delete g.userData.grounding;grounding.place({object:g});g.updateWorldMatrix(true,true);
      if(g.userData.grounding?.unresolved||Math.hypot(g.position.x-x,g.position.z-z)>3.0)continue;
      const b=new THREE.Box3().setFromObject(g,true);if(occupied.some(o=>overlaps(b,o)))continue;
      occupied.push(b);placed=true;break;
    }
    if(!placed){root.remove(g);console.warn('No clear cultural detail site:',name);return null;}
    groundedObjects.push({object:g});goods.push(g);return g;
  }
  for(const q of [['Bakery flour and wool',-35.4,28.0,'flour'],['Inn candles',-44.3,3.0,'candles'],['Tavern cooperage',-14.8,11.55,'barrel'],['Market dyed cloth',24.0,8.1,'dye'],['Market herb basket',19.4,14.9,'herbs'],['Square wool',13.4,21.4,'wool'],['Workshop tools',14.9,-8.7,'tools'],['Harbor herbs',-24.4,34.8,'herbs'],['Harbor sailcloth',24.7,34.7,'dye'],['Cableway parcels',46.3,12.7,'wool'],['Alley candles',-40.4,19.1,'candles']])parcel(...q);
  // Small stock on the existing book display, not another crate in a full lane.
  const bindery=new THREE.Group();bindery.name='Bookbinder leather and awl';bookTable.add(bindery);
  const td=bookTable.geometry.parameters;bindery.position.set(td.width/2-.23,td.height/2+.005,td.depth/2-.10);
  block(bindery,0,0,0,.30,.035,.16,m.leather);line(bindery,[-.09,.045,0],[.09,.045,0],m.wood,.017);fittings.push(bindery);
  // A candle niche beneath the inn gallery, with a worn circle instead of text.
  const niche=new THREE.Group();niche.name='Inn wall candle niche';niche.position.set(-40.0,7.5,2.505);root.add(niche);
  block(niche,0,-.26,.035,.46,.62,.06,m.cut);for(const x of [-.26,.26])block(niche,x,-.30,.14,.09,.70,.25,m.stone);
  block(niche,0,-.32,.14,.62,.09,.28,m.stone);block(niche,0,.37,.14,.62,.09,.28,m.stone);
  candle(niche,0,-.23,.16);ring(niche,0,.24,.072,.08,m.brass);fittings.push(niche);
  niche.traverse(o=>{if(o.isMesh)o.userData.walkSoft=true;});
  // Dyers' samples and dried herbs hang from short iron pegs on a shop wall.
  const samples=new THREE.Group();samples.name='Weaver samples and dried herbs';samples.position.set(24.6,5.8,facade(24.6,5.8,7.0));root.add(samples);
  for(let i=0;i<3;i++){block(samples,(i-1)*.25,.40,.035,.035,.08,.10,m.iron);block(samples,(i-1)*.25,-.14,.08,.20,.57,.035,[m.green,m.blue,m.red][i]);}
  herb(samples,.62,.08,.10);block(samples,.62,.42,.03,.05,.07,.12,m.iron);fittings.push(samples);
  samples.traverse(o=>{if(o.isMesh)o.userData.walkSoft=true;});
  function wallMark(name,x,y,z,kind){const g=new THREE.Group();g.name=name;g.position.set(x,y,facade(x,y,z));root.add(g);fittings.push(g);
    block(g,0,-.22,.02,.44,.44,.045,m.stone);ring(g,0,0,.058,.16,m.cut);if(kind==='nine')nine(g,0,-.07,.065);else if(kind==='star'){for(let i=0;i<5;i++){const a=i*Math.PI*2/5,b=(i+2)*Math.PI*2/5;line(g,[Math.sin(a)*.12,Math.cos(a)*.12,.065],[Math.sin(b)*.12,Math.cos(b)*.12,.065],m.cut,.008);}}else if(kind==='knot'){for(const dx of [-.055,.055]){const r=ring(g,dx,0,.065,.09,m.cut);r.scale.y=.7;}}else{for(let i=0;i<8;i++){const a=i*.72;mesh(new THREE.SphereGeometry(.018,5,4),m.cut,g,Math.cos(a)*(.025+i*.014),Math.sin(a)*(.025+i*.014),.065);}}
    g.traverse(o=>{if(o.isMesh)o.userData.walkSoft=true;});return g;
  }
  wallMark('Traveller touchstone',-32.9,4.55,27.005,'nine');wallMark('Old alley spiral',-42.7,4.3,25.505,'spiral');
  wallMark('Harbor circle',17.0,5.7,34.105,'nine');wallMark('Bookshop worn circle',-16.4,4.45,31.605,'spiral');
  // Small door rings and bells, fixed against existing timber doors.
  for(const [x,y,z]of [[-31.8,4.65,27.171],[-20.8,4.1,31.771],[-7.55,4.8,13.731]]){const g=new THREE.Group();g.position.set(x,y,facade(x,y,z));g.name='Door iron and small bell';root.add(g);block(g,0,-.13,0,.10,.29,.04,m.iron);ring(g,0,0,.05,.085,m.iron);bell(g,.18,.11,.05,.07);fittings.push(g);g.traverse(o=>{if(o.isMesh)o.userData.walkSoft=true;});}
  // Follow the already-grounded wells rather than guessing a terrace height.
  for(const w of [well,well106]){const b=new THREE.Box3().setFromObject(w,true),c=b.getCenter(new THREE.Vector3()),r=(b.max.x-b.min.x)/2;const g=new THREE.Group();g.name='Well circle and nine worn marks';g.position.set(c.x,b.max.y-.18,c.z+r+.025);root.add(g);ring(g,0,0,0,.12,m.cut);nine(g,0,-.045,.02);fittings.push(g);g.traverse(o=>{if(o.isMesh)o.userData.walkSoft=true;});}
  for(const [x,y,z]of landings){const g=new THREE.Group();g.name='Cableway travellers bell';g.position.set(x,y,z);root.add(g);bell(g,0,0,0,.095);fittings.push(g);landingBells.push(g);g.traverse(o=>{if(o.isMesh)o.userData.walkSoft=true;});}
  return {root,goods,signs,fittings,landingBells,addGoods:parcel,addMark:wallMark,tools:{mesh,block,ring,line,materials:m}};
}
