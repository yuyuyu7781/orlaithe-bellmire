// One modest west approach; no changes to town terrain or watercourse.
export const outskirtsLayout={
 gate:[-53,6.25,5],hill:[-109,8.65,-14],
 road:[[-38.55,6.25,5],[-49,6.25,5],[-58,6.25,5],[-70,6.75,3],[-83,7.25,-2],[-95,7.85,-8],[-109,8.65,-14]],
 catPassage:[-74,6.917,5.8],catDiscovery:[-77,7.042,4.4]
};
export function buildOutskirts({THREE,scene,box}){
 const root=new THREE.Group();root.name='Quiet west approach and lookout hill';scene.add(root);
 const stone=new THREE.MeshStandardMaterial({color:0x94958b,roughness:1}),grass=new THREE.MeshStandardMaterial({color:0x777e60,roughness:1}),path=new THREE.MeshStandardMaterial({color:0xa49c84,roughness:1}),wood=new THREE.MeshStandardMaterial({color:0x6c5845,roughness:1}),leaf=new THREE.MeshStandardMaterial({color:0x586951,roughness:1});
 const floors=[],roadPoints=[];
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
 for(const z of [-16,-12])slab(-111,9.45,z,.15,.85,.15,wood);
 for(const y of [8.95,9.25])slab(-111,y,-14,.12,.09,9.4,wood);
 const beyond=slab(-118,8.67,-14,13,.08,1.8,path);beyond.userData.walkSoft=true;
 const targets=[
 {id:'outskirts-sign',object:sign,label:'西の古い道標',text:'丘を越える道の名は、何度も書き直されている。ここから見る鐘楼は、屋根の間に小さく残る。'},
 {id:'outskirts-stone',object:oldStone,label:'道端の古い石',text:'浅い円のそばに、細い線が幾つか残っている。町の水辺で見たものに、少し似ている。'},
 {id:'outskirts-lookout',object:rest,label:'町を振り返る丘',text:'深緑の屋根が段々に重なり、その向こうに鐘楼と港の水が見える。道は町の外でも続いている。'},
 {id:'outskirts-thread',object:ribbon,label:'石壁の裏の紐',text:'草の匂いに混じって、旅の荷物の匂いがする。短い紐は、石の暖かい側へ寄っていた。',profiles:['cat']}
 ].map(t=>({...t,kind:'inspect',range:3.3,profiles:t.profiles??['human','cat'],localPoint:[0,.06,0]}));
 return {root,floors,roadPoints,targets,arch,stats:{addedLights:0,trees:3,inspectionPoints:4}};
}
