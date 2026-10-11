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
