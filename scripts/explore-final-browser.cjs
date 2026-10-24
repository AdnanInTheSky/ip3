const {chromium}=require('@playwright/test'),{default:AxeBuilder}=require('@axe-core/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const out=path.resolve(process.env.EXPLORE_QA_OUT||'docs/interactive-experience/review-2026-10-22/FINAL_QA_EVIDENCE'),base=process.env.EXPLORE_BASE_URL||'http://localhost:3123';
fs.mkdirSync(out,{recursive:true});
(async()=>{const b=await chromium.launch(),results={browser:b.version(),errors:[],checks:[]};
try{
  const c=await b.newContext({viewport:{width:1440,height:1000}}),p=await c.newPage();p.on('pageerror',e=>results.errors.push(e.message));
  await p.addInitScript(()=>{window.__ip3MediaTrace={ready:null,sources:[]};new MutationObserver(records=>{for(const r of records){if(r.target.matches?.('[data-hero]')&&r.target.classList.contains('ready')&&window.__ip3MediaTrace.ready===null)window.__ip3MediaTrace.ready=performance.now();if(r.target.localName==='source'&&r.attributeName==='src'&&r.target.closest('[data-hero]'))window.__ip3MediaTrace.sources.push(performance.now());}}).observe(document,{subtree:true,attributes:true,attributeFilter:['class','src']});});
  const mediaRequests=[];p.on('request',r=>{if(/\/assets\/video\//.test(r.url()))mediaRequests.push({time:Date.now(),url:new URL(r.url()).pathname})});
  await p.goto(base+'/',{waitUntil:'domcontentloaded'});await p.mouse.move(1439,999);await p.waitForFunction(()=>document.querySelector('[data-hero]').classList.contains('ready'));
  await p.waitForFunction(()=>{const v=document.querySelector('.hero__slide.is-active video');return !!v.querySelector('source[src]')&&!v.paused&&v.currentTime>.1},{},{timeout:12000});
  const trace=await p.evaluate(()=>window.__ip3MediaTrace);assert.ok(trace.ready!==null&&trace.sources.length);const mediaDelay=trace.sources[0]-trace.ready;assert.ok(mediaDelay>=1700,'Initial video was loaded too early');results.checks.push({heroVideo:'starts after initial copy reveal',firstMediaDelay:mediaDelay});
  const pause=p.locator('[data-hero-pause]');await pause.click();assert.equal(await pause.getAttribute('aria-pressed'),'true');const first=await p.locator('.hero__slide.is-active').getAttribute('data-slide');
  const time=await p.locator('.hero__slide.is-active video').evaluate(v=>v.currentTime);await p.waitForTimeout(8500);
  assert.equal(await p.locator('.hero__slide.is-active').getAttribute('data-slide'),first);assert.ok(await p.locator('.hero__slide.is-active video').evaluate((v,t)=>v.paused&&Math.abs(v.currentTime-t)<.05,time));
  assert.equal(await p.locator('.hero__slide.is-active video').evaluate(v=>getComputedStyle(v).animationPlayState),'paused');results.checks.push({pause:'stops slides, video and CSS motion for more than one slide interval'});
  await pause.click();await p.locator('header.head a').first().focus();await p.locator('header.head a').first().hover();await p.waitForFunction(()=>!document.querySelector('.hero__slide.is-active video').paused);
  await p.waitForFunction(previous=>document.querySelector('.hero__slide.is-active').dataset.slide!==previous,first,{timeout:11000});results.checks.push({resume:'automatic advance verified'});
  const total=await p.locator('[data-tab]').count();for(let i=0;i<total;i++){await p.locator(`[data-tab="${i}"]`).click();assert.equal(await p.locator('.hero__slide.is-active').getAttribute('data-slide'),String(i));assert.ok(await p.locator('.hero__slide.is-active video').getAttribute('poster'));}
  results.checks.push({originalSlides:total,manualSelection:'all configured visible slides retained'});
  await p.emulateMedia({reducedMotion:'reduce'});await p.waitForFunction(()=>document.querySelector('[data-hero-pause]').disabled);assert.equal(await pause.isDisabled(),true);assert.ok(await p.locator('.hero__slide video').evaluateAll(ns=>ns.every(v=>v.paused)));results.checks.push({dynamicReducedMotion:'pauses all hero videos and disables autoplay control'});
  await c.close();
  const r=await b.newContext({viewport:{width:390,height:1000},reducedMotion:'reduce'}),q=await r.newPage();await q.goto(base+'/');
  assert.equal(await q.locator('.hero__slide source[src]').count(),0);await q.locator('[data-tab]').last().click();assert.equal(await q.locator('.hero__slide source[src]').count(),0);assert.match(await q.locator('.hero__slide.is-active video').getAttribute('poster'),/education-innovation-poster-lossless/);
  results.checks.push({initialReducedMotion:'poster-only, including sixth slide; no MP4 source attached'});await r.close();
  for(const m of require('../src/explore/catalogue')){
    const ctx=await b.newContext({viewport:{width:390,height:1000},reducedMotion:'reduce'}),page=await ctx.newPage();const events=[];page.on('request',req=>{if(req.method()!=='GET')events.push({method:req.method(),url:req.url()})});
    await page.goto(base+'/explore/'+m.slug,{waitUntil:'networkidle'});const firstInput=page.locator('.ip3-model input[type=range]').first();await firstInput.focus();const initial=await firstInput.inputValue();await page.keyboard.press('End');assert.notEqual(await firstInput.inputValue(),initial);await page.locator('[data-model-reset]').click();
    const protocol=JSON.parse(await page.locator('[data-model-protocol]').textContent()),selected=await page.locator('.ip3-model [data-case][aria-selected=true]').getAttribute('data-case'),audience=(await page.locator('.ip3-model [data-sector][aria-pressed=true]').getAttribute('data-sector'));const scenario=protocol.cases[selected][audience];for(const input of protocol.inputs){const expected=m.slug==='finance-investment'&&input.id==='fi-rate'?scenario.rate:input.default;assert.equal(await page.locator('#'+input.id).inputValue(),String(expected));}assert.ok(protocol.inputs.every(x=>[x.min,x.max,x.step,x.default].every(Number.isFinite)));
    await page.getByRole('heading',{name:'Understand the assumptions.'}).count().then(n=>assert.equal(n,0));assert.equal(await page.locator('.xp-method,.xp-data-panel,[data-model-export]').count(),0);
    assert.deepEqual(await page.evaluate(()=>({local:Object.keys(localStorage),session:Object.keys(sessionStorage)})),{local:[],session:[]});assert.deepEqual(events,[]);
    results.checks.push({model:m.slug,privacy:'No POST or local/session storage on control/reset; local downloads covered separately',bounds:'finite'});
    if(m.slug==='market-enterprise')assert.doesNotMatch(await page.locator('.ip3-model').innerText(),/400-firm survey|Sweden–CPD|FIRMS SURVEYED/);
    if(m.slug==='management-delivery')assert.doesNotMatch(await page.locator('.ip3-model').innerText(),/documented professional engagement/);
    for(const width of [1440,390]){await page.setViewportSize({width,height:1000});if(m.slug==='market-enterprise')await page.locator('.me-proof').screenshot({path:path.join(out,`enterprise-claims-${width}-after.png`)});if(m.slug==='management-delivery')await page.locator('.di-boundary').first().screenshot({path:path.join(out,`delivery-claim-${width}-after.png`)});if(m.slug==='development-impact')await page.locator('.di-footnote').screenshot({path:path.join(out,`impact-line-note-${width}-after.png`)});}
    await ctx.close();
  }
  const n=await b.newContext({javaScriptEnabled:false,viewport:{width:390,height:1000}}),np=await n.newPage();await np.goto(base+'/explore/economics-trade');assert.equal(await np.locator('.xp-method,.xp-data-panel,[data-model-export]').count(),0);assert.ok(await np.locator('.ip3-model [data-case]').count()>0);await np.screenshot({path:path.join(out,'explore-economics-mobile-nojs-after.png'),fullPage:true});await n.close();
  for(const width of [1440,390]){const hc=await b.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),hp=await hc.newPage();await hp.goto(base+'/');await hp.screenshot({path:path.join(out,`home-${width}-after.png`)});await hc.close()}
  assert.deepEqual(results.errors,[]);results.passed=true;
}catch(e){results.passed=false;results.errors.push(e.stack);console.error(e);process.exitCode=1}finally{await b.close();fs.writeFileSync(path.join(out,'final-browser-specific.json'),JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({passed:results.passed,checks:results.checks.length,errors:results.errors}))}
})();
