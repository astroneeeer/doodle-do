import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
const files=walk('dist').filter(p=>!p.endsWith('sw.js'));const hash=createHash('sha256');for(const p of files)hash.update(fs.readFileSync(p));const cache='ink-board-'+hash.digest('hex').slice(0,12);const urls=files.map(p=>'./'+path.relative('dist',p).replaceAll('\\','/'));urls.push('./');
fs.writeFileSync('dist/sw.js',`const CACHE=${JSON.stringify(cache)};const ASSETS=${JSON.stringify(urls)};self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('ink-board-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>{const cached=await c.match(e.request);if(cached)return cached;if(e.request.mode==='navigate')return (await c.match('./index.html'))||fetch(e.request);return fetch(e.request)}))});`);
console.log('Offline assets:',urls.length,cache);
