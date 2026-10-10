/* ===== UI: OVERLAYS, EVENTS, BOOT ===== */
let toastT=null;
function toast(t){const el=$('toast');if(!el)return;el.textContent=t;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,2600)}
function render(){
  hud();nav();
  const v=$('view'),y=v.scrollTop;
  v.innerHTML=S.phase==='create'?vCreate():VIEWS[tab]();
  v.scrollTop=y;flashCat=null;renderOv();liveBtns();
}
const renderMG=()=>renderOv();
function renderOv(){
  const o=$('ov');
  let h='';
  if(C)h=vCombat();else if(MG)h=vMG();else if(modal)h=vModal();
  if(!h){o.hidden=true;o.innerHTML='';return}
  o.hidden=false;o.innerHTML=`<div class="box" ${C?'style="max-width:620px"':''}>${h}</div>`;
  if(MG)mgUpdate();
  liveBtns();
}
/* ---- combat ---- */
function vCombat(){
  const f=C.foe,p=C.p,P=S.P,sk=magic().sk,un=skillsUnlocked();
  const fc=[f.s.guard&&'Guarding',f.s.burn&&`Burning ${f.s.burn.t}`,f.s.stun&&'Stunned',f.s.weaken&&`Weakened ${f.s.weaken}`,f.phase===2&&'Frenzy'].filter(Boolean);
  const pc=[p.s.shield&&`Shield ${p.s.shield}`,p.s.evade&&'Evasive',p.s.counter&&'Counter ready',p.s.open&&'Opening +50%'].filter(Boolean);
  const chip=c=>`<span class="pill" style="color:var(--gold2)">${c}</span>`;
  let body;
  if(!C.over){
    const ab=(a,v,l,s,dis)=>`<button data-a="act" data-v="${a}${v!=null?':'+v:''}" ${dis?'disabled':''}>${l}<small>${s}</small></button>`;
    body=`<div class="acts">
    ${ab('strike',null,'Strike','+6 stamina')}${ab('heavy',null,'Heavy','25 stamina · breaks guard',p.st<25)}${ab('block',null,'Block','8 stamina · -70% physical',p.st<8)}
    ${ab('dodge',null,'Dodge','14 stamina · counter opening',p.st<14)}${ab('recover',null,'Recover','+40% stamina')}
    ${ab('pot','hp','Draught',`${P.pot.hp||0} left · +45% HP`,!P.pot.hp)}
    ${sk.map((s,i)=>i<un?`<button class="sk" data-a="act" data-v="skill:${i}" ${p.mp<skCost(i,p.mmax)?'disabled':''}>${s[0]}<small>${skCost(i,p.mmax)} mana · ${EFFN[s[3]]||'damage'}</small></button>`:'').join('')}
    ${ab('pot','mp','Tonic',`${P.pot.mp||0} left · +50% mana`,!P.pot.mp)}${ab('flee',null,'Flee',C.kind==='region'?'resets streak':'no reward')}
    </div>`;
  }else{
    const t=C.over==='win'?'Victory':C.over==='lose'?'Defeat':'Retreated';
    body=`<div class="grade" style="font-size:2rem;color:${C.over==='win'?'var(--gold2)':'var(--hp)'}">${t}</div>
    ${C.rew&&C.rew.length?`<div class="card">${C.rew.map(r=>`<div class="sm">◆ ${r}</div>`).join('')}</div>`:''}
    <div class="btns"><button class="alt" data-a="leave">Continue</button>${C.kind==='region'&&C.over==='win'?`<button data-a="again" data-ce="1">Explore again · 1</button>`:''}</div>`;
  }
  const warn=INTW[f.intent];
  return `<div class="unit"><div class="nm"><span>${f.n}</span><span class="cc num">CC ${f.cc}</span></div>
    ${bar('',f.hp,f.max,'HP')}<div class="chips">${fc.map(chip).join('')}</div>
    ${!C.over?`<div class="intent ${warn?'warn':''}">Next: ${INTN[f.intent]}${f.intent==='unleash'?' (block or dodge!)':''}</div>`:''}</div>
  <div class="unit"><div class="nm"><span>${P.name}</span><span class="cc num">CC ${combatClass()}</span></div>
    ${bar('',p.hp,p.max,'HP')}${bar('mp',p.mp,p.mmax,'Mana')}${bar('st',p.st,p.smax,'Stamina')}<div class="chips">${pc.map(chip).join('')}</div></div>
  ${body}
  <div class="clog">${C.log.slice(0,8).map(l=>`<p>${l}</p>`).join('')}</div>`;
}
/* ---- mini-game view ---- */
function vMG(){
  const m=MG,t=m.t;
  if(m.phase==='done')return `<h2>${t.n}</h2><div class="grade" style="color:${m.grade[4]}">${m.grade[0]}</div>
    <div class="d" style="text-align:center">${m.res}</div>
    <div class="btns"><button class="alt" data-a="mgclose">Close</button><button data-a="train" data-v="${t.id}" data-ce="1">Again · 1 energy</button></div>`;
  let g='';
  if(m.type==='timing')g=`<div class="meter"><div class="zone" style="left:30%;width:40%"></div><div class="zone p" style="left:46.5%;width:7%"></div><div class="pip" id="mgPip"></div></div>
    <button class="big" data-a="mg" data-v="tap">${t.id==='meditate'?'Breathe':'Strike'}</button>`;
  if(m.type==='react')g=`<div class="bar st"><i id="mgFill"></i></div><div class="syms" style="grid-template-columns:1fr 1fr">${MOVES.map(x=>`<button data-a="mg" data-v="${x}">${x}</button>`).join('')}</div>`;
  if(m.type==='brace')g=`<div class="meter"><div class="zone" style="left:78%;width:22%"></div><div class="zone p" style="left:90%;width:10%"></div><div class="pip" id="mgPip"></div></div>
    <button class="big" data-a="mg" data-v="tap">Brace</button>`;
  if(m.type==='pace'||m.type==='balance')g=`<div class="meter"><div class="zone" id="mgZone"></div><div class="pip" id="mgPip"></div></div>
    <button class="big" data-a="mg" data-v="tap" style="min-height:76px">${m.type==='pace'?'Push pace':'Channel'}</button>`;
  if(m.type==='mash')g=`<div class="bar mp"><i id="mgFill"></i></div><button class="big" data-a="mg" data-v="tap" style="min-height:96px;font-size:1.4rem">Charge</button>`;
  if(m.type==='memory')g=`<div class="syms">${SYMS.map(s=>`<button data-a="mg" data-v="${s}" ${m.showing?'disabled':''}>${s}</button>`).join('')}</div>`;
  return `<h2>${t.n}</h2><div class="d">${t.d||'Strike when the marker is centred. Three swings.'}</div>
    <div class="mgbig" id="mgBig"></div><div class="sm dim" style="text-align:center" id="mgInfo"></div>${g}
    <div class="sm" style="text-align:center;min-height:1.2em;color:var(--gold2)" id="mgLast"></div>`;
}
function mgUpdate(){
  const m=MG;if(!m||m.phase!=='play'||!$('mgInfo'))return;
  const now=performance.now(),pip=$('mgPip'),fill=$('mgFill');
  $('mgLast').textContent=m.last||'';
  if(m.type==='timing'){pip.style.left=pipX()*100+'%';$('mgInfo').textContent=`${m.t.id==='meditate'?'Breath':'Swing'} ${m.i+1} of ${m.n}`}
  if(m.type==='react'){
    const w=1900-m.i*130,ready=now>=m.rs;
    $('mgBig').textContent=ready?m.seq[m.i][0]:'...';
    fill.style.width=ready?Math.max(0,100-(now-m.rs)/w*100)+'%':'100%';
    $('mgInfo').textContent=`Obstacle ${m.i+1} of ${m.n}`;
  }
  if(m.type==='brace'){const T=1500-m.i*150;pip.style.left=(now<m.rs?0:clamp((now-m.rs)/T,0,1)*100)+'%';$('mgInfo').textContent=`Incoming blow ${m.i+1} of ${m.n}`}
  if(m.type==='pace'||m.type==='balance'){
    const z=$('mgZone'),c=zoneC(),w=zoneW();z.style.left=(c-w/2)*100+'%';z.style.width=w*100+'%';pip.style.left=m.v*100+'%';
    $('mgInfo').textContent=`${Math.max(0,m.dur-nowT()).toFixed(1)}s left · in zone ${m.inz.toFixed(1)}s`;
  }
  if(m.type==='mash'){$('mgBig').textContent=m.taps;fill.style.width=Math.min(100,m.taps/42*100)+'%';$('mgInfo').textContent=`${Math.max(0,m.dur-nowT()).toFixed(1)}s left · 42 taps for top grade`}
  if(m.type==='memory'){
    $('mgInfo').textContent=`Round ${m.i+1} of ${m.n}`;
    $('mgBig').textContent=m.showing?(m.shown>=0?m.seq[m.shown]:'Watch...'):`${'●'.repeat(m.k)}${'○'.repeat(m.seq.length-m.k)}`;
  }
}
/* ---- modals ---- */
function vModal(){
  if(modal==='odds')return `<h2>Fate odds</h2><div class="d">Each category gets ${freeSpins()} free spins per life. After that a spin costs 25 Merit. Secret results can only be rolled, never chosen.</div>
    <div class="card odds">${RAR.map(r=>`<div><span style="color:${r.c}">${r.n.toUpperCase()}</span><span class="num">${r.w.toFixed(1)}%</span></div>`).join('')}</div><button class="alt" data-a="close">Close</button>`;
  if(modal==='exact'){const cat=CATS.find(c=>c[0]===ctab);
    return `<h2>Choose exact ${cat[1]}</h2><div class="d">Pick any ${cat[1].toLowerCase()} below Secret for Merit. You have ${S.merit} Merit.</div>
    ${cat[2].filter(x=>x.r<7).map(x=>`<div class="kv" style="align-items:center"><span>${rtag(x)}<br><span class="sm dim">${x.d}</span></span><button data-a="exact" data-v="${x.id}" data-cm="${EXACT_COST[x.r]}" style="min-height:34px">${EXACT_COST[x.r]} M</button></div>`).join('')}
    <button class="alt" data-a="close">Close</button>`}
  if(modal==='back')return `<h2>Choose your backstory</h2><div class="d">Your childhood sets your starting stats and wealth. It cannot be changed during this life.</div>
    <div class="grid" style="grid-template-columns:1fr">${BACKS.map(b=>`<div class="card"><div class="t">${b.n}</div><div class="d">${b.d}</div>
    <div class="meta">${Object.entries(b.raw).map(([k,v])=>`${v>0?'+':''}${v} ${STN[k]}`).join(', ')} · ${b.gold} gold</div>
    <button data-a="begin" data-v="${b.id}">Begin as ${b.n}</button></div>`).join('')}</div><button class="alt" data-a="close">Cancel</button>`;
  if(modal==='legacy')return `<h2>Merit upgrades</h2><div class="d">You have ${S.merit} Merit.</div>${legacyList()}<button class="alt" data-a="close">Close</button>`;
  if(modal==='reb')return `<h2>End this life?</h2><div class="d">${S.P.name}'s story ends here. You carry ${rebirthMerit()} Merit, your upgrades and your codex into a new life. Stats, gold, gear and rank reset.</div>
    <div class="btns"><button class="alt" data-a="close">Keep living</button><button data-a="dorebirth">Rebirth</button></div>`;
  if(modal==='settings')return `<h2>Settings</h2>
    <div class="d">Assists are optional and free. They replace paid passes and are off by default.</div>
    ${ASSISTS.map(([k,n,d])=>`<div class="toggle"><span>${n}<small>${d}</small></span><button class="${A()[k]?'':'alt'}" data-a="assist" data-v="${k}">${A()[k]?'On':'Off'}</button></div>`).join('')}
    <h2 style="margin-top:6px">Save data</h2><div class="d">Progress saves in this browser. Copy the code to back it up or move it.</div>
    <textarea id="sv" rows="3" placeholder="Paste a save code here to import" style="font-size:.75rem"></textarea>
    <div class="btns"><button class="alt" data-a="exp">Export</button><button class="alt" data-a="imp">Import</button></div>
    <button class="ghost" data-a="reset">Reset all progress</button><div id="svMsg" class="sm dim" style="text-align:center"></div>
    <button data-a="close">Close</button>`;
  return '';
}
/* ---- events ---- */
document.addEventListener('pointerdown',e=>{
  const b=e.target.closest('[data-a="mg"]');if(!b||b.disabled)return;
  e.preventDefault();mgTap(b.dataset.v);
});
document.addEventListener('input',e=>{if(e.target.id==='fname'&&S.fate)S.fate.name=e.target.value.trim().slice(0,18)});
document.addEventListener('change',e=>{if(e.target.id==='drill'){S.P.drill=e.target.value;save();render()}});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-a]');if(!b||b.disabled)return;
  const a=b.dataset.a,v=b.dataset.v;
  if(a==='mg'||a==='drill')return;
  switch(a){
    case 'tab':tab=v;$('view').scrollTop=0;break;
    case 'ctab':ctab=v;break;
    case 'spin':if(spin(v))flashCat=v;break;
    case 'rname':S.fate.name=pick(FIRST);break;
    case 'modal':modal=v;break;
    case 'close':modal=null;break;
    case 'exact':chooseExact(ctab,v);modal=null;flashCat=ctab;break;
    case 'begin':modal=null;beginLife(v);break;
    case 'leg':buyLegacy(v);break;
    case 'train':MG=null;startTrain(v);break;
    case 'mgclose':MG=null;break;
    case 'tier':upgradeTier(v);break;
    case 'work':workJob(v);break;
    case 'rest':rest();break;
    case 'healer':healer();break;
    case 'drink':drink(v);break;
    case 'pot':buyPot(v);break;
    case 'gear':buyGear(v);break;
    case 'fight':{const [k,r]=v.split(':');startFight(k,r);break}
    case 'act':{const [k,r]=v.split(':');act(k,k==='skill'?+r:r);break}
    case 'leave':C=null;break;
    case 'again':{const r=C.ref;C=null;startFight('region',r);break}
    case 'rebirth':modal='reb';break;
    case 'dorebirth':modal=null;rebirth();ctab='race';break;
    case 'assist':S.assist[v]=!S.assist[v];break;
    case 'exp':{const code=btoa(unescape(encodeURIComponent(JSON.stringify(S))));$('sv').value=code;$('sv').select();
      try{navigator.clipboard.writeText(code).then(()=>$('svMsg').textContent='Copied to clipboard.').catch(()=>{$('svMsg').textContent='Select the code and copy it.'})}catch(x){$('svMsg').textContent='Select the code and copy it.'}
      return}
    case 'imp':try{const o=JSON.parse(decodeURIComponent(escape(atob($('sv').value.trim()))));if(!o||o.v!==3)throw 0;S=o;S.assist=S.assist||{};C=null;MG=null;modal=null;save()}catch(x){$('svMsg').textContent='That code did not work. Check it was copied in full.';return}break;
    case 'reset':if(!b.dataset.sure){b.dataset.sure=1;b.textContent='Tap again to erase everything';return}
      try{localStorage.removeItem(KEY)}catch(x){}freshSave();C=null;MG=null;modal=null;tab='you';break;
  }
  save();render();
});
function boot(){
  if(!load())freshSave();
  const msg=offline();
  render();if(msg)toast(msg);
  let last=performance.now();
  setInterval(()=>{const n=performance.now(),dt=Math.min(5,(n-last)/1000);last=n;tick(dt);hudLive();
    const te=$('tE');if(te&&S.P)te.textContent=`Energy ${S.P.energy}/${maxEnergy()}`;const we=$('wE');if(we&&S.P)we.textContent=`${S.P.energy}/${maxEnergy()}`},250);
  setInterval(save,10000);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
}
boot();
