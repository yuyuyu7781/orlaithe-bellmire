import {buildLodgingInterior} from './lodging-interiors.js';
import {caerithHeight} from './caerith.js';
export function buildLodgingShelters({THREE,mire,caerith}){
 const hours={morning:'open',day:'open',evening:'open',night:'open'},shops=[];
 const wood=new THREE.MeshStandardMaterial({color:0x655e4c,roughness:1});
 // Reuse the existing Mire work shelter. The door faces its dry approach.
 shops.push({id:'mire-rest',name:'湿地作業者の休息小屋',region:'violet-mire',center:[-472,-228],size:[4.8,4.8],type:'shelter',restable:true,restType:'shelter',hours,buildInterior:buildLodgingInterior,exterior:{at:[-469.6,4.5,-228],approach:[-468.2,4.5,-228],normal:[1,0,0],angle:Math.PI/2}});
 // A small open-sided work shelter close to the landing, outside tower ruins.
 const x=-375,z=-62,y=caerithHeight(x,z),g=new THREE.Group();g.name='湖上作業者の休憩所';caerith.root.add(g);
 const piece=(x,y,z,w,h,d)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),wood);o.position.set(x,y+h/2,z);o.userData.walkSoft=true;g.add(o);return o;};
 for(const dx of[-1.8,1.8])for(const dz of[-1.8,1.8])piece(x+dx,caerithHeight(x+dx,z+dz),z+dz,.12,2.2,.12);piece(x,y+2.2,z,4.3,.14,4.3);piece(x-1,y,z,1,.35,2);piece(x+1,y,z,1,.5,.8);
 const atX=x+2.15,apX=atX+1.4;shops.push({id:'caerith-rest',name:'湖上作業者の休憩所',region:'caerith',center:[x,z],size:[4.3,4.3],type:'shelter',restable:true,restType:'shelter',hours,buildInterior:buildLodgingInterior,exterior:{at:[atX,caerithHeight(atX,z),z],approach:[apX,caerithHeight(apX,z),z],normal:[1,0,0],angle:Math.PI/2}});
 return{shops};
}
