/* ===== COMBAT ===== */
const skCost=(i,mm)=>Math.round((mm||maxMp())*magic().sk[i][1]/100);
const dodgeBase=(a,b)=>clamp(.05+.25*(a-b)/(a+b),.02,.3);
function makeFoe(n,arch,cc,hpM,atkM,intents){
  const a=ARCH[arch],e=cc/2;
  const st={str:e*a.str,mag:e*a.mag,dur:e*a.dur,spd:e*a.spd,vit:e*a.hp,ctl:e*.8,spr:e*.8,int:e*.8};
  const max=Math.round((80+st.vit*6+st.dur*2)*hpM);
  return {n,cc:Math.round(cc),st,hp:max,max,pa:(5+st.str)*atkM,ma:(5+st.mag*.9+st.ctl*.4)*atkM,i:intents||a.i,intent:null,phase:1,boss:false,s:{}};
}
function canFight(){
  const P=S.P;
  if(P.hp<maxHp()*.1){toast('Too injured. Recover first.');return false}
  return true;
}
function startFight(kind,ref){
  const P=S.P;let foe,cost=1;
  if(P.age<AGE_FIGHT){toast(`Fighting begins at age ${AGE_FIGHT}.`);return}
  if((kind==='boss'||kind==='trial')&&P.age<AGE_TRIAL){toast(`Bosses and trials open at age ${AGE_TRIAL}.`);return}
  const safe=kind==='spar'||kind==='rival';
  if(!safe&&!canFight())return;
  if(kind==='region'){
    const r=byId(REGIONS,ref),sk=P.streak[r.id]||0,f=pick(r.f);
    foe=makeFoe(f[0],f[1],r.cc*(1+.06*sk),.5,.85);
  }else if(kind==='boss'){
    const b=byId(BOSSES,ref);cost=2;
    foe=makeFoe(b.n,b.a,b.cc,b.hp,1.05+BOSSES.indexOf(b)*.04,b.i);foe.boss=true;
  }else if(kind==='trial'){
    const nx=RANKS[P.rank+1];cost=2;
    foe=makeFoe('Vigil Examiner','duel',nx.cc,1.1,.95);foe.boss=true;
  }else if(kind==='rival'){
    const rv=P.people.find(x=>x.id===ref);if(!rv)return;
    foe=makeFoe(rv.name,pick(['duel','brute','swift','caster']),combatClass()*rnd(.9,1.12),.7,.9);
  }else{
    foe=makeFoe('Sparring Trainer','duel',combatClass()*.85,.6,.8);
  }
  if(!useEnergy(cost))return;
  const e=effAll();
  C={kind,ref,foe,e,log:[],over:null,turn:1,snap:{hp:P.hp,mp:P.mp},
     p:{hp:safe?maxHp():P.hp,max:maxHp(),mp:safe?maxMp():P.mp,mmax:maxMp(),st:maxSt(),smax:maxSt(),s:{}}};
  foe.intent=nextIntent();
  clog(`${foe.n} (CC ${foe.cc}) stands before you.`);
}
function clog(t){C.log.unshift(t);if(C.log.length>30)C.log.length=30}
function nextIntent(){
  const f=C.foe;
  if(f.s.charged){f.s.charged=false;return 'unleash'}
  const w=Object.assign({},f.i);if(f.phase===2)w.charge=(w.charge||0)+1;
  let t=Object.values(w).reduce((a,b)=>a+b,0),r=Math.random()*t;
  for(const k in w){r-=w[k];if(r<=0)return k}
  return 'strike';
}
/* player -> foe */
function hitFoe(Aval,pow,o){
  const f=C.foe,p=C.p;o=o||{};
  let D=o.magic?(f.st.spr+f.st.ctl)*.4:f.st.dur*.8;if(o.pierce)D*=.4;
  if(!o.magic||Math.random()<.5){
    if(Math.random()<dodgeBase(f.st.spd,C.e.spd)*(o.magic?.5:1)){clog(`${f.n} evades your attack.`);return 0}
  }
  let d=pow*Aval*Aval/(Aval+D)*rnd(.9,1.1),crit=false;
  if(Math.random()<critC()){d*=1.6;crit=true}
  if(f.s.guard){if(o.heavy){f.s.guard=false;clog(`Your heavy blow breaks ${f.n}'s guard!`)}else d*=.5}
  if(p.s.open){d*=1.5;p.s.open=false}
  d=Math.max(1,Math.round(d));f.hp-=d;
  return crit?-d:d;
}
const dtxt=d=>d<0?`${-d} (critical!)`:`${d}`;
function act(a,arg){
  if(!C||C.over)return;
  const p=C.p,f=C.foe,P=S.P;p.s.block=false;p.s.dodge=false;
  let line='';
  if(a==='strike'){const d=hitFoe(physA(C.e),1);p.st=Math.min(p.smax,p.st+6);line=d?`You strike for ${dtxt(d)}.`:''}
  else if(a==='heavy'){if(p.st<25)return;p.st-=25;const d=hitFoe(physA(C.e),1.9,{heavy:true});line=d?`Heavy blow for ${dtxt(d)}.`:''}
  else if(a==='block'){if(p.st<8)return;p.st-=8;p.s.block=true;p.mp=Math.min(p.mmax,p.mp+p.mmax*.08);line='You raise your guard.'}
  else if(a==='dodge'){if(p.st<14)return;p.st-=14;p.s.dodge=true;line='You ready yourself to dodge.'}
  else if(a==='recover'){p.st=Math.min(p.smax,p.st+p.smax*.4);p.mp=Math.min(p.mmax,p.mp+p.mmax*.12);line='You catch your breath.'}
  else if(a==='pot'){if(!P.pot[arg])return;P.pot[arg]--;
    if(arg==='hp'){const h=Math.round(p.max*.45);p.hp=Math.min(p.max,p.hp+h);line=`You drink a Healing Draught. +${h} HP.`}
    else{const h=Math.round(p.mmax*.5);p.mp=Math.min(p.mmax,p.mp+h);line=`You drink a Mana Tonic. +${h} mana.`}}
  else if(a==='skill'){
    const sk=magic().sk[arg],cost=skCost(arg,p.mmax);if(!sk||arg>=skillsUnlocked()||p.mp<cost)return;
    p.mp-=cost;addMxp(3);const M=magA(C.e),ef=sk[3];
    if(ef==='heal'){const h=Math.round(M*sk[2]*.8);p.hp=Math.min(p.max,p.hp+h);line=`${sk[0]} heals you for ${h}.`}
    else if(ef==='shield'){const s=Math.round(M*sk[2]);p.s.shield=(p.s.shield||0)+s;line=`${sk[0]}: a ${s}-point shield surrounds you.`}
    else if(ef==='evade'){p.s.evade=true;line=`${sk[0]}: the next attack will likely miss.`}
    else if(ef==='counter'){p.s.counter=true;line=`${sk[0]}: you will reflect the next physical blow.`}
    else if(ef==='multi'){let tot=0;for(let i=0;i<3;i++)tot+=Math.abs(hitFoe(M,sk[2]/3*1.15,{magic:true}));line=`${sk[0]} hits 3 times for ${tot}.`}
    else{
      const d=hitFoe(M,sk[2],{magic:true,pierce:ef==='pierce'});line=`${sk[0]} deals ${dtxt(d)}.`;
      if(d&&ef==='burn'){f.s.burn={d:Math.round(Math.abs(d)*.25),t:3};line+=` ${f.n} is burning.`}
      if(d&&ef==='drain'){const h=Math.round(Math.abs(d)*.4);p.hp=Math.min(p.max,p.hp+h);line+=` You drain ${h} HP.`}
      if(ef==='stun'){if(f.boss&&Math.random()<.5)line+=` ${f.n} resists the stun.`;else{f.s.stun=true;line+=` ${f.n} is stunned!`}}
      if(ef==='weaken'){f.s.weaken=3;line+=` ${f.n} is weakened.`}
    }
  }
  else if(a==='flee'){if(C.kind==='region')P.streak[C.ref]=0;clog('You retreat.');endFight('flee');return}
  if(line)clog(line);
  if(f.hp<=0)return endFight('win');
  if(f.phase===1&&f.boss&&f.hp<f.max*.5){f.phase=2;f.pa*=1.3;f.ma*=1.3;f.st.spd*=1.15;clog(`${f.n} enters a frenzy! Its attacks grow stronger.`)}
  foeTurn();
  if(f.s.burn&&f.hp>0){f.hp-=f.s.burn.d;clog(`Burn deals ${f.s.burn.d}.`);if(--f.s.burn.t<=0)delete f.s.burn}
  if(f.hp<=0)return endFight('win');
  if(p.hp<=0)return endFight('lose');
  p.st=Math.min(p.smax,p.st+8);if(f.s.weaken)f.s.weaken--;
  C.turn++;f.intent=nextIntent();
}
/* foe -> player */
function hitPlayer(Aval,pow,magic){
  const p=C.p,f=C.foe,e=C.e;
  if(p.s.counter&&!magic){p.s.counter=false;const r=Math.round(pow*Aval*1.5);f.hp-=r;clog(`You reflect the blow back for ${r}!`);return 0}
  let dc=dodgeBase(e.spd,f.st.spd)+(p.s.dodge?(magic?.22:.45):0)+(p.s.evade?.6:0);p.s.evade=false;
  if(Math.random()<dc){if(p.s.dodge){p.s.open=true;clog('You dodge and find an opening! Next attack +50%.')}else clog('You evade it.');return 0}
  const D=magic?(e.spr+e.ctl)*.4:e.dur*.8;
  let d=pow*Aval*Aval/(Aval+D)*rnd(.9,1.1);
  if(f.s.weaken)d*=.65;
  if(p.s.block)d*=magic?.6:.3;
  if(A().god)d=0;
  d=Math.round(d);
  if(p.s.shield&&d>0){const a=Math.min(p.s.shield,d);p.s.shield-=a;d-=a;if(p.s.shield<=0)delete p.s.shield;if(a)clog(`Your shield absorbs ${a}.`)}
  p.hp-=d;return d;
}
function foeTurn(){
  const f=C.foe,p=C.p;f.s.guard=false;
  if(f.s.stun){f.s.stun=false;clog(`${f.n} is stunned and cannot act.`);return}
  const it=f.intent;let d;
  if(it==='strike'){d=hitPlayer(f.pa,1,false);if(d)clog(`${f.n} strikes you for ${d}.`)}
  else if(it==='heavy'){d=hitPlayer(f.pa,1.8,false);if(d)clog(`${f.n} lands a heavy blow for ${d}${p.s.block?' (blocked)':''}.`)}
  else if(it==='unleash'){d=hitPlayer(f.pa,2.6,false);if(d)clog(`${f.n} UNLEASHES for ${d}${p.s.block?' (blocked)':''}!`)}
  else if(it==='spell'){d=hitPlayer(f.ma,1.35,true);if(d)clog(`${f.n} casts a spell for ${d}.`)}
  else if(it==='drain'){d=hitPlayer(f.ma,1.2,true);if(d){const h=Math.round(d*.5);f.hp=Math.min(f.max,f.hp+h);clog(`${f.n} drains ${d} and heals ${h}.`)}}
  else if(it==='flurry'){let t=0;for(let i=0;i<3;i++)t+=hitPlayer(f.pa,.45,false);if(t)clog(`${f.n}'s flurry deals ${t} in total.`)}
  else if(it==='guard'){f.s.guard=true;clog(`${f.n} takes a defensive stance. Your next hit deals half, unless it is a heavy blow.`)}
  else if(it==='charge'){f.s.charged=true;clog(`${f.n} gathers power. Block or dodge next turn!`)}
  else if(it==='heal'){const h=Math.round(f.max*.12);f.hp=Math.min(f.max,f.hp+h);clog(`${f.n} heals ${h}.`)}
}
function endFight(res){
  const P=S.P,f=C.foe,p=C.p;let rew=[];
  C.over=res;
  if(C.kind==='spar'||C.kind==='rival'){P.hp=C.snap.hp;P.mp=C.snap.mp}else{P.hp=Math.max(0,p.hp);P.mp=p.mp}
  if(res==='win'){
    P.wins++;const cc=f.cc;
    if(C.kind==='region'){
      const g=Math.round((8+cc*.7)*rnd(.8,1.2)*goldMult()),x=4+cc*.08,c=(.4+cc*.004)*learnMult()/ (A().train2?2:1);
      P.gold+=g;addRxp(x);['str','spd','dur'].forEach(k=>P.raw[k]+=c);
      P.streak[C.ref]=(P.streak[C.ref]||0)+1;
      rew.push(`+${fmt(g)} gold`,`+${Math.round(x*xpMult())} race XP`,`+${c.toFixed(1)} Strength, Speed, Durability`);
      if(Math.random()<.04){S.merit++;rew.push('+1 Merit')}
      if(Math.random()<.15){P.pot.hp=(P.pot.hp||0)+1;rew.push('found a Healing Draught')}
    }else if(C.kind==='boss'){
      const b=byId(BOSSES,C.ref),i=BOSSES.indexOf(b),first=!P.bosses[b.id];
      const g=Math.round(cc*(first?12:4)*goldMult()),x=cc*.4;
      P.gold+=g;addRxp(x);STK.forEach(k=>P.raw[k]+=cc*.02);
      rew.push(`+${fmt(g)} gold`,`+${Math.round(x*xpMult())} race XP`,`+${(cc*.02).toFixed(1)} to every stat`);
      if(first){const m=10+i*8;S.merit+=m;P.bosses[b.id]=1;P.titles.push(b.title);rew.push(`+${m} Merit`,`Title: ${b.title}`);say(`You defeat ${b.n} and earn the title ${b.title}.`)}
    }else if(C.kind==='trial'){
      P.rank++;const g=Math.round(RANKS[P.rank].cc*5*goldMult());P.gold+=g;
      rew.push(`Promoted to ${RANKS[P.rank].n}`,`+${fmt(g)} gold`,'+5% to every stat');say(`You pass the trial and are named ${RANKS[P.rank].n}.`);
    }else if(C.kind==='rival'){
      const rv=P.people.find(x=>x.id===C.ref),c=1.6*learnMult();['str','spd','dur'].forEach(k=>P.raw[k]+=c);
      if(rv){rv.bond=Math.min(100,rv.bond+12);rv.wins=(rv.wins||0)+1;if(rv.bond>=60&&rv.kind==='rival'){rv.kind='friend';rew.push(`${rv.name} now respects you as a friend`)}}
      rew.push(`+${c.toFixed(1)} Strength, Speed, Durability`,'Rival bond +12');say(`Age ${P.age}. You defeat your rival ${f.n} in a duel.`);
    }else{
      const c=2.5*1.2*learnMult();['str','spd','dur','int'].forEach(k=>P.raw[k]+=c);
      rew.push(`+${c.toFixed(1)} Strength, Speed, Durability, Intelligence`);
    }
    clog(`Victory over ${f.n}!`);
  }else if(res==='lose'){
    clog(`You were defeated by ${f.n}.`);
    if(C.kind==='region'){P.streak[C.ref]=0;const l=Math.floor(P.gold*.1);P.gold-=l;rew.push(`Lost ${fmt(l)} gold`,'Streak reset')}
    if(C.kind==='rival'){const rv=P.people.find(x=>x.id===C.ref);if(rv)rv.bond=Math.max(0,rv.bond-5);rew.push('Your rival gloats')}
    if(C.kind!=='spar'&&C.kind!=='rival'){P.hp=Math.max(1,Math.round(maxHp()*.05));rew.push('Badly wounded. Recover before your next fight.')}
  }
  C.rew=rew;save();
}
