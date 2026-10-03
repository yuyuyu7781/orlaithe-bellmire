// A restrained surface wash: original positions, topology and base palette stay
// intact. Apply after contact/collision registration; no per-frame repainting.
export function applyStorybookSurfaces({THREE,scene,grounding,stone,wood,roof,ground,terrain,ignored}){
  const sets={stone:new Set(stone),wood:new Set(wood),roof:new Set(roof),ground:new Set(ground)},terrainSet=new Set(terrain);
  const textures={},variants=new Map(),usage=new Map(),world=new THREE.Vector3(),normal=new THREE.Vector3();
  const stats={meshes:0,vertices:0,colorBytes:0,clonedGeometries:0,materials:0,textures:0,plants:0,kinds:{stone:0,wood:0,roof:0,ground:0}};
  const inside=(o,roots)=>{for(let p=o;p;p=p.parent)if(roots.includes(p))return true;return false;};
  const visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
  // Small periodic washes, not photographic wood grain or tiled brick outlines.
  function wash(kind){
    const size=128,canvas=document.createElement('canvas');canvas.width=canvas.height=size;
    const ctx=canvas.getContext('2d'),data=ctx.createImageData(size,size);
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      const u=x/size*Math.PI*2,v=y/size*Math.PI*2;
      const broad=Math.sin(u+Math.sin(v)*.5)*Math.cos(u*2+v);
      const small=Math.sin(u*7+v*3)*Math.cos(v*5-u*2);
      const stroke=kind==='wood'?Math.sin(u*5+Math.sin(v)*.5)*.4:Math.sin(u*3-v*2)*.22;
      const value=Math.round(246+6*broad+2.5*small+stroke*3),i=(y*size+x)*4;
      data.data[i]=data.data[i+1]=data.data[i+2]=value;data.data[i+3]=255;
    }
    ctx.putImageData(data,0,0);const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.NoColorSpace;t.anisotropy=1;t.name='Quiet '+kind+' pigment wash';textures[kind]=t;stats.textures++;return t;
  }
  for(const kind of Object.keys(sets))wash(kind);
  function material(base,kind){let kinds=variants.get(base);if(!kinds){kinds=new Map();variants.set(base,kinds);}if(!kinds.has(kind)){
    const m=base.clone();m.map=textures[kind];m.vertexColors=true;m.roughness=Math.max(base.roughness,kind==='wood'?.96:.94);m.name='Storybook '+kind;m.userData={...base.userData,storybookKind:kind};kinds.set(kind,m);stats.materials++;
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
    const waterside=(origin.z>24&&origin.y<7)||Math.abs(origin.x-21)<1.5;
    for(let i=0;i<pos.count;i++){
      world.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
      if(norm)normal.fromBufferAttribute(norm,i);else normal.set(0,1,0);
      const foot=(pos.getY(i)-b.min.y)/height,edge=1-Math.min(1,foot*3);
      const grain=Math.sin(world.x*.83+world.z*.61)*Math.cos(world.z*.47-world.y*.31);
      const facet=Math.sin(normal.x*2.1+normal.z*3.2+seed);
      let value=1+seed*.022+grain*.018+facet*.016;
      let r=value,g=value,bl=value;
      if(kind==='roof'){r*=.97+seed*.018;g*=1.012;bl*=.98;}
      if(kind==='stone'){const stain=edge*(waterside?.075:.035);r*=1-stain;g*=1-stain*.5;bl*=1-stain*.95;}
      if(kind==='wood'){const damp=waterside?.055:.012;r*=1-damp;g*=1-damp*.88;bl*=1-damp*.8;value=1-edge*.026;r*=value;g*=value;bl*=value;}
      if(kind==='ground'){const damp=(1+grain)*.025;r*=1-damp;g*=1-damp*.66;bl*=1-damp;}
      colors[i*3]=r;colors[i*3+1]=g;colors[i*3+2]=bl;
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
