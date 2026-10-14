import * as T from 'three';
import {createVRSessionButton,positionRigAtStart} from './vr-session.js';
const status=document.querySelector('#status'),renderer=new T.WebGLRenderer({antialias:true});
renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.xr.enabled=true;renderer.xr.setFramebufferScaleFactor(1);document.body.append(renderer.domElement);
const scene=new T.Scene();scene.background=new T.Color('#315986');scene.add(new T.GridHelper(20,20,'#bce3f0','#6389aa'));
const camera=new T.PerspectiveCamera(60,innerWidth/innerHeight,.05,100),rig=new T.Group();rig.add(camera);scene.add(rig);camera.position.set(0,1.6,2.88);
for(let i=0;i<3;i++){const cube=new T.Mesh(new T.BoxGeometry(.45,.45,.45),new T.MeshBasicMaterial({color:['#ff6464','#77ff99','#ffd65c'][i]}));cube.position.set((i-1)*.9,1.35,.6);scene.add(cube)}
const button=createVRSessionButton(renderer,event=>status.textContent=event.state+(event.error?' · '+event.error:''));document.body.append(button);
let recenter=false,frames=0,tracked=0,lastStatus=0;
renderer.xr.addEventListener('sessionstart',()=>{camera.position.set(0,0,0);recenter=true;frames=tracked=0});
renderer.xr.addEventListener('sessionend',()=>{rig.position.set(0,0,0);rig.rotation.set(0,0,0);camera.position.set(0,1.6,2.88)});
renderer.setAnimationLoop((time,frame)=>{if(renderer.xr.isPresenting){frames++;const pose=frame?.getViewerPose(renderer.xr.getReferenceSpace());if(pose){tracked++;if(recenter){positionRigAtStart(rig,pose,T);recenter=false}}if(time-lastStatus>1000){lastStatus=time;status.textContent='VR frames '+frames+' · tracked '+tracked+' · eyes '+(pose?.views.length||0)+' · '+renderer.xr.getSession().visibilityState}}renderer.render(scene,camera)});
window.addEventListener('error',e=>status.textContent='Test error: '+e.message);window.addEventListener('unhandledrejection',e=>status.textContent='Test error: '+(e.reason?.message||e.reason));window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
