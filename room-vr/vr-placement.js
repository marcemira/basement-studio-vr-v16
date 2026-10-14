import * as T from './vendor/three.module.js';
export function heading(q){const f=new T.Vector3(0,0,-1).applyQuaternion(q);return Math.atan2(-f.x,-f.z)}
export function turnAroundHead(rig,head,radians){const offset=head.clone().sub(rig.position).applyAxisAngle(new T.Vector3(0,1,0),radians);rig.rotation.y+=radians;rig.position.copy(head).sub(offset);rig.updateMatrixWorld(true)}
export function smoothTurn(axis,dt,speedDegrees=45){const magnitude=Math.abs(axis);if(magnitude<=.12)return 0;return -Math.sign(axis)*Math.pow(Math.min(1,(magnitude-.12)/.88),1.6)*speedDegrees*Math.PI/180*dt}
export function createVRPlacement(editor){const held=new Map();
 function begin(hand,matrix,object){const item=editor.resolve(object);if(!item||!item.object.visible)return false;for(const h of held.values()){let a=item.object,b=h.item.object;if(a===b)return false;while(a=a.parent)if(a===b)return false;a=item.object;while(b=b.parent)if(b===a)return false}
  item.object.updateWorldMatrix(true,false);const offset=matrix.clone().invert().multiply(item.object.matrixWorld);held.set(hand,{item,offset});editor.select(item.id);return true}
 function update(hand,matrix){const h=held.get(hand);if(!h)return;const desired=matrix.clone().multiply(h.offset),p=new T.Vector3(),q=new T.Quaternion(),s=new T.Vector3();desired.decompose(p,q,s);editor.placeWorld(h.item.id,p,heading(q));}
 function end(hand){if(!held.has(hand))return;held.delete(hand);editor.commit()}
 function endAll(){for(const hand of [...held.keys()])end(hand)}
 return {begin,update,end,endAll,isHolding:hand=>held.has(hand),count:()=>held.size};
}
