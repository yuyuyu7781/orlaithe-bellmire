import {districtWeights} from './scene-settings.js';

// Shared inexpensive instancing for static architectural details. All coordinates
// are world space; thin surface details never redefine walking/support geometry.
export function createDetailBatch(THREE,scene,name){
 const root=new THREE.Group();root.name=name;scene.add(root);const groups=new Map(),matrix=new THREE.Matrix4(),quat=new THREE.Quaternion();
 const geometries={block:new THREE.BoxGeometry(1,1,1),leaf:new THREE.IcosahedronGeometry(1,0),pot:new THREE.CylinderGeometry(.5,.37,1,7)};
 function add(kind,material,position,size,rotation=0,color=null){let kinds=groups.get(material);if(!kinds){kinds=new Map();groups.set(material,kinds);}if(!kinds.has(kind))kinds.set(kind,[]);quat.setFromAxisAngle(new THREE.Vector3(0,1,0),rotation);matrix.compose(new THREE.Vector3(...position),quat,new THREE.Vector3(...size));kinds.get(kind).push({matrix:matrix.clone(),color});}
 function finish(){let instances=0;for(const [material,kinds]of groups)for(const [kind,items]of kinds){const mesh=new THREE.InstancedMesh(geometries[kind],material,items.length);mesh.name=name+' '+kind;mesh.userData.walkSoft=true;items.forEach((q,i)=>{mesh.setMatrixAt(i,q.matrix);if(q.color)mesh.setColorAt(i,q.color);});mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();mesh.receiveShadow=true;root.add(mesh);instances+=items.length;}return{root,instances,batches:root.children.length};}
 return {add,finish,root};
}

export function addMiniatureGoods(culture){
 return [
 ['Bakery wheat delivery',-35.8,26.7,'flour'],['Bookshop wrapped folios',-22.1,33.0,'luggage'],
 ['Inn wool bundles',-43.3,5.1,'wool'],['Market folded linen',17.7,15.8,'dye'],
 ['Workshop repair tools',12.7,-8.0,'tools'],['Mill basket of twine',24.4,26.4,'herbs']
 ].map(q=>culture.addGoods(...q)).filter(Boolean);
}

