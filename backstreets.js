import {createDetailBatch} from './miniature.js';

// Secondary facades reuse the existing shells/windows and safe floor data.
// Fittings hug the wall: no new terrain or invisible movement restrictions.
export function enrichBackstreets({THREE,scene,miniature,walking,grounding}){
 const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:1});
 const wood=mat(0x675240),iron=mat(0x41453b),linen=mat(0xa49a7c),leaf=mat(0x59694c);
 const batch=createDetailBatch(THREE,scene,'Backstreet household fittings'),sites=[];
 const areas=[['パン屋裏',-31,26],['古書店裏',-18,29],['宿屋裏',-39,3],['酒場裏',-10,12],['市場裏',19,14],['港の裏路地',-6,32],['水車小屋脇',19,27],['上層の隙間',-9,-18]];
 const used=new Set();
 for(const [area,ax,az]of areas){
  const shells=[...miniature.shells].sort((a,b)=>a.b.getCenter(new THREE.Vector3()).distanceToSquared(new THREE.Vector3(ax, a.b.getCenter(new THREE.Vector3()).y,az))-b.b.getCenter(new THREE.Vector3()).distanceToSquared(new THREE.Vector3(ax,b.b.getCenter(new THREE.Vector3()).y,az)));
  let added=0;
  for(const {object,b}of shells){if(used.has(object)||added>=2)continue;const c=b.getCenter(new THREE.Vector3());if(Math.hypot(c.x-ax,c.z-az)>(area==='市場裏'?8:12))continue;
   angles:for(const angle of [Math.PI,-Math.PI/2,Math.PI/2]){
    const width=angle===Math.PI?b.max.x-b.min.x:b.max.z-b.min.z;
    for(const offset of [-Math.min(width*.28,width/2-.95),Math.min(width*.28,width/2-.95),0]){
    const n=new THREE.Vector3(Math.sin(angle),0,Math.cos(angle));
    const p=new THREE.Vector3(angle===Math.PI?c.x:angle>0?b.max.x:b.min.x,0,angle===Math.PI?b.min.z:c.z);
    p.add(new THREE.Vector3(Math.cos(angle),0,-Math.sin(angle)).multiplyScalar(offset));
    if(sites.some(s=>Math.hypot(s.door[0]-p.x,s.door[2]-p.z)<2.4))continue;
    const approach=p.clone().addScaledVector(n,.80),y=grounding.heightAt(approach.x,approach.z);
    if(y===null||walking.canStand(approach.x,approach.z,y)===null||y<b.min.y-.03||y+1.0>b.max.y)continue;
    // Keep door, canopy and drying fittings clear of the existing window frame.
    const h=Math.min(1.70,b.max.y-y-.40),center=p.clone().add(new THREE.Vector3(Math.cos(angle),0,-Math.sin(angle)).multiplyScalar(.23));center.y=y+(h+.4)/2;
    const footprint=new THREE.Box3().setFromCenterAndSize(center,new THREE.Vector3(angle===Math.PI?1.40:.36,h+.4,angle===Math.PI?.36:1.40));
    if(miniature.faces.some(f=>f.wall===object&&footprint.intersectsBox(new THREE.Box3().setFromObject(f.window,true).expandByScalar(.20))))continue;
    p.y=y;p.addScaledVector(n,.015);
    const piece=(local,size,material)=>batch.add('block',material,new THREE.Vector3(...local).applyAxisAngle(new THREE.Vector3(0,1,0),angle).add(p).toArray(),size,angle);
    piece([0,h/2,.02],[.68,h,.045],wood);
    for(const dx of [-.37,.37])piece([dx,h/2,.018],[.06,h+.12,.065],iron);
    piece([0,h+.06,.03],[.80,.07,.09],wood);piece([.23,h*.51,.063],[.07,.06,.025],iron);
    for(const yy of [h*.20,h*.74])piece([-.27,yy,.050],[.18,.055,.02],iron);
    piece([0,h+.32,.04],[.90,.075,.24],wood);
    // One short drying cloth or herb shelf, rather than a front-shop display.
    if(added===0){piece([.73,h*.72,.045],[.33,Math.min(.45,h*.30),.035],linen);piece([.73,h*.88+.03,.055],[.44,.045,.075],wood);}
    else {piece([.62,h*.38,.10],[.35,.05,.20],wood);for(let i=0;i<3;i++)piece([.51+i*.1,h*.50,.07],[.05,Math.min(.29,h*.20),.035],leaf);}
    sites.push({area,wall:object,approach:[approach.x,y,approach.z],door:p.toArray(),angle,height:h});used.add(object);added++;break angles;
    }
   }
  }
 }
 return {...batch.finish(),sites,stats:{doors:sites.length,areas:[...new Set(sites.map(s=>s.area))]}};
}
