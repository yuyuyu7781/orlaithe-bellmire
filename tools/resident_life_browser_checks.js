import {createResidentScale} from '../resident-scale.js';
import {createResidentLife} from '../resident-life.js';

// Isolated geometry checks: no changes to the running town, controls or clock.
export function checkResidentLife(THREE){
 const scene=new THREE.Scene(),scale=createResidentScale(THREE),actors={},before=new Map();
 const require=(ok,message)=>{if(!ok)throw Error(message);};
 for(const [i,id]of ['baker','bookseller','boatworker','starmaker','greenBard'].entries()){
  const o=new THREE.Group();scene.add(o);const body=new THREE.Mesh(new THREE.CylinderGeometry(.24,.34,1.05,8),new THREE.MeshStandardMaterial({color:0x65715b}));body.position.y=.65;o.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.23,9,7),new THREE.MeshStandardMaterial({color:0xb58b6d}));head.position.y=1.42;o.add(head);o.position.set(i*2,3.5,4);scale.normalize(o,{head});actors[id]=o;before.set(o,{position:o.position.clone(),feet:new THREE.Box3().setFromObject(o,true).min.y});
 }
 const life=createResidentLife({THREE,scene,residentScale:scale,actors});
 for(const r of life.records){const b=new THREE.Box3().setFromObject(r.object,true),original=before.get(r.object);require(Math.abs(b.min.y-original.feet)<1e-5,'Standing contact moved');require(r.object.position.x===original.position.x&&r.object.position.z===original.position.z,'Resident moved across street');require(b.max.y-b.min.y>1.65&&b.max.y-b.min.y<1.85,'Adult scale out of range');}
 const record=life.records[0],initial=record.head.rotation.y;life.update(7,{force:true});require(Math.abs(initial-record.head.rotation.y)>.001,'No idle motion');
 const town=new THREE.Group();scene.add(town);town.attach(record.object);town.visible=false;life.update(8,{force:true});
 const visibleInstances=()=>{let n=0;for(const m of life.root.children)for(let i=0;i<m.count;i++){const matrix=new THREE.Matrix4();m.getMatrixAt(i,matrix);if(Math.abs(matrix.determinant())>1e-10)n++;}return n;};
 const hidden=visibleInstances();require(hidden<life.stats.detailInstances,'Hidden NPC accessory still rendered');
 const room=new THREE.Group();scene.add(room);room.attach(record.object);life.root.visible=false;life.update(9,{force:true});require(life.root.visible&&visibleInstances()>hidden,'Indoor actor lost accessories');
 const geometries=new Set(),materials=new Set();scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
 return {contacts:5,idle:true,hiddenActors:true,indoorActors:true};
}
