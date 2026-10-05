// Three low storage shelves in existing clear street margins. A real overhead
// board blocks a human body; a smaller cat uses the SAME collision world.
export function createCatPassages({THREE,scene,walking,grounding,groundedObjects,box,wood,cloth}){
 const root=new THREE.Group();root.name='Low backstreet storage shelves';scene.add(root);const routes=[];
 function floorClear(x,z){const y=grounding.heightAt(x,z);if(y===null)return null;
  for(const [dx,dz]of [[0,0],[-.75,-.46],[.75,-.46],[-.75,.46],[.75,.46],[0,-.98],[0,.98]])if(walking.canStandAs('human',x+dx,z+dz,y)===null||Math.abs((grounding.heightAt(x+dx,z+dz)??-99)-y)>.025)return null;
  // Keep a complete human bypass beside each low route.
  if(![-1,1].some(side=>[-1.1,-.55,0,.55,1.1].every(dz=>walking.canStandAs('human',x+side*1.06,z+dz,y)!==null)))return null;
  return y;
 }
 for(const [id,label,cx,cz]of [['market','市場裏の荷物棚下',19,16],['harbor','港側の荷物棚下',26,30.5],['bakery','パン屋側の薪棚下',-36,24],['tavern','酒場脇の道具棚下',-6,14],['bookshop','古書店脇の低い棚下',-20,34]]){
  const offsets=[[0,0]];for(let r=.4;r<=4;r+=.4)for(let i=0;i<16;i++)offsets.push([Math.cos(i*Math.PI/8)*r,Math.sin(i*Math.PI/8)*r]);
  const g=new THREE.Group();g.name=label;root.add(g);
  for(const x of [-.59,.59])for(const z of [-.29,.29])box(x,0,z,.08,.74,.08,wood,g);
  for(const x of [-.43,0,.43])box(x,.67,0,.40,.09,.76,wood,g);
  for(const [x,w]of [[-.36,.32],[.32,.36]])box(x,.76,.06,w,.13,.42,id==='bakery'?wood:cloth,g);
  const entry={object:g};let found=false;
  for(const [dx,dz]of offsets){const x=cx+dx,z=cz+dz,y=floorClear(x,z);if(y===null)continue;
   g.position.set(x,y,z);delete g.userData.grounding;grounding.place(entry);g.updateWorldMatrix(true,true);
   if(g.userData.grounding?.unresolved||Math.hypot(g.position.x-x,g.position.z-z)>1.0||floorClear(g.position.x,g.position.z)===null)continue;
   found=true;break;
  }
  if(!found){root.remove(g);continue;}const x=g.position.x,z=g.position.z,y=g.userData.grounding.surfaceY;
  groundedObjects.push(entry);g.traverse(o=>{if(o.isMesh)walking.registerObstacle(o);});
  const start=[x,y,z-.98],end=[x,y,z+.98],path=[];
  for(let i=0;i<=40;i++){const p=new THREE.Vector3(...start).lerp(new THREE.Vector3(...end),i/40);path.push(p.toArray());}
  const route={id:'cat-route-'+id,label,object:g,center:[x,y,z],start,end,path,clearance:.67};g.userData.catRouteId=route.id;routes.push(route);
 }
 return {root,routes,stats:{routes:routes.length,meshes:routes.reduce((n,r)=>n+r.object.children.length,0)}};
}
