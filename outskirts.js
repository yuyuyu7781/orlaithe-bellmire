import {createDetailBatch} from './miniature.js';
// One modest west approach; no changes to town terrain or watercourse.
export const outskirtsLayout={
 gate:[-53,6.25,5],hill:[-109,8.65,-14],
 road:[[-38.55,6.25,5],[-41.8,6.25,5],[-41.8,6.25,4.45],[-44.5,6.25,4.45],[-45.1,6.25,5],[-49,6.25,5],[-58,6.25,5],[-70,6.75,3],[-83,7.25,-2],[-95,7.85,-8],[-109,8.65,-14]],
 catPassage:[-74,6.917,5.8],catDiscovery:[-77,7.042,4.4]
};
export function buildOutskirts({THREE,scene,box}){
 const root=new THREE.Group();root.name='Quiet west approach and lookout hill';scene.add(root);
 const stone=new THREE.MeshStandardMaterial({color:0x94958b,roughness:1}),grass=new THREE.MeshStandardMaterial({color:0x777e60,roughness:1}),path=new THREE.MeshStandardMaterial({color:0xa49c84,roughness:1}),wood=new THREE.MeshStandardMaterial({color:0x6c5845,roughness:1}),leaf=new THREE.MeshStandardMaterial({color:0x586951,roughness:1});
 const floors=[],roadPoints=[],catSteps=[];
 const bankHeight=(x,z)=>{let height=-Infinity;for(const o of floors){o.updateWorldMatrix(true,true);const b=new THREE.Box3().setFromObject(o,true);if(x>=b.min.x&&x<=b.max.x&&z>=b.min.z&&z<=b.max.z)height=Math.max(height,b.max.y);}return height;};
 const slab=(x,y,z,w,h,d,m)=>{const o=box(x,y-h,z,w,h,d,m,root);o.castShadow=false;return o};
 // Supported shallow terraces are actual floor slabs, not invisible ramp collisions.
 for(let segment=1;segment<outskirtsLayout.road.length;segment++){
  const a=outskirtsLayout.road[segment-1],b=outskirtsLayout.road[segment],n=Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/2.2);
  for(let i=0;i<n;i++){const u=(i+.5)/n,x=a[0]+(b[0]-a[0])*u,z=a[2]+(b[2]-a[2])*u,y=a[1]+(b[1]-a[1])*u;
   const floor=slab(x,y,z,2.5,Math.max(.2,y-3.5),9,grass);floor.userData.walkSurface=true;floor.name='Outskirts supported grass bank';floors.push(floor);
   const paving=slab(x,y+.012,z,2.5,.025,2.4,path);paving.userData.walkSurface=true;roadPoints.push([x,y+.012,z]);
  }
 }
 const landing=slab(-110.2,8.65,-14,3.4,5.15,9,grass);landing.userData.walkSurface=true;floors.push(landing);
 // Sparse rounded shade trees; one shared geometry/material for crowns.
 const crownGeometry=new THREE.IcosahedronGeometry(1,0);
 for(const [x,z,y]of [[-63,8,6.48],[-86,-5.5,7.42],[-103,-8,8.43]]){slab(x,y+2,z,.24,2,.24,wood);const crown=new THREE.Mesh(crownGeometry,leaf);crown.position.set(x,y+2.6,z);crown.scale.set(1.25,1.65,1.25);crown.castShadow=false;crown.userData.walkSoft=true;root.add(crown);}
 for(const z of [3.2,6.8]){const post=slab(-53,7.15,z,.45,.9,.45,stone);post.name='Old west gate pillar';}
 const sign=slab(-54.5,7.15,7.8,.7,.20,.12,wood);slab(-54.5,7.0,7.8,.10,.75,.10,wood);sign.name='Old road sign';
 // The broad road stays open. A low lintel on a side path admits cats only.
 const q=outskirtsLayout.catPassage;
 const sideBank=slab(q[0],q[1],q[2],3.2,q[1]-3.5,1.5,grass);sideBank.userData.walkSurface=true;sideBank.name='Dry bank beneath low cat opening';floors.push(sideBank);
 for(const z of [q[2]-.32,q[2]+.32])slab(q[0],q[1]+1,z,.55,1,.20,stone);
 const arch=slab(q[0],q[1]+1.23,q[2],.55,.46,.84,stone);arch.name='Low roadside wall opening';
 const oldStone=slab(-89,7.75,-1.0,.55,.48,.40,stone);oldStone.name='Roadside stone with a faint circle';
 const circle=new THREE.Mesh(new THREE.TorusGeometry(.15,.009,3,12,Math.PI*1.7),wood);circle.position.set(-88.713,7.57,-1.0);circle.rotation.y=Math.PI/2;root.add(circle);
 const rest=slab(-108,8.9,-11.4,1.3,.25,.5,stone);rest.name='Lookout resting stone';
 const ribbon=slab(-77,7.10,4.4,.12,.015,.30,wood);ribbon.name='Thread behind the roadside wall';
 // A visible broken rail closes the playable hill, while a dry trail suggests continuation.
 const beyond=slab(-118,8.67,-14,13,.08,1.8,path);beyond.userData.walkSoft=true;
 // A modest shoulder rest and dry side path, built on the same supported bank.
 const batch=createDetailBatch(THREE,root,'Outskirts low walls and wild verge');
 for(const [x,y,z]of [[-61,6.39,8.3],[-66,6.58,7.4],[-80,7.16,2.3],[-96,7.92,-4.9]]){
  batch.add('block',stone,[x,y+.19,z],[1.6,.38,.32]);
  for(let i=0;i<4;i++)batch.add('leaf',leaf,[x-.6+i*.35,y+.11,z+.36],[.12,.22,.10]);
 }
 for(let i=0;i<22;i++){const p=roadPoints[Math.min(roadPoints.length-1,i*2)],side=i%2?1:-1;batch.add('leaf',leaf,[p[0],p[1]+.10,p[2]+side*2.75],[.12,.20,.13]);}
 // The sightline from the resting shoulder remains clear toward the whole town.
 const benchY=bankHeight(-99,-6.4);const bench=slab(-99,benchY+.43,-6.4,1.2,.10,.42,wood);bench.name='Roadside quiet resting bench';catSteps.push(bench);
 for(const x of [-99.45,-98.55])slab(x,benchY+.33,-6.4,.10,.33,.32,wood);
 // A second low, real side opening: human road stays broad and unchanged.
 const gap=[-91,bankHeight(-91,-3),-3];
 for(const z of [gap[2]-.32,gap[2]+.32])slab(gap[0],gap[1]+.95,z,.5,.95,.20,stone);
 slab(gap[0],gap[1]+1.19,gap[2],.5,.42,.84,stone).name='Second low verge opening';
 // Beyond the broken rail, supported distant ground suggests a road onward.
 const farBank=slab(-118,8.55,-14,13,5.05,7,grass);farBank.userData.walkSoft=true;
 for(const [x,z,size]of [[-135,-23,8],[-149,-10,11]])batch.add('leaf',grass,[x,4,z],[size,4,size*.70]);
 // A short verge spur and two resting traces stay on the existing grass bank.
 for(let i=0;i<6;i++){const x=-98.5-i*.12,z=-7.5+i*.16,y=bankHeight(x,z);batch.add('block',stone,[x,y+.015,z],[.30,.03,.21]);}
 for(const [x,z,w]of [[-102,-9.3,.85],[-102.4,-9.05,.50]]){const y=bankHeight(x,z);batch.add('block',wood,[x,y+.045,z],[w,.09,.14]);}
 const batchStats=batch.finish();
 const signCanvas=document.createElement('canvas');signCanvas.width=512;signCanvas.height=128;const pen=signCanvas.getContext('2d');pen.fillStyle='#a69773';pen.fillRect(0,0,512,128);pen.fillStyle='#403e32';pen.font='36px serif';pen.fillText('Lunmere  ·  Lake Lun',18,77);
 const signFace=new THREE.Mesh(new THREE.PlaneGeometry(.72,.18),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(signCanvas),side:THREE.DoubleSide}));signFace.position.set(-54.5,7.06,7.872);signFace.userData.walkSoft=true;root.add(signFace);
 const targets=[
 {id:'outskirts-rest',object:bench,label:'道端の木陰',text:'腰を下ろす高さに板が渡してある。遠くの屋根は、ここでは重ならずに見える。'},
 {id:'outskirts-sign',object:sign,label:'西の古い道標',text:'ルンメア、ルン湖。丘の先を指す文字は何度も書き直されている。丘の先には九つの石があるという。街道は、草の多い土地へ続いている。'},
 {id:'outskirts-stone',object:oldStone,label:'道端の古い石',text:'浅い円のそばに、細い線が幾つか残っている。町の水辺で見たものに、少し似ている。'},
 {id:'outskirts-lookout',object:rest,label:'町を振り返る丘',text:'深緑の屋根が段々に重なり、その向こうに鐘楼と港の水が見える。道は町の外でも続いている。'},
 {id:'outskirts-thread',object:ribbon,label:'石壁の裏の紐',text:'草の匂いに混じって、旅の荷物の匂いがする。短い紐は、石の暖かい側へ寄っていた。',profiles:['cat']}
 ].map(t=>({...t,kind:'inspect',range:3.3,profiles:t.profiles??['human','cat'],localPoint:[0,.06,0]}));
 return {root,floors,roadPoints,targets,arch,catSteps,batchStats,stats:{addedLights:0,trees:3,inspectionPoints:5}};
}
