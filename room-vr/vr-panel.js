import * as T from './vendor/three.module.js';
import {cabinetMetrics,upperRowLimit} from './cabinet.js';
export function createVRPanel(scene,api){
 const W=1000,H=1240,canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d'),texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const mesh=new T.Mesh(new T.PlaneGeometry(.82,1.016),new T.MeshBasicMaterial({map:texture,side:T.DoubleSide,toneMapped:false}));mesh.name='Interactive VR room controls';mesh.visible=false;scene.add(mesh);let page='Layout',rgbZone='pc',targets=[];
 function text(s,x,y,size=27,color='#d7ebe5'){ctx.fillStyle=color;ctx.font=size+'px Arial';ctx.textAlign='left';ctx.fillText(s,x,y)}
 function button(label,x,y,w,h,action,active=false,fontSize=27){ctx.fillStyle=active?'#598b7c':'#2a4247';ctx.fillRect(x,y,w,h);text(label,x+20,y+h/2+10,fontSize);targets.push({x,y,w,h,action})}
 function slider(label,value,min,max,step,change,y,unit='cm'){
  text(label,40,y);text(Math.round(value)+' '+unit,740,y);const sy=y+22;ctx.fillStyle='#426069';ctx.fillRect(120,sy+17,650,12);const ratio=(value-min)/(max-min||1);ctx.fillStyle='#a4ddca';ctx.fillRect(120,sy+17,650*Math.max(0,Math.min(1,ratio)),12);ctx.beginPath();ctx.arc(120+650*ratio,sy+23,16,0,Math.PI*2);ctx.fill();
  button('−',40,sy,65,48,()=>change(Math.max(min,value-step)));button('+',800,sy,65,48,()=>change(Math.min(max,value+step)));
  targets.push({x:120,y:sy,w:650,h:48,action:(u)=>change(Math.max(min,Math.min(max,Math.round((min+u*(max-min))/step)*step)))})
 }
 function draw(){targets=[];ctx.fillStyle='#14272e';ctx.fillRect(0,0,W,H);text('ROOM CONTROLS',40,65,40);text('Point your controller · Press trigger',40,105,24,'#94bcb1');for(const [i,name]of ['Layout','Position','TV','Objects','Lighting','RGB','Screens','Features'].entries())button(name,40+i*115,130,108,60,()=>{page=name;draw()},page===name,20);
  if(api.presentation)button('Finishes & furniture-only mode',40,197,900,32,()=>{page='Finishes';draw()},page==='Finishes',20);
  const c=api.furniture(),v=api.viewer();
  if(page==='Layout'){
   slider('TV cabinet width',c.width*100,180,210,5,value=>api.configure({width:value/100}),245);
   slider('Music desktop depth',c.musicDepth*100,40,Math.min(65,c.centerCabinet?Math.floor((1.9-(cabinetMetrics(c).right-c.cabinetCenter)-.55/Math.SQRT2)*100):65),1,value=>api.configure({musicDepth:value/100}),365);
   slider('Retro corner diagonal',c.cornerFront*100,55,Math.floor(100*Math.min(1.06,((c.centerCabinet?1.9-(cabinetMetrics(c).right-c.cabinetCenter):3.8-(c.width/2+cabinetMetrics(c).right-c.cabinetCenter)-.45)-c.musicDepth)*Math.SQRT2)),1,value=>api.configure({cornerFront:value/100}),485);
   slider('Cabinet depth',c.depth*100,35,40,1,value=>api.configure({depth:value/100}),605);
   slider('Cabinet height',c.height*100,230,250,5,value=>api.configure({height:value/100}),725);
   button('TV: '+c.tvInches+' inches',40,810,440,65,()=>api.configure({tvInches:c.tvInches===55?65:55}));button('Centered: '+(c.centerCabinet?'ON':'OFF'),500,810,440,65,()=>api.configure({centerCabinet:!c.centerCabinet}));
   slider('Gaming desk height',v.deskHeight*100,70,120,1,value=>api.desk(value/100),950);
  }else if(page==='Position'){
   slider('Eye height (panel only)',v.eyeHeight*100,100,210,1,value=>api.height(value/100),245);
   slider('Walking speed',v.speed*100,20,150,5,value=>api.speed(value/100),350,'cm/s');
   slider('Smooth turning speed',v.turnSpeed,5,120,5,api.turnSpeed,455,'deg/s');
   slider('Position step size',v.nudgeStep*100,1,20,1,value=>api.setStep(value/100),560);
   button('Recenter room',40,660,440,60,api.recenter);button('Face the TV',500,660,440,60,api.faceTV);
   button('Turn left 1 degree',40,735,440,60,()=>api.rotate(1));button('Turn right 1 degree',500,735,440,60,()=>api.rotate(-1));
   button('Step east',40,820,440,60,()=>api.nudge(-v.nudgeStep,0));button('Step west',500,820,440,60,()=>api.nudge(v.nudgeStep,0));
   button('Step south',40,905,440,60,()=>api.nudge(0,-v.nudgeStep));button('Step north',500,905,440,60,()=>api.nudge(0,v.nudgeStep));
   button('Reset view · 178 cm',40,990,440,60,api.resetViewer);button('Free walk: '+(v.freeWalk?'ON':'OFF'),500,990,440,60,()=>api.freeWalk(!v.freeWalk));
   button('Move panel in front of me',40,1075,900,50,api.reposition);
  }else if(page==='TV'){
   slider('TV center above floor',c.tvHeight*100,110,180,1,value=>api.configure({tvHeight:value/100}),245);
   slider('Console display rows (16 spaces)',c.consoleRows,4,6,1,value=>api.configure({consoleRows:value}),365,'rows');
   slider('Display rows above TV',c.upperRows,1,upperRowLimit(c),1,value=>api.configure({upperRows:value}),485,'rows');
   slider('Bottom of upper display',c.upperShelfHeight*100,160,Math.round((c.height-.06-c.upperRows*.22)*100),1,value=>api.configure({upperShelfHeight:value/100}),605);
   button('Right display: '+(c.rightDisplay?'ON':'OFF'),40,715,900,65,()=>api.configure({rightDisplay:!c.rightDisplay}));
   button('Upper display: '+(c.upper?'ON':'OFF'),40,800,900,65,()=>api.configure({upper:!c.upper}));
   button('TV: '+c.tvInches+' inches',40,885,900,65,()=>api.configure({tvInches:c.tvInches===55?65:55}));
   text('Fewer rows make space below the TV.',40,1000,26);text('Height is limited to avoid shelf overlap.',40,1040,26);
  }else if(page==='Finishes'){
   const p=api.presentation,a=p.current(),finishes=Object.keys(p.finishes),modules=['all',...Object.keys(p.modules)],bases=Object.keys(p.substrates);
   button('Show: '+(a.mode==='furniture'?'FURNITURE ONLY':'FULL ROOM'),40,250,900,65,()=>api.changePresentation({mode:a.mode==='furniture'?'full':'furniture'}));
   button('Module: '+(p.modules[a.target]||'All furniture'),40,340,900,65,()=>api.changePresentation({target:modules[(modules.indexOf(a.target)+1)%modules.length]}));
   button('Frames: '+p.finishes[a.frame].label,40,440,900,65,()=>api.changePresentation({frame:finishes[(finishes.indexOf(a.frame)+1)%finishes.length]}),false,24);
   button('Shelves: '+p.finishes[a.surfaces].label,40,530,900,65,()=>api.changePresentation({surfaces:finishes[(finishes.indexOf(a.surfaces)+1)%finishes.length]}),false,24);
   button('Board: '+p.substrates[a.substrate],40,630,900,65,()=>api.changePresentation({substrate:bases[(bases.indexOf(a.substrate)+1)%bases.length]}),false,24);
   const sheens=['preset','matte','satin','gloss'];button('Surface sheen: '+a.sheen,40,720,900,65,()=>api.changePresentation({sheen:sheens[(sheens.indexOf(a.sheen)+1)%sheens.length]}));
   button('Black + supermate',40,820,440,65,()=>api.changePresentation({frame:'negro',surfaces:'basalto'}),false,23);button('White + wood pattern',500,820,440,65,()=>api.changePresentation({frame:'blanco',surfaces:'paraiso'}),false,23);
   button('Use shared finish',40,915,900,60,api.clearFinishOverride);
   text('Colors and textures are approximate previews.',40,1030,24);text('Exact samples / board stock: check supplier.',40,1070,24);
  }else if(page==='Objects'){
   const e=api.editor,o=e.current();if(o){
    text(o.label.slice(0,46),40,245,27);button('Previous',40,275,440,60,()=>e.select(e.index()-1));button('Next',500,275,440,60,()=>e.select(e.index()+1));
    slider('East / west offset',o.x*100,-400,400,1,value=>e.change({x:value/100}),405);
    slider('Height offset',o.y*100,-250,250,1,value=>e.change({y:value/100}),525);
    slider('South / north offset',o.z*100,-400,400,1,value=>e.change({z:value/100}),645);
    slider('Rotation',o.yaw*180/Math.PI,-180,180,5,value=>e.change({yaw:value*Math.PI/180}),765,'degrees');
    button('Object: '+(o.visible?'VISIBLE':'HIDDEN'),40,875,440,65,()=>e.change({visible:!o.visible}));button('Reset object',500,875,440,65,()=>e.reset());
    button('Chairs: '+(e.chairs()?'VISIBLE':'HIDDEN'),40,975,440,65,()=>e.hideChairs(!e.chairs()));button('Reset all objects',500,975,440,65,api.resetObjects);text('Hold grip to move · Release to save.',40,1080,24);
   }
  }else if(page==='Lighting'){
   const l=api.lighting();for(const [i,[key,preset]]of Object.entries(api.lightPresets).entries())button(preset.label,40+(i%2)*460,235+Math.floor(i/2)*64,440,52,()=>api.applyLightPreset(key),l.preset===key,24);
   button('PBR: '+(api.pbr()?'ON':'OFF'),40,515,440,60,()=>api.setPBR(!api.pbr()));button('Shadows: '+(l.shadows?'ON':'OFF'),500,515,440,60,()=>api.setLighting({shadows:!l.shadows}));
   slider('All lights brightness',l.power*100,0,180,5,value=>api.setLighting({power:value/100}),630,'%');
   slider('Exposure',l.exposure*100,20,200,5,value=>api.setLighting({exposure:value/100}),750,'%');
   button('Ceiling: '+(api.ceiling()?'ON':'OFF'),40,860,900,60,api.toggleCeiling);button('Reset lighting to studio',40,950,900,60,api.resetLighting);
   text('Use RGB tab for colors and sync.',40,1070,24);
  }else if(page==='RGB'){
   const l=api.lighting();for(const [i,[zone,name]]of [['pc','PC'],['shelves','Shelves'],['room','Room']].entries())button(name,40+i*310,235,290,60,()=>{rgbZone=zone;draw()},rgbZone===zone);
   const key=rgbZone==='pc'||(rgbZone==='shelves'&&l.sync)?'pcColor':rgbZone==='shelves'?'shelfColor':'roomColor',color=l[key];
   for(const [i,name]of ['Blue','Mint','Lime','Amber','Red','Pink','Purple','White'].entries()){const x=40+(i%4)*230,y=335+Math.floor(i/4)*75;button(name,x,y,210,55,()=>api.setLighting({[key]:api.palette[i]}),color===api.palette[i]);ctx.fillStyle=api.palette[i];ctx.fillRect(x+170,y+10,25,35)}
   for(const [i,label]of ['Red','Green','Blue'].entries()){const value=parseInt(color.slice(1+i*2,3+i*2),16);slider(label,value,0,255,1,value=>{const channels=[0,1,2].map(j=>parseInt(color.slice(1+j*2,3+j*2),16));channels[i]=value;api.setLighting({[key]:'#'+channels.map(c=>c.toString(16).padStart(2,'0')).join('')})},490+i*90,'')}
   slider('Selected lights brightness',l[rgbZone]*100,0,150,5,value=>api.setLighting({[rgbZone]:value/100}),765,'%');
   const effects=Object.keys(api.effects||{static:'Static'}),effect=l.effect||'static';button('Effect: '+(api.effects?.[effect]||effect),40,860,900,60,()=>api.setLighting({effect:effects[(effects.indexOf(effect)+1)%effects.length]}));
   slider('Animation speed',(l.effectSpeed||1)*100,10,300,10,value=>api.setLighting({effectSpeed:value/100}),970,'%');
   button('Sync: '+(l.sync?'ON':'OFF'),40,1060,440,60,()=>api.setLighting({sync:!l.sync}));button(l.effectPaused?'Resume animation':'Pause animation',500,1060,440,60,()=>api.setLighting({effectPaused:!l.effectPaused}));
  }else if(page==='Screens'){
   const screens=api.screens,s=screens.current();for(const [i,e]of screens.list().entries())button(e.label,40+(i%2)*460,235+Math.floor(i/2)*70,440,60,()=>screens.select(e.id),s.id===e.id,25);
   for(const [i,[key,name]]of Object.entries(api.screenContent).entries())button(name,40+(i%2)*460,405+Math.floor(i/2)*65,440,55,()=>{api.setPBR(true);screens.change({content:key})},s.content===key,23);
   slider('Screen brightness',s.brightness*100,0,150,5,value=>{api.setPBR(true);screens.change({brightness:value/100})},820,'%');
   button('Screen light: '+(s.glow?'ON':'OFF'),40,935,900,60,()=>{api.setPBR(true);screens.change({glow:!s.glow})});
   text('Upload your own image on desktop.',40,1050,26);text('The screen light follows its image.',40,1090,25);
  }else{
   for(const [i,[key,label]]of [['glass','Glass doors'],['lighting','Cabinet LEDs'],['storage','Side drawers'],['upper','Upper display'],['backPanels','PC + music back panels'],['sidePanels','Desk side panels']].entries())button(label+': '+(c[key]?'ON':'OFF'),40,230+i*90,900,65,()=>api.configure({[key]:!c[key]}));
   button('Open / close piano tray',40,820,900,65,api.piano);button('Open / close glass doors',40,905,900,65,api.doors);button('Open / close storage',40,990,900,65,api.drawers);
  }
  text('Left stick: walk · Right stick: smooth turn',40,1150,25,'#94bcb1');text('Grip: move objects · B / Y: show controls',40,1195,25,'#94bcb1');texture.needsUpdate=true;
 }
 function place(head,forward){const f=forward.clone();f.y=0;if(f.lengthSq()<.01)f.set(0,0,-1);f.normalize();const right=new T.Vector3().crossVectors(f,new T.Vector3(0,1,0));mesh.position.copy(head).addScaledVector(f,.95).addScaledVector(right,-.40);mesh.position.y=head.y-.10;mesh.lookAt(head.x,mesh.position.y,head.z);mesh.visible=true;draw()}
 function click(ray){if(!mesh.visible)return false;const hit=ray.intersectObject(mesh)[0];if(!hit?.uv)return false;const x=hit.uv.x*W,y=(1-hit.uv.y)*H,target=targets.find(t=>x>=t.x&&x<=t.x+t.w&&y>=t.y&&y<=t.y+t.h);target?.action((x-target.x)/target.w);draw();return true}
 draw();return {mesh,refresh:draw,place,click,isEditingObjects:()=>mesh.visible&&page==='Objects',hide(){mesh.visible=false}};
}




