import {waterInfluence} from './scene-settings.js';

// Extend the existing pigment materials; no second texture/shader or geometry.
// Restore the dry colours first, so changing weather never accumulates a stain.
export function createWeatherSurfaces({THREE,scene,townLife}){
 const entries=new Map();scene.updateMatrixWorld(true);
 scene.traverse(o=>{if(!o.isMesh)return;for(const m of Array.isArray(o.material)?o.material:[o.material]){
  const kind=m?.userData.storybookKind;if(!kind||!m.color)continue;
  if(!entries.has(m))entries.set(m,{material:m,kind,base:m.color.clone(),roughness:m.roughness,wet:0});
  const p=o.getWorldPosition(new THREE.Vector3());entries.get(m).wet=Math.max(entries.get(m).wet,waterInfluence(p.x,p.y,p.z));
 }});
 function apply(state){for(const e of entries.values()){
  const m=e.material;m.color.copy(e.base);m.roughness=e.roughness;
  if(state.weather==='rain'){
   const strength=e.kind==='wood'?.035+e.wet*.065:e.kind==='stone'||e.kind==='ground'?.055+e.wet*.035:.025;
   m.color.multiplyScalar(1-strength);if(e.kind==='ground'||e.kind==='stone')m.roughness=Math.max(.84,e.roughness-.04);
  }

 }}
 townLife.onChange(apply);apply(townLife.state);return {entries,apply,addedMeshes:0,addedLights:0};
}
