import {tagShelfLED} from './shelf-lighting.js';
import * as T from 'three';
import {M,mat,group,box,cyl,sphere,torus,tube,label,canvasTexture,parquetTexture,footprint,releaseFurniture} from './geometry.js';
import {consoleSpecs,consoleModel,monitor,speaker,computerKeyboard,mouse,piano,laptop,hyte,crt,vintageTower,midiModule,figure,gamepad} from './equipment.js';
import {furniture,buildCabinet,cabinetMetrics} from './cabinet.js';
import {buildEastModule} from './east-module.js';
export {furniture};
export const ROOM={width:3.8,depth:3.32,height:2.5,furnishedDepth:2.5,doorWidth:.8};
export const interactions=[],displayDoors=[],drawers=[],dimensions=new T.Group();
export let ceiling,eastWall,westWall,northWall,gamingLift,pianoTray,roomDoor,carpet,parquet;
export const LAYOUT={gaming:{width:1.8,depth:.8,x:-1.5,z:1.55},cabinet:{width:2.5,depth:.4,x:-.15,z:.2},music:{width:1.5,depth:.5,x:1.65,z:2.0},corner:{front:[[.65,.5],[1.4,1.25]],seat:[.74,1.16],crt:[1.48,.42]},widthAllocation:[.5,2.5,.8]};
export const collisions=[[-1.90,-1.10,.65,2.45],[1.4,1.90,1.25,2.75],[-1.40,1.10,0,.4],[-1.81,-1.53,.09,.37]];
export const cornerFootprint=[[.65,0],[1.9,0],[1.9,1.25],[1.4,1.25],[.65,.5]];
function interact(g,name,axis,closed,open,list){g.userData.action={name,axis,closed,open,value:closed,target:closed};interactions.push(g);list?.push(g);return g}
export function toggle(g,force){let a=g.userData.action;a.target=force===undefined?(a.target===a.closed?a.open:a.closed):force?a.open:a.closed;return a.target===a.open}
export function updateAnimations(dt){let moving=false;for(let g of interactions){let a=g.userData.action;if(Math.abs(a.value-a.target)>.0005)moving=true;a.value=T.MathUtils.damp(a.value,a.target,9,dt);let [kind,axis]=a.axis.split('.');g[kind][axis]=a.value;}return moving}
function led(p,w,x,y,z){box(p,w,.005,.008,x,y,z,M.led,.002);box(p,w+.005,.013,.017,x,y+.006,z,M.metal,.002)}
function books(p,x,y,z,count=12,cd=false){for(let i=0;i<count;i++){let w=cd?.011:.021,h=cd?.135:.18+(i%4)*.014,d=cd?.125:.12;let color=['#667078','#384b54','#8a8171','#7d4444','#464d51','#d3c7a7'][i%6];let g=group(cd?'CD jewel case':'Game cartridge / book',p,x+i*(w+.002),y,z);box(g,w,h,d,0,h/2,0,mat(color),.001);box(g,w*.75,.004,.001,0,h*.8,d/2+.002,M.light);box(g,w*.8,.008,.001,0,h*.2,d/2+.002,M.black);}}
function pedestal(p,x,z,w=.24,d=.54){box(p,w,.60,d,x,.32,z,M.graphite,.012);for(let i=0;i<3;i++){let g=group('Storage drawer',p,x,.13+i*.185,z+.03);box(g,w-.018,.173,d-.045,0,0,0,M.graphite,.007);box(g,w-.045,.015,.018,0,.063,d/2-.015,M.black,.003);interact(g,'Storage drawer','position.z',g.position.z,g.position.z+.25,drawers)}}
const gamingLegs=[];
function deskLeg(p,x,z){box(p,.078,.033,.60,x,.028,z,M.black,.008);box(p,.06,.60,.06,x,.320,z,M.metal,.006);let shaft=box(p,.045,.32,.046,x,.58,z,M.black,.004),brace=box(p,.34,.02,.043,x,.713,z,M.metal,.004);gamingLegs.push({shaft,brace});}
export function setGamingHeight(h){gamingLift.position.y=h;let delta=h-.75;for(let leg of gamingLegs){leg.shaft.scale.y=(.32+delta)/.32;leg.shaft.position.y=.58+delta/2;leg.brace.position.y=.713+delta;}}
let cabinetObject,cabinetLabels,eastModule,workstationObject;
function cabinet(){cabinetObject=buildCabinet(root,furniture,{interact,displayDoors,drawers,displayLights,addLight(g,list){const l=new T.PointLight('#ffe9ce',3.5,2.5,2);l.position.set(0,1.2,furniture.depth/2-.04);g.add(l);list.push(l)}});return cabinetObject}
function refreshCabinetLabels(){if(cabinetLabels){dimensions.remove(cabinetLabels);releaseFurniture(cabinetLabels)}cabinetLabels=group('Configurable cabinet dimensions',dimensions);const c=furniture,m=cabinetMetrics(c);label(cabinetLabels,Math.round(m.width*100)+' × '+Math.round(c.depth*100)+' cm cabinet',1.05,.10, c.cabinetCenter,c.height-.004,c.depth/2,'#b8eee0','#183b38').rotation.x=-Math.PI/2;label(cabinetLabels,Math.round((1.9+m.left)*100)+' + '+Math.round(m.width*100)+' + '+Math.round((1.9-m.right)*100)+' = 380 cm',2.1,.10,0,.02,.54,'#b8eee0','#183b38').rotation.x=-Math.PI/2;}
export function configureFurniture(next){
 Object.assign(furniture,next);furniture.width=T.MathUtils.clamp(Number(furniture.width),1.8,2.1);furniture.depth=T.MathUtils.clamp(Number(furniture.depth),.35,.40);furniture.height=T.MathUtils.clamp(Number(furniture.height),2.3,2.5);furniture.tvInches=Number(furniture.tvInches)===65?65:55;
 furniture.consoleRows=T.MathUtils.clamp(Math.round(Number(furniture.consoleRows)||4),4,6);
 const tvH=furniture.tvInches*.0254*9/Math.sqrt(337),tvW=furniture.tvInches*.0254*16/Math.sqrt(337),inner=Math.max(Math.ceil(16/furniture.consoleRows)*.36,tvW+.062);
 furniture.rightDisplay=furniture.rightDisplay!==false;
 const minTV=.075+furniture.consoleRows*.17+.04+tvH/2,minShelf=minTV+tvH/2+.04;
 furniture.upperRows=T.MathUtils.clamp(Math.round(Number(furniture.upperRows)||1),1,Math.max(1,Math.min(3,Math.floor((furniture.height-.06-Math.max(1.6,minShelf))/.22+1e-8))));
 const maxShelf=furniture.height-.06-furniture.upperRows*.22;
 furniture.upperShelfHeight=T.MathUtils.clamp(Number(furniture.upperShelfHeight)||2,Math.max(1.6,minShelf),maxShelf);
 furniture.tvHeight=T.MathUtils.clamp(Number(furniture.tvHeight)||1.32,minTV,(furniture.upper?furniture.upperShelfHeight:furniture.height-.06)-.04-tvH/2);
 const rightOffset=cabinetMetrics(furniture).right-furniture.cabinetCenter;
 furniture.tvOffset=T.MathUtils.clamp(Number(furniture.tvOffset)||0,-(inner-tvW-.022)/2,(inner-tvW-.022)/2);
 furniture.musicDepth=T.MathUtils.clamp(Number(furniture.musicDepth)||.45,.40,.65);
 furniture.cornerFront=T.MathUtils.clamp(Number(furniture.cornerFront)||.60,.55,1.06);
 furniture.centerCabinet=furniture.centerCabinet!==false;
 if(furniture.centerCabinet)furniture.musicDepth=Math.min(furniture.musicDepth,Math.floor((1.9-rightOffset-.55/Math.SQRT2)*100)/100);
 if(furniture.centerCabinet)furniture.cornerFront=Math.min(furniture.cornerFront,Math.floor((1.9-rightOffset-furniture.musicDepth)*Math.SQRT2*100)/100);
 // Larger unlocked corners move the cabinet only as far east as required, leaving at least 45 cm for the fixed PC.
 const maxReach=3.8-(furniture.width/2+rightOffset)-.45;
 furniture.cornerFront=Math.min(furniture.cornerFront,Math.floor((maxReach-furniture.musicDepth)*Math.SQRT2*100)/100);
 const reach=furniture.musicDepth+furniture.cornerFront/Math.SQRT2;
 furniture.cabinetCenter=furniture.centerCabinet?0:Math.min(0,1.9-reach-rightOffset);
 for(const old of [cabinetObject,eastModule,workstationObject].filter(Boolean)){for(const list of [interactions,displayDoors,drawers,displayLights])for(let i=list.length-1;i>=0;i--){let n=list[i];while(n&&n!==old)n=n.parent;if(n===old)list.splice(i,1)}root.remove(old);releaseFurniture(old)}
 modulePanels.length=0;
 LAYOUT.cabinet={width:cabinetMetrics(furniture).width,depth:furniture.depth,x:(cabinetMetrics(furniture).left+cabinetMetrics(furniture).right)/2,z:furniture.depth/2};
 const {right,left}=cabinetMetrics(furniture);
 LAYOUT.widthAllocation=[left+1.9,right-left,1.9-right];collisions[2]=[left,right,0,furniture.depth];collisions[3]=[-1.9,left,0,.55];
 cabinet();eastModule=buildEastModule(root,furniture,{interact,drawers});workstationObject=buildWorkstations();LAYOUT.eastModule=eastModule.userData;root.userData.furniture={...furniture};refreshCabinetLabels();setModulePanels();return {...furniture};
}
const modulePanels=[];
function setModulePanels(){for(const p of modulePanels)p.visible=p.userData.panelType==='back'?furniture.backPanels:furniture.sidePanels}
const displayLights=[];
export function setDisplayLight(v){M.led.emissiveIntensity=1.8*v;for(let l of displayLights)l.intensity=5*v;}
let root;
export function buildRoom(){root=new T.Group();root.name='Basement Studio — metres';root.userData={units:'metres',room:ROOM,layout:LAYOUT,orientation:'overview: east left, west right, south rear',door:'east wall, z=2.51 to 3.31; bottom-left of overview',equipment:'Approximate representative Japanese models, not manufacturing CAD'};
 // Physical floor, herringbone texture with visible plank joins and grain.
 let floorMat=new T.MeshStandardMaterial({map:parquetTexture(),roughness:.62});parquet=box(root,3.8,.05,3.32,0,-.027,1.66,floorMat);parquet.name='Parquet floor';
 const carpetTx=canvasTexture(256,256,(c,W,H)=>{c.fillStyle='#666a6c';c.fillRect(0,0,W,H);let seed=8;for(let i=0;i<30000;i++){seed=(seed*1664525+1013904223)>>>0;let x=seed%256;seed=(seed*1664525+1013904223)>>>0;let y=seed%256;c.fillStyle=i%2?'#898c8c':'#52585a';c.fillRect(x,y,1,1)}});carpetTx.wrapS=carpetTx.wrapT=T.RepeatWrapping;carpetTx.repeat.set(12,10);carpet=box(root,3.8,.009,3.32,0,.001,1.66,new T.MeshStandardMaterial({map:carpetTx,roughness:1}));carpet.visible=false;carpet.name='Optional carpet';
 const wall=mat('#44494d',.94);box(root,3.94,2.5,.10,0,1.25,-.055,wall);eastWall=group('East wall with 80 cm door',root);box(eastWall,.10,2.5,2.51,-1.955,1.25,1.255,wall);box(eastWall,.10,.43,.8,-1.955,2.285,2.91,wall);box(eastWall,.10,2.5,.01,-1.955,1.25,3.315,wall);westWall=box(root,.10,2.5,3.43,1.955,1.25,1.665,wall);northWall=group('Open north side',root);northWall.visible=false;
 ceiling=group('Dark gray drywall ceiling',root);box(ceiling,3.8,.06,3.32,0,2.53,1.66,mat('#32363b',.95));ceiling.visible=false;
 for(let x of [-.95,.95])for(let z of [.83,2.49]){let g=group('Recessed ceiling luminaire',ceiling,x,2.493,z);cyl(g,.048,.012,0,0,0,M.black);cyl(g,.034,.004,0,-.008,0,M.led);const down=new T.PointLight('#fff0dd',2,3.6,2);down.position.y=-.04;g.add(down);}
 box(root,3.8,.06,.015,0,.03,.014,M.black);box(root,.015,.06,2.50,-1.889,.03,1.25,M.black);box(root,.015,.06,3.32,1.889,.03,1.66,M.black);
 // East door opening is in the additional front 82 cm, clear of gaming furniture.
 for(let z of [2.51,3.31])box(root,.035,2.08,.045,-1.883,1.04,z,M.light,.003);box(root,.036,.045,.85,-1.883,2.07,2.91,M.light,.003);roomDoor=group('East entrance door — 80 cm',root,-1.89,1.025,3.29);box(roomDoor,.035,2.02,.76,0,0,-.38,M.graphite,.006);box(roomDoor,.012,.12,.035,.023,-.11,-.68,M.silver,.004);box(roomDoor,.055,.014,.06,.045,-.1,-.68,M.silver,.004);interact(roomDoor,'Entrance door','rotation.y',0,Math.PI/2);for(let yy of [-.7,.7])cyl(roomDoor,.01,.06,0,yy,0,M.metal,12);
 configureFurniture({});
 // East sit-stand desk, runs 180 cm along the wall, depth 80 cm.
 let gaming=group('East gaming desk — 180 × 80 cm',root,-1.5,0,1.55);gaming.rotation.y=Math.PI/2;gaming.userData.dimensions={width:1.8,depth:.8,height:.75};deskLeg(gaming,-.63,0);deskLeg(gaming,.63,0);gamingLift=group('Liftable gaming desktop',gaming,0,.75,0);box(gamingLift,1.8,.035,.8,0,0,0,M.graphite,.012);box(gamingLift,1.35,.004,.36,-.15,.02,.12,M.black,.01);let arm=group('Ultrawide monitor arm',gamingLift,-.2,.02,-.20);box(arm,.07,.06,.07,0,0,0,M.metal,.005);tube(arm,[[0,0,0],[0,.2,0],[-.10,.28,.06],[0,.35,.08]],.018,M.metal);monitor(gamingLift,.99,.38,-.17,.43,-.16,'landscape',false,true);computerKeyboard(gamingLift,-.21,.023,.12);mouse(gamingLift,.18,.025,.16);tube(gaming,[[-.3,.75,-.35],[-.3,.55,-.37],[-.65,.3,-.38],[-.65,.05,-.38]],.01,M.black);box(gamingLift,.07,.02,.035,.63,-.029,.39,M.black,.004);label(gamingLift,'75',.025,.011,.64,-.029,.409,'#74cad7');
 // Streaming microphone with arm and small face light.
 let mic=group('Streaming microphone and boom',gamingLift,-.62,.018,-.18);tube(mic,[[0,0,0],[0,.31,0],[.19,.44,.07],[.33,.31,.17]],.011,M.metal);box(mic,.012,.014,.06,0,.012,.012,M.silver);let capsule=cyl(mic,.022,.10,.33,.25,.17,M.black,24);capsule.rotation.z=.35;torus(mic,.033,.004,.33,.25,.17,M.metal).rotation.y=Math.PI/2;const faceLight=group('Face light',gamingLift,-.59,.018,-.17);box(faceLight,.10,.145,.015,0,.372,0,M.led,.012);box(faceLight,.012,.30,.012,0,.162,0,M.black,.003);
 // Contemporary chair with five-spoke base, casters, armrests and fabric cushion.
 let chair=group('Gaming office chair',root,-.64,0,1.58);chair.rotation.y=Math.PI/2;cyl(chair,.028,.38,0,.20,0,M.metal);for(let i=0;i<5;i++){let a=i*Math.PI*2/5;let leg=box(chair,.31,.024,.035,Math.cos(a)*.14,.07,Math.sin(a)*.14,M.metal,.008);leg.rotation.y=-a;let wheel=cyl(chair,.03,.04,Math.cos(a)*.28,.036,Math.sin(a)*.28,M.black,16);wheel.rotation.z=Math.PI/2}box(chair,.48,.09,.44,0,.45,0,M.textile,.055);box(chair,.43,.52,.075,0,.77,-.17,mat('#41484b'),.045);box(chair,.27,.14,.065,0,1.10,-.18,M.black,.025);for(let s of [-1,1]){box(chair,.022,.19,.026,s*.28,.56,-.04,M.metal,.005);box(chair,.07,.025,.25,s*.27,.66,-.02,M.black,.009)}for(let i=0;i<16;i++)box(chair,.38,.005,.001,0,.53+i*.029,-.125,M.black);
 for(let x of [-1.89,1.89])for(let z of [1.0,2.25]){let outlet=box(root,.005,.065,.10,x,.21,z,M.light,.003);for(let sz of [-.027,.027])box(root,.008,.019,.015,x>0?x-.004:x+.004,.21,z+sz,M.black,.002)}
 let art=group('East wall acoustic panels — shallow mounting',root,-1.885,0,1.57);art.rotation.y=Math.PI/2;for(let x of [-.60,0,.60])for(let y of [1.58,2.14]){const panel=box(art,.46,.44,.025,x,y,0,M.textile,.010);panel.name='Fabric acoustic panel';for(let i=0;i<15;i++)box(art,.005,.40,.003,x-.21+i*.03,y,.015,M.graphite,.001)}
 let lamp=new T.PointLight('#69cfe0',2.2,2.1,2);lamp.position.set(-1.7,1.11,1.57);lamp.name='Gaming accent light';root.add(lamp);let warm=new T.PointLight('#ffe6c8',3.0,3.1,2);warm.position.set(1.42,1.8,.57);warm.name='Retro warm light';root.add(warm);
 // Dimension overlays, hidden until requested.
 dimensions.name='Dimension annotations';root.add(dimensions);dimensions.visible=false;
 label(dimensions,'180 × 80 cm',.54,.08,-1.5,.773,2.25,'#b8eee0','#183b38').rotation.x=-Math.PI/2;
 label(dimensions,'Fixed PC / UPS',.43,.08,-1.66,.012,.53,'#b8eee0','#183b38').rotation.x=-Math.PI/2;


label(dimensions,'380 cm',1,.15,0,.08,3.24,'#b8eee0','#183b38').rotation.x=-Math.PI/2;let dlabel=label(dimensions,'332 cm',.85,.14,1.82,.08,1.66,'#b8eee0','#183b38');dlabel.rotation.set(-Math.PI/2,0,Math.PI/2);label(dimensions,'250 cm ceiling',.8,.09,0,2.35,.05,'#b8eee0','#183b38');label(dimensions,'80 cm entrance',.60,.07,-1.884,2.16,2.91,'#b8eee0','#183b38').rotation.y=Math.PI/2;let zone=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(-1.88,.01,2.5),new T.Vector3(1.88,.01,2.5)]),new T.LineDashedMaterial({color:'#73cbb3',dashSize:.08,gapSize:.06}));zone.computeLineDistances();dimensions.add(zone);let dl=label(dimensions,'Original 250 cm furnished zone',1.15,.08,0,.012,2.45,'#b8eee0','#183b38');dl.rotation.x=-Math.PI/2;
 setDisplayLight(.7);return root;
}




