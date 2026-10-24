// Browser regression check for the six client-facing interactive model pages.
const {chromium}=require('@playwright/test');
const {default:AxeBuilder}=require('@axe-core/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const catalogue=require('../src/explore/catalogue');
const out=process.env.EXPLORE_QA_OUT||path.join(__dirname,'../docs/interactive-experience/qa/client-appendix-removal');
const base=process.env.EXPLORE_BASE_URL||'http://localhost:3123';
fs.mkdirSync(out,{recursive:true});
const report={base,started:new Date().toISOString(),pages:[],errors:[]};
const charts={
  'economics-trade':'#et-mark','finance-investment':'#fi-bars','market-enterprise':'#me-line',
  'development-impact':'#di-treatpath','policy-governance':'#pg-bar-after-core','management-delivery':'#md-scenario-path'
};
(async()=>{
  const browser=await chromium.launch();
  try{
    for(const model of catalogue){
      const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
      const result={slug:model.slug,removedSections:false,sliderRecalculates:false,resetWorks:false,responsive:[],accessibility:[]};report.pages.push(result);
      page.on('pageerror',error=>report.errors.push(model.slug+': '+error.message));
      await page.goto(base+'/explore/'+model.slug,{waitUntil:'networkidle'});
      assert.equal(await page.locator('.xp-method,.xp-data-panel,[data-model-export]').count(),0);
      assert.doesNotMatch(await page.locator('body').innerText(),/Interpretation & methodology|Understand the assumptions|Read and reproduce this illustration|Read all \d+ scenario narratives|Download assumptions & results|Download chart data/);
      result.removedSections=true;
      const protocol=JSON.parse(await page.locator('[data-model-protocol]').textContent());
      assert.ok(protocol.inputs.every(input=>[input.min,input.max,input.step,input.default].every(Number.isFinite)));
      assert.equal(await page.locator('header.head').count(),1);assert.equal(await page.locator('footer.foot').count(),1);
      assert.ok(await page.locator('.ip3-model [data-case]').count()>0);assert.ok(await page.locator('.ip3-model input[type=range]').count()>0);
      const chart=page.locator(charts[model.slug]),before=await chart.evaluate(node=>node.outerHTML),input=page.locator('.ip3-model input[type=range]').first();
      await input.evaluate(node=>{node.value=String(+node.value===+node.max?+node.min:+node.max);node.dispatchEvent(new Event('input',{bubbles:true}))});await page.waitForTimeout(220);
      assert.notEqual(await chart.evaluate(node=>node.outerHTML),before);result.sliderRecalculates=true;
      await page.locator('[data-model-reset]').click();
      for(const item of protocol.inputs){const expected=model.slug==='finance-investment'&&item.id==='fi-rate'?protocol.cases[await page.locator('.ip3-model [data-case][aria-selected=true]').getAttribute('data-case')][await page.locator('.ip3-model [data-sector][aria-pressed=true]').getAttribute('data-sector')].rate:item.default;assert.equal(await page.locator('#'+item.id).inputValue(),String(expected));}
      result.resetWorks=true;
      for(const width of [1440,390,320]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),model.slug+' horizontal overflow at '+width);result.responsive.push(width);}
      await page.setViewportSize({width:1440,height:1000});
      const axe=await new AxeBuilder({page}).include('#main').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();result.accessibility=axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));assert.deepEqual(result.accessibility,[]);
      await page.screenshot({path:path.join(out,model.slug+'-desktop-after.png'),fullPage:true});
      await page.setViewportSize({width:390,height:1000});await page.screenshot({path:path.join(out,model.slug+'-mobile-after.png'),fullPage:true});
      await context.close();
    }
    assert.deepEqual(report.errors,[]);report.passed=true;
  }catch(error){report.passed=false;report.errors.push(error.stack);console.error(error);process.exitCode=1}
  finally{await browser.close();fs.writeFileSync(path.join(out,'review-browser-results.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({passed:report.passed,pages:report.pages.length,errors:report.errors.length}))}
})().catch(error=>{report.passed=false;report.errors.push(error.stack);console.error(error);process.exitCode=1});
