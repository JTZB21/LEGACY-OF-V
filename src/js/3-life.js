/* ===== LIFE SIM ===== */
const AGE_TRAIN=3,AGE_FIGHT=6,AGE_WORK=10,AGE_TRIAL=12,ADULT=18;
function rollLife(raceId){const r=byId(RACES,raceId);return Math.round(rnd(r.life[0],r.life[1]))}
function nameFor(g){
  const pool=g==='Female'?FNAMES:MNAMES,used=new Set();
  if(S&&S.P){used.add(S.P.name);(S.P.people||[]).forEach(p=>used.add(p.name))}
  if(S&&S.fate)used.add(S.fate.name);
  let n=pick(pool);for(let i=0;i<15&&used.has(n);i++)n=pick(pool);return n;
}
function stage(P){P=P||S.P;if(P.age>=Math.max(50,P.life*.8))return 'Elder';return P.age<AGE_TRAIN?'Infant':P.age<13?'Child':P.age<ADULT?'Teen':'Adult'}

/* ---- event helpers (used by EVENTS) ---- */
function R(k,n){const v=n*(1+xb('learn')*.5)*growth();S.P.raw[k]+=v;return `+${v.toFixed(1)} ${STN[k]}`}
function G(n){S.P.gold=Math.max(0,S.P.gold+Math.round(n*(n>0?goldMult():1)));return n>=0?`+${fmt(n*goldMult())} gold`:`-${fmt(-n)} gold`}
function X(n){addRxp(n);return `+${Math.round(n*xpMult())} race XP`}
function MX(n){addMxp(n);return `+${Math.round(n*xpMult())} magic XP`}
function MER(n){S.merit+=n;return `+${n} Merit`}
function bondAll(n){S.P.people.forEach(p=>{if(p.alive&&p.kind!=='rival')p.bond=Math.min(100,p.bond+n)})}

