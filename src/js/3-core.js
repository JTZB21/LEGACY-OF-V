/* ===== CORE ===== */
const KEY='vigil_save_v3';
let S,C=null,MG=null,tab='you',ctab='race';
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const fmt=n=>{n=Math.floor(n);if(Math.abs(n)<1e4)return String(n);const u=['','K','M','B','T'];let i=0,v=n;while(Math.abs(v)>=1000&&i<4){v/=1000;i++}return v.toFixed(v<100?1:0)+u[i]};
const byId=(list,id)=>list.find(x=>x.id===id);
const A=()=>S.assist;

function freshSave(){
  S={v:3,rtMode:'ask',merit:50,lp:{},codex:{race:{},bl:{},mag:{},trait:{}},assist:{},hall:[],lives:0,phase:'create',fate:null,P:null,last:Date.now()};
  newFate();
}
/* ---- fate rolling ---- */
function rollRarity(){let t=0,r=Math.random()*100;for(let i=0;i<RAR.length;i++){t+=RAR[i].w;if(r<t)return i}return 0}
function rollFrom(list){
  let r=rollRarity(),pool;
  while(r>=0&&!(pool=list.filter(x=>x.r===r)).length)r--;
  return pick(pool).id;
}
function freeSpins(){return 10+(S.lp.favor||0)*2}
function newFate(){
  const g=pick(['Male','Female']),f={name:nameFor(g),gender:g,spins:{},back:null};
  CATS.forEach(([k,,list])=>{f[k]=rollFrom(list);f.spins[k]=freeSpins();discover(k,f[k],true)});
  S.fate=f;S.phase='create';
}
function discover(k,id,quiet){
  if(S.codex[k][id])return 0;
  S.codex[k][id]=1;
  const list=CATS.find(c=>c[0]===k)[2],it=byId(list,id),m=MERIT_CODEX[it.r];
  S.merit+=m;
  if(!quiet)toast(`Codex discovery: ${it.n} (+${m} Merit)`);
  return m;
}
function spinCost(k){if(A().spins)return 0;return S.fate.spins[k]>0?0:25}
function spin(k){
  const c=spinCost(k);
  if(c&&S.merit<c)return false;
  if(!A().spins){if(S.fate.spins[k]>0)S.fate.spins[k]--;else S.merit-=c}
  const list=CATS.find(x=>x[0]===k)[2];
  S.fate[k]=rollFrom(list);discover(k,S.fate[k]);
  const it=byId(list,S.fate[k]);
  if(it.r>=4)toast(`${RAR[it.r].n}! ${it.n}`);
  return true;
}
function chooseExact(k,id){
  const list=CATS.find(x=>x[0]===k)[2],it=byId(list,id),c=EXACT_COST[it.r];
  if(it.r>=7||S.merit<c)return;
  S.merit-=c;S.fate[k]=id;discover(k,id);
}
/* ---- life ---- */
function beginLife(backId){
  const f=S.fate,b=byId(BACKS,backId),head=(S.lp.head||0)*4;
  const raw={};STK.forEach(k=>raw[k]=10+head+(b.raw[k]||0));
  S.P={name:f.name||'Nameless',race:f.race,bl:f.bl,mag:f.mag,trait:f.trait,back:backId,raw,
    mast:{},tier:{},mxp:0,mlv:1,rxp:0,rank:0,gold:b.gold,energy:0,
    wpn:b.wpn||null,foc:null,owned:b.wpn?[b.wpn]:[],pot:{hp:2,mp:1},jobs:{},bosses:{},titles:[],streak:{},wins:0,log:[],hp:-1,mp:-1,
    gender:f.gender||'Male',age:0,life:rollLife(f.race),gen:1,acts:4,dead:false,ev:null,people:[]};
  S.P.people=makeFamily(S.P);
  S.lives++;S.phase='play';tab='you';
  const P=S.P;P.hp=maxHp();P.mp=maxMp();P.energy=0;P.rt=defaultRoutine();
  const fa=P.people.find(p=>p.rel==='Father'),mo=P.people.find(p=>p.rel==='Mother');
  say(`${P.name} is born to ${mo.name} and ${fa.name}: a ${race().n} of the ${bl().n}, carrying ${magic().n} magic. Expected lifespan: about ${P.life} years.`);
  say(`Backstory: ${b.n}. Trait: ${trait().n}.`);
  save();
}
const race=()=>byId(RACES,S.P.race),bl=()=>byId(BLOODS,S.P.bl),magic=()=>byId(MAGICS,S.P.mag),trait=()=>byId(TRAITS,S.P.trait);
function say(t){const P=S.P;P.log.unshift(t);if(P.log.length>50)P.log.length=50}

