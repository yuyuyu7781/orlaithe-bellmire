// Restore immutable base colours before applying a deterministic three-day cycle.
// Only fabrics and goods change; all silhouettes, floors and routes stay fixed.
export function createDayDetails({THREE,culture,townLife,extraGoods=[]}){
 const entries=[];for(const object of culture.goods){if(!/cloth|wool|linen|bags|parcels|luggage|basket|cooperage/i.test(object.name))continue;let count=0;object.traverse(o=>{if(!o.isMesh||!o.material?.color||count>=2)return;const material=o.material.clone();o.material=material;entries.push({object:o,material,base:material.color.clone(),name:object.name});count++;});}
 for(const o of extraGoods){entries.push({object:o,material:o.material,base:o.material.color.clone(),name:o.name});}
 const palettes=[0xd5c6aa,0xaebcb0,0xb6b8c2].map(c=>new THREE.Color(c));let day=0,key='';
 function apply(state){const next=state.dayIndex+state.season;if(next===key)return;key=next;day=state.dayIndex;entries.forEach((e,i)=>{e.material.color.copy(e.base).lerp(/bread|cooperage/i.test(e.name)?new THREE.Color(0xb69b76):palettes[(day-1+i)%3],day===1?0:/bread|cooperage/i.test(e.name)?.045:.16);if(state.season==='autumn')e.material.color.lerp(new THREE.Color(0xa99b80),.09);e.object.userData.stayDay=day;});}
 townLife.onChange(apply);apply(townLife.state);return {entries,apply,get day(){return day},addedMeshes:0,addedLights:0};
}
