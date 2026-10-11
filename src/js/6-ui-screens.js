/* ===== UI: SCREENS ===== */
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let modal=null,flashCat=null;
const rc=r=>RAR[r].c;
const rtag=it=>`<span style="color:${rc(it.r)}">${it.n}</span>`;
function fmtM(m){
  return Object.entries(m).map(([k,v])=>{
    const p=(v>0?'+':'')+Math.round(v*100)+'%';
    return `${p} ${STN[k]||XN[k]||k}`;
  });
}
function bar(cls,v,max,label){
  const pc=clamp(v/max*100,0,100);
  return `<div><div class="blabel"><span>${label}</span><span class="num">${fmt(Math.max(0,v))} / ${fmt(max)}</span></div><div class="bar ${cls}"><i style="width:${pc}%"></i></div></div>`;
}
const TABS=[['you','You'],['ppl','People'],['train','Training'],['work','Work'],['adv','Adventure'],['boss','Bosses'],['arm','Armory'],['leg','Legacy']];

function hud(){
  if(S.phase==='create'){
    $('hud').innerHTML=`<div class="hrow"><h1 class="logo" style="font-size:1.35rem">Lineage of the Vigil</h1>
    <div class="cur"><span>Merit <b class="m num">${fmt(S.merit)}</b></span><button class="alt" data-a="modal" data-v="settings" style="min-height:32px;padding:4px 10px">Settings</button></div></div>
    <div class="sm dim">Forge your fate. Life ${S.lives+1}.</div>`;
    return;
  }
  const P=S.P;
  $('hud').innerHTML=`<div class="hrow"><h1>${esc(P.name)} <span class="cc num" style="font-size:.9rem">CC <span id="hCC">${combatClass()}</span></span></h1>
  <div class="cur"><span>G <b class="g num" id="hG">${fmt(P.gold)}</b></span><span>M <b class="m num" id="hM">${fmt(S.merit)}</b></span>
  <span>Activity <b class="e num" id="hE">${P.energy}/${maxEnergy()}</b></span>
  <button class="alt" data-a="modal" data-v="settings" style="min-height:30px;padding:3px 10px;font-size:.72rem">Settings</button></div></div>
  <div class="hrow" style="margin-top:4px"><span class="sm dim">Age <b style="color:var(--fg)">${P.age}</b> · ${stage()} · ${race().n} · ${RANKS[P.rank].n}</span><span class="btns" style="flex:0 0 auto"><button data-a="age" style="min-height:34px;padding:4px 16px;white-space:nowrap">+ Age</button><button class="alt" data-a="agex" style="min-height:34px;padding:4px 9px" aria-label="Years per age up">${S.ageX||1}x</button></span></div>
  <div class="bars" id="hBars">${hudBars()}</div>`;
}
function hudBars(){const P=S.P;return bar('',P.hp,maxHp(),'HP')+bar('mp',P.mp,maxMp(),'Mana')}
function hudLive(){
  if(S.phase!=='play'){const m=document.querySelector('.cur .m');if(m)m.textContent=fmt(S.merit);liveBtns();return}
  const P=S.P;
  if(!$('hG'))return hud();
  $('hG').textContent=fmt(P.gold);$('hM').textContent=fmt(S.merit);$('hE').textContent=`${P.energy}/${maxEnergy()}`;
  $('hCC').textContent=combatClass();$('hBars').innerHTML=hudBars();
  liveBtns();
}
function liveBtns(){
  document.querySelectorAll('[data-cg]').forEach(b=>b.disabled=!S.P||S.P.gold<+b.dataset.cg);
  document.querySelectorAll('[data-ce]').forEach(b=>b.disabled=!S.P||S.P.energy<+b.dataset.ce);
  document.querySelectorAll('[data-cm]').forEach(b=>b.disabled=S.merit<+b.dataset.cm);
}
function nav(){
  if(S.phase==='create'){$('nav').hidden=true;return}
  $('nav').hidden=false;
  $('nav').innerHTML=TABS.map(t=>`<button data-a="tab" data-v="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</button>`).join('');
}

