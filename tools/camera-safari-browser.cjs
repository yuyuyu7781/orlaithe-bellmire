const {boot}=require('./capital-browser.cjs'),assert=require('assert');
(async()=>{
 const engine=process.env.CAMERA_ENGINE||'chromium';
 const b=await boot({engine,touch:true,viewport:{width:390,height:844},url:'http://127.0.0.1:8001/index.html?cameraDebug=1'}),p=b.page;
 try{
  assert.equal(b.errors.length,0,b.errors.join('\n'));
  assert.equal(await p.locator('[data-camera-debug]').count(),1,'opt-in camera event display missing');
  await p.evaluate(()=>{requestAnimationFrame=()=>0;app.walking.enter('human');app.mobileInput.update();});
  const before=await p.evaluate(()=>localStorage.getItem('bellmire.stay.v1'));
  for(const viewport of [{width:390,height:844},{width:844,height:390}]){
   await p.setViewportSize(viewport);await p.waitForFunction(()=>Math.abs(document.querySelector('#app canvas').getBoundingClientRect().width-innerWidth)<1);
   for(const start of [.64,.84])for(const dx of [-35,35]){
    const q={x:viewport.width*start,y:viewport.height*.45};
    assert.equal(await p.evaluate(q=>document.elementFromPoint(q.x,q.y).tagName,q),'CANVAS');
    const yaw=await p.evaluate(()=>app.walking.state.yaw);
    await p.mouse.move(q.x,q.y);await p.mouse.down();await p.mouse.move(q.x+dx,q.y,{steps:4});await p.mouse.up();
    const r=await p.evaluate(()=>cameraInputDebug.snapshot());
    assert(r.events.some(e=>e.type==='pointermove'&&Math.sign(e.deltaX)===Math.sign(dx)&&Math.abs(e.yawAfter-e.yawBefore)>0));
    assert(Math.abs(await p.evaluate(()=>app.walking.state.yaw)-yaw+dx*.003)<.002);
    assert.equal(r.current.camera.pointer,null);assert.equal(r.current.touchAction,'none');
    assert(r.current.viewport.visual&&r.current.viewport.canvas.width===viewport.width);
   }
  }
  await p.setViewportSize({width:390,height:844});await p.waitForFunction(()=>document.querySelector('#app canvas').getBoundingClientRect().width<400);
  await p.touchscreen.tap(273,380);
  let r=await p.evaluate(()=>cameraInputDebug.snapshot());assert(r.counts.touchstart>0&&r.counts.touchend>0);assert.equal(r.current.camera.pointer,null);
  if(engine==='chromium'){
   const c=await p.context().newCDPSession(p);
   for(const dx of [-45,45]){
    const q={id:9,x:273,y:380,radiusX:3,radiusY:3,force:1},yaw=await p.evaluate(()=>app.walking.state.yaw);
    await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[q]});
    await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{...q,x:q.x+dx}]});
    await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    r=await p.evaluate(()=>cameraInputDebug.snapshot());assert(r.events.some(e=>e.type==='touchmove'&&Math.sign(e.deltaX)===Math.sign(dx)));
    assert(Math.abs(await p.evaluate(()=>app.walking.state.yaw)-yaw+dx*.003)<.002);
   }
   await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:9,x:273,y:380}]});await c.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
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
