const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');

// Run the actual concatenated globals, with a small DOM/storage boundary.
function game() {
  const nodes = new Map();
  const listeners = {};
  const storage = new Map();
  const node = id => {
    if (!nodes.has(id)) nodes.set(id, {hidden:true, innerHTML:'', textContent:'', value:'', scrollTop:0, style:{}, contains:b=>b.inOverlay});
    return nodes.get(id);
  };
  const context = vm.createContext({
    console, performance:{now:()=>0}, setTimeout:()=>0, clearTimeout:()=>{},
    setInterval:()=>0, requestAnimationFrame:()=>0,
    btoa:s=>Buffer.from(s,'binary').toString('base64'),
    atob:s=>Buffer.from(s,'base64').toString('binary'),
    localStorage:{getItem:k=>storage.get(k)||null, setItem:(k,v)=>storage.set(k,v), removeItem:k=>storage.delete(k)},
    document:{getElementById:node, querySelectorAll:()=>[], querySelector:()=>null,
      addEventListener:(type,fn)=>{(listeners[type]||=[]).push(fn);}},
  });
  const dir=path.join(__dirname,'../src/js');
  const source=fs.readdirSync(dir).filter(f=>f.endsWith('.js')).sort().map(f=>fs.readFileSync(path.join(dir,f),'utf8')).join('\n');
  vm.runInContext(source,context);
  const run=code=>vm.runInContext(code,context);
  run("S.fate.race='human';beginLife(BACKS[0].id);S.P.age=30;S.P.energy=12;");
  return {run,node,storage,click:(a,v,inOverlay=true)=>listeners.click.forEach(fn=>fn({target:{closest:()=>({dataset:{a,v},disabled:false,inOverlay})}}))};
}

test('imports migrate pre-activity saves before rendering Training',()=>{
  const g=game();
  g.run("tab='train';delete S.P.rt;delete S.rtMode;S.P.ectr=7;S.P.drill='str';modal='settings';");
  g.node('sv').value=g.run('btoa(unescape(encodeURIComponent(JSON.stringify(S))))');
  g.click('imp');
  assert.equal(g.run('S.P.rt.train'),'boulder');
  assert.equal(g.run('S.rtMode'),'ask');
  assert.equal(g.run('S.P.energy'),12);
  assert.equal(g.run("'ectr' in S.P"),false);
  assert.doesNotThrow(()=>g.run('vTrain()'));
});

test('legacy reserve refunds also migrate at fate creation and only once',()=>{
  const g=game();
  g.run("S.P=null;S.phase='create';S.lp.reserve=5;S.merit=100;migrate();");
  assert.equal(g.run('S.lp.reserve'),3);
  assert.equal(g.run('S.merit'),280);
  g.run('migrate()');
  assert.equal(g.run('S.merit'),280);
});

test('character names remain text in creation, death, history and inherited names',()=>{
  const g=game();
  g.run("S.fate.name='\"<!--&';S.P.name=S.fate.name;S.P.dead=true;say(S.P.name);recordLife();");
  assert.match(g.run('vCreate()'),/value="&quot;&lt;!--&amp;"/);
  for(const expr of ['vDeath()','vYou()','vLeg()']) {
    const html=g.run(expr);
    assert.ok(!html.includes('<!--'),expr);
    assert.ok(html.includes('&lt;!--&amp;'),expr);
  }
  g.run("S.P.back='heir';S.P.backN='Heir of <!--';modal='reb';");
  assert.ok(!g.run('vYou()').includes('<!--'));
  assert.ok(!g.run('vModal()').includes('<!--'));
});

test('zero routine weights do not invent training, work or recovery',()=>{
  const g=game();
  g.run("S.P.rt={...defaultRoutine(),tN:0,wN:0,rN:0,social:false};S.P.hp=1;S.P.mp=1;");
  const before=g.run('JSON.stringify([S.P.raw,S.P.gold,S.P.hp,S.P.mp,S.P.jobs])');
  assert.equal(g.run('runRoutine(12)'), '');
  assert.equal(g.run('JSON.stringify([S.P.raw,S.P.gold,S.P.hp,S.P.mp,S.P.jobs])'),before);
});

test('routine keeps up the weakest bonds after all activity points are spent',()=>{
  const g=game();
  g.run("S.P.energy=0;S.P.acts=4;S.P.people=[person({name:'A',kind:'friend',bond:10}),person({name:'B',kind:'friend',bond:90})];");
  assert.match(g.run('runRoutine(0)'),/4 visits/);
  assert.equal(g.run('S.P.people[0].bond'),50);
  assert.equal(g.run('S.P.people[1].bond'),90);
  assert.equal(g.run('S.P.acts'),0);
  assert.equal(g.run('S.P.energy'),0);
});

test('nonzero routine weights allocate exactly the available activity points',()=>{
  const g=game();
  for(const weights of ['[6,4,2]','[0,0,2]','[1,1,1]','[15,1,0]']) {
    for(let ap=0;ap<=21;ap++) assert.equal(g.run(`split(${ap},${weights}).reduce((a,b)=>a+b,0)`),ap);
  }
});

test('pending events block background actions and restore access after a choice',()=>{
  const g=game();
  g.run('S.P.ev=0;render();');
  assert.equal(g.node('app').inert,true);
  g.click('train','boulder',false);
  assert.equal(g.run('MG'),null);
  assert.equal(g.run('S.P.energy'),12);
  assert.equal(g.run('S.P.ev'),0);
  g.click('evc','0');
  assert.equal(g.run('S.P.ev'),null);
  assert.equal(g.node('app').inert,false);
});

