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
    if (!nodes.has(id)) nodes.set(id, {hidden:true, innerHTML:'', textContent:'', value:'', scrollTop:0});
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
  return {run,node,storage,click:(a,v)=>listeners.click.forEach(fn=>fn({target:{closest:()=>({dataset:{a,v},disabled:false})}}))};
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
