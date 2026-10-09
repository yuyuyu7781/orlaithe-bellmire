// Same-runner measurements: counts are deterministic; CPU time is reported, not treated as phone FPS.
const fs=require('node:fs'),assert=require('node:assert/strict');
const before=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const after=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
assert.equal(before.length,39);assert.equal(after.length,39);
const counts=['calls','triangles','mesh','lights','transparent','casters'];
const rows=before.map((b,i)=>{
 const a=after[i];assert.equal(a.name,b.name);assert.equal(a.quality,b.quality);
 for(const key of counts)assert.equal(a[key],b[key],b.name+' '+b.quality+' '+key);
 assert.equal(a.scheduled.scheduled,b.scheduled.scheduled);assert.equal(a.scheduled.scheduled,118);
 assert.ok(Number.isFinite(a.updateMedian)&&Number.isFinite(b.updateMedian));
 return [b.name,b.quality,...counts.flatMap(k=>[b[k],a[k]]),b.scheduled.scheduled,a.scheduled.scheduled,b.updateMedian,a.updateMedian];
});
const header=['view','quality',...counts.flatMap(k=>[k+'_before',k+'_after']),'NPC_before','NPC_after','CPU_before_ms','CPU_after_ms'];
fs.writeFileSync(process.argv[4]||'/tmp/research-performance-same-runner.csv',[header,...rows].map(r=>r.join(',')).join('\n')+'\n');
const median=list=>list.slice().sort((a,b)=>a-b)[Math.floor(list.length/2)];
console.log('PASS identical rendering counts and NPC118 in39 views; CPU median ms',median(before.map(r=>r.updateMedian)),median(after.map(r=>r.updateMedian)));
