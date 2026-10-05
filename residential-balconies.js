import {createDetailBatch} from './miniature.js';

// Four small upper-house ledges, separate from the existing shallow Juliet
// window rails. Never register them as walkable surfaces or street colliders.
export function addResidentialBalconies({THREE,scene,miniature,grounding}){
 const batch=createDetailBatch(THREE,scene,'Upper residential balconies'),entries=[],dailyGoods=[];
 const wood=new THREE.MeshStandardMaterial({color:0x7a6249,roughness:1}),iron=new THREE.MeshStandardMaterial({color:0x4b5145,roughness:1}),green=new THREE.MeshStandardMaterial({color:0x66734e,roughness:1}),clay=new THREE.MeshStandardMaterial({color:0x977456,roughness:1});
 const anchors=[[-34,-23],[-25,-24],[-19,-32],[14,-29]],used=new Set();
 for(const [i,[x,z]]of anchors.entries()){
  const shell=[...miniature.shells].filter(s=>!used.has(s.object)&&s.b.max.z<-19).sort((a,b)=>a.b.getCenter(new THREE.Vector3()).distanceToSquared(new THREE.Vector3(x,12,z))-b.b.getCenter(new THREE.Vector3()).distanceToSquared(new THREE.Vector3(x,12,z)))[0];if(!shell)continue;
  const b=shell.b,c=b.getCenter(new THREE.Vector3()),w=1.9,d=.83,front=b.max.z+.035,floor=Math.max(b.min.y+(b.max.y-b.min.y)*.53,(grounding.heightAt(c.x,front+d)??b.min.y)+2.55);
  if(floor>b.max.y-1)continue;
  const projection=new THREE.Box3(new THREE.Vector3(c.x-w/2,floor-.15,front),new THREE.Vector3(c.x+w/2,floor+.88,front+d));
  if(miniature.shells.some(q=>q!==shell&&projection.intersectsBox(q.b)))continue;
  const add=(p,s,m=wood)=>batch.add('block',m,p,s);
  add([c.x,floor,front+d/2],[w,.10,d]);
  for(const sx of [-1,1]){add([c.x+sx*(w/2-.08),floor+.40,front+d-.05],[.07,.80,.07]);add([c.x+sx*(w/2-.035),floor+.78,front+d/2],[.055,.055,d]);add([c.x+sx*.63,floor-.20,front+.16],[.085,.36,.20]);}
  add([c.x,floor+.79,front+d-.05],[w,.065,.065]);for(const sx of [-.48,0,.48])add([c.x+sx,floor+.40,front+d-.05],[.035,.74,.035],iron);
  if(i%2===0){const p=[c.x-.55,floor+.19,front+.43];batch.add('pot',clay,p,[.30,.29,.30]);for(let k=0;k<4;k++)batch.add('leaf',green,[p[0]+Math.sin(k*2.4)*.10,p[1]+.20+k*.025,p[2]+Math.cos(k*2.4)*.09],[.17,.19,.14]);}
  else{add([c.x+.51,floor+.30,front+.30],[.38,.045,.34]);for(const sx of [-1,1])add([c.x+.51+sx*.14,floor+.14,front+.30],[.04,.25,.04]);add([c.x+.51,floor+.49,front+.17],[.35,.35,.045]);}
  // One modest fabric per house; day changes never alter the lane below.
  const cloth=new THREE.Mesh(new THREE.BoxGeometry(.40,.36,.018),new THREE.MeshStandardMaterial({color:[0xb7bca8,0xb6a394,0xa6b7b7,0xc8bfa8][i],roughness:1}));cloth.position.set(c.x+.10,floor+.53,front+d-.015);cloth.name='Upper balcony linen '+i;cloth.userData.walkSoft=true;scene.add(cloth);dailyGoods.push(cloth);
  used.add(shell.object);entries.push({house:shell.object,position:[c.x,floor,front+d/2],streetClearance:floor-(grounding.heightAt(c.x,front+d)??b.min.y),cloth});
 }
 const result=batch.finish();return {...result,entries,dailyGoods,stats:{balconies:entries.length,batches:result.batches,instances:result.instances,addedLights:0}};
}
