// Local city operations only; independent of Lake Lun tides and save progress.
export const closureProfiles={
 canalWard:{label:'水門作業中',reason:'水位が高く、向こうの低い通路は閉じられている。',open:'水が引き、作業柵は道の脇へ寄せられている。'},
 civicWard:{label:'搬入中の通路',reason:'舗装の補修と資材搬入で、この通路は塞がれている。',open:'搬入が終わり、資材は道の脇へまとめられている。'},
 scholarHeights:{label:'上り道の修繕',reason:'上り道の石段を直している。今は足場が通路を塞いでいる。',open:'石段の補修が済み、足場は道の脇へ寄せられている。'},
 oldQuarter:{label:'塞がれた古いアーチ',reason:'古いアーチは石で塞がれている。道には見えない。',open:'古い壁の脇に、奥へ続く細い通りが見える。'}
};
export function closureFrame(link){
 let best=null;for(let i=1;i<link.points.length;i++){const a=link.points[i-1],b=link.points[i],dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz);if(!len)continue;const t=Math.max(0,Math.min(1,((link.gate[0]-a[0])*dx+(link.gate[2]-a[2])*dz)/(len*len))),d=Math.hypot(link.gate[0]-a[0]-t*dx,link.gate[2]-a[2]-t*dz);if(!best||d<best.d)best={d,tx:dx/len,tz:dz/len,center:[a[0]+t*dx,a[1]+t*(b[1]-a[1]),a[2]+t*dz]};}
 return{...best,width:8,depth:2.2};
}
export function closureBlocks(link,x,z,radius=0){const f=closureFrame(link),dx=x-f.center[0],dz=z-f.center[2];return Math.abs(dx*f.tz-dz*f.tx)<f.width/2+radius&&Math.abs(dx*f.tx+dz*f.tz)<f.depth/2+radius;}
export function buildClosure({THREE,link,materials,parent,open}){
 const f=closureFrame(link),profile=closureProfiles[link.to],root=new THREE.Group();root.position.set(...f.center);root.rotation.y=Math.atan2(f.tx,f.tz);root.name=profile.label;parent.add(root);
 const closed=new THREE.Group(),parked=new THREE.Group();root.add(closed,parked);
 const box=(g,x,y,z,w,h,d,ma)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),ma);o.position.set(x,y+h/2,z);o.userData.walkSoft=true;o.castShadow=false;g.add(o);return o;};
 const old=link.to==='oldQuarter';
 // Visible banks/jambs terminate the 6.6 m road, preventing apparent side gaps.
 for(const x of [-3.8,3.8])box(root,x,0,0,.65,old?3:1.5,2.2,materials.old);
 if(old){box(root,0,2.7,0,8,.4,1,materials.old);for(let row=0;row<5;row++)for(let i=0;i<8;i++)box(closed,-3.5+i+(row%2?.15:0),row*.5,0,.97,.48,.9,materials.old);box(parked,5,0,0,1.4,.55,1.1,materials.old);}
 else{
  box(closed,0,0,0,7.4,.48,2.2,link.to==='civicWard'?materials.old:materials.wood);
  for(const x of [-3.4,0,3.4])box(closed,x,.4,0,.14,1.25,.14,materials.wood);
  for(const y of [.8,1.3])box(closed,0,y,0,7.4,.08,.08,materials.wood);
  let signMaterial=materials.paper;
  if(typeof document!=='undefined'){const canvas=document.createElement('canvas');canvas.width=384;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#d3c6a4';c.fillRect(0,0,384,128);c.fillStyle='#514b3f';c.font='38px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(profile.label,192,64);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;signMaterial=new THREE.MeshBasicMaterial({map:texture,toneMapped:false});}
  box(closed,0,1.1,-.1,1.35,.45,.06,signMaterial);
  if(link.to==='canalWard'){box(closed,0,.025,2.3,6.6,.03,2.4,materials.water);box(closed,2.8,.04,2.8,.6,.3,.65,materials.wood);}
  if(link.to==='civicWard'){box(closed,-1,.48,.3,2,.85,1.5,materials.wood);box(closed,1.7,.48,.3,1.8,.45,1.4,materials.old);}
  if(link.to==='scholarHeights'){for(const x of [-2.5,2.5])box(closed,x,.48,.7,.15,1.7,.15,materials.wood);box(closed,0,1.55,.7,5.3,.15,1,materials.wood);box(closed,1,.48,-.4,1.3,.45,1.3,materials.old);}
  box(parked,5,0,0,1.4,.55,1.3,materials.wood);box(parked,5,.6,0,.2,1.3,.15,materials.wood);
 }
 // Static boxes share a few draws; visibility remains local to each state group.
 for(const group of [root,closed,parked]){const byMaterial=new Map();for(const o of [...group.children])if(o.isMesh){if(!byMaterial.has(o.material))byMaterial.set(o.material,[]);byMaterial.get(o.material).push(o);}for(const [material,list]of byMaterial){const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),material,list.length),matrix=new THREE.Matrix4();for(let i=0;i<list.length;i++){const o=list[i],p=o.geometry.parameters;matrix.compose(o.position,o.quaternion,new THREE.Vector3(p.width,p.height,p.depth));mesh.setMatrixAt(i,matrix);group.remove(o);o.geometry.dispose();}mesh.userData.walkSoft=true;mesh.computeBoundingSphere();group.add(mesh);}}
 function sync(){const available=open(link.to);closed.visible=!available;parked.visible=available;root.userData.closed=!available;}
 sync();return{link,object:root,closed,parked,sync,frame:f,profile};
}