/* ---- creation ---- */
function vCreate(){
  const f=S.fate,cat=CATS.find(c=>c[0]===ctab),it=byId(cat[2],f[ctab]),c=spinCost(ctab);
  const extra=ctab==='mag'?`<div class="sm" style="text-align:left">${it.sk.map((s,i)=>`<div>• <b>${s[0]}</b> <span class="dim">(mastery ${SK_UNLOCK[i]}) ${EFFN[s[3]]||'Damage'}</span></div>`).join('')}</div>`
    :`<ul>${fmtM(it.m).map(x=>`<li>${x}</li>`).join('')}</ul>`;
  const stages=ctab==='race'?`<div class="sm dim" style="text-align:left">Lifespan ${it.life[0]}-${it.life[1]} years · growth rate ×${growthOf(it.id).toFixed(2)} per year<br>Stages: ${it.st.split('|').join(' · ')}</div>`:'';
  return `<div class="col">
  <div class="ctabs">${CATS.map(x=>`<button data-a="ctab" data-v="${x[0]}" class="${ctab===x[0]?'on':''}">${x[1]}</button>`).join('')}</div>
  <div class="fate">
    <div class="card roll ${flashCat===ctab?'flash':''}">
      <div class="sm dim">${cat[1].toUpperCase()} · ROLLED BY FATE</div>
      <div class="rn">${it.n}</div><div class="rr" style="color:${rc(it.r)}">${RAR[it.r].n.toUpperCase()}</div>
      <div class="d">${it.d}</div>
      <h2 style="font-size:.8rem">Birthright</h2>${extra}${stages}
      <button class="big" data-a="spin" data-v="${ctab}" ${c?`data-cm="${c}"`:''}>Spin ${cat[1]} · ${A().spins?'free':f.spins[ctab]>0?f.spins[ctab]+' free left':'25 Merit'}</button>
      <div class="btns">${ctab!=='trait'?`<button class="alt" data-a="modal" data-v="exact">Choose exact fate</button>`:''}<button class="alt" data-a="modal" data-v="odds">Odds</button></div>
    </div>
    <div class="card">
      <h2>Create your legend</h2>
      <div class="btns"><input id="fname" maxlength="18" value="${esc(f.name)}" aria-label="Character name"><button class="alt" data-a="rname" style="flex:0 0 auto">Random</button></div>
      <div class="btns">${['Male','Female'].map(g=>`<button data-a="gender" data-v="${g}" class="${f.gender===g?'':'alt'}">${g}</button>`).join('')}</div>
      <div class="summary"><div style="text-align:center;font-weight:800;color:var(--crim)">CURRENT FATE</div>
      ${CATS.map(([k,n,l])=>{const x=byId(l,f[k]);return `<div>${n}: <b>${x.n}</b> <span class="pill" style="color:${x.r>=6?'#7a5a00':'var(--crim)'}">${RAR[x.r].n}</span></div>`}).join('')}</div>
      <div class="sm dim">Free spins: ${CATS.map(([k,n])=>`${n} ${A().spins?'∞':f.spins[k]}`).join(' · ')}. After that each spin costs 25 Merit. Rare rolls give potential, not instant victory.</div>
      <button class="big" data-a="modal" data-v="back" style="background:#6b4513">Begin this life ›</button>
      <button class="alt" data-a="modal" data-v="legacy">Merit upgrades</button>
    </div>
  </div></div>`;
}

