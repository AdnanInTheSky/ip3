const { chromium } = require('@playwright/test');
const { default: AxeBuilder } = require('@axe-core/playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const catalogue = require('../src/explore/catalogue');
const OUT = process.env.EXPLORE_QA_OUT || path.join(__dirname, '../docs/interactive-experience/qa');
fs.mkdirSync(OUT, { recursive: true });
const base = process.env.EXPLORE_BASE_URL || 'http://localhost:3123';
const failures = [], report = { base, timestamp: new Date().toISOString(), pages: [], failures };
let activeBrowser;
const check = (condition,message) => { if(!condition) failures.push(message); };
function expected(m, input, cashCase) {
  const v=input;
  // Independently expressed expected values: no import of the application math module.
  if(m.slug==='economics-trade'){const p=(1+.4*v['et-fx']/100)/(1+v['et-fx']/100),q=Math.exp(-v['et-elasticity']*Math.log((1+v['et-tariff']/100)*p));return {'et-volume':(q*100).toFixed(1),'et-usd':(p*q*100).toFixed(1),'et-local':(p*q*(1+v['et-fx']/100)*100).toFixed(1)};}
  if(m.slug==='finance-investment'){const s=v['fi-stress']/100,r=v['fi-rate']/100,a=cashCase.benefit*(1-s)-cashCase.opex*(1+s/2),npv=a*(1-(1+r)**-cashCase.years)/r-cashCase.capex;return {'fi-npv':(npv<0?'−':'')+'$'+Math.abs(npv).toFixed(1)+'m'};}
  if(m.slug==='market-enterprise'){const contribution=v['me-price']-v['me-cost']*100/(100+v['me-productivity']),demand=1200*Math.exp(-v['me-elasticity']*Math.log(v['me-price']/120)),profit=demand*contribution-29000;return {'me-contrib':'$'+contribution.toFixed(2),'me-profit':(profit<0?'−':'')+'$'+Math.abs(profit).toLocaleString('en-US',{maximumFractionDigits:0})};}
  if(m.slug==='development-impact')return {'di-did':((v['di-tpost']+v['di-cpre']-v['di-tpre']-v['di-cpost'])>0?'+':'')+(v['di-tpost']+v['di-cpre']-v['di-tpre']-v['di-cpost'])+'pp'};
  if(m.slug==='policy-governance'){const after=1.5*(1-.065*v['pg-steps'])*(1-.0036*v['pg-digital'])+.022*v['pg-rework'];return {'pg-after':after.toFixed(2)+' h'};}
  if(m.slug==='management-delivery'){const r=v['md-team']*.75*(v['md-available']/100)*(1-v['md-depend']/100)/(1+v['md-rework']/100);return {'md-weeks':Math.ceil(120/r)+' wk'};}
}
(async()=>{
  const browser=activeBrowser=await chromium.launch({headless:true});
  for(const m of catalogue){
    const row={slug:m.slug,viewports:[],errors:[],scenarioCount:0,formulaVectors:0};report.pages.push(row);
    const browserContext=await browser.newContext({viewport:{width:1440,height:1000}});
    const page=await browserContext.newPage();
    page.on('pageerror',e=>{row.errors.push(e.message);failures.push(m.slug+': '+e.message)});
    page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(base))failures.push(m.slug+' HTTP '+r.status()+': '+r.url())});
    await page.goto(base+'/explore/'+m.slug,{waitUntil:'networkidle'});
    check(await page.locator('main').count()===1,m.slug+': duplicate main');
    check(await page.locator('header.head').count()===1,m.slug+': shared header missing/duplicated');
    check(await page.locator('footer').count()===1,m.slug+': duplicate footer');
    check(await page.locator('iframe').count()===0,m.slug+': iframe found');
    check(await page.locator('h1').count()===1,m.slug+': duplicate h1');
    const data=JSON.parse(fs.readFileSync(path.join(__dirname,`../src/explore/models/${m.slug}.json`)));
    for(const key of data.order)for(const context of ['public','private']){
      await page.locator(`.ip3-model [data-case="${key}"]`).click();
      await page.locator(`.ip3-model [data-sector="${context}"]`).click();
      const title=data.cases[key][context].title;
      check((await page.locator('.ip3-model').innerText()).includes(title),m.slug+': scenario missing '+key+'/'+context);
      row.scenarioCount++;
    }
    // Compare default and every individual slider's endpoints against an independent calculation.
    await page.locator(`.ip3-model [data-case="${data.order[0]}"]`).click();
    await page.locator('.ip3-model [data-sector="public"]').click();
    const inputs=await page.locator('.ip3-model input[type=range]').evaluateAll(nodes=>nodes.map(n=>({id:n.id,min:+n.min,max:+n.max,value:+n.value})));
    const vectors=[Object.fromEntries(inputs.map(n=>[n.id,n.value]))];
    for(const input of inputs)for(const value of [input.min,input.max])vectors.push({...vectors[0],[input.id]:value});
    for(const vector of vectors){
      await page.evaluate(values=>{for(const [id,value]of Object.entries(values)){const n=document.getElementById(id);n.value=value;n.dispatchEvent(new Event('input',{bubbles:true}))}},vector);
      for(const [id,value] of Object.entries(expected(m,vector,data.cases[data.order[0]].public))){const actual=(await page.locator('#'+id).innerText()).replace(/\s+/g,' ').trim();check(actual.replace(/\s/g,'')===value.replace(/\s/g,''),`${m.slug}: ${id} expected ${value}, got ${actual}`)}
      row.formulaVectors++;
      check(!(await page.locator('.ip3-model svg').evaluateAll(nodes=>nodes.some(n=>/NaN|Infinity/.test(n.outerHTML)))),m.slug+': nonfinite SVG');
    }
    // Check each width in every scenario: long text often exposes mobile overflow.
    for(const width of [1440,820,390,320]){
      await page.setViewportSize({width,height:1000});
      const dimensions=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,root:document.querySelector('.ip3-model').getBoundingClientRect().width}));
      row.viewports.push({width,...dimensions});check(dimensions.scroll<=width+1,m.slug+': horizontal overflow at '+width+' ('+dimensions.scroll+')');
      for(const key of data.order)for(const context of ['public','private']){
        await page.locator(`.ip3-model [data-case="${key}"]`).click();await page.locator(`.ip3-model [data-sector="${context}"]`).click();
        check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),m.slug+': scenario overflow '+width+' '+key+'/'+context);
      }
      if(width===1440||width===390){
        await page.locator(`.ip3-model [data-case="${data.order[0]}"]`).click();await page.locator('.ip3-model [data-sector="public"]').click();
        await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(350);await page.screenshot({path:path.join(OUT,`${m.slug}-${width}-hero.png`)});
        await page.locator('.ip3-model [role=tabpanel]').first().scrollIntoViewIfNeeded();await page.screenshot({path:path.join(OUT,`${m.slug}-${width}-lab.png`)});
      }
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.waitForTimeout(800); // assess the settled view after the original reveal transition
    const axe=await new AxeBuilder({page}).include('#main').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
    row.accessibility=axe.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}));
    fs.writeFileSync(path.join(OUT,`${m.slug}-axe.json`),JSON.stringify(row.accessibility,null,2));
    row.fonts=await page.evaluate(()=>({hero:getComputedStyle(document.querySelector('.ip3-model h1')).fontFamily,body:getComputedStyle(document.querySelector('.ip3-model')).fontFamily,control:getComputedStyle(document.querySelector('.ip3-model button')).fontFamily}));
    check(row.fonts.hero.includes('Fraunces')&&row.fonts.body.includes('Lato')&&row.fonts.control.includes('Montserrat'),m.slug+': website fonts not used');
    // Keyboard tab selection and range interaction.
    const first=page.locator('.ip3-model [role=tab]').first();await first.focus();await page.keyboard.press('End');
    check(await page.locator('.ip3-model [role=tab]').last().getAttribute('aria-selected')==='true',m.slug+': End key navigation');
    await page.locator('.ip3-model input[type=range]').first().focus();await page.keyboard.press('Home');
    check(await page.locator('.ip3-model input[type=range]').first().evaluate(n=>n.value===n.min),m.slug+': range keyboard');
    await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>scrollTo(0,0));
    await page.waitForFunction(()=>document.querySelector('.ip3-model').classList.contains('is-quiet'));
    row.reducedMotion=await page.locator('.ip3-model').evaluate(n=>n.classList.contains('is-quiet'));
    check(row.reducedMotion,m.slug+': reduced motion not applied');
    check(row.accessibility.length===0,m.slug+': automated WCAG findings remain');
    await browserContext.close();console.log(m.slug,JSON.stringify({scenarios:row.scenarioCount,vectors:row.formulaVectors,axe:row.accessibility.length,errors:row.errors.length}));
    fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(report,null,2));
  }
  const page=await browser.newPage();
  await page.goto(base+'/explore');check(await page.locator('[data-hub-case]').count()===12,'hub: 12 scenarios missing');
  await page.goto(base+'/');check(await page.locator('[data-xp-select]').count()===6,'home: six static choices missing');
  check(await page.evaluate(()=>document.querySelector('#why-ip3').compareDocumentPosition(document.querySelector('#thinking-in-action'))&Node.DOCUMENT_POSITION_FOLLOWING),'home: incorrect section position');
  for(const slug of catalogue.map(m=>m.slug)){await page.locator(`[data-xp-select="${slug}"]`).click();check((await page.locator('[data-xp-link]').getAttribute('href')).includes(slug),'home: selector '+slug);}
  await page.goto(base+'/contact?discipline=finance-investment&fi-rate=14#contact-form');check((await page.locator('[name=message]').inputValue()).includes('Finance & Investment'),'contact: context prefill missing');check(!(await page.locator('[name=message]').inputValue()).includes('14'),'contact: simulator values leaked');
  const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();for(const m of catalogue){await staticPage.goto(base+'/explore/'+m.slug);check((await staticPage.title()).includes(m.title)&&(await staticPage.locator('.xp-transcripts summary').innerText()).includes('Read all '),'noJS: content missing '+m.slug);await staticPage.locator('.xp-transcripts summary').click();check(await staticPage.locator('.xp-transcripts article').count()>=8,'noJS: transcripts missing '+m.slug);}await nojs.close();
  await browser.close();fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(report,null,2));
  console.log('BROWSER FAILURES',JSON.stringify(failures));if(failures.length)process.exitCode=1;
})().catch(async e=>{await activeBrowser?.close();failures.push(e.stack);fs.writeFileSync(path.join(OUT,'browser-results.json'),JSON.stringify(report,null,2));console.error(e);process.exitCode=1});
