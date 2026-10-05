import assert from 'node:assert/strict';
import {watercourseLayout as w} from '../waterways.js';
const points=[w.source,...w.falls,...w.open,...w.feed.slice(1),...w.lower.slice(1)];
assert.ok(points.every((p,i)=>!i||p[1]<=points[i-1][1]),'water must never run uphill');
assert.deepEqual(w.open.at(-1),w.feed[0]);
assert.deepEqual(w.feed.at(-1),w.lower[0]);
assert.ok(w.timberLength<1.1);
assert.deepEqual(w.source,w.springBasin.center);
assert.equal(w.source[1],w.falls[0][1]);
assert.ok(w.source[2]<w.falls[0][2]);
assert.equal(w.falls.filter((p,i)=>i&&p[1]<w.falls[i-1][1]).length,2);
assert.ok(w.falls.every((p,i)=>!i||w.falls[i-1][1]-p[1]<1),'each gentle drop remains below one metre');
assert.ok(Math.abs(w.lower.at(-1)[1]-1.23)<.001);
const paddleBottom=w.wheel[1]-.55*(3.65+1.15/2);
assert.ok(paddleBottom<3.77&&paddleBottom>3.57,'lower blades touch the shallow mill pool');
for(const b of w.bridges){const ground=b.id==='quay'?1.38:3.5;assert.ok((b.water+.24-ground)/(b.id==='quay'?3:2)<.38,'approach rises respect human step height');}
console.log('PASS one downhill spring-open-leat-wheel-harbor layout / short timber feed / blade contact / bridge risers');
