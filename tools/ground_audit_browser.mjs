import {auditTownGround} from '../town-ground-audit.js';
// Invoke with the running application's references in a browser. No mesh or
// collision changes; unsupported shells, water/void goods and actor feet are reported.
export function auditGroundContacts(app){
 const {THREE,walking,residentLife}=app,report=auditTownGround({THREE,shells:app.miniature.shells,grounding:app.grounding});
 report.actors=[];for(const r of residentLife.records){let visible=true;for(let p=r.object;p;p=p.parent)if(!p.visible)visible=false;if(!visible||r.seated||r.sitting)continue;
 const p=r.object.getWorldPosition(new THREE.Vector3()),feet=new THREE.Box3();for(const o of r.feet)feet.union(new THREE.Box3().setFromObject(o,true));if(feet.isEmpty())continue;
 const ground=walking.groundAt(p.x,p.z,feet.min.y,walking.profiles.human);report.actors.push({id:r.id??r.index,position:p.toArray(),feet:feet.min.y,ground,gap:ground===null?null:feet.min.y-ground});
 }
 report.lunmereShells=(app.lunmere?.shells??[]).map(s=>{const b=new THREE.Box3().setFromObject(s.object,true),p=b.getCenter(new THREE.Vector3()),ground=app.lunmere.heightAt(p.x,p.z);return {name:s.object.name,ground,bottom:b.min.y,gap:ground===null?null:b.min.y-ground};});report.lunmereShellIssues=report.lunmereShells.filter(s=>s.gap===null||Math.abs(s.gap)>.05);
 report.actorContactIssues=report.actors.filter(e=>e.ground===null||Math.abs(e.gap)>.12);
 return report;
}
