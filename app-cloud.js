const cached=()=>{try{const o=JSON.parse(sessionStorage.getItem('fin.tok'));return o&&o.e>Date.now()+12e4?o.t:null}catch(e){return null}};
// ===== Google login + Drive (carpeta oculta appDataFolder) =====
const CLOUD={id:null,tok:null,tc:null,st:'',t:null};
const SC='https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email';
const setSt=s=>{CLOUD.st=s;const e=$('syn');if(e)e.textContent=s};
function cloudBox(){return `<h3>Cuenta de Google</h3><div class="box"><div class="row"><span class="m" id="syn">${esc(CLOUD.st||'Sin conexión con Drive')}</span><span class="row"><button class="btn g" data-a="syncnow">Sincronizar</button><button class="btn g" data-a="logout">Salir</button></span></div></div><div class="box row" style="margin-top:8px"><span>Vibración al tocar${navigator.vibrate?'':' <small>(no compatible con este navegador)</small>'}</span><button class="btn g" data-a="vibtog">${VIB?'Activada':'Desactivada'}</button></div><a class="btn g" href="tesoreria.html" style="display:block;text-align:center;margin-top:8px;text-decoration:none">Tesorería escolar →</a>`}
async function api(url,opt={},retry=true){
  const r=await fetch(url,{...opt,headers:{...(opt.headers||{}),Authorization:'Bearer '+CLOUD.tok}});
  if(r.status===401&&retry){await getTok(true);return api(url,opt,false)}
  if(!r.ok){let m='';try{m=(await r.json()).error.message}catch(x){}throw new Error('HTTP '+r.status+(m?': '+m:''))}return r}
function getTok(silent){return new Promise((res,rej)=>{
  CLOUD.tc.callback=r=>{if(r.error)rej(r);else{CLOUD.tok=r.access_token;try{localStorage.setItem('fin.auth','1');sessionStorage.setItem('fin.tok',JSON.stringify({t:r.access_token,e:Date.now()+(+r.expires_in||3600)*1000}))}catch(e){}res()}};
  CLOUD.tc.error_callback=rej;CLOUD.tc.requestAccessToken({prompt:silent?'none':''})})}
async function findF(){const r=await api('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id)&q='+encodeURIComponent("name='movimientos.json'"));const j=await r.json();return j.files[0]?j.files[0].id:null}
async function pull(){CLOUD.id=await findF();if(!CLOUD.id)return null;return (await api('https://www.googleapis.com/drive/v3/files/'+CLOUD.id+'?alt=media')).json()}
async function push(){
  setSt('Guardando en Drive…');const body=JSON.stringify(D);
  if(!CLOUD.id){const b='fb'+Date.now(),m=JSON.stringify({name:'movimientos.json',parents:['appDataFolder']});
    const r=await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body:`--${b}\r\nContent-Type: application/json\r\n\r\n${m}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`});
    CLOUD.id=(await r.json()).id}
  else await api('https://www.googleapis.com/upload/drive/v3/files/'+CLOUD.id+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':'application/json'},body});
  setSt('Guardado en Drive · '+new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}))}
window.cloudPush=()=>{if(!CLOUD.tok)return;setSt('Cambios sin guardar…');clearTimeout(CLOUD.t);CLOUD.t=setTimeout(()=>push().catch(()=>setSt('Error al guardar. Toca Sincronizar.')),1500)};
async function start(){
  setSt('Cargando desde Drive…');
  try{const r=await pull();
    if(r&&r.u>(D.u||0)){D=r;try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}}
    else if(!r||(D.u||0)>r.u)await push();
    else setSt('Sincronizado');
    D.cats=D.cats||DEFCATS.map(x=>({...x}));syncCats();genRec();render();$('login').style.display='none';
  }catch(e){setSt('No se pudo conectar con Drive');$('lerr').textContent='No se pudo leer tu Drive: '+(e&&e.message||e);$('login').style.display='flex'}}
function initG(){
  if(!GOOGLE_CLIENT_ID||GOOGLE_CLIENT_ID.startsWith('PEGA')){$('lerr').textContent='Falta configurar el Client ID de Google (ver LEEME.md).';return}
  if(!window.google||!google.accounts)return setTimeout(initG,250);
  CLOUD.tc=google.accounts.oauth2.initTokenClient({client_id:GOOGLE_CLIENT_ID,scope:SC,callback:()=>{}});
  if(!CLOUD.tok&&localStorage.getItem('fin.auth'))getTok(true).then(start).catch(()=>{toast('Toca la pantalla para sincronizar con Drive');const f=()=>{document.removeEventListener('click',f,true);getTok(true).then(start).catch(()=>{$('login').style.display='flex'})};document.addEventListener('click',f,true)})}
$('lbtn').onclick=async()=>{$('lerr').textContent='';if(!CLOUD.tc){$('lerr').textContent=(!window.google?'No cargó el script de Google (bloqueador o sin conexión).':'Falta configurar el Client ID.');return}try{await getTok(false);await start()}catch(e){$('lerr').textContent='Error: '+(e&&(e.type||e.error||e.message)||'desconocido')}};
$('loff').onclick=()=>{$('login').style.display='none'};
document.addEventListener('click',e=>{
  if(e.target.closest('[data-a="vibtog"]')){VIB=!VIB;try{localStorage.setItem('fin.vib',VIB?'1':'0')}catch(x){}vib(80);render()}
  if(e.target.closest('[data-a="syncnow"]')){CLOUD.tok?start():getTok(false).then(start).catch(()=>{$('login').style.display='flex'})}
  if(e.target.closest('[data-a="logout"]')){try{localStorage.removeItem('fin.auth');sessionStorage.removeItem('fin.tok');localStorage.removeItem(KEY)}catch(x){}
    if(CLOUD.tok&&window.google)google.accounts.oauth2.revoke(CLOUD.tok,()=>{});location.reload()}});
// Dictado sin IA: interpreta frases simples en español
function parseVoz(t){const s=t.toLowerCase(),n=s.match(/(\d+(?:[.,]\d+)?)/);
  const K={Mercado:/super|mercado|despensa|walmart|soriana|chedraui/,Restaurantes:/caf[eé]|taco|com[ií]|restaurante|cena|desayuno|pizza|torta/,Transporte:/uber|didi|gasolina|taxi|metro|cami[oó]n|caseta/,Entretenimiento:/cine|netflix|spotify|juego|concierto/,Salud:/doctor|farmacia|medicina|dentista|consulta/,Viajes:/vuelo|hotel|viaje|hospedaje/};
  const m=s.match(/\b(?:en|de|por)\s+(?:el |la |un |una )?([a-záéíóúñ ]+?)(?:\s+(?:con|de la|ayer|hoy)\b|$)/);
  return{t:/transfer/.test(s)?'tr':/cobr[eé]|recib[ií]|n[oó]mina|me pagaron|ingreso|sueldo/.test(s)?'in':'out',a:n?parseFloat(n[1].replace(',','.')):null,k:Object.keys(K).find(x=>K[x].test(s)),tag:/viaje|vuelo|hotel/.test(s)?'Viajes':'Generales',c:m?m[1].trim().replace(/^./,c=>c.toUpperCase()):null,acc:(D.acc.find(a=>s.includes(a.n.toLowerCase()))||{}).n,d:/ayer/.test(s)?iso(1):iso(0)}}
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});

const t0=cached();if(t0){CLOUD.tok=t0;start()}
render();
initG();
