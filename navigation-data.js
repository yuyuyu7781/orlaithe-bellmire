import {outskirtsLayout} from './outskirts.js';
// Positions are feet on verified outdoor routes, never building centres.
// Shops reuse the actual entrance chosen by the existing shop system.
export const townLandmarks=[
 {id:'outskirts',name:'町外れ',short:'外',position:outskirtsLayout.gate},
 {id:'hill',name:'町を振り返る丘',short:'丘',position:outskirtsLayout.hill},
 {id:'harbor',name:'港',short:'港',position:[0,1.38,32]},
 {id:'mill',name:'水車',short:'水',position:[24.48,4.15,28.18]},
 {id:'square',name:'井戸広場',short:'井',position:[2.85,3.5,18.5]},
 {id:'cable',name:'ケーブルカー停留所',short:'軌',position:[41.2,1.8759,11.9]},
 {id:'belfry',name:'鐘楼方面',short:'鐘',position:[-4.5,9.3,-17.5]}
];
export function createDestinations(entrances,landmarks=townLandmarks){
 const short={bakery:'パン',bookshop:'本',inn:'宿',tavern:'酒',orrery:'星'};
 return [...entrances.map(e=>({id:e.shop.id,name:e.shop.name,short:short[e.shop.id]??e.shop.name,position:[...e.approach],shopId:e.shop.id})),...landmarks.map(l=>({...l,position:[...l.position]}))];
}
export function destinationReading(feet,yaw,target){
 const dx=target.position[0]-feet.x,dz=target.position[2]-feet.z,distance=Math.hypot(dx,dz);
 // Camera yaw increases toward west, while map bearings increase toward east.
 const angle=Math.atan2(dx,-dz)+yaw;
 const bearing=Math.atan2(Math.sin(angle),Math.cos(angle));
 return {distance,bearing,arrived:distance<=1&&Math.abs(target.position[1]-feet.y)<=.55};
}
