import {crownOpen,crownHeight,crownLayout} from '../hollow-crown.js';
import {ringHeight} from '../the-ring.js';
// Reusable read-only audit. Call in a running exposed-world browser, not Node.
export function auditCrownWalking({walking,crown}){
 if(!crownOpen())throw Error('Expose and unlock Hollow Crown before this walking audit');
 const issues=[];let passageSamples=0,floorSamples=0;
 for(const profile of ['human','cat'])for(let i=1;i<crownLayout.passage.length;i++){
  const a=crownLayout.passage[i-1],b=crownLayout.passage[i];for(let j=0;j<=30;j++){const t=j/30,x=a[0]+(b[0]-a[0])*t,z=a[2]+(b[2]-a[2])*t,y=Math.max(crownHeight(x,z)??-Infinity,ringHeight(x,z)??-Infinity);passageSamples++;if(walking.canStandTownAs(profile,x,z,y)===null)issues.push({kind:'passage',profile,x,z,y});}
 }
 for(const profile of ['human','cat'])for(let radius=0;radius<=13;radius++)for(let i=0;i<36;i++){
  const a=i/36*Math.PI*2,x=-411+radius*Math.cos(a),z=-146+radius*Math.sin(a),y=crownHeight(x,z);floorSamples++;
  // Human-only obstruction is expected below visibly low cat arches.
  if(walking.canStandTownAs(profile,x,z,y)===null&&!(profile==='human'&&crown.routes.some(q=>Math.hypot(x-q.center[0],z-q.center[2])<1.1)))issues.push({kind:'floor',profile,x,z,y});
 }
 return {passageSamples,floorSamples,issues};
}
