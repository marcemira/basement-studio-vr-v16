import {tagShelfLED} from './shelf-lighting.js';
import {M,group,box,cyl,label,footprint,tube} from './geometry.js';
import {hyte,figure} from './equipment.js';

export function buildEastModule(root,c,{interact,drawers}){
 const right=c.cabinetCenter-c.width/2,width=right+1.9,center=(-1.9+right)/2;
 const g=group('Fixed southeast PC and UPS module',root);
 g.userData={module:'fixed-modern-PC',dimensions:{width,depth:.55,height:.806},caseMovesWithLift:false,footprint:[[-1.9,0],[right,0],[right,.55],[-1.9,.55]],shelfLevels:[1.49,1.8,2.11],returnShelfDepth:0};
 const top=box(g,width,.032,.55,center,.790,.275,M.light,.004);top.name='Fixed HYTE desktop';
 for(const x of [-1.888,right-.012])box(g,.024,.77,.55,x,.385,.275,M.graphite,.004);
 box(g,width-.048,.024,.51,center,.12,.275,M.graphite,.004);
 box(g,width-.048,.68,.022,center,.42,.022,M.graphite,.003);
 const door=group('Vented UPS access door',g,-1.87,.34,.545),dw=width-.06;
 for(const y of [-.315,.315])box(door,dw,.025,.018,dw/2,y,0,M.graphite,.003);
 for(const x of [0,dw])box(door,.022,.63,.018,x,0,0,M.graphite,.003);
 for(let i=0;i<19;i++)box(door,dw-.025,.024,.018,dw/2,-.283+i*.031,0,M.graphite,.003);
 box(door,.014,.09,.024,dw-.032,0,.018,M.silver,.003);
 interact(door,'UPS cabinet','rotation.y',0,-Math.PI*.43,drawers);
 const ups=group('Representative UPS — 18 × 40 × 35 cm',g,center,.134,.27);ups.userData.dimensions={width:.18,depth:.4,height:.35};
 box(ups,.18,.35,.4,0,.175,0,M.black,.014);box(ups,.06,.043,.002,0,.28,.202,M.blue,.004);label(ups,'UPS',.055,.022,0,.20,.204,'#a9c8c1');cyl(ups,.007,.005,0,.12,.204,M.green,12).rotation.x=Math.PI/2;
 const pc=hyte(g,center,.812,.275);pc.userData.fixedSupport=true;
 box(g,width-.09,.075,.10,center,.64,.085,M.black,.004);label(g,'POWER / CABLE TRAY',Math.min(.30,width-.07),.023,center,.64,.139,'#849c96');
 tube(g,[[center,.82,.055],[center,.65,.055],[center-.05,.62,.075],[center-.05,.23,.075]],.008,M.black);
 const eastInner=-1.73;
 for(let i=0;i<3;i++){
  const y=1.49+i*.31;
  const shelf=box(g,width-.02,.024,.27,center,y+.012,.165,M.light,.003);
  shelf.name='Southeast PC display shelf '+(i+1);
  figure(g,center,y+.027,.13,i+2).userData.editorKey='fixed-east-figure-'+i;
  tagShelfLED(box(g,width-.06,.005,.008,center,y-.006,.22,M.led,.002),{depth:.27,shift:.055,range:i===0?.73:.32});box(g,width-.05,.009,.016,center,y,.22,M.metal,.002);
 }
 return g;
}


