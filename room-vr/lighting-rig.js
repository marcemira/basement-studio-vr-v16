import * as T from './vendor/three.module.js';
import {createShelfLighting} from './shelf-lighting.js';
import {RGB_EFFECTS,rgbFrame} from './rgb-effects.js';
import {createStudioEnvironment} from './surface-detail.js';
export const LIGHT_PRESETS={
 off:{label:'Off · screens only',room:0,pc:0,shelves:0,reflection:0},
 basic:{label:'Basic room',room:1,pc:0,shelves:0,reflection:.65,roomColor:'#fff1dc'},
 pc:{label:'PC RGB only',room:0,pc:1,shelves:0,reflection:0,pcColor:'#39a8ff'},
 shelves:{label:'Shelf RGB only',room:0,pc:0,shelves:1,reflection:0,shelfColor:'#ffaa55'},
 studio:{label:'Balanced studio',room:.7,pc:.6,shelves:.55,reflection:.4,pcColor:'#44caff',shelfColor:'#ffd39a',roomColor:'#fff0dc'},
 aurora:{label:'Aurora · synced',room:.08,pc:1,shelves:.7,reflection:.03,pcColor:'#9c45ff',shelfColor:'#9c45ff',sync:true,roomColor:'#b7c8ff'},
 neon:{label:'Cyberpunk',room:.06,pc:1,shelves:.8,reflection:.02,pcColor:'#00d9ff',shelfColor:'#ff268e',sync:false,roomColor:'#abb8ff'},
 warm:{label:'Warm evening',room:.2,pc:.35,shelves:.7,reflection:.08,pcColor:'#ff9845',shelfColor:'#ffcc75',roomColor:'#ffcc91'},
};
export const RGB_PALETTE=['#39a8ff','#00e1c8','#7dff42','#ffb43c','#ff354e','#ff38ba','#9c45ff','#ffffff'];
export function createLightingRig(scene,root,renderer,state,onChange=()=>{},environmentFactory=createStudioEnvironment){
 let sources=[],emitters=[],reflectionTarget=null,reflectionDirty=true,timer=null,reflectionError=null,screenReflections=[],lastEnvironment=0,currentTime=0,lastTick=null;
 const extra=new T.Group();extra.name='RGB light sources';root.add(extra);
 for(const [name,zone,x,y,z,intensity]of [['PC RGB spill','pc',-1.45,1.10,.47,2.5]]){const l=new T.PointLight('#ffffff',intensity,3,2);l.name=name;l.userData.lightZone=zone;l.userData.baseIntensity=intensity;extra.add(l);l.position.set(x,y,z);if(zone==='pc'){l.castShadow=true;l.shadow.mapSize.set(512,512);l.shadow.camera.near=.03;l.shadow.bias=-.0002;l.shadow.normalBias=.006}}
 const pcSpill=extra.getObjectByName('PC RGB spill');let shelfRig;
 function zone(o){for(let p=o;p&&p!==scene;p=p.parent){if(p.userData.lightZone)return p.userData.lightZone;if(/^HYTE Y60|Gaming accent light/.test(p.name))return 'pc';if(/Studio task lamp|Face light|Recessed ceiling|Retro warm light/.test(p.name))return 'room';if(/South retro cabinet|Fixed southeast|Connected retro PC/.test(p.name))return 'shelves'}return 'room'}
 function refresh(){let pc;root.traverse(o=>{if(/^HYTE Y60/.test(o.name))pc=o});const spill=pcSpill;if(pc&&spill){pc.add(spill);spill.position.set(0,.28,.27)}sources=[];emitters=[];scene.traverse(o=>{if(o.isLight&&o.userData.lightZone!=='screen'){o.userData.baseIntensity??=o.intensity;sources.push({object:o,zone:zone(o),base:o.userData.baseIntensity});if(zone(o)==='shelves'&&o.parent?.userData.module==='retro-cabinet'&&!o.userData.noShadow){o.castShadow=true;o.shadow.mapSize.set(512,512);o.shadow.camera.near=.03;o.shadow.bias=-.0002;o.shadow.normalBias=.005}}if(!o.isMesh)return;if(o.material?.transparent&&o.material.opacity<.5)o.castShadow=false;const mats=Array.isArray(o.material)?o.material:[o.material];for(let i=0;i<mats.length;i++){const m=mats[i];if(m?.emissiveIntensity>0&&m.emissive?.getHex()>0)o.castShadow=false;if(!m?.isMeshStandardMaterial||!m.emissive||m.emissiveIntensity<=0||m.emissive.getHex()===0||m.userData.rgbManaged)continue;const z=zone(o); // Keep device power indicators and screen textures independent.
   if(z==='pc'&&!/^HYTE Y60/.test(o.parent?.name||''))continue;if(z==='shelves'&&m.emissive.getHex()!==0xfcf5de)continue;if(z==='room'&&m.emissive.getHex()!==0xfcf5de)continue;
   const copy=m.clone();copy.userData={...m.userData,rgbManaged:true,rgbZone:z,rgbBaseIntensity:m.emissiveIntensity};if(Array.isArray(o.material))o.material[i]=copy;else o.material=copy;
  }});root.traverse(o=>{if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m?.userData.rgbManaged)emitters.push(m)});apply(false);shelfRig?.refresh()}
 function apply(reflections=true,notify=true,time=currentTime){
  for(const {object:o,zone:z,base}of sources){const f=rgbFrame(state,z,time,o.position.x+o.position.y);o.color.copy(f.color);o.intensity=base*state[z]*state.power*f.gain}
  for(const [index,m]of emitters.entries()){const z=m.userData.rgbZone,f=rgbFrame(state,z,time,index*.12);m.color.copy(f.color);m.emissive.copy(f.color);m.emissiveIntensity=m.userData.rgbBaseIntensity*state[z]*state.power*f.gain}
  renderer.toneMappingExposure=state.exposure;scene.environmentIntensity=1;if(reflections){reflectionDirty=true;clearTimeout(timer);timer=setTimeout(updateReflections,120)}if(notify)onChange();
 }
 function updateReflections(){if(!reflectionDirty)return;reflectionDirty=false;try{const pcDirection=pcSpill.getWorldPosition(new T.Vector3()).sub(new T.Vector3(0,1.2,1.66)).normalize().multiplyScalar(5.8).toArray();const target=environmentFactory(renderer,{...state,pcDirection,pcColor:'#'+rgbFrame(state,'pc',currentTime).color.getHexString(),shelfColor:'#'+rgbFrame(state,'shelves',currentTime).color.getHexString(),pc:state.pc*rgbFrame(state,'pc',currentTime).gain*(root.userData.presentation?.mode==='furniture'?0:1),shelves:shelfRig?0:state.shelves*rgbFrame(state,'shelves',currentTime).gain,screens:screenReflections});scene.environment=target.texture;reflectionTarget?.dispose();reflectionTarget=target;reflectionError=null}catch(error){reflectionError=error.message;console.warn('Reflection environment update failed',error)}}
 function configure(patch){if(RGB_EFFECTS[patch.effect])state.effect=patch.effect;if(Number.isFinite(+patch.effectSpeed))state.effectSpeed=T.MathUtils.clamp(+patch.effectSpeed,.1,3);if(typeof patch.effectPaused==='boolean')state.effectPaused=patch.effectPaused;for(const k of ['room','pc','shelves','reflection','power'])if(Number.isFinite(+patch[k]))state[k]=T.MathUtils.clamp(+patch[k],0,2);if(Number.isFinite(+patch.exposure))state.exposure=T.MathUtils.clamp(+patch.exposure,.2,2);
  for(const k of ['pcColor','shelfColor','roomColor'])if(/^#[a-f0-9]{6}$/i.test(patch[k]||''))state[k]=patch[k];for(const k of ['sync','shadows'])if(typeof patch[k]==='boolean')state[k]=patch[k];if(typeof patch.preset==='string'&&LIGHT_PRESETS[patch.preset])state.preset=patch.preset;apply();}
 function preset(name){const p=LIGHT_PRESETS[name];if(!p)return;configure({sync:false,...p,preset:name});}
 function invalidateReflections(){shelfRig?.invalidate();reflectionDirty=true;clearTimeout(timer);timer=setTimeout(updateReflections,120)}function tick(time=performance.now()){const delta=lastTick===null?0:Math.max(0,Math.min(100,time-lastTick));lastTick=time;if(state.effect!=='static'&&state.effect&&!state.effectPaused){currentTime+=delta;apply(false,false);if(time-lastEnvironment>=750)reflectionDirty=true}shelfRig?.tick(time);if(reflectionDirty&&time-lastEnvironment>=750){clearTimeout(timer);updateReflections();lastEnvironment=time}}
 function setScreenReflections(value){screenReflections=value;reflectionDirty=true}
 refresh();if(renderer.isWebGLRenderer)shelfRig=createShelfLighting(scene,root,renderer,state);updateReflections();return {shelfRig,renderShelfShadows:()=>shelfRig?.renderShadows(),invalidateShelfShadows:()=>shelfRig?.invalidate(),refresh,configure,preset,tick,setScreenReflections,invalidateReflections,flushReflections:updateReflections,state,diagnostics:()=>({lights:sources.length,emitters:emitters.length,reflectionError,shelves:shelfRig?.diagnostics()}),dispose(){shelfRig?.dispose();clearTimeout(timer);reflectionTarget?.dispose()}};
}






