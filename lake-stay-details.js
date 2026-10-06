// Event-driven additions preserve the original lake, pier and skiff geometry.
export function deepenLakeStay({THREE,scene,box,lake,walking,inspections,townLife,stay,shopSystem,ambientAudio}){
 const wood=lake.materials.wood,stone=lake.materials.stone,root=lake.root;
 const bench=box(-308,6.04,-10,1.8,.43,.38,wood,root);bench.userData.walkSoft=true;
 const ashes=box(-306.5,6.04,-14,.6,.025,.5,stone,root);ashes.userData.walkSoft=true;
 const shoreRest={id:'lake:bench',kind:'quiet-view',verb:'座る',label:'湖畔の腰掛け',object:bench,localPoint:[0,.2,0],profiles:['human','cat'],range:2.4,viewEye:[-308,7.02,-10],viewFocus:[-345,5.8,-22],text:'岸の腰掛けで、対岸が霧から戻るのを待った。',enabled:()=>!shopSystem.current};inspections.resolver.register(shoreRest);
 const distant=new THREE.Mesh(new THREE.BoxGeometry(.12,.12,.12),new THREE.MeshStandardMaterial({color:0xd6bd90,emissive:0xe1b575,emissiveIntensity:.6,roughness:1}));distant.position.set(-401,8,12);distant.userData.walkSoft=true;root.add(distant);
 const mist={id:'lake:mist-light',kind:'inspect',label:'霧の向こうの灯り',object:lake.log,localPoint:[0,.5,0],profiles:['human','cat'],range:2.8,text:'木立の向こうに、小さな灯り。水が動くと、少しだけ隠れた。',enabled:()=>!shopSystem.current&&distant.visible};inspections.resolver.register(mist);
 const boat={id:'lake-skiff',object:lake.boat,boardingPoint:[-321,6.15,-24],seatPoint:[-321,6,-27],dockState:'moored',routePossibilities:['lunmere-pier'],controllable:false};
 const boarding={id:'lake:board',kind:'quiet-view',verb:'乗って眺める',label:'係留された小舟',object:lake.pier,localPoint:lake.pier.worldToLocal(new THREE.Vector3(...boat.boardingPoint)).toArray(),profiles:['human'],range:1.6,viewEye:[-321,6.7,-27],viewFocus:[-348,5.8,-27],text:'係留された舟から見ると、岸が少し高くなった。',enabled:()=>!shopSystem.current};inspections.resolver.register(boarding);
 ambientAudio.zones.push({id:'lake-pier-wood',area:'town',position:[-321,6,-24],radius:7,gain:.035,src:null},{id:'lake-cool-wind',sourceId:'nine-wind',area:'town',position:[-310,8,-15],radius:50,gain:.035,src:null},{id:'lake-distant-birds',area:'town',position:[-336,9,-22],radius:35,gain:.035,src:null});
 function apply(){const s=townLife.state,night=s.period==='night'||s.weather==='night';lake.materials.water.color.setHex(s.weather==='dawn'?0x617f8b:s.weather==='rain'?0x4f6971:night?0x354f5e:s.period==='evening'?0x748985:0x65858a);distant.visible=s.weather==='fog'&&s.dayIndex%3===2&&s.weather!=='blackout';const z=ambientAudio.zones.find(z=>z.id==='lake-water');if(z)z.gain=s.weather==='fog'?.12:.18;}
 townLife.onChange(apply);apply();return {boat,targets:[shoreRest,mist,boarding],distant,apply};
}
