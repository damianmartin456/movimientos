const C='fin-v5',A=['./','index.html','style.css','app-cats.js','app-core.js','app-views.js','app-views2.js','app-forms.js','app-cloud.js','manifest.json','icon-192.png','icon-512.png','favicon.png','logo.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(A.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
const net=fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r});
e.respondWith(Promise.race([net,new Promise((_,j)=>setTimeout(j,2500))]).catch(()=>caches.match(e.request).then(r=>r||net)).catch(()=>caches.match('index.html')))});
