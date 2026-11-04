// formulario genérico en hoja inferior
function sheet(title,fields,onSave,extra){
  $('sheet').innerHTML=`<h2>${title}</h2>${extra&&extra.top||''}`+fields.map(f=>`<label class="f"><span>${f.l}</span>${f.o?`<select id="f_${f.k}">${f.o.map(o=>{const[v,l]=Array.isArray(o)?o:[o,o];return `<option value="${v}"${v===f.v?' selected':''}>${l}</option>`}).join('')}</select>`:`<input id="f_${f.k}" type="${f.type||'text'}" ${f.type==='number'?'inputmode="decimal" min="0" step="0.01"':''} value="${esc(f.v??'')}" placeholder="${f.p||''}">`}</label>`).join('')+`<div class="err" id="err"></div><div class="row"><button class="btn" id="sv" style="flex:1;padding:13px">Guardar</button>${extra&&extra.del?'<button class="btn g" id="dl" style="padding:13px">Eliminar</button>':''}</div>`;
  $('scrim').classList.add('open');
  $('sv').onclick=()=>{const o={};fields.forEach(f=>o[f.k]=$('f_'+f.k).value);const e=onSave(o);if(e){vib([70,60,70]);$('err').textContent=e}else{vib([25,50,40]);$('scrim').classList.remove('open');save();render()}};
  if(extra&&extra.del)$('dl').onclick=()=>{vib(60);$('scrim').classList.remove('open');extra.del()};
  if(extra&&extra.init)extra.init()}
const close=()=>$('scrim').classList.remove('open');
const accO=()=>D.acc.map(a=>[a.id,a.n]);

function txSheet(x){
  const ed=!!x;x=x||{t:'out',k:'Mercado',tag:'Generales',d:iso(0),acc:D.acc[0]&&D.acc[0].id};
  const top=ed?'':`<div class="voice"><input id="vi" placeholder="Di o escribe: gasté 250 en café con débito" aria-label="Captura con IA"><button class="btn g" id="mic" aria-label="Dictar">🎤</button><button class="btn" id="go">IA</button></div>`;
  sheet(ed?'Editar movimiento':'Nuevo movimiento',[{k:'t',l:'Tipo',o:[['out','Gasto'],['in','Ingreso'],['tr','Transferencia']],v:x.t},{k:'c',l:'Concepto',v:x.c,p:'Ej. Tacos, Nómina'},{k:'a',l:'Monto',type:'number',v:x.a,p:'0.00'},{k:'k',l:'Categoría',o:[...OUT,'Ingresos'],v:x.k},{k:'acc',l:'Cuenta',o:accO(),v:x.acc},{k:'to',l:'Cuenta destino (solo transferencias)',o:accO(),v:x.to||x.acc},{k:'tag',l:'Etiqueta',o:TAGS,v:x.tag},{k:'d',l:'Fecha',type:'date',v:x.d},{k:'lo',l:'Ubicación (opcional)',v:x.lo,p:'Ej. Jumbo Ágora'},...(ed?[]:[{k:'rp',l:'Repetir',o:['Nunca','Semanal','Mensual','Anual'],v:'Nunca'}])],o=>{
    const a=parseFloat(o.a);if(o.t!=='tr'&&!o.c.trim())return 'Escribe un concepto.';if(!(a>0))return 'Ingresa un monto mayor a cero.';
    if(o.t==='tr'&&o.acc===o.to)return 'Elige cuentas distintas.';
    const n={id:x.id||Date.now(),t:o.t,c:o.t==='tr'?'Transferencia':o.c.trim(),a,k:o.t==='in'?'Ingresos':o.k,tag:o.tag,d:o.d||iso(0),acc:o.acc,to:o.t==='tr'?o.to:undefined,lo:o.lo.trim()};
    if(ed&&x.k!==n.k&&n.t!=='tr'){D.rules=D.rules||{};D.rules[norm(n.c).slice(0,24)]=n.k}
    if(!ed&&o.t!=='tr'&&o.rp&&o.rp!=='Nunca')D.rec.push({id:'r'+Date.now(),t:o.t,c:n.c,a,k:n.k,acc:o.acc,f:o.rp,nx:addD(n.d,o.rp),lo:n.lo});
    D.tx=ed?D.tx.map(y=>y.id===x.id?n:y):[...D.tx,n]},
    {top,del:ed?()=>{const old=x;D.tx=D.tx.filter(y=>y.id!==old.id);save();render();toast('Movimiento eliminado',()=>{D.tx.push(old);save();render()})}:null,init:ed?null:voiceInit});
}
function fill(j){const s=(k,v)=>{const e=$('f_'+k);if(e&&v!=null&&[...(e.options||[{value:v}])].some(o=>o.value==v))e.value=v};
  s('t',j.t);if(j.c)$('f_c').value=j.c;if(j.a)$('f_a').value=j.a;s('k',j.k);s('tag',j.tag);if(j.d)$('f_d').value=j.d;const a=D.acc.find(a=>a.n.toLowerCase()===String(j.acc||'').toLowerCase());if(a)s('acc',a.id)}
