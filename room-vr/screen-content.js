import * as T from './vendor/three.module.js';
export const SCREEN_CONTENT={original:'Original screen',off:'Screen off',landscape:'Mountain wallpaper',daw:'Music arrangement',crt:'Retro desktop',retro:'Animated retro game',aurora:'Animated aurora',bars:'Color bars',white:'White screen',image:'My image'};
export function averageScreen(data,brightness=1){
 const rgb=[0,0,0];let n=0;
 for(let i=0;i<data.length;i+=4){if(data[i+3]===0)continue;for(let j=0;j<3;j++){const c=data[i+j]/255;rgb[j]+=(c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4))*brightness}n++}
 if(n)for(let j=0;j<3;j++)rgb[j]/=n;
 const peak=Math.max(...rgb),color=new T.Color().setRGB(...rgb);
 return {color:peak>0?color.clone().multiplyScalar(1/peak):new T.Color(0,0,0),peak,luminance:.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2],rgb};
}
export function createScreenContent(root,onChange=()=>{},onReflections=()=>{}){
 let entries=[],selected='gaming',lastUpdate=-Infinity,lastReflection=-Infinity;const settings={},images=new Map();
 const sample=document.createElement('canvas');sample.width=16;sample.height=9;const sampleCtx=sample.getContext('2d',{willReadFrequently:true});
 function idFor(o){return /CRT/.test(o.parent.name)?'retro':/studio monitor/.test(o.parent.name)?'music':/Ultrawide/.test(o.parent.name)?'gaming':'tv'}
 function config(id){return settings[id]??=( {content:'original',brightness:1,glow:true} )}
 function refresh(){
  const old=entries;entries=[];root.traverse(o=>{if(!o.isMesh||!o.material?.userData.screenMode)return;const id=idFor(o),retained=old.find(e=>e.mesh===o);if(retained){entries.push(retained);return}
   const canvas=document.createElement('canvas');canvas.width=768;canvas.height=432;const ctx=canvas.getContext('2d');const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
   const original=o.material.map,material=o.material;material.userData={...material.userData,screenManaged:true};o.castShadow=false;o.receiveShadow=false;
   o.geometry.computeBoundingBox();const bounds=o.geometry.boundingBox,size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3());
   const light=new T.SpotLight('#ffffff',0,3.8,Math.PI*.40,.85,2);light.name=id+' screen illumination';light.userData.lightZone='screen';light.position.copy(center);light.position.z=bounds.max.z+.045;light.rotation.y=Math.PI;light.target.position.set(0,0,-1);light.add(light.target);o.add(light);
   light.castShadow=id==='tv';light.shadow.mapSize.set(512,512);light.shadow.camera.near=.03;light.shadow.bias=-.0002;light.shadow.normalBias=.004;
   entries.push({id,mesh:o,material,original,canvas,ctx,texture,light,area:size.x*size.y,average:{color:new T.Color(),luminance:0}});config(id);
  });for(const e of old)if(!entries.includes(e)){e.texture.dispose();e.original.dispose();e.material.dispose();e.light.shadow.dispose();e.light.removeFromParent();e.light.target.removeFromParent()}
  tick(performance.now(),true);onChange();
 }
 function draw(e,mode,time){const c=e.ctx,W=e.canvas.width,H=e.canvas.height,t=time*.001;c.fillStyle='#000000';c.fillRect(0,0,W,H);
  if(mode==='off')return;
  if(mode==='image'){const image=images.get(config(e.id).image);if(image?.complete&&image.naturalWidth){const scale=Math.min(W/image.naturalWidth,H/image.naturalHeight),w=image.naturalWidth*scale,h=image.naturalHeight*scale;c.drawImage(image,(W-w)/2,(H-h)/2,w,h)}return}
  if(mode==='white'){c.fillStyle='#ffffff';c.fillRect(0,0,W,H);return}
  if(mode==='bars'){['#ffffff','#ffff00','#00ffff','#00ff00','#ff00ff','#ff0000','#0000ff'].forEach((color,i)=>{c.fillStyle=color;c.fillRect(i*W/7,0,W/7+1,H)});return}
  if(mode==='aurora'){const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,`hsl(${(t*25)%360} 85% 38%)`);g.addColorStop(.5,`hsl(${(t*25+90)%360} 95% 60%)`);g.addColorStop(1,'#070f28');c.fillStyle=g;c.fillRect(0,0,W,H);for(let i=0;i<6;i++){c.strokeStyle=`hsla(${(t*25+i*25)%360} 100% 75% / .5)`;c.lineWidth=25;c.beginPath();for(let x=0;x<=W;x+=12){const y=H*.5+Math.sin(x*.008+t+i*.4)*H*.28+i*15;x?c.lineTo(x,y):c.moveTo(x,y)}c.stroke()}return}
  if(mode==='retro'){c.fillStyle='#15387c';c.fillRect(0,0,W,H);for(let i=0;i<20;i++){const x=((i*137-t*55)%W+W)%W;c.fillStyle='#ffffbc';c.fillRect(x,40+(i*37)%200,3,3)}c.fillStyle='#28b562';c.fillRect(0,320,W,112);c.fillStyle='#8e573d';c.fillRect(0,350,W,82);c.fillStyle='#ffd148';for(let i=0;i<8;i++)c.fillRect(((i*150-t*100)%W+W)%W,240,16,22);const y=285-Math.max(0,Math.sin(t*3))*65;c.fillStyle='#ff5066';c.fillRect(260,y,30,30);c.fillStyle='#f8d7ac';c.fillRect(266,y+6,18,12);c.fillStyle='#fff';c.font='22px monospace';c.fillText('RETRO / STAGE 01     SCORE '+Math.floor(t*10),25,35);return}
  const originalMode=e.material.userData.screenMode;
  // Existing original screen artwork is reused when its content is selected.
  const source=entries.find(item=>item.material.userData.screenMode===mode)?.original.image;
  if(source){c.drawImage(source,0,0,W,H);return}
  if(mode==='landscape'){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#10385d');g.addColorStop(.6,'#f4bd88');g.addColorStop(1,'#123f4b');c.fillStyle=g;c.fillRect(0,0,W,H);for(let j=0;j<4;j++){c.fillStyle=['#638899','#45677b','#274758','#152e40'][j];c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=20)c.lineTo(x,180+j*50+Math.sin(x*.013+j)*55);c.lineTo(W,H);c.fill()}return}
  c.fillStyle=originalMode==='crt'?'#087f7e':'#182833';c.fillRect(0,0,W,H);
 }
 function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true}
 function tick(time=performance.now(),force=false){if(!force&&time-lastUpdate<100)return;lastUpdate=time;
  for(const e of entries){const s=config(e.id),animated=['aurora','retro'].includes(s.content);
   if(force||animated||e.lastContent!==s.content){const previousMap=e.material.map;if(s.content==='original')e.material.map=e.original;else{draw(e,s.content,time);e.texture.needsUpdate=true;e.material.map=e.texture}if(previousMap!==e.material.map)e.material.needsUpdate=true;e.lastContent=s.content}
   e.material.color.setScalar(s.brightness);sampleCtx.clearRect(0,0,16,9);const image=e.material.map.image;sampleCtx.drawImage(image,0,0,16,9);e.average=averageScreen(sampleCtx.getImageData(0,0,16,9).data,s.brightness);e.light.color.copy(e.average.color);e.light.intensity=s.glow&&visible(e.mesh)?e.area*18*e.average.peak:0;
  }
  if(force||time-lastReflection>750){lastReflection=time;const center=new T.Vector3(0,1.2,1.66);onReflections(entries.filter(e=>config(e.id).glow&&visible(e.mesh)).map(e=>({direction:e.mesh.getWorldPosition(new T.Vector3()).sub(center).normalize().multiplyScalar(5.8).toArray(),color:'#'+e.average.color.getHexString(),intensity:e.average.peak*Math.sqrt(e.area)*1.5}))) }
 }
 function loadImage(data){if(!data||images.has(data))return;const image=new Image();images.set(data,image);image.onload=()=>tick(performance.now(),true);image.src=data}
 function change(patch,id=selected){const s=config(id);if(SCREEN_CONTENT[patch.content])s.content=patch.content;if(Number.isFinite(+patch.brightness))s.brightness=T.MathUtils.clamp(+patch.brightness,0,1.5);if(typeof patch.glow==='boolean')s.glow=patch.glow;if(typeof patch.image==='string'&&patch.image.startsWith('data:image/')){s.image=patch.image;loadImage(s.image)}tick(performance.now(),true);onChange()}
 async function importImage(file,id=selected){const image=await createImageBitmap(file);const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=576;const ctx=canvas.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,1024,576);const scale=Math.min(1024/image.width,576/image.height),w=image.width*scale,h=image.height*scale;ctx.drawImage(image,(1024-w)/2,(576-h)/2,w,h);image.close();change({image:canvas.toDataURL('image/jpeg',.85),content:'image'},id)}
 function restore(saved){for(const [id,s]of Object.entries(saved||{}))if(['tv','gaming','music','retro'].includes(id))change(s,id)}
 refresh();return {refresh,tick,change,importImage,restore,select(id){if(entries.some(e=>e.id===id))selected=id;onChange()},current:()=>({id:selected,...config(selected)}),list:()=>entries.map(e=>({id:e.id,label:{gaming:'Gaming ultrawide',music:'Music monitor',retro:'Retro CRT',tv:'Television'}[e.id]})),serialize:()=>JSON.parse(JSON.stringify(settings)),diagnostics:()=>entries.map(e=>({id:e.id,intensity:e.light.intensity,color:e.light.color.getHexString(),content:config(e.id).content}))};
}
