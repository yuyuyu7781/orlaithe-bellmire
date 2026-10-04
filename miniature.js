import {districtWeights} from './scene-settings.js';
import {shops} from './shop-data.js';

// Shared inexpensive instancing for static architectural details. All coordinates
// are world space; thin surface details never redefine walking/support geometry.
export function createDetailBatch(THREE,scene,name){
 const root=new THREE.Group();root.name=name;scene.add(root);const groups=new Map(),matrix=new THREE.Matrix4(),quat=new THREE.Quaternion();
 const geometries={block:new THREE.BoxGeometry(1,1,1),leaf:new THREE.IcosahedronGeometry(1,0),pot:new THREE.CylinderGeometry(.5,.37,1,7),ring:new THREE.TorusGeometry(.5,.065,4,10)};
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
 const frame=mat(0x64523e),sill=mat(0xbdb7a1),green=mat(0x576c43),pot=mat(0x956a4d),paving=mat(0xbdb6a3),linen=mat(0xc0b295),brass=mat(0x96794c);
 const batch=createDetailBatch(THREE,scene,'Miniature facade and stone details');
 const inside=o=>{for(let p=o;p;p=p.parent)if(ignored.includes(p)||!p.visible)return true;return false;};
 scene.updateMatrixWorld(true);const walls=[],occupied=[];
 scene.traverse(o=>{if(!o.isMesh||inside(o)||o.isInstancedMesh)return;const g=o.geometry.parameters??{},b=new THREE.Box3().setFromObject(o,true);occupied.push({object:o,b});if(wallMaterials.some(m=>m===o.material||m.uuid===o.material.userData.storybookSource)&&g.width>=3&&g.width<16&&g.depth>=3&&g.depth<16&&g.height>=3)walls.push({object:o,b});});
 // Keep the outermost shell where historical layers share the same frontage.
 const shells=walls.filter(w=>!walls.some(q=>q!==w&&q.b.containsBox(w.b)&&q.b.getSize(new THREE.Vector3()).length()>w.b.getSize(new THREE.Vector3()).length()+.01));
 let windows=0,planters=0,awnings=0,pavers=0,coping=0,shutters=0,lattices=0,bays=0,roundVents=0,householdDetails=0,existingWindowsFramed=0,railWindows=0,shopVines=0;const faces=[],roles={};
 for(const {object,b}of shells){const c=b.getCenter(new THREE.Vector3()),size=b.getSize(new THREE.Vector3()),d=districtWeights(c.x,c.z),seed=(Math.sin(c.x*1.37+c.z*2.1)+1)/2;
  const target=new THREE.Color(0xeee5d2).lerp(new THREE.Color(0xc7cec5),d.upper*.12).lerp(new THREE.Color(0xc8baa4),d.harbor*.16);
  const m=object.material.clone();m.color.lerp(target,.76+seed*.045);object.material=m;
  const shop=shops.find(s=>Math.hypot(c.x-s.center[0],c.z-s.center[1])<6.5),role=shop?.id??(d.harbor>.4?'harbor':d.upper>.6?'upper':'home');roles[role]=(roles[role]??0)+1;
  // At most three additional windows, one per exposed side: no repeated grids.
  for(const [side,angle,x,z,width]of [['east',Math.PI/2,b.max.x,c.z,size.z],['west',-Math.PI/2,b.min.x,c.z,size.z],['north',Math.PI,c.x,b.min.z,size.x]]){
   const normal=new THREE.Vector3(Math.sin(angle),0,Math.cos(angle));const p=new THREE.Vector3(x,Math.max(b.min.y+size.y*(.53+seed*.05),(grounding.heightAt(x+normal.x*.3,z+normal.z*.3)??b.min.y)+2.15),z).addScaledVector(normal,.030);
   if(p.y>b.max.y-.75)continue;
   const w=(.64+seed*.23)*(role==='upper'?.88:role==='harbor'?1.07:1),h=(.90+seed*.30)*(role==='bookshop'?1.08:role==='harbor'?.88:1);const test=new THREE.Box3().setFromCenterAndSize(p.clone().addScaledVector(normal,.13),new THREE.Vector3(side==='north'?w+.2:.30,h+.27,side==='north'?.30:w+.2));
   if(occupied.some(q=>q.object!==object&&test.intersectsBox(q.b)))continue;
   const bay=side==='east'&&role==='home'&&seed>.76,depth=bay?.16:.055;
   const glass=new THREE.Mesh(new THREE.BoxGeometry(w,h,depth),new THREE.MeshStandardMaterial({color:0xf0c789,emissive:0xffb25f,emissiveIntensity:.65,roughness:.85}));glass.position.copy(p).addScaledVector(normal,bay?.05:0);glass.rotation.y=angle;glass.userData.walkSoft=true;glass.name='Side window '+side;scene.add(glass);lit.push(glass.material);windows++;faces.push({wall:object,side,window:glass,role});
   function piece(local,size,material){const v=new THREE.Vector3(...local).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p);batch.add('block',material,v.toArray(),size,angle);}
   for(const dx of [-w/2-.045,w/2+.045])piece([dx,0,.015],[.085,h+.18,.10],frame);
   for(const dy of [-h/2-.045,h/2+.045])piece([0,dy,.015],[w+.18,.085,.10],frame);
   piece([0,0,.05],[.045,h,.04],frame);piece([0,-h/2-.13,.10],[w+.30,.11,.33],sill);
   if(role==='bookshop'||role==='orrery'||(role==='upper'&&seed>.45)){piece([0,h*.13,.07],[w,.045,.04],frame);lattices++;}
   if(bay){piece([0,h/2+.11,.15],[w+.27,.08,.45],frame);piece([0,-h/2-.18,.15],[w+.27,.09,.45],frame);bays++;}
   // Accept fittings only where their visible projection is clear of other
   // buildings/details. Everything stays above human passage height.
   function clearFitting(local,dimensions){const v=new THREE.Vector3(...local).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p),s=new THREE.Vector3(...dimensions);if(side!=='north')[s.x,s.z]=[s.z,s.x];const b=new THREE.Box3().setFromCenterAndSize(v,s);return !occupied.some(q=>q.object!==object&&b.intersectsBox(q.b));}
   if((role==='home'||role==='inn'||role==='harbor')&&side!=='north'&&seed>.34)for(const sign of [-1,1]){const local=[sign*(w/2+.19),0,.03],sz=[.23,h+.06,.06];if(!clearFitting(local,sz))continue;piece(local,sz,frame);piece([local[0],h*.25,.067],[.25,.032,.02],sill);shutters++;}
   if(side==='north'&&clearFitting([w*.65,-h*.3,.07],[.25,.32,.12])){
    if(role==='bakery'){piece([w*.65,-h*.25,.08],[.23,.12,.10],linen);piece([w*.65,-h*.38,.09],[.31,.055,.22],frame);householdDetails++;}
    if(role==='bookshop'){for(let i=0;i<3;i++)piece([w*.65,-h*.36+i*.055,.08],[.23-i*.025,.045,.12],i%2?linen:frame);householdDetails++;}
    if(role==='orrery'){const v=new THREE.Vector3(w*.65,-h*.25,.05).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p);batch.add('ring',brass,v.toArray(),[.28,.28,.06],angle);householdDetails++;}
    if(role==='inn'||role==='home'){piece([w*.65,-h*.21,.045],[.24,.30,.04],linen);piece([w*.65,-h*.045,.05],[.32,.04,.06],frame);householdDetails++;}
    if(role==='harbor'){piece([w*.65,-h*.25,.05],[.22,.32,.045],frame);for(let i=0;i<3;i++)piece([w*.65-.07+i*.07,-h*.25,.08],[.015,.26,.025],linen);householdDetails++;}
   }
   if(side==='north'&&role==='upper'&&seed>.68&&p.y+h/2+.55<b.max.y-.2&&clearFitting([0,h/2+.55,.04],[.34,.34,.07])){const v=new THREE.Vector3(0,h/2+.55,.04).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p);batch.add('ring',frame,v.toArray(),[.32,.32,.08],angle);piece([0,h/2+.55,.035],[.21,.035,.045],frame);roundVents++;}
   // A few shallow Juliet rails reuse the existing window, frames and batch.
   // Above human heads, with a checked projection; never another door/collider.
   const outsideFloor=grounding.heightAt(p.x+normal.x*.4,p.z+normal.z*.4);
   if(railWindows<6&&side==='east'&&['inn','home','harbor'].includes(role)&&seed>.72&&outsideFloor!==null&&p.y-h/2>outsideFloor+2.2&&clearFitting([0,-h/2+.20,.22],[w+.24,.43,.32])){
    piece([0,-h/2-.04,.17],[w+.24,.065,.34],frame);
    piece([0,-h/2+.34,.32],[w+.24,.045,.045],frame);
    for(const x of [-w/2,0,w/2])piece([x,-h/2+.15,.32],[.035,.36,.035],frame);
    railWindows++;
   }
   if(shopVines<5&&side==='west'&&['bakery','inn','tavern'].includes(role)&&clearFitting([w*.72,0,.025],[.18,h+.2,.06])){
    for(let i=0;i<5;i++)piece([w*.72+Math.sin(i)*.04,-h*.5+i*h*.23,.025],[.10,.14,.035],green);
    shopVines++;
   }
   if(side==='east'&&seed>.5){piece([0,h/2+.20,.13],[w+.38,.085,.50],frame);awnings++;}
   if(side==='west'&&seed>.36&&d.upper<.75){const pp=new THREE.Vector3(-w*.22,-h/2+.075,.19).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p);batch.add('pot',pot,pp.toArray(),[.24,.30,.24]);for(let i=0;i<4;i++)batch.add('leaf',green,[pp.x+Math.sin(i*2.4)*.08,pp.y+.23+i*.035,pp.z+Math.cos(i*2.4)*.07],[.12,.17,.10]);planters++;}
   // Small wall-rooted vine, attached beside a few windows, not across the lane.
   if(side==='north'&&seed>.7&&d.upper<.7)for(let i=0;i<6;i++){const v=new THREE.Vector3(w*.7+Math.sin(i)*.10,-h*.6+i*.16,-.010).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p);batch.add('leaf',green,v.toArray(),[.12,.16,.075],angle);}
  }
 }
 // Some historical front panes have no surrounds and read as glowing boards.
 // Reuse those exact panes, adding at most 64 shallow surrounds to the same
 // architectural batch. Do not add glass, alter door targets or duplicate trim.
 const lightMaterials=new Set(lit),oldPanes=occupied.filter(q=>{const g=q.object.geometry.parameters??{};return lightMaterials.has(q.object.material)&&q.object.geometry.type==='BoxGeometry'&&g.width>=.30&&g.width<=1.6&&g.height>=.4&&g.height<=1.8&&g.depth<=.16;});
 const shopDistance=q=>{const p=q.b.getCenter(new THREE.Vector3());return Math.min(...shops.map(s=>Math.hypot(p.x-s.center[0],p.z-s.center[1])));};oldPanes.sort((a,b)=>shopDistance(a)-shopDistance(b));
 for(const {object:o,b}of oldPanes){if(existingWindowsFramed>=64)break;const p=b.getCenter(new THREE.Vector3()),shell=shells.find(s=>s.b.distanceToPoint(p)<.25);if(!shell)continue;
  const g=o.geometry.parameters,scale=o.getWorldScale(new THREE.Vector3()),w=g.width*scale.x,h=g.height*scale.y,normal=new THREE.Vector3(0,0,1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));if(Math.abs(normal.y)>.05)continue;
  const c=shell.b.getCenter(new THREE.Vector3());if(normal.dot(p.clone().sub(c))<0)normal.negate();const angle=Math.atan2(normal.x,normal.z);
  const floor=grounding.heightAt(p.x+normal.x*.25,p.z+normal.z*.25)??shell.b.min.y;if(b.min.y<floor+1.35)continue;
  let added=0;const surround=(local,dimensions)=>{const v=new THREE.Vector3(...local).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p),size=new THREE.Vector3(...dimensions);if(Math.abs(normal.x)>.7)[size.x,size.z]=[size.z,size.x];const bounds=new THREE.Box3().setFromCenterAndSize(v,size);
   if(occupied.some(q=>q.object!==o&&(q.object.userData.storybookKind==='wood'||q.object.material.userData?.storybookKind==='wood')&&bounds.intersectsBox(q.b)))return;
   batch.add('block',frame,v.toArray(),dimensions,angle);added++;
  };
  for(const x of [-w/2-.035,w/2+.035])surround([x,0,.035],[.07,h+.14,.08]);
  for(const y of [-h/2-.035,h/2+.035])surround([0,y,.035],[w+.14,.07,.08]);
  if(added)existingWindowsFramed++;
 }
 const roofSet=new Set(roofMaterials);scene.traverse(o=>{if(!o.isMesh||inside(o)||!roofSet.has(o.material))return;const p=o.getWorldPosition(new THREE.Vector3()),seed=(Math.sin(p.x*.31+p.z*.59)+1)/2,m=o.material.clone();m.color.lerp(new THREE.Color(0x315951).lerp(new THREE.Color(0x466559),seed),.58);o.material=m;});
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
 const details=batch.finish();return{...details,faces,shells,materials:{frame,sill,green,pot,paving},stats:{buildings:shells.length,windows,planters,awnings,pavers,coping,shutters,lattices,bays,roundVents,householdDetails,existingWindowsFramed,railWindows,shopVines,roles,instances:details.instances,batches:details.batches}};
}
