import {weatherProfiles} from './scene-settings.js';

// Native exponential fog with a short clear foreground. A single subtraction,
// not a blur pass; rain/fog retain the original near-to-far weather behavior.
export function createAtmosphere({THREE,scene,camera,renderer,bloom,hemi,sun}){
 const airNear={value:0};let profile=weatherProfiles.clear;
 const fragment=THREE.ShaderChunk.fog_fragment.replace('fogDensity * fogDensity * vFogDepth * vFogDepth','fogDensity * fogDensity * max(0.0, vFogDepth - bellmireAirNear) * max(0.0, vFogDepth - bellmireAirNear)');
 if(fragment===THREE.ShaderChunk.fog_fragment)throw Error('Unsupported fog shader chunk');
 const materials=new Set();scene.traverse(o=>{if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);});
 for(const m of materials){const previous=m.onBeforeCompile,previousKey=m.customProgramCacheKey();m.onBeforeCompile=function(shader,renderer){previous.call(this,shader,renderer);shader.uniforms.bellmireAirNear=airNear;shader.fragmentShader='uniform float bellmireAirNear;\n'+shader.fragmentShader.replace('#include <fog_fragment>',fragment);};m.customProgramCacheKey=()=>previousKey+'|bellmire-clear-foreground-v1';m.needsUpdate=true;}
 function update(walking=false){airNear.value=profile.air?(walking?14:Math.max(14,Math.min(58,camera.position.y-3))):0;}
 function apply(weather){profile=weatherProfiles[weather];if(!profile)throw Error('Unknown weather: '+weather);scene.background.set(profile.sky);scene.fog.color.set(profile.fog);scene.fog.density=profile.density;hemi.intensity=profile.hemi;sun.intensity=profile.sun;sun.color.set(profile.sunColor);renderer.toneMappingExposure=profile.exposure;bloom.strength=profile.bloom;update();}
 return {apply,update,airNear,materials,get profile(){return profile}};
}
