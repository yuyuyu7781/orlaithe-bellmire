import {portraitProfile,portraitFraming} from './portrait-profiles.js';
import {periodForWeather} from './scene-settings.js';

export function portraitPeriod(time){return ['morning','day','evening','night'].includes(time)?time:periodForWeather(time);}
const motifPaths={loaf:'M12 18 Q12 7 24 7 Q36 7 36 18 Z M20 9 L18 14 M27 9 L25 14',book:'M9 8 Q17 5 24 10 Q31 5 39 8 L39 28 Q31 25 24 30 Q17 25 9 28 Z M24 10 L24 30',rope:'M12 18 C12 4 36 4 36 18 C36 32 12 32 12 18 M18 18 C18 11 30 11 30 18 C30 25 18 25 18 18',circle:'M10 18 A14 14 0 1 0 38 18 A14 14 0 1 0 10 18 M24 1 L24 35 M7 18 L41 18',strings:'M15 10 Q8 24 18 31 Q34 38 35 23 L29 15 L30 3 L25 3 L23 15 Z M26 8 L20 29 M28 8 L24 30'};
const svgNS='http://www.w3.org/2000/svg';
function silhouette(profile){
 const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 140 180');svg.setAttribute('aria-hidden','true');
 const shape=(tag,attrs)=>{const e=document.createElementNS(svgNS,tag);for(const [k,v]of Object.entries(attrs))e.setAttribute(k,v);svg.append(e);return e;};
 shape('ellipse',{cx:70,cy:96,rx:51,ry:67,fill:'var(--portrait-wash)',opacity:.28});
 if(profile.subjectKind==='cat'){
  shape('path',{d:'M37 85 L40 49 L61 65 Q70 62 79 65 L100 49 L103 85 Q108 119 70 125 Q32 119 37 85 Z',fill:'var(--portrait-cloth)',opacity:.70});
  shape('path',{d:'M36 174 Q32 126 70 123 Q108 126 104 174 Z',fill:'var(--portrait-cloth)',opacity:.60});
  shape('path',{d:'M49 110 L32 105 M49 116 L28 117 M91 110 L108 105 M91 116 L112 117',stroke:'var(--portrait-ink)','stroke-width':1,opacity:.4});
 }else {
 shape('path',{d:'M19 173 Q20 124 48 117 L59 110 L81 110 L92 117 Q122 124 123 173 Z',fill:'var(--portrait-cloth)',opacity:.73});
 shape('path',{d:'M59 99 L81 99 L83 120 Q70 132 57 120 Z',fill:'#c1aa8b',opacity:.7});
 shape('ellipse',{cx:70,cy:77,rx:25,ry:33,fill:'#cdb69b',opacity:.78});
 shape('path',{d:'M44 79 Q39 36 70 35 Q103 36 96 80 L90 60 Q73 62 57 51 L48 81 Z',fill:'var(--portrait-hair)',opacity:.75});
 shape('path',{d:'M60 117 L68 148 L48 134 M80 117 L72 148 L94 134',fill:'none',stroke:'var(--portrait-paper)','stroke-width':2,opacity:.45});
 // A role mark rather than an invented finished face; final illustrations replace it.
 shape('path',{d:motifPaths[profile.motif]??motifPaths.circle,fill:'none',stroke:'var(--portrait-ink)','stroke-width':1.3,opacity:.60,transform:'translate(46 139) scale(.8)'});
 }
 return svg;
}
export function createPortraitView(character,{image,time='day',expression='default'}={}){
 const profile=portraitProfile(character),root=document.createElement('div');root.className='dialogue-visual';
 root.dataset.period=portraitPeriod(time);root.dataset.subject=profile.subjectKind;root.dataset.expression=expression;
 for(const [key,color]of Object.entries(profile.palette??{}))root.style.setProperty('--portrait-'+key,color);
 const frame=document.createElement('div');frame.className='dialogue-portrait';frame.dataset.state='fallback';
 const fallback=document.createElement('div');fallback.className='portrait-placeholder';fallback.append(silhouette(profile));
 const caption=document.createElement('small');caption.className='portrait-caption';caption.textContent='肖像の下描き';fallback.append(caption);frame.append(fallback);
 frame.setAttribute('role','img');frame.setAttribute('aria-label',profile.displayName+'の仮の肖像・'+(profile.mood??profile.role));
 if(image?.src){const img=document.createElement('img');img.alt=image.alt??profile.displayName+'の肖像';img.decoding='async';img.style.objectFit='cover';const focus=portraitFraming(profile,image,expression);for(const [device,values]of Object.entries(focus)){img.style.setProperty('--focus-'+device,values.objectPositionX+'% '+values.objectPositionY+'%');img.style.setProperty('--zoom-'+device,values.zoom);}
  img.onload=()=>{if(!img.naturalWidth)return;frame.dataset.state='image';fallback.hidden=true;frame.removeAttribute('role');frame.removeAttribute('aria-label');};
  img.onerror=()=>{img.remove();fallback.hidden=false;frame.dataset.state='fallback';};frame.append(img);img.src=image.src;
 }
 const details=document.createElement('div');details.className='dialogue-details';const role=document.createElement('span');role.className='dialogue-role';role.textContent=profile.role;
 const intro=document.createElement('div');intro.className='dialogue-intro';intro.textContent=profile.intro??'';details.append(role,intro);root.append(frame,details);
 return {element:root,profile};
}
