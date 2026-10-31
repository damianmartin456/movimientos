const CLOUD={id:null,tok:null,tc:null,st:'',t:null},FN='tesoreria.json';
const SC='https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email';
const setSt=s=>{CLOUD.st=s;const e=$('syn');if(e)e.textContent=s};
async function api(url,opt={},retry=true){
  const r=await fetch(url,{...opt,headers:{...(opt.headers||{}),Authorization:'Bearer '+CLOUD.tok}});
  if(r.status===401&&retry){await getTok(true);return api(url,opt,false)}
  if(!r.ok){let m='';try{m=(await r.json()).error.message}catch(x){}throw new Error('HTTP '+r.status+(m?': '+m:''))}return r}
function getTok(silent){return new Promise((res,rej)=>{
  CLOUD.tc.callback=r=>{if(r.error)rej(r);else{CLOUD.tok=r.access_token;try{localStorage.setItem('fin.auth','1')}catch(e){}res()}};
  CLOUD.tc.error_callback=rej;CLOUD.tc.requestAccessToken({prompt:silent?'none':''})})}
async function findF(){const r=await api('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id)&q='+encodeURIComponent("name='"+FN+"'"));const j=await r.json();return j.files[0]?j.files[0].id:null}
async function pull(){CLOUD.id=await findF();if(!CLOUD.id)return null;return (await api('https://www.googleapis.com/drive/v3/files/'+CLOUD.id+'?alt=media')).json()}
async function push(){
  setSt('Guardando en Drive…');const body=JSON.stringify(D);
  if(!CLOUD.id){const b='fb'+Date.now(),m=JSON.stringify({name:FN,parents:['appDataFolder']});
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
    render();$('login').style.display='none';
  }catch(e){setSt('No se pudo conectar con Drive');$('lerr').textContent='No se pudo leer tu Drive: '+(e&&e.message||e)}}
function initG(){
  if(!window.google||!google.accounts)return setTimeout(initG,250);
  CLOUD.tc=google.accounts.oauth2.initTokenClient({client_id:GOOGLE_CLIENT_ID,scope:SC,callback:()=>{}});
  if(localStorage.getItem('fin.auth'))getTok(true).then(start).catch(()=>{})}
$('lbtn').onclick=async()=>{$('lerr').textContent='';if(!CLOUD.tc){$('lerr').textContent=(!window.google?'No cargó el script de Google (bloqueador o sin conexión).':'Falta configurar el Client ID.');return}try{await getTok(false);await start()}catch(e){$('lerr').textContent='Error: '+(e&&(e.type||e.error||e.message)||'desconocido')}};
$('loff').onclick=()=>{$('login').style.display='none'};
document.addEventListener('click',e=>{
  if(e.target.closest('[data-a="syncnow"]')&&CLOUD.tok)start();
  if(e.target.closest('[data-a="logout"]')){try{localStorage.removeItem('fin.auth');localStorage.removeItem(KEY)}catch(x){}
    if(CLOUD.tok&&window.google)google.accounts.oauth2.revoke(CLOUD.tok,()=>{});location.reload()}});
render();initG();
