(function(){
  const K='fin.pin',O='fin.ok',g=id=>document.getElementById(id);
  const gp=()=>{try{return JSON.parse(localStorage.getItem(K))}catch(e){return null}};
  const hh=(s,t)=>{s=t+s;let a=0xdeadbeef,b=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);a=Math.imul(a^c,2654435761);b=Math.imul(b^c,1597334677)}a=Math.imul(a^(a>>>16),2246822507)^Math.imul(b^(b>>>13),3266489909);b=Math.imul(b^(b>>>16),2246822507)^Math.imul(a^(a>>>13),3266489909);return (4294967296*(2097151&b)+(a>>>0)).toString(36)};
  window.getPin=gp;window.hhPin=hh;
  let L=null,buf='',bad=0,until=0;
  const msg=t=>{const m=g('lm');if(m)m.textContent=t},dots=()=>document.querySelectorAll('#ld i').forEach((d,i)=>d.classList.toggle('on',i<buf.length));
  const shake=()=>{const k=L&&L.firstChild;if(k){k.classList.remove('shake');void k.offsetWidth;k.classList.add('shake')}};
  function mk(){if(L)return;L=document.createElement('div');L.id='lock';
    L.innerHTML='<div class="lk"><div class="lt">🔒 Ingresa tu PIN</div><div class="ld" id="ld"><i></i><i></i><i></i><i></i></div><div class="lm" id="lm" role="alert"></div><div class="lp">'+[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k=>k===''?'<span></span>':'<button data-k="'+k+'" aria-label="'+(k==='⌫'?'Borrar':k)+'">'+k+'</button>').join('')+'</div><button class="lf" id="lf">Olvidé mi PIN</button></div>';
    document.body.appendChild(L);L.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='lf')return olvide();key(b.dataset.k)})}
  function show(){mk();L.style.display='flex';buf='';msg('');dots()}
  function key(k){if(Date.now()<until)return msg('Espera unos segundos…');if(k==='⌫')buf=buf.slice(0,-1);else if(buf.length<4)buf+=k;dots();
    if(buf.length===4){const P=gp();if(P&&hh(buf,P.s)===P.h){sessionStorage.setItem(O,'1');buf='';bad=0;L.style.display='none'}else{bad++;buf='';dots();shake();if(typeof vib==='function')vib([70,60,70]);msg(bad>=5?'Demasiados intentos. Espera 30 s.':'PIN incorrecto');if(bad>=5){until=Date.now()+30000;bad=0}}}}
  function olvide(){if(!confirm('Para recuperar el acceso se cerrará tu sesión de Google en este dispositivo y se borrarán los datos locales. Tus datos siguen guardados en Drive. ¿Continuar?'))return;
    try{['fin.pin','fin.auth','movimientos.v2','movimientos.v2.base','tesoreria.v1','tesoreria.v1.base'].forEach(k=>localStorage.removeItem(k));sessionStorage.clear()}catch(e){}location.reload()}
  window.pinSheet=function(){const P=gp();
    sheet(P?'Cambiar o quitar PIN':'Crear PIN de acceso',[...(P?[{k:'o',req:1,l:'PIN actual',type:'password'}]:[]),{k:'n',req:P?0:1,l:P?'PIN nuevo (vacío = quitar el PIN)':'PIN nuevo (4 dígitos)',type:'password'},{k:'r',l:'Repite el PIN nuevo',type:'password'}],o=>{
      if(P&&hh(o.o,P.s)!==P.h)return 'El PIN actual no es correcto.';
      if(!o.n){if(!P)return 'Escribe un PIN de 4 dígitos.';localStorage.removeItem(K);toast('PIN eliminado');return}
      if(!/^\d{4}$/.test(o.n))return 'El PIN debe tener 4 dígitos.';if(o.n!==o.r)return 'Los PIN no coinciden.';
      const s=Math.random().toString(36).slice(2,8);localStorage.setItem(K,JSON.stringify({s,h:hh(o.n,s)}));sessionStorage.setItem(O,'1');toast('PIN activado')},
      {init:()=>['f_o','f_n','f_r'].forEach(id=>{const e=g(id);if(e){e.setAttribute('inputmode','numeric');e.setAttribute('maxlength','4');e.setAttribute('autocomplete','off')}})})};
  document.addEventListener('click',e=>{if(e.target.closest('[data-a="pin"]'))window.pinSheet()});
  document.addEventListener('keydown',e=>{if(!L||L.style.display==='none')return;if(/^\d$/.test(e.key))key(e.key);else if(e.key==='Backspace')key('⌫')});
  let hid=0;document.addEventListener('visibilitychange',()=>{if(document.hidden)hid=Date.now();else if(gp()&&hid&&Date.now()-hid>120000){sessionStorage.removeItem(O);show()}});
  if(gp()&&sessionStorage.getItem(O)!=='1')show();
})();
