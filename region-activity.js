// Geometry/animation can sleep, but global time, events and save state never do.
const links={bellmire:['nine-stones'],'nine-stones':['lake-lun'],'lake-lun':['lunmere','caerith','the-ring'],lunmere:['caerith','the-ring'],caerith:['the-ring'],'the-ring':[]};
const neighbors=new Map(Object.keys(links).map(id=>[id,new Set()])),distances=new Map();
for(const [id,others]of Object.entries(links))for(const other of others){neighbors.get(id).add(other);neighbors.get(other).add(id);}
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
