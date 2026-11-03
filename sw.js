const C='fin-v6',A=['./','index.html','tesoreria.html','style.css','tes.css','app-cats.js','app-core.js','app-views.js','app-views2.js','app-forms.js','app-cloud.js','t-core.js','t-views.js','t-forms.js','t-extra.js','t-report.js','t-alu.js','t-info.js','t-backup.js','t-cloud.js','manifest.json','icon-192.png','icon-512.png','favicon.png','logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
const net=fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp))}return r});
e.respondWith(Promise.race([net,new Promise((_,j)=>setTimeout(j,2500))]).catch(()=>caches.match(e.request).then(r=>r||net)).catch(()=>e.request.mode==='navigate'?caches.match('index.html'):Response.error()))});
