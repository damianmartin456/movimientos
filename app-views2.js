function vBud(){
  return `<h3>Presupuesto de ${mlabel(S.m)}</h3><div class="stack">`+OUT.map(k=>{
    const sp=D.tx.filter(x=>inM(x)&&x.t==='out'&&x.k===k).reduce((s,x)=>s+x.a,0),l=D.bud[k]||0,p=l?sp/l*100:0;
    return `<div class="box"><div class="row"><div class="row" style="justify-content:flex-start">${ico(k)}<b>${k}</b></div><input class="in2" type="number" inputmode="numeric" min="0" placeholder="Límite" value="${l||''}" data-a="bud" data-k="${k}" aria-label="Límite de ${k}"></div>
    <div class="bar"><i style="width:${Math.min(100,p)}%;background:${p>=100?'var(--red)':p>=80?'var(--amb)':'var(--mint)'}"></i></div><span class="m">${money(sp)} gastado${l?' de '+money(l)+' · '+(sp>l?'te pasaste '+money(sp-l):'quedan '+money(l-sp)):' · sin límite'}</span></div>`}).join('')+'</div>'}

function vMas(){
  return `<h3>Cuentas y tarjetas <button class="btn g" data-a="nacc">+ Cuenta</button></h3><div class="stack">${D.acc.map(a=>`<div class="box row"><b>${esc(a.n)}</b><span class="row"><span class="amt ${bal(a)<0?'out':''}">${money(bal(a))}</span><button class="x" data-a="dacc" data-id="${a.id}" aria-label="Eliminar ${esc(a.n)}">×</button></span></div>`).join('')}</div>
  <h3>Metas de ahorro <button class="btn g" data-a="ngoal">+ Meta</button></h3><div class="stack">${D.goals.map(g=>{const p=Math.min(100,g.s/g.t*100);return `<div class="box"><div class="row"><b>${esc(g.n)}</b><button class="x" data-a="dgoal" data-id="${g.id}" aria-label="Eliminar meta">×</button></div><div class="bar"><i style="width:${p}%"></i></div><div class="row"><span class="m">${money(g.s)} de ${money(g.t)} · ${Math.round(p)}%</span><input class="in2" type="number" inputmode="numeric" placeholder="+ Abonar" data-a="abono" data-id="${g.id}" aria-label="Abonar a ${esc(g.n)}"></div></div>`}).join('')||'<div class="empty">Crea tu primera meta.</div>'}</div>
  <h3>Recurrentes <button class="btn g" data-a="nrec">+ Recurrente</button></h3><div class="stack">${D.rec.map(r=>`<div class="box row"><div><b>${esc(r.c)}</b><br><span class="m">Día ${r.day} de cada mes · ${accName(r.acc)}</span></div><span class="row"><span class="amt ${r.t}">${money(r.a)}</span><button class="x" data-a="drec" data-id="${r.id}" aria-label="Eliminar ${esc(r.c)}">×</button></span></div>`).join('')||'<div class="empty">Sin movimientos recurrentes.</div>'}</div>${cloudBox()}`}

const TT={mov:'Movimientos',res:'Resumen',bud:'Presupuestos',mas:'Más'};
function render(){
  $('ttl').textContent=TT[S.v];$('mn').style.visibility=S.v==='mas'?'hidden':'';$('ml').textContent=mlabel(S.m);
  $('nav').innerHTML=Object.entries(TT).map(([k,l])=>`<button class="${k===S.v?'on':''}" data-a="tab" data-v="${k}">${l}</button>`).join('')+'<a href="tesoreria.html">Tesorería</a>';
  $('v').innerHTML={mov:vMov,res:vRes,bud:vBud,mas:vMas}[S.v]();
  const q=$('q');if(q)q.oninput=e=>{S.q=e.target.value;const p=e.target.selectionStart;render();const n=$('q');n.focus();n.setSelectionRange(p,p)}}

