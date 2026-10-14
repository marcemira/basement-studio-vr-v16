import {validatePresentation} from './finish-catalog.js';
// Validate before touching the live room. Accept the original flat settings files.
export function parseSettings(input){
 const raw=typeof input==='string'?JSON.parse(input):input;
 function check(v,depth=0){if(depth>12)throw Error('Settings are nested too deeply');if(typeof v==='number'&&!Number.isFinite(v))throw Error('Invalid number');if(v&&typeof v==='object')for(const [k,x]of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))throw Error('Invalid settings key');check(x,depth+1)}}
 check(raw);if(!raw||Array.isArray(raw)||typeof raw!=='object')throw Error('Choose a furniture settings JSON file');
 if(raw.schemaVersion!==undefined&&raw.schemaVersion!==1)throw Error('Unsupported settings version');
 const s=structuredClone(raw);let recognized=0;
 for(const k of ['width','depth','height','tvInches','musicDepth','cornerFront','tvHeight','tvOffset','consoleRows','upperShelfHeight','upperRows'])if(k in s){if(typeof s[k]!=='number')throw Error(k+' must be a number');recognized++}
 for(const k of ['glass','cabinetLighting','storage','upper','backPanels','sidePanels','centerCabinet','rightDisplay','vrPBR'])if(k in s&&typeof s[k]!=='boolean')throw Error(k+' must be true or false');
 for(const k of ['editing','screens','navigation','view'])if(k in s){if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))throw Error('Invalid '+k+' settings');recognized++}
 if(s.lighting!==undefined&&typeof s.lighting!=='boolean'&&(!s.lighting||typeof s.lighting!=='object'||Array.isArray(s.lighting)))throw Error('Invalid lighting settings');
 if(s.presentation!==undefined){s.presentation=validatePresentation(s.presentation);recognized++}
 if(!recognized)throw Error('This file contains no room settings');
 for(const [k,v]of Object.entries(s.navigation||{}))if(k==='freeWalk'?typeof v!=='boolean':typeof v!=='number')throw Error('Invalid navigation '+k);
 if(s.editing){if(s.editing.chairs!==undefined&&typeof s.editing.chairs!=='boolean')throw Error('Invalid chair setting');for(const item of Object.values(s.editing.objects||{})){if(!item||typeof item!=='object')throw Error('Invalid object position');for(const [k,v]of Object.entries(item))if(k==='visible'?typeof v!=='boolean':typeof v!=='number')throw Error('Invalid object '+k)}}
 for(const screen of Object.values(s.screens||{})){if(!screen||typeof screen!=='object')throw Error('Invalid screen');for(const [k,v]of Object.entries(screen)){if(['brightness'].includes(k)&&typeof v!=='number'||k==='glow'&&typeof v!=='boolean'||['content','image'].includes(k)&&typeof v!=='string')throw Error('Invalid screen '+k);if(k==='image'&&v&&!/^data:image\/(jpeg|png|webp);base64,/.test(v))throw Error('Invalid screen image')}}
 for(const [k,v]of Object.entries(s.lighting||{})){if(['shadows','sync','effectPaused'].includes(k)?typeof v!=='boolean':['pcColor','shelfColor','roomColor'].includes(k)?!/^#[a-f0-9]{6}$/i.test(v):['effect','preset'].includes(k)?typeof v!=='string':typeof v!=='number')throw Error('Invalid lighting '+k)}
 for(const v of Object.values(s.view||{}))if(typeof v!=='boolean')throw Error('Invalid room view option');
 return s;
}
export function downloadFile(name,content,type='application/json'){const url=URL.createObjectURL(new Blob([content],{type})),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
