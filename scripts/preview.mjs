import http from 'node:http';import fs from 'node:fs/promises';
const code=await fs.readFile('dist/server/index.js','utf8');const {default:worker}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
const env={BUCKET:{get:async()=>null}};
http.createServer(async(req,res)=>{try{const chunks=[];for await(const c of req)chunks.push(c);const request=new Request('http://127.0.0.1:8767'+req.url,{method:req.method,headers:req.headers,...(chunks.length?{body:Buffer.concat(chunks)}:{})});const out=await worker.fetch(request,env);res.writeHead(out.status,Object.fromEntries(out.headers));res.end(Buffer.from(await out.arrayBuffer()));}catch{res.writeHead(500);res.end('preview error')}}).listen(8767,'127.0.0.1',()=>console.log('http://127.0.0.1:8767'));