async function ai(){
  const t=$('vi').value.trim();if(!t)return;$('err').textContent='Interpretando…';
  try{const sm=window.claude&&await claude.use('sample');if(!sm){fill(parseVoz(t));$('err').textContent='Interpretado sin IA: revisa los datos y guarda.';return}
    const j=await sm.json(`Hoy es ${iso(0)}. Convierte esta frase de finanzas personales en JSON con exactamente estas claves: t ("out" gasto, "in" ingreso, "tr" transferencia), c (concepto corto), a (número), k (una de ${[...OUT,'Ingresos'].join(', ')}), tag (una de ${TAGS.join(', ')}), acc (una de ${D.acc.map(a=>a.n).join(', ')} o null), d (fecha AAAA-MM-DD; "ayer" = ${iso(1)}). Responde solo el JSON. Frase: "${t.replace(/"/g,"'")}"`,{modelTier:'quick'});
    fill(j);$('err').textContent='Listo: revisa los datos y guarda.'}catch(e){$('err').textContent='No pude interpretarlo. Intenta de nuevo o llena el formulario.'}}
function voiceInit(){
  $('go').onclick=ai;$('vi').onkeydown=e=>{if(e.key==='Enter')ai()};
  $('mic').onclick=()=>{const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){$('err').textContent='Este navegador no dicta: escribe la frase y toca IA.';return}
    try{const r=new R();r.lang='es-MX';r.onresult=e=>{$('vi').value=e.results[0][0].transcript;ai()};r.onerror=()=>{$('err').textContent='No pude escuchar. Escribe la frase.'};r.start();$('err').textContent='Escuchando…'}catch(e){$('err').textContent='No pude usar el micrófono.'}}}

document.addEventListener('click',e=>{
  if(e.target===$('scrim'))return close();
  const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,id=b.dataset.id,v=b.dataset.v;vib(15);
  if(a==='tab'){S.v=v;render()}
  else if(a==='mp'||a==='mx'){S.ref=stp(S.ref,a==='mx'?1:-1,S.v==='mov'?S.p:'mes');S.m=S.ref.slice(0,7);render()}
  else if(a==='per'){S.p=v;render()}else if(a==='ncat')catSheet();else if(a==='ecat')catSheet(v);else if(a==='repf')repSheet();else if(a==='impo')impSheet();else if(a==='ncard')cardSheet();else if(a==='ecard')cardSheet(id);else if(a==='nloan')loanSheet();else if(a==='eloan')loanSheet(id);else if(a==='abono')abonoSheet(id);else if(a==='wloan')wLoan(id);else if(a==='ics')icsEx()
  else if(a==='type'){S.type=v;render()}else if(a==='tag'){S.tag=v;render()}
  else if(a==='new')txSheet();
  else if(a==='edit')txSheet(D.tx.find(x=>String(x.id)===id));
  else if(a==='nacc')sheet('Nueva cuenta',[{k:'n',l:'Nombre',p:'Ej. Tarjeta Nu'},{k:'s',l:'Saldo inicial',type:'number',v:0}],o=>{if(!o.n.trim())return 'Escribe un nombre.';D.acc.push({id:'a'+Date.now(),n:o.n.trim(),s:parseFloat(o.s)||0})});
  else if(a==='ngoal')sheet('Nueva meta',[{k:'n',l:'Nombre',p:'Ej. Laptop'},{k:'t',l:'Monto objetivo',type:'number'}],o=>{if(!o.n.trim()||!(+o.t>0))return 'Completa nombre y monto.';D.goals.push({id:'g'+Date.now(),n:o.n.trim(),t:+o.t,s:0})});
  else if(a==='nrec')sheet('Nuevo recurrente',[{k:'t',l:'Tipo',o:[['out','Gasto'],['in','Ingreso']]},{k:'c',l:'Concepto',p:'Ej. Renta'},{k:'a',l:'Monto',type:'number'},{k:'k',l:'Categoría',o:[...OUT,'Ingresos']},{k:'acc',l:'Cuenta',o:accO()},{k:'day',l:'Día del mes (1-28)',type:'number',v:1}],o=>{if(!o.c.trim()||!(+o.a>0))return 'Completa concepto y monto.';const d=Math.min(28,Math.max(1,parseInt(o.day)||1));D.rec.push({id:'r'+Date.now(),t:o.t,c:o.c.trim(),a:+o.a,k:o.t==='in'?'Ingresos':o.k,acc:o.acc,day:d,last:cur})});
  else if(a==='dacc'){if(D.tx.some(x=>x.acc===id||x.to===id))return toast('Esa cuenta tiene movimientos');D.acc=D.acc.filter(x=>x.id!==id);save();render()}
  else if(a==='dgoal'){D.goals=D.goals.filter(x=>x.id!==id);save();render()}
  else if(a==='drec'){D.rec=D.rec.filter(x=>x.id!==id);save();render()}
  else if(a==='csv')exportCsv();
});
document.addEventListener('change',e=>{const t=e.target,a=t.dataset.a;
  if(a==='bud'){D.bud[t.dataset.k]=Math.max(0,+t.value||0);save();render()}
  else if(a==='abono'){const g=D.goals.find(x=>x.id===t.dataset.id),n=+t.value;if(g&&n>0){g.s+=n;save();render()}}});
document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
async function exportCsv(){
  const rows=[['fecha','tipo','concepto','categoria','etiqueta','cuenta','monto'],...D.tx.sort((a,b)=>a.d.localeCompare(b.d)).map(x=>[x.d,x.t,x.c,x.k,x.tag,accName(x.acc),x.a])];
  const csv='\ufeff'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n');
  try{const d=window.claude&&await claude.use('downloads');if(!d)return toast('La descarga no está disponible aquí');await d.save({filename:'movimientos.csv',data:csv})}catch(e){if(!e||e.code!=='declined')toast('No se pudo exportar')}}
