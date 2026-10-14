import * as T from 'three';
import {tagShelfLED} from './shelf-lighting.js';
import {M,group,box,cyl,label} from './geometry.js';
import {consoleSpecs,consoleModel,monitor,figure,gamepad} from './equipment.js';

// Values are metres, except tvInches. The right edge remains attached to the corner module.
export const furniture={width:1.95,depth:.40,height:2.50,tvInches:55,tvHeight:1.32,tvOffset:0,consoleRows:4,upperShelfHeight:2.00,upperRows:1,rightDisplay:true,glass:true,lighting:true,storage:true,upper:true,backPanels:true,sidePanels:false,musicDepth:.45,cornerFront:.60,centerCabinet:true,cabinetCenter:0};
export function cabinetMetrics(c){const sw=c.tvInches*.0254*16/Math.sqrt(337),inner=Math.max(Math.ceil(16/c.consoleRows)*.36,sw+.062),side=(c.width-inner)/2,left=c.cabinetCenter-c.width/2,right=c.cabinetCenter+(c.rightDisplay?c.width/2:inner/2+.009);return {inner,side,left,right,width:right-left,freed:c.width/2-(right-c.cabinetCenter)}}
export function upperRowLimit(c){const sh=c.tvInches*.0254*9/Math.sqrt(337),minShelf=Math.max(1.6,.075+c.consoleRows*.17+.08+sh);return Math.max(1,Math.min(3,Math.floor((c.height-.06-minShelf)/.22+1e-8)))}
 export function buildCabinet(parent,c,api){
 const {interact,displayDoors,drawers,displayLights}=api;
 const W=c.width,D=c.depth,H=c.height,metrics=cabinetMetrics(c),right=metrics.right,left=metrics.left;
 const diag=c.tvInches*.0254,sw=diag*16/Math.sqrt(337),sh=diag*9/Math.sqrt(337);
 const inner=Math.max(Math.ceil(16/c.consoleRows)*.36,sw+.062),side=(W-inner)/2,cols=Math.ceil(16/c.consoleRows),cell=inner/cols,base=.075,row=.17,front=D/2-.015;
 const g=group(`South retro cabinet — ${Math.round(W*100)} × ${Math.round(D*100)} × ${Math.round(H*100)} cm`,parent,c.cabinetCenter,0,D/2);
 g.userData={module:'retro-cabinet',configuration:{...c},dimensions:{width:metrics.width,nominalWidth:W,depth:D,height:H},footprint:[[left,0],[right,0],[right,D],[left,D]],consoleBays:16,reservedBays:5,storageCubbies:Math.max(0,cols*c.consoleRows-16),grid:{columns:cols,rows:c.consoleRows,clearBayWidth:cell-.026,clearBayHeight:row-.018}};
 const frameCenter=(left+right)/2-c.cabinetCenter;box(g,metrics.width,.065,D,frameCenter,.032,0,M.graphite,.006);box(g,metrics.width,.027,D,frameCenter,H-.025,0,M.graphite,.006);box(g,metrics.width,H-.10,.018,frameCenter,H/2,-D/2+.01,M.graphite);
 box(g,.024,H-.06,D,-W/2+.012,H/2,0,M.graphite,.003);box(g,.018,H-.10,D-.025,-inner/2,H/2,0,M.graphite,.003);box(g,.018,H-.10,D-.025,inner/2,H/2,0,M.graphite,.003);if(c.rightDisplay)box(g,.024,H-.06,D,W/2-.012,H/2,0,M.graphite,.003);
 function led(w,x,y,z,range=.65){if(c.lighting){tagShelfLED(box(g,w,.005,.008,x,y,z,M.led,.002),{depth:D-.04,range,shift:D/2-.08});box(g,w+.005,.013,.017,x,y+.006,z,M.metal,.002)}}
 function glass(name,x,y,w,h){if(!c.glass)return;const door=group(name,g,x-w/2,y,front);box(door,w,h,.004,w/2,0,0,M.glass);for(const sx of [0,w])box(door,.004,h,.006,sx,0,0,M.metal);for(const sy of [-h/2,h/2])box(door,w,.004,.006,w/2,sy,0,M.metal);box(door,.006,.035,.010,w-.016,0,.005,M.silver,.002);interact(door,name,'rotation.y',0,-Math.PI*.43,displayDoors)}
 for(let r=0;r<=c.consoleRows;r++)box(g,inner,.018,D-.05,0,base+r*row,0,M.light,.003);
 for(let col=0;col<=cols;col++)box(g,.018,c.consoleRows*row,D-.05,-inner/2+col*cell,base+c.consoleRows*row/2,0,M.graphite,.003);
 for(let slot=0;slot<cols*c.consoleRows;slot++){
  const r=Math.floor(slot/cols),col=slot%cols,x=-inner/2+(col+.5)*cell,y=base+.015+r*row;
  led(cell-.05,x,y+row-.037,D/2-.08,row+.015);
  if(slot<11){consoleModel(consoleSpecs[slot],g,x,y+.007,-.018);if(consoleSpecs[slot].type!=='xbox')gamepad(g,x,y+.023,D/2-.062,consoleSpecs[slot].type==='famicom'?M.red:M.light)}
  else if(slot<16)label(g,'FUTURE / '+(slot-10),.22,.028,x,y+.06,-D/2+.025,'#6b8585');
  else {box(g,cell-.06,.10,D-.10,x,y+.055,-.012,M.graphite,.006);label(g,'ACCESSORIES',.20,.023,x,y+.065,front-.004,'#91a7a5')}
  if(slot<16){label(g,slot<11?consoleSpecs[slot].name:'Reserved',Math.min(.30,cell-.04),.023,x,y-.010,D/2-.002,'#a2b5b1',null,25);glass('Console bay '+(slot+1),x,y+(row-.030)/2,cell-.030,row-.030)}
 }
 const tv=monitor(g,sw+.022,sh+.022,c.tvOffset,c.tvHeight,D/2-.058,'landscape',false);tv.name=`${c.tvInches}-inch television`;tv.userData.display={diagonalInches:c.tvInches,activeWidth:sw,activeHeight:sh,aspectRatio:'16:9'};
 box(g,.13,.38,.04,c.tvOffset,c.tvHeight,D/2-.11,M.metal,.003);
 for(const s of [-1,1]){
  if(s===1&&!c.rightDisplay)continue;
  const x=s*(inner/2+side/2),usable=side-.025;
  for(let i=0;i<5;i++){const y=.80+i*(H-.88)/4;box(g,usable,.020,D-.05,x,y,0,M.light,.003);if(i<4){led(usable-.025,x,y+(H-.88)/4-.025,D/2-.08,(H-.88)/4+.02);figure(g,x,y+.012,.02,i+(s+1)*2).userData.editorKey='cabinet-side-'+s+'-'+i}}
  if(c.storage)for(let i=0;i<3;i++){const dr=group('Cartridge drawer',g,x,.183+i*.224,0);box(dr,usable,.21,.018,0,0,D/2-.02,M.graphite,.006);box(dr,usable-.015,.012,D-.07,0,-.094,0,M.light,.002);for(const sx of [-1,1])box(dr,.012,.16,D-.07,sx*(usable-.027)/2,-.009,0,M.graphite,.002);box(dr,usable-.015,.16,.012,0,-.009,-D/2+.04,M.graphite,.002);box(dr,Math.min(.20,usable-.04),.011,.014,0,.075,D/2-.008,M.black,.003);interact(dr,'Cartridge drawer','position.z',0,.22,drawers)}
  else {box(g,usable,.018,D-.05,x,.32,0,M.light,.003);box(g,usable,.018,D-.05,x,.56,0,M.light,.003)}
  glass('Side display glass',x,(.80+H-.06)/2,usable,H-.86);
 }
 if(c.upper){const pitch=(H-.06-c.upperShelfHeight)/c.upperRows;for(let r=0;r<c.upperRows;r++){const y=c.upperShelfHeight+r*pitch,top=y+pitch;const shelf=box(g,inner,.018,D-.05,0,y,0,M.light,.003);shelf.name='Above-TV display shelf '+(r+1);const count=Math.floor(inner/.19);for(let i=0;i<count;i++)figure(g,-inner/2+(i+.5)*inner/count,y+.015,.02,i+r).userData.editorKey='cabinet-top-'+r+'-'+i;led(inner-.05,0,top-.026,D/2-.08,pitch+.04);glass('Upper glazed display row '+(r+1),0,(y+.013+top)/2,inner-.03,pitch-.026)}}

 return g;
}



