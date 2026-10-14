import * as T from './vendor/three.module.js';
export const RGB_EFFECTS={static:'Static color',breathe:'Breathing',rainbow:'Rainbow',cycle:'Color cycle',wave:'Rainbow wave'};
export function rgbFrame(state,zone,time=0,offset=0){
 const color=new T.Color(zone==='pc'?state.pcColor:zone==='shelves'?(state.sync?state.pcColor:state.shelfColor):state.roomColor);
 const effect=state.effect||'static',t=time*.001*(state.effectSpeed||1),phase=state.sync||zone==='pc'?0:.3;
 let gain=1;
 if(zone!=='room'){
  if(effect==='breathe')gain=.15+.85*(.5-.5*Math.cos(t*Math.PI));
  else if(['rainbow','cycle','wave'].includes(effect))color.setHSL((t*(effect==='rainbow'?.055:.10)+phase+(effect==='wave'?offset*.10:effect==='rainbow'?offset*.065:0))%1,.9,.55);
 }
 return {color,gain};
}
