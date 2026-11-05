const est=o=>o.fa<=0?'ok':(o.pt>0.001?'par':'pen');
function estChips(rows){const E=S.est||'all',n=k=>k==='all'?rows.length:rows.filter(o=>est(o)===k).length;return `<div class="chips">${[['all','Todos'],['ok','Al corriente'],['pen','Pendientes'],['par','Abonos parciales']].map(([k,l])=>`<button class="chip${E===k?' on':''}" data-a="est" data-v="${k}">${l} (${n(k)})</button>`).join('')}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
  if(a==='est'){S.est=b.dataset.v;render()}else if(a==='wapp'){const x=D.ing.find(y=>y.id===b.dataset.id);if(x)waSend(x)}});
