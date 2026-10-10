// Read-only, URL opt-in instrumentation. Never prevents events or writes a save.
export function installCameraInputDebug({canvas,getCamera}){
 if(new URLSearchParams(location.search).get('cameraDebug')!=='1')return;
 const root=document.createElement('output');root.dataset.cameraDebug='1';root.setAttribute('aria-label','カメラ入力診断');
 Object.assign(root.style,{position:'fixed',zIndex:'250',left:'8px',right:'8px',bottom:'calc(4px + env(safe-area-inset-bottom))',pointerEvents:'none',background:'#071820ed',color:'#e8f7f1',padding:'7px',font:'11px/1.35 monospace',whiteSpace:'pre-wrap',overflowWrap:'anywhere',maxHeight:'46dvh',overflow:'hidden'});
 const text=document.createElement('span'),probe=document.createElement('span');
 Object.assign(probe.style,{position:'absolute',visibility:'hidden',padding:'env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'});root.append(text,probe);document.body.append(root);
 const events=[],counts={},starts=new Map(),latestMoves={};let latest=null,renderTimer=null;
 const point=p=>({clientX:p.clientX,clientY:p.clientY,screenX:p.screenX,screenY:p.screenY});
 const label=o=>o?.tagName?.toLowerCase()+(o?.id?'#'+o.id:'');
 const rounded=n=>Number.isFinite(n)?Number(n.toFixed(3)):n;
 function viewport(){const v=visualViewport,r=canvas.getBoundingClientRect(),s=getComputedStyle(probe);return{inner:[innerWidth,innerHeight],visual:v?{width:v.width,height:v.height,offsetLeft:v.offsetLeft,offsetTop:v.offsetTop,scale:v.scale}:null,canvas:{left:r.left,top:r.top,width:r.width,height:r.height},safeArea:[s.paddingTop,s.paddingRight,s.paddingBottom,s.paddingLeft]};}
 function current(){const camera=getCamera();return{camera,touchAction:getComputedStyle(canvas).touchAction,viewport:viewport()};}
 function hit(x,y){if(!Number.isFinite(x)||!Number.isFinite(y))return[];return document.elementsFromPoint(x,y).slice(0,5).map(o=>{const s=getComputedStyle(o),r=o.getBoundingClientRect();return{element:label(o),pointerEvents:s.pointerEvents,touchAction:s.touchAction,zIndex:s.zIndex,rect:[r.left,r.top,r.width,r.height]};});}
 function render(){renderTimer=null;const c=current(),v=c.viewport,p=c.camera.pointer,m=latestMoves.pointer??latestMoves.touch;
  text.textContent=[
   'CAMERA DIAG 1 · 未解決／実機調査中',
   '開始 '+(m?m.start.map(rounded).join(','):'—')+' → 現在 '+(m?[m.clientX,m.clientY].map(rounded).join(','):'—'),
   'deltaX '+(m?rounded(m.deltaX):'—')+' deltaY '+(m?rounded(m.deltaY):'—')+' totalX '+(m?rounded(m.totalX):'—'),
   'yaw '+rounded(c.camera.yaw)+' Δyaw '+(m?rounded(m.yawAfter-m.yawBefore):'—'),
   'camera pointer '+(p?`${p.id} @ ${rounded(p.x)},${rounded(p.y)} capture=${p.captured}`:'none')+' active='+c.camera.active+' blocked='+c.camera.blocked+' modal='+c.camera.modal,
   'touch-action '+c.touchAction+' touches '+(latest?.touches?.map(t=>t.identifier).join(',')||'none'),
   'event '+(latest?.type??'—')+' target '+(latest?.target??'—')+' prevented='+!!latest?.defaultPrevented,
   'start判定 '+(events.filter(e=>e.type==='pointerdown').at(-1)?.cameraResult??'—'),
   'hit '+(m?.hit?.map(h=>h.element+'('+h.pointerEvents+')').join(' > ')??'—'),
   'inner '+v.inner.join('×')+' visual '+(v.visual?`${rounded(v.visual.width)}×${rounded(v.visual.height)} offset ${rounded(v.visual.offsetLeft)},${rounded(v.visual.offsetTop)} scale ${v.visual.scale}`:'—'),
   'safe-area '+v.safeArea.join('/')+' canvas '+[v.canvas.left,v.canvas.top,v.canvas.width,v.canvas.height].map(rounded).join(','),
   'counts '+Object.entries(counts).map(([k,n])=>k+':'+n).join(' '),
   '直近 '+events.slice(-6).map(e=>e.type+'#'+(e.pointerId??e.touchId??'—')).join(' → ')
  ].join('\n');
 }
 function capture(e){const before=getCamera(),changed=e.changedTouches?[...e.changedTouches]:[],q=changed[0]??e,key=changed.length?'touch:'+q.identifier:'pointer:'+e.pointerId,kind=changed.length?'touch':'pointer',isStart=e.type==='pointerdown'||e.type==='touchstart';
  const old=starts.get(key),start=isStart?{x:q.clientX,y:q.clientY}:old?.start??{x:q.clientX,y:q.clientY};
  const row={type:e.type,time:performance.now(),trusted:e.isTrusted,target:label(e.target),pointerId:e.pointerId,pointerType:e.pointerType,touchId:q.identifier,...point(q),start:[start.x,start.y],deltaX:old?q.clientX-old.x:0,deltaY:old?q.clientY-old.y:0,totalX:q.clientX-start.x,totalY:q.clientY-start.y,touches:e.touches?[...e.touches].map(t=>({identifier:t.identifier,...point(t)})):[],hit:hit(q.clientX,q.clientY),yawBefore:before.yaw,cameraBefore:before,cancelable:e.cancelable,error:e.message};
  if(isStart||/^(pointermove|touchmove)$/.test(e.type))starts.set(key,{start,x:q.clientX,y:q.clientY});
  queueMicrotask(()=>{const after=getCamera();row.yawAfter=after.yaw;row.cameraAfter=after;row.defaultPrevented=e.defaultPrevented;
   if(e.type==='pointerdown')row.cameraResult=after.pointer?.id===e.pointerId?'accepted':!before.active?'inactive':before.blocked||before.modal?'blocked/modal':before.pointer?'already active pointer':!e.composedPath().includes(canvas)?'UI target':e.pointerType==='touch'&&e.clientX<innerWidth*.48?'left movement region':'button/lock/capture';
   counts[e.type]=(counts[e.type]??0)+1;events.push(row);if(events.length>256)events.shift();latest=row;
   if(/^(pointermove|touchmove)$/.test(e.type))latestMoves[kind]=row;
   if(/^(pointerup|pointercancel|touchend|touchcancel|lostpointercapture)$/.test(e.type))starts.delete(key);
   if(renderTimer===null)renderTimer=setTimeout(render,40);
  });
 }
 for(const type of ['pointerdown','pointermove','pointerup','pointercancel','gotpointercapture','lostpointercapture','touchstart','touchmove','touchend','touchcancel','blur','resize','orientationchange','error'])window.addEventListener(type,capture,{capture:true,passive:true});
 document.addEventListener('visibilitychange',capture,{capture:true,passive:true});
 visualViewport?.addEventListener('resize',capture,{passive:true});visualViewport?.addEventListener('scroll',capture,{passive:true});
 const snapshot=()=>({version:1,userAgent:navigator.userAgent,current:current(),counts:{...counts},events:[...events]});
 window.cameraInputDebug={snapshot,exportText:()=>JSON.stringify(snapshot(),null,2)};render();
}
