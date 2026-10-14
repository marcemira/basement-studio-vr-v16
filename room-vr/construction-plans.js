import {t} from './i18n.js';
import {boardInfo} from './furniture-structure.js';
import * as T from 'three';
import {M} from './geometry.js';
import {cabinetMetrics} from './cabinet.js';
import {downloadFile} from './settings-file.js';
const names={'retro-cabinet':'Retro gaming cabinet','retro-PC':'Retro PC corner',music:'Music return','fixed-modern-PC':'Fixed gaming PC / UPS'};
const mm=n=>Math.round(n*1000),esc=s=>t(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function visible(o){for(let p=o;p;p=p.parent)if(!p.visible)return false;return true}
function owner(o){for(let p=o.parent;p;p=p.parent)if(names[p.userData.module])return p;return null}
function moduleId(o,pos){return owner(o)?.userData.module||(pos.x>1?'music':'retro-PC')}
export function collectConstruction(room,c){
 room.updateMatrixWorld(true);const parts=[],strips=[],m=cabinetMetrics(c);
 room.traverse(o=>{
  if(!o.isMesh||!visible(o))return;
  const pos=o.getWorldPosition(new T.Vector3());
  if(o.userData.shelfLED){o.geometry.computeBoundingBox();const size=o.geometry.boundingBox.getSize(new T.Vector3()),scale=o.getWorldScale(new T.Vector3());let module=moduleId(o,pos);if(o.parent.userData.module==='continuous-workstation')module=size.z>size.x?'music':'retro-PC';const length=Math.max(size.x*scale.x,size.z*scale.z),id='L'+String(strips.length+1).padStart(3,'0');let level='Shelf '+mm(pos.y)+' mm';
   if(module==='retro-cabinet'){const x=pos.x-c.cabinetCenter;if(x< -m.inner/2)level='Left display · '+mm(pos.y)+' mm';else if(x>m.inner/2)level='Right display · '+mm(pos.y)+' mm';else if(pos.y<1)level='Console row · '+mm(pos.y)+' mm';else level='Above TV · '+mm(pos.y)+' mm'}
   strips.push({id,module,level,length,position:[pos.x,pos.y,pos.z],direction:o.getWorldQuaternion(new T.Quaternion()).toArray()});return;
  }
  const info=boardInfo(o);if(!info||info.detail)return;const own=owner(o),module=info.module;
  o.geometry.computeBoundingBox();const size=o.geometry.boundingBox.getSize(new T.Vector3()),dims=size.toArray().map(mm),sorted=[...dims].sort((a,b)=>a-b);
  const polygon=o.userData.board?.polygon.map(([x,z])=>[mm(x),mm(z)]),thickness=o.userData.board?mm(o.userData.board.thickness):sorted[0];
  const id=({music:'M','retro-PC':'R','retro-cabinet':'C','fixed-modern-PC':'E'}[module])+String(parts.filter(p=>p.module===module).length+1).padStart(2,'0');
  const label=o.name||(o.parent===own?names[module]:o.parent.name)+' · '+(dims[1]===thickness?'horizontal board':dims[0]===thickness?'side / divider':'back / front');
  const bounds=new T.Box3().setFromObject(o),material=info.glass?'Glass (specification pending)':o.userData.finishSpec?o.userData.finishSpec.substrate+' · '+o.userData.finishSpec.finish:'Finished board (material specification pending)';
  parts.push({id,module,label,dimensions:dims,thickness,polygon,position:pos.toArray().map(mm),bounds:{min:bounds.min.toArray().map(mm),max:bounds.max.toArray().map(mm)},material});
 });
 return {units:'mm',configuration:{...c},parts,strips,modules:Object.entries(names).map(([id,name])=>({id,name})),notes:'Nominal geometry; verify sheet material, edge banding, joinery, wall fixings, glass safety specification and equipment ventilation before fabrication. Equipment, hardware and lift frame are excluded.'};
}
export function electricalGroups(data,wattsPerMetre=14.4){
 const groups=[];for(const s of data.strips){let g=groups.find(g=>g.module===s.module&&g.level===s.level);if(!g){g={id:'G'+String(groups.length+1).padStart(2,'0'),module:s.module,level:s.level,strips:[],length:0};groups.push(g)}g.strips.push(s);g.length+=s.length}
 for(const g of groups){g.watts=g.length*wattsPerMetre;g.amps=g.watts/24}return groups;
}
const text=(x,y,s,size=14,maxWidth=({48:315,461:26,542:146,764:260}[x] ?? 1030-x))=>{
 const translated=t(s),fit=translated.length*size*.55>maxWidth?` textLength="${maxWidth}" lengthAdjust="spacingAndGlyphs"`:'';
 return `<text x="${x}" y="${y}" font-size="${size}"${fit}>${esc(translated)}</text>`;
};
const line=(x,y,xx,yy,color='#64748b')=>`<path d="M${x},${y}L${xx},${yy}" stroke="${color}" fill="none"/>`;
function svg(body,w,h){return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><style>text{font-family:Arial,sans-serif;fill:#172c36}path,polygon,rect{stroke-width:1.2} .part{fill:#e8f1ef;stroke:#377d73}</style><rect width="100%" height="100%" fill="#fff"/>${body}</svg>`}
export function constructionSVG(data,module='all'){
 const selected=data.parts.filter(p=>module==='all'||p.module===module),colors={'retro-cabinet':'#adcfc7','retro-PC':'#edcba5',music:'#b8c9e5','fixed-modern-PC':'#dac5e7'};
 let body=text(35,34,'BASEMENT STUDIO · Construction geometry',23)+text(35,62,'All dimensions in mm · Part shapes follow the current sliders · nominal sizes',14);
 body+=text(35,96,'PLAN · east left / west right / south at top',16);
 for(const p of selected){const b=p.bounds,s=.16,x=50+(b.min[0]+1900)*s,z=120+b.min[2]*s;if(p.polygon){body+=`<polygon points="${p.polygon.map(([x,z])=>[50+(x+1900)*s,120+z*s].join(',')).join(' ')}" fill="${colors[p.module]}" stroke="#385c61"/>`}else if(b.max[1]<850||p.label.includes('back panel'))body+=`<rect x="${x}" y="${z}" width="${Math.max(1,(b.max[0]-b.min[0])*s)}" height="${Math.max(1,(b.max[2]-b.min[2])*s)}" fill="${colors[p.module]}" stroke="#385c61"/>`}
 body+=`<rect x="50" y="120" width="608" height="531.2" fill="none" stroke="#142c3a"/>`+text(300,685,'ROOM 3800 × 3320 · ceiling 2500')+text(50,709,'Door: east wall, north/front 800 mm opening');
 let y=145;for(const [id,name]of Object.entries(names)){body+=`<rect x="710" y="${y-15}" width="15" height="15" fill="${colors[id]}"/>`+text(735,y,name);y+=32}
 body+=text(710,305,'ASSEMBLY / ELEVATION',16);
 // Project world board edges onto the south elevation. Plan and cut shapes resolve corner parts.
 for(const p of selected){const b=p.bounds;body+=`<rect x="${710+(b.min[0]+1900)*.065}" y="${520-b.max[1]*.065}" width="${Math.max(1,(b.max[0]-b.min[0])*.065)}" height="${Math.max(1,(b.max[1]-b.min[1])*.065)}" fill="${colors[p.module]}" fill-opacity=".5" stroke="#537078"/>`}
 body+=text(710,550,'South projection · overlaps shown translucent',12)+text(710,573,'Corner joins music return at desk height 806',12)+text(710,596,'Corner worktops: 32 thick · upper shelves: 24',12);
 body+=text(710,626,'Tower bay clear: 236 × 460 × 550',12)+text(710,649,'6 CD cubbies: 112 × 170 × 160 each',12)+text(710,672,'Corner diagonal front: '+mm(data.configuration.cornerFront),12)+text(710,695,'Music return: 1500 × '+mm(data.configuration.musicDepth),12);
 body+=text(35,758,'PART SHAPES · one item per modeled board · IDs correspond to the parts table',17);
 let i=0;for(const p of selected){const x=35+(i%3)*335,y=790+Math.floor(i/3)*260;body+=text(x,y,p.id+' · '+t(p.label).slice(0,46),12,310);let poly=p.polygon;if(!poly){const dimensions=[...p.dimensions].sort((a,b)=>b-a);poly=[[0,0],[dimensions[0],0],[dimensions[0],dimensions[1]],[0,dimensions[1]]]}
  const minX=Math.min(...poly.map(p=>p[0])),minY=Math.min(...poly.map(p=>p[1])),w=Math.max(...poly.map(p=>p[0]))-minX,h=Math.max(...poly.map(p=>p[1]))-minY,scale=Math.min(270/Math.max(w,1),140/Math.max(h,1));body+=`<polygon class="part" points="${poly.map(([xx,yy])=>[x+15+(xx-minX)*scale,y+22+(yy-minY)*scale].join(',')).join(' ')}"/>`;
  poly.forEach((a,j)=>{const b=poly[(j+1)%poly.length];body+=text(x+15+((a[0]+b[0])/2-minX)*scale,y+17+((a[1]+b[1])/2-minY)*scale,Math.round(Math.hypot(a[0]-b[0],a[1]-b[1])),10)});
  body+=text(x,y+185,`${w} × ${h} · thickness ${p.thickness}`,12);body+=text(x,y+207,'Y above floor: '+p.bounds.min[1]+'…'+p.bounds.max[1],12);if(p.polygon)body+=text(x,y+229,'Polygon vertices in parts JSON (room X/Z)',11);i++;
 }
 const height=810+Math.ceil(i/3)*260;body+=text(35,height-20,'Concept construction geometry: joinery, supports, anchors and tolerances require a fabricator’s review.',13);return svg(body,1060,height);
}
export function electricalSVG(data,watts=14.4){
 const groups=electricalGroups(data,watts),length=groups.reduce((a,g)=>a+g.length,0),power=length*watts,height=360+groups.length*123;
 let b=text(35,34,'BASEMENT STUDIO · LED group wiring',23)+text(35,62,`24 V DC analog RGB · common anode · ${watts} W/m assumed at full RGB white`,14)+text(35,88,`${data.strips.length} strips · ${groups.length} independent shelf groups · ${length.toFixed(2)} m · ${power.toFixed(1)} W / ${(power/24).toFixed(2)} A`,15)+text(35,113,`PSU design allowance ≥ ${(power*1.25).toFixed(1)} W (25% reserve), plus controller consumption; split supplies if needed.`,13);
 b+=`<rect class="part" x="35" y="140" width="340" height="55"/>`+text(48,161,'Existing outlet → certified enclosed 24 V DC PSU',13)+text(48,181,'SELV supply · mains wiring not detailed',12);
 b+=line(375,155,405,155,'#b77918')+line(375,184,420,184,'#243345')+line(405,155,405,height-95,'#b77918')+line(420,184,420,height-95,'#243345')+text(385,218,'V+',12)+text(420,218,'0V',12);
 groups.forEach((g,i)=>{const y=250+i*123;b+=`<circle cx="405" cy="${y+8}" r="3" fill="#b77918"/><circle cx="420" cy="${y+55}" r="3" fill="#243345"/>`;b+=text(35,y,g.id+' · '+names[g.module],14)+text(35,y+22,g.level,13)+text(35,y+44,`${g.length.toFixed(2)} m · ${g.watts.toFixed(1)} W · ${g.amps.toFixed(2)} A total`,12);
  b+=line(405,y+8,458,y+8,'#b77918')+`<rect x="458" y="${y}" width="32" height="16" fill="white" stroke="#8a7042"/>`+text(461,y+12,'Fuse',9)+line(490,y+8,530,y+8,'#b77918')+line(420,y+55,530,y+55,'#243345');
  b+=`<rect class="part" x="530" y="${y-6}" width="170" height="72"/>`+text(542,y+13,g.id+' RGB PWM controller',12)+text(542,y+32,'Input: V+ / 0V',11)+text(542,y+51,'Output: V+ / R / G / B',11);
  ['#b77918','#c84242','#318951','#3366be'].forEach((color,j)=>{b+=line(700,y+j*14,752,y+j*14,color)});
  b+=`<rect class="part" x="752" y="${y-6}" width="285" height="72"/>`+text(764,y+12,'4-wire parallel split → '+g.strips.length+' strip(s)',12)+text(764,y+32,g.strips.map(s=>s.id+' '+mm(s.length)+'mm').join(' · '),9)+text(764,y+51,'Each strip: V+ / R / G / B matched',11);
 });
 b+=text(35,height-68,'Each Gxx is independent; strips in a group connect in parallel. Dots mark connections; crossings without dots are separate.',13)+text(35,height-45,'Fuse, cable size, voltage drop, cut increments and controller total/per-channel ratings: verify selected product datasheets.',12)+text(35,height-22,'Mount tape in downward-facing aluminium channels. Physical PC Aura sync needs compatible controllers / software.',12);
 return svg(b,1070,height);
}
export function openDiagrams(room,c){
 document.querySelector('#diagram-dialog')?.remove();const data=collectConstruction(room,c),dialog=document.createElement('dialog');dialog.id='diagram-dialog';dialog.innerHTML=`<div class="diagram-head"><div><h2>Furniture & lighting plans</h2><p>Current layout · millimetres · ${data.parts.length} structural pieces</p></div><button id="diagram-close">Close</button></div><div class="diagram-tools"><button id="diagram-construction" aria-pressed="true">Construction</button><button id="diagram-electrical" aria-pressed="false">LED wiring</button><select id="diagram-module" aria-label="Furniture module"><option value="all">All modules</option>${data.modules.map(m=>`<option value="${m.id}">${m.name}</option>`).join('')}</select><label id="diagram-power-label" hidden>LED W/m <input id="diagram-power" type="number" min="1" max="60" step=".1" value="14.4"></label><button id="diagram-svg">Save diagram SVG</button><button id="diagram-csv">Parts CSV</button><button id="diagram-json">Parts & LED groups JSON</button></div><p class="diagram-note">${esc(data.notes)} LED wiring is a 24 V analog RGB design assumption. Loads use full RGB white; finalize hardware ratings before installation.</p><div id="diagram-canvas"></div><div id="diagram-parts"></div><p class="diagram-note">Wiring reference: <a href="https://www.hiline-lighting.co.uk/gb/blog/led-strip-lights/common-anode-current-colour-changing-led-strip" target="_blank" rel="noopener">Common anode loads</a> · <a href="https://www.waveformlighting.com/support/led-flex-strips" target="_blank" rel="noopener">Low-voltage power supplies</a></p>`;document.body.append(dialog);let mode='construction';
 const power=()=>Math.min(60,Math.max(1,Number(dialog.querySelector('#diagram-power').value)||14.4));const module=()=>dialog.querySelector('#diagram-module').value;
 const content=()=>mode==='construction'?constructionSVG(data,module()):electricalSVG(data,power());
 function render(){dialog.querySelector('#diagram-canvas').innerHTML=content();dialog.querySelector('#diagram-power-label').hidden=mode!=='electrical';dialog.querySelector('#diagram-module').disabled=mode==='electrical';for(const id of ['construction','electrical'])dialog.querySelector('#diagram-'+id).setAttribute('aria-pressed',mode===id);const parts=data.parts.filter(p=>module()==='all'||p.module===module());dialog.querySelector('#diagram-parts').innerHTML=mode==='construction'?`<table><thead><tr><th>ID</th><th>Part</th><th>Part local X × Y × Z</th><th>Thickness</th><th>Material & finish</th></tr></thead><tbody>${parts.map(p=>`<tr><td>${p.id}</td><td>${esc(p.label)}</td><td>${p.dimensions.join(' × ')}</td><td>${p.thickness} mm</td><td>${esc(p.material)}</td></tr>`).join('')}</tbody></table>`:''}
 for(const id of ['construction','electrical'])dialog.querySelector('#diagram-'+id).onclick=()=>{mode=id;render()};dialog.querySelector('#diagram-module').onchange=render;dialog.querySelector('#diagram-power').oninput=render;dialog.querySelector('#diagram-close').onclick=()=>dialog.close();dialog.querySelector('#diagram-svg').onclick=()=>downloadFile(mode+'-diagram.svg',content(),'image/svg+xml');dialog.querySelector('#diagram-json').onclick=()=>downloadFile('construction-parts-and-led-groups.json',JSON.stringify({...data,electrical:{voltage:24,wattsPerMetre:power(),groups:electricalGroups(data,power())}},null,2));dialog.querySelector('#diagram-csv').onclick=()=>downloadFile('furniture-parts.csv',t('ID,Module,Part,X mm,Y mm,Z mm,Thickness mm,Material')+'\n'+data.parts.map(p=>[p.id,names[p.module],p.label,...p.dimensions,p.thickness,p.material].map(v=>'"'+t(v).replaceAll('"','""')+'"').join(',')).join('\n'),'text/csv');render();dialog.showModal();return data;
}
