import {periodSettings,periodForWeather} from './scene-settings.js';
import {shopLighting,periodIndex} from './shop-lighting.js';
import {batchWindowLights} from './window-lighting.js';

// A small event-driven clock foundation: no resident teleportation or new lights.
export function createTownLife({THREE,scene,lit,smoke,chimneySources,buildings=[]}){
 const state={weather:'clear',period:'day',marketActivity:1,openShops:{}},listeners=new Set(),entries=[],points=[];
 const litSet=new Set(lit),visible=o=>{for(let p=o;p;p=p.parent)if(!p.visible)return false;return true;};
 const sites=[['baker',-31,27],['bookseller',-18,32],['inn',-39,3],['tavern',-10,12],['starmaker',3,-3]];
 function siteAt(p){let nearest='home',best=7;for(const [name,x,z]of sites){const d=Math.hypot(p.x-x,p.z-z);if(d<best){best=d;nearest=name;}}return nearest==='home'&&p.z>32?'harbor':nearest;}
 const hash=s=>{let h=2166136261;for(const c of s)h=Math.imul(h^c.charCodeAt(0),16777619);return(h>>>0)/4294967295;};
 const homes=new Map();
 const canvas=document.createElement('canvas');canvas.width=canvas.height=32;const ctx=canvas.getContext('2d'),data=ctx.createImageData(32,32);
 for(let y=0;y<32;y++)for(let x=0;x<32;x++){const u=(x-15.5)/15.5,v=(y-15.5)/15.5,edge=Math.max(Math.abs(u),Math.abs(v)),value=Math.round(255*(.42+.58*(1-edge*edge))*(.94+.06*Math.sin(y*.13)));const i=(y*32+x)*4;data.data[i]=data.data[i+1]=data.data[i+2]=value;data.data[i+3]=255;}
 ctx.putImageData(data,0,0);const glowMap=new THREE.CanvasTexture(canvas);glowMap.colorSpace=THREE.NoColorSpace;glowMap.name='Soft amber window emission';
 scene.updateMatrixWorld(true);scene.traverse(o=>{
  if(o.isPointLight){points.push({object:o,base:o.intensity,site:siteAt(o.getWorldPosition(new THREE.Vector3()))});return;}
  if(!o.isMesh||!visible(o)||!litSet.has(o.material))return;
  const p=o.getWorldPosition(new THREE.Vector3()),g=o.geometry.parameters??{},window=o.geometry.type==='BoxGeometry'&&g.width>=.3&&g.height>=.3&&g.depth<=.16;
  const m=o.material.clone();o.material=m;lit.push(m);if(window){m.emissiveMap=glowMap;m.needsUpdate=true;}
  const seed=hash([p.x.toFixed(2),p.y.toFixed(2),p.z.toFixed(2)].join(',')),site=siteAt(p);
  let owner=null,best=.75;for(const shell of buildings){const d=shell.b.distanceToPoint(p);if(d<best){owner=shell;best=d;}}
  const c=owner?.b.getCenter(new THREE.Vector3())??p,homeKey=[c.x.toFixed(2),c.z.toFixed(2)].join(',');
  const e={object:o,material:m,color:m.color.clone(),site,window,seed,position:p,homeKey};entries.push(e);
  if(window){if(!homes.has(homeKey))homes.set(homeKey,[]);homes.get(homeKey).push(e);}

 });
 for(const [key,group]of homes){group.sort((a,b)=>a.position.y-b.position.y||a.position.x-b.position.x||a.position.z-b.position.z);const seed=hash(key);group.forEach((e,i)=>Object.assign(e,{homeIndex:i,homeCount:group.length,homeMode:Math.floor(seed*5),homeChoice:Math.floor(seed*43)%group.length,homeUpper:group.at(-1).position.y}));}
 const windowBatch=batchWindowLights({THREE,scene,entries,glowMap});
 function update(){const settings=periodSettings[state.period],off=state.weather==='blackout',pi=periodIndex[state.period];state.marketActivity=settings.marketActivity;state.openShops={...settings.shops};
  for(const material of lit)material.emissiveIntensity=0;
  for(const e of entries){const {material:m,seed,site,window}=e,role=shopLighting[site];let on=true,level=window?settings.window:settings.lantern;
   if(role){level=(window?role.windows:role.lamps)[pi];on=window?seed<role.coverage[pi]:!(site==='harbor'&&state.period==='night'&&seed<.25);m.emissive.set(role.color).lerp(new THREE.Color(0xffd7a5),seed*.12);}
   else {m.emissive.set(0xffc58a).lerp(new THREE.Color(0xffd7a5),seed*.25);
    if(window&&state.period==='night'){on=e.homeMode===1?e.homeIndex===e.homeChoice:e.homeMode===2?e.position.y>=e.homeUpper-.35:e.homeMode===3?e.homeIndex===0||e.homeIndex===e.homeChoice:false;}
    else if(window)on=seed>(state.period==='morning'?.48:state.period==='evening'?.28:.30);
   }
   m.emissiveIntensity=off||!on?0:level*(.80+seed*.24)*(state.weather==='rain'?.92:1);
   m.color.copy(e.color).multiplyScalar(window&&!on?(state.period==='night'?.24:.62):1);
  }
  windowBatch.sync();
  for(const p of points){let factor=state.period==='day'?.78:1;if(state.period==='morning'&&p.site==='baker')factor=1.08;if(state.period==='night')factor=({baker:.14,bookseller:.35,starmaker:.45,harbor:.55})[p.site]??1;p.object.intensity=off?0:p.base*factor;}
  smoke.forEach((o,i)=>{const q=chimneySources[i%chimneySources.length],site=siteAt(new THREE.Vector3(q[0],q[1],q[2]));let factor={morning:.85,day:.65,evening:.45,night:.25}[state.period];if(site==='baker')factor={morning:1.08,day:.72,evening:.18,night:.08}[state.period];o.userData.lifeSmokeFactor=factor*(state.weather==='rain'?.75:1);});
  for(const fn of listeners)fn({...state,openShops:{...state.openShops}});
 }
 function setPeriod(period){if(!periodSettings[period])throw Error('Unknown time period: '+period);state.period=period;update();}
 function setWeather(weather){state.weather=weather;state.period=periodForWeather(weather);update();}
 update();
 return {state,entries,points,glowMap,windowBatch,homes,setPeriod,setWeather,onChange(fn){listeners.add(fn);return()=>listeners.delete(fn);},get stats(){return {windows:entries.filter(e=>e.window).length,litWindows:entries.filter(e=>e.window&&e.material.emissiveIntensity>0).length,lamps:entries.filter(e=>!e.window).length,pointLights:points.length};}};
}
