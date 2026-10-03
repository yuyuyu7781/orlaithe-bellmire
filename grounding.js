// Shared contact placement for residents and street details. Buildings and boats
// are never registered here. Coordinates and bounds are always in world space.
export function createGroundingSystem({THREE,scene,objects,terrain,surfaces,
  surfaceMaterials,waterMaterials,excluded=[],clearRoutes=[],clearPaths=[]}){
  const box=new THREE.Box3(),point=new THREE.Vector3();
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  const belongs=(o,roots)=>{for(let p=o;p;p=p.parent)if(roots.has(p))return true;return false;};
  const roots=new Set(objects.map(q=>q.object)),ignore=new Set(excluded);
  const supports=[],waters=[],buildings=[],terrainBounds=new Set();
  const bounds=o=>new THREE.Box3().setFromObject(o,true);
  scene.updateMatrixWorld(true);
  const passages=clearPaths.map(b=>b.clone());
  for(const root of clearRoutes)root.traverse(o=>{
    if(!o.isMesh||!visible(o))return;const b=bounds(o);
    b.min.y=b.max.y;b.max.y+=1.8;
    b.min.x-=.28;b.max.x+=.28;b.min.z-=.28;b.max.z+=.28;passages.push(b);
  });
  scene.traverse(o=>{
    if(!o.isMesh||!visible(o)||belongs(o,ignore))return;
    const g=o.geometry.parameters||{},b=bounds(o);
    if(terrain.includes(o)||surfaces.includes(o)||o.userData.walkSurface||
       (surfaceMaterials.includes(o.material)&&g.height<=.65&&g.width>=.2&&g.depth>=.2)){supports.push(b);if(terrain.includes(o))terrainBounds.add(b);}
    if(waterMaterials.includes(o.material))waters.push(b);
    if(!belongs(o,roots)&&g.width>=3&&g.width<18&&g.depth>=3&&g.depth<18&&g.height>=2&&!terrain.includes(o)&&!surfaces.includes(o))buildings.push(b);
  });
  function heightAt(x,z){
    let y=-Infinity;
    for(const b of supports){const pad=terrainBounds.has(b)?0:.025;
      if(x>=b.min.x-pad&&x<=b.max.x+pad&&z>=b.min.z-pad&&z<=b.max.z+pad)y=Math.max(y,b.max.y);
    }
    for(const b of waters)if(x>b.min.x&&x<b.max.x&&z>b.min.z&&z<b.max.z&&y<b.max.y-.015)return null;
    return Number.isFinite(y)?y:null;
  }
  function translate(object,dx,dy,dz){
    object.getWorldPosition(point);point.add(new THREE.Vector3(dx,dy,dz));
    if(object.parent)object.parent.worldToLocal(point);object.position.copy(point);object.updateWorldMatrix(true,true);
  }
  function intersects(b,obstacles){
    return obstacles.some(o=>b.max.x>o.min.x+.025&&b.min.x<o.max.x-.025&&
      b.max.z>o.min.z+.025&&b.min.z<o.max.z-.025&&b.max.y>o.min.y+.04&&b.min.y<o.max.y-.04);
  }
  // Use a footprint, not just the group origin: origins in old layers may be
  // absolute, scaled or rotated, and a single centre could straddle a cliff.
  function candidate(original,dx,dz){
    const b=original.clone().translate(new THREE.Vector3(dx,0,dz));
    const x=(b.min.x+b.max.x)/2,z=(b.min.z+b.max.z)/2;
    const rx=(b.max.x-b.min.x)*.5,rz=(b.max.z-b.min.z)*.5;
    const heights=[[x,z],[x-rx,z-rz],[x+rx,z-rz],[x-rx,z+rz],[x+rx,z+rz]].map(p=>heightAt(...p));
    if(heights.some(h=>h===null)||Math.max(...heights)-Math.min(...heights)>.025)return null;
    const y=Math.max(...heights);b.translate(new THREE.Vector3(0,y-b.min.y,0));
    if(intersects(b,buildings)||intersects(b,passages))return null;
    return {b,y,dx,dz};
  }
  function place(entry){
    const {object,seat=false}=entry;if(!visible(object))return;
    const original=bounds(object);
    // Seated silhouettes contact the existing bench seat rather than its floor.
    if(seat){
      const y=heightAt((original.min.x+original.max.x)/2,(original.min.z+original.max.z)/2);
      if(y!==null)translate(object,0,y+.58-original.min.y,0);
      object.userData.grounding={seat:true};return;
    }
    let best=candidate(original,0,0);
    if(!best){
      // Small, deterministic local adjustments keep clutter beside its shop,
      // while pulling an accidentally submerged object back onto a dry bank.
      for(let radius=.35;radius<=8&&!best;radius+=.35){
        for(let i=0;i<24;i++){
          const a=i*Math.PI/12,c=candidate(original,Math.cos(a)*radius,Math.sin(a)*radius);
          if(c){best=c;break;}
        }
      }
    }
    if(!best){object.userData.grounding={unresolved:true};return false;}
    translate(object,best.dx,best.y-original.min.y,best.dz);
    object.userData.grounding={surfaceY:best.y,offset:[best.dx,best.dz]};
  }
  function placeAll(){for(const entry of objects)place(entry);scene.updateMatrixWorld(true);
    return objects.filter(q=>q.object.userData.grounding?.unresolved);
  }
  function actor(object,feet){
    object.updateWorldMatrix(true,true);box.makeEmpty();
    for(const foot of feet)box.union(bounds(foot));
    const y=heightAt(object.position.x,object.position.z);
    if(y!==null)translate(object,0,y-box.min.y,0);
    object.userData.grounding={surfaceY:y};
  }
  return {heightAt,place,placeAll,actor,objects,buildings,supports};
}
