const cached=()=>{try{const o=JSON.parse(sessionStorage.getItem('fin.tok'));return o&&o.e>Date.now()+12e4?o.t:null}catch(e){return null}};
const CLOUD={id:null,tok:null,tc:null,st:'',t:null},FN='tesoreria.json';
const SC='https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email';
const setSt=s=>{CLOUD.st=s;const e=$('syn');if(e)e.textContent=s};
async function api(url,opt={},retry=true){
  const r=await fetch(url,{...opt,headers:{...(opt.headers||{}),Authorization:'Bearer '+CLOUD.tok}});
  if(r.status===401&&retry){await getTok(true);return api(url,opt,false)}
  if(!r.ok){let m='';try{m=(await r.json()).error.message}catch(x){}throw new Error('HTTP '+r.status+(m?': '+m:''))}return r}
function getTok(silent){return new Promise((res,rej)=>{
  CLOUD.tc.callback=r=>{if(r.error)rej(r);else{CLOUD.tok=r.access_token;try{localStorage.setItem('fin.auth','1');sessionStorage.setItem('fin.tok',JSON.stringify({t:r.access_token,e:Date.now()+(+r.expires_in||3600)*1000}))}catch(e){}res()}};
  CLOUD.tc.error_callback=rej;CLOUD.tc.requestAccessToken({prompt:silent?'none':''})})}
async function findF(){const r=await api('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id)&q='+encodeURIComponent("name='"+FN+"'"));const j=await r.json();return j.files[0]?j.files[0].id:null}
async function pull(){CLOUD.id=await findF();if(!CLOUD.id)return null;return (await api('https://www.googleapis.com/drive/v3/files/'+CLOUD.id+'?alt=media')).json()}
async function push(){
  setSt('Guardando en Drive…');const body=JSON.stringify(D);
  if(!CLOUD.id){const b='fb'+Date.now(),m=JSON.stringify({name:FN,parents:['appDataFolder']});
    const r=await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body:`--${b}\r\nContent-Type: application/json\r\n\r\n${m}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${b}--`});
    CLOUD.id=(await r.json()).id}
  else await api('https://www.googleapis.com/upload/drive/v3/files/'+CLOUD.id+'?uploadType=media',{method:'PATCH',headers:{'Content-Type':'application/json'},body});
  setSt('Guardado en Drive · '+new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}));try{saveBase(body)}catch(e){}}
window.cloudPush=()=>{if(!CLOUD.tok)return;setSt('Cambios sin guardar…');clearTimeout(CLOUD.t);CLOUD.t=setTimeout(()=>sync().catch(()=>setSt('Error al guardar. Toca Sincronizar.')),1500)};
async function start(){
  setSt('Cargando desde Drive…');
  try{await sync(true);D.alu=D.alu||[];
    render();$('login').style.display='none';
  }catch(e){setSt('No se pudo conectar con Drive');$('lerr').textContent='No se pudo leer tu Drive: '+(e&&e.message||e);$('login').style.display='flex'}}
function initG(){
  if(!window.google||!google.accounts)return setTimeout(initG,250);
  CLOUD.tc=google.accounts.oauth2.initTokenClient({client_id:GOOGLE_CLIENT_ID,scope:SC,callback:()=>{}});
  if(!CLOUD.tok&&localStorage.getItem('fin.auth'))getTok(true).then(start).catch(()=>{toast('Toca la pantalla para sincronizar con Drive');const f=()=>{document.removeEventListener('click',f,true);getTok(true).then(start).catch(()=>{$('login').style.display='flex'})};document.addEventListener('click',f,true)})}
$('lbtn').onclick=async()=>{$('lerr').textContent='';if(!CLOUD.tc){$('lerr').textContent=(!window.google?'No cargó el script de Google (bloqueador o sin conexión).':'Falta configurar el Client ID.');return}try{await getTok(false);await start()}catch(e){$('lerr').textContent='Error: '+(e&&(e.type||e.error||e.message)||'desconocido')}};
$('loff').onclick=()=>{$('login').style.display='none'};
document.addEventListener('click',e=>{
  if(e.target.closest('[data-a="syncnow"]')){CLOUD.tok?start():getTok(false).then(start).catch(()=>{$('login').style.display='flex'})}
  if(e.target.closest('[data-a="logout"]')){try{localStorage.removeItem('fin.auth');sessionStorage.removeItem('fin.tok');localStorage.removeItem(KEY)}catch(x){}
    if(CLOUD.tok&&window.google)google.accounts.oauth2.revoke(CLOUD.tok,()=>{});location.reload()}});
const t0=cached();if(t0){CLOUD.tok=t0;start()}
render();initG();
async function subirFoto(f){const i=await new Promise(r=>{const m=new Image();m.onload=()=>r(m);m.src=URL.createObjectURL(f)}),k=Math.min(1,1200/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=i.width*k;c.height=i.height*k;c.getContext('2d').drawImage(i,0,0,c.width,c.height);
  const bl=await new Promise(r=>c.toBlob(r,'image/jpeg',.7)),b='fb'+Date.now(),m=JSON.stringify({name:'ticket-'+Date.now()+'.jpg',parents:['appDataFolder']});
  const r=await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',{method:'POST',headers:{'Content-Type':'multipart/related; boundary='+b},body:new Blob([`--${b}\r\nContent-Type: application/json\r\n\r\n${m}\r\n--${b}\r\nContent-Type: image/jpeg\r\n\r\n`,bl,`\r\n--${b}--`])});return (await r.json()).id}
async function upFoto(id,f){if(!CLOUD.tok)return toast('Inicia sesión con Google para guardar fotos');toast('Subiendo foto…');try{const fid=await subirFoto(f),g=D.gas.find(y=>y.id===id);if(g){g.ft=fid;save();render();toast('Foto guardada')}}catch(e){toast('No se pudo subir la foto')}}
async function verFoto(id){const w=window.open('','_blank');try{const r=await api('https://www.googleapis.com/drive/v3/files/'+id+'?alt=media');w.location=URL.createObjectURL(await r.blob())}catch(e){w&&w.close();toast('No se pudo abrir la foto')}}
