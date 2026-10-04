import {surfacePalette,districtWeights,waterInfluence} from './scene-settings.js';
// A restrained surface wash: original positions, topology and palette families
// stay intact. Apply after contact/collision registration; no per-frame repainting.
export function applyStorybookSurfaces({THREE,scene,grounding,stone,wood,roof,ground,terrain,ignored}){
  const sets={stone:new Set(stone),wood:new Set(wood),roof:new Set(roof),ground:new Set(ground)},terrainSet=new Set(terrain);
  const textures={},variants=new Map(),usage=new Map(),world=new THREE.Vector3(),normal=new THREE.Vector3();
  const stats={meshes:0,vertices:0,colorBytes:0,clonedGeometries:0,materials:0,textures:0,plants:0,kinds:{stone:0,wood:0,roof:0,ground:0}};
  const inside=(o,roots)=>{for(let p=o;p;p=p.parent)if(roots.includes(p))return true;return false;};
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  // Small periodic pigment washes and faint stone courses, never photo textures.
  function wash(kind){
    const size=128,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
    const ctx=canvas.getContext('2d'),data=ctx.createImageData(size,size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const u=x/size*Math.PI*2,v=y/size*Math.PI*2;
      const broad=Math.sin(u+Math.sin(v)*.5)*Math.cos(u*2+v);
      const small=Math.sin(u*7+v*3)*Math.cos(v*5-u*2);
      const stroke=kind==='wood'?Math.sin(u*5+Math.sin(v)*.5)*.4:Math.sin(u*3-v*2)*.22;
      let pigment=246+6*broad+2.5*small+stroke*3;
      if(kind==='stone'){
        const row=Math.floor(y/size*8),cell=x/size*4+(row%2)*.5;
        const bed=(y/size*8)%1,join=cell%1;
        pigment+=Math.sin(Math.floor(cell)*13.1+row*7.7)*3;
        if(bed<.045||join<.025)pigment-=10;
      }
      const value=Math.round(Math.min(255,pigment)),i=(y*size+x)*4;
      data.data[i]=data.data[i+1]=data.data[i+2]=value;data.data[i+3]=255;
    }
    ctx.putImageData(data,0,0);const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;t.anisotropy=1;t.name='Quiet '+kind+' pigment wash';textures[kind]=t;stats.textures++;return t;
  }
  for(const kind of Object.keys(sets))wash(kind);
  function material(base,kind){let kinds=variants.get(base);if(!kinds){kinds=new Map();variants.set(base,kinds);}if(!kinds.has(kind)){
    const m=base.clone();m.map=textures[kind];m.vertexColors=true;m.roughness=Math.max(base.roughness,kind==='wood'?.96:.94);m.color.lerp(new THREE.Color(surfacePalette[kind]),kind==='stone'?.12:.07);m.name='Storybook '+kind;m.userData={...base.userData,storybookKind:kind,storybookSource:base.uuid};kinds.set(kind,m);stats.materials++;
  }return kinds.get(kind);}
  scene.updateMatrixWorld(true);scene.traverse(o=>{if(o.isMesh)usage.set(o.geometry,(usage.get(o.geometry)??0)+1);});
  scene.traverse(o=>{
    if(!o.isMesh||!visible(o)||inside(o,ignored)||Array.isArray(o.material)||o.material.transparent||o.material.emissive?.getHex())return;
    const base=o.material,p=o.geometry.parameters??{};
    let kind=terrainSet.has(o)||o.userData.walkSurface?'ground':Object.keys(sets).find(k=>sets[k].has(base));
    if(!kind)return;
    if(kind==='stone'&&o.geometry.type==='BoxGeometry'&&p.height<=.65&&Math.min(p.width,p.depth)>=.2)kind='ground';
    // Separate shared buffers only when the individual wash needs its own colors.
    if(usage.get(o.geometry)>1){o.geometry=o.geometry.clone();stats.clonedGeometries++;}
    const geometry=o.geometry,pos=geometry.attributes.position,norm=geometry.attributes.normal,colors=new Float32Array(pos.count*3);
    geometry.computeBoundingBox();const b=geometry.boundingBox,height=Math.max(.01,b.max.y-b.min.y);
    o.getWorldPosition(world);const origin=world.clone(),seed=Math.sin(origin.x*1.37+origin.z*2.19+origin.y*.47);
    const district=districtWeights(origin.x,origin.z),wet=waterInfluence(origin.x,origin.y,origin.z);const lightDirection=new THREE.Vector3(-.5,.74,.4).normalize();
    for(let i=0;i<pos.count;i++){
      world.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
      if(norm)normal.fromBufferAttribute(norm,i);else normal.set(0,1,0);
      const foot=(pos.getY(i)-b.min.y)/height,edge=1-Math.min(1,foot*3);
      const grain=Math.sin(world.x*.83+world.z*.61)*Math.cos(world.z*.47-world.y*.31);
      const facet=Math.sin(normal.x*2.1+normal.z*3.2+seed);
      let value=1+seed*.022+grain*.018+facet*.016;
      let r=value,g=value,bl=value;
      if(kind==='roof'){r*=.97+seed*.018;g*=1.012;bl*=.98;}
      if(kind==='stone'){const stain=edge*(.035+wet*.040);r*=1-stain;g*=1-stain*.5;bl*=1-stain*.95;}
      if(kind==='wood'){const damp=.012+wet*.043;r*=1-damp;g*=1-damp*.88;bl*=1-damp*.8;value=1-edge*.026;r*=value;g*=value;bl*=value;}
      if(kind==='ground'){const damp=(1+grain)*.025;r*=1-damp;g*=1-damp*.66;bl*=1-damp;}
      normal.transformDirection(o.matrixWorld);
      const facing=normal.dot(lightDirection),warm=Math.max(0,facing),cool=Math.max(0,-facing);
      r*=1+district.middle*.018-district.harbor*.028+warm*.035-cool*.030;
      g*=1+district.upper*.012+district.middle*.012-district.harbor*.015+warm*.018;
      bl*=1+district.upper*.024-district.harbor*.004-warm*.008+cool*.022;
      colors[i*3]=r;colors[i*3+1]=g;colors[i*3+2]=bl;
      // World-sized courses prevent giant blocks on a long, otherwise bare wall.
      if((kind==='stone'||kind==='ground')&&geometry.attributes.uv){const n=normal,uv=geometry.attributes.uv;if(Math.abs(n.y)>.7)uv.setXY(i,world.x/4,world.z/4);else if(Math.abs(n.x)>.7)uv.setXY(i,world.z/4,world.y/4);else uv.setXY(i,world.x/4,world.y/4);}
    }
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));o.material=material(base,kind);o.userData.storybookKind=kind;
    stats.meshes++;stats.kinds[kind]++;stats.vertices+=pos.count;stats.colorBytes+=colors.byteLength;
  });
  // A few short tufts at quiet edges; moss itself is mostly surface color.
  const plants=new THREE.Group();plants.name='Sparse edge greenery';scene.add(plants);
  const leaf=new THREE.MeshStandardMaterial({color:0x637053,roughness:1,side:THREE.DoubleSide});
  const occupied=[];scene.traverse(o=>{if(o.isMesh&&visible(o)&&!o.userData.walkSoft&&!inside(o,ignored)&&!terrainSet.has(o))occupied.push(new THREE.Box3().setFromObject(o,true));});
  for(const [x,z]of [[-33.9,27.25],[-15.3,32],[21.85,25],[21.85,30],[9.45,18.6],[20.1,35.1],[-39,11.65],[-5.6,-18.6],[41.7,10.7]]){
    const y=grounding.heightAt(x,z);if(y===null)continue;
    const b=new THREE.Box3(new THREE.Vector3(x-.07,y+.015,z-.07),new THREE.Vector3(x+.07,y+.19,z+.07));
    if(occupied.some(w=>{const overlap=b.clone().intersect(w).getSize(new THREE.Vector3());return Math.min(overlap.x,overlap.y,overlap.z)>.02;}))continue;
    const tuft=new THREE.Group();tuft.position.set(x,y+.003,z);plants.add(tuft);
    for(let i=0;i<3;i++){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-.025,0,0,.025,0,0,.018,.11+i*.024,0],3));g.computeVertexNormals();const o=new THREE.Mesh(g,leaf);o.rotation.y=i*2.1;tuft.add(o);o.userData.walkSoft=true;}
    stats.plants++;
  }
  return {stats,textures,plants};
}
