function sheet(title,fields,onSave,x){
  $('sheet').innerHTML=`<h2>${title}</h2>`+fields.map(f=>`<label class="f"><span>${f.l}</span>${f.o?`<select id="f_${f.k}">${f.o.map(o=>`<option${o===f.v?' selected':''}>${o}</option>`).join('')}</select>`:`<input id="f_${f.k}" type="${f.type||'text'}" ${f.type==='number'?'inputmode="decimal" min="0" step="0.01"':''} ${f.dl?`list="dl_${f.k}"`:''} value="${esc(f.v)}" autocomplete="off">`}${f.dl?`<datalist id="dl_${f.k}">${f.dl.map(o=>`<option value="${esc(o)}">`).join('')}</datalist>`:''}</label>`).join('')+`<div class="err" id="err"></div><div class="row"><button class="btn" id="sv" style="flex:1;padding:13px">Guardar</button>${x&&x.del?'<button class="btn g" id="dl" style="padding:13px">Eliminar</button>':''}</div>`;
  $('scrim').classList.add('open');
  $('sv').onclick=()=>{const o={};fields.forEach(f=>o[f.k]=$('f_'+f.k).value);const e=onSave(o);if(e){vib([70,60,70]);$('err').textContent=e}else{vib([25,50,40]);close();save();render();if(sheet.after){const f=sheet.after;sheet.after=null;f()}}};
  if(x&&x.del)$('dl').onclick=x.del;if(x&&x.init)x.init()}
function ingSheet(){const u=k=>[...new Set(D.ing.map(x=>x[k]))];
  sheet('Nueva colaboración',[{k:'d',l:'Fecha',type:'date',v:iso()},{k:'p',l:'Nombre del padre/madre',dl:u('p')},{k:'tel',l:'WhatsApp del padre/madre (opcional, 10 dígitos)',type:'tel'},{k:'a',l:'Nombre del alumno(a)',dl:u('a')},{k:'c',l:'Concepto',v:'Cuota semanal',o:['Cuota diaria','Cuota semanal','Cuota mensual','Cuota anual','Cooperación','Otro']},{k:'c2',l:'Especifica el concepto',v:''},{k:'m',l:'Monto',type:'number'},{k:'fp',l:'Forma de pago',v:'Efectivo',dl:['Efectivo','Transferencia']}],o=>{
    const m=parseFloat(o.m);if(!o.p.trim()||!o.a.trim())return 'Escribe el nombre del padre/madre y del alumno(a).';if(!(m>0))return 'Ingresa un monto mayor a cero.';
    D.fol++;const x={id:'i'+Date.now(),n:D.fol,f:folio(D.fol),d:o.d||iso(),p:o.p.trim(),a:o.a.trim(),c:(o.c==='Otro'?o.c2.trim():o.c)||'Colaboración',m,fp:o.fp.trim()||'Efectivo',tel:o.tel.replace(/\D/g,'')};D.ing.push(x);sheet.after=()=>recSheet(x.id)},
    {init:()=>{const t=()=>{$('f_c2').parentElement.style.display=$('f_c').value==='Otro'?'':'none'};$('f_c').onchange=t;t();$('f_p').onchange=()=>{const m=D.ing.find(x=>x.p.toLowerCase()===$('f_p').value.trim().toLowerCase());if(m&&!$('f_a').value)$('f_a').value=m.a;if(m&&m.tel&&!$('f_tel').value)$('f_tel').value=m.tel}}})}
function gasSheet(g){const e=!!g;g=g||{d:iso()};
  sheet(e?'Editar gasto':'Nuevo gasto',[{k:'d',l:'Fecha',type:'date',v:g.d},{k:'s',l:'Descripción del gasto',v:g.s},{k:'pv',l:'Proveedor',v:g.pv,dl:[...new Set(D.gas.map(x=>x.pv))]},{k:'m',l:'Monto',type:'number',v:g.m},{k:'ct',l:'Categoría',v:g.ct,dl:['Material escolar','Papelería','Eventos','Mantenimiento','Limpieza','Otro']},{k:'tk',l:'No. de ticket o factura',v:g.tk}],o=>{
    const m=parseFloat(o.m);if(!o.s.trim())return 'Escribe la descripción del gasto.';if(!(m>0))return 'Ingresa un monto mayor a cero.';
    const n={id:g.id||'g'+Date.now(),d:o.d||iso(),s:o.s.trim(),pv:o.pv.trim(),m,ct:o.ct.trim(),tk:o.tk.trim()};D.gas=e?D.gas.map(y=>y.id===g.id?n:y):[...D.gas,n]},
    {del:e?()=>{if(confirm('¿Eliminar este gasto?')){D.gas=D.gas.filter(y=>y.id!==g.id);save();render();close()}}:null})}