/* ---- people ---- */
function person(o){return Object.assign({id:Math.random().toString(36).slice(2,9),bond:Math.round(rnd(25,50)),alive:true},o)}
function relName(p){
  if(p.kind==='child')return p.gender==='Female'?'Daughter':'Son';
  if(p.kind==='spouse')return p.gender==='Female'?'Wife':'Husband';
  return p.rel||REL_KIND[p.kind];
}
function makeFamily(P){
  const r=P.race,rl=byId(RACES,r).life,avg=(rl[0]+rl[1])/2,out=P.people=[];
  ['Male','Female'].forEach(g=>out.push(person({kind:'family',rel:g==='Male'?'Father':'Mother',gender:g,name:nameFor(g),race:r,
    age:Math.round(avg*rnd(.22,.4)),life:rollLife(r),bond:Math.round(rnd(55,85))})));
  const sib=Math.floor(rnd(0,2.6));
  for(let i=0;i<sib;i++){const g=pick(['Male','Female']);out.push(person({kind:'family',rel:g==='Male'?'Brother':'Sister',gender:g,name:nameFor(g),race:r,age:Math.round(rnd(1,8)),life:rollLife(r),bond:Math.round(rnd(40,70))}))}
  return out;
}
function romanceGender(){const p=S.romance||'opposite';return p==='any'?pick(['Male','Female']):p==='opposite'?(S.P.gender==='Female'?'Male':'Female'):p}
function meet(kind){
  const P=S.P;
  if(kind==='romance'&&P.age<14)kind='friend';
  if(P.people.filter(p=>p.alive&&['friend','rival','mentor','romance'].includes(p.kind)).length>=10){
    const i=P.people.findIndex(p=>p.alive&&['friend','rival','mentor','romance'].includes(p.kind)&&p.bond<30);
    if(i>=0)P.people.splice(i,1);else return 'You hear about someone interesting, but your circle is already full.';
  }
  const g=kind==='romance'?romanceGender():pick(['Male','Female']);
  const sameRace=Math.random()<.7,r=sameRace?P.race:rollFrom(RACES);
  let age=Math.max(1,P.age+Math.round(rnd(-3,3)));
  if(kind==='mentor')age=P.age+Math.round(rnd(15,40));
  if(kind==='romance')age=Math.max(16,P.age+Math.round(rnd(-3,4)));
  const p=person({kind,gender:g,name:nameFor(g),race:r,age,life:rollLife(r),bond:kind==='rival'?Math.round(rnd(5,20)):kind==='romance'?Math.round(rnd(20,40)):Math.round(rnd(25,45))});
  if(kind==='mentor')p.st=pick(STK);
  if(kind==='romance'){p.bl=rollFrom(BLOODS);p.mag=rollFrom(MAGICS)}
  P.people.push(p);
  const what={friend:'a new friend',rival:'a rival',mentor:`a mentor skilled in ${STN[p.st]||''}`,romance:'someone who catches your eye'}[kind];
  return `You meet ${p.name}, ${what}.`;
}
function randomMeetKind(){const P=S.P;const r=Math.random();if(P.age>=16&&r<.25)return 'romance';if(r<.55)return 'friend';if(r<.75)return 'rival';return 'mentor'}
function socialize(){const P=S.P;if(P.acts<=0||P.age<4)return;P.acts--;toast(meet(randomMeetKind()));}
const giftCost=()=>Math.round(20+S.P.age*1.5);
function canChild(){
  const P=S.P,sp=P.people.find(p=>p.kind==='spouse'&&p.alive);
  return sp&&P.age>=ADULT&&P.age<P.life*.6&&sp.age<sp.life*.6&&P.people.filter(p=>p.kind==='child').length<8?sp:null;
}
function interact(id,a){
  const P=S.P,p=P.people.find(x=>x.id===id);if(!p||!p.alive)return;
  if(a==='duel'){startFight('rival',id);return}
  if(P.acts<=0){toast('No social actions left this year. Age up to refresh them.');return}
  let msg='';
  if(a==='time'){const b=Math.round(rnd(6,14));p.bond=Math.min(100,p.bond+b);msg=`You spend time with ${p.name}. Bond +${b}.`}
  else if(a==='gift'){const c=giftCost();if(P.gold<c)return toast(`A good gift costs ${c} gold.`);P.gold-=c;p.bond=Math.min(100,p.bond+20);msg=`${p.name} loves your gift. Bond +20.`}
  else if(a==='train'){const k=p.st||pick(STK),n=(p.kind==='mentor'?2.5:1)*learnMult()*(p.bond>=60?1.3:1);P.raw[k]+=n;p.bond=Math.min(100,p.bond+4);msg=`You train with ${p.name}. +${n.toFixed(1)} ${STN[k]}.`}
  else if(a==='date'){if(p.bond<40)return toast(`${p.name} needs a bond of 40 first.`);p.kind='partner';p.bond=Math.min(100,p.bond+10);msg=`${p.name} agrees to be your partner!`;say(`Age ${P.age}. You begin courting ${p.name}.`)}
  else if(a==='propose'){
    if(P.age<ADULT||p.bond<70)return toast('You need to be an adult with a bond of 70 or more.');
    if(Math.random()<p.bond/100+.1){p.kind='spouse';p.bond=Math.min(100,p.bond+15);msg=`${p.name} says yes! You are married.`;say(`Age ${P.age}. You marry ${p.name}.`)}
    else{p.bond-=15;msg=`${p.name} isn't ready and turns you down. Bond -15.`}
  }
  else if(a==='child'){
    const sp=canChild();if(!sp)return;
    if(Math.random()<.55){const k=haveChild(sp);msg=`${k.name} is born! You have a ${k.gender==='Female'?'daughter':'son'}.`}
    else msg='No child this time. Try again.';
  }
  else if(a==='leave'){
    const was=relName(p);P.people.splice(P.people.indexOf(p),1);msg=p.kind==='spouse'?`You and ${p.name} divorce.`:`You part ways with ${p.name}.`;say(`Age ${P.age}. ${msg}`);
    P.acts--;toast(msg);return;
  }
  P.acts--;toast(msg);
}
function haveChild(sp){
  const P=S.P,g=pick(['Male','Female']),r=Math.random();
  const k=person({kind:'child',gender:g,name:nameFor(g),age:0,bond:80,
    race:Math.random()<.5?P.race:sp.race,
    bl:Math.random()<.6?P.bl:(sp.bl||rollFrom(BLOODS)),
    mag:r<.4?P.mag:r<.6&&sp.mag?sp.mag:rollFrom(MAGICS),
    trait:rollFrom(TRAITS)});
  k.life=rollLife(k.race);P.people.push(k);
  say(`Age ${P.age}. ${k.name} is born to you and ${sp.name}: ${byId(RACES,k.race).n}, ${byId(MAGICS,k.mag).n} magic.`);
  return k;
}

