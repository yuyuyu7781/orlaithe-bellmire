import {weatherProfiles,artLighting,timeAtmosphere} from './scene-settings.js';

// Native exponential fog with a short clear foreground. A single subtraction,
// not a blur pass; rain/fog retain the original near-to-far weather behavior.
export function createAtmosphere({THREE,scene,camera,renderer,bloom,hemi,sun,dynamicRoots=[]}){
 const airNear={value:0};let profile=weatherProfiles.clear,weather="clear";
 // One existing sun shadow map covers the town. Architectural silhouettes,
 // rather than hundreds of tiny goods, supply the soft contact/occlusion cues.
 const shadowStats={casters:0};scene.updateMatrixWorld(true);
 scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh)return;const b=new THREE.Box3().setFromObject(o,true),size=b.getSize(new THREE.Vector3());
  let dynamic=false;for(let p=o;p;p=p.parent)if(dynamicRoots.includes(p)){dynamic=true;break;}
  o.castShadow=!dynamic&&o.castShadow&&Math.max(size.x,size.z)>=artLighting.minCasterWidth&&size.y>=artLighting.minCasterHeight;
  if(o.castShadow)shadowStats.casters++;
  if(o.material?.userData.storybookKind==='roof')o.receiveShadow=true;
 });
 Object.assign(sun.shadow.camera,{left:-artLighting.shadowExtent,right:artLighting.shadowExtent,top:artLighting.shadowExtent,bottom:-artLighting.shadowExtent,near:1,far:artLighting.shadowFar});sun.shadow.camera.updateProjectionMatrix();
 hemi.color.set(artLighting.skyTint);hemi.groundColor.set(artLighting.groundTint);
 sun.shadow.bias=-.00015;sun.shadow.normalBias=.10;
 // Only static architecture casts here; weather changes intensity, not geometry.
 sun.shadow.autoUpdate=false;refreshShadows();
 function refreshShadows(){sun.shadow.needsUpdate=true;}
 renderer.domElement.addEventListener('webglcontextrestored',refreshShadows);

 const fragment=THREE.ShaderChunk.fog_fragment.replace('fogDensity * fogDensity * vFogDepth * vFogDepth','fogDensity * fogDensity * max(0.0, vFogDepth - bellmireAirNear) * max(0.0, vFogDepth - bellmireAirNear)');
 if(fragment===THREE.ShaderChunk.fog_fragment)throw Error('Unsupported fog shader chunk');
 const materials=new Set();scene.traverse(o=>{if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});
 for(const m of materials){const previous=m.onBeforeCompile,previousKey=m.customProgramCacheKey();m.onBeforeCompile=function(shader,renderer){previous.call(this,shader,renderer);shader.uniforms.bellmireAirNear=airNear;shader.fragmentShader='uniform float bellmireAirNear;\n'+shader.fragmentShader.replace('#include <fog_fragment>',fragment);};m.customProgramCacheKey=()=>previousKey+'|bellmire-clear-foreground-v1';m.needsUpdate=true;}
 function update(walking=false){airNear.value=profile.air?(walking?14:Math.max(14,Math.min(58,camera.position.y-3))):0;}
 function paint(){scene.background.set(profile.sky);scene.fog.color.set(profile.fog);scene.fog.density=profile.density;hemi.color.set(profile.skyTint??artLighting.skyTint);hemi.groundColor.set(profile.groundTint??artLighting.groundTint);hemi.intensity=profile.hemi;sun.intensity=profile.sun;sun.color.set(profile.sunColor);renderer.toneMappingExposure=profile.exposure;bloom.strength=profile.bloom;update();}
 function apply(value){weather=value;profile=weatherProfiles[value];if(!profile)throw Error('Unknown weather: '+value);paint();}
 function applyPeriod(period){if(!timeAtmosphere[period])throw Error('Unknown period: '+period);const base=weatherProfiles[weather];
  profile=weather==='dawn'&&period==='morning'?base:['clear','dawn','night'].includes(weather)?timeAtmosphere[period]:{...base};
  if(['rain','fog'].includes(weather)){const factor={morning:.85,day:1,evening:.78,night:.60}[period];profile.hemi*=factor;profile.sun*=factor;}
  paint();
 }

 return {apply,applyPeriod,update,airNear,materials,shadowStats,refreshShadows,get profile(){return profile}};
}
