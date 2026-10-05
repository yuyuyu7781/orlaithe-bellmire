import {waterPalette} from './scene-settings.js';
// Spatial tones share the existing weather controller and one material per tone.
const waterToneScale={fall:1.18,spring:1.07,stream:1.01,mill:.93,tailrace:.96,harbor:1};
import {createDetailBatch} from './miniature.js';

export function addHarborGoods(culture){return [
 ['Quay net mending basket',-26.2,34.1,'net'],['Pier fish basket',-16.7,41.9,'fish'],
 ['Harbor folded sail bags',14.8,34.9,'luggage'],['Mill rope store',23.8,31.8,'net']
 ].map(q=>culture.addGoods(...q)).filter(Boolean);}

// A low-poly boat, with the original length, waterline, anchor and seating.
// Geometry stays local to its existing group: no shoreline/traffic changes.
export function buildSkiff({THREE,boat,material,seatMaterial,box}){
 const outline=[[2.25,0],[1.55,.57],[.55,.65],[-1.40,.65],[-2.25,.22],[-2.25,-.22],[-1.40,-.65],[.55,-.65],[1.55,-.57]],vertices=[],colors=[];
 for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length],topA=[a[0],.20,a[1]],topB=[b[0],.20,b[1]],lowA=[a[0]*.78,-.32,a[1]*.55],lowB=[b[0]*.78,-.32,b[1]*.55];vertices.push(...topA,...lowA,...topB,...topB,...lowA,...lowB,0,-.32,0,...lowB,...lowA);for(let j=0;j<9;j++)colors.push(.93+(i%3)*.025,.94+(i%3)*.023,.93+(i%3)*.020);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();const hullMaterial=material.clone();hullMaterial.side=THREE.DoubleSide;hullMaterial.vertexColors=true;hullMaterial.color.lerp(new THREE.Color(0x6b503c),.24);const body=new THREE.Mesh(geometry,hullMaterial);body.castShadow=body.receiveShadow=true;body.name='Skiff hull';boat.add(body);for(const x of [-.75,.75])box(x,.02,0,.22,.10,1.06,seatMaterial,boat);
 const trim=seatMaterial.clone();trim.color.lerp(new THREE.Color(0x98714d),.25);
 function line(a,b,r,ma=trim){const start=new THREE.Vector3(...a),v=new THREE.Vector3(...b).sub(start),mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),5),ma);mesh.position.copy(start).addScaledVector(v,.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());boat.add(mesh);return mesh;}
 for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];line([a[0],.23,a[1]],[b[0],.23,b[1]],.045);}
 // A pair of crossed, resting oars lives inside the hull, away from the quay.
 for(const sign of [-1,1]){line([-1.28,.31,sign*.32],[1.05,.31,-sign*.22],.025);const paddle=box(-1.39,.275,sign*.36,.40,.055,.14,trim,boat);paddle.rotation.y=sign*.22;}
 const floor=[];for(let i=0;i<outline.length;i++){const a=outline[i],b=outline[(i+1)%outline.length];floor.push(0,-.02,0,a[0]*.91,-.02,a[1]*.82,b[0]*.91,-.02,b[1]*.82);}const fg=new THREE.BufferGeometry();fg.setAttribute('position',new THREE.Float32BufferAttribute(floor,3));fg.computeVertexNormals();const floorMaterial=seatMaterial.clone();floorMaterial.side=THREE.DoubleSide;const sole=new THREE.Mesh(fg,floorMaterial);sole.name='Skiff dry floorboards';boat.add(sole);boat.userData.skiffOutline=outline;
}

