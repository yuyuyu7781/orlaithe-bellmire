// Own only the map surface's gestures; page zoom/scroll elsewhere remain available.
export function attachMapGestures({frame,svg,fit,dialog,viewBox,onChange=()=>{}}){
 const base=viewBox??svg.getAttribute('viewBox').split(/\s+/).map(Number),[,,width,height]=base,pointers=new Map();
 const state={zoom:1,x:0,y:0};let gesture=null,moved=false,tapTarget=null,suppressUntil=0;
 const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
 function apply(){state.zoom=clamp(state.zoom,1,3);state.x=clamp(state.x,0,width-width/state.zoom);state.y=clamp(state.y,0,height-height/state.zoom);svg.setAttribute('viewBox',`${state.x} ${state.y} ${width/state.zoom} ${height/state.zoom}`);frame.dataset.zoom=state.zoom.toFixed(2);onChange(state);}
 function local(p){const r=svg.getBoundingClientRect();return{x:(p.x-r.left)/r.width,y:(p.y-r.top)/r.height};}
 function rebase(){const ps=[...pointers.values()];if(!ps.length){gesture=null;return;}const center=ps.length>1?{x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2}:ps[0],q=local(center);gesture={zoom:state.zoom,x:state.x,y:state.y,center,distance:ps.length>1?Math.max(1,Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y)):0,anchor:{x:state.x+q.x*width/state.zoom,y:state.y+q.y*height/state.zoom}};}
 function cancel(){const ids=[...pointers.keys()];pointers.clear();gesture=null;tapTarget=null;moved=false;for(const id of ids)if(frame.hasPointerCapture(id))frame.releasePointerCapture(id);}
 function reset(){cancel();dialog.scrollTop=0;state.zoom=1;state.x=state.y=0;apply();}
 frame.addEventListener('pointerdown',e=>{if(e.button!==0||pointers.size>=2)return;e.preventDefault();if(!pointers.size){moved=false;tapTarget=e.target.closest('[data-region],[data-ward]');}else{moved=true;tapTarget=null;}pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});frame.setPointerCapture(e.pointerId);rebase();});
 frame.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId)||!gesture)return;e.preventDefault();pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});const ps=[...pointers.values()],center=ps.length>1?{x:(ps[0].x+ps[1].x)/2,y:(ps[0].y+ps[1].y)/2}:ps[0];if(Math.hypot(center.x-gesture.center.x,center.y-gesture.center.y)>5)moved=true;
  if(ps.length>1){moved=true;const distance=Math.hypot(ps[0].x-ps[1].x,ps[0].y-ps[1].y);state.zoom=clamp(gesture.zoom*distance/gesture.distance,1,3);const q=local(center);state.x=gesture.anchor.x-q.x*width/state.zoom;state.y=gesture.anchor.y-q.y*height/state.zoom;}
  else{const r=svg.getBoundingClientRect();state.x=gesture.x-(center.x-gesture.center.x)*width/gesture.zoom/r.width;state.y=gesture.y-(center.y-gesture.center.y)*height/gesture.zoom/r.height;}apply();
 });
 function release(e){if(!pointers.has(e.pointerId))return;const tap=e.type==='pointerup'&&!moved&&pointers.size===1?tapTarget:null;pointers.delete(e.pointerId);if(frame.hasPointerCapture(e.pointerId))frame.releasePointerCapture(e.pointerId);suppressUntil=performance.now()+500;tapTarget=null;if(e.type==='pointercancel'){cancel();return;}rebase();if(tap)tap.dispatchEvent(new MouseEvent('click',{bubbles:true,detail:0}));}
 for(const name of ['pointerup','pointercancel','lostpointercapture'])frame.addEventListener(name,release);
 frame.addEventListener('click',e=>{if(e.detail&&performance.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
 function zoomAt(next,q={x:.5,y:.5}){const ax=state.x+q.x*width/state.zoom,ay=state.y+q.y*height/state.zoom;state.zoom=clamp(next,1,3);state.x=ax-q.x*width/state.zoom;state.y=ay-q.y*height/state.zoom;apply();}
 frame.addEventListener('wheel',e=>{e.preventDefault();cancel();zoomAt(state.zoom*Math.exp(-e.deltaY*.002),local({x:e.clientX,y:e.clientY}));},{passive:false});
 frame.tabIndex=0;frame.addEventListener('keydown',e=>{if(['+','=','-','0','Home'].includes(e.key)){e.preventDefault();if(['0','Home'].includes(e.key))reset();else zoomAt(state.zoom+(e.key==='-'?-.25:.25));}});
 frame.addEventListener('contextmenu',e=>e.preventDefault());frame.addEventListener('dragstart',e=>e.preventDefault());
 fit.onclick=reset;dialog.addEventListener('close',reset);dialog.addEventListener('cancel',cancel);addEventListener('blur',cancel);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancel();});addEventListener('resize',reset);addEventListener('orientationchange',reset);
 apply();return{reset,cancel,state,get pointers(){return pointers.size;}};
}
