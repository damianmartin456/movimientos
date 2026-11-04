const GOOGLE_CLIENT_ID='675111410318-otck2br7ui5hm2kb18das1ulu9i5pcth.apps.googleusercontent.com';
const IC={Mercado:['#34d399','M9 20a1 1 0 1 0 0 .01M18 20a1 1 0 1 0 0 .01M2 3h3l2.7 12.4a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6'],Restaurantes:['#fb923c','M4 3v8a3 3 0 0 0 3 3v7M7 3v8M10 3v8a3 3 0 0 1-3 3M17 3c-2 2-3 5-3 8h3v10'],Transporte:['#fbbf24','M3 17h18M3 13l2-6h14l2 6v4H3zM7 17v2M17 17v2'],Entretenimiento:['#60a5fa','M2 11a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4zM7 10v4M5 12h4M16 11h.01M18 13h.01'],Salud:['#f472b6','M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z'],Viajes:['#a78bfa','M2 16l20-6L2 4v5l14 1-14 1z'],Ingresos:['#4ade80','M12 2v20M17 6H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],Transferencia:['#94a3b8','M7 7h13l-4-4M17 17H4l4 4']};
const OUT=['Mercado','Restaurantes','Transporte','Entretenimiento','Salud','Viajes'],TAGS=['Generales','Viajes','Trabajo'],KEY='movimientos.v2';
const iso=n=>{const d=new Date();d.setDate(d.getDate()-n);return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const money=n=>n.toLocaleString('es-MX',{style:'currency',currency:'MXN',minimumFractionDigits:n%1?2:0,maximumFractionDigits:2});
const cur=iso(0).slice(0,7);
let D;try{D=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!D)D={acc:[{id:'a1',n:'Efectivo',s:0},{id:'a2',n:'Débito',s:0},{id:'a3',n:'Crédito',s:0}],
tx:[],bud:{},goals:[],rec:[]};
D.cats=D.cats||DEFCATS.map(x=>({...x}));syncCats();
const save=()=>{D.u=Date.now();try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}window.cloudPush&&cloudPush()};
let VIB=true;try{VIB=localStorage.getItem('fin.vib')!=='0'}catch(e){}
const vib=p=>{if(VIB&&navigator.vibrate)try{navigator.vibrate(p)}catch(e){}};
const S={v:'mov',m:cur,ref:iso(0),p:'mes',q:'',type:'all',tag:'all'};
// recurrentes: se registran solos al llegar su día
genRec();
const accName=id=>(D.acc.find(a=>a.id===id)||{n:'—'}).n;
const bal=a=>D.tx.reduce((s,x)=>x.acc===a.id?s+(x.t==='in'?x.a:-x.a):x.to===a.id&&x.t==='tr'?s+x.a:s,a.s);
const inM=x=>x.d.startsWith(S.m);
const sumM=t=>D.tx.filter(x=>inM(x)&&x.t===t).reduce((s,x)=>s+x.a,0);
const mlabel=m=>new Date(m+'-15T12:00').toLocaleDateString('es-MX',{month:'long',year:'numeric'});
const dlabel=d=>d===iso(0)?'Hoy':d===iso(1)?'Ayer':new Date(d+'T12:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'short'});
function toast(m,fn){$('tm').textContent=m;const b=$('tu');b.textContent=fn?'Deshacer':'';b.style.display=fn?'':'none';b.onclick=()=>{fn&&fn();$('toast').classList.remove('on')};$('toast').classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('on'),4500)}
const chips=(a,items,c)=>items.map(([v,l])=>`<button class="chip${v===c?' on':''}" data-a="${a}" data-v="${v}">${l}</button>`).join('');
const ico=k=>{const [c,p]=cat(k);return `<div class="ico" style="background:${c}22;color:${c}"><svg viewBox="0 0 24 24"><path d="${p}"/></svg></div>`};

