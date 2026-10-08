import {worldSnapshot} from './world-graph.js';
const ns='http://www.w3.org/2000/svg';
export function createWorldMap({stay,regions,walking,inspections,quietStay,journal,navigation,boatTravel}){
 const button=document.createElement('button');button.id='worldMapButton';button.textContent='世界の地図';navigation.tools.append(button);
 const dialog=document.createElement('dialog');dialog.className='world-map';dialog.setAttribute('aria-labelledby','worldMapTitle');
 const title=document.createElement('h2');title.id='worldMapTitle';title.textContent='Orlaithe — 旅人の地図';
 const close=document.createElement('button');close.textContent='閉じる';close.className='world-map-close';const hint=document.createElement('p');hint.className='map-hint';hint.textContent='道と岸を覚えるための略図。白いところにも、旅は続いている。';
 const svg=document.createElementNS(ns,'svg');svg.setAttribute('viewBox','0 0 720 460');svg.setAttribute('role','group');svg.setAttribute('aria-label','発見した地域と陸路・舟路');
 const mapFrame=document.createElement('div');mapFrame.className='map-frame';mapFrame.append(svg);const info=document.createElement('section');info.className='world-map-info';info.setAttribute('aria-live','polite');dialog.append(title,close,hint,mapFrame,info);document.body.append(dialog);let selected=null;
 const el=(tag,attrs,parent=svg)=>{const o=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(attrs))o.setAttribute(k,String(v));parent.append(o);return o;};
 function details(id){const snap=worldSnapshot(stay.data,regions.regions,regions.current.id),n=snap.nodes.find(n=>n.id===id&&!n.hidden);info.replaceChildren();if(!n)return;selected=id;const h=document.createElement('h3');h.textContent=n.nameVisible?n.displayName:'道の奥の印';const p=document.createElement('p');p.textContent=n.current?'今いる土地。':n.availability!=='open'?'今は水の下。岸が変わる日を待つ。':n.visited?'一度歩いた土地。':n.rumored?'湖岸で聞いた、小さな噂。':'石段の奥へ、空気が通っている。';info.append(h,p);
  if(n.revisitable){const b=document.createElement('button');b.textContent=n.parentRegion?'湖岸へ再訪':'再訪';b.disabled=boatTravel.active;b.onclick=()=>{dialog.close();regions.revisit(n.parentRegion??id);};info.append(b);}
  if(n.nameVisible){const b=document.createElement('button');b.textContent='この土地の記録';b.onclick=()=>{dialog.close();journal.openRegion(id);};info.append(b);}
  const r=regions.regions.find(r=>r.id===(n.parentRegion??id));if(n.visited&&r){const spots=document.createElement('p');spots.textContent='主な場所：'+r.cameraPresets.slice(0,4).map(c=>c.name).join('・');info.append(spots);}
 }
 function render(){svg.replaceChildren();
  el('path',{d:'M300 280 Q330 190 442 175 Q555 190 556 300 Q537 385 424 370 Q320 370 300 280 Z',class:'map-lake'});
  el('path',{d:'M64 310 q35 -38 64 -10 m-28 -35 q38 -40 75 -12 M190 270 q28 -22 58 -5 M565 74 q30 -27 53 -5 m-13 30 q40 -26 70 -7',class:'map-terrain'});
  el('path',{d:'M599 164 q15 10 0 20 m17 -10 q15 10 0 20 m16 -10 q15 10 0 20 M605 260 q35 20 62 54',class:'map-terrain'});
  const snap=worldSnapshot(stay.data,regions.regions,regions.current.id),byId=new Map(snap.nodes.map(n=>[n.id,n]));
  for(const e of snap.connections){const a=byId.get(e.from).mapPosition,b=byId.get(e.to).mapPosition;el('path',{d:`M${a[0]} ${a[1]} Q${(a[0]+b[0])/2+6} ${(a[1]+b[1])/2-8} ${b[0]} ${b[1]}`,class:'map-route '+e.type+(e.available?'':' unavailable'),'data-edge':e.id});}
  for(const n of snap.nodes){if(n.hidden)continue;const[x,y]=n.mapPosition,g=el('g',{class:'map-place'+(n.availability==='open'?'':' unavailable'),'data-region':n.id,tabindex:0,role:'button','aria-label':n.nameVisible?n.displayName:'薄い道の印'});el('circle',{cx:x,cy:y,r:21,class:'map-hit'},g);el('circle',{cx:x,cy:y,r:n.type==='town'?6:4,fill:'none'},g);if(n.type==='ring'||n.type==='stones')el('path',{d:`M${x-9} ${y} a9 8 0 1 1 5 7`,fill:'none'},g);if(n.current)el('circle',{cx:x,cy:y,r:2.1,class:'map-current'},g);const t=el('text',{x:x+12,y:y+4},g);t.textContent=n.nameVisible?n.displayName:'· · ·';g.onclick=()=>details(n.id);g.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();details(n.id);}};}
  const legend=el('text',{x:34,y:435,class:'map-legend'});legend.textContent='— 陸路　 · · 舟路　 ┄ 水が引く日の道';details(selected??regions.current.id);
 }
 function openRegion(id){selected=id??regions.current.id;quietStay.end();boatTravel.keys.clear();inspections.dismiss();document.exitPointerLock?.();walking.setInputBlocked('world-map',true);render();if(!dialog.open)dialog.showModal();close.focus();}
 close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>walking.setInputBlocked('world-map',false));button.onclick=()=>openRegion();stay.onChange(()=>{if(dialog.open)render();});
 return {dialog,button,render,openRegion,get active(){return dialog.open}};
}
