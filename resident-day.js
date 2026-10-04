// A few existing townspeople change work/location on the existing town clock.
// No route AI, second clock, per-frame searches or new resident models.
export function createResidentDay({THREE,walking,grounding,residentLife,townLife,shopSystem}){
 const records=residentLife.records.filter(r=>!r.id&&!r.moving&&!r.seated).slice(0,8);
 const entries=records.map((record,i)=>({record,index:i,parent:record.object.parent,position:record.object.position.clone(),rotation:record.object.rotation.clone(),visible:record.object.visible}));
 let period=townLife.state.period,lastRoom=undefined;const changes=[];
 function place(e,point,angle){const o=e.record.object;o.position.copy(o.parent.worldToLocal(point.clone()));o.rotation.set(0,angle,0);o.updateWorldMatrix(true,true);o.position.y+=point.y-new THREE.Box3().setFromObject(o,true).min.y;}
 function safe(p){for(const [dx,dz]of [[0,0],[.35,0],[-.35,0],[0,.35],[0,-.35],[.6,.6],[-.6,-.6]]){const x=p.x+dx,z=p.z+dz,y=grounding.heightAt(x,z);if(y!==null&&walking.canStandAs('human',x,z,y)!==null)return new THREE.Vector3(x,y,z);}return null;}
 function apply(){const room=shopSystem.current;lastRoom=room?.shop.id??null;changes.length=0;
  for(const e of entries){const r=e.record,o=r.object,i=e.index;
   const indoor=period==='night'&&(i===0?'tavern':i===1?'inn':null);
   if(o.parent!==e.parent)e.parent.attach(o);o.position.copy(e.position);o.rotation.copy(e.rotation);o.visible=e.visible;
   r.activity=period==='morning'?(i%2?'carrying':'sweeping'):period==='day'?r.role.activity:period==='evening'?(i%2?'conversation':'carrying'):'resting';
   if(room){o.visible=indoor===room.shop.id;if(o.visible){const p=new THREE.Vector3(198.3,0,2.4);if(walking.canStandAs('human',p.x,p.z,0)!==null){room.root.attach(o);place(e,p,Math.PI/3);}else o.visible=false;}continue;}
   if(period==='night'){o.visible=i<2;const p=safe(new THREE.Vector3(i===0?-5.1:-33.8,i===0?3.5:6.25,i===0?15.55:4.1));if(o.visible&&p)place(e,p,-Math.PI/3);else if(o.visible&&!p)o.visible=false;}
   else if(period==='evening'&&i<2){const p=safe(new THREE.Vector3(-5.1+i*.95,3.5,15.55+i*.9));if(p)place(e,p,i?-.5:.6);}
   else if(period==='morning'){const p=safe(o.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(i%2?.45:-.45,0,.2)));if(p)place(e,p,e.rotation.y);}
   changes.push({index:i,activity:r.activity,visible:o.visible,position:o.getWorldPosition(new THREE.Vector3()).toArray()});
  }
 }
 townLife.onChange(state=>{period=state.period;apply();});apply();
 return {entries,changes,update(){if((shopSystem.current?.shop.id??null)!==lastRoom)apply();},get stats(){return {scheduled:entries.length,period,outsideVisible:entries.filter(e=>e.record.object.visible&&e.record.object.parent===e.parent).length,addedResidents:0};}};
}
