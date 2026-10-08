import {evaluateConditions,regionVisited} from './progression-data.js';
// The world is a travel graph, not a second navigation or scheduling system.
// Map positions are deliberately abstracted from the miniature's world axes.
const node=(id,displayName,type,worldPosition,mapPosition,ambientProfile,flags)=>({id,displayName,type,worldPosition,mapPosition,ambientProfile,flags,mapIcon:type,mapLabel:displayName,entryPoints:[],connections:[],travelMode:[]});
export const worldNodes=[
 node('bellmire','Bellmire','town',[-10,7,6],[100,360],'town',[]),
 node('nine-stones','Nine Stones','stones',[-192,10,-31],[230,300],'wind',['nine:visit']),
 node('lake-lun','Lake Lun','lake',[-340,5.7,-24],[380,315],'quiet-water',['lake:visit']),
 node('lunmere','Lunmere','town',[-430,6,22],[460,390],'lakeside-town',[]),
 node('caerith','Isle of Caerith','island',[-367,7,-76],[490,220],'cold-lake-wind',[]),
 node('drowned-way','沈んだ道','special',[-334,5.4,-43],[363,232],'quiet-water',['drowned:entry','drowned:walk']),
 node('the-ring','The Ring','ring',[-403,4.8,-80],[345,148],'hollow-lake-wind',['ring:visit']),
 node('hollow-crown','Hollow Crown','hollow',[-411,1.6,-151],[365,72],'stone-hollow',['crown:visit']),
 node('violet-mire','Violet Mire','wetland',[-456,4.5,-215],[530,78],'wetland-quiet',['mire:visit']),
 node('caer-veyra','Caer Veyra','rumor',null,[638,133],'highland',[])
];
export const worldConnections=[
 {id:'town-road',from:'bellmire',to:'nine-stones',type:'road'},
 {id:'lake-road',from:'nine-stones',to:'lake-lun',type:'road'},
 {id:'shore-road',from:'lake-lun',to:'lunmere',type:'road'},
 {id:'island-water',from:'lake-lun',to:'caerith',type:'boat'},
 {id:'town-water',from:'lunmere',to:'caerith',type:'boat'},
 {id:'drowned-path',from:'lake-lun',to:'drowned-way',type:'conditional',availability:'low-water'},
 {id:'ring-path',from:'drowned-way',to:'the-ring',type:'conditional',availability:'extreme-water'},
 {id:'crown-descent',from:'the-ring',to:'hollow-crown',type:'hidden',availability:'descent'},
 {id:'mire-cleft',from:'hollow-crown',to:'violet-mire',type:'hidden',availability:'mire-passage'},
 {id:'royal-road',from:'violet-mire',to:'caer-veyra',type:'road',availability:'royal-road'}
];
worldNodes.find(n=>n.id==='drowned-way').parentRegion='lake-lun';
// No public names for unbuilt lands. Reserved graph slots can be populated later.
export const futureWorldSlots=[{id:'caer-veyra',worldPosition:null,mapPosition:[638,133]}];
const unlocks={'drowned-way':'low-water','the-ring':'extreme-water','hollow-crown':'descent','violet-mire':'mire-land','caer-veyra':'royal-road'};
for(const n of worldNodes){n.unlockType=unlocks[n.id]?'conditional':'visit';n.unlockConditions=unlocks[n.id]??{};}
for(const n of worldNodes){n.connections=worldConnections.filter(e=>e.from===n.id||e.to===n.id).map(e=>e.id);n.travelMode=[...new Set(worldConnections.filter(e=>n.connections.includes(e.id)).map(e=>e.type))];}
export const hasDiscovery=(data,id)=>!!data.discoveries?.[id];
export function connectionAvailable(edge,data){return !!edge&&evaluateConditions(edge.availability??{},data);}
export function worldSnapshot(data,regions=[],current='bellmire'){
 const seen=id=>hasDiscovery(data,id);const nodes=worldNodes.map(n=>{
  const region=regions.find(r=>r.id===(n.parentRegion??n.id)),visited=regionVisited(data,n.id)||n.flags.some(seen),hint=n.id==='drowned-way'?'drowned:rumor':n.id==='hollow-crown'?'crown:entrance':n.id==='violet-mire'?'mire:exit':n.id==='caer-veyra'?'mire:sign':null,discovered=visited||n.id==='drowned-way'&&seen('drowned:entry'),rumored=!discovered&&!!hint&&seen(hint),available=evaluateConditions(n.unlockConditions,data)&&n.type!=='rumor';
  return {...n,entryPoints:region?[{id:'safe',position:region.entryPoint}]:[],visited,discovered,rumored,current:n.id===current,availability:available?'open':n.type==='rumor'?'unbuilt':'submerged',revisitable:visited&&available&&!!region,nameVisible:visited||discovered||n.type==='rumor'&&rumored,hidden:!discovered&&!rumored};
 });
 const byId=new Map(nodes.map(n=>[n.id,n]));return{nodes,connections:worldConnections.filter(e=>!byId.get(e.from).hidden&&!byId.get(e.to).hidden).map(e=>({...e,available:connectionAvailable(e,data)}))};
}
export function recordTravel(data,regionId,mode='human',travelMode='road'){
 if(!worldNodes.some(n=>n.id===regionId))return false;data.travelHistory??=[];const last=data.travelHistory.at(-1);if(last?.region===regionId)return false;data.travelHistory.push({day:data.currentDay,region:regionId,mode:mode==='cat'?'cat':'human',travelMode:['road','boat','revisit'].includes(travelMode)?travelMode:'road'});if(data.travelHistory.length>120)data.travelHistory.shift();return true;
}

// Discovered graph paths are itineraries, not automatic long-distance steering.
export function travelItinerary(from,to,data,{discoveredOnly=true}={}){const visible=new Set(worldSnapshot(data).nodes.filter(n=>!n.hidden).map(n=>n.id)),queue=[[from]],seen=new Set([from]);for(let i=0;i<queue.length;i++){const path=queue[i],last=path.at(-1);if(last===to)return path;for(const edge of worldConnections){const next=edge.from===last?edge.to:edge.to===last?edge.from:null;if(!next||seen.has(next)||discoveredOnly&&!visible.has(next))continue;seen.add(next);queue.push([...path,next]);}}return [];}
