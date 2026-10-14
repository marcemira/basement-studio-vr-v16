import * as T from './vendor/three.module.js';
const editable=/^(Ultrawide monitor|32-inch studio monitor|\d+-inch television|Nearfield studio monitor|Vintage stereo speaker|17-inch CRT monitor|1995 workstation hardware|Streaming microphone and boom|Face light|MacBook on vertical stand|HYTE Y60|Gaming office chair|Music stool|Retro PC seat|Gaming accent light|Retro warm light|Recessed ceiling luminaire|Studio task lamp|Famicom \/ NES|Super Famicom|Nintendo 64|GameCube|Wii$|Mega Drive|Sega Saturn|Dreamcast|PlayStation|Xbox One|Roland |88-key keyboard|1995 beige PC tower|Computer keyboard$|Mouse$|Collectible display figure)/;
export function createObjectEditor(root,onChange=()=>{}){
 const settings={};let items=[],selected=0,chairs=true;
 function refresh(){const previous=items[selected]?.id;const counts={};items=[];root.traverse(o=>{if(!editable.test(o.name))return; // Retro hardware moves together; its CRT and speakers remain individually adjustable.
  const name=o.name.replace(/^\d+-inch television$/,'Television'),n=(counts[name]||0)+1;counts[name]=n;const id=o.userData.editorKey||name+' '+n;
  o.userData.editorBase||={p:o.position.toArray(),r:o.rotation.y};items.push({id,label:name+(n>1?' '+n:''),object:o});
 });const oldIndex=items.findIndex(i=>i.id===previous);selected=oldIndex>=0?oldIndex:Math.min(selected,Math.max(0,items.length-1));apply();if(previous)onChange();}
 function state(item){return settings[item.id]||{x:0,y:0,z:0,yaw:0,visible:true}}
 function apply(){for(const item of items){const o=item.object,b=o.userData.editorBase,s=state(item);o.position.fromArray(b.p); // Translate in room axes even when a desk or corner is rotated.
  o.parent.updateWorldMatrix(true,false);const delta=new T.Vector3(s.x,s.y,s.z).applyQuaternion(o.parent.getWorldQuaternion(new T.Quaternion()).invert());o.position.add(delta);o.rotation.y=b.r+s.yaw;o.visible=s.visible&&(chairs||!/chair|stool|seat/i.test(o.name));}root.updateMatrixWorld(true);}
 function current(){const item=items[selected];return item?{id:item.id,label:item.label,...state(item)}:null}
 function change(patch){const item=items[selected];if(!item)return;settings[item.id]={...state(item),...patch};apply();onChange();}
 function select(value){selected=typeof value==='string'?Math.max(0,items.findIndex(i=>i.id===value)):(value+items.length)%items.length;onChange();}
 function hideChairs(value){chairs=value;apply();onChange();}
 function restore(data){for(const key of Object.keys(settings))delete settings[key];for(const [id,s]of Object.entries(data?.objects||{})){settings[id]={x:T.MathUtils.clamp(Number(s.x)||0,-4,4),y:T.MathUtils.clamp(Number(s.y)||0,-2.5,2.5),z:T.MathUtils.clamp(Number(s.z)||0,-4,4),yaw:T.MathUtils.clamp(Number(s.yaw)||0,-Math.PI,Math.PI),visible:s.visible!==false}}chairs=data?.chairs!==false;apply();onChange()}
 function resolve(object){for(let o=object;o&&o!==root;o=o.parent){const item=items.find(i=>i.object===o);if(item)return item}return null}
 function pick(object){const item=resolve(object);if(!item)return false;select(item.id);return true}
 function placeWorld(id,position,worldYaw){const item=items.find(i=>i.id===id);if(!item)return;const o=item.object,b=o.userData.editorBase;o.parent.updateWorldMatrix(true,false);const q=o.parent.getWorldQuaternion(new T.Quaternion()),local=o.parent.worldToLocal(position.clone()),delta=local.sub(new T.Vector3(...b.p)).applyQuaternion(q),f=new T.Vector3(0,0,-1).applyQuaternion(q),parentYaw=Math.atan2(-f.x,-f.z),yaw=T.MathUtils.euclideanModulo(worldYaw-parentYaw-b.r+Math.PI,Math.PI*2)-Math.PI;settings[id]={...state(item),x:T.MathUtils.clamp(delta.x,-4,4),y:T.MathUtils.clamp(delta.y,-2.5,2.5),z:T.MathUtils.clamp(delta.z,-4,4),yaw};apply();}
 refresh();return {refresh,current,change,select,pick,resolve,placeWorld,commit:onChange,hideChairs,restore,list:()=>items.map(({id,label})=>({id,label})),index:()=>selected,chairs:()=>chairs,resetAll(){for(const id of Object.keys(settings))delete settings[id];chairs=true;apply();onChange()},reset(){const item=items[selected];if(item)delete settings[item.id];apply();onChange()},serialize:()=>({chairs,objects:structuredClone(settings)})};
}