test('death screen prevents background training but still permits rebirth',()=>{
  const g=game();
  g.run('die();render();');
  assert.equal(g.node('app').inert,true);
  g.click('train','boulder',false);
  assert.equal(g.run('MG'),null);
  g.click('newlife');
  assert.equal(g.run('S.phase'),'create');
  assert.equal(g.node('app').inert,false);
});

test('invalid imports leave the live game and saved progress untouched',()=>{
  for(const corrupt of ["o={v:3}","o.P.raw.str=null","o.P.energy=-1","o.P.rank=99","o.P.ev=99999","o.P.tier.boulder=99","o.P.race='missing'","o.P.rt.tN=null"]){
    const g=game();
    g.run('save();modal="settings";render();');
    const before=g.run('JSON.stringify(S)'),saved=g.storage.get('vigil_save_v3');
    g.node('sv').value=g.run(`(()=>{let o=JSON.parse(JSON.stringify(S));${corrupt};return btoa(unescape(encodeURIComponent(JSON.stringify(o))))})()`);
    assert.doesNotThrow(()=>g.click('imp'),corrupt);
    assert.equal(g.run('JSON.stringify(S)'),before,corrupt);
    assert.equal(g.storage.get('vigil_save_v3'),saved,corrupt);
    assert.match(g.node('svMsg').textContent,/did not work/);
  }
});

test('restore rejects non-finite stats and accepts pre-life-sim saves',()=>{
  const g=game();
  assert.equal(g.run('(()=>{const o=JSON.parse(JSON.stringify(S));o.P.raw.str=Infinity;return restoreSave(o)})()'),false);
  assert.equal(g.run("(()=>{const o=JSON.parse(JSON.stringify(S));for(const k of ['age','people','life','acts','rt'])delete o.P[k];return restoreSave(o)})()"),true);
  assert.equal(g.run('S.P.age'),18);
  assert.ok(g.run('S.P.people.length')>=2);
  assert.doesNotThrow(()=>g.run('render()'));
});

test('activity costs cannot overdraw and blocked actions do not start',()=>{
  const g=game();
  g.run('S.P.energy=1;');
  assert.equal(g.run('useEnergy(2)'),false);
  assert.equal(g.run('S.P.energy'),1);
  assert.equal(g.run('useEnergy(1)'),true);
  g.run("startTrain('boulder');startFight('spar');rest();workJob('stable');");
  assert.equal(g.run('S.P.energy'),0);
  assert.equal(g.run('MG'),null);
  assert.equal(g.run('C'),null);
});

test('all yearly choices resolve with finite stats across every race',()=>{
  const g=game();
  assert.equal(g.run(`(()=>{
    Math.random=()=>.5;
    for(const r of RACES){
      S.P.race=r.id;
      for(let i=0;i<EVENTS.length;i++)for(let j=0;j<EVENTS[i].c.length;j++){
        S.P.age=EVENTS[i].a[0];S.P.ev=i;resolveEvent(j);
        if(S.P.ev!==null||!STK.every(k=>Number.isFinite(S.P.raw[k]))||!Number.isFinite(S.P.gold))return false;
      }
    }
    return true;
  })()`),true);
});

test('training and all magic skills finish without non-finite combat values',()=>{
  const g=game();
  assert.equal(g.run(`(()=>{
    for(const t of TRAIN){S.P.energy=1;startTrain(t.id);mgFinish(.85);if(MG.phase!=='done')return false;MG=null;}
    for(const m of MAGICS)for(let i=0;i<m.sk.length;i++){
      S.P.mag=m.id;S.P.mlv=10;S.P.energy=1;startFight('spar');act('skill',i);
      if(![C.p.hp,C.p.mp,C.p.st,C.foe.hp].every(Number.isFinite)||C.p.mp<0||S.P.energy!==0)return false;
      C=null;
    }
    return STK.every(k=>Number.isFinite(S.P.raw[k]));
  })()`),true);
});

test('five and ten year skips preserve finite state and refill the annual budget',()=>{
  const g=game();
  g.run('Math.random=()=>.99;S.P.life=1000;S.P.people=[];');
  for(const n of [5,10]){
    const age=g.run('S.P.age');
    g.run(`ageUp(${n},true)`);
    assert.equal(g.run('S.P.age'),age+n);
    assert.equal(g.run('S.P.energy'),12);
    assert.equal(g.run('S.P.ev'),null);
    assert.equal(g.run('STK.every(k=>Number.isFinite(S.P.raw[k]))'),true);
  }
});

test('saved pending events and deaths remain resolvable after reload and inheritance',()=>{
  const g=game();
  g.run('S.P.ev=0;save();');
  assert.equal(g.run('load()'),true);
  g.click('evc','0');
  assert.equal(g.run('S.P.ev'),null);
  g.run("haveChild({name:'Parent',race:S.P.race,bl:S.P.bl,mag:S.P.mag});die();");
  assert.equal(g.run('load()'),true);
  const id=g.run('heirs()[0].id');
  g.click('heir',id);
  assert.equal(g.run('S.P.dead'),false);
  assert.equal(g.run('S.P.back'),'heir');
  assert.equal(g.run('load()'),true);
  assert.doesNotThrow(()=>g.run('render()'));
});