/* ---- you ---- */
function vYou(){
  const P=S.P,e=effAll(),st=raceStage(),stg=race().st.split('|'),nx=RACE_XP[st];
  const sk=magic().sk,un=skillsUnlocked(),w=P.wpn&&byId(GEAR,P.wpn),fo=P.foc&&byId(GEAR,P.foc);
  return `<div class="grid">
  <div class="card"><h2>${esc(P.name)}</h2><div class="d">${P.gender} · Age ${P.age} (${stage()}) · Lifespan about ${P.life}<br>Generation ${P.gen||1} · ${esc(P.back==='heir'?P.backN:byId(BACKS,P.back).n)}</div>
    <div class="kv"><span>Race</span><b>${rtag(race())}</b></div>
    <div class="kv"><span>Bloodline</span><b>${rtag(bl())}</b></div>
    <div class="kv"><span>Innate magic</span><b>${rtag(magic())}</b></div>
    <div class="kv"><span>Trait</span><b>${rtag(trait())}</b></div>
    <div class="kv"><span>Vigil rank</span><b>${RANKS[P.rank].n}</b></div>
    <div class="kv"><span>Weapon</span><b>${w?w.n:'None'}</b></div>
    <div class="kv"><span>Focus</span><b>${fo?fo.n:'None'}</b></div>
    <div class="kv"><span>Victories</span><b class="num">${P.wins}</b></div>
    <div class="kv"><span>Titles</span><b>${P.titles.length?P.titles.join(', '):'None yet'}</b></div>
  </div>
  <div class="card"><h2 style="color:var(--hp)">Combat Class ${combatClass()}</h2>
    ${STK.map(k=>`<div class="kv"><span>${STN[k]}</span><b class="num">${fmt(e[k])} <span class="dim sm">×${mult(k).toFixed(2)}</span></b></div>`).join('')}
    <div class="kv"><span>Max HP / Mana / Stamina</span><b class="num">${fmt(maxHp(e))} / ${fmt(maxMp(e))} / ${fmt(maxSt(e))}</b></div>
    <div class="kv"><span>Attack / Magic power</span><b class="num">${fmt(physA(e))} / ${fmt(magA(e))}</b></div>
    <div class="kv"><span>Critical chance</span><b class="num">${Math.round(critC()*100)}%</b></div>
    <div class="kv"><span>Yearly growth rate</span><b class="num">×${growth().toFixed(2)}</b></div>
  </div>
  <div class="card"><h2>Race progression</h2><div class="d">${race().n} · Stage ${st}/7</div>
    ${nx?bar('xp',P.rxp,nx,'Race XP'):'<div class="d">Fully awakened.</div>'}
    <ul class="stages">${stg.map((s,i)=>`<li class="${i<st?'on':''}">${i<st?'◆':'◇'} Stage ${i+1}: ${s}</li>`).join('')}</ul>
    <div class="sm dim">Each stage: +4% all stats, +6% more to your race's strong stats. Earn race XP from Meditation, the Heritage Rite and fights.</div>
  </div>
  <div class="card"><h2>${magic().n} · Mastery ${P.mlv}</h2>${bar('mp',P.mxp,mxpNeed(),'Mastery XP')}
    ${sk.map((s,i)=>`<div class="kv"><span>${i<un?'◆':'◇'} <b>${s[0]}</b><br><span class="sm dim">${EFFN[s[3]]||'Damage'}${s[2]?` · power ${s[2]}`:''}</span></span><b class="num sm">${i<un?s[1]+'% mana':'Mastery '+SK_UNLOCK[i]}</b></div>`).join('')}
    <div class="sm dim">Awakenings at mastery 20 and 35, each +40% magic power${P.mlv>=20?' (active)':''}. Gain mastery by casting in combat and through Energy Balance.</div>
  </div>
  <div class="card parch"><h2>Chronicle</h2><div class="log">${P.log.slice(0,12).map(x=>`<p>${esc(x)}</p>`).join('')}</div></div>
  <div class="card"><h2>End this life</h2><div class="d">Rebirth carries ${rebirthMerit()} Merit into a new life. Merit buys permanent upgrades and fate rerolls. Everything else resets.</div>
    <button class="alt" data-a="rebirth">Rebirth for ${rebirthMerit()} Merit</button></div>
  </div>`;
}

