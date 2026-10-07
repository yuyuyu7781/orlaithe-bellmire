// Shared, inexpensive policy for simulation consumers; time/event/save systems
// do not use this budget and therefore keep progressing everywhere.
const links={bellmire:['nine-stones'],'nine-stones':['bellmire','lake-lun'],'lake-lun':['nine-stones','lunmere','caerith'],lunmere:['lake-lun','caerith'],caerith:['lake-lun','lunmere']};
export function regionActivity(current,target,quality='standard'){
 const tier=current===target?'current':links[current]?.includes(target)?'adjacent':'remote';
 return{tier,interval:tier==='current'?0:tier==='adjacent'?(quality==='mobile'?.75:.5):(quality==='mobile'?1.5:1),details:tier==='current',animate:tier==='current'};
}