/* ---- derived stats ---- */
function raceStage(){let s=0;RACE_XP.forEach(x=>{if(S.P.rxp>=x)s++});return s}
function bonusOf(src,k){return (src.m[k]||0)+(STK.includes(k)?(src.m.all||0):0)}
function mult(k){
  const P=S.P,r=race(),st=raceStage();
  let m=1;[r,bl(),trait()].forEach(s=>m*=1+bonusOf(s,k));
  const primary=(r.m[k]||0)>0||r.m.all>0||r.id==='human';
  m*=1+st*(.04+(primary?.06:0));
  m*=1+P.rank*.05;
  return Math.max(.2,m);
}
function eff(k){return S.P.raw[k]*mult(k)}
function effAll(){const o={};STK.forEach(k=>o[k]=eff(k));return o}
function xb(k){const P=S.P;return [race(),bl(),trait()].reduce((a,s)=>a+(s.m[k]||0),0)}
/* long-lived races grow slower per year so lifetime potential stays comparable */
function growthOf(raceId){const r=byId(RACES,raceId);if(r.id==='human')return 1;return Math.min(1,62/((r.life[0]+r.life[1])/2-18))}
function growth(){return growthOf(S.P.race)}
function learnMult(){return (1+xb('learn'))*(1+(S.lp.talent||0)*.1)*(A().train2?2:1)*growth()}
function goldMult(){return (1+xb('gold'))*(1+(S.lp.coin||0)*.15)*(A().gold2?2:1)}
function xpMult(){return (1+(S.lp.memory||0)*.15)*growth()}
const gearB=s=>{const id=s==='w'?S.P.wpn:S.P.foc;const g=id&&byId(GEAR,id);return g?g.b:0};
function awaken(){const l=S.P.mlv;return 1+(l>=20?.4:0)+(l>=35?.4:0)}
function maxHp(e){e=e||effAll();return Math.round(80+e.vit*6+e.dur*2)}
function maxMp(e){e=e||effAll();return Math.round(40+e.mag+e.spr*1.5)}
function maxSt(e){e=e||effAll();return Math.round(60+e.spd*.5+e.vit*.5)}
function physA(e){e=e||effAll();return (5+e.str)*(1+gearB('w'))}
function magA(e){e=e||effAll();return (5+e.mag*.9+e.ctl*.4)*(1+gearB('f'))*awaken()}
function critC(){return .05+xb('crit')+.15*eff('int')/(eff('int')+30)}
function combatClass(){
  const e=effAll(),base=STK.reduce((a,k)=>a+e[k],0)/4;
  return Math.round(base*(1+gearB('w')*.25+gearB('f')*.25)+S.P.mlv*1.5);
}
function maxEnergy(){return AP_BASE+Math.min(3,S.lp.reserve||0)+(A().speed?6:0)}
function useEnergy(n){if(S.P.energy<n){toast(n>S.P.energy&&S.P.energy===0?'No activity points left this year. Press + Age to start a new year.':`Not enough activity points. ${n} needed.`);return false}S.P.energy-=n;return true}
function mxpNeed(){return Math.round(15*Math.pow(S.P.mlv,1.6))}
function addMxp(x){const P=S.P;P.mxp+=x*xpMult();while(P.mxp>=mxpNeed()){P.mxp-=mxpNeed();P.mlv++;
  const u=SK_UNLOCK.indexOf(P.mlv);if(u>=0)say(`Magic mastery ${P.mlv}: you learned ${magic().sk[u][0]}.`);
  if(P.mlv===20||P.mlv===35)say(`Magic mastery ${P.mlv}: your ${magic().n} awakens. Magic power +40%.`);}}
function addRxp(x){const P=S.P,b=raceStage();P.rxp+=x*xpMult();const a=raceStage();
  if(a>b)say(`Race stage ${a}: ${race().st.split('|')[a-1]}.`)}
function skillsUnlocked(){return SK_UNLOCK.filter(l=>S.P.mlv>=l).length}