export function enrichHarbor({THREE,scene,grounding,walking,supports,water,water101,lit,ignored}){
 const mat=color=>new THREE.MeshStandardMaterial({color,roughness:.98});
 const stone=mat(0x969b89),wood=mat(0x775b43),moss=mat(0x54654c),iron=mat(0x393e38),rope=mat(0x8b7d61);
 const batch=createDetailBatch(THREE,scene,'Harbor stone courses, boards and greenery');
 const root=new THREE.Group();root.name='Harbor moorings and evening lamps';scene.add(root);
 const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible||ignored.includes(p))return false;return true;};
 let stones=0,boards=0,plants=0,ropes=0,lanterns=0;const boats=[],posts=[],waterSurfaces=[],backing=[],materials=new Map();scene.updateMatrixWorld(true);
 scene.traverse(o=>{
  if(!visible(o))return;if(o.userData.harborRole==='boat')boats.push(o);if(!o.isMesh||o.isInstancedMesh)return;const b=new THREE.Box3().setFromObject(o,true),g=o.geometry.parameters??{};
  if(['stone','ground'].includes(o.userData.storybookKind)&&g.width)backing.push(b);
  if(g.width>=.12&&g.width<=.26&&g.height>1.2&&g.depth<=.26&&b.max.z>34)posts.push({o,b});
  if(o.material===water||o.material===water101){const old=o.material,role=o.userData.waterRole??'harbor',tone=role==='spring-fall'?'fall':role.startsWith('spring')?'spring':role==='shallow-stream'?'stream':role==='wheel-pool'||role==='short-timber-feed'?'mill':role.startsWith('tailrace')?'tailrace':'harbor',key=old.uuid+':'+tone;if(!materials.has(key)){const m=old.clone();m.roughness=.76;m.metalness=.01;m.color.multiplyScalar(waterToneScale[tone]);materials.set(key,{material:m,base:m.color.clone()});}o.material=materials.get(key).material;waterSurfaces.push(o);
   if(old===water101){
    // Subdivide only the original flat top; keep the five other faces and the
    // exact water-volume bounds. No overlay, depth fighting or extra draw.
    const oldGeometry=o.geometry,pa=Array.from(oldGeometry.attributes.position.array),na=Array.from(oldGeometry.attributes.normal.array),uv=Array.from(oldGeometry.attributes.uv.array),indices=[];
    for(let j=0;j<oldGeometry.index.count;j+=3){const i=oldGeometry.index.array[j];if(oldGeometry.attributes.normal.getY(i)>.9)continue;indices.push(...oldGeometry.index.array.slice(j,j+3));}
    const start=pa.length/3,cols=32,rows=8;for(let row=0;row<=rows;row++)for(let col=0;col<=cols;col++){pa.push(-g.width/2+col*g.width/cols,g.height/2,-g.depth/2+row*g.depth/rows);na.push(0,1,0);uv.push(col/cols,row/rows);}
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){const a=start+row*(cols+1)+col,b=a+1,c=a+cols+1,d=c+1;indices.push(a,c,b,b,c,d);}
    const colors=[];for(let i=0;i<pa.length;i+=3){const x=pa[i]+o.position.x,z=pa[i+2]+o.position.z,shore=Math.max(0,1-(z-35.25)/10.5),v=.95-shore*.04+Math.sin(x*.53+z*1.7)*.018+Math.sin(x*.21-z*.45)*.014;colors.push(v,v+.018,v+.025);}
    const geom=new THREE.BufferGeometry();geom.parameters={...g};geom.setAttribute('position',new THREE.Float32BufferAttribute(pa,3));geom.setAttribute('normal',new THREE.Float32BufferAttribute(na,3));geom.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geom.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geom.setIndex(indices);o.geometry=geom;oldGeometry.dispose();o.name='Harbor pigment water volume';o.material.vertexColors=true;o.material.needsUpdate=true;
   }
  }
 });
 // Accumulated small stones face the existing terrace and quay surfaces. Their
 // back faces are inset; no new retaining wall or traversable ledge is created.
 for(const [z,x0,x1,y0,y1]of [[28,-44,35,1.40,3.48],[35.16,-34,34,1.24,1.67]])for(let row=0;row<Math.floor((y1-y0)/.39);row++)for(let x=x0+.43+(row%2)*.39;x<x1-.4;x+=.88){
  // Retain breaks for the port stairs, deck entrances and tailrace outlet.
  if((z===28&&(Math.abs(x)<1.3||Math.abs(x+13.3)<1.0))||(z>35&&(Math.abs(x+18)<2||Math.abs(x-11)<2||Math.abs(x-21.05)<.8)))continue;
  const y=y0+row*.39+.19;if(!backing.some(b=>b.max.z>=z-.04&&b.max.z<=z+.20&&b.containsPoint(new THREE.Vector3(x-.42,y-.18,z-.035))&&b.containsPoint(new THREE.Vector3(x+.42,y+.18,z-.035))))continue;const probe=new THREE.Vector3(x,y,z+.08);if(grounding.buildings.some(b=>b.containsPoint(probe)))continue;
  const v=(Math.sin(x*3.7+row*7.2)+1)/2,wet=z>35?.82:.94;batch.add('block',stone,[x,y,z+.018],[.82-v*.035,.35-v*.024,.085],v*.006,new THREE.Color(0xffffff).multiplyScalar(wet+v*.065));stones++;
 }
 for(const o of supports){if(o.material.userData.storybookKind!=='wood'||!visible(o))continue;const b=new THREE.Box3().setFromObject(o,true),size=b.getSize(new THREE.Vector3());if(size.y>.4||size.x<.6||size.z<.5)continue;const m=o.material.clone();m.color.lerp(new THREE.Color(0x594330),.18);o.material=m;
  const nx=Math.max(1,Math.floor(size.x/.75)),nz=Math.max(1,Math.floor(size.z/1.05));for(let i=0;i<nx;i++)for(let j=0;j<nz;j++){const x=b.min.x+(i+.5)*size.x/nx,z=b.min.z+(j+.5)*size.z/nz;batch.add('block',wood,[x,b.max.y+.003,z],[size.x/nx-.025,.006,size.z/nz-.025],0,new THREE.Color(0xffffff).multiplyScalar(.82+(i%3)*.06+(j%2)*.025));boards++;}
 }
 for(const [x,z]of [[-30,35.23],[-12,35.23],[3.5,35.23],[20.8,35.20],[21.85,30.9]]){const y=grounding.heightAt(x,z);if(y===null||grounding.buildings.some(b=>b.containsPoint(new THREE.Vector3(x,y+.1,z))))continue;for(let i=0;i<3;i++)batch.add('leaf',moss,[x+i*.06,y+.09+i*.017,z],[.09,.10,.07]);plants++;}
 function line(parent,a,b,material,r=.015){const p=new THREE.Vector3(...a),v=new THREE.Vector3(...b).sub(p),o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,v.length(),5),material);o.position.copy(p).addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());o.userData.walkSoft=true;parent.add(o);return o;}
 for(const boat of boats){const outline=boat.userData.skiffOutline;let best=null;for(const p of posts)for(const [x,z]of outline){const a=boat.localToWorld(new THREE.Vector3(x,.23,z)),b=p.b.getCenter(new THREE.Vector3());b.y=Math.min(p.b.max.y-.08,1.65);const dist=a.distanceTo(b);if(dist<3.5&&(!best||dist<best.dist))best={a,b,dist};}if(!best)continue;const mid=best.a.clone().lerp(best.b,.5);mid.y=Math.max(1.27,Math.min(best.a.y,best.b.y)-.10);line(root,best.a.toArray(),mid.toArray(),rope);line(root,mid.toArray(),best.b.toArray(),rope);ropes++;}
 // Attach small oil lanterns to existing pier posts; no new point light/pole.
 for(const [x,z]of [[-19.35,42.6],[12.35,42.6]]){const p=posts.find(q=>Math.abs(q.b.getCenter(new THREE.Vector3()).x-x)<.15&&Math.abs(q.b.getCenter(new THREE.Vector3()).z-z)<.15);if(!p)continue;const c=p.b.getCenter(new THREE.Vector3()),y=p.b.max.y-.10;line(root,[c.x,y,c.z],[c.x+.28,y,c.z],iron,.023);
  const glow=new THREE.MeshStandardMaterial({color:0xe8b77a,emissive:0xffb05b,emissiveIntensity:.7,roughness:.90});lit.push(glow);const o=new THREE.Mesh(new THREE.BoxGeometry(.15,.20,.13),glow);o.position.set(c.x+.27,y-.14,c.z);o.userData.walkSoft=true;root.add(o);batch.add('block',iron,[c.x+.27,y-.27,c.z],[.23,.035,.20]);batch.add('block',iron,[c.x+.27,y-.015,c.z],[.23,.035,.20]);for(const dx of [-.09,.09])batch.add('block',iron,[c.x+.27+dx,y-.14,c.z+.065],[.018,.24,.02]);line(root,[c.x+.27,y,c.z],[c.x+.27,y-.035,c.z],iron,.012);lanterns++;
 }
 const detail=batch.finish();
 // A dozen muted opaque marks suggest warm reflections near the two lamps.
 // They share one draw; no transparency, reflection pass or water shader.
 const reflectionMaterial=new THREE.MeshStandardMaterial({color:0x5a756e,emissive:0x8c6941,emissiveIntensity:0,roughness:1});
 const reflectionBatch=createDetailBatch(THREE,scene,'Quiet pier lamp reflections');
 for(const x of [-20,13])for(let i=0;i<6;i++)reflectionBatch.add('block',reflectionMaterial,[x+Math.sin(i*2.1)*.16,1.232,42.9+i*.22],[.16+i*.045,.002,.025+i*.003]);const reflections=reflectionBatch.finish();
 function applyTime(state){const dark=state.weather==='blackout',night=state.period==='night',factor=dark?.30:night?.62:state.weather==='rain'?.86:state.weather==='dawn'&&state.period==='morning'?.82:1;for(const {material:m,base}of materials.values())m.color.copy(base).lerp(new THREE.Color(waterPalette.tint),waterPalette.tintAmount).multiplyScalar(factor);if(state.weather==='dawn'&&state.period==='morning')for(const {material:m}of materials.values())m.color.lerp(new THREE.Color(0x3f596c),.20);reflectionMaterial.color.copy(new THREE.Color(night?0x6d7459:0x55716a)).multiplyScalar(dark?.3:1);reflectionMaterial.emissiveIntensity=dark?0:night?.10:state.period==='evening'?.06:0;}
 return{root,detail,reflections,waterSurfaces,boats,applyTime,stats:{stones,boards,plants,ropes,lanterns,boats:boats.length,instances:detail.instances,batches:detail.batches+reflections.batches,pointLightsAdded:0}};
}