/* ---- training ---- */
function stepper(k,v){return `<span class="btns" style="flex:0 0 auto;align-items:center;gap:4px"><button class="alt" data-a="rt" data-v="${k}:-1" style="min-height:32px;padding:2px 10px" aria-label="Fewer">−</button><b class="num" style="min-width:1.6em;text-align:center">${v}</b><button class="alt" data-a="rt" data-v="${k}:1" style="min-height:32px;padding:2px 10px" aria-label="More">+</button></span>`}
function routineCard(){
  const P=S.P,rt=P.rt,g=growth(),tot=rt.tN+rt.wN+rt.rN;
  const jobs=JOBS.filter(j=>jobOpen(j));
  return `<div class="card"><div class="hrow"><h2 id="tE">Activity ${P.energy}/${maxEnergy()}</h2><span class="sm dim">Refills each year</span></div>
  <div class="d">Every action costs activity points. Unspent points are lost when you age up, unless your routine spends them. Playing the mini-games yourself adds up to 20% on top of the routine result.</div>
  <h2 style="font-size:.8rem;margin-top:2px">Yearly routine</h2>
  <div class="kv" style="align-items:center"><select id="rtT" aria-label="Routine training" style="flex:1"><option value="balanced" ${rt.train==='balanced'?'selected':''}>Balanced (lowest stat first)</option>${TRAIN.map(t=>`<option value="${t.id}" ${rt.train===t.id?'selected':''}>${t.n} (${STN[t.st]})</option>`).join('')}</select>${stepper('tN',rt.tN)}</div>
  <div class="kv" style="align-items:center"><select id="rtJ" aria-label="Routine job" style="flex:1"><option value="best" ${rt.job==='best'?'selected':''}>Best paying job</option>${jobs.map(j=>`<option value="${j.id}" ${rt.job===j.id?'selected':''}>${j.n}</option>`).join('')}</select>${stepper('wN',rt.wN)}</div>
  <div class="kv" style="align-items:center"><span>Recovery <span class="sm dim">(trains instead if unhurt)</span></span>${stepper('rN',rt.rN)}</div>
  <div class="toggle"><span>Keep up relationships<small>Spends leftover social actions on your weakest bonds</small></span><button class="${rt.social?'':'alt'}" data-a="rtsoc">${rt.social?'On':'Off'}</button></div>
  <div class="btns" style="align-items:center"><span class="sm" style="flex:0 0 auto">Aging with points left</span><select id="rtM" aria-label="When aging with points left">${[['ask','Ask me'],['always','Always use routine'],['never','Never use routine']].map(([v,l])=>`<option value="${v}" ${S.rtMode===v?'selected':''}>${l}</option>`).join('')}</select></div>
  <div class="sm dim">The routine splits your remaining points ${rt.tN}:${rt.wN}:${rt.rN}${tot?'':' (set at least one)'}. Locked work turns into training. ${g<1?`As a ${race().n}, your growth rate is ×${g.toFixed(2)} per year to balance your long lifespan.`:''}</div></div>`;
}
function lockCard(min,what,why){const P=S.P;return `<div class="card"><div class="t">${what} locked</div><div class="d">${why}</div><div class="meta">Requires age ${min} · you are ${P.age}</div><button data-a="age">+ Age</button></div>`}
function vTrain(){
  const P=S.P;
  if(P.age<AGE_TRAIN)return lockCard(AGE_TRAIN,'Training','Young children grow through yearly events before formal training begins. Your stats still rise each year as you grow.');
  return `<div class="col">
  ${routineCard()}
  <div class="grid">${TRAIN.map(t=>{const tr=P.tier[t.id]||0,m=P.mast[t.id]||0,g=trainGain(t,.85);
    return `<div class="card"><div class="t">${t.n}</div><div class="d">${t.d}</div>
    <div class="meta">${STN[t.st]} · ${TIERN[tr]} gear · Mastery ${m}%</div>
    <div class="sm dim" style="text-align:center">Grade A gives about +${g.gain.toFixed(1)}</div>
    <div class="btns"><button data-a="train" data-v="${t.id}" data-ce="1">Train · 1 AP</button>
    ${tr<5?`<button class="alt" data-a="tier" data-v="${t.id}" data-cg="${TIERC[tr+1]}">${TIERN[tr+1]} · ${fmt(TIERC[tr+1])}g</button>`:'<button class="alt" disabled>Max gear</button>'}</div></div>`}).join('')}
  <div class="card"><div class="t">Heritage Rite</div><div class="d">Honour your ${race().n} heritage. A timing rite that grants race XP.</div>
    <div class="meta">Race XP · Stage ${raceStage()}/7</div><button data-a="train" data-v="rite" data-ce="1">Perform rite · 1 AP</button></div>
  <div class="card"><div class="t">Combat Sparring</div><div class="d">A real fight against a trainer near your level. No injuries carry over.</div>
    <div class="meta">Strength · Speed · Durability · Intelligence</div><button data-a="fight" data-v="spar" data-ce="1">Spar · 1 AP</button></div>
  </div></div>`;
}

