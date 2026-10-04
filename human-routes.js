// Move only small, already-grounded clutter at real shoulder-width bottlenecks.
// The collision boxes follow the visible object; cat shelves/buildings stay put.
export function clearHumanRoutes({THREE,walking,grounding,catPassages}){
 const changes=[],protectedRoots=new Set(catPassages.routes.map(r=>r.object));
 const belongs=(o,root)=>{for(let p=o;p;p=p.parent)if(p===root)return true;return false;};
 const regions=[['市場',19,16],['パン屋',-31,25],['古書店・港',-18,32],['宿屋',-39,3],['酒場',-10,12],['天球儀店',3,-3],['水車',21,27],['中層広場',0,18],['上層住宅',-8,-20]];
 const handled=new Set();
 for(const e of grounding.objects){if(changes.length>=7)break;const o=e.object;if(protectedRoots.has(o)||o.userData.catRouteId)continue;
  const b=new THREE.Box3().setFromObject(o,true),size=b.getSize(new THREE.Vector3()),c=b.getCenter(new THREE.Vector3());
  if(size.y<.25||size.y>1.3||Math.max(size.x,size.z)>1.7||Math.min(size.x,size.z)<.20)continue;
  const region=[...regions].sort((a,d)=>Math.hypot(c.x-a[1],c.z-a[2])-Math.hypot(c.x-d[1],c.z-d[2]))[0];if(handled.has(region[0])||Math.hypot(c.x-region[1],c.z-region[2])>11)continue;
  const parts=walking.world.obstacles.filter(p=>belongs(p.object,o));if(!parts.length)continue;
  let gap=null;
  for(const [axis,side]of [['x',-1],['x',1],['z',-1],['z',1]]){
   for(let t=-.3;t<=.3;t+=.15){const x=axis==='x'?(side<0?b.min.x-.15:b.max.x+.15):c.x+t,z=axis==='z'?(side<0?b.min.z-.15:b.max.z+.15):c.z+t,y=grounding.heightAt(x,z);
    if(y===null||walking.canStandAs('cat',x,z,y)===null||walking.canStandAs('human',x,z,y)!==null)continue;
    parts.forEach(p=>p.disabled=true);const opened=walking.canStandAs('human',x,z,y)!==null;parts.forEach(p=>p.disabled=false);
    if(opened){gap={x,y,z,axis,side};break;}
   }if(gap)break;
  }if(!gap)continue;
  const original=o.position.clone(),oldGround=o.userData.grounding;
  for(const amount of [.35,.55,.75]){
   o.position.copy(original);o.position[gap.axis]-=gap.side*amount;o.updateWorldMatrix(true,true);delete o.userData.grounding;
   grounding.place(e);walking.refreshObstacle(o);
   if(o.position.distanceTo(original)<=1.15&&!o.userData.grounding?.unresolved&&walking.canStandAs('human',gap.x,gap.z,gap.y)!==null){
    const nb=new THREE.Box3().setFromObject(o,true);let overlaps=false;
    for(const other of grounding.objects){if(other===e||belongs(other.object,o)||belongs(o,other.object))continue;const ob=new THREE.Box3().setFromObject(other.object,true);const inset=nb.clone().expandByScalar(-.04);if(!inset.isEmpty()&&inset.intersectsBox(ob)){overlaps=true;break;}}
    if(!overlaps){changes.push({area:region[0],object:o,from:original.toArray(),to:o.position.toArray(),gap:[gap.x,gap.y,gap.z]});handled.add(region[0]);break;}
   }
  }
  if(!handled.has(region[0])){o.position.copy(original);o.userData.grounding=oldGround;walking.refreshObstacle(o);}
 }
 return {changes,stats:{moved:changes.length,areas:changes.map(c=>c.area)}};
}