function buildWorkstations(){
 const c=furniture,d=c.musicDepth,leg=c.cornerFront/Math.SQRT2,reach=d+leg,right=cabinetMetrics(c).right,ax=1.9-reach,bx=1.9-d,end=reach+1.5;
 const centerX=1.9-d/2,centerZ=reach+.75,frontDistance=(reach+d)/Math.SQRT2,crtDistance=.46;
 const seatDistance=frontDistance+.38,seat=[1.9-seatDistance/Math.SQRT2,seatDistance/Math.SQRT2],pc=[1.9-crtDistance/Math.SQRT2,crtDistance/Math.SQRT2];
 LAYOUT.music={width:1.5,depth:d,x:centerX,z:centerZ};LAYOUT.corner={front:[[ax,d],[bx,reach]],seat,crt:pc,reach,diagonalFront:c.cornerFront};
 cornerFootprint.splice(0,cornerFootprint.length,[right,0],[1.9,0],[1.9,reach],[bx,reach],[ax,d],[right,d]);collisions[1]=[bx,1.9,reach,end];
 const modules=group('Connected retro PC and music modules',root);modules.userData={module:'continuous-workstation',deskSurfaceHeight:.806,musicDepth:d,cornerReach:reach,cornerFront:c.cornerFront,shelfLevels:[1.49,1.80,2.11]};
 const music=group('West music desk',modules,centerX,0,centerZ);music.rotation.y=-Math.PI/2;music.userData.module='music';music.userData.dimensions={width:1.5,depth:d,height:.806};music.userData.footprint=[[bx,reach],[1.9,reach],[1.9,end],[bx,end]];
 for(const s of [-1,1])box(music,.045,.75,d-.08,s*.713,.40,0,M.graphite,.006);box(music,1.43,.07,.025,0,.74,-d/2+.02,M.graphite);
 monitor(music,.708,.414,0,1.17,-d/2+.12,'daw',true);speaker(music,-.53,.812,-d/2+.13);speaker(music,.53,.812,-d/2+.13);laptop(music,.66,.812,.065);
 const task=group('Studio task lamp',music,-.65,.812,-d/2+.08);cyl(task,.065,.012,0,.006,0,M.metal);tube(task,[[0,.01,0],[0,.26,0],[.06,.38,.05],[.13,.37,.08]],.008,M.metal);const shade=cyl(task,.052,.04,.13,.35,.08,M.metal);shade.rotation.z=.25;cyl(task,.040,.005,.13,.325,.08,M.led);const taskLight=new T.PointLight('#ffeacb',.55,.9,2);taskLight.position.set(.13,.30,.08);task.add(taskLight);computerKeyboard(music,-.08,.813,d/2-.13,.40);mouse(music,.24,.813,d/2-.10);
 pianoTray=group('Sliding 88-key piano tray',music,0,.55,0);const pianoBoard=box(pianoTray,1.43,.025,.335,0,0,0,M.graphite,.005);pianoBoard.name='88-key sliding tray';pianoBoard.userData.boardModule='music';piano(pianoTray,0,.016,0);for(const s of [-1,1])box(music,.017,.025,.34,s*.718,.57,0,M.silver,.002);interact(pianoTray,'Piano tray','position.z',0,d/2+.05);
 const stool=group('Music stool',modules,bx-.4,0,centerZ+.30);cyl(stool,.18,.055,0,.47,0,M.textile,40);cyl(stool,.022,.42,0,.24,0,M.metal);for(let i=0;i<4;i++){let a=i*Math.PI/2;box(stool,.025,.019,.23,Math.cos(a)*.10,.05,Math.sin(a)*.10,M.metal,.006).rotation.y=a;}
 const corner=group('Retro PC corner module',modules);corner.userData={module:'retro-PC',shelfLevels:[1.49,1.80,2.11],frontAngleDegrees:45,diagonalFrontWidth:c.cornerFront,kneeClearWidth:Math.max(0,c.cornerFront-.08),seat,footprint:cornerFootprint.map(p=>[...p])};
 const top=footprint(corner,cornerFootprint,.032,.774,M.light,0);top.name='Retro PC diagonal worktop';const musicTop=box(music,1.5,.032,d,0,.790,0,M.light,0);musicTop.name='Joined music return worktop';
 // Open tower bay along the west wall, outside the diagonal knee corridor.
 const bay=group('Ventilated retro tower bay',corner);bay.userData.towerBay={clearWidth:.236,clearDepth:.46,clearHeight:.55,footwellExcluded:true};
 for(const x of [1.628,1.888]){const panel=box(bay,.024,.598,.46,x,.367,.25,M.graphite,0);panel.name='Tower bay side';}
 const base=box(bay,.236,.024,.46,1.758,.08,.25,M.graphite,0);base.name='Tower bay base';const cap=box(bay,.236,.024,.46,1.758,.654,.25,M.graphite,0);cap.name='Tower bay cap';
 const retro=group('1995 workstation hardware',corner,pc[0],.812,pc[1]);retro.rotation.y=-Math.PI/4;crt(retro,0,0,-.016);speaker(retro,-.25,0,.08,true);speaker(retro,.25,0,.08,true);
 const trayZ=frontDistance-crtDistance-.14,keyboardDrawer=group('Retro keyboard drawer',retro,0,-.09,trayZ);const keyboardBoard=box(keyboardDrawer,.56,.025,.22,0,-.019,0,M.graphite,.005);keyboardBoard.name='Retro keyboard sliding tray';keyboardBoard.userData.boardModule='retro-PC';computerKeyboard(keyboardDrawer,-.035,0,.018,.40,true);mouse(keyboardDrawer,.22,0,.025,true);interact(keyboardDrawer,'Retro keyboard drawer','position.z',trayZ,trayZ+.15,drawers);
 const tower=group('Retro tower area',corner,1.758,.092,.25);vintageTower(tower,0,0,0);
 for(let i=0;i<3;i++){
  const y=1.49+i*.31,sd=.22,sa=1.9-reach,sz=sd+1.67-sa;
  const shelf=footprint(corner,[[right,.03],[1.88,.03],[1.88,reach],[1.67,reach],[1.67,sz],[sa,sd],[right,sd]],.024,y,M.light,0);shelf.name='Retro PC corner upper shelf '+(i+1);
 const musicShelf=box(music,1.5,.024,.21,0,y+.012,-d/2+.115,M.light,0);musicShelf.name='Music return upper shelf '+(i+1);
  const midDist=(reach+sd)/Math.SQRT2-.12,midiShelf=group('Roland sound module shelf',corner,1.9-midDist/Math.SQRT2,y+.03,midDist/Math.SQRT2);midiShelf.rotation.y=-Math.PI/4;midiModule(midiShelf,0,0,0,['Roland SC-55','Roland MT-32','Roland SC-88'][i]);
  const musicLED=tagShelfLED(box(modules,.008,.005,1.45,1.70,y-.012,centerZ,M.led,.002),{depth:.24,shift:.06,range:i===0?.73:.33});modules.updateMatrixWorld(true);music.attach(musicLED);
  tagShelfLED(box(corner,1.88-right-.045,.005,.008,(right+1.88)/2,y-.012,.14,M.led,.002),{depth:.28,range:i===0?.73:.33});
  const dx=1.67-sa,dz=sz-sd,len=Math.hypot(dx,dz);if(len>.08){const strip=box(corner,len-.04,.005,.008,(sa+1.67)/2+.02,y-.012,(sd+sz)/2-.02,M.led,.002);strip.rotation.y=-Math.atan2(dz,dx);tagShelfLED(strip,{depth:.30,range:i===0?.73:.33})}
 const musicFigure=figure(modules,1.76,y+.027,end-.20,i+2);musicFigure.userData.editorKey='music-shelf-figure-'+i;modules.updateMatrixWorld(true);music.attach(musicFigure);
 const cds=group('CD compartments level '+(i+1),corner,1.78,y,reach-.16);cds.rotation.y=-Math.PI/2;cds.userData.cdStorage={compartments:2,clearWidth:.112,clearHeight:.17,clearDepth:.16};
 for(const x of [-.124,0,.124]){const divider=box(cds,.012,.17,.16,x,.109,0,M.graphite,0);divider.name='CD compartment divider';}
 const cdCap=box(cds,.26,.024,.16,0,.206,0,M.light,0);cdCap.name='CD compartment cap';
 for(const x of [-.104,.020])books(cds,x,.025,0,7,true);
 }
 const panels=[['Retro corner back panel',1.9-right-.02,2.46,.025,(right+1.9)/2,1.23,.015,'back'],['Retro west back panel',.025,2.46,reach-.02,1.882,1.23,reach/2,'back'],['Music return back panel',.025,2.46,1.5,1.882,1.23,reach+.75,'back'],['Music desk end panel',d,.77,.025,centerX,.385,end-.013,'side'],['Retro corner end panel',.025,.77,d-.06,right+.015,.385,d/2,'side']];
 for(const [name,w,h,depth,x,y,z,type]of panels){const panel=box(name.startsWith('Retro')?corner:modules,w,h,depth,x,y,z,M.graphite,.003);panel.name=name;panel.userData.panelType=type;panel.userData.boardModule=name.startsWith('Retro')?'retro-PC':'music';if(!name.startsWith('Retro')){modules.updateMatrixWorld(true);music.attach(panel)}modulePanels.push(panel)}
 const retroSeat=group('Retro PC seat facing the corner',modules,seat[0],0,seat[1]);retroSeat.rotation.y=3*Math.PI/4;cyl(retroSeat,.022,.40,0,.22,0,M.metal);box(retroSeat,.39,.065,.35,0,.45,0,M.textile,.035);box(retroSeat,.34,.24,.035,0,.65,-.15,M.graphite,.02);for(let i=0;i<4;i++){let a=i*Math.PI/2;box(retroSeat,.22,.018,.025,Math.cos(a)*.09,.035,Math.sin(a)*.09,M.metal,.005).rotation.y=-a;}
 const floppies=group('Floppy disk organizer',corner,1.80,.812,Math.max(.57,reach-.18));for(let i=0;i<6;i++){box(floppies,.09,.09,.003,-i*.007,.047,-i*.008,mat(['#55616b','#6c4b4c','#76745e'][i%3]),.002);box(floppies,.058,.022,.001,-i*.007,.068,-i*.008+.002,M.silver)}
 return modules;
}




