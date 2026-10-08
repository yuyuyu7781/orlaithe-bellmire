// Stable, irregular places: reusable for any community, without grid rows or per-load randomness.
export function communityPlaces({seed,count,accept=()=>true,minDistance=1.65}){
 let value=2166136261;for(const c of seed)value=Math.imul(value^c.charCodeAt(0),16777619)>>>0;
 const random=()=>{value=(Math.imul(value,1664525)+1013904223)>>>0;return value/4294967296;};
 const places=[];for(let i=0;i<count;i++){let candidate;for(let attempt=0;attempt<2000;attempt++){candidate={x:(random()-.5)*17,z:random()*18+7,yaw:random()*Math.PI*2};if(accept(candidate)&&places.every(p=>Math.hypot(p.x-candidate.x,p.z-candidate.z)>=minDistance)){places.push(candidate);break;}}if(places.length!==i+1)throw Error('Insufficient community places: '+seed);}
 return places;
}
