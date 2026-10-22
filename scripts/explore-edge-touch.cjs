const {chromium}=require('@playwright/test');
const {default:AxeBuilder}=require('@axe-core/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
let browser;
(async()=>{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const page=await context.newPage(),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const m of require('../src/explore/catalogue')){
  await page.goto('http://localhost:3123/explore/'+m.slug,{waitUntil:'networkidle'});
  await page.locator('.ip3-model [role=tab]').last().tap();await page.locator('.ip3-model [data-sector="private"]').tap();
  assert.equal(await page.locator('.ip3-model [role=tab]').last().getAttribute('aria-selected'),'true');
  assert.equal(await page.locator('.ip3-model [data-sector="private"]').getAttribute('aria-pressed'),'true');
  await page.waitForTimeout(800);const axe=await new AxeBuilder({page}).include('#main').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  assert.deepEqual(axe.violations.map(v=>v.id),[]);
  for(const width of [390,320]){await page.setViewportSize({width,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
  results.push({slug:m.slug,browser:'Microsoft Edge',touch:true,widths:[390,320],wcagViolations:axe.violations.length});
 }
 assert.deepEqual(errors,[]);await browser.close();fs.writeFileSync(path.join(__dirname,'../docs/interactive-experience/qa/edge-touch-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results));
})().catch(async e=>{await browser?.close();console.error(e);process.exitCode=1});
