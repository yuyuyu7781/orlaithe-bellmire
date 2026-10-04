// Renderer policy only; world sizes, simulation and interaction are unchanged.
export const qualityPresets={
 high:{label:'High',pixelRatio:2,shadowSize:1024,bloom:true,pointLights:12},
 standard:{label:'Standard',pixelRatio:1.7,shadowSize:1024,bloom:true,pointLights:12},
 mobile:{label:'Mobile',pixelRatio:1,shadowSize:512,bloom:false,pointLights:8}
};
export function createQualitySystem({THREE,scene,camera,renderer,composer,bloom,sun}){
 const points=[];scene.traverse(o=>{if(o.isPointLight)points.push({object:o,position:o.getWorldPosition(new THREE.Vector3())});});
 let current='standard',elapsed=0;
 function refreshLights(){const budget=qualityPresets[current].pointLights,chosen=new Set([...points].sort((a,b)=>a.position.distanceToSquared(camera.position)-b.position.distanceToSquared(camera.position)).slice(0,budget).map(p=>p.object));for(const p of points)p.object.visible=chosen.has(p.object);}
 function set(id){const p=qualityPresets[id];if(!p)throw Error('Unknown quality: '+id);current=id;
  renderer.setPixelRatio(Math.min(devicePixelRatio,p.pixelRatio));composer.setPixelRatio(renderer.getPixelRatio());
  if(sun.shadow.mapSize.x!==p.shadowSize){sun.shadow.map?.dispose();sun.shadow.map=null;sun.shadow.mapSize.set(p.shadowSize,p.shadowSize);sun.shadow.needsUpdate=true;}
  bloom.enabled=p.bloom;refreshLights();elapsed=0;
 }
 function update(dt){elapsed+=dt;if(elapsed>=2){elapsed=0;refreshLights();}}
 return {set,update,presets:qualityPresets,get current(){return current},get stats(){return {preset:current,pixelRatio:renderer.getPixelRatio(),shadowSize:sun.shadow.mapSize.x,bloom:bloom.enabled,pointLights:points.filter(p=>p.object.visible).length,totalPointLights:points.length};}};
}
