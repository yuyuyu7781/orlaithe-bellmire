import {createDetailBatch} from './miniature.js';

// Four private window ledges, separate from the existing shallow Juliet
// window rails. Never register them as walkable surfaces or street colliders.
export function addResidentialBalconies({THREE,scene,miniature,grounding}){
 const batch=createDetailBatch(THREE,scene,'Upper residential flower and drying ledges'),entries=[],dailyGoods=[];
 const wood=new THREE.MeshStandardMaterial({color:0x7a6249,roughness:1}),iron=new THREE.MeshStandardMaterial({color:0x4b5145,roughness:1}),green=new THREE.MeshStandardMaterial({color:0x66734e,roughness:1}),clay=new THREE.MeshStandardMaterial({color:0x977456,roughness:1});
 const anchors=[[-34,-23],[-25,-24],[-19,-32],[14,-29]],used=new Set();
 for(const [i,[x,z]]of anchors.entries()){
  const shell=[...miniature.shells].filter(s=>!used.has(s.object)&&s.b.max.z<-19).sort((a,b)=>a.b.getCenter(new THREE.Vector3()).distanceToSquared(new THREE.Vector3(x,12,z))-b.b.getCenter(new THREE.Vector3()).distanceToSquared(new THREE.Vector3(x,12,z)))[0];if(!shell)continue;
  const b=shell.b,c=b.getCenter(new THREE.Vector3()),w=1.28,d=.32,front=b.max.z+.035;
  const panes=[];scene.traverse(o=>{const p=o.geometry?.parameters;if(!o.isMesh||!o.material?.emissive?.getHex()||!p||p.depth>.16||p.width<.3||p.height<.3)return;const at=o.getWorldPosition(new THREE.Vector3());if(at.x>b.min.x+.5&&at.x<b.max.x-.5&&Math.abs(at.z-b.max.z)<.25&&at.y>b.min.y+2)panes.push({object:o,point:at,height:p.height});});
  const pane=panes.sort((a,b)=>Math.abs(a.point.x-c.x)-Math.abs(b.point.x-c.x))[0];if(!pane)continue;c.x=pane.point.x;
  const floor=Math.max(pane.point.y-pane.height/2-.09,(grounding.heightAt(c.x,front+d)??b.min.y)+2.55);
  if(floor>b.max.y-1)continue;
  const projection=new THREE.Box3(new THREE.Vector3(c.x-w/2,floor-.15,front),new THREE.Vector3(c.x+w/2,floor+.88,front+d));
  if(miniature.shells.some(q=>q!==shell&&projection.intersectsBox(q.b)))continue;
  const add=(p,s,m=wood)=>batch.add('block',m,p,s);
  add([c.x,floor,front+d/2],[w,.10,d]);
  for(const sx of [-1,1]){add([c.x+sx*(w/2-.08),floor+.22,front+d-.05],[.05,.44,.05]);add([c.x+sx*(w/2-.035),floor+.43,front+d/2],[.055,.055,d]);add([c.x+sx*.44,floor-.20,front+.16],[.085,.36,.20]);}
  add([c.x,floor+.43,front+d-.05],[w,.065,.065]);for(const sx of [-.38,0,.38])add([c.x+sx,floor+.22,front+d-.05],[.025,.39,.025],iron);
  if(i%2===0){const p=[c.x-.55,floor+.19,front+.17];batch.add('pot',clay,p,[.22,.24,.22]);for(let k=0;k<4;k++)batch.add('leaf',green,[p[0]+Math.sin(k*2.4)*.10,p[1]+.20+k*.025,p[2]+Math.cos(k*2.4)*.09],[.17,.19,.14]);}
  else{add([c.x,floor+.57,front+.07],[w,.035,.035],iron);for(const sx of [-1,1])add([c.x+sx*(w/2-.08),floor+.30,front+.07],[.035,.56,.035],iron);}
  // One modest fabric per house; day changes never alter the lane below.
  const cloth=new THREE.Mesh(new THREE.BoxGeometry(.40,.36,.018),new THREE.MeshStandardMaterial({color:[0xb7bca8,0xb6a394,0xa6b7b7,0xc8bfa8][i],roughness:1}));cloth.position.set(c.x+.10,floor+.38,front+d-.015);cloth.name='Upper balcony linen '+i;cloth.userData.walkSoft=true;batch.root.add(cloth);dailyGoods.push(cloth);
  used.add(shell.object);entries.push({kind:i%2===0?'flower-ledge':'drying-ledge',accessible:false,window:pane.object,depth:d,house:shell.object,position:[c.x,floor,front+d/2],streetClearance:floor-(grounding.heightAt(c.x,front+d)??b.min.y),cloth});
 }
 const result=batch.finish();return {...result,entries,dailyGoods,stats:{balconies:0,windowLedges:entries.length,batches:result.batches,instances:result.instances,addedLights:0}};
}
