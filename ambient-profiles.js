import {worldNodes} from './world-graph.js';
// Source-safe profiles; missing recordings reuse the existing muted-capable zones.
export const ambientProfiles={town:{water:.035,wind:0},wind:{water:0,wind:.025},'quiet-water':{water:.035,wind:.016},'lakeside-town':{water:.035,wind:.01},'cold-lake-wind':{water:.03,wind:.025},'stone-hollow':{water:.018,wind:.012},'wetland-quiet':{water:.018,wind:.01,insects:null,birds:null,wood:null,drips:null},highland:{water:0,wind:.02}};
export const ambientRegionForZone=id=>id.startsWith('mire')?'violet-mire':id.startsWith('crown')?'hollow-crown':id.startsWith('ring')?'the-ring':id.startsWith('nine')?'nine-stones':id.startsWith('lun')?'lunmere':id.startsWith('caerith')?'caerith':id.startsWith('lake')?'lake-lun':'bellmire';

export const ambientProfileForRegion=id=>ambientProfiles[worldNodes.find(n=>n.id===id)?.ambientProfile]??ambientProfiles.town;
