import {capitalCharacters} from './caer-veyra-data.js';
import {residentRelations} from './resident-relations.js';
import {travelItinerary,worldConnections,connectionAvailable} from './world-graph.js';
export const characterGraph={
 ...Object.fromEntries(capitalCharacters.map(c=>[c.id,{homeRegion:'caer-'+c.ward,visitedRegions:['caer-veyra','caer-'+c.ward],knows:capitalCharacters.filter(n=>n.ward===c.ward&&n.id!==c.id).map(n=>n.id),worksWith:capitalCharacters.filter(n=>n.ward===c.ward&&n.id!==c.id).map(n=>n.id),frequents:[c.mainLocation],travelPolicy:'local'}])),
 ...Object.fromEntries(Object.entries(residentRelations).map(([id,r])=>[id,{...r,homeRegion:'bellmire',visitedRegions:['bellmire'],travelPolicy:'local'}])),
 greenBard:{...residentRelations.greenBard,knows:['baker','bookseller','boatworker','starmaker','lunHost','lunBoat','mireKeeper'],homeRegion:'bellmire',visitedRegions:['bellmire','nine-stones','lake-lun','lunmere','caerith','violet-mire'],travelPolicy:'rare'},
 lunHost:{knows:['lunBoat','lunWatcher'],worksWith:['lunWatcher'],frequents:['lun-inn'],homeRegion:'lunmere',visitedRegions:['lunmere','lake-lun'],travelPolicy:'local'},
 lunBoat:{knows:['lunHost','lunWatcher','mireKeeper'],worksWith:['mireKeeper'],frequents:['lun-boats','lake-pier'],homeRegion:'lunmere',visitedRegions:['lunmere','lake-lun','caerith'],travelPolicy:'work'},
 lunWatcher:{knows:['lunHost','lunBoat','mireGatherer'],worksWith:['mireGatherer'],frequents:['lun-store'],homeRegion:'lunmere',visitedRegions:['lunmere','lake-lun'],travelPolicy:'local'},
 mireGatherer:{knows:['mireKeeper','lunWatcher'],worksWith:['mireKeeper','lunWatcher'],homeRegion:'violet-mire',visitedRegions:['violet-mire','hollow-crown','lunmere'],travelPolicy:'occasional'},
 mireKeeper:{knows:['mireGatherer','lunBoat','greenBard'],worksWith:['mireGatherer','lunBoat'],homeRegion:'violet-mire',visitedRegions:['violet-mire','hollow-crown'],travelPolicy:'occasional'}
};
export function worldVisitorPlan(plan,data){let target=plan.id==='lake-traveller'&&data.currentDay%9===0&&data.discoveries?.['mire:visit']?'violet-mire':data.currentDay%5===0&&data.discoveries?.['region:lunmere']?'lunmere':'bellmire';if(target==='violet-mire'&&['mire-cleft','crown-descent','ring-path','drowned-path'].some(id=>!connectionAvailable(worldConnections.find(e=>e.id===id),data)))target='lunmere';const origin=target==='violet-mire'&&data.discoveries?.['region:lunmere']?'lunmere':'bellmire';return{origin,target,itinerary:travelItinerary(origin,target,data),simulation:target==='bellmire'?'local':'schedule-only'};}