function recHtml(x,tag){const c=D.cfg,r=(l,v)=>`<div class="rf"><span>${l}</span><b>${v}</b></div>`;
  return `<div class="rec${tag==='COPIA'?' cp':''}">${tag?`<div class="tg">${tag}</div>`:''}<div class="rh">${c.logo?`<img class="logo" src="${c.logo}"><br>`:''}<b>${esc(c.escuela||'Escuela')}</b><br><span>${esc([c.grupo,c.ciclo].filter(Boolean).join(' · '))}</span></div><h4>RECIBO DE COLABORACIÓN</h4>${r('Folio',x.f)}${r('Fecha',fd(x.d))}${r('Recibí de',esc(x.p))}${r('Alumno(a)',esc(x.a))}${r('Concepto',esc(x.c))}${r('Forma de pago',esc(x.fp||'Efectivo'))}<div class="rm">${money(x.m)}</div><div class="rl">${letras(x.m)}</div><div class="fi"><i></i>${esc(c.tesorero||'Tesorero(a)')}<br><small>Tesorería</small></div><div class="lg">Este recibo ampara la colaboración voluntaria entregada a la tesorería del grupo.</div>${x.x?'<div class="cx">CANCELADO</div>':''}</div>`}
function recSheet(id){const x=D.ing.find(y=>y.id===id);
  $('sheet').innerHTML=`<h2>Recibo ${x.f}</h2>${recHtml(x)}<div class="row" style="margin-top:14px;flex-wrap:wrap;justify-content:flex-start"><button class="btn" data-a="prt" data-id="${id}">Imprimir / PDF</button><button class="btn g" data-a="wa" data-id="${id}">Enviar por WhatsApp</button><button class="btn g" data-a="cpy" data-id="${id}">Copiar texto</button>${x.x?'':`<button class="btn g" data-a="cxl" data-id="${id}">Cancelar recibo</button>`}<button class="btn g" data-a="cls">Cerrar</button></div>`;$('scrim').classList.add('open')}
document.addEventListener('click',e=>{
  if(e.target===$('scrim'))return close();
  const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,id=b.dataset.id,v=b.dataset.v,x=D.ing.find(y=>y.id===id);vib(15);
  if(a==='tab'){S.v=v;S.q='';render()}
  else if(a==='new')S.v==='gas'?gasSheet():ingSheet();
  else if(a==='rec')recSheet(id);
  else if(a==='gas')gasSheet(D.gas.find(y=>y.id===id));
  else if(a==='alu'){S.q=v;S.v='ing';render()}
  else if(a==='rep')repSheet();else if(a==='edo')printEdo();
  else if(a==='prt'){$('print').innerHTML=recHtml(x,'ORIGINAL')+recHtml(x,'COPIA');window.print()}
  else if(a==='cpy'){try{navigator.clipboard.writeText(recTxt(x).replace(/\*/g,'')).then(()=>toast('Texto copiado'))}catch(err){toast('No se pudo copiar')}}
  else if(a==='wa')waSend(x)
  else if(a==='cxl'){if(confirm('¿Cancelar el recibo '+x.f+'? El folio se conserva como cancelado y deja de sumar.')){x.x=1;save();render();recSheet(id)}}
  else if(a==='cls')close()});
document.addEventListener('change',e=>{const t=e.target;if(t.dataset.a==='logo'&&t.files[0])setLogo(t.files[0]);if(t.dataset.a==='cfg'){D.cfg[t.dataset.k]=t.value.trim();save()}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
