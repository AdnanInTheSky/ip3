const {chromium}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const base=process.env.EXPLORE_BASE_URL||'http://localhost:3123';
const out=path.join(__dirname,'../docs/interactive-experience/qa');
let activeBrowser;
(async()=>{
 const browser=activeBrowser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:390,height:844}}),page=await context.newPage();const results=[];
 const set=async(values)=>page.evaluate(values=>{for(const [id,value]of Object.entries(values)){const el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}))}},values);
 await page.goto(base+'/explore/development-impact');
 for(const [values,cf] of [[{'di-tpre':100,'di-tpost':100,'di-cpre':0,'di-cpost':100},200],[{'di-tpre':0,'di-tpost':0,'di-cpre':100,'di-cpost':0},-100]]){
  await set(values);await page.waitForTimeout(200);assert.match(await page.locator('[data-model-summary]').innerText(),/outside 0–100/);const point=await page.locator('#di-cfpoint').getAttribute('cy');assert.ok(+point>=33&&+point<=235);results.push({model:'impact',counterfactual:cf,chartPoint:+point,warning:true});
 }
 await page.goto(base+'/explore/management-delivery');await set({'md-team':5,'md-available':50,'md-rework':40,'md-depend':35});
 const duration=parseInt(await page.locator('#md-weeks').innerText()),label=await page.locator('#md-chart').getAttribute('aria-label');assert.equal(duration,138);assert.match(label,/144 weeks/);assert.equal(await page.locator('#md-target-line').getAttribute('x1'),'139');results.push({model:'delivery',duration,horizon:144,targetX:139});
 await page.goto(base+'/explore/market-enterprise');await set({'me-price':85,'me-cost':120,'me-productivity':0,'me-elasticity':2.5});
 assert.match(await page.locator('#me-breakeven').innerText(),/N\/A/);assert.match(await page.locator('#me-chart').getAttribute('aria-label'),/3000 units sold/);assert.equal(await page.locator('[data-volume-tick="2500"]').textContent(),'3,000 units / month');results.push({model:'enterprise',breakEven:'N/A',chartHorizon:3000});
 await page.goto(base+'/explore/policy-governance');await set({'pg-steps':0,'pg-digital':0,'pg-rework':24,'pg-volume':3000});assert.match(await page.locator('#pg-hours').innerText(),/^0/);await set({'pg-rework':40});assert.match(await page.locator('#pg-hours').innerText(),/^−/);results.push({model:'governance',neutralHours:0,adverseHours:await page.locator('#pg-hours').innerText()});
 await page.goto(base+'/explore/economics-trade');
 const tour=page.locator('#et-tour');await tour.click();assert.equal(await tour.getAttribute('aria-pressed'),'true');await page.locator('#et-tariff').focus();await page.keyboard.press('ArrowRight');assert.equal(await tour.getAttribute('aria-pressed'),'false');
 await tour.click();await page.locator('#model-methodology').scrollIntoViewIfNeeded();await page.waitForTimeout(250);assert.equal(await tour.getAttribute('aria-pressed'),'false');
 await page.evaluate(()=>scrollTo(0,0));await page.locator('[data-model-motion]').click();assert.equal(await page.locator('.ip3-model').evaluate(n=>n.classList.contains('is-quiet')),true);assert.equal(await page.locator('.et-network svg').evaluate(s=>s.animationsPaused()),true);results.push({model:'economics',tourIntervention:'stops',offscreenTour:'stops',motionControl:'pauses CSS and SVG'});
 const consoleErrors=[];page.on('pageerror',e=>consoleErrors.push(e.message));
 for(const url of ['/','/explore','/approach','/capabilities','/sectors','/engagements','/insights','/contact']){
  const response=await page.goto(base+url);assert.equal(response.status(),200);assert.equal(await page.locator('main').count(),1);assert.equal(await page.locator('header.head').count(),1);assert.equal(await page.locator('footer.foot').count(),1);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));results.push({route:url,status:200,sharedShell:true});
 }
 await page.goto(base+'/');await page.locator('#thinking-in-action').scrollIntoViewIfNeeded();await page.waitForTimeout(400);await page.screenshot({path:path.join(out,'homepage-preview-390.png')});
 for(const slug of require('../src/explore/catalogue').map(m=>m.slug)){
  await page.locator(`[data-xp-select="${slug}"]`).click();const before=await page.locator('[data-xp-result]').textContent();await page.locator('[data-xp-factor]').focus();await page.keyboard.press('End');const after=await page.locator('[data-xp-result]').textContent();assert.notEqual(before,after);results.push({homePreview:slug,controlChangesResult:true});
 }
 assert.deepEqual(consoleErrors,[]);await browser.close();fs.writeFileSync(path.join(out,'edge-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
})().catch(async e=>{await activeBrowser?.close();console.error(e);process.exitCode=1});
