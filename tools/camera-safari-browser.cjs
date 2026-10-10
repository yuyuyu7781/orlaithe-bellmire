const {boot}=require('./capital-browser.cjs'),assert=require('assert');
(async()=>{
 const engine=process.env.CAMERA_ENGINE||'chromium';
 const b=await boot({engine,touch:true,viewport:{width:390,height:844},url:'http://127.0.0.1:8001/index.html?cameraDebug=1'}),p=b.page;
 try{
  assert.equal(b.errors.length,0,b.errors.join('\n'));
  assert.equal(await p.locator('[data-camera-debug]').count(),1,'opt-in camera event display missing');
  await p.evaluate(()=>{requestAnimationFrame=()=>0;app.walking.enter('human');app.mobileInput.update();});
  const before=await p.evaluate(()=>localStorage.getItem('bellmire.stay.v1'));assert.notEqual(before,null,'save fixture absent');
  // Actual iPhone report: free canvas start x=173.667 was rejected by the 48% gate.
  assert.equal(await p.evaluate(()=>document.elementFromPoint(173.667,380).tagName),'CANVAS');
  const reportSince=await p.evaluate(()=>performance.now());
  await p.touchscreen.tap(173.667,380);
  await p.waitForFunction(since=>cameraInputDebug.snapshot().events.some(e=>e.time>=since&&e.type==='pointerup'),reportSince);
  const reportedStart=await p.evaluate(since=>cameraInputDebug.snapshot().events.findLast(e=>e.time>=since&&e.type==='pointerdown'),reportSince);
  assert.equal(reportedStart.cameraResult,'accepted','iPhone central free-canvas start must accept camera input');
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await p.setViewportSize(viewport);await p.waitForFunction(()=>Math.abs(document.querySelector('#app canvas').getBoundingClientRect().width-innerWidth)<1);
   for(const start of [.30,.44,.64,.84])for(const dx of [-35,35]){
    // Pick free canvas, not a real UI overlapped at this orientation/position.
    const q=await p.evaluate(({x,dx})=>{const canvas=document.querySelector('#app canvas');for(const ratio of [.45,.35,.50,.60,.70]){const y=innerHeight*ratio;if(document.elementFromPoint(x,y)===canvas&&document.elementFromPoint(x+dx,y)===canvas)return{x,y};}return null;},{x:viewport.width*start,dx});
    assert(q,JSON.stringify({viewport,start,dx}));
    await p.touchscreen.tap(q.x,q.y);
    assert.equal(await p.evaluate(()=>cameraInputDebug.snapshot().events.findLast(e=>e.type==='pointerdown').cameraResult),'accepted');
    const since=await p.evaluate(()=>performance.now());const up=await p.evaluate(()=>cameraInputDebug.snapshot().counts.pointerup??0);const yaw=await p.evaluate(()=>app.walking.state.yaw);
    await p.mouse.move(q.x,q.y);await p.mouse.down();await p.mouse.move(q.x+dx,q.y,{steps:4});await p.mouse.up();await p.waitForFunction(up=>(cameraInputDebug.snapshot().counts.pointerup??0)>up,up);
    const r=await p.evaluate(()=>cameraInputDebug.snapshot());
    assert(r.events.some(e=>e.time>=since&&e.type==='pointermove'&&Math.sign(e.deltaX)===Math.sign(dx)&&Math.abs(e.yawAfter-e.yawBefore)>0),JSON.stringify({dx,yaw,events:r.events.slice(-18)}));
    assert(Math.abs(await p.evaluate(()=>app.walking.state.yaw)-yaw+dx*.003)<.002);
    const down=r.events.findLast(e=>e.time>=since&&e.type==='pointerdown');assert.equal(down.cameraResult,'accepted');assert.equal(down.afterPhase,'window bubble');assert.equal(r.current.camera.pointer,null);assert.equal(r.current.touchAction,'none');
    assert(r.current.viewport.visual&&r.current.viewport.canvas.width===viewport.width);
   }
  }
  await p.setViewportSize({width:390,height:844});await p.waitForFunction(()=>document.querySelector('#app canvas').getBoundingClientRect().width<400);
  await p.touchscreen.tap(273,380);await p.waitForFunction(()=>cameraInputDebug.snapshot().counts.touchend>0);
  let r=await p.evaluate(()=>cameraInputDebug.snapshot());assert(r.counts.touchstart>0&&r.counts.touchend>0);assert.equal(r.current.camera.pointer,null);
  if(engine==='chromium'){
   const c=await p.context().newCDPSession(p);
   for(const [start,end] of [[173.667,385.667],[301.667,35],[301.667,89.667]]){
    const q={id:8,x:start,y:380,radiusX:3,radiusY:3,force:1},yaw=await p.evaluate(()=>app.walking.state.yaw);
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[q]});
    for(let i=1;i<=8;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...q,x:start+(end-start)*i/8}]});
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert(Math.abs(await p.evaluate(()=>app.walking.state.yaw)-yaw+(end-start)*.003)<.002,JSON.stringify({start,end,yaw}));
    assert.equal(await p.evaluate(()=>app.mobileInput.state.pointer),null);
   }
   console.log('PASS iPhone reported touch starts 173.667 / 301.667 and equal 212px drags in both directions');
   const box=await p.locator('#mobileJoystick').boundingBox();assert(box);
   const stick={id:10,x:box.x+box.width/2,y:box.y+box.height/2,radiusX:3,radiusY:3,force:1};
   const yaw=await p.evaluate(()=>app.walking.state.yaw);
   await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[stick]});
   const held={...stick,y:stick.y-30};
   await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[held]});
   assert.equal(await p.evaluate(()=>app.walking.state.yaw),yaw,'joystick must not rotate camera');
   assert(await p.evaluate(()=>app.walking.input.analog.y>.5));
   const cam={id:11,x:173.667,y:380,radiusX:3,radiusY:3,force:1};
   await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[held,cam]});
   await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[held,{...cam,x:385.667}]});
   assert(Math.abs(await p.evaluate(()=>app.walking.state.yaw)-yaw+212*.003)<.002);
   assert(await p.evaluate(()=>app.mobileInput.state.pointer!==null&&app.walking.input.analog.y>.5));
   await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[held]});
   assert(await p.evaluate(()=>app.mobileInput.state.pointer!==null));
   await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await p.evaluate(()=>app.walking.input.analog.y),0);
   // DOM controls retain their own gestures; modal canvas starts stay blocked.
   const uiYaw=await p.evaluate(()=>app.walking.state.yaw);
   await p.locator('#toggle').tap();assert.equal(await p.evaluate(()=>app.walking.state.yaw),uiYaw);
   await p.locator('#toggle').tap();
   for(const modal of ['world','city','conversation']){
    await p.evaluate(m=>{if(m==='world')app.worldMap.openRegion();if(m==='city')app.cityMap.open();if(m==='conversation')app.inspections.present(app.dialogue.entries[0],{text:'カメラ入力停止の確認。',kind:'talk'});app.mobileInput.update();},modal);
    const beforeYaw=await p.evaluate(()=>app.walking.state.yaw);
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[cam]});
    await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...cam,x:385.667}]});
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    assert.equal(await p.evaluate(()=>app.walking.state.yaw),beforeYaw);
    assert.equal(await p.evaluate(()=>cameraInputDebug.snapshot().current.camera.pointer),null);
    await p.evaluate(m=>{if(m==='world')app.worldMap.dialog.close();if(m==='city')app.cityMap.dialog.close();if(m==='conversation')app.inspections.dismiss();app.mobileInput.update();},modal);
   }
   console.log('PASS actual joystick ownership, simultaneous central camera, UI target and modal camera exclusion');
   for(const dx of [-45,45]){
    const q={id:9,x:273,y:380,radiusX:3,radiusY:3,force:1},yaw=await p.evaluate(()=>app.walking.state.yaw);
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[q]});
    await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...q,x:q.x+dx}]});
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForFunction(()=>cameraInputDebug.snapshot().events.some(e=>e.type==='touchmove'));
    r=await p.evaluate(()=>cameraInputDebug.snapshot());assert(r.events.some(e=>e.type==='touchmove'&&Math.sign(e.deltaX)===Math.sign(dx)));
    assert(Math.abs(await p.evaluate(()=>app.walking.state.yaw)-yaw+dx*.003)<.002);
   }
   await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:9,x:273,y:380}]});await c.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});await p.waitForFunction(()=>cameraInputDebug.snapshot().counts.pointercancel>0&&cameraInputDebug.snapshot().counts.touchcancel>0);
   r=await p.evaluate(()=>cameraInputDebug.snapshot());assert(r.counts.pointercancel>0&&r.counts.touchcancel>0);assert.equal(r.current.camera.pointer,null);
  }
  assert.equal(await p.evaluate(()=>localStorage.getItem('bellmire.stay.v1')),before,'diagnostic writes save');
  assert.equal(await p.evaluate(()=>getComputedStyle(document.querySelector('[data-camera-debug]')).pointerEvents),'none');
  const text=await p.evaluate(()=>cameraInputDebug.exportText());assert(text.includes('yawAfter')&&text.includes('clientX'));
  await p.goto('http://127.0.0.1:8001/index.html');await p.waitForSelector('#loading.hide',{state:'attached'});
  assert.equal(await p.locator('[data-camera-debug]').count(),0);assert.equal(await p.evaluate(()=>typeof cameraInputDebug),'undefined');
  assert.equal(b.errors.length,0,b.errors.join('\n'));
  console.log('PASS',engine,'opt-in diagnostic, pointer drag both signs/start positions/orientations, native touch start/end, hit testing, save isolation, disabled default');
  if(engine==='webkit')console.log('SCOPE WebKit desktop engine: touch tap and mouse drag; not iPhone Safari OS edge gesture reproduction');
 }finally{await b.browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
