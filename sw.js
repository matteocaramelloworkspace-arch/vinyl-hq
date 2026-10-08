const CACHE="mozzi-v1.04";
const SHELL=["./","index.html","manifest.webmanifest","icon.svg","icon-192.png","icon-512.png","apple-touch-icon.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting();});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||u.hostname.endsWith("supabase.co")) return; // le chiamate al database non si cacheano
  e.respondWith(
    fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;})
    .catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html")))
  );
});

// notifiche push: mostra il messaggio ricevuto e, al tocco, apre l'app
self.addEventListener("push",e=>{let d={};try{d=e.data?e.data.json():{};}catch{d={body:e.data?e.data.text():""};}
  e.waitUntil(self.registration.showNotification(d.title||"Mozzi",{body:d.body||"",icon:"icon-192.png",badge:"icon-192.png",tag:d.tag||"mozzi",data:{url:(d.url||"./")}}));});
self.addEventListener("notificationclick",e=>{e.notification.close();
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(ws=>{for(const w of ws){if("focus" in w)return w.focus();}return clients.openWindow(e.notification.data&&e.notification.data.url||"./");}));});
