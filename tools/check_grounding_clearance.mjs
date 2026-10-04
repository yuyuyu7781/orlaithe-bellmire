import {createGroundingSystem} from '../grounding.js';
// Browser fixture: pass the app's Three.js module; no scene/render mutation.
export function checkGroundingClearance(THREE){
 const scene=new THREE.Scene(),material=new THREE.MeshBasicMaterial();
 const floor=new THREE.Mesh(new THREE.BoxGeometry(20,1,20),material);floor.position.y=-.5;scene.add(floor);
 const canopy=new THREE.Group();scene.add(canopy);
 function part(x,y,z,w,h,d){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y+h/2,z);canopy.add(mesh);return mesh;}
 part(0,2.5,1,3.5,.1,3);part(-1.5,0,0,.1,2.5,.1);part(1.5,0,0,.1,2.5,.1);
 const entry={object:canopy,precisePassages:true},passage=new THREE.Box3(new THREE.Vector3(-1,0,1),new THREE.Vector3(1,2,2));
 const system=createGroundingSystem({THREE,scene,objects:[entry],terrain:[floor],surfaces:[],surfaceMaterials:[],waterMaterials:[],clearPaths:[passage]});
 system.place(entry);
 if(entry.object.userData.grounding?.unresolved||canopy.position.length()>.001)throw Error('Empty space below the roof blocked the walking lane');
 const post=part(0,0,1.5,.2,2.5,.2);system.place(entry);
 if(!entry.object.userData.grounding?.unresolved&&canopy.position.length()<.1)throw Error('A real post was allowed to stay in the walking lane');
 scene.traverse(o=>o.geometry?.dispose());material.dispose();
 return 'PASS canopy clearance follows real roof/posts; real post still blocks passage';
}
