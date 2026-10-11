// Optional browser check: install Playwright outside the game, then run this file.
// CHROME_PATH may point to an installed Chrome; otherwise use Playwright Chromium.
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||undefined});
  try{
    const page=await browser.newPage({viewport:{width:400,height:844}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).href);
    await page.evaluate(()=>document.fonts.ready);

    // Use real input/click events for the name that used to remove the death buttons.
    await page.locator('#fname').fill('<!--');
    await page.locator('[data-a="modal"][data-v="back"]').click();
    await page.locator('[data-a="begin"]').first().click();
    await page.evaluate(()=>{die();render();});
    await page.locator('[data-a="newlife"]').click();
    assert.equal(await page.evaluate(()=>S.phase),'create');

    await page.evaluate(()=>{
      beginLife(BACKS[0].id);S.P.age=30;S.P.energy=12;tab='train';
      S.P.ev=0;render();
    });
    for(let i=0;i<12;i++){
      await page.keyboard.press('Tab');
      assert.equal(await page.evaluate(()=>!document.querySelector('#app').contains(document.activeElement)),true);
    }
    await page.locator('[data-a="evc"]').first().click();
    assert.equal(await page.evaluate(()=>$('app').inert),false);

    await page.evaluate(()=>{
      const old=JSON.parse(JSON.stringify(S));delete old.P.rt;delete old.rtMode;
      modal='settings';render();$('sv').value=btoa(unescape(encodeURIComponent(JSON.stringify(old))));
    });
    await page.locator('[data-a="imp"]').click();
    assert.equal(await page.locator('#rtT').count(),1);
    await page.reload();
    assert.equal(await page.evaluate(()=>S.P.rt.train),'boulder');

    // Exercise each screen and every combat skill set at small phone widths.
    for(const width of [320,360,400]){
      await page.setViewportSize({width,height:844});
      const overflows=await page.evaluate(()=>{
        C=null;MG=null;modal=null;freshSave();S.fate.name='WWWWWWWWWWWWWWWWWW';
        beginLife(BACKS[0].id);S.P.age=30;S.P.rank=6;S.P.mlv=10;S.P.gold=1e8;
        const bad=[];
        const check=(el,label)=>{if(el.scrollWidth>el.clientWidth+1)bad.push(label);};
        for(const [t] of TABS){tab=t;render();check($('view'),t);check(document.documentElement,'page '+t);}
        for(const mag of MAGICS){
          S.P.mag=mag.id;S.P.energy=12;startFight('spar');render();
          check($('ov').firstElementChild,mag.id);C=null;
        }
        S.P.dead=true;render();check($('ov').firstElementChild,'death');
        return bad;
      });
      assert.deepEqual(overflows,[],`horizontal overflow at ${width}px`);
    }
    assert.deepEqual(errors,[],'browser runtime errors');
    console.log('Browser checks passed: name/death flow, modal keyboard isolation, legacy import/reload, eight screens and 40 magic sets at 320/360/400px.');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
