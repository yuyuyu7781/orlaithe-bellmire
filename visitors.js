import {visitorPlans} from './town-calendar.js';
// Three ordinary adults reuse the town's scale, silhouette and instance details.
export function createVisitorPeople({THREE,scene,residentScale}){
 const root=new THREE.Group();root.name='Temporary visitors';scene.add(root);const people=[];
 for(const plan of visitorPlans){const object=new THREE.Group();object.name=plan.name;root.add(object);
  const coat=new THREE.MeshStandardMaterial({color:plan.coat,roughness:1}),skin=new THREE.MeshStandardMaterial({color:0xb58b6d,roughness:1});
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.24,.34,1.05,8),coat);body.position.y=.65;object.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.23,9,7),skin);head.position.y=1.42;object.add(head);
  object.userData.visitorRole={activity:plan.prop==='crate'?'carrying':'browsing',posture:'carrying',prop:plan.prop,hair:plan.hair,accent:plan.accent};
  residentScale.normalize(object,{head});object.visible=false;people.push({plan,object});
 }return {root,people};
}
export function connectVisitors({THREE,people,residentLife,residentDay,inspections,walking,shopSystem,townLife,stay}){
 const entries=[];
 for(const {plan,object}of people){const record=residentLife.records.find(r=>r.object===object),controller=residentDay.addVisitor(record,plan),entry={id:'visitor:'+plan.id,kind:'visitor-talk',verb:'話す',label:plan.name+'（'+plan.role+'）',object,localPoint:[0,1.30,0],localPoints:{cat:[0,1.05,0]},range:3.1,profiles:['human','cat'],enabled:()=>controller.visible||controller.inside===shopSystem.current?.shop.id,plan,controller};inspections.resolver.register(entry);entries.push(entry);}
 inspections.handlers.set('visitor-talk',entry=>{const mode=walking.state.profile.id,seen=stay.data.discoveries[entry.id],text=mode==='cat'?'「おや。この街の猫かい。荷物の紐には爪をかけないでおくれ。」':entry.plan.second&&seen?entry.plan.second:entry.plan.text;
  inspections.present(entry,{text});if(!seen){stay.data.discoveries[entry.id]={day:townLife.state.dayIndex,period:townLife.state.period,playerMode:mode,label:entry.plan.name};stay.note('met:'+entry.id,entry.plan.name+'に会った。'+(mode==='human'?entry.plan.text:'荷の陰で、旅の匂いを嗅いだ。'),{kind:'visitor',playerMode:mode});}
  else if(mode==='human'&&entry.plan.second)stay.note('visitor-circle','湖の道にも、円と細い線のある石があったと旅人は言った。どの岸かは、曖昧らしい。',{kind:'rumor'});
 });
 return {entries,get stats(){return {types:entries.length,present:entries.filter(e=>e.controller.spawned&&!e.controller.departed).length,walking:entries.filter(e=>e.controller.currentState==='walking').length};}};
}