/* ---- adventure ---- */
function recoveryCard(){
  const P=S.P,hc=healerCost();
  return `<div class="card"><h2>Recovery</h2><div class="d">HP and mana carry over between fights and slowly regenerate.</div>
  ${bar('',P.hp,maxHp(),'HP')}${bar('mp',P.mp,maxMp(),'Mana')}
  <div class="btns"><button class="alt" data-a="rest" data-ce="1">Rest · 1 AP</button><button class="alt" data-a="healer" data-cg="${hc}">Healer · ${fmt(hc)}g</button></div>
  <div class="btns"><button class="alt" data-a="drink" data-v="hp" ${P.pot.hp?'':'disabled'}>Draught (${P.pot.hp||0})</button><button class="alt" data-a="drink" data-v="mp" ${P.pot.mp?'':'disabled'}>Tonic (${P.pot.mp||0})</button></div></div>`;
}
function vAdv(){
  const P=S.P,cc=combatClass(),nx=RANKS[P.rank+1];
  if(P.age<AGE_FIGHT)return lockCard(AGE_FIGHT,'Adventure','You are too young to leave town and fight.');
  return `<div class="grid">${recoveryCard()}
  <div class="card"><h2>Vigil rank: ${RANKS[P.rank].n}</h2>
   ${nx?`<div class="d">Next: ${nx.n}. The examiner fights at CC ${nx.cc}. Each rank gives +5% to every stat and ${nx.sal} gold per second salary.</div>
   <button data-a="fight" data-v="trial" ${cc<nx.cc*.8?'disabled':'data-ce="2"'}>Face the trial · 2 AP</button>${cc<nx.cc*.8?`<div class="sm dim" style="text-align:center">Reach CC ${Math.ceil(nx.cc*.8)} to attempt it.</div>`:''}`
   :'<div class="d">You hold the highest rank of the Vigil.</div>'}
   <div class="sm dim" style="text-align:center">Salary: ${(RANKS[P.rank].sal*goldMult()).toFixed(1)} gold/s</div></div>
  ${REGIONS.map(r=>{const lock=P.rank<r.rank,sk=P.streak[r.id]||0,ec=Math.round(r.cc*(1+.06*sk));
    return `<div class="card ${lock?'lock':''}"><div class="t">${r.n}</div>
    <div class="d">${r.f.map(f=>f[0]).join(', ')}</div>
    <div class="meta"><span style="color:${cc>=ec?'var(--st)':cc>=ec*.75?'var(--gold2)':'var(--hp)'}">Enemy CC ${ec}</span> · Win streak ${sk}</div>
    <div class="sm dim" style="text-align:center">Each win raises the streak, enemy strength and rewards.</div>
    <button data-a="fight" data-v="region:${r.id}" ${lock?'disabled':'data-ce="1"'}>${lock?`Requires ${RANKS[r.rank].n}`:'Explore · 1 AP'}</button></div>`}).join('')}
  </div>`;
}
function vBoss(){
  const P=S.P,cc=combatClass();
  if(P.age<AGE_TRIAL)return lockCard(AGE_TRIAL,'Bosses','The great monsters of the realm are no place for a child.');
  return `<div class="grid">${BOSSES.map((b,i)=>{const lock=P.rank<bossRank(b),done=P.bosses[b.id];
    return `<div class="card ${lock?'lock':''}"><div class="t">${b.n}</div><div class="d">${b.d}</div>
    <div class="meta"><span style="color:${cc>=b.cc*1.2?'var(--st)':cc>=b.cc*.9?'var(--gold2)':'var(--hp)'}">Boss CC ${b.cc}</span> · ${done?`Defeated · ${b.title}`:`First kill: ${bossMerit(b)} Merit, title ${b.title}`}</div>
    <button data-a="fight" data-v="boss:${b.id}" ${lock?'disabled':'data-ce="2"'}>${lock?`Requires ${RANKS[bossRank(b)].n}`:'Challenge · 2 AP'}</button></div>`}).join('')}
  <div class="card"><h2>Boss tips</h2><div class="d">Bosses telegraph their next move. Block heavy blows and anything marked UNLEASH. Below half HP they enter a frenzy. Bosses resist stuns half the time. Aim for about 20% more CC than the boss.</div></div></div>`;
}
function vArm(){
  const P=S.P,pc=potCost();
  const row=g=>{const own=P.owned.includes(g.id),eq=P.wpn===g.id||P.foc===g.id;
    return `<div class="kv" style="align-items:center"><span><b>${g.n}</b><br><span class="sm dim">+${Math.round(g.b*100)}% ${g.s==='w'?'physical attack':'magic power'}</span></span>
    ${eq?'<b class="sm" style="color:var(--st)">Equipped</b>':own?`<button class="alt" data-a="gear" data-v="${g.id}" style="min-height:34px">Equip</button>`:`<button data-a="gear" data-v="${g.id}" data-cg="${g.c}" style="min-height:34px">${fmt(g.c)}g</button>`}</div>`};
  return `<div class="grid">
  <div class="card"><h2>Weapons</h2>${GEAR.filter(g=>g.s==='w').map(row).join('')}</div>
  <div class="card"><h2>Magic focus</h2>${GEAR.filter(g=>g.s==='f').map(row).join('')}</div>
  <div class="card"><h2>Apothecary</h2><div class="d">Usable in combat or at rest.</div>
    <div class="kv" style="align-items:center"><span><b>Healing Draught</b> (${P.pot.hp||0})<br><span class="sm dim">Restores 45% HP</span></span><button data-a="pot" data-v="hp" data-cg="${pc}" style="min-height:34px">${pc}g</button></div>
    <div class="kv" style="align-items:center"><span><b>Mana Tonic</b> (${P.pot.mp||0})<br><span class="sm dim">Restores 50% mana</span></span><button data-a="pot" data-v="mp" data-cg="${pc}" style="min-height:34px">${pc}g</button></div></div>
  </div>`;
}
function legacyList(){
  return LEGACY.map(u=>{const lv=S.lp[u.id]||0,c=u.c*(lv+1);
    return `<div class="kv" style="align-items:center"><span><b>${u.n}</b> <span class="pill dim">${lv}/${u.max}</span><br><span class="sm dim">${u.d}</span></span>
    ${lv>=u.max?'<b class="sm">Max</b>':`<button data-a="leg" data-v="${u.id}" data-cm="${c}" style="min-height:34px">${c} M</button>`}</div>`}).join('');
}
function vLeg(){
  const tot=CATS.map(([k,n,l])=>`${n} ${Object.keys(S.codex[k]).length}/${l.length}`).join(' · ');
  return `<div class="grid">
  <div class="card"><h2>Merit ${fmt(S.merit)}</h2><div class="d">Permanent upgrades that last across every life.</div>${legacyList()}</div>
  <div class="card"><h2>Codex</h2><div class="d">First time you roll anything earns Merit, more for rarer finds.</div><div class="sm" style="text-align:center">${tot}</div>
    ${CATS.map(([k,n,l])=>`<div class="sm"><b>${n}:</b> ${l.map(x=>S.codex[k][x.id]?`<span style="color:${rc(x.r)}">${x.n}</span>`:'<span class="dim">???</span>').join(', ')}</div>`).join('')}</div>
  <div class="card"><h2>Past lives</h2>${S.hall.length?S.hall.map(h=>`<div class="kv"><span>Life ${h.life} · ${esc(h.name)}<br><span class="sm dim">${h.race}, ${h.mag}</span></span><b class="sm">CC ${h.cc} · ${h.rank}<br>+${h.merit} M</b></div>`).join(''):'<div class="d">This is your first life.</div>'}</div>
  </div>`;
}
function vWork(){
  const P=S.P,jobs=P.jobs||{};
  if(P.age<AGE_WORK)return lockCard(AGE_WORK,'Work','Nobody will hire a child yet.');
  return `<div class="col"><div class="card"><h2>Work</h2><div class="d">Each shift costs 1 activity point, pays gold based on one stat and trains it a little. Promotions come at ${JOBLV.slice(1).join(', ')} shifts, each +12% pay. Rank raises all pay by 10% per rank.</div>
  <div class="sm" style="text-align:center">Activity <b class="num" id="wE">${P.energy}/${maxEnergy()}</b> · Gold <b class="num">${fmt(P.gold)}</b></div></div>
  <div class="grid">${JOBS.map(j=>{const open=jobOpen(j),lv=jobLv(j.id),n=jobs[j.id]||0,nx=JOBLV[lv+1];
    const need=[P.age<jobAge(j)?`age ${jobAge(j)}`:'',j.rank>P.rank?RANKS[j.rank].n:'',eff(j.st)<j.req?`${j.req} ${STN[j.st]} (you have ${fmt(eff(j.st))})`:''].filter(Boolean).join(' and ');
    return `<div class="card ${open?'':'lock'}"><div class="t">${j.n}</div><div class="d">${j.d}</div>
    <div class="meta">${STN[j.st]} · ${open?`${JOBT[lv]} · ${n} shifts${nx?` (next at ${nx})`:''}`:'Locked'}</div>
    ${open?`<button data-a="work" data-v="${j.id}" data-ce="1">Work · +${fmt(jobPay(j))}g</button>`:`<button disabled>Needs ${need}</button>`}</div>`}).join('')}</div></div>`;
}

