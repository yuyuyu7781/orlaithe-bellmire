// Read-only world-space contact diagnostics, also used by browser regression tools.
export function auditTownGround({THREE,shells,grounding}){
 const buildings=shells.map(({object,b})=>{const bounds=b??new THREE.Box3().setFromObject(object,true),p=bounds.getCenter(new THREE.Vector3()),ground=grounding.heightAt(p.x,p.z);return {name:object.name,position:p.toArray(),bottom:bounds.min.y,ground,gap:ground===null?null:bounds.min.y-ground};});
 const goods=grounding.objects.filter(e=>!e.person&&!e.seat).map(e=>{const b=new THREE.Box3().setFromObject(e.object,true),p=b.getCenter(new THREE.Vector3()),ground=grounding.heightAt(p.x,p.z);return{name:e.object.name,position:p.toArray(),bottom:b.min.y,ground,gap:ground===null?null:b.min.y-ground,unresolved:!!e.object.userData.grounding?.unresolved};});
 return {buildings,goods,floatingBuildings:buildings.filter(e=>e.gap>.12),unsupportedGoods:goods.filter(e=>e.unresolved||e.gap>.12||e.gap<-.12)};
}
// Existing high houses keep their roof/door height; a visible stone plinth fills
// the unsupported volume. Nothing projects beyond the old building footprint.
export function supportTownHouses({THREE,scene,grounding,box,material}){
 const locations=[[27,-13],[14,-29],[30.2,-23.2],[35.5,-26],[28,-30.3],[-8,23]],changes=[];
 scene.updateMatrixWorld(true);const candidates=[];scene.traverse(o=>{const g=o.geometry?.parameters;if(o.isMesh&&g?.width>=3&&g.width<16&&g.depth>=3&&g.depth<16&&g.height>=3)candidates.push(o);});
 for(const [x,z]of locations){const o=candidates.find(o=>{const p=new THREE.Box3().setFromObject(o,true).getCenter(new THREE.Vector3());return Math.hypot(p.x-x,p.z-z)<.08;});if(!o)continue;const b=new THREE.Box3().setFromObject(o,true),p=b.getCenter(new THREE.Vector3()),y=grounding.heightAt(p.x,p.z);if(y===null||b.min.y-y<=.12)continue;
 const base=box(p.x,y-.04,p.z,b.max.x-b.min.x,b.min.y-y+.04,b.max.z-b.min.z,material);base.name='Supported terrace house foundation';base.userData.houseFoundation=true;base.castShadow=false;grounding.supports.push(new THREE.Box3().setFromObject(base,true));changes.push({position:[x,z],height:b.min.y-y,object:base});}
 return{changes};
}