/* ---- yearly routine ---- */
function defaultRoutine(){return {train:'boulder',tN:6,job:'best',wN:4,rN:2,social:true}}
function bestJob(){let b=null;JOBS.forEach(j=>{if(jobOpen(j)&&(!b||jobPay(j)>jobPay(b)))b=j});return b}
function routineJob(){const P=S.P,rt=P.rt;if(rt.job!=='best'){const j=byId(JOBS,rt.job);if(j&&jobOpen(j))return j}return bestJob()}
function split(ap,w){const tot=w.reduce((a,b)=>a+b,0);if(!tot)return w.map(()=>0);const raw=w.map(x=>x/tot*ap),out=raw.map(Math.floor);
  let left=ap-out.reduce((a,b)=>a+b,0);raw.map((x,i)=>[x-out[i],i]).sort((a,b)=>b[0]-a[0]).forEach(([,i])=>{if(left>0){out[i]++;left--}});return out}
function runRoutine(ap){
  const P=S.P,rt=P.rt||(P.rt=defaultRoutine());if(P.age<AGE_TRAIN)return '';
  let [t,w,r]=split(ap,[rt.tN,rt.wN,rt.rN]);
  const job=P.age>=AGE_WORK?routineJob():null;if(!job){t+=w;w=0}
  const tr=byId(TRAIN,rt.train)||TRAIN[0];
  let rests=0;for(let i=0;i<r;i++){if(P.hp<maxHp()*.95||P.mp<maxMp()*.95){restEffect();rests++}else t++}
  const st0=P.raw[tr.st],g0=P.gold;
  for(let i=0;i<t;i++){const g=trainGain(tr,0);P.raw[tr.st]+=g.gain/GRADES[4][2];P.mast[tr.id]=Math.min(100,(P.mast[tr.id]||0)+2)}
  for(let i=0;i<w;i++){P.gold+=jobPay(job);P.raw[job.st]+=.3*learnMult();P.jobs[job.id]=(P.jobs[job.id]||0)+1}
  let soc=0;
  if(rt.social){const ppl=P.people.filter(p=>p.alive&&p.kind!=='rival').sort((a,b)=>a.bond-b.bond);
    while(P.acts>0&&ppl.length){const p=ppl[0];p.bond=Math.min(100,p.bond+10);P.acts--;soc++;ppl.sort((a,b)=>a.bond-b.bond)}}
  P.energy=0;
  const parts=[t?`${t} ${tr.n} (+${(P.raw[tr.st]-st0).toFixed(1)} ${STN[tr.st]})`:'',w?`${w} ${job.n} shifts (+${fmt(P.gold-g0)} gold)`:'',rests?`${rests} rest`:'',soc?`${soc} visits`:''].filter(Boolean);
  return parts.length?`Routine: ${parts.join(', ')}.`:'';
}
/* ---- aging ---- */
function yearPass(skipping){
  const P=S.P;
  P.age++;P.acts=SOCIAL_ACTS;
  if(P.age<=ADULT)STK.forEach(k=>P.raw[k]+=.8*(1+xb('learn')*.5));
  else if(stage()==='Elder'){const d=.15/(P.life*.2);['str','spd','vit'].forEach(k=>P.raw[k]*=1-d)}
  if(P.age===AGE_TRAIN)say(`Age ${P.age}. You are old enough to begin formal training. You now get activity points each year.`);
  if(P.age===AGE_FIGHT)say(`Age ${P.age}. You may now spar and explore the nearby wilds.`);
  if(P.age===AGE_WORK)say(`Age ${P.age}. You are old enough to take on work.`);
  if(P.age===AGE_TRIAL)say(`Age ${P.age}. The Vigil now accepts you for trials, and bosses take notice.`);
  if(P.age===ADULT)say(`Age ${P.age}. You come of age.`);
  const sal=Math.round(RANKS[P.rank].sal*SALARY_YEAR*goldMult());if(sal)P.gold+=sal;
  for(const p of P.people){
    if(!p.alive)continue;p.age++;
    if(!['child','spouse','partner'].includes(p.kind))p.bond=Math.max(0,p.bond-2);
    if(p.kind==='child'&&p.age===ADULT)say(`Age ${P.age}. Your ${relName(p).toLowerCase()} ${p.name} comes of age.`);
    if(p.age>=p.life&&Math.random()<.35){
      p.alive=false;say(`Age ${P.age}. Your ${relName(p).toLowerCase()} ${p.name} has died at ${p.age}.`);P.pause=1;
      if(p.rel==='Father'||p.rel==='Mother'){const g=Math.round(50+P.age*3);P.gold+=g;say(`You inherit ${g} gold.`)}
    }
  }
  if(P.age>=5&&Math.random()<.15)say(`Age ${P.age}. ${meet(randomMeetKind())}`);
  if(P.age>=P.life&&(Math.random()<.3||P.age>=P.life*1.1)){die();return}
  P.hp=maxHp();P.mp=maxMp();
  P.energy=P.age>=AGE_TRAIN?maxEnergy():0;
  const pool=EVENTS.map((e,j)=>j).filter(j=>P.age>=EVENTS[j].a[0]&&P.age<=EVENTS[j].a[1]);
  const chance=skipping?.2:(P.age<=8?.75:.5);
  if(pool.length&&Math.random()<chance)P.ev=pick(pool);
  else if(!skipping&&Math.random()<.4)say(`Age ${P.age}. ${pick(FLAVOUR)}`);
}
/* n years. useRoutine spends leftover points first. Skips pause on events, deaths in the family, adulthood and your own death. */
function ageUp(n,useRoutine){
  const P=S.P;if(!P||P.dead||P.ev!=null||C||MG)return;
  const start=P.age;let routineMsg='';P.pause=0;
  for(let i=0;i<n;i++){
    if(useRoutine||i>0){const m=runRoutine(P.energy);if(m)routineMsg=m}
    yearPass(n>1);
    if(P.dead||P.ev!=null||(n>1&&(P.pause||P.age===ADULT||P.age===AGE_TRAIN)))break;
  }
  const yrs=P.age-start;
  if(routineMsg)say(`Age ${start}${yrs>1?`-${P.age-1}`:''}. ${routineMsg}`);
  if(n>1&&yrs<n&&!P.dead)toast(`Skip paused at age ${P.age}${P.ev!=null?': something needs your decision.':'.'}`);
  save();
}
function resolveEvent(ci){
  const P=S.P,e=EVENTS[P.ev];if(!e)return;
  const c=e.c[ci];P.ev=null;
  say(`Age ${P.age}. ${c[0]}: ${c[1]()}`);save();
}
function die(){const P=S.P;P.dead=true;say(`${P.name} dies at the age of ${P.age}.`);save()}
function heirs(){return S.P.people.filter(p=>p.kind==='child'&&p.alive)}
function recordLife(){
  const P=S.P,m=rebirthMerit();S.merit+=m;
  S.hall.unshift({name:P.name,life:S.lives,gen:P.gen||1,age:P.age,race:race().n,mag:magic().n,cc:combatClass(),rank:RANKS[P.rank].n,merit:m});
  if(S.hall.length>25)S.hall.length=25;
  return m;
}
function continueAs(cid){
  const old=S.P,kid=old.people.find(p=>p.id===cid);if(!kid)return;
  const m=recordLife(),head=(S.lp.head||0)*4,raw={};
  STK.forEach(k=>raw[k]=10+head+old.raw[k]*.15+.8*Math.min(kid.age,ADULT));
  [['race',kid.race],['bl',kid.bl],['mag',kid.mag],['trait',kid.trait]].forEach(([k,id])=>discover(k,id));
  const ppl=[];
  old.people.forEach(p=>{
    if(p.id===cid)return;
    if(p.kind==='spouse'||p.kind==='partner')ppl.push(Object.assign({},p,{kind:'family',rel:p.gender==='Female'?'Mother':'Father',bond:Math.max(50,p.bond)}));
    else if(p.kind==='child')ppl.push(Object.assign({},p,{kind:'family',rel:p.gender==='Female'?'Sister':'Brother'}));
  });
  ppl.unshift(person({kind:'family',rel:old.gender==='Female'?'Mother':'Father',gender:old.gender,name:old.name,race:old.race,age:old.age,life:old.life,bond:kid.bond,alive:false}));
  S.P={name:kid.name,gender:kid.gender,race:kid.race,bl:kid.bl,mag:kid.mag,trait:kid.trait,back:'heir',backN:`Heir of ${old.name}`,raw,
    mast:{},tier:Object.assign({},old.tier),mxp:0,mlv:1,rxp:0,rank:0,gold:Math.round(old.gold*.5),energy:0,rt:Object.assign({},old.rt||defaultRoutine()),
    wpn:old.wpn,foc:old.foc,owned:old.owned.slice(),pot:Object.assign({},old.pot),jobs:{},bosses:{},titles:[],streak:{},wins:0,log:[],hp:-1,mp:-1,
    age:kid.age,life:kid.life||rollLife(kid.race),gen:(old.gen||1)+1,people:ppl,acts:4,dead:false,ev:null};
  S.lives++;C=null;
  const P=S.P;P.hp=maxHp();P.mp=maxMp();P.energy=P.age>=AGE_TRAIN?maxEnergy():0;
  say(`Generation ${P.gen}. ${P.name} carries on the legacy of ${old.name} at age ${P.age}, inheriting ${fmt(P.gold)} gold, the family gear and training grounds.`);
  toast(`+${m} Merit. ${P.name} continues your line.`);save();
}
