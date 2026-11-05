(function(){
  const g=id=>document.getElementById(id),S0=sheet,isOpt=l=>/opcional/i.test(l||'');
  const val=(o,k)=>String(o[k]==null?'':o[k]).trim(),badN=(f,v)=>f.type==='number'&&!(parseFloat(v)>0);
  const mark=ks=>ks.forEach((k,i)=>{const e=g('f_'+k);if(e){e.classList.add('bad');if(i===0)try{e.focus();e.scrollIntoView({block:'center',behavior:'smooth'})}catch(x){}}});
  const shake=()=>{const s=g('sheet');if(s){s.classList.remove('shake');void s.offsetWidth;s.classList.add('shake')}};
  sheet=function(title,fields,onSave,x){
    const wrapped=o=>{document.querySelectorAll('#sheet .bad').forEach(e=>e.classList.remove('bad'));
      const bad=[];let msg='';fields.forEach(f=>{const r=typeof f.req==='function'?f.req(o):f.req;if(!r)return;const v=val(o,f.k);if(!v)bad.push(f.k);else if(badN(f,v)){bad.push(f.k);msg='El monto debe ser mayor a cero.'}});
      if(bad.length){mark(bad);shake();return msg||'Completa los campos marcados en rojo.'}
      const r=onSave(o);
      if(r){shake();const num=/monto|mayor a cero|ingresa/i.test(r),c=fields.filter(f=>!isOpt(f.l)&&!f.o&&f.type!=='file'&&(!num||f.type==='number')),t=c.find(f=>{const v=val(o,f.k);return !v||badN(f,v)})||c[0];if(t)mark([t.k])}
      return r};
    S0(title,fields,wrapped,x);
    fields.forEach(f=>{const e=g('f_'+f.k);if(e)e.addEventListener('input',()=>e.classList.remove('bad'))})};
  // indicador de sincronización en la barra superior
  const top=document.querySelector('.top');let sy=null;
  if(top){sy=document.createElement('span');sy.id='sy';sy.className='sy';sy.setAttribute('role','status');top.insertBefore(sy,top.children[1]||null)}
  const cl=()=>{try{return CLOUD}catch(e){return null}},st=()=>{const CLOUD=cl();if(!CLOUD)return ['gray','Local','Guardado localmente'];const s=CLOUD.st||'';
    if(!navigator.onLine)return ['gray','Sin conexión','Sin conexión · guardado localmente'];if(!CLOUD.tok)return ['gray','Local','Guardado localmente · toca para sincronizar'];
    if(/^(Guardando|Cargando|Cambios sin)/.test(s))return ['amb','Sincronizando…','Sincronizando con Google Drive…'];
    if(/Error|No se pudo/i.test(s))return ['red','Sin sincronizar','Error al sincronizar · toca para reintentar'];return ['grn','Sincronizado','Sincronizado con Google Drive']};
  const paint=()=>{if(!sy)return;const [c,s,f]=st();sy.className='sy '+c;sy.title=f;sy.innerHTML='<i></i><span class="s">'+s+'</span><span class="f">'+f+'</span>'};
  setInterval(paint,1000);paint();addEventListener('online',paint);addEventListener('offline',paint);
  document.addEventListener('click',e=>{const CLOUD=cl();if(!e.target.closest('#sy')||!CLOUD)return;
    if(!CLOUD.tok||/Error|No se pudo/i.test(CLOUD.st||'')){(CLOUD.tc?getTok(!!CLOUD.tok):Promise.reject()).then(start).catch(()=>{const l=g('login');if(l)l.style.display='flex'})}else start()});
})();
