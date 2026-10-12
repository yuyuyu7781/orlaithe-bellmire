// One catalogue for the existing actors, including seated and route-driven people.
export function routineFor(record,point){
 const category=record.object.userData.visitorRole?'visitor':record.id?'shop':record.moving?'passerby':record.seated?'inn-tavern':point.z>31?'harbor':point.y>6?'housing':'market';
 return {category,home:point.toArray(),workplace:record.id??(category==='harbor'?'harbor':category==='housing'?'neighborhood':'market'),restPlace:category==='harbor'?'quay':'square',eveningPlace:category==='harbor'?'tavern':'home',schedule:{morning:'work',day:'work',evening:'rest',night:'home'},knows:[],frequents:[],worksWith:[]};
}
export function actorBuckets(entries,size=2){const cells=new Map();for(const e of entries){if(!e.visible||e.inside)continue;const key=Math.floor(e.feet.x/size)+','+Math.floor(e.feet.z/size);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(e);}return e=>{const x=Math.floor(e.feet.x/size),z=Math.floor(e.feet.z/size),near=[];for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const o of cells.get((x+dx)+','+(z+dz))??[])if(o!==e&&Math.abs(o.feet.y-e.feet.y)<.6)near.push(o);return near;};}

// Small presentation rhythms for existing people, not new schedules or lore.
const lifeRhythms={
 boatworker:{wait:22,dwell:8,radius:.42},greenBard:{wait:31,dwell:9,radius:.58},
 lunBoat:{wait:27,dwell:6,radius:.48},lunWatcher:{wait:38,dwell:12,radius:.32},
 cvGaren:{wait:24,dwell:7,radius:.40},cvSophia:{wait:19,dwell:6,radius:.50},
 mireGatherer:{wait:34,dwell:10,radius:.35},mireKeeper:{wait:29,dwell:8,radius:.38}
};
export const lifeRhythmFor=id=>lifeRhythms[id]??null;
// Feed two validated points to the existing executor. No extra movement loop.
export function restRoute({THREE,walking,actor,feet,rhythm,cycle=0}){
 const heading=actor.rotation.y+(cycle%2?1:-1)*Math.PI/2;
 for(let i=0;i<8;i++){
  const angle=heading+i*Math.PI/4,goal=feet.clone().add(new THREE.Vector3(Math.sin(angle)*rhythm.radius,0,Math.cos(angle)*rhythm.radius));let y=feet.y,clear=true;
  for(let j=1;j<=12;j++){const p=feet.clone().lerp(goal,j/12),floor=walking.canStandTownAs('human',p.x,p.z,y,actor);if(floor===null||Math.abs(floor-feet.y)>.06){clear=false;break;}y=floor;}
  if(clear){goal.y=y;return [goal,feet.clone()];}
 }
 return null;
}

// Presentation only: roles, schedules and props remain owned by existing data.
const roleActions={
 boatworker:{cycle:29,duration:7,phase:3,pitch:.12,arm:[-.91,-.78],look:.18,work:['harbor']},
 greenBard:{cycle:37,duration:5,phase:11,pitch:-.025,arm:[-.12,-.18],look:.34,work:['square','waterfront']},
 lunBoat:{cycle:31,duration:8,phase:7,pitch:.17,arm:[-.84,-.94],look:.12,work:['lun-boats','lun-lake-rest']},
 lunWatcher:{cycle:43,duration:6,phase:19,pitch:.14,arm:[-.58,-.76],look:.22,work:['lun-store']},
 cvGaren:{cycle:35,duration:9,phase:13,pitch:.19,arm:[-.72,-.42],look:.15,work:['cv-work-cvGaren','cv-sluice']},
 cvSophia:{cycle:47,duration:10,phase:23,pitch:.21,arm:[-.83,-.65],look:.08,work:['cv-work-cvSophia','cv-guild']},
 mireGatherer:{cycle:41,duration:8,phase:17,pitch:.23,arm:[-.61,-.89],look:.11,work:['mire-flowers']},
 mireKeeper:{cycle:33,duration:7,phase:5,pitch:.26,arm:[-.95,-.49],look:.13,work:['mire-repair','mire-exit-watch']}
};
export function residentActionFor(record,time,{location,period='day',blocked=false}={}){
 const p=roleActions[record.id];if(!p||blocked||record.routePending||record.object?.userData.conversationPaused||record.bellPause>0||['walking','goingHome','departing','entering','leaving','waitingRoute','worldTravel','away','listening'].includes(record.currentState)||(record.object?.userData.shopWork?.currentState==='walking'||record.object?.userData.shopWork?.transition))return null;
 const holding=!!record.prop?.visible,restArm=holding?[-.94,-.94]:[-.10,-.14],phase=((time+p.phase)%p.cycle+p.cycle)%p.cycle,working=period!=='night'&&p.work.includes(location)&&phase<p.duration;
 if(!working)return {kind:'idle',headPitch:.015,headYaw:Math.sin((time+p.phase)*.12)*p.look,arm:restArm,lean:Math.sin((time+p.phase)*.23)*.009};
 const progress=phase/p.duration,pulse=Math.sin(progress*Math.PI);
 return {kind:'work',headPitch:p.pitch*pulse,headYaw:Math.sin(progress*Math.PI*2)*p.look*.3,arm:p.arm.map((x,i)=>restArm[i]+(x-restArm[i])*pulse+Math.sin(progress*Math.PI*2+i)*.07*pulse),lean:pulse*(record.id==='mireKeeper'?.035:.015)};
}
const sharedPlaces=new Set(['square','waterfront','harbor','inn','tavern','lun-boats','lun-lake-rest','lun-diner','lun-finn','mire-shelter']);
// Replace the perpetual exchange with a short glance in the same shared place.
// Reuse the existing buckets; initiators are only the eight audited residents.
export function updateResidentGlances(entries,time,{scan=false}={}){
 const allowed=e=>e.available&&e.visible&&!e.inside&&sharedPlaces.has(e.space)&&e.action?.kind==='idle'&&(!e.record.id||roleActions[e.record.id]);
 const byRecord=new Map(entries.map(e=>[e.record,e]));
 for(const e of entries){const g=e.record.glance;if(!g)continue;const q=byRecord.get(g.partner);if(time>=g.until||!allowed(e)||!q||!allowed(q)||e.space!==q.space||e.region!==q.region||e.parent!==q.parent||e.feet.distanceTo(q.feet)<.9||e.feet.distanceTo(q.feet)>3.5){e.record.glance=null;g.partner.glance=null;e.record.nextGlance=Math.max(e.record.nextGlance??0,time+40);g.partner.nextGlance=Math.max(g.partner.nextGlance??0,time+40);}}
 if(!scan)return;
 const nearby=actorBuckets(entries,4);
 for(const e of entries){const p=roleActions[e.record.id];if(!p||!allowed(e)||e.record.glance||time<(e.record.nextGlance??p.phase))continue;
  const q=nearby(e).find(q=>allowed(q)&&!q.record.glance&&time>=(q.record.nextGlance??0)&&q.space===e.space&&q.region===e.region&&q.parent===e.parent&&e.feet.distanceTo(q.feet)>=.9&&e.feet.distanceTo(q.feet)<=3.5);
  if(!q)continue;const until=time+2+(p.phase%3)*.4;e.record.glance={partner:q.record,until};q.record.glance={partner:e.record,until};e.record.nextGlance=time+p.cycle+35;q.record.nextGlance=time+(roleActions[q.record.id]?.cycle??39)+35;
 }
}
