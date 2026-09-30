(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const STORE = 'nicoOS.v1';
  const defaults = {
    theme: 'obsidian',
    credits: 12,
    work: {},
    notes: [],
    tasks: [
      {id:'web-2909', title:'Control general de Página Web', date:'2026-09-29', time:'09:30', note:'Códigos, plugins, temas y PHP.'},
      {id:'tommy-daily', title:'Control operativo de Tommy', date:'2026-09-29', time:'14:00', note:'Administración, cobranzas, morosos y tareas con evidencia.'}
    ]
  };
  let state;
  try { state = {...defaults, ...(JSON.parse(localStorage.getItem(STORE) || '{}'))}; } catch { state = structuredClone(defaults); }
  state.work = state.work || {}; state.notes = state.notes || []; state.tasks = state.tasks || defaults.tasks;
  const save = () => localStorage.setItem(STORE, JSON.stringify(state));

  const splash = $('#splash');
  window.addEventListener('load', () => setTimeout(() => splash?.classList.add('hide'), 550));

  function tick(){
    const d = new Date();
    $('#clock').textContent = d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
    const h = d.getHours();
    $('#greeting').textContent = `${h < 12 ? 'Buen día' : h < 20 ? 'Buenas tardes' : 'Buenas noches'}, Nico.`;
  }
  tick(); setInterval(tick, 30000);

  const themes = ['obsidian','midnight','paper'];
  let themeIndex = Math.max(0, themes.indexOf(state.theme));
  function applyTheme(){
    const t = themes[themeIndex]; state.theme=t; document.documentElement.dataset.theme=t; save();
    $('#themeBtn').textContent = `◐ ${t[0].toUpperCase()+t.slice(1)}`;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta.setAttribute('content', t === 'paper' ? '#f3f4f7' : '#070b16');
  }
  $('#themeBtn').addEventListener('click',()=>{themeIndex=(themeIndex+1)%themes.length;applyTheme()}); applyTheme();

  $$('[data-scroll]').forEach(el => el.addEventListener('click', () => document.querySelector(el.dataset.scroll)?.scrollIntoView({behavior:'smooth',block:'start'})));

  const weatherCodes = {
    0:'Despejado',1:'Mayormente despejado',2:'Parcialmente nublado',3:'Nublado',45:'Niebla',48:'Niebla',
    51:'Llovizna',53:'Llovizna',55:'Llovizna fuerte',61:'Lluvia',63:'Lluvia moderada',65:'Lluvia fuerte',
    71:'Nieve',80:'Chaparrones',81:'Chaparrones',82:'Chaparrones fuertes',95:'Tormenta',96:'Tormenta con granizo',99:'Tormenta fuerte con granizo'
  };
  async function loadWeather(){
    const headline=$('#weatherHeadline'), note=$('#weatherNote');
    headline.textContent='Actualizando…';
    try{
      const url='https://api.open-meteo.com/v1/forecast?latitude=-36.6203&longitude=-64.2906&current=temperature_2m,weather_code,wind_speed_10m,precipitation&hourly=precipitation_probability&forecast_days=2&timezone=America%2FArgentina%2FBuenos_Aires';
      const res=await fetch(url,{cache:'no-store'}); if(!res.ok) throw new Error('weather');
      const data=await res.json(), c=data.current||{};
      const desc=weatherCodes[c.weather_code]||'Condiciones variables';
      const temp=Math.round(c.temperature_2m ?? 0);
      $('#weatherTemp').textContent=`${temp}°`; $('#tempPill').textContent=`${temp}°`;
      $('#weatherDesc').textContent=desc; $('#weatherWind').textContent=`Viento ${Math.round(c.wind_speed_10m||0)} km/h`;
      $('#weatherRain').textContent=`Precip. ${Number(c.precipitation||0).toFixed(1)} mm`;
      headline.textContent=desc; note.textContent='Actualizado con Open-Meteo · Santa Rosa. Alertas oficiales: SMN.';
      localStorage.setItem('nicoOS.lastWeather',JSON.stringify({temp,desc,wind:c.wind_speed_10m,precip:c.precipitation,ts:Date.now()}));
      updateNow({temp,desc});
    }catch(e){
      let last=null; try{last=JSON.parse(localStorage.getItem('nicoOS.lastWeather')||'null')}catch{}
      if(last){$('#weatherTemp').textContent=`${last.temp}°`;$('#tempPill').textContent=`${last.temp}°`;$('#weatherDesc').textContent=last.desc;headline.textContent=last.desc;note.textContent='Sin conexión: mostrando el último clima guardado.';updateNow(last)}
      else{headline.textContent='Clima no disponible';note.textContent='Abrí el SMN para revisar alertas oficiales.';updateNow(null)}
    }
  }
  function updateNow(weather){
    const now=new Date(); const next=getNextTasks(2);
    const hour=now.getHours();
    let title = hour >= 20 ? 'Cerrá el día sin abrir frentes nuevos.' : hour < 12 ? 'Arrancá por lo que cambia el resultado.' : 'Mantené el foco en lo medible.';
    let parts=[];
    if(weather) parts.push(`${weather.desc} y ${weather.temp}° en Santa Rosa.`);
    if(next[0]) parts.push(`Próximo: ${next[0].title}${next[0].time ? ` a las ${next[0].time}` : ''}.`);
    parts.push('Usá Focus para un bloque sin distracciones y YouTube Music para tus Me gusta.');
    $('#nowTitle').textContent=title; $('#nowText').textContent=parts.join(' ');
  }
  $('#refreshWeather').addEventListener('click',loadWeather); $('#refreshNow').addEventListener('click',loadWeather);

  function parseTaskDate(t){ const [y,m,d]=t.date.split('-').map(Number); const [hh,mm]=(t.time||'00:00').split(':').map(Number); return new Date(y,m-1,d,hh||0,mm||0); }
  function getNextTasks(n=99){ return state.tasks.filter(t=>parseTaskDate(t) >= new Date(Date.now()-6*3600000)).sort((a,b)=>parseTaskDate(a)-parseTaskDate(b)).slice(0,n); }
  function renderAgenda(){
    const list=$('#agendaList'); list.innerHTML=''; const tasks=getNextTasks(8);
    if(!tasks.length){list.innerHTML='<div class="micro">No hay próximos compromisos cargados.</div>';return}
    for(const t of tasks){
      const dt=parseTaskDate(t), day=dt.toLocaleDateString('es-AR',{day:'2-digit',month:'short'}).replace('.','').toUpperCase();
      const row=document.createElement('div'); row.className='timeline-row';
      row.innerHTML=`<div class="timeline-time">${t.time||day}<div>${t.time?day:''}</div></div><div><strong></strong><span></span></div>`;
      row.querySelector('strong').textContent=t.title; row.querySelector('span').textContent=t.note||''; list.appendChild(row);
    }
  }
  renderAgenda();
  const dialog=$('#taskDialog'); $('#addTaskBtn').addEventListener('click',()=>{const tomorrow=new Date(Date.now()+86400000);$('#taskDate').value=tomorrow.toISOString().slice(0,10);$('#taskTime').value='';$('#taskTitle').value='';dialog.showModal()});
  $('#saveTask').addEventListener('click',()=>{const title=$('#taskTitle').value.trim(),date=$('#taskDate').value,time=$('#taskTime').value;if(!title||!date)return;state.tasks.push({id:crypto.randomUUID?.()||String(Date.now()),title,date,time,note:''});save();renderAgenda();dialog.close();loadWeather()});

  const checks=$$('.work-check');
  checks.forEach(c=>{c.checked=!!state.work[c.dataset.key];c.addEventListener('change',()=>{state.work[c.dataset.key]=c.checked;save();renderWork()})});
  $('#creditsInput').value=state.credits ?? 12;
  $('#creditsInput').addEventListener('input',e=>{state.credits=Math.max(0,Number(e.target.value)||0);save();renderWork()});
  function renderWork(){
    const done=checks.filter(c=>c.checked).length; $('#workScore').textContent=`${done}/${checks.length}`; $('#workBar').style.width=`${Math.round(done/checks.length*100)}%`;
    const cr=Math.max(0,Number($('#creditsInput').value)||0), pct=Math.min(999,Math.round(cr/20*100)); $('#creditsPct').textContent=`${pct}%`;
  }
  renderWork();
  $('#generateClose').addEventListener('click',()=>{
    const done=checks.filter(c=>c.checked).map(c=>c.parentElement.innerText.trim()); const pending=checks.filter(c=>!c.checked).map(c=>c.parentElement.innerText.trim());
    const d=new Date(),date=d.toLocaleDateString('es-AR'),time=d.toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'});
    $('#closeOutput').value=`*CIERRE – ${date} · ${time}*\n\n*FINALIZADO / ACREDITADO*\n${done.length?done.map(x=>'• '+x).join('\n'):'• Sin ítems acreditados todavía.'}\n\n*PENDIENTE / A TRASLADAR*\n${pending.length?pending.map(x=>'• '+x+' – indicar causa real y nueva fecha').join('\n'):'• Sin pendientes.'}\n\n*CONTROL DE EVIDENCIA*\n• Revisar respaldo antes de enviar a Darío.`;
  });

  function renderNotes(){const list=$('#notesList');list.innerHTML='';$('#noteCount').textContent=state.notes.length;state.notes.slice().reverse().forEach((n,revIndex)=>{const realIndex=state.notes.length-1-revIndex;const row=document.createElement('div');row.className='note-row';const text=document.createElement('span');text.textContent=n;const del=document.createElement('button');del.type='button';del.textContent='Quitar';del.addEventListener('click',()=>{state.notes.splice(realIndex,1);save();renderNotes()});row.append(text,del);list.append(row)})}
  $('#noteForm').addEventListener('submit',e=>{e.preventDefault();const i=$('#noteInput'),v=i.value.trim();if(!v)return;state.notes.push(v);save();i.value='';renderNotes()});renderNotes();

  let timerDuration=25*60,timerLeft=timerDuration,timerId=null;
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  function drawTimer(){const v=fmt(timerLeft);$('#timerDisplay').textContent=v;$('#timerSummary').textContent=v}
  function stopTimer(){if(timerId)clearInterval(timerId);timerId=null;$('#timerStart').textContent='Iniciar'}
  $('#timerStart').addEventListener('click',()=>{if(timerId){stopTimer();return}$('#timerStart').textContent='Pausar';timerId=setInterval(()=>{timerLeft=Math.max(0,timerLeft-1);drawTimer();if(timerLeft===0)stopTimer()},1000)});
  $('#timerReset').addEventListener('click',()=>{stopTimer();timerLeft=timerDuration;drawTimer()});
  $('#timer25').addEventListener('click',()=>{stopTimer();timerDuration=timerLeft=25*60;drawTimer()});$('#timer50').addEventListener('click',()=>{stopTimer();timerDuration=timerLeft=50*60;drawTimer()});drawTimer();

  const AC=window.AudioContext||window.webkitAudioContext; let ac=null,master=null,nodes=[],playing=false,track=0; const tracks=['Deep Focus','Rain','Night Drive'];
  function killAudio(){nodes.forEach(n=>{try{n.stop()}catch{}try{n.disconnect()}catch{}});nodes=[];if(master){try{master.disconnect()}catch{}master=null}}
  function makeNoise(c){const b=c.createBuffer(1,c.sampleRate*2,c.sampleRate),a=b.getChannelData(0);let l=0;for(let i=0;i<a.length;i++){const w=Math.random()*2-1;l=(l+.02*w)/1.02;a[i]=l*3.2}const s=c.createBufferSource();s.buffer=b;s.loop=true;return s}
  async function startAudio(){if(!AC)return;if(!ac)ac=new AC();if(ac.state==='suspended')await ac.resume();killAudio();master=ac.createGain();master.gain.value=.06;master.connect(ac.destination);if(track===0){const a=ac.createOscillator(),b=ac.createOscillator(),ga=ac.createGain(),gb=ac.createGain();a.frequency.value=110;b.frequency.value=113;ga.gain.value=.2;gb.gain.value=.16;a.connect(ga).connect(master);b.connect(gb).connect(master);a.start();b.start();nodes=[a,b]}else if(track===1){const n=makeNoise(ac),f=ac.createBiquadFilter();f.type='highpass';f.frequency.value=900;n.connect(f).connect(master);n.start();nodes=[n]}else{const n=makeNoise(ac),f=ac.createBiquadFilter(),o=ac.createOscillator(),g=ac.createGain();f.type='lowpass';f.frequency.value=480;o.frequency.value=55;g.gain.value=.12;n.connect(f).connect(master);o.connect(g).connect(master);n.start();o.start();nodes=[n,o]}playing=true;$('#playTrack').textContent='Ⅱ';$('#playerState').textContent='Reproduciendo'}
  function pauseAudio(){killAudio();playing=false;$('#playTrack').textContent='▶';$('#playerState').textContent='Ambient · local'}
  function showTrack(){$('#trackName').textContent=tracks[track]}
  $('#playTrack').addEventListener('click',()=>playing?pauseAudio():startAudio());$('#prevTrack').addEventListener('click',()=>{track=(track+tracks.length-1)%tracks.length;showTrack();if(playing)startAudio()});$('#nextTrack').addEventListener('click',()=>{track=(track+1)%tracks.length;showTrack();if(playing)startAudio()});showTrack();

  async function loadNews(){
    const list=$('#newsList'),status=$('#newsStatus');status.textContent='Buscando noticias públicas recientes…';
    try{
      const q=encodeURIComponent('"Santa Rosa" "La Pampa"');
      const url=`https://api.gdeltproject.org/api/v2/doc/doc?query=${q}&mode=ArtList&maxrecords=8&format=json&sort=HybridRel`;
      const res=await fetch(url,{cache:'no-store'}); if(!res.ok) throw new Error('news'); const data=await res.json();
      const arts=(data.articles||[]).filter(x=>x.url&&x.title).slice(0,6); if(!arts.length) throw new Error('empty');
      list.innerHTML=''; arts.forEach((a,i)=>{const art=document.createElement('article');const link=document.createElement('a');link.href=a.url;link.target='_blank';link.rel='noopener';const tag=document.createElement('span');tag.textContent=`${String(i+1).padStart(2,'0')} · LOCAL`;const title=document.createElement('strong');title.textContent=a.title;const p=document.createElement('p');p.textContent=a.domain||'Fuente pública';link.append(tag,title,p);art.append(link);list.append(art)});status.textContent=`Actualizado · ${new Date().toLocaleTimeString('es-AR',{hour:'2-digit',minute:'2-digit'})}`;
    }catch{status.textContent='No se pudo actualizar el feed público. Se mantiene el snapshot inicial.'}
  }
  $('#refreshNews').addEventListener('click',loadNews);

  let deferredPrompt=null; const installBtn=$('#installBtn');
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;installBtn.classList.remove('hidden')});
  installBtn.addEventListener('click',async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;installBtn.classList.add('hidden')});
  window.addEventListener('appinstalled',()=>installBtn.classList.add('hidden'));
  function online(){const ok=navigator.onLine;$('#onlineState').textContent=ok?'ONLINE':'OFFLINE';$('#onlineState').style.color=ok?'var(--good)':'var(--warn)'}window.addEventListener('online',online);window.addEventListener('offline',online);online();

  if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

  const launchAction = new URLSearchParams(location.search).get('action');
  if(launchAction === 'music') setTimeout(()=>document.querySelector('#focusCard')?.scrollIntoView({behavior:'smooth',block:'start'}),700);
  if(launchAction === 'inbox') setTimeout(()=>document.querySelector('#inboxCard')?.scrollIntoView({behavior:'smooth',block:'start'}),700);
  loadWeather();
})();
