const GOOGLE_CLIENT_ID='675111410318-otck2br7ui5hm2kb18das1ulu9i5pcth.apps.googleusercontent.com',KEY='tesoreria.v1';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
const money=n=>n.toLocaleString('es-MX',{style:'currency',currency:'MXN'});
const iso=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const fd=d=>new Date(d+'T12:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'});
let VIB=true;try{VIB=localStorage.getItem('fin.vib')!=='0'}catch(e){}
const vib=p=>{if(VIB&&navigator.vibrate)try{navigator.vibrate(p)}catch(e){}};
let D;try{D=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!D)D={cfg:{escuela:'',grupo:'',ciclo:'',tesorero:''},ing:[],gas:[],fol:0};
const save=()=>{D.u=Date.now();try{localStorage.setItem(KEY,JSON.stringify(D))}catch(e){}window.cloudPush&&cloudPush()};
const S={v:'res',q:''};
const sum=a=>a.reduce((s,x)=>s+x.m,0),act=()=>D.ing.filter(x=>!x.x),folio=n=>'R-'+String(n).padStart(4,'0');
const TT={res:'Resumen',ing:'Ingresos',cuo:'Cuotas',gas:'Gastos',aj:'Ajustes'};
const saldo=()=>(+D.cfg.ini||0)+sum(act())-sum(D.gas);
const close=()=>$('scrim').classList.remove('open');
function toast(m){$('tm').textContent=m;$('toast').classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>$('toast').classList.remove('on'),3000)}
function porAlumno(q){const m={};act().forEach(x=>{const k=x.a.trim().toLowerCase(),o=m[k]||(m[k]={a:x.a.trim(),p:new Set(),t:0,n:0});o.p.add(x.p.trim());o.t+=x.m;o.n++});
  q=q.trim().toLowerCase();return Object.values(m).filter(o=>!q||(o.a+' '+[...o.p].join(' ')).toLowerCase().includes(q)).sort((a,b)=>a.a.localeCompare(b.a,'es'))}
