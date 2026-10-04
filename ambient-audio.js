import {soundAnchors} from './shop-data.js';
// Inert without sources/user activation. A single mixer, no per-zone contexts.
export function createAmbientAudio({camera,walking,shopSystem,townLife}){
 const zones=[...soundAnchors,{id:'market',area:'town',kind:'market',position:[19,3.5,16],src:null}],gains=new Map(),sources=new Map(),triggers=[],listeners=new Set();let context=null,enabled=false,elapsed=0,period=townLife.state.period;
 for(const z of zones)gains.set(z.id,0);
 townLife.onChange(state=>{if(state.period===period)return;period=state.period;const id={morning:'morningBell',evening:'eveningBell',night:'nightBell'}[period];if(id){const trigger={id,period};triggers.push(trigger);if(triggers.length>24)triggers.shift();for(const fn of listeners)fn(trigger);}});
 function update(dt){elapsed+=dt;if(elapsed<.25)return;elapsed=0;const area=shopSystem.current?.shop.id??'town',p=camera.position;
  for(const z of zones){if(!z.position||z.area!==area){gains.set(z.id,0);continue;}const x=z.position[0]+(area==='town'?0:200),d=Math.hypot(p.x-x,p.y-z.position[1],p.z-z.position[2]);gains.set(z.id,Math.max(0,1-d/(z.radius??18))*(z.gain??.35));}
  if(context)for(const [id,node]of sources)node.gain.gain.setTargetAtTime(enabled?(gains.get(id)??0):0,context.currentTime,.12);
 }
 return {zones,gains,triggers,update,onBell(fn){listeners.add(fn);return()=>listeners.delete(fn);},async enable(){if(!zones.some(z=>z.src))return false;const Audio=globalThis.AudioContext??globalThis.webkitAudioContext;if(!Audio)return false;context??=new Audio();await context.resume();for(const zone of zones){if(!zone.src||sources.has(zone.id))continue;try{const response=await fetch(zone.src);if(!response.ok)throw Error('Unavailable audio');const buffer=await context.decodeAudioData(await response.arrayBuffer()),source=context.createBufferSource(),gain=context.createGain();gain.gain.value=0;source.buffer=buffer;source.loop=true;source.connect(gain).connect(context.destination);source.start();sources.set(zone.id,{source,gain});}catch{zone.unavailable=true;}}enabled=sources.size>0;if(!enabled)await context.suspend();return enabled;},disable(){enabled=false;context?.suspend();},get stats(){return {zones:zones.length,configured:zones.filter(z=>z.src).length,enabled,contexts:context?1:0};}};
}
