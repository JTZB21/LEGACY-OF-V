/* ===== MINI-GAMES ===== */
const OBST=[['Low beam','Slide'],['Open pit','Jump'],['Falling rocks','Dodge'],['Long gap','Dash'],['Swinging log','Slide'],['Spike row','Jump'],['Thrown spear','Dodge'],['Closing gate','Dash']];
const MOVES=['Dodge','Jump','Slide','Dash'];
const SYMS=['◆','▲','●','■','★','✚'];
function startTrain(id){
  const isRite=id==='rite',t=isRite?{id:'rite',n:'Heritage Rite',g:'timing'}:byId(TRAIN,id);
  if(S.P.age<AGE_TRAIN){toast(`Training begins at age ${AGE_TRAIN}.`);return}
  if(!useEnergy(1))return;
  MG={t,type:t.g,phase:'play',t0:performance.now(),sc:[],i:0};
  if(A().auto){mgFinish(.85);return}
  const m=MG;
  if(m.type==='timing'){m.n=3;m.sp=[.9,1.25,1.65];m.ph=Math.random()}
  if(m.type==='breath'){m.type='timing';m.n=4;m.sp=[.35,.42,.5,.58];m.ph=Math.random()}
  if(m.type==='react'){m.n=6;m.seq=Array.from({length:6},()=>pick(OBST));m.rs=performance.now()}
  if(m.type==='brace'){m.n=5;m.rs=performance.now()+500}
  if(m.type==='pace'||m.type==='balance'){m.v=.35;m.inz=0;m.dur=8;m.lt=performance.now()}
  if(m.type==='mash'){m.taps=0;m.dur=6}
  if(m.type==='memory'){m.n=3;m.seq=[];m.k=0;m.showing=true;m.shown=-1}
  renderMG();
  if(m.type==='memory')memRound();
  requestAnimationFrame(mgLoop);
}
function mgFinish(score){
  const m=MG;m.phase='done';m.score=clamp(score,0,1);
  m.res=m.t.id==='rite'?rite(m.score):applyTrain(m.t,m.score).txt;
  m.grade=GRADES.find(x=>m.score>=x[1]);
  save();renderMG();render();
}
const nowT=()=>(performance.now()-MG.t0)/1000;
function mgTap(v){
  const m=MG;if(!m||m.phase!=='play')return;
  const now=performance.now();
  if(m.type==='timing'){
    const x=pipX(),d=Math.abs(x-.5),s=d<.035?1:d<.1?.75:d<.2?.45:.1;
    m.sc.push(s);m.last=s>=1?'PERFECT':s>=.75?'GOOD':s>=.45?'OK':'MISS';m.i++;m.t0=now;m.ph=Math.random();
    if(m.i>=m.n)return mgFinish(avg(m.sc));
  }else if(m.type==='react'){
    if(now<m.rs)return;
    const w=1900-m.i*130,el=now-m.rs,ok=v===m.seq[m.i][1];
    m.sc.push(ok?.5+.5*Math.max(0,1-el/w):0);m.last=ok?'Clean!':`Wrong. It was ${m.seq[m.i][1]}.`;
    m.i++;m.rs=now+350;if(m.i>=m.n)return mgFinish(avg(m.sc));renderMG();
  }else if(m.type==='brace'){
    if(now<m.rs)return;
    const T=1500-m.i*150,f=(now-m.rs)/T,s=f>=.9&&f<=1?1:f>=.78?.7:f*.4;
    m.sc.push(s);m.last=s>=1?'PERFECT BRACE':s>=.7?'Good brace':'Too early';m.i++;m.rs=now+450;
    if(m.i>=m.n)return mgFinish(avg(m.sc));
  }else if(m.type==='pace'||m.type==='balance'){m.v=Math.min(1,m.v+.11)}
  else if(m.type==='mash'){m.taps++}
  else if(m.type==='memory'){
    if(m.showing)return;
    if(v===m.seq[m.k]){m.k++;if(m.k>=m.seq.length){m.sc.push(1);m.last='Correct!';nextMem()}}
    else{m.sc.push(m.k/m.seq.length);m.last=`Wrong. The sequence was ${m.seq.join(' ')}`;nextMem()}
    if(m.phase==='play')renderMG();
  }
  mgUpdate();
}
const avg=a=>a.reduce((x,y)=>x+y,0)/Math.max(1,a.length);
function pipX(){const m=MG;return (Math.sin(2*Math.PI*(nowT()*m.sp[Math.min(m.i,m.n-1)]+m.ph))+1)/2}
function zoneC(){return MG.type==='balance'?.5+.28*Math.sin(nowT()*1.3):.61}
function zoneW(){return MG.type==='balance'?.24:.22}
function nextMem(){const m=MG;m.i++;m.showing=true;if(m.i>=m.n)return mgFinish(avg(m.sc));setTimeout(memRound,900)}
function memRound(){
  const m=MG;if(!m||m.phase!=='play')return;
  m.seq=Array.from({length:4+m.i},()=>pick(SYMS));m.k=0;m.showing=true;m.shown=-1;renderMG();
  m.seq.forEach((s,j)=>setTimeout(()=>{if(MG!==m)return;m.shown=j;mgUpdate()},350+j*650));
  setTimeout(()=>{if(MG!==m)return;m.showing=false;m.shown=-1;renderMG()},350+m.seq.length*650);
}
function mgLoop(){
  const m=MG;if(!m||m.phase!=='play')return;
  const now=performance.now();
  if(m.type==='react'&&now>m.rs&&now-m.rs>1900-m.i*130){m.sc.push(0);m.last=`Too slow. It needed ${m.seq[m.i][1]}.`;m.i++;m.rs=now+350;if(m.i>=m.n)return mgFinish(avg(m.sc));renderMG()}
  if(m.type==='brace'&&now>m.rs&&(now-m.rs)>1500-m.i*150){m.sc.push(0);m.last='You took the full hit!';m.i++;m.rs=now+450;if(m.i>=m.n)return mgFinish(avg(m.sc))}
  if(m.type==='pace'||m.type==='balance'){
    const dt=(now-m.lt)/1000;m.lt=now;
    m.v=clamp(m.v-(m.type==='pace'?.3:.36)*dt+(Math.random()-.5)*.02,0,1);
    if(Math.abs(m.v-zoneC())<zoneW()/2)m.inz+=dt;
    if(nowT()>=m.dur)return mgFinish(m.inz/(m.dur*.85));
  }
  if(m.type==='mash'&&nowT()>=m.dur)return mgFinish(m.taps/42);
  mgUpdate();requestAnimationFrame(mgLoop);
}
