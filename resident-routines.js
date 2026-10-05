// One catalogue for the existing actors, including seated and route-driven people.
export function routineFor(record,point){
 const category=record.object.userData.visitorRole?'visitor':record.id?'shop':record.moving?'passerby':record.seated?'inn-tavern':point.z>31?'harbor':point.y>6?'housing':'market';
 return {category,home:point.toArray(),workplace:record.id??(category==='harbor'?'harbor':category==='housing'?'neighborhood':'market'),restPlace:category==='harbor'?'quay':'square',eveningPlace:category==='harbor'?'tavern':'home',schedule:{morning:'work',day:'work',evening:'rest',night:'home'},knows:[],frequents:[],worksWith:[]};
}
export function actorBuckets(entries,size=2){const cells=new Map();for(const e of entries){if(!e.visible||e.inside)continue;const key=Math.floor(e.feet.x/size)+','+Math.floor(e.feet.z/size);if(!cells.has(key))cells.set(key,[]);cells.get(key).push(e);}return e=>{const x=Math.floor(e.feet.x/size),z=Math.floor(e.feet.z/size),near=[];for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++)for(const o of cells.get((x+dx)+','+(z+dz))??[])if(o!==e&&Math.abs(o.feet.y-e.feet.y)<.6)near.push(o);return near;};}