export function enrichMiniature({THREE,scene,walking,grounding,lit,wallMaterials,roofMaterials,ignored}){
 const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.96});
 const frame=mat(0x64523e),sill=mat(0xbdb7a1),green=mat(0x576c43),pot=mat(0x956a4d),paving=mat(0xbdb6a3);
 const batch=createDetailBatch(THREE,scene,'Miniature facade and stone details');
 const inside=o=>{for(let p=o;p;p=p.parent)if(ignored.includes(p)||!p.visible)return true;return false;};
 scene.updateMatrixWorld(true);const walls=[],occupied=[];
 scene.traverse(o=>{if(!o.isMesh||inside(o)||o.isInstancedMesh)return;const g=o.geometry.parameters??{},b=new THREE.Box3().setFromObject(o,true);occupied.push({object:o,b});if(wallMaterials.some(m=>m===o.material||m.uuid===o.material.userData.storybookSource)&&g.width>=3&&g.width<16&&g.depth>=3&&g.depth<16&&g.height>=3)walls.push({object:o,b});});
 // Keep the outermost shell where historical layers share the same frontage.
 const shells=walls.filter(w=>!walls.some(q=>q!==w&&q.b.containsBox(w.b)&&q.b.getSize(new THREE.Vector3()).length()>w.b.getSize(new THREE.Vector3()).length()+.01));
 let windows=0,planters=0,awnings=0,pavers=0,coping=0;const faces=[];
 for(const {object,b}of shells){const c=b.getCenter(new THREE.Vector3()),size=b.getSize(new THREE.Vector3()),d=districtWeights(c.x,c.z),seed=(Math.sin(c.x*1.37+c.z*2.1)+1)/2;
  const target=new THREE.Color(0xe0d9c3).lerp(new THREE.Color(0xc7cec5),d.upper*.14).lerp(new THREE.Color(0xc8baa4),d.harbor*.19);
  const m=object.material.clone();m.color.lerp(target,.64+seed*.06);object.material=m;
  // At most three additional windows, one per exposed side: no repeated grids.
  for(const [side,angle,x,z,width]of [['east',Math.PI/2,b.max.x,c.z,size.z],['west',-Math.PI/2,b.min.x,c.z,size.z],['north',Math.PI,c.x,b.min.z,size.x]]){
   const normal=new THREE.Vector3(Math.sin(angle),0,Math.cos(angle));const p=new THREE.Vector3(x,Math.max(b.min.y+size.y*(.53+seed*.05),(grounding.heightAt(x+normal.x*.3,z+normal.z*.3)??b.min.y)+2.15),z).addScaledVector(normal,.030);
   if(p.y>b.max.y-.75)continue;
   const w=.64+seed*.23,h=.90+seed*.30;const test=new THREE.Box3().setFromCenterAndSize(p.clone().addScaledVector(normal,.13),new THREE.Vector3(side==='north'?w+.2:.30,h+.27,side==='north'?.30:w+.2));
   if(occupied.some(q=>q.object!==object&&test.intersectsBox(q.b)))continue;
   const glass=new THREE.Mesh(new THREE.BoxGeometry(w,h,.055),new THREE.MeshStandardMaterial({color:0xf0c789,emissive:0xffb25f,emissiveIntensity:.65,roughness:.85}));glass.position.copy(p);glass.rotation.y=angle;glass.userData.walkSoft=true;glass.name='Side window '+side;scene.add(glass);lit.push(glass.material);windows++;faces.push({wall:object,side,window:glass});
   function piece(local,size,material){const v=new THREE.Vector3(...local).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p);batch.add('block',material,v.toArray(),size,angle);}
   for(const dx of [-w/2-.045,w/2+.045])piece([dx,0,.015],[.085,h+.18,.10],frame);
   for(const dy of [-h/2-.045,h/2+.045])piece([0,dy,.015],[w+.18,.085,.10],frame);
   piece([0,0,.05],[.045,h,.04],frame);piece([0,-h/2-.13,.10],[w+.30,.11,.33],sill);
   if(side==='east'&&seed>.5){piece([0,h/2+.20,.13],[w+.38,.085,.50],frame);awnings++;}
   if(side==='west'&&seed>.36&&d.upper<.75){const pp=new THREE.Vector3(-w*.22,-h/2+.075,.19).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p);batch.add('pot',pot,pp.toArray(),[.24,.30,.24]);for(let i=0;i<4;i++)batch.add('leaf',green,[pp.x+Math.sin(i*2.4)*.08,pp.y+.23+i*.035,pp.z+Math.cos(i*2.4)*.07],[.12,.17,.10]);planters++;}
   // Small wall-rooted vine, attached beside a few windows, not across the lane.
   if(side==='north'&&seed>.7&&d.upper<.7)for(let i=0;i<6;i++){const v=new THREE.Vector3(w*.7+Math.sin(i)*.10,-h*.6+i*.16,-.010).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p);batch.add('leaf',green,v.toArray(),[.12,.16,.075],angle);}
  }
 }
 const roofSet=new Set(roofMaterials);scene.traverse(o=>{if(!o.isMesh||inside(o)||!roofSet.has(o.material))return;const p=o.getWorldPosition(new THREE.Vector3()),seed=(Math.sin(p.x*.31+p.z*.59)+1)/2,m=o.material.clone();m.color.lerp(new THREE.Color(0x365e55).lerp(new THREE.Color(0x496556),seed),.48);o.material=m;});
 // Samples are accepted only on existing, walkable horizontal surfaces. Stone
 // tops remain within 12mm of them, with no collision or terrain changes.
 for(const [cx,cz,rx,rz]of [[7,19,3,2],[-32.5,28.7,2.4,1],[-18,33.4,2,1.2],[0,32,3,1],[-9,34,2,1],[16.3,16.8,1.8,1.1],[-5,-15,2,1]]){
  for(let row=-Math.floor(rz/.55);row<=Math.floor(rz/.55);row++)for(let col=-Math.floor(rx/.72);col<=Math.floor(rx/.72);col++){
   const x=cx+col*.72+(row%2)*.30,z=cz+row*.55,y=grounding.heightAt(x,z);if(y===null||walking.canStand(x,z,y)===null||[[-.34,-.25],[.34,-.25],[-.34,.25],[.34,.25]].some(([dx,dz])=>Math.abs((grounding.heightAt(x+dx,z+dz)??-999)-y)>.01))continue;
   const seed=Math.sin(x*4.7+z*8.2),color=new THREE.Color(0xffffff).multiplyScalar(.94+seed*.045);batch.add('block',paving,[x,y+.005,z],[.64,.010,.46],seed*.018,color);pavers++;
  }
 }
 // Low coping on existing street-side parapets, not a new barrier.
 for(const [x,z,dx,dz,count]of [[-29,35.22,1,0,10],[-7,35.22,1,0,10],[24,35.22,1,0,8]])for(let i=0;i<count;i++){const px=x+i*dx,pz=z+i*dz,y=grounding.heightAt(px,pz);if(y===null)continue;batch.add('block',sill,[px,y+.009,pz],[.94,.018,.20],0,new THREE.Color(0xffffff).multiplyScalar(.90+(i%3)*.035));coping++;}
 const details=batch.finish();return{...details,faces,shells,materials:{frame,sill,green,pot,paving},stats:{buildings:shells.length,windows,planters,awnings,pavers,coping,instances:details.instances,batches:details.batches}};
}
