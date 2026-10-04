// One draw for the static box-shaped window openings. Their original objects
// remain as logical references; per-instance colors/emission retain shop states.
export function batchWindowLights({THREE,scene,entries,glowMap}){
 const windows=entries.filter(e=>e.window),root=new THREE.Group();root.name='Town window light batch';scene.add(root);
 const material=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffffff,emissiveIntensity:1,emissiveMap:glowMap,roughness:.90});
 material.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nattribute vec3 instanceGlow;\nvarying vec3 vInstanceGlow;').replace('#include <begin_vertex>','#include <begin_vertex>\nvInstanceGlow = instanceGlow;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vInstanceGlow;').replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\ntotalEmissiveRadiance *= vInstanceGlow;');
 };
 material.customProgramCacheKey=()=> 'bellmire-window-instance-glow-v1';
 const geometry=new THREE.BoxGeometry(1,1,1),glow=new THREE.InstancedBufferAttribute(new Float32Array(windows.length*3),3);glow.setUsage(THREE.DynamicDrawUsage);geometry.setAttribute('instanceGlow',glow);
 const mesh=new THREE.InstancedMesh(geometry,material,windows.length);mesh.name='Individual warm windows';mesh.userData.walkSoft=true;root.add(mesh);
 scene.updateMatrixWorld(true);windows.forEach((e,i)=>{const o=e.object,p=o.geometry.parameters;mesh.setMatrixAt(i,o.matrixWorld.clone().multiply(new THREE.Matrix4().makeScale(p.width,p.height,p.depth)));o.layers.set(1);e.instanceIndex=i;});
 mesh.instanceMatrix.needsUpdate=true;mesh.computeBoundingBox();mesh.computeBoundingSphere();
 function sync(){windows.forEach((e,i)=>{mesh.setColorAt(i,e.material.color);const c=e.material.emissive.clone().multiplyScalar(e.material.emissiveIntensity);glow.setXYZ(i,c.r,c.g,c.b);});if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;glow.needsUpdate=true;}
 return {root,mesh,windows,sync,stats:{sourceWindows:windows.length,drawBatches:1}};
}