/* ---- people ---- */
function vPeople(){
  const P=S.P,sp=canChild(),gc=giftCost(),noAct=P.acts<=0;
  const btn=(p,a,l,ok)=>`<button class="alt" data-a="ppl" data-v="${p.id}:${a}" ${ok===false||noAct&&a!=='duel'?'disabled':''} style="min-height:36px;padding:6px 8px;font-size:.72rem">${l}</button>`;
  const card=p=>{
    if(!p.alive)return `<div class="kv"><span>${esc(p.name)} <span class="dim sm">· ${relName(p)}</span></span><b class="dim sm">Died at ${p.age}</b></div>`;
    const b=[btn(p,'time','Spend time'),btn(p,'gift',`Gift ${gc}g`,P.gold>=gc)];
    if(p.kind!=='rival'&&P.age>=AGE_TRAIN)b.push(btn(p,'train',p.kind==='mentor'?'Learn':'Train together'));
    if(p.kind==='rival'&&P.age>=AGE_FIGHT)b.push(`<button data-a="ppl" data-v="${p.id}:duel" data-ce="1" style="min-height:36px;padding:6px 8px;font-size:.72rem">Duel · 1 AP</button>`);
    if(p.kind==='romance'&&P.age>=14)b.push(btn(p,'date','Ask out',p.bond>=40));
    if(p.kind==='partner')b.push(btn(p,'propose','Propose',P.age>=ADULT&&p.bond>=70));
    if(p.kind==='spouse'&&sp)b.push(btn(p,'child','Try for a child'));
    if(p.kind!=='family'&&p.kind!=='child')b.push(btn(p,'leave',p.kind==='spouse'?'Divorce':p.kind==='partner'?'Break up':'Drift apart'));
    const extra=p.kind==='child'?`<div class="sm">${rtag(byId(RACES,p.race))} · ${rtag(byId(BLOODS,p.bl))} · ${rtag(byId(MAGICS,p.mag))} · ${rtag(byId(TRAITS,p.trait))}</div>`
      :p.kind==='mentor'?`<div class="sm dim">Teaches ${STN[p.st]}</div>`:'';
    return `<div class="card" style="background:var(--panel2)"><div class="hrow"><b>${esc(p.name)}</b><span class="pill" style="color:var(--gold2)">${relName(p)}</span></div>
      <div class="sm dim">${p.gender} · ${byId(RACES,p.race).n} · Age ${p.age}</div>${extra}
      ${bar(p.kind==='rival'?'':'xp',p.bond,100,p.kind==='rival'?'Respect':'Bond')}<div class="btns" style="flex-wrap:wrap">${b.join('')}</div></div>`;
  };
  const groups=[['Spouse & partner',p=>p.kind==='spouse'||p.kind==='partner'],['Children',p=>p.kind==='child'],['Family',p=>p.kind==='family'],['Friends, rivals & others',p=>['friend','rival','mentor','romance'].includes(p.kind)]];
  return `<div class="col"><div class="card"><h2>People</h2>
    <div class="d">Social actions this year: <b class="num" style="color:var(--fg)">${P.acts}/4</b>. They refresh each time you age up. Bonds slowly fade if ignored.</div>
    <div class="btns"><button data-a="social" ${P.acts<=0||P.age<4?'disabled':''}>Socialize · meet someone</button></div>
    <div class="btns" style="align-items:center"><span class="sm" style="flex:0 0 auto">Romance with</span><select id="romp" aria-label="Romance preference">${[['opposite','Opposite gender'],['Male','Men'],['Female','Women'],['any','Everyone']].map(([v,l])=>`<option value="${v}" ${(S.romance||'opposite')===v?'selected':''}>${l}</option>`).join('')}</select></div>
    ${P.age<14?'<div class="sm dim">Romance opens at 14, marriage at 18.</div>':''}</div>
    ${groups.map(([n,f])=>{const l=P.people.filter(f);return l.length?`<h2 style="margin-top:4px">${n}</h2><div class="grid">${l.filter(p=>p.alive).map(card).join('')}</div>${l.some(p=>!p.alive)?`<div class="card">${l.filter(p=>!p.alive).map(card).join('')}</div>`:''}`:''}).join('')}
  </div>`;
}
const VIEWS={you:vYou,ppl:vPeople,train:vTrain,work:vWork,adv:vAdv,boss:vBoss,arm:vArm,leg:vLeg};