/* ---- training ---- */
function trainGain(t,score){
  const P=S.P,g=GRADES.find(x=>score>=x[1]),tier=P.tier[t.id]||0,m=P.mast[t.id]||0;
  const gain=2.5*g[2]*TIERM[tier]*(1+m/100)*learnMult();
  return {g,gain,mast:g[3]*(A().train2?2:1)};
}
function applyTrain(t,score){
  const P=S.P,r=trainGain(t,score);
  P.raw[t.st]+=r.gain;P.mast[t.id]=Math.min(100,(P.mast[t.id]||0)+r.mast);
  let extra='';
  if(t.id==='balance'){const x=6*r.g[2]*(A().train2?2:1);addMxp(x);extra=`, +${Math.round(x*xpMult())} magic XP`}
  if(t.id==='meditate'){const x=4*r.g[2]*(A().train2?2:1);addRxp(x);extra=`, +${Math.round(x*xpMult())} race XP`}
  return {...r,txt:`Grade ${r.g[0]}: +${r.gain.toFixed(1)} ${STN[t.st]}, +${r.mast} mastery${extra}`};
}
function upgradeTier(id){const P=S.P,t=P.tier[id]||0;if(t>=5)return;const c=TIERC[t+1];if(P.gold<c)return;P.gold-=c;P.tier[id]=t+1}
function rite(score){
  const g=GRADES.find(x=>score>=x[1]),x=(12+raceStage()*6)*g[2]*(A().train2?2:1);addRxp(x);
  return `Grade ${g[0]}: +${Math.round(x*xpMult())} race XP`;
}
function jobLv(id){const n=(S.P.jobs||{})[id]||0;let l=0;JOBLV.forEach((x,i)=>{if(n>=x)l=i});return l}
function jobAge(j){return j.rank?16:AGE_WORK}
function jobOpen(j){return S.P.age>=jobAge(j)&&S.P.rank>=j.rank&&eff(j.st)>=j.req}
function jobPay(j){return Math.round((j.b+eff(j.st)*j.k)*(1+jobLv(j.id)*.12)*(1+S.P.rank*.1)*goldMult())}
function workJob(id){
  const P=S.P,j=byId(JOBS,id);if(!j||!jobOpen(j)||!useEnergy(1))return;
  P.jobs=P.jobs||{};const before=jobLv(id),g=jobPay(j),r=.3*learnMult();
  P.gold+=g;P.raw[j.st]+=r;P.jobs[id]=(P.jobs[id]||0)+1;
  let msg=`${j.n} shift: +${fmt(g)} gold, +${r.toFixed(1)} ${STN[j.st]}`;
  if(id==='apoth'&&Math.random()<.2){P.pot.hp=(P.pot.hp||0)+1;msg+=', +1 Healing Draught'}
  const after=jobLv(id);if(after>before){say(`Promoted to ${JOBT[after]} ${j.n}. Pay +12%.`);msg+=`. Promoted to ${JOBT[after]}!`}
  toast(msg);
}
function restEffect(){const P=S.P;P.hp=Math.min(maxHp(),P.hp+maxHp()*.4);P.mp=Math.min(maxMp(),P.mp+maxMp()*.4)}
function rest(){if(!useEnergy(1))return;restEffect();toast('You rest. HP and mana restored by 40%.')}
function healerCost(){return Math.round(10+combatClass()*.6)}
function healer(){const c=healerCost(),P=S.P;if(P.gold<c)return;P.gold-=c;P.hp=maxHp();P.mp=maxMp();toast('The healer restores you fully.')}
function drink(k){const P=S.P;if(!P.pot[k])return;P.pot[k]--;if(k==='hp')P.hp=Math.min(maxHp(),P.hp+maxHp()*.45);else P.mp=Math.min(maxMp(),P.mp+maxMp()*.5)}
function buyPot(k){const P=S.P,c=potCost();if(P.gold<c)return;P.gold-=c;P.pot[k]=(P.pot[k]||0)+1}
function potCost(){return Math.round(25+combatClass()*.4)}
function buyGear(id){const P=S.P,g=byId(GEAR,id);if(P.owned.includes(id)){if(g.s==='w')P.wpn=id;else P.foc=id;return}
  if(P.gold<g.c)return;P.gold-=g.c;P.owned.push(id);if(g.s==='w')P.wpn=id;else P.foc=id;say(`You acquire the ${g.n}.`)}
function buyLegacy(id){const u=byId(LEGACY,id),lv=S.lp[id]||0,c=u.c*(lv+1);if(lv>=u.max||S.merit<c)return;S.merit-=c;S.lp[id]=lv+1}

/* ---- rebirth ---- */
function rebirthMerit(){const P=S.P;return Math.floor(combatClass()/8+P.rank*8+Object.keys(P.bosses).length*10+P.mlv+raceStage()*3)}
function rebirth(){
  const m=recordLife();
  S.P=null;C=null;newFate();save();
  toast(`Life ended. +${m} Merit carried forward.`);
}

/* ---- time ---- */
/* No real-time progress: everything happens per year (see 3-life.js). */
function tick(dt){}
function offline(){return ''}
function save(){try{S.last=Date.now();localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function load(){try{const r=localStorage.getItem(KEY);if(r){const o=JSON.parse(r);if(o&&o.v===3){S=o;S.assist=S.assist||{};migrate();return true}}}catch(e){}return false}
function migrate(){
  if(S.fate&&!S.fate.gender)S.fate.gender='Male';
  if(S.rtMode==null)S.rtMode='ask';
  if((S.lp.reserve||0)>3){let r=0;for(let l=4;l<=S.lp.reserve;l++)r+=20*l;S.merit+=r;S.lp.reserve=3;S.refund=r}
  const P=S.P;if(!P)return;
  if(P.age==null){P.age=ADULT;P.gender=P.gender||'Male';P.life=rollLife(P.race);P.gen=1;P.acts=4;P.dead=false;P.ev=null;makeFamily(P);P.people.forEach(p=>p.age+=ADULT)}
  if(P.rt==null){P.rt=defaultRoutine();P.energy=P.age>=AGE_TRAIN?maxEnergy():0;delete P.ectr;delete P.drill}
}
