// Read-only browser-console audit. Pass the application's debug/test references;
// it does not advance days, edit saves, move actors or change the water level.
export function auditDrownedWay(app){
 const road=app.drownedWay.layout,phase=app.lakeWaterLevel.phase,samples=[];
 for(const profile of ['human','cat'])for(let i=1;i<road.route.length;i++){const a=road.route[i-1],b=road.route[i];for(let t=.05;t<1;t+=.05){const x=a[0]+t*(b[0]-a[0]),z=a[2]+t*(b[2]-a[2]),y=a[1]+t*(b[1]-a[1]);const alternatives=[0,.4,-.4,.8,-.8,1.15,-1.15].map(dz=>app.walking.canStandTownAs(profile,x,z+dz,y));samples.push({profile,segment:i,t,accessible:alternatives.some(v=>v!==null)});}}
 const end=road.futureDirection,unsupported=['human','cat'].every(p=>app.walking.canStandTownAs(p,end[0],end[2],road.route.at(-1)[1])===null);
 return{phase,samples,unsupportedContinuation:unsupported,issues:phase==='veryLow'?samples.filter(s=>!s.accessible):[],thread:app.drownedStay.progress};
}
