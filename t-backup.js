function dl(n,t,m){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([t],{type:m}));a.download=n;document.body.appendChild(a);a.click();a.remove()}
function respaldo(){dl('tesoreria-respaldo-'+iso()+'.json',JSON.stringify(D,null,1),'application/json');toast('Respaldo descargado')}
function csv(t){const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"',R=t==='i'?[['Folio','Fecha','Padre/Madre','Alumno(a)','Concepto','Forma de pago','Monto','Estado'],...D.ing.map(x=>[x.f,x.d,x.p,x.a,x.c,x.fp,x.m,x.x?'Cancelado':'Vigente'])]:[['Fecha','Descripción','Proveedor','Categoría','Ticket/Factura','Autorizó','Evento','Monto'],...D.gas.map(x=>[x.d,x.s,x.pv,x.ct,x.tk,x.au,x.ev,x.m])];
  dl((t==='i'?'ingresos-':'gastos-')+iso()+'.csv','\ufeff'+R.map(r=>r.map(q).join(',')).join('\n'),'text/csv')}
function restaurar(f){const r=new FileReader();r.onload=()=>{try{const o=JSON.parse(r.result);if(!Array.isArray(o.ing)||!Array.isArray(o.gas)||!o.cfg)throw 0;
  if(!confirm('Esto reemplaza TODOS los datos actuales por el respaldo ('+o.ing.length+' recibos, '+o.gas.length+' gastos). ¿Continuar?'))return;D=o;D.alu=D.alu||[];save();render();toast('Respaldo restaurado')}catch(e){toast('El archivo no es un respaldo válido')}};r.readAsText(f)}
document.addEventListener('toggle',e=>{const d=e.target;if(d.classList&&d.classList.contains('sec')){S.o=S.o||{};S.o[d.dataset.t]=d.open}},true);
