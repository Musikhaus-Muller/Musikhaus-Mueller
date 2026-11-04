import fs from 'node:fs/promises';
const assets={};for(const file of ['index.html','app.js','style.css','update-instructions.json','browser-checks.json','browser-checks.csv','maui11-browser-check.csv'])assets['/'+file]=await fs.readFile('web/'+file,'utf8');
const seed=JSON.parse(await fs.readFile('web/seed.json','utf8'));
const worker=await fs.readFile('worker/handler.mjs','utf8');
await fs.mkdir('dist/server',{recursive:true});await fs.mkdir('dist/.openai',{recursive:true});
await fs.writeFile('dist/server/index.js','const ASSETS='+JSON.stringify(assets)+';\nconst SEED='+JSON.stringify(seed)+';\nconst MANUAL_CHECKS='+await fs.readFile('web/browser-checks.json','utf8')+';\n'+worker);
await fs.copyFile('.openai/hosting.json','dist/.openai/hosting.json');
console.log('Worker y recursos preparados');
