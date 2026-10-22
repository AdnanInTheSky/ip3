// Review remediation proof: actual downloads, selected-case reset, graph/table
// coordinates and independent numerical expectations. No application math import.
const browsers=require('@playwright/test'),engine=process.env.EXPLORE_BROWSER||'chromium';
const {default:AxeBuilder}=require('@axe-core/playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const catalogue=require('../src/explore/catalogue');
const out=process.env.EXPLORE_QA_OUT||path.join(__dirname,'../docs/interactive-experience/qa/review-2026-10-22');
const base=process.env.EXPLORE_BASE_URL||'http://localhost:3123';
fs.mkdirSync(out,{recursive:true});
const report={base,engine,timestamp:new Date().toISOString(),pages:[],errors:[]};
const near=(a,b,tolerance=1e-6)=>assert.ok(Math.abs(a-b)<=tolerance,`${a} != ${b}`);
async function input(page,values){await page.evaluate(v=>{for(const [id,value]of Object.entries(v)){const n=document.getElementById(id);n.value=value;n.dispatchEvent(new Event('input',{bubbles:true}))}},values);await page.waitForTimeout(160)}
async function download(page,format,name){const waiting=page.waitForEvent('download');await page.locator(`[data-model-export="${format}"]`).click();const d=await waiting;const target=path.join(out,name+'.'+format);await d.saveAs(target);return fs.readFileSync(target,'utf8')}
function checkIndependent(s){
  const v=Object.fromEntries(s.inputs.map(x=>[x.id,x.value])),rows=s.chart.rows;
  for(const row of rows){
    if(s.model==='economics-trade'){const p=(1+.004*v['et-fx'])/(1+.01*v['et-fx']),q=Math.exp(-v['et-elasticity']*Math.log((1+row[0]/100)*p));near(row[1],100*q);near(row[2],100*(1+row[0]/100)*p);near(row[3],100*p*q);near(row[4],100*p*q*(1+v['et-fx']/100))}
    if(s.model==='finance-investment'){const x=s.financeAssumptions,annual=x.benefit*(1-v['fi-stress']/100)-x.opex*(1+v['fi-stress']/200);near(row[1],row[0]===0?-x.capex:annual);near(row[2],row[1]*Math.exp(-row[0]*Math.log(1+v['fi-rate']/100)))}
    if(s.model==='market-enterprise')near(row[1],row[0]*(v['me-price']-100*v['me-cost']/(100+v['me-productivity']))-29000);
    if(s.model==='development-impact'){const before=row[0]==='Before';near(row[1],v[before?'di-tpre':'di-tpost']);near(row[2],v[before?'di-cpre':'di-cpost']);near(row[3],v['di-tpre']+(before?0:v['di-cpost']-v['di-cpre']))}
    if(s.model==='policy-governance'){const before=row[0]==='Before',core=before?1.5:1.5*(1-.065*v['pg-steps'])*(1-.0036*v['pg-digital']),rework=before?.528:.022*v['pg-rework'];near(row[1],core);near(row[2],rework);near(row[3],core+rework)}
    if(s.model==='management-delivery'){near(row[1],Math.min(120,row[0]*10*.75*.65*.77/1.24));near(row[2],Math.min(120,row[0]*v['md-team']*.75*v['md-available']/100*(1-v['md-depend']/100)/(1+v['md-rework']/100)))}
  }
}
async function checkGraph(page,s){
  const graph=await page.evaluate(slug=>{const id=({'economics-trade':'et-line','finance-investment':'fi-bars','market-enterprise':'me-line','development-impact':'di-treatpath','policy-governance':'pg-chart','management-delivery':'md-scenario-path'})[slug];const el=document.getElementById(id);return {path:el.getAttribute('d'),bars:[...el.querySelectorAll('.xp-cash-bar')].map(n=>({x:+n.getAttribute('x'),y:+n.getAttribute('y'),h:+n.getAttribute('height')})),components:[...el.querySelectorAll('rect[id^="pg-bar-"]')].map(n=>({id:n.id,x:+n.getAttribute('x'),w:+n.getAttribute('width')}))}},s.model);
  const points=graph.path?.match(/-?\d+(?:\.\d+)?/g)?.map(Number),rows=s.chart.rows;
  if(s.model==='economics-trade'){const values=rows.map(r=>r[1]),low=Math.floor((Math.min(75,...values)-9)/10)*10,high=Math.ceil((Math.max(120,...values)+9)/10)*10;assert.equal(points.length,rows.length*2);rows.forEach((r,i)=>{near(points[i*2],38+i/60*476,.011);near(points[i*2+1],206-(r[1]-low)/(high-low)*181,.011)})}
  if(s.model==='finance-investment'){assert.equal(graph.bars.length,rows.length);const lo=Math.min(0,...rows.map(r=>r[2])),hi=Math.max(1,...rows.map(r=>r[2])),Y=v=>190-(v-lo)/(hi-lo)*160;rows.forEach((r,i)=>{near(graph.bars[i].y,Math.min(Y(r[2]),Y(0)));near(graph.bars[i].h,Math.abs(Y(0)-Y(r[2])))})}
  if(s.model==='market-enterprise'){assert.equal(points.length,rows.length*2);const v=Object.fromEntries(s.inputs.map(x=>[x.id,x.value])),u=1200*(v['me-price']/120)**-v['me-elasticity'],c=v['me-price']-v['me-cost']/(1+v['me-productivity']/100),profit=u*c-29000,max=rows.at(-1)[0],lo=Math.min(-50000,profit-18000,-29000,max*c-29000-18000),hi=Math.max(50000,profit+22000,max*c-29000+22000);rows.forEach((r,i)=>{near(points[i*2],49+r[0]/max*473,.011);near(points[i*2+1],215-(r[1]-lo)/(hi-lo)*193,.011)})}
  if(s.model==='development-impact'){const cf=rows[1][3],min=Math.min(0,Math.floor(cf/20)*20),max=Math.max(100,Math.ceil(cf/20)*20);near(points[1],235-(rows[0][1]-min)/(max-min)*202);near(points[3],235-(rows[1][1]-min)/(max-min)*202);const control=await page.locator('#di-controlafter').getAttribute('cy'),counter=await page.locator('#di-cfpoint').getAttribute('cy');near(+control,235-(rows[1][2]-min)/(max-min)*202);near(+counter,235-(cf-min)/(max-min)*202)}
  if(s.model==='policy-governance'){const by=Object.fromEntries(graph.components.map(n=>[n.id,n]));for(const [i,tag]of [[0,'before'],[1,'after']]){near(by['pg-bar-'+tag+'-core'].w,rows[i][1]*380/2.4,.011);near(by['pg-bar-'+tag+'-rework'].w,rows[i][2]*380/2.4,.011)}}
  if(s.model==='management-delivery'){assert.equal(points.length,rows.length*2);rows.forEach((r,i)=>{near(points[i*2],60+r[0]/rows.at(-1)[0]*474,.011);near(points[i*2+1],260-r[2]/120*208,.011)});near(+(await page.locator('#md-target-line').getAttribute('x1')),60+24/rows.at(-1)[0]*474)}
}
(async()=>{
  const browser=await browsers[engine].launch();
  try{
    for(const m of catalogue){
      const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage(),row={slug:m.slug,resetCases:0,independentSeriesVectors:0};report.pages.push(row);
      page.on('pageerror',e=>report.errors.push(m.slug+': '+e.message));
      await page.goto(base+'/explore/'+m.slug,{waitUntil:'networkidle'});
      const protocol=await page.locator('[data-model-protocol]').textContent().then(JSON.parse);
      const uiBounds=await page.locator('.ip3-model input[type=range]').evaluateAll(ns=>ns.map(n=>({id:n.id,min:+n.min,max:+n.max,step:+n.step})));
      for(const x of protocol.inputs){assert.ok([x.min,x.max,x.step,x.default].every(Number.isFinite),x.id+' invalid metadata');assert.ok(x.step>0&&x.default>=x.min&&x.default<=x.max);assert.deepEqual({id:x.id,min:x.min,max:x.max,step:x.step},uiBounds.find(n=>n.id===x.id));}
      assert.equal(await page.locator('[data-model-summary]').count(),1);
      assert.equal(await page.locator('.xp-decision').count(),1);
      for(const key of Object.keys(protocol.cases))for(const context of ['public','private']){
        await page.locator(`[data-case="${key}"]`).click();await page.locator(`[data-sector="${context}"]`).click();
        await input(page,Object.fromEntries(protocol.inputs.map(x=>[x.id,x.max])));
        await page.locator('[data-model-reset]').click();
        const actual=await page.locator('.ip3-model input[type=range]').evaluateAll(ns=>ns.map(n=>+n.value));
        const wanted=protocol.inputs.map(x=>x.id==='fi-rate'?protocol.cases[key][context].rate:x.default);
        assert.deepEqual(actual,wanted);assert.equal(await page.locator(`[data-case="${key}"]`).getAttribute('aria-selected'),'true');assert.equal(await page.locator(`[data-sector="${context}"]`).getAttribute('aria-pressed'),'true');row.resetCases++;
      }
      for(const edge of ['default','min','max']){
        if(edge==='default')await page.locator('[data-model-reset]').click();else await input(page,Object.fromEntries(protocol.inputs.map(x=>[x.id,x[edge]])));
        const raw=await download(page,'json',m.slug+'-'+edge),s=JSON.parse(raw);checkIndependent(s);await checkGraph(page,s);row.independentSeriesVectors++;
        assert.match(s.evidenceStatus,/Synthetic/);assert.ok(s.calculationVersion);assert.ok(s.provenance.referenceSHA256);assert.ok(s.provenance.methodReferences.every(r=>r.author&&r.publicationDate));
        const displayed=await page.locator('[data-model-table] table').last().locator('tbody tr').evaluateAll(ns=>ns.map(n=>[...n.children].map(c=>c.textContent)));
        assert.equal(displayed.length,s.chart.rows.length);s.chart.rows.forEach((r,i)=>r.forEach((value,j)=>typeof value==='number'?near(+displayed[i][j],value,.000001):assert.equal(displayed[i][j],value)));
      }
      await page.locator('[data-model-table] table').first().evaluate(n=>n.dataset.proofStable='yes');
      await page.locator('.ip3-model').evaluate(n=>n.dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',bubbles:true})));await page.waitForTimeout(150);
      assert.equal(await page.locator('[data-model-table] table').first().getAttribute('data-proof-stable'),'yes');
      const csv=await download(page,'csv',m.slug+'-chart');assert.match(csv,/"record_type","name","coordinate","measure","value"/);assert.match(csv,/Synthetic demonstration/);assert.match(csv,/reset_default/);assert.match(csv,/"chart"/);assert.match(csv,/reference_sha256/);assert.match(csv,/author_or_publisher/);
      await page.locator('[data-case]').first().click();await page.locator('[data-sector=public]').click();await page.locator('[data-model-reset]').click();
      for(const width of [1440,390,320]){
        await page.setViewportSize({width,height:1000});await page.locator('[data-model-reset]').scrollIntoViewIfNeeded();
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),m.slug+' overflow '+width);
        await page.locator('.ip3-model input[type=range]').first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${m.slug}-${width}-after.png`)});
        await page.locator('.xp-data-panel').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`${m.slug}-${width}-data.png`)});
      }
      await page.setViewportSize({width:640,height:1000});const style=await page.addStyleTag({content:'html{font-size:200%!important}'});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),m.slug+' enlarged-text overflow');await style.evaluate(n=>n.remove());
      await page.setViewportSize({width:1440,height:1000});await page.locator('.xp-data-panel details').last().locator('summary').click();await page.locator('.xp-data-panel details').first().locator('summary').click();
      const axe=await new AxeBuilder({page}).include('#main').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();row.axe=axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));assert.deepEqual(row.axe,[]);
      const root=page.locator('.ip3-model');assert.equal(await root.locator('iframe').count(),0);assert.equal(await page.locator('header.head').count(),1);assert.equal(await page.locator('footer').count(),1);
      console.log(JSON.stringify(row));await context.close();
    }
    const p=await browser.newPage();await p.goto(base+'/');for(const slug of ['finance-investment','management-delivery']){await p.locator(`[data-xp-select="${slug}"]`).click();const before=await p.locator('[data-xp-visual]').innerHTML();await p.locator('[data-xp-factor]').evaluate(n=>{n.value=n.max;n.dispatchEvent(new Event('input',{bubbles:true}))});assert.equal(await p.locator('[data-xp-visual]').innerHTML(),before)}
    await p.goto(base+'/explore');assert.match(await p.locator('main').innerText(),/six disciplines × two audiences/);assert.match(await p.locator('main').innerText(),/64 detailed/);await p.close();
    assert.deepEqual(report.errors,[]);report.passed=true;
  }catch(e){report.passed=false;report.errors.push(e.stack);process.exitCode=1;console.error(e)}finally{await browser.close();fs.writeFileSync(path.join(out,'review-browser-results.json'),JSON.stringify(report,null,2)+'\n')}
})();
