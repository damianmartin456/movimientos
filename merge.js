// Fusión de cambios entre dispositivos (tres vías: base, local, remoto)
const baseK=()=>KEY+'.base';
function getBase(){try{return JSON.parse(localStorage.getItem(baseK()))}catch(e){return null}}
function saveBase(s){try{localStorage.setItem(baseK(),typeof s==='string'?s:JSON.stringify(s))}catch(e){}}
const SPEC=()=>D&&D.ing?{arr:{ing:x=>x.id,gas:x=>x.id,alu:x=>String(x.a).trim().toLowerCase()},obj:['cfg'],max:['fol','rep'],cal:1}:{arr:{tx:x=>x.id,acc:x=>x.id,goals:x=>x.id,rec:x=>x.id,cards:x=>x.id,loans:x=>x.id,cats:x=>x.n},obj:['bud','rules']};
function mergeD(B,L,R,sp){B=B||{};const J=JSON.stringify,newer=(L.u||0)>=(R.u||0),out=JSON.parse(J(R));
  const arr=(b,l,r,kf)=>{b=b||[];l=l||[];r=r||[];const mb=new Map(b.map(x=>[kf(x),x])),ml=new Map(l.map(x=>[kf(x),x])),mr=new Map(r.map(x=>[kf(x),x])),res=[];
    [...new Set([...r.map(kf),...l.map(kf)])].forEach(k=>{const xb=mb.get(k),xl=ml.get(k),xr=mr.get(k);
      if(xl&&xr)res.push(xb&&J(xr)===J(xb)?xl:xb&&J(xl)===J(xb)?xr:newer?xl:xr);
      else if(xl){if(!xb)res.push(xl)}else if(xr){if(!xb)res.push(xr)}});return res};
  const obj=(b,l,r)=>{b=b||{};l=l||{};r=r||{};const o={...r};
    Object.keys(l).forEach(k=>{if(!(k in r)){if(!(k in b))o[k]=l[k]}else if(J(l[k])!==J(r[k])){const lc=J(l[k])!==J(b[k]),rc=J(r[k])!==J(b[k]);if(lc&&(!rc||newer))o[k]=l[k]}});
    Object.keys(r).forEach(k=>{if(!(k in l)&&k in b&&J(r[k])===J(b[k]))delete o[k]});return o};
  Object.keys(sp.arr).forEach(f=>{out[f]=arr(B[f],L[f],R[f],sp.arr[f])});
  (sp.obj||[]).forEach(f=>{out[f]=obj(B[f],L[f],R[f])});
  (sp.max||[]).forEach(f=>{out[f]=Math.max(L[f]||0,R[f]||0)});
  if(sp.cal&&(L.cal||R.cal)){const b=B.cal||{},l=L.cal||{},r=R.cal||{};out.cal={...obj(b,l,r),ev:arr(b.ev,l.ev,r.ev,x=>x.id)}}
  return out}
function dupFol(){const m={};(D.ing||[]).forEach(x=>{if(x.f)m[x.f]=(m[x.f]||0)+1});return Object.keys(m).find(k=>m[k]>1)||''}
async function sync(init){
  setSt(init?'Cargando desde Drive…':'Guardando en Drive…');
  const r=await pull(),B=getBase();
  if(!r){await push();return}
  if(B&&r.u===B.u){if((D.u||0)>B.u)await push();else setSt('Sincronizado');return}
  if(!B&&r.u===(D.u||0)){saveBase(r);setSt('Sincronizado');return}
  const M=mergeD(B,D,r,SPEC());M.u=Date.now();const ch=JSON.stringify(M)!==JSON.stringify(D);D=M;
  try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}
  if(typeof syncCats==='function'){D.cats=D.cats||[];syncCats()}
  await push();
  if(ch&&!init&&typeof render==='function')render();
  const d=dupFol();if(d&&typeof toast==='function')toast('Atención: hay folios repetidos ('+d+'). Revísalos en Ingresos.')}
