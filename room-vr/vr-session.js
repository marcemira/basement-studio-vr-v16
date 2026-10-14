// Conservative WebXR startup: baseline WebGL layer, explicit reference-space fallback,
// and visible errors rather than an unhandled rejected session setup promise.
export function createVRSessionButton(renderer,report=()=>{}){
 const button=document.createElement('button');button.id='VRButton';button.textContent='CHECKING VR…';button.disabled=true;
 let active=null;
 const say=(state,extra={})=>report({state,...extra});
 renderer.xr.addEventListener('sessionend',()=>{active=null;button.disabled=false;button.textContent='ENTER VR';say('VR ended')});
 button.onclick=async()=>{
  if(active){await active.end();return}
  button.disabled=true;button.textContent='STARTING VR…';let session;
  try{
   say('Requesting headset session');
   session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor']});
   let referenceType='local-floor';
   try{await session.requestReferenceSpace(referenceType)}catch{referenceType='local'}
   renderer.xr.setReferenceSpaceType(referenceType);
   say('Preparing headset display',{referenceType,visibility:session.visibilityState});
   session.addEventListener('visibilitychange',()=>say('Headset visibility changed',{visibility:session.visibilityState}));
   await renderer.xr.setSession(session);active=session;button.textContent='EXIT VR';button.disabled=false;
   say('VR started',{referenceType,visibility:session.visibilityState});
  }catch(error){
   say('VR startup failed',{error:error.message,name:error.name});
   if(session)try{await session.end()}catch{}
   active=null;button.disabled=false;button.textContent='RETRY VR';
  }
 };
 if(!navigator.xr){button.textContent='WEBXR NOT AVAILABLE';say('WebXR not available');return button}
 navigator.xr.isSessionSupported('immersive-vr').then(ok=>{button.disabled=!ok;button.textContent=ok?'ENTER VR':'VR NOT SUPPORTED';say(ok?'Headset available':'No immersive VR headset detected')}).catch(error=>{button.textContent='VR CHECK FAILED';say('VR check failed',{error:error.message})});
 return button;
}

// Recenter the first tracked pose so any physical play-space origin starts inside the model.
export function positionRigAtStart(rig,pose,THREE,referenceType='local-floor',start={x:0,z:1.66,eyeHeight:1.78}){
 const {position,orientation}=pose.transform;
 const forward=new THREE.Vector3(0,0,-1).applyQuaternion(new THREE.Quaternion(orientation.x,orientation.y,orientation.z,orientation.w));
 const yaw=Math.atan2(-forward.x,-forward.z);rig.rotation.set(0,-yaw,0);
 const offset=new THREE.Vector3(position.x,position.y,position.z).applyAxisAngle(new THREE.Vector3(0,1,0),-yaw);
 rig.position.set(start.x-offset.x,start.eyeHeight-position.y,start.z-offset.z);rig.updateMatrixWorld(true);
 return {x:position.x,y:position.y,z:position.z,referenceType,eyeHeight:start.eyeHeight,center:[start.x,start.z]};
}
