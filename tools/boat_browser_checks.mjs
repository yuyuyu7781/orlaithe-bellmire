// Read-only checks usable from the browser console or automation harness.
export function auditBoatAndIsland(app){
 const {THREE,walking,boatTravel,caerith}=app;
 const docks=Object.entries(boatTravel.docks).map(([id,d])=>({id,boat:d.boat,landing:d.feet,safe:['human','cat'].map(mode=>walking.canStandTownAs(mode,d.feet[0],d.feet[2],d.feet[1])!==null)}));
 const supports=caerith.catSteps.map(o=>{const b=new THREE.Box3().setFromObject(o,true),p=b.getCenter(new THREE.Vector3()),ground=caerith.heightAt(p.x,p.z);return{position:p.toArray(),ground,gap:b.min.y-ground,usable:walking.canStandTownAs('cat',p.x,p.z,b.max.y)!==null};});
 return{docks,supports,visited:app.regionSystem.data.map(r=>({id:r.id,visited:r.visited})),boat:{active:boatTravel.active,dock:boatTravel.lastDock,mode:boatTravel.state.profile},issues:[...docks.filter(d=>d.safe.includes(false)),...supports.filter(s=>!s.usable||s.gap<-.08||s.gap>.05)]};
}
