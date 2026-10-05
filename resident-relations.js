export const residentRelations={
 baker:{knows:['boatworker','greenBard'],frequents:['bakery','inn'],worksWith:['boatworker']},
 bookseller:{knows:['starmaker'],frequents:['bookshop'],worksWith:['starmaker']},
 boatworker:{knows:['baker','greenBard'],frequents:['harbor','tavern'],worksWith:['baker']},
 starmaker:{knows:['bookseller'],frequents:['orrery','bookshop'],worksWith:['bookseller']},
 greenBard:{knows:['baker','bookseller','boatworker','starmaker'],frequents:['square','waterfront','inn','tavern'],worksWith:[]}
};
export function connectResidentRelations({THREE,residentLife,residentDay,inspections,shopSystem,stay}){
 for(const r of residentLife.records)if(r.id)Object.assign(r.routine,residentRelations[r.id]);
 const lines={baker:'ブランが、港の荷を確かめてくれたよ。宿へ届けるパンは、もう冷める頃だね。',bookseller:'ネリッサが、古い図版を探しに来ました。今日は机に出してあります。',boatworker:'モイラの粉の袋は、湿らせないように上へ積むんだ。',starmaker:'本屋で見た図版を、もう一度確かめたいんです。',greenBard:'話の途中で帰る人がいると、街の続きが分かるものだよ。'};for(const c of inspections.resolver.entries.values()){if(c.kind!=='talk')continue;const person=c.character,prior=person.calendarReply;person.calendarReply=args=>prior?.(args)??(args.profile==='human'&&args.index%5===2?lines[person.id]:null);}
 const pairs=[];const eligible=residentLife.records.filter(r=>!r.moving&&!r.id&&!r.object.userData.visitorRole);
 const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
 function companion(r){if(shopSystem.current||!visible(r.object)||['walking','goingHome'].includes(r.currentState))return null;const p=r.object.getWorldPosition(new THREE.Vector3());return eligible.find(q=>q!==r&&visible(q.object)&&!['walking','goingHome'].includes(q.currentState)&&Math.abs(q.object.getWorldPosition(new THREE.Vector3()).y-p.y)<.45&&q.object.getWorldPosition(new THREE.Vector3()).distanceTo(p)<3.6);}
 for(const r of eligible.filter(r=>[0,6,23].includes(r.index))){const entry={id:'neighbors:'+r.index,kind:'neighbors',verb:'様子を見る',label:'立ち話の声',object:r.object,localPoint:[0,1,0],range:2.7,profiles:['human','cat'],enabled:actor=>{if(!actor?.feet||r.object.getWorldPosition(new THREE.Vector3()).distanceTo(actor.feet)>4)return false;const q=companion(r);if(q){const p=r.object.getWorldPosition(new THREE.Vector3()),v=q.object.getWorldPosition(new THREE.Vector3());r.object.rotation.y=Math.atan2(v.x-p.x,v.z-p.z);q.object.rotation.y=r.object.rotation.y+Math.PI;r.activity=q.activity='conversation';}return !!q;},record:r};inspections.resolver.register(entry);pairs.push(entry);}
 inspections.handlers.set('neighbors',e=>{const q=companion(e.record);if(!q)return;const a=e.record,b=q,p=a.object.getWorldPosition(new THREE.Vector3()),v=b.object.getWorldPosition(new THREE.Vector3());a.object.rotation.y=Math.atan2(v.x-p.x,v.z-p.z);b.object.rotation.y=a.object.rotation.y+Math.PI;a.activity=b.activity='conversation';const harbor=a.routine.category==='harbor',text=harbor?'港の荷の順番について、小さな声で相談している。':'パンの焼き上がりと、宿へ届ける時間について話している。';inspections.present(e,{text});stay.note('neighbors:'+a.routine.category,text,{kind:'person'});});
 return {pairs,relations:residentRelations};
}
