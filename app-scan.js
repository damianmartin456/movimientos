// Escanear tickets (OCR en el navegador) y leer avisos pegados del banco
const TJS='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
const loadT=()=>window.Tesseract?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src=TJS;s.onload=ok;s.onerror=()=>no(new Error('No pude cargar el lector de tickets. Revisa tu conexión a internet.'));document.head.appendChild(s)});
async function prepImg(f){const i=await new Promise((ok,no)=>{const m=new Image();m.onload=()=>ok(m);m.onerror=()=>no(new Error('No pude abrir la imagen.'));m.src=URL.createObjectURL(f)}),k=Math.min(1,1600/Math.max(i.width,i.height)),c=document.createElement('canvas');c.width=Math.round(i.width*k);c.height=Math.round(i.height*k);const x=c.getContext('2d');x.filter='grayscale(1) contrast(1.4)';x.drawImage(i,0,0,c.width,c.height);return c}
async function ocrImg(f,st){await loadT();const c=await prepImg(f);let w;try{w=await Tesseract.createWorker('spa',1,{logger:m=>{if(m.status==='recognizing text')st(Math.round(m.progress*100)+'%')}})}catch(e){w=await Tesseract.createWorker('eng')}const r=await w.recognize(c);await w.terminate();return r.data.text}
const amtsIn=l=>(l.match(/\d{1,3}(?:[.,\s]\d{3})*[.,]\d{2}(?!\d)|\d+[.,]\d{2}(?!\d)/g)||[]).map(x=>pNum(x.replace(/\s/g,''))).filter(n=>n>0&&n<1e7);
const tcase=s=>s===s.toUpperCase()?s.toLowerCase().replace(/(^|\s)\S/g,x=>x.toUpperCase()):s;
function parseTicket(t){t=String(t||'');const L=t.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);let m=0,d=null,c='';
  for(let i=L.length-1;i>=0&&!m;i--){const l=L[i];if(/total|importe|a pagar|monto|cargo|compra por|pago/i.test(l)&&!/sub\s*-?\s*total|iva|cambio|efectivo|recib/i.test(l)){const a=amtsIn(l);if(a.length)m=Math.max(...a)}}
  if(!m){const b=t.match(/(?:MXN|MN|\$)\s*(\d[\d.,]*)/i);if(b){const n=pNum(b[1]);if(n>0)m=n}}
  if(!m){const all=L.flatMap(amtsIn);if(all.length)m=Math.max(...all)}
  const dm=t.match(/\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}|\d{4}-\d{2}-\d{2}/);if(dm){const x=pDate(dm[0]);if(x&&x<=iso(0)&&+x.slice(5,7)>=1&&+x.slice(5,7)<=12)d=x}
  let bm=t.match(/(?:comercio|compra en|cargo en|pago en|compra con tu tarjeta|compra con tarjeta)\s*:?\s*\n?\s*([A-Za-zÁÉÍÓÚÑáéíóúñ][A-Za-zÁÉÍÓÚÑáéíóúñ0-9&.' -]{2,28})/i);
  if(!bm&&L.length<=3)bm=t.match(/\ben\s+([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ0-9&.' ]{2,28})/);
  if(bm)c=bm[1].replace(/\b(MXN|MN|USD|M\.N\.)\b.*$/i,'').replace(/\s+(el|con|por|a las)\s*$/i,'').trim();
  if(!c){const f=L.find(l=>(l.match(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/g)||[]).length>=3&&!/total|fecha|folio|rfc|ticket|tel/i.test(l));if(f)c=f.replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9&.' -]/g,'').trim().slice(0,30)}
  c=tcase(c||'Compra');return {m,c,d:d||iso(0),k:autoCat(c+' '+t.slice(0,300),false)}}
function scanSheet(){
  $('sheet').innerHTML=`<h2>Escanear ticket</h2><p class="m">Toma una foto del ticket o elige una captura de pantalla. La app lee el monto y el comercio y tú solo confirmas.</p><div class="row" style="flex-wrap:wrap;justify-content:flex-start"><label class="btn" style="cursor:pointer">📷 Tomar foto<input type="file" accept="image/*" capture="environment" id="sc1" hidden></label><label class="btn g" style="cursor:pointer">🖼 Elegir imagen<input type="file" accept="image/*" id="sc2" hidden></label></div><label class="f" style="margin-top:14px"><span>O pega el texto de un correo o aviso de tu banco</span><textarea id="sct" rows="3" placeholder="Compra con tu tarjeta · Netflix MXN 449,00" style="width:100%;font:inherit;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px"></textarea></label><div class="m" id="scs" role="status" style="min-height:18px;margin-bottom:8px"></div><div class="row"><button class="btn" id="scg" style="flex:1;padding:13px">Leer texto pegado</button><button class="btn g" id="scc" style="padding:13px">Cerrar</button></div>`;
  $('scrim').classList.add('open');
  const go=async f=>{if(!f)return;const s=$('scs');s.textContent='Preparando lector… (la primera vez descarga el modelo de texto)';try{const t=await ocrImg(f,p=>{s.textContent='Leyendo ticket… '+p});scanConfirm(parseTicket(t),t)}catch(e){s.textContent=e.message||'No pude leer la imagen. Prueba con más luz o escribe el gasto.'}};
  $('sc1').onchange=e=>go(e.target.files[0]);$('sc2').onchange=e=>go(e.target.files[0]);
  $('scg').onclick=()=>{const t=$('sct').value.trim();if(!t){$('scs').textContent='Pega primero el texto del aviso.';return}scanConfirm(parseTicket(t),t)};$('scc').onclick=close}
function scanConfirm(p,raw){
  sheet('Confirma el movimiento',[{k:'t',l:'Tipo',o:[['out','Gasto'],['in','Ingreso']],v:'out'},{k:'c',req:1,l:'Concepto',v:p.c},{k:'a',req:1,l:'Monto',type:'number',v:p.m||''},{k:'d',l:'Fecha',type:'date',v:p.d},{k:'k',l:'Categoría',o:OUT,v:p.k},{k:'acc',l:'Cuenta',o:accO(),v:D.acc[0]&&D.acc[0].id}],o=>{
    const a=parseFloat(o.a),d=o.d||iso(0);if(!o.c.trim())return 'Escribe el concepto.';if(!(a>0))return 'Ingresa un monto mayor a cero.';
    if(D.tx.some(x=>x.d===d&&x.a===a&&norm(x.c)===norm(o.c))&&!confirm('Ya hay un movimiento igual ese día. ¿Agregarlo de todos modos?'))return 'No se agregó.';
    if(o.k!==p.k&&o.t==='out'){D.rules=D.rules||{};D.rules[norm(o.c).slice(0,24)]=o.k}
    D.tx.push({id:Date.now()+Math.random(),t:o.t,c:o.c.trim(),k:o.t==='in'?'Ingresos':o.k,tag:'Generales',a,d,acc:o.acc});toast('Movimiento agregado')},
    {top:raw?`<details style="margin-bottom:10px"><summary class="m" style="cursor:pointer">Ver texto leído</summary><pre style="white-space:pre-wrap;font-size:11px;color:var(--mute);margin:6px 0 0">${esc(String(raw).slice(0,800))}</pre></details>`:''})}
document.addEventListener('click',e=>{if(e.target.closest('[data-a="scan"]'))scanSheet()});
