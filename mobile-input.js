import {gameModalOpen} from './game-input-state.js?v=52.9';
export function createMobileInput({walking,boatTravel,canvas}){
 const area=document.createElement('div');area.id='mobileJoystick';area.className='mobile-joystick';area.setAttribute('aria-label','移動用ジョイスティック');
 const base=document.createElement('div');base.className='joystick-base';const knob=document.createElement('div');knob.className='joystick-knob';base.append(knob);area.append(base);document.body.append(area);
 const state={pointer:null,x:0,y:0,mode:'inactive'};let origin=null,modal=null;
 const coarse=matchMedia('(pointer:coarse)');
 const allowed=()=>!document.hidden&&!gameModalOpen()&&(boatTravel.active||walking.active&&!walking.state.inputBlocked);
 function send(x=0,y=0){state.x=x;state.y=y;if(boatTravel.active){walking.setAnalog(0,0);boatTravel.setAnalog(x,y);}else{boatTravel.setAnalog(0,0);walking.setAnalog(x,y);}}
 function reset(){const id=state.pointer;state.pointer=null;origin=null;send();base.hidden=true;if(id!==null&&area.hasPointerCapture(id))area.releasePointerCapture(id);}
 area.addEventListener('pointerdown',e=>{if(!coarse.matches||!allowed()||state.pointer!==null||e.button!==0)return;e.preventDefault();e.stopPropagation();const r=area.getBoundingClientRect();origin={x:e.clientX,y:e.clientY};state.pointer=e.pointerId;area.setPointerCapture(e.pointerId);base.hidden=false;base.style.left=Math.max(50,Math.min(r.width-50,e.clientX-r.left))+'px';base.style.top=Math.max(50,Math.min(r.height-50,e.clientY-r.top))+'px';knob.style.transform='translate(-50%, -50%)';send();});
 area.addEventListener('pointermove',e=>{if(e.pointerId!==state.pointer)return;e.preventDefault();e.stopPropagation();if(!allowed()){reset();return;}const dx=e.clientX-origin.x,dy=e.clientY-origin.y,len=Math.hypot(dx,dy),limit=36,travel=Math.min(limit,len),amount=Math.max(0,(Math.min(1,len/limit)-.12)/.88);const x=len?dx/len:0,y=len?-dy/len:0;knob.style.transform=`translate(calc(-50% + ${x*travel}px), calc(-50% - ${y*travel}px))`;send(x*amount,y*amount);});
 for(const event of ['pointerup','pointercancel','lostpointercapture'])area.addEventListener(event,e=>{if(e.pointerId===state.pointer)reset();});
 for(const target of [area,canvas]){target.addEventListener('contextmenu',e=>e.preventDefault());target.addEventListener('dragstart',e=>e.preventDefault());}
 document.addEventListener('game-input-reset',reset);addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset();});addEventListener('resize',reset);addEventListener('orientationchange',reset);
 function update(){const next=gameModalOpen();if(next!==modal){modal=next;document.body.classList.toggle('game-modal-open',next);walking.setInputBlocked('mobile-modal',next);if(next){boatTravel.clearInput();reset();}}
  const mode=boatTravel.active?'boat':walking.active?walking.state.profile.id:'inactive';if(mode!==state.mode){reset();state.mode=mode;}const visible=coarse.matches&&allowed();if(area.hidden===visible)area.hidden=!visible;if(!visible&&state.pointer!==null)reset();
 }
 const observer=new MutationObserver(update);observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','hidden']});coarse.addEventListener('change',update);base.hidden=true;update();
 // Opt-in on real phones: ?mobileDebug=1. No normal-game overlay or stored state.
 let debug=null,last='';if(new URLSearchParams(location.search).has('mobileDebug')){debug=document.createElement('output');debug.className='mobile-input-debug';document.body.append(debug);}
 function tick(){update();if(debug){const map=document.querySelector('dialog[open] .map-frame'),text=`${state.mode}${allowed()?'':' paused'} · joystick ${state.pointer===null?0:1} (${state.x.toFixed(2)},${state.y.toFixed(2)}) · zoom ${map?.dataset.zoom??'—'}`;if(text!==last){debug.textContent=text;last=text;}}}
 return{state,area,reset,update:tick};
}
