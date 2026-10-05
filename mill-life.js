import {createDetailBatch} from './miniature.js';
// Dry-side fittings only. No second watercourse, new light, or invisible walkway.
export function addMillLife({THREE,scene,walking,grounding,millrace}){
 const {dry,wet,timber,moss}=millrace.materials,batch=createDetailBatch(THREE,scene,'Mill washing ledge and working fittings');
 const linen=new THREE.MeshStandardMaterial({color:0xb6ac91,roughness:1});
 let sites=0;
 function site(x,z,w,d,build){const y=grounding.heightAt(x,z);if(y===null)return;for(const dx of [-w/2,0,w/2])for(const dz of [-d/2,0,d/2])if(walking.canStandTownAs('cat',x+dx,z+dz,y)===null)return;build(x,y,z);const proxy=new THREE.Mesh(new THREE.BoxGeometry(w,.55,d),timber);proxy.position.set(x,y+.275,z);proxy.updateMatrixWorld(true);walking.registerObstacle(proxy,'mill working fittings');sites++;}
 site(23.45,27.0,.5,.65,(x,y,z)=>{
  batch.add('block',wet,[x,y+.06,z],[.5,.12,.65]);
  // A low washing board, bucket with a dark mouth, and folded cloth.
  batch.add('block',timber,[x,y+.15,z-.10],[.42,.055,.35]);
  batch.add('pot',timber,[x+.08,y+.31,z+.16],[.24,.28,.24]);
  batch.add('pot',wet,[x+.08,y+.454,z+.16],[.19,.009,.19]);
  batch.add('block',linen,[x-.08,y+.19,z-.16],[.18,.035,.17]);
 });
 site(23.55,29.8,.65,.42,(x,y,z)=>{
  batch.add('block',timber,[x,y+.45,z],[.65,.075,.42]);
  for(const side of [-1,1])batch.add('block',timber,[x+side*.25,y+.21,z],[.065,.42,.32]);
  batch.add('pot',linen,[x-.16,y+.60,z],[.21,.25,.20]);
  batch.add('block',timber,[x+.14,y+.50,z],[.24,.035,.12]);
 });
 // A single dry water-drawing foothold; leave both narrow bank paths open.
 site(21.55,-12.1,.42,.46,(x,y,z)=>{
  batch.add('block',wet,[x,y+.055,z],[.42,.11,.46]);
  batch.add('pot',timber,[x,y+.25,z],[.22,.28,.22]);
  batch.add('pot',wet,[x,y+.392,z],[.17,.008,.17]);
 });
 // A small stack of damp offcuts beside the existing mill work bench.
 site(24.05,30.15,.36,.42,(x,y,z)=>{
  for(let i=0;i<3;i++)batch.add('block',timber,[x,y+.06+i*.075,z],[.34,.065,.32-i*.025]);
 });
 // Small stains/stone seams on the existing banks; never crowd the walking lane.
 for(const p of millrace.layout.open.filter((_,i)=>i%2===0)){
  for(const side of [-1,1]){batch.add('block',wet,[p[0]+side*.355,p[1]+.05,p[2]],[.015,.13,.20]);batch.add('leaf',moss,[p[0]+side*.36,p[1]+.12,p[2]+.15],[.045,.025,.075]);}
 }
 const detail=batch.finish();return {...detail,sites,addedLights:0};
}
