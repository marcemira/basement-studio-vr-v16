import * as T from 'three';
import {M} from './geometry.js';
import {MODULE_NAMES} from './finish-catalog.js';
export const furnitureGroup=/^(Cartridge drawer|Ventilated retro tower bay|CD compartments|Vented UPS access door|Console bay \d+|Side display glass|Upper glazed display row|Sliding 88-key piano tray|Retro keyboard drawer)/;
export function furnitureOwner(o){for(let p=o.parent;p;p=p.parent)if(MODULE_NAMES[p.userData.module])return p;return null}
export function boardInfo(o){
 if(!o.isMesh)return null;if(o.userData.buildable)return o.userData.buildable;
 const own=furnitureOwner(o),module=o.userData.boardModule||own?.userData.module;if(!module)return null;
 let allowed=true;for(let p=o.parent;p&&p!==own;p=p.parent)if(!furnitureGroup.test(p.name)){allowed=false;break}
 if((!allowed&&!o.userData.boardModule)||![M.graphite,M.light,M.glass].includes(o.material))return null;
 o.geometry.computeBoundingBox();const dims=o.geometry.boundingBox.getSize(new T.Vector3()),sorted=[dims.x,dims.y,dims.z].sort((a,b)=>a-b);
 const detail=!o.userData.board&&(sorted[0]<.0119||sorted[1]<.0699||sorted[2]<.1399)&&o.material!==M.glass;
 return {module,detail,role:o.material===M.light?'surfaces':'frame',glass:o.material===M.glass};
}
