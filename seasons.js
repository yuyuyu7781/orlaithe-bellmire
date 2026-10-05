// Compose a subtle seasonal wash over a small, explicitly selected set of
// vegetation. Geometry, roof colours, resident palettes and routes are untouched.
export function createSeasons({THREE,scene,townLife,sun}){
 const entries=[],seen=new Set(),sunY=sun.position.y;scene.traverse(o=>{if(!o.isMesh||!o.material?.color||!/(?:plant|vine|foliage|herb|leaf$)/i.test(o.name)||o.userData.storybookKind==='roof')return;if(seen.has(o.material))return;seen.add(o.material);const material=o.material.clone();o.material=material;entries.push({material,base:material.color.clone()});});let last='';
 function apply(state){if(state.season===last)return;last=state.season;for(const e of entries){e.material.color.copy(e.base);if(last==='autumn')e.material.color.lerp(new THREE.Color(0x9a9263),.24);else if(last==='spring')e.material.color.lerp(new THREE.Color(0x83966b),.09);}sun.position.y=sunY*(last==='autumn'?.9:1);sun.shadow.needsUpdate=true;}
 townLife.onChange(apply);apply(townLife.state);return{entries,apply,get season(){return last}};
}
