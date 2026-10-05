// Bounded local detours reuse the same town feet/collision policy as walking.
// Run only after a stalled route, never for all actors every frame.
export function streetDetour({THREE,walking,actor,start,goal,player=null,limit=1800}){
 const avoids=p=>!player||Math.abs(p.y-player.y)>.5||Math.hypot(p.x-player.x,p.z-player.z)>.72;
 const step=.12,heap=[],seen=new Set(),key=p=>Math.round(p.x/step)+','+Math.round(p.z/step)+','+Math.round(p.y*100);
 function push(n){n.f=n.g+1.1*n.p.distanceTo(goal);heap.push(n);let i=heap.length-1;while(i){const p=(i-1)>>1;if(heap[p].f<=n.f)break;heap[i]=heap[p];i=p;}heap[i]=n;}
 function pop(){const n=heap[0],last=heap.pop();if(heap.length){let i=0;while(true){let c=i*2+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1].f<heap[c].f)c++;if(heap[c].f>=last.f)break;heap[i]=heap[c];i=c;}heap[i]=last;}return n;}
 push({p:start.clone(),g:0});let count=0;while(heap.length&&count++<limit){const n=pop(),k=key(n.p);if(seen.has(k))continue;seen.add(k);if(avoids(goal)&&n.p.distanceTo(goal)<.14&&walking.canStandTownAs('human',goal.x,goal.z,n.p.y,actor)!==null){const path=[goal.clone()];for(let q=n;q;q=q.parent)path.push(q.p);return path.reverse();}
  for(const [dx,dz]of [[step,0],[-step,0],[0,step],[0,-step],[step,step],[step,-step],[-step,step],[-step,-step]]){const x=n.p.x+dx,z=n.p.z+dz;if(Math.hypot(x-start.x,z-start.z)>4)continue;const y=walking.canStandTownAs('human',x,z,n.p.y,actor);if(y===null||walking.canStandTownAs('human',n.p.x+dx/2,n.p.z+dz/2,n.p.y,actor)===null)continue;const p=new THREE.Vector3(x,y,z);if(!avoids(p))continue;if(!seen.has(key(p)))push({p,g:n.g+Math.hypot(dx,dz),parent:n});}
 }return null;
}
