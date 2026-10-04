// Shared art direction and time vocabulary. No model coordinates are changed.
export const weatherProfiles={
 clear:{sky:0xa5afaa,fog:0xa5afaa,density:.0063,air:true,hemi:1.45,sun:2.05,exposure:1.08,bloom:.14,sunColor:0xffe5c0,period:'day'},
 rain:{sky:0x5d6b70,fog:0x687575,density:.0105,air:false,hemi:.80,sun:.34,exposure:.80,bloom:.20,sunColor:0xc6cec5,period:'day'},
 fog:{sky:0x929b96,fog:0x929b96,density:.0145,air:false,hemi:.94,sun:.43,exposure:.82,bloom:.22,sunColor:0xd9d8be,period:'day'},
 blackout:{sky:0x071017,fog:0x071017,density:.012,air:false,hemi:.12,sun:.02,exposure:.48,bloom:.12,sunColor:0xb3bfba,period:'night'},
 dawn:{sky:0x7c8b8b,fog:0x9da091,density:.0075,air:true,hemi:.95,sun:.92,exposure:1.02,bloom:.18,sunColor:0xffce98,period:'morning'},
 night:{sky:0x142024,fog:0x253031,density:.0070,air:true,hemi:1.05,sun:.18,exposure:1.00,bloom:.20,sunColor:0xb8c8c2,period:'night'}
};
export const periodSettings={
 morning:{marketActivity:.65,shops:{baker:true,bookseller:false,boatworker:true,starmaker:false},window:.54,lantern:.58},
 day:{marketActivity:1,shops:{baker:true,bookseller:true,boatworker:true,starmaker:true},window:.48,lantern:.39},
 evening:{marketActivity:.40,shops:{baker:false,bookseller:true,boatworker:false,starmaker:true},window:.82,lantern:.85},
 night:{marketActivity:.15,shops:{baker:false,bookseller:false,boatworker:false,starmaker:false},window:.86,lantern:.92}
};
export const surfacePalette={stone:0xaaa18a,wood:0x73543b,roof:0x4b6052,ground:0x99937e};
export const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function districtWeights(x,z){const upper=1-smooth(-17,1,z),harbor=smooth(25,39,z);return {upper,harbor,middle:1-upper-harbor};}
// Follows the already-built supply, wheel and outlet; avoids a second water system.
export function waterInfluence(x,y,z){
 const inlet=(1-smooth(1,3.5,Math.abs(x-21)))*(smooth(-21,-17,z))*(1-smooth(36,40,z));
 const quay=smooth(29,38,z)*(1-smooth(3,8,y));return Math.max(inlet,quay);
}
export function periodForWeather(weather){return weatherProfiles[weather]?.period??'day';}

// Shared v12.2 lighting policy; reuse the existing sun and shadow map.
export const artLighting={skyTint:0xe3e4db,groundTint:0x958371,shadowExtent:65,shadowFar:180,minCasterWidth:2.2,minCasterHeight:1.2};
export const waterPalette={tint:0x5c7376,tintAmount:.28};

export const timeAtmosphere={morning:weatherProfiles.dawn,day:weatherProfiles.clear,night:weatherProfiles.night,evening:{sky:0x77847b,fog:0x899186,density:.0068,air:true,hemi:.85,sun:1.05,exposure:.96,bloom:.20,sunColor:0xffd1a0,period:"evening"}};
