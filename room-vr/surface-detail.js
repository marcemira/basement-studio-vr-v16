import * as T from './vendor/three.module.js';
import {M} from './geometry.js';
// Deterministic, seamless physical surface maps generated locally; no remote assets.
function noise(kind){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d'),d=ctx.createImageData(256,256);let seed=291;
 for(let y=0;y<256;y++)for(let x=0;x<256;x++){seed=(seed*1664525+1013904223)>>>0;let n=seed/4294967296,v=kind==='fabric'?110+((x%4===0||y%4===0)?-40:35)+n*25:kind==='metal'?140+Math.sin(y*Math.PI/2)*24+n*12:155+n*45;const i=(y*256+x)*4;d.data[i]=d.data[i+1]=d.data[i+2]=v;d.data[i+3]=255}ctx.putImageData(d,0,0);const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(8,8);t.userData.sharedSurface=true;return t}
export function addSurfaceDetail(root){const paint=noise('paint'),metal=noise('metal'),fabric=noise('fabric');
 for(const m of [M.graphite,M.light,M.black,M.cream,M.white]){m.bumpMap=paint;m.bumpScale=.00025;m.envMapIntensity=.55;m.needsUpdate=true}
 for(const m of [M.metal,M.silver]){m.bumpMap=metal;m.bumpScale=.00012;m.roughnessMap=metal;m.envMapIntensity=.85;m.needsUpdate=true}
 M.textile.bumpMap=fabric;M.textile.bumpScale=.0007;M.textile.roughness=1;M.textile.needsUpdate=true;M.glass.roughness=.08;M.glass.ior=1.5;M.glass.envMapIntensity=.9;
 root.traverse(o=>{if(!o.isMesh)return;const m=o.material;if(!m?.isMeshStandardMaterial||Object.values(M).includes(m))return;
 if(o.parent?.name.includes('chair')){m.bumpMap=fabric;m.bumpScale=.001;m.roughness=.92}
 else if(m.map&&o.name==='Parquet floor'){m.bumpMap=m.map;m.bumpScale=.0015;m.roughness=.48;m.envMapIntensity=.35}
 else if(!m.map){m.bumpMap=paint;m.bumpScale=.0002}m.needsUpdate=true});
 return {paint,metal,fabric};}
export function createStudioEnvironment(renderer,lights=null){const l=lights||{reflection:1,room:1,pc:.2,shelves:.2,power:1,roomColor:'#fff2dc',pcColor:'#b8e4ff',shelfColor:'#ffd8ae',sync:false};const fill=l.reflection*l.power;const scene=new T.Scene();scene.background=new T.Color('#50565b').multiplyScalar(fill);const room=new T.Mesh(new T.BoxGeometry(12,8,12),new T.MeshBasicMaterial({color:new T.Color('#555c61').multiplyScalar(fill),side:T.BackSide}));scene.add(room);
 for(const [x,y,z,w,h,color,intensity]of [[0,3.95,0,5,3,l.roomColor,l.room*l.power*2],[...(l.pcDirection||[-5.9,0,1]),1,1,l.pcColor,l.pc*l.power*2],[0,1,-5.9,3,.5,l.sync?l.pcColor:l.shelfColor,l.shelves*l.power*2]]){const p=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(color).multiplyScalar(intensity),side:T.DoubleSide}));p.position.set(x,y,z);p.lookAt(0,0,0);scene.add(p)}
 for(const screen of l.screens||[]){const p=new T.Mesh(new T.PlaneGeometry(1,.6),new T.MeshBasicMaterial({color:new T.Color(screen.color).multiplyScalar(screen.intensity),side:T.DoubleSide}));p.position.fromArray(screen.direction);p.lookAt(0,0,0);scene.add(p)}
 const pmrem=new T.PMREMGenerator(renderer),target=pmrem.fromScene(scene,.03,.1,30);pmrem.dispose();scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});return target;
}



