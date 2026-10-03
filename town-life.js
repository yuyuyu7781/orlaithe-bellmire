import {periodSettings,periodForWeather} from './scene-settings.js';

// A small event-driven clock foundation: no resident teleportation or new lights.
export function createTownLife({THREE,scene,lit,smoke,chimneySources}){
 const state={weather:'clear',period:'day',marketActivity:1,openShops:{}},listeners=new Set(),entries=[],points=[];
 const litSet=new Set(lit),visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
 const sites=[['baker',-31,27],['bookseller',-18,32],['inn',-39,3],['tavern',-10,12],['starmaker',3,-3]];
 function siteAt(p){let nearest='home',best=7;for(const [name,x,z]of sites){const d=Math.hypot(p.x-x,p.z-z);if(d<best){best=d;nearest=name;}}return nearest;}
 const canvas=document.createElement('canvas');canvas.width=canvas.height=32;const ctx=canvas.getContext('2d'),data=ctx.createImageData(32,32);
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){const u=(x-15.5)/15.5,v=(y-15.5)/15.5,edge=Math.max(Math.abs(u),Math.abs(v)),value=Math.round(255*(.42+.58*(1-edge*edge))*(.94+.06*Math.sin(y*.13)));const i=(y*32+x)*4;data.data[i]=data.data[i+1]=data.data[i+2]=value;data.data[i+3]=255;}
 ctx.putImageData(data,0,0);const glowMap=new THREE.CanvasTexture(canvas);glowMap.colorSpace=THREE.NoColorSpace;glowMap.name='Soft amber window emission';
 scene.updateMatrixWorld(true);scene.traverse(o=>{
  if(o.isPointLight){points.push({object:o,base:o.intensity,site:siteAt(o.getWorldPosition(new THREE.Vector3()))});return;}
  if(!o.isMesh||!visible(o)||!litSet.has(o.material))return;
  const p=o.getWorldPosition(new THREE.Vector3()),g=o.geometry.parameters??{},window=o.geometry.type==='BoxGeometry'&&g.width>=.3&&g.height>=.3&&g.depth<=.16;
  const m=o.material.clone();o.material=m;lit.push(m);if(window){m.emissiveMap=glowMap;m.needsUpdate=true;}
  const seed=(Math.sin(Math.floor(p.x/4)*17.1+Math.floor(p.z/4)*9.7+Math.floor(p.y/3)*3.1)+1)/2;
  entries.push({object:o,material:m,color:m.color.clone(),site:siteAt(p),window,seed});
 });
 function update(){const settings=periodSettings[state.period],off=state.weather==='blackout';state.marketActivity=settings.marketActivity;state.openShops={...settings.shops};
  for(const material of lit)material.emissiveIntensity=0;
  for(const e of entries){const {material:m,seed,site,window}=e;let on=true,level=window?settings.window:settings.lantern;
   if(window&&state.period==='day'&&site==='home')on=seed>.30;
   if(window&&state.period==='morning'&&site==='home')on=seed>.48;
   if(window&&state.period==='night')on=site==='tavern'||site==='inn'||seed>.52;
   if(window&&state.period==='night'&&['baker','bookseller','starmaker'].includes(site))on=seed>.83;
   if(window&&state.period==='morning'&&site==='baker')level=.72;
   if(!window&&state.period==='night'&&['tavern','inn'].includes(site))level=.90;
   const damp=state.weather==='rain'?.92:1;
   m.emissiveIntensity=off||!on?0:level*(.80+seed*.24)*damp;
   m.color.copy(e.color).multiplyScalar(window&&!on?(state.period==='night'?.24:.62):1);
  }
  for(const p of points){let factor=state.period==='day'?.78:1;if(state.period==='morning'&&p.site==='baker')factor=1.08;if(state.period==='night'&&['baker','bookseller','starmaker'].includes(p.site))factor=.14;p.object.intensity=off?0:p.base*factor;}
  smoke.forEach((o,i)=>{const q=chimneySources[i%chimneySources.length],site=siteAt(new THREE.Vector3(q[0],q[1],q[2]));let factor={morning:.85,day:.65,evening:.45,night:.25}[state.period];if(site==='baker')factor={morning:1.08,day:.72,evening:.18,night:.08}[state.period];o.userData.lifeSmokeFactor=factor*(state.weather==='rain'?.75:1);});
  for(const fn of listeners)fn({...state,openShops:{...state.openShops}});
 }
 function setPeriod(period){if(!periodSettings[period])throw Error('Unknown time period: '+period);state.period=period;update();}
 function setWeather(weather){state.weather=weather;state.period=periodForWeather(weather);update();}
 update();
 return {state,entries,points,glowMap,setPeriod,setWeather,onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);},get stats(){return {windows:entries.filter(e=>e.window).length,litWindows:entries.filter(e=>e.window&&e.material.emissiveIntensity>0).length,lamps:entries.filter(e=>!e.window).length,pointLights:points.length};}};
}
