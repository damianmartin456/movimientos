function vMov(){
  const q=S.q.trim().toLowerCase();
  const rows=D.tx.filter(x=>inR(x)&&(S.type==='all'||x.t===S.type)&&(S.tag==='all'||x.tag===S.tag)&&(!q||(x.c+' '+x.k+' '+x.tag).toLowerCase().includes(q))).sort((a,b)=>b.d.localeCompare(a.d)||b.id-a.id);
  let h=`<div class="chips">${chips('per',[['dia','Día'],['sem','Semana'],['mes','Mes'],['ano','Año']],S.p)}</div><div class="sum"><div class="bal"><small>Balance total en cuentas</small><b>${money(D.acc.reduce((s,a)=>s+bal(a),0))}</b></div><div><small>Ingresos${PL[S.p]}</small><b class="in">${money(sumR('in'))}</b></div><div><small>Gastos${PL[S.p]}</small><b class="out">${money(sumR('out'))}</b></div></div>${vSem()}
  <label class="search"><input id="q" type="search" placeholder="Buscar transacciones…" value="${esc(S.q)}" aria-label="Buscar"></label>
  <div class="chips">${chips('type',[['all','Todos'],['in','Ingresos'],['out','Gastos'],['tr','Transferencias']],S.type)}</div>
  <div class="chips tags">${chips('tag',[['all','Todos'],...TAGS.map(t=>[t,t])],S.tag)}</div>`;
  if(!rows.length)return h+'<div class="empty">No hay movimientos con esos filtros. Toca + para agregar uno.</div>';
  let last='';
  rows.forEach(x=>{if(x.d!==last){h+=`<div class="dh">${dlabel(x.d)}</div>`;last=x.d}
    h+=`<div class="tx list" data-a="edit" data-id="${x.id}" style="flex-direction:row"><span style="display:contents">${ico(x.t==='tr'?'Transferencia':x.k)}</span><div class="mid"><b>${esc(x.c)}</b><span class="m">${x.t==='tr'?accName(x.acc)+' → '+accName(x.to):x.k+' · '+accName(x.acc)+(x.lo?' · '+esc(x.lo):'')}</span></div><div class="amt ${x.t}">${x.t==='out'?'−':x.t==='in'?'+':''}${money(x.a)}</div></div>`});
  return h}

function vRes(){
  const by={};D.tx.filter(x=>inM(x)&&x.t==='out').forEach(x=>by[x.k]=(by[x.k]||0)+x.a);
  const tot=Object.values(by).reduce((a,b)=>a+b,0),ents=Object.entries(by).sort((a,b)=>b[1]-a[1]);
  let off=0;const arcs=ents.map(([k,v])=>{const l=v/tot*251.3,s=`<circle r="40" cx="60" cy="60" fill="none" stroke="${cat(k)[0]}" stroke-width="16" stroke-dasharray="${l} ${251.3-l}" stroke-dashoffset="${-off}" transform="rotate(-90 60 60)"/>`;off+=l;return s}).join('');
  const ms=[];for(let i=5;i>=0;i--){const d=new Date(S.m+'-15T12:00');d.setMonth(d.getMonth()-i);ms.push(d.toISOString().slice(0,7))}
  const f=(m,t)=>D.tx.filter(x=>x.d.startsWith(m)&&x.t===t).reduce((s,x)=>s+x.a,0),mx=Math.max(1,...ms.flatMap(m=>[f(m,'in'),f(m,'out')]));
  const bars=ms.map((m,i)=>{const a=f(m,'in')/mx*90,b=f(m,'out')/mx*90,x=12+i*48;return `<rect x="${x}" y="${100-a}" width="16" height="${a}" rx="3" fill="#4ade80"/><rect x="${x+18}" y="${100-b}" width="16" height="${b}" rx="3" fill="#f0566a"/><text x="${x+17}" y="116" text-anchor="middle" font-size="10" fill="#8b9bb0">${new Date(m+'-15T12:00').toLocaleDateString('es-MX',{month:'short'})}</text>`}).join('');
  return `<h3>Gastos por categoría</h3><div class="box">${tot?`<svg viewBox="0 0 120 120" width="150" height="150" style="display:block;margin:0 auto">${arcs}<text x="60" y="64" text-anchor="middle" font-size="13" font-weight="600" fill="#f2f5f3">${money(tot)}</text></svg><div class="legend">${ents.map(([k,v])=>`<div><i style="background:${cat(k)[0]}"></i>${k} <b>${Math.round(v/tot*100)}%</b></div>`).join('')}</div>`:'<div class="empty">Sin gastos este mes.</div>'}</div>
  <h3>Ingresos y gastos</h3><div class="box"><svg viewBox="0 0 300 122" width="100%" role="img" aria-label="Ingresos y gastos de los últimos seis meses">${bars}</svg><div class="m"><span class="in">■</span> Ingresos &nbsp; <span class="out">■</span> Gastos</div></div>
  <h3>Reportes e importación</h3><div class="row" style="flex-wrap:wrap;justify-content:flex-start"><button class="btn" data-a="repf">Imprimir reporte</button><button class="btn g" data-a="impo">Importar estado de cuenta</button><button class="btn g" data-a="csv">Exportar CSV</button></div>`}

