import {worldConnections} from './world-graph.js';
// Geometry/animation can sleep, but global time, events and save state never do.
const edges=[...worldConnections,{from:'lake-lun',to:'the-ring'},{from:'lunmere',to:'the-ring'},{from:'caerith',to:'the-ring'}];
const neighbors=new Map(),distances=new Map();
for(const e of edges){for(const id of[e.from,e.to])if(!neighbors.has(id))neighbors.set(id,new Set());neighbors.get(e.from).add(e.to);neighbors.get(e.to).add(e.from);}
function distance(from,to){
 const key=from+':'+to;if(distances.has(key))return distances.get(key);
 const seen=new Set([from]),queue=[[from,0]];let result=Infinity;
 for(let i=0;i<queue.length;i++){const [id,n]=queue[i];if(id===to){result=n;break;}for(const next of neighbors.get(id)??[])if(!seen.has(next)){seen.add(next);queue.push([next,n+1]);}}
 distances.set(key,result);return result;
}
export function regionActivity(current,target,quality='standard'){
 const hops=distance(current,target),tier=hops===0?'current':hops===1?'adjacent':'remote';
 const activity=hops===0?'active':hops===1?'nearby':hops===2?'background':'dormant';
 return{activity,tier,interval:hops===0?0:hops===1?(quality==='mobile'?.75:.5):(quality==='mobile'?1.5:1),details:hops===0,animate:hops===0};
}
