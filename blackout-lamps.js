// A few practical oil lamps, not replacement street illumination. They share
// opaque emissive materials and add no real-time lights or shadow casters.
export function createBlackoutLamps({THREE,scene,grounding,townLife,residentLife}){
 const root=new THREE.Group();root.name='Sparse blackout safety lamps';scene.add(root);
 const iron=new THREE.MeshStandardMaterial({color:0x484337,roughness:1}),wood=new THREE.MeshStandardMaterial({color:0x695039,roughness:1}),flame=new THREE.MeshStandardMaterial({color:0xd8ad72,emissive:0xffb564,emissiveIntensity:1.8,roughness:1});
 const lamps=[],handLamps=[];
 function lantern(parent,position,scale=1){const g=new THREE.Group();g.name='小さな油ランタン';g.position.fromArray(position);g.scale.setScalar(scale);parent.add(g);
  for(const [size,p,m]of [[[.19,.23,.15],[0,.17,0],flame],[[.25,.055,.21],[0,.03,0],wood],[[.25,.055,.21],[0,.32,0],iron],[[.025,.30,.025],[-.105,.17,0],iron],[[.025,.30,.025],[.105,.17,0],iron]]){const o=new THREE.Mesh(new THREE.BoxGeometry(...size),m);o.position.fromArray(p);o.userData.walkSoft=true;g.add(o);}return g;
 }
 // Places already served by human routes; small brackets sit against the wall
 // or quay furniture, above feet and outside the usable lane.
 for(const [label,x,z,y]of [['宿屋の入口',-36.1,-1.2,1.20],['酒場の入口',-6.78,8.8,1.20],['港の係留場',-4.5,37.5,.78],['水車出口',23.75,33.3,.75]]){
  const floor=grounding.heightAt(x,z);if(floor===null)continue;const g=lantern(root,[x,floor+y,z]);g.name=label+'の非常灯';lamps.push(g);
  // Small visible shelf supports the lamp rather than letting it float.
  const support=new THREE.Mesh(new THREE.BoxGeometry(.34,.06,.26),wood);support.position.set(0,-.005,0);support.userData.walkSoft=true;g.add(support);
  const post=new THREE.Mesh(new THREE.BoxGeometry(.06,y,.06),wood);post.position.set(0,-y/2,0);post.userData.walkSoft=true;g.add(post);
 }
 for(const r of residentLife.records.filter(r=>!r.id&&!r.moving&&!r.seated).slice(0,2)){
  const {sx,sy,sz}=r.scale,g=lantern(r.object,[.31/sx,r.prop.position.y-.06/sy,.26/sz],1);g.scale.set(1/sx,1/sy,1/sz);handLamps.push({object:g,record:r});
 }
 function apply(state){const off=state.weather==='blackout';for(const lamp of lamps)lamp.visible=off;for(const {object,record}of handLamps)object.visible=off&&!record.seated;}
 townLife.onChange(apply);apply(townLife.state);
 return {root,lamps,handLamps,apply,stats:{fixed:lamps.length,handheld:handLamps.length,addedLights:0}};
}
