import {residentStreetPaths} from './resident-routes.js';
// Extend the original eight scheduled residents. Only the clock requests paths;
// the same human feet/body policy validates every actual movement substep.
export function createResidentDay({THREE,walking,grounding,residentLife,townLife,shopSystem,camera=null,getQuality=()=> 'standard'}){
 const nodes=[],keys=new Map(),paths={};
 const key=p=>p.map(v=>v.toFixed(3)).join(',');
 for(const [id,path]of Object.entries(residentStreetPaths)){paths[id]=path.map(p=>{const k=key(p);if(!keys.has(k)){keys.set(k,nodes.length);nodes.push({point:new THREE.Vector3(...p),links:new Set()});}return keys.get(k);});for(let i=1;i<paths[id].length;i++){nodes[paths[id][i-1]].links.add(paths[id][i]);nodes[paths[id][i]].links.add(paths[id][i-1]);}}
 function route(start,end){if(start===end)return [];const open=[start],cost=new Map([[start,0]]),previous=new Map();while(open.length){open.sort((a,b)=>(cost.get(a)+nodes[a].point.distanceTo(nodes[end].point))-(cost.get(b)+nodes[b].point.distanceTo(nodes[end].point)));const n=open.shift();if(n===end){const out=[];for(let i=end;i!==start;i=previous.get(i))out.push(i);return out.reverse();}for(const next of nodes[n].links){const c=cost.get(n)+nodes[n].point.distanceTo(nodes[next].point);if(c<(cost.get(next)??Infinity)){cost.set(next,c);previous.set(next,n);if(!open.includes(next))open.push(next);}}}return [];}
 const records=residentLife.records.filter(r=>!r.id&&!r.moving&&!r.seated).slice(0,8),dayPlaces=['market','square','harbor','bakery','bookshop','mill','market','square'];
 const entries=records.map((record,i)=>{const o=record.object;o.updateWorldMatrix(true,true);const home=paths[dayPlaces[i]][Math.max(0,paths[dayPlaces[i]].length-1-i*3)],point=nodes[home].point;
  const offset=o.getWorldPosition(new THREE.Vector3()).y-new THREE.Box3().setFromObject(o,true).min.y;
  return {record,index:i,parent:o.parent,home,node:home,feet:point.clone(),offset,route:[],cursor:0,speed:.78+i*.045,wait:0,pause:0,elapsed:0,currentState:'idle',destination:dayPlaces[i],schedule:{morning:dayPlaces[i],day:dayPlaces[i],evening:i<4?'tavern':dayPlaces[i],night:i<3?'tavern':i===3?'inn':'home'},inside:null,visible:true};});
 let period=townLife.state.period,lastRoom=null,time=0;const changes=[];const counters={pathRequests:0,updated:0,near:0,mid:0,far:0};
 function place(e){const o=e.record.object;if(o.parent!==e.parent)e.parent.attach(o);o.position.copy(o.parent.worldToLocal(e.feet.clone().add(new THREE.Vector3(0,e.offset,0))));o.visible=e.visible;e.record.currentState=e.currentState;o.userData.dailyLife={currentState:e.currentState,destination:e.destination,schedule:e.schedule};}
 function request(e){e.destination=e.schedule[period];const goal=e.destination==='home'?e.home:paths[e.destination].at(-1);e.route=route(e.node,goal);e.cursor=0;e.wait=.6+e.index*.7;e.inside=null;e.visible=true;e.currentState=e.route.length?(period==='night'&&e.destination==='home'?'goingHome':'walking'):'working';e.record.activity=period==='morning'?(e.index%2?'carrying':'sweeping'):e.record.role.activity;counters.pathRequests++;}
 function arrive(e){e.currentState=e.destination==='home'&&period==='night'?'resting':['tavern','inn'].includes(e.destination)?'inside':'working';if(e.currentState==='inside'){e.inside=e.destination;e.visible=false;}else if(e.destination==='home'&&period==='night')e.visible=false;}
 function refreshRoom(){const room=shopSystem.current;lastRoom=room?.shop.id??null;for(const e of entries){const o=e.record.object;if(o.parent!==e.parent)e.parent.attach(o);if(room){o.visible=e.inside===room.shop.id;if(o.visible){const p=new THREE.Vector3(198.2+e.index*.42,0,2.5-e.index*.33);if(walking.canStandAs('human',p.x,p.z,0)!==null){room.root.attach(o);o.position.copy(room.root.worldToLocal(p.add(new THREE.Vector3(0,e.offset,0))));}else o.visible=false;}}else place(e);}}
 townLife.onChange(state=>{if(state.period===period)return;period=state.period;entries.forEach(request);if(shopSystem.current)refreshRoom();});
 for(const e of entries){request(e);place(e);} // Initial scene placement only, never a time-change teleport.
 function update(dt=.016){time+=Math.min(.1,Math.max(0,dt));if((shopSystem.current?.shop.id??null)!==lastRoom)refreshRoom();if(shopSystem.current)return;walking.refreshDynamic();
  counters.updated=counters.near=counters.mid=counters.far=0;
  for(const e of entries){const distance=camera?camera.position.distanceTo(e.feet):0,tier=distance<18?'near':distance<42?'mid':'far';counters[tier]++;e.elapsed+=Math.min(.1,Math.max(0,dt));const rate=tier==='near'?0:tier==='mid'?.10:getQuality()==='mobile'?.5:.25;if(e.elapsed<rate)continue;const stepTime=Math.min(.5,e.elapsed);e.elapsed=0;counters.updated++;
   if(e.inside||!e.visible){place(e);continue;}if(e.wait>0){e.wait-=stepTime;place(e);continue;}
   if(e.cursor>=e.route.length){arrive(e);place(e);continue;}
   const target=nodes[e.route[e.cursor]].point,delta=target.clone().sub(e.feet),distance2=Math.hypot(delta.x,delta.z),move=Math.min(distance2,e.speed*stepTime);
   if(walking.active&&walking.state.feet.distanceTo(e.feet)<.72&&Math.abs(walking.state.feet.y-e.feet.y)<.5){e.pause+=stepTime;e.record.activity='listening';place(e);continue;}
   if(entries.some(other=>other!==e&&other.visible&&!other.inside&&other.feet.distanceTo(e.feet)<.45&&other.index<e.index)){e.wait=.25;place(e);continue;}
   if(distance2<.006){e.feet.copy(target);e.node=e.route[e.cursor++];if(e.cursor%70===0)e.wait=.5+e.index*.11;place(e);continue;}
   const n=Math.max(1,Math.ceil(move/.06));let advanced=false;
   for(let j=0;j<n;j++){const x=e.feet.x+delta.x/distance2*move/n,z=e.feet.z+delta.z/distance2*move/n,y=walking.canStandTownAs('human',x,z,e.feet.y);if(y===null){e.wait=.4;break;}e.feet.set(x,y,z);advanced=true;}
   if(advanced){e.record.object.rotation.y=Math.atan2(delta.x,delta.z);e.record.walkPhase=(e.record.walkPhase??0)+move*6;e.record.activity='walking';e.currentState=e.destination==='home'&&period==='night'?'goingHome':'walking';}
   place(e);
  }
  // A small exchange at shared destinations; no dialogue UI or extra people.
  for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){const a=entries[i],b=entries[j];if(a.visible&&b.visible&&!a.inside&&!b.inside&&a.cursor>=a.route.length&&b.cursor>=b.route.length&&a.feet.distanceTo(b.feet)<1.8){a.currentState=b.currentState='talking';a.record.activity=b.record.activity='conversation';a.record.object.rotation.y=Math.atan2(b.feet.x-a.feet.x,b.feet.z-a.feet.z);b.record.object.rotation.y=a.record.object.rotation.y+Math.PI;}}
  changes.splice(0,changes.length,...entries.map(e=>({index:e.index,currentState:e.currentState,activity:e.record.activity,visible:e.record.object.visible,position:e.feet.toArray()})));
 }
 return {entries,changes,update,nodes,route,get stats(){return {scheduled:entries.length,period,outsideVisible:entries.filter(e=>e.visible&&!e.inside).length,walking:entries.filter(e=>['walking','goingHome'].includes(e.currentState)).length,inside:entries.filter(e=>e.inside).length,addedResidents:0,...counters};}};
}
