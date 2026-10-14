// Visual approximations, not manufacturer texture scans or calibrated samples.
export const FINISHES={
 'legacy-graphite':{label:'Current graphite',color:'#353b40',pattern:'plain',roughness:.43},
 'legacy-light':{label:'Current light grey',color:'#a5aaa9',pattern:'plain',roughness:.45},
 blanco:{label:'Blanco · plain melamine',color:'#e7e5df',pattern:'plain',roughness:.48},
 negro:{label:'Negro · plain melamine',color:'#232427',pattern:'plain',roughness:.48},
 basalto:{label:'Faplac Gris Basalto · supermate',color:'#666761',pattern:'plain',roughness:.9},
 tapir:{label:'Faplac Gris Tapir · supermate',color:'#8d8880',pattern:'plain',roughness:.9},
 caliza:{label:'Faplac Gris Caliza · supermate',color:'#c6c1b4',pattern:'plain',roughness:.9},
 kiri:{label:'Faplac Kiri · wood pattern',color:'#cfc2a5',pattern:'wood',roughness:.58},
 paraiso:{label:'Faplac Paraíso · wood pattern',color:'#bb8f61',pattern:'wood',roughness:.58},
 terracota:{label:'Faplac Terracota',color:'#a8715d',pattern:'plain',roughness:.65},
 jade:{label:'Faplac Jade',color:'#899484',pattern:'plain',roughness:.65},
 yute:{label:'Faplac Yute · woven',color:'#ada38b',pattern:'woven',roughness:.8},
 custom:{label:'Custom color',color:'#697079',pattern:'plain',roughness:.55},
};
export const SUBSTRATES={mdf:'Melamine over MDF',mdp:'Melamine over agglomerate / MDP',rh:'Melamine over MDP RH'};
export const MODULE_NAMES={'retro-cabinet':'Retro gaming cabinet','retro-PC':'Retro PC corner',music:'Music return','fixed-modern-PC':'Fixed PC / UPS'};
export const defaultFinish=()=>({frame:'legacy-graphite',surfaces:'legacy-light',frameColor:'#353b40',surfaceColor:'#a5aaa9',substrate:'mdf',sheen:'preset'});
export const defaultPresentation=()=>({mode:'full',target:'all',base:defaultFinish(),overrides:{}});
export function validatePresentation(raw){
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Invalid furniture appearance settings');
 const state=defaultPresentation();if(raw.mode!==undefined){if(!['full','furniture'].includes(raw.mode))throw Error('Invalid room mode');state.mode=raw.mode}if(raw.target!==undefined){if(raw.target!=='all'&&!Object.hasOwn(MODULE_NAMES,raw.target))throw Error('Invalid finish module');state.target=raw.target}
 function config(value){if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid furniture finish');const c=defaultFinish();for(const [key,v]of Object.entries(value)){if(['frame','surfaces'].includes(key)){if(!Object.hasOwn(FINISHES,v))throw Error('Unknown furniture finish');c[key]=v}else if(['frameColor','surfaceColor'].includes(key)){if(typeof v!=='string'||!/^#[a-f0-9]{6}$/i.test(v))throw Error('Invalid furniture color');c[key]=v}else if(key==='substrate'){if(!Object.hasOwn(SUBSTRATES,v))throw Error('Unknown board material');c[key]=v}else if(key==='sheen'){if(!['preset','matte','satin','gloss'].includes(v))throw Error('Invalid surface sheen');c[key]=v}else throw Error('Unknown furniture finish setting')}return c}
 if(raw.base!==undefined)state.base=config(raw.base);if(raw.overrides!==undefined){if(!raw.overrides||Array.isArray(raw.overrides)||typeof raw.overrides!=='object')throw Error('Invalid finish overrides');for(const [id,c]of Object.entries(raw.overrides)){if(!Object.hasOwn(MODULE_NAMES,id))throw Error('Unknown finish module');state.overrides[id]=config(c)}}return state;
}
