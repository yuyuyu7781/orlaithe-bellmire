// Adult dimensions shared by the town's older resident models. Hats remain
// above the head reference; seated torsos use head size instead of standing height.
export const adultDimensions={height:1.75,seatedHeadRadius:.23};
export function createResidentScale(THREE){
  const residents=[];
  function normalize(object,{head=object.children.find(o=>o.geometry?.type==='SphereGeometry'),seated=false}={}){
    if(object.userData.adultScale)return object;
    object.updateWorldMatrix(true,true);
    const bodyBounds=new THREE.Box3().setFromObject(object,true),headBounds=new THREE.Box3().setFromObject(head,true);
    const reference=seated?head.geometry.parameters.radius*head.getWorldScale(new THREE.Vector3()).x:headBounds.max.y-bodyBounds.min.y;
    const factor=(seated?adultDimensions.seatedHeadRadius:adultDimensions.height)/reference;
    // Rebase absolute-coordinate assemblies at their contact point before
    // scaling, so a dock worker doesn't move toward the scene origin.
    const anchor=bodyBounds.getCenter(new THREE.Vector3());anchor.y=bodyBounds.min.y;
    const local=object.worldToLocal(anchor.clone());
    for(const child of object.children)child.position.sub(local);
    object.position.copy(object.parent?object.parent.worldToLocal(anchor):anchor);
    object.scale.multiplyScalar(factor);object.updateWorldMatrix(true,true);
    object.userData.adultScale={standingHeight:adultDimensions.height,posture:seated?'seated':'standing'};
    residents.push({object,head,get seated(){return object.userData.adultScale.posture==='seated';}});return object;
  }
  return {normalize,residents,dimensions:adultDimensions};
}
