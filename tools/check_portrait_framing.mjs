import assert from 'node:assert/strict';
import {portraitProfile,portraitFraming} from '../portrait-profiles.js';
import {characters,selectPortrait} from '../dialogue-data.js';
for(const character of characters){
 const focus=portraitFraming(portraitProfile(character),selectPortrait(character));
 for(const setting of Object.values(focus)){assert(setting.zoom>=1&&setting.zoom<=1.4);assert(setting.objectPositionY<40);}
 assert.equal(portraitFraming(portraitProfile(character),{framing:{objectPositionX:42,zoom:1.12,mobile:{zoom:1.2}}}).mobile.zoom,1.2);
}
const variant=portraitFraming({framing:{objectPositionY:30,variants:{happy:{objectPositionY:22}}}},{},'happy');assert.equal(variant.normal.objectPositionY,22);
assert.equal(portraitFraming({framing:{zoom:.8,objectPositionX:300}}).normal.zoom,1);
assert.equal(portraitFraming({framing:{zoom:.8,objectPositionX:300}}).normal.objectPositionX,100);
console.log('PASS five cover framing profiles / mobile and image overrides / expression variants / safe bounds');
