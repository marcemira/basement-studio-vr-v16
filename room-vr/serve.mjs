import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.csv':'text/csv','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.json':'application/json','.md':'text/plain'};
const server=http.createServer((req,res)=>{let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);return res.end()}
 const target=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(target!==root&&!target.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 fs.stat(target,(error,stat)=>{if(error||!stat.isFile()){res.writeHead(404);return res.end('Not found')}
 res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});fs.createReadStream(target).pipe(res);});});
server.on('error',err=>{console.error(err.message);process.exit(1)});
server.listen(8877,'127.0.0.1',()=>console.log('Room VR ready: http://localhost:8877'));
