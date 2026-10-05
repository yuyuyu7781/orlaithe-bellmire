import {createDetailBatch} from './miniature.js';
// Calendar scenery owns child visibility; shop-system retains ownership of town roots.
export function createTownRhythmScenery({THREE,scene,walking,grounding,townLife,inspections,stay}){
 const market=createDetailBatch(THREE,scene,'Weekly modest market'),gathering=createDetailBatch(THREE,scene,'Waterfront evening lamps'),stands=[],obstacles=[];
 const laundry=[];scene.traverse(o=>{if(o.isMesh&&o.parent!==scene&&/linen|laundry|washing/i.test(o.name)&&!o.isInstancedMesh)laundry.push({object:o,visible:o.visible});});
 const wood=new THREE.MeshStandardMaterial({color:0x70543c,roughness:1}),linen=new THREE.MeshStandardMaterial({color:0xc5b599,roughness:1}),leaf=new THREE.MeshStandardMaterial({color:0x777e53,roughness:1}),lamp=new THREE.MeshStandardMaterial({color:0xbf9456,emissive:0xe6a456,emissiveIntensity:.7,roughness:1});
 function box(batch,w,h,d,x,y,z,mat){return batch.add('block',mat,[x,y,z],[w,h,d]);}
 // Counter footprints only; overhanging canvas does not become an invisible wall.
 for(const [x,z] of [[14.2,18.7],[24.8,14.0]]){const y=grounding.heightAt(x,z);if(!Number.isFinite(y))continue;
  const counter=new THREE.Group();counter.position.set(x,y,z);scene.add(counter);counter.visible=false;
  const proxy=new THREE.Mesh(new THREE.BoxGeometry(1.2,.8,.55),wood);proxy.position.y=.4;counter.add(proxy);
  const obstacle=walking.registerObstacle(counter);if(obstacle)obstacles.push(obstacle);stands.push(counter);proxy.visible=false;
  box(market,1.2,.8,.55,x,y+.4,z,wood);box(market,1.45,.06,.85,x,y+1.9,z,linen);
  for(const dx of [-.55,.55])box(market,.06,1.9,.06,x+dx,y+.95,z,wood);
  for(let i=0;i<3;i++)box(market,.22,.14,.22,x-.35+i*.34,y+.87,z,i===1?leaf:linen);
 }
 const lampPositions=[];for(const [x,z]of [[-7.08,31.28],[-1,34],[22,29],[20,29.5],[23,30]]){if(lampPositions.length===4)break;const y=walking.canStandTownAs('human',x,z,grounding.heightAt(x,z));if(y===null)continue;lampPositions.push([x,y,z]);box(gathering,.20,.10,.20,x,y+.05,z,wood);box(gathering,.12,.18,.12,x,y+.19,z,lamp);}
 market.finish();gathering.finish();
 // These two margins are audited using the same registered footprints;
 // the original human streets and cat passages remain in place.
 const entry={id:'weekly-market',kind:'calendar-note',verb:'調べる',label:'市の小さな籠',object:stands[0],localPoint:[0,.8,0],range:2.7,profiles:['human','cat'],enabled:()=>townLife.state.calendar.market};if(entry.object)inspections.resolver.register(entry);
 const lampTarget=new THREE.Object3D();lampTarget.position.set(lampPositions[0][0],lampPositions[0][1]+.25,lampPositions[0][2]);gathering.root.add(lampTarget);inspections.resolver.register({id:'waterfront-gathering',kind:'gathering-note',verb:'調べる',label:'岸辺の小さな灯',object:lampTarget,range:2.7,profiles:['human','cat'],enabled:()=>townLife.state.calendar.gathering});
 inspections.handlers.set('gathering-note',target=>{inspections.present(target,{text:'水際に小さな灯が置かれている。帰り道の人が、少しだけここで足を止める。'});stay.note('gathering:'+townLife.state.calendar.weekIndex,'今夜は水辺に灯りを出す日らしい。');});
 inspections.handlers.set('calendar-note',target=>{inspections.present(target,{text:walking.state.profile.id==='cat'?'籠から乾いた葉と遠い道の匂いがする。':'今日は小さな市の日。いつもの籠の隣に、丘を越えてきた布が並んでいる。'});stay.note('weekly-market:'+townLife.state.calendar.weekIndex,'今日は市が立つ日らしい。');});
 let lastSeason='';const baseLeaf=leaf.color.clone(),baseLinen=linen.color.clone();
 function apply(state){for(const stand of stands)stand.visible=state.calendar.market;for(const e of laundry)e.object.visible=state.weather==='rain'?false:e.visible;for(const m of market.root.children)m.visible=state.calendar.market;for(const m of gathering.root.children)m.visible=state.calendar.gathering;for(const o of obstacles)o.disabled=!state.calendar.market;
  if(state.season!==lastSeason){lastSeason=state.season;leaf.color.copy(baseLeaf);linen.color.copy(baseLinen);if(state.season==='autumn'){leaf.color.lerp(new THREE.Color(0x9d9568),.3);linen.color.lerp(new THREE.Color(0xa99b80),.15);}if(state.season!=='spring')stay.note('season:'+state.season,'市場の布と乾いた葉に、季節の違いが見える。');}
 }
 townLife.onChange(apply);apply(townLife.state);return{market,gathering,stands,apply,get stats(){return{stalls:stands.length,lamps:lampPositions.length,market:townLife.state.calendar.market,gathering:townLife.state.calendar.gathering,addedLights:0}}};
}
