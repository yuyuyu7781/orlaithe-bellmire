// Explicit low supports, selected once from already-grounded props. No world scale change.
export function addCatExploration({THREE,walking,grounding,inspections,shopSystem,extraSteps=[]}){
 const targets=[],used=new Set();
 for(const [x,z]of [[19,16],[-7,32],[25,35],[-6,14],[10,19],[-35,27],[-22,33],[-43,5],[12,-8],[24,26]]){
  const candidates=grounding.objects.filter(e=>!e.person&&!e.seat&&!e.object.userData.catRouteId).map(e=>({object:e.object,b:new THREE.Box3().setFromObject(e.object,true)})).filter(q=>{const s=q.b.getSize(new THREE.Vector3()),p=q.b.getCenter(new THREE.Vector3());return s.y>=.25&&s.y<=.85&&Math.min(s.x,s.z)>=.45&&Math.max(s.x,s.z)<1.55&&!used.has(q.object)&&Math.hypot(p.x-x,p.z-z)<9;}).sort((a,b)=>a.b.getCenter(new THREE.Vector3()).distanceToSquared(new THREE.Vector3(x,a.b.getCenter(new THREE.Vector3()).y,z))-b.b.getCenter(new THREE.Vector3()).distanceToSquared(new THREE.Vector3(x,b.b.getCenter(new THREE.Vector3()).y,z)));
  const q=candidates.find(q=>{const p=q.b.getCenter(new THREE.Vector3()),y=grounding.heightAt(p.x,p.z);return y!==null&&Math.abs(q.b.min.y-y)<.10;});if(!q)continue;used.add(q.object);targets.push(walking.registerCatStep(q.object));
 }
 for(const object of extraSteps)targets.push(walking.registerCatStep(object));
 const button=document.createElement('button');button.id='catJump';button.textContent='跳ぶ';button.className='cat-jump';button.setAttribute('aria-keyshortcuts','Space');button.onclick=e=>{e.stopPropagation();walking.jump();};document.body.append(button);
 const style=document.createElement('style');style.textContent='.cat-jump{display:none;position:fixed;right:18px;bottom:140px;z-index:150;padding:12px 18px;border-radius:22px;background:#e0d3b3;color:#423e30;border:1px solid #867658}.cat-walking .cat-jump{display:block}';document.head.append(style);
 for(const [i,target]of targets.slice(0,8).entries()){const center=target.bounds.getCenter(new THREE.Vector3());const p=target.object.worldToLocal(center.setY(target.bounds.max.y+.025));inspections.resolver.register({id:'cat-perch:'+i,kind:'inspect',verb:'調べる',label:i?'高い荷札':'箱の上の温もり',object:target.object,localPoint:p.toArray(),profiles:['cat'],range:1.5,enabled:()=>!shopSystem.current&&walking.state.feet.y>=target.bounds.max.y-.1,text:i?'いつもの荷札を、上から見る。縄の結び目に、乾いた魚の匂いが残る。':'板は、まだ昼の熱を残している。ここからなら、人の足より少し先が見える。'});}
 return {targets,button,stats:{supports:targets.length,discoveries:Math.min(8,targets.length)}};
}
