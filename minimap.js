import {watercourseLayout} from './waterways.js';
// One small 2D canvas; no second camera, WebGL pass, texture or light.
export function createMinimap({walking,shopSystem,inspections,navigation,buildings,roads=[],regionBuildings={}}){
 const root=document.createElement('section');root.className='town-map';root.hidden=true;root.setAttribute('aria-label','BellmireとNine Stonesの簡易街路図');
 const heading=document.createElement('div');heading.className='town-map-heading';heading.textContent='Bellmire · Nine Stones';
 const canvas=document.createElement('canvas');canvas.setAttribute('role','img');canvas.setAttribute('aria-label','現在地、向き、主要な行先とおおまかな街路');
 const caption=document.createElement('div');caption.className='town-map-caption';caption.textContent='上が北 · 淡い線は主な街路';
 const expand=document.createElement('button');expand.textContent='拡大';expand.setAttribute('aria-label','地図を拡大');
 const close=document.createElement('button');close.textContent='閉じる';close.setAttribute('aria-label','地図を閉じる');
 const buttons=document.createElement('div');buttons.className='town-map-buttons';buttons.append(expand,close);const chain=document.createElement('div');chain.className='town-map-caption';chain.textContent='Bellmire → Nine Stones → Lake Lun → Lunmere → Isle of Caerith';root.append(heading,chain,canvas,caption,buttons);document.body.append(root);
 const toggle=document.createElement('button');toggle.id='mapToggle';toggle.textContent='地図';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','townMap');root.id='townMap';navigation.tools.append(toggle);
 let expanded=false,elapsed=0,width=180,height=150;const context=canvas.getContext('2d');
 let regionId="bellmire";const bounds={minX:-215,maxX:48,minZ:-48,maxZ:45};
 const project=(x,z)=>[12+(x-bounds.minX)/(bounds.maxX-bounds.minX)*(width-24),10+(z-bounds.minZ)/(bounds.maxZ-bounds.minZ)*(height-20)];
 function resize(){width=expanded?270:180;height=expanded&&innerHeight>500?220:150;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=width*dpr;canvas.height=height*dpr;canvas.style.width=width+'px';canvas.style.height=height+'px';context.setTransform(dpr,0,0,dpr,0,0);}
 function setOpen(open){navigation.state.mapOpen=!!open;toggle.setAttribute('aria-expanded',String(!!open));update(1);}
 toggle.onclick=()=>setOpen(!navigation.state.mapOpen);close.onclick=()=>setOpen(false);expand.onclick=()=>{expanded=!expanded;expand.textContent=expanded?'縮小':'拡大';expand.setAttribute('aria-label','地図を'+expand.textContent);resize();draw();};
 function draw(){
  context.clearRect(0,0,width,height);context.fillStyle='#ddd4bb';context.fillRect(0,0,width,height);
  const shoreline=project(0,35.3)[1];if(regionId==="bellmire"){context.fillStyle='#829ba04d';context.fillRect(0,shoreline,width,height-shoreline);}else if(regionId==='caerith'){context.fillStyle='#829ba04d';context.fillRect(0,0,width,height);const c=project(-367,-76);context.beginPath();context.ellipse(c[0],c[1],17/(bounds.maxX-bounds.minX)*(width-24),19/(bounds.maxZ-bounds.minZ)*(height-20),0,0,Math.PI*2);context.fillStyle='#a9ae8455';context.fill();}else if(regionId==='lunmere'){context.fillStyle='#829ba04d';context.fillRect(0,0,width,project(-430,-3)[1]);}else if(regionId==="lake-lun"){context.fillStyle="#829ba04d";const shore=project(-316,0)[0];context.fillRect(0,0,shore,height);}
  context.fillStyle='#786b502b';context.strokeStyle='#7b6a4535';context.lineWidth=.5;
  for(const shell of (regionId==="bellmire"?buildings:(regionBuildings[regionId]??[]))){const a=project(shell.b.min.x,shell.b.min.z),b=project(shell.b.max.x,shell.b.max.z);context.fillRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);}
  context.strokeStyle='#f5ecd4';context.lineWidth=expanded?2.3:1.5;context.lineJoin='round';
  for(const road of roads){if(road.length<2)continue;context.beginPath();road.forEach((p,i)=>{const q=project(p[0],p[2]);i?context.lineTo(...q):context.moveTo(...q)});context.stroke();}
  // The map consumes the same water points as the scene, without a 3D pass.
  if(regionId==='bellmire'){context.strokeStyle='#607f7b';context.lineWidth=expanded?1.8:1.2;context.beginPath();
  [watercourseLayout.source,...watercourseLayout.upper,...watercourseLayout.falls,...watercourseLayout.open,...watercourseLayout.feed.slice(1),...watercourseLayout.lower.slice(1)].forEach((p,i)=>{const q=project(p[0],p[2]);i?context.lineTo(...q):context.moveTo(...q)});context.stroke();}
  context.font=(expanded?'11':'9')+'px serif';context.textBaseline='middle';
  for(const d of navigation.destinations){const [x,y]=project(d.position[0],d.position[2]),selected=navigation.state.selected?.id===d.id;context.beginPath();context.arc(x,y,selected?4:2.3,0,Math.PI*2);context.fillStyle=selected?'#986238':'#6f664b';context.fill();context.fillStyle='#403e30';context.fillText(d.short,x+5,y-3);}
  const feet=walking.state.feet,[x,y]=project(feet.x,feet.z);context.save();context.translate(x,y);context.rotate(-walking.state.yaw);context.beginPath();context.moveTo(0,-6);context.lineTo(4,5);context.lineTo(0,3);context.lineTo(-4,5);context.closePath();context.fillStyle=walking.state.profile.id==='cat'?'#775740':'#345f51';context.strokeStyle='#f9eed3';context.lineWidth=1;context.fill();context.stroke();context.restore();
  caption.textContent=(walking.state.profile.id==='cat'?'猫':'人間')+' · 上が北 · '+(navigation.state.selected?.name??'淡い線は主な街路');
  canvas.setAttribute('aria-label',(walking.state.profile.id==='cat'?'猫':'人間')+'の現在地と向き。'+(navigation.state.selected?'行先は'+navigation.state.selected.name:'行先は未選択'));
 }
 function update(dt){const hidden=!walking.active||!navigation.state.mapOpen||!!shopSystem.current||!!inspections.opened;if(root.hidden!==hidden)root.hidden=hidden;if(hidden){elapsed=0;return;}elapsed+=dt;if(elapsed<.25)return;elapsed=0;draw();}
 const onResize=()=>{resize();if(!root.hidden)draw();};addEventListener('resize',onResize);
 function setRegion(r){regionId=r.id;Object.assign(bounds,r.mapBounds);roads=r.roads??roads;heading.textContent=r.name;heading.title='Bellmire → Nine Stones → Lake Lun → Lunmere → Isle of Caerith';root.setAttribute("aria-label",r.name+"の簡易地図");draw();}
 resize();return {setRegion,root,setOpen,update,project,draw,destroy(){removeEventListener('resize',onResize);root.remove();toggle.remove();}};
}
