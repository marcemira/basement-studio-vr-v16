import * as T from './vendor/three.module.js';
// Keep object transforms, textures and scale; remove lighting/shadow shaders for the VR comparison.
export function createSimpleRoomMaterials(root){
 const original=new Map(),converted=new Map();
 function simple(m){if(m.isMeshBasicMaterial)return m;if(converted.has(m))return converted.get(m);const copy=new T.MeshBasicMaterial({color:m.color||'#aaaaaa',map:m.map||null,transparent:m.transparent,opacity:m.opacity,side:m.side,depthWrite:m.depthWrite,alphaTest:m.alphaTest||0,toneMapped:false});converted.set(m,copy);return copy}
 return {
  enable(){root.traverse(o=>{if(!o.isMesh)return;if(!original.has(o))original.set(o,o.material);o.material=Array.isArray(original.get(o))?original.get(o).map(simple):simple(original.get(o))})},
  restore(){for(const [o,material]of original)o.material=material;original.clear();for(const material of converted.values())material.dispose();converted.clear()}
 };
}
export function guardedFrame(work,onError){try{work();return true}catch(error){onError(error);return false}}
