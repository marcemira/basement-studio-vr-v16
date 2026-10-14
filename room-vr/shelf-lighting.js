import * as T from './vendor/three.module.js';
import {rgbFrame} from './rgb-effects.js';
export function tagShelfLED(mesh,{depth=.32,range=.65,power=1.6,shift=0}={}){mesh.name='Downward shelf LED strip';mesh.userData.shelfLED={depth,range,power,shift};return mesh}
const MAX=64,GRID=8,TILE=256;
export function createShelfLighting(scene,root,renderer,state){
 const atlas=new T.WebGLRenderTarget(GRID*TILE,GRID*TILE,{minFilter:T.NearestFilter,magFilter:T.NearestFilter,depthBuffer:true});atlas.texture.name='Shelf occlusion atlas';atlas.texture.generateMipmaps=false;
 const uniforms={shelfAtlas:{value:atlas.texture},shelfCount:{value:0},shelfPos:{value:Array.from({length:MAX},()=>new T.Vector4())},shelfAxis:{value:Array.from({length:MAX},()=>new T.Vector4())},shelfColor:{value:Array.from({length:MAX},()=>new T.Color(0,0,0))},shelfShadows:{value:1}};
 const depth=new T.ShaderMaterial({uniforms:{sourceY:{value:0},sourceRange:{value:1}},vertexShader:'varying float worldY;void main(){vec4 p=modelMatrix*vec4(position,1.0);worldY=p.y;gl_Position=projectionMatrix*viewMatrix*p;}',fragmentShader:'#include <packing>\nuniform float sourceY;uniform float sourceRange;varying float worldY;void main(){gl_FragColor=packDepthToRGBA(clamp((sourceY-worldY)/sourceRange,0.0,1.0));}',side:T.DoubleSide});
 const camera=new T.OrthographicCamera(),hooked=new WeakSet();let strips=[],dirty=true,again=false,tiles=[],clock=0,lastTick=null,renderedTiles=0;
 function hook(material){if(!material?.isMeshStandardMaterial||hooked.has(material))return;hooked.add(material);const original=material.onBeforeCompile.bind(material),key=material.customProgramCacheKey.bind(material);material.onBeforeCompile=shader=>{original(shader);Object.assign(shader.uniforms,uniforms);shader.vertexShader='varying vec3 shelfWorldPosition;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nshelfWorldPosition=(modelMatrix*vec4(transformed,1.0)).xyz;');shader.fragmentShader=`
 varying vec3 shelfWorldPosition;
 uniform sampler2D shelfAtlas;
 uniform int shelfCount;
 uniform vec4 shelfPos[${MAX}];
 uniform vec4 shelfAxis[${MAX}];
 uniform vec3 shelfColor[${MAX}];
 uniform float shelfShadows;
 float unpackRGBAToDepth(const in vec4 v);
 float shelfVisibility(int i,vec2 uv,float depthValue){
  if(shelfShadows<.5)return 1.0;
  vec2 tile=vec2(float(i%${GRID}),float(i/${GRID}));
  vec2 low=(tile+vec2(.5/${TILE}.0))/${GRID}.0;
  vec2 high=(tile+vec2(1.0-.5/${TILE}.0))/${GRID}.0;
  vec2 p=(tile+uv)/${GRID}.0;float visible=0.0;
  for(int x=0;x<2;x++)for(int y=0;y<2;y++){
   vec2 q=clamp(p+(vec2(float(x),float(y))-.5)/${GRID*TILE}.0,low,high);
   visible+=step(depthValue-.0015,unpackRGBAToDepth(texture2D(shelfAtlas,q)));
  }return visible*.25;
 }
 `+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_maps>',T.ShaderChunk.lights_fragment_maps.replace('iblIrradiance += getIBLIrradiance( geometryNormal );','iblIrradiance += getIBLIrradiance( geometryNormal ) * .08;'));shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
 for(int i=0;i<${MAX};i++){
  if(i>=shelfCount)break;
  vec3 delta=shelfWorldPosition-shelfPos[i].xyz;float below=-delta.y;
  if(below<=.003||below>=shelfPos[i].w)continue;
  float shift=length(shelfAxis[i].xy)-1.0;vec2 axis=normalize(shelfAxis[i].xy);vec2 across=vec2(axis.y,-axis.x);
  float along=dot(delta.xz,axis),crossAxis=dot(delta.xz,across)-shift;
  float halfWidth=shelfAxis[i].z,halfDepth=shelfAxis[i].w;
  if(abs(along)>=halfWidth||abs(crossAxis)>=halfDepth)continue;
  vec2 uv=vec2(along/halfWidth,crossAxis/halfDepth)*.5+.5;
  float visibility=shelfVisibility(i,uv,below/shelfPos[i].w);
  if(visibility<=0.0)continue;
  float sourceAlong=clamp(along,-halfWidth+.012,halfWidth-.012);
  vec3 source=shelfPos[i].xyz+vec3(axis.x,0.0,axis.y)*sourceAlong;
  vec3 L=source-shelfWorldPosition;float d2=max(dot(L,L),.012);
  float edge=1.0-smoothstep(.72,1.0,max(abs(along)/halfWidth,abs(crossAxis)/halfDepth));
  float falloff=1.0-smoothstep(.92,1.0,below/shelfPos[i].w);
  IncidentLight stripLight;stripLight.direction=normalize(mat3(viewMatrix)*L);
  stripLight.color=shelfColor[i]*visibility*edge*falloff*.12/d2;stripLight.visible=true;
  RE_Direct(stripLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
 }
 `);};material.customProgramCacheKey=()=>key()+'-shelf-atlas-v14';material.needsUpdate=true;}
 function refresh(){strips=[];root.updateMatrixWorld(true);root.traverse(o=>{if(o.userData.shelfLED)strips.push(o);if(o.isMesh)for(const m of (Array.isArray(o.material)?o.material:[o.material]))hook(m)});if(strips.length>MAX)throw new Error('Shelf LED limit exceeded');uniforms.shelfCount.value=strips.length;for(const [i,o]of strips.entries()){o.geometry.computeBoundingBox();const size=o.geometry.boundingBox.getSize(new T.Vector3()),alongX=size.x>=size.z,axis=new T.Vector3(alongX?1:0,0,alongX?0:1).transformDirection(o.matrixWorld);const p=o.getWorldPosition(new T.Vector3());p.y-=size.y/2+.003;uniforms.shelfPos.value[i].set(p.x,p.y,p.z,o.userData.shelfLED.range);uniforms.shelfAxis.value[i].set(axis.x*(1+o.userData.shelfLED.shift),axis.z*(1+o.userData.shelfLED.shift),Math.max(size.x,size.z)/2,o.userData.shelfLED.depth/2);o.castShadow=false;o.userData.stripIndex=i}tiles=strips.map((_,i)=>i);dirty=true;tick(performance.now());}
 function invalidate(){if(dirty){again=true}else{tiles=strips.map((_,i)=>i);dirty=true}}
 function tick(time=performance.now()){const dt=lastTick===null?0:Math.max(0,Math.min(100,time-lastTick));lastTick=time;if(!state.effectPaused)clock+=dt;uniforms.shelfShadows.value=state.shadows?1:0;for(const [i,o]of strips.entries()){let visible=true;for(let p=o;p;p=p.parent)if(!p.visible){visible=false;break}const f=rgbFrame(state,'shelves',clock,i*.12),power=state.shelves*state.power*f.gain*o.userData.shelfLED.power*(visible?1:0);uniforms.shelfColor.value[i].copy(f.color).multiplyScalar(power);o.material.color.copy(f.color);o.material.emissive.copy(f.color);o.material.emissiveIntensity=1.3*state.shelves*state.power*f.gain*(visible?1:0)}}
 function renderShadows(){if(!dirty||!state.shadows)return;const target=renderer.getRenderTarget(),viewport=renderer.getViewport(new T.Vector4()),scissor=renderer.getScissor(new T.Vector4()),scissorTest=renderer.getScissorTest(),clear=renderer.getClearColor(new T.Color()),alpha=renderer.getClearAlpha(),xr=renderer.xr.enabled,shadows=renderer.shadowMap.enabled,auto=renderer.autoClear,background=scene.background,override=scene.overrideMaterial;const hidden=[];scene.traverse(o=>{if(o.isMesh&&o.visible&&(!o.castShadow||o.material?.transparent)){hidden.push(o);o.visible=false}});try{renderer.xr.enabled=false;renderer.shadowMap.enabled=false;renderer.autoClear=false;scene.background=null;scene.overrideMaterial=depth;renderer.setRenderTarget(atlas);renderer.setScissorTest(true);renderer.setClearColor('#ffffff',1);
  // Update a small number of tiles per frame to keep VR responsive.
  for(let n=0;n<3&&tiles.length;n++){const i=tiles.shift(),p=uniforms.shelfPos.value[i],a=uniforms.shelfAxis.value[i];const tileX=(i%GRID)*TILE,tileY=Math.floor(i/GRID)*TILE,ratio=renderer.getPixelRatio();renderer.setViewport(tileX/ratio,tileY/ratio,TILE/ratio,TILE/ratio);renderer.setScissor(tileX/ratio,tileY/ratio,TILE/ratio,TILE/ratio);renderer.clear(true,true,false);camera.left=-a.z;camera.right=a.z;camera.top=a.w;camera.bottom=-a.w;camera.near=.001;camera.far=p.w;const scale=Math.hypot(a.x,a.y),shift=scale-1,cx=p.x+a.y/scale*shift,cz=p.z-a.x/scale*shift;camera.position.set(cx,p.y,cz);camera.up.set(a.y/scale,0,-a.x/scale);camera.lookAt(cx,p.y-1,cz);camera.updateProjectionMatrix();camera.updateMatrixWorld(true);depth.uniforms.sourceY.value=p.y;depth.uniforms.sourceRange.value=p.w;renderer.render(scene,camera);renderedTiles++}dirty=tiles.length>0;
 }finally{if(!dirty&&again){tiles=strips.map((_,i)=>i);dirty=true;again=false}for(const o of hidden)o.visible=true;scene.background=background;scene.overrideMaterial=override;renderer.xr.enabled=xr;renderer.shadowMap.enabled=shadows;renderer.autoClear=auto;renderer.setRenderTarget(target);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);renderer.setClearColor(clear,alpha)}}
 function exportLights(exportRoot=root){const lights=[];const exported=new Map();exportRoot.traverse(o=>{if(o.userData.shelfLED)exported.set(o.userData.stripIndex,o)});for(const [i,o]of strips.entries()){const color=uniforms.shelfColor.value[i].clone(),peak=Math.max(color.r,color.g,color.b);if(peak>0)color.multiplyScalar(1/peak);const light=new T.SpotLight(color,peak*Math.max(o.geometry.boundingBox.getSize(new T.Vector3()).x,o.geometry.boundingBox.getSize(new T.Vector3()).z)*2,o.userData.shelfLED.range,Math.PI/3,.8,2);light.name='Shelf LED '+(i+1)+' — downward export light';light.rotation.x=-Math.PI/2;light.position.y=-.008;light.target.position.set(0,0,-1);light.add(light.target);light.userData.lightZone='shelves';exported.get(i)?.add(light);lights.push(light)}return ()=>lights.forEach(l=>l.removeFromParent())}
 refresh();return {refresh,tick,invalidate,renderShadows,exportLights,diagnostics:()=>({strips:strips.length,pendingTiles:tiles.length,renderedTiles,atlasSize:GRID*TILE}),dispose(){atlas.dispose();depth.dispose()}};
}



